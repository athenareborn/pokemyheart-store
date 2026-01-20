import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_placeholder')) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
  })
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || secret.startsWith('whsec_placeholder')) {
    throw new Error('Stripe webhook secret not configured')
  }
  return secret
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    const webhookSecret = getWebhookSecret()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await handleCheckoutComplete(session)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = await createClient()

  // Extract order data from session metadata
  const metadata = session.metadata
  if (!metadata) {
    console.error('No metadata in session')
    return
  }

  const items = JSON.parse(metadata.items || '[]')
  const customerEmail = session.customer_details?.email || metadata.customerEmail
  const customerName = session.customer_details?.name || null

  // Get shipping info from collected_information (newer API) or fall back to metadata
  const shippingInfo = session.collected_information?.shipping_details
  const shippingAddress = shippingInfo?.address ? {
    name: shippingInfo.name || '',
    line1: shippingInfo.address.line1 || '',
    line2: shippingInfo.address.line2 || undefined,
    city: shippingInfo.address.city || '',
    state: shippingInfo.address.state || '',
    postal_code: shippingInfo.address.postal_code || '',
    country: shippingInfo.address.country || '',
  } : null

  // Generate order number
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const orderNumber = `PMH-${String((count || 0) + 1).padStart(3, '0')}`

  // Create order
  const { error: orderError } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_email: customerEmail,
    customer_name: customerName,
    items: items,
    subtotal: parseInt(metadata.subtotal || '0'),
    shipping: parseInt(metadata.shipping || '0'),
    total: session.amount_total || 0,
    status: 'unfulfilled',
    shipping_address: shippingAddress,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string,
  })

  if (orderError) {
    console.error('Error creating order:', orderError)
    return
  }

  // Create or update customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select()
    .eq('email', customerEmail)
    .single()

  if (existingCustomer) {
    await supabase
      .from('customers')
      .update({
        name: customerName || existingCustomer.name,
        orders_count: existingCustomer.orders_count + 1,
        total_spent: existingCustomer.total_spent + (session.amount_total || 0),
      })
      .eq('email', customerEmail)
  } else {
    await supabase.from('customers').insert({
      email: customerEmail,
      name: customerName,
      orders_count: 1,
      total_spent: session.amount_total || 0,
      accepts_marketing: metadata.acceptsMarketing === 'true',
    })
  }

  console.log(`Order ${orderNumber} created successfully`)
}
