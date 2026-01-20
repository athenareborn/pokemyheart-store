import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { fbCAPI, generateEventId } from '@/lib/analytics/facebook-capi'
import { ga4Server } from '@/lib/analytics/ga4-server'

// Lazy initialization to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_placeholder')) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key)
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
    // Pass request for IP/UserAgent extraction
    await handleCheckoutComplete(session, request)
  }

  // Handle Payment Intent success (for custom checkout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await handlePaymentIntentSuccess(paymentIntent, request)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session, request: Request) {
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

  // Send server-side Purchase event to Facebook CAPI
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokemyheart.com'

  // Use same eventId from client for deduplication, or generate new one
  const eventId = metadata.fb_event_id || generateEventId('purchase')

  const contentIds = items.map((item: { bundleId: string; designId: string }) =>
    `${item.designId}-${item.bundleId}`
  )

  // Get IP and UserAgent from request headers
  const headersList = await headers()
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') ||
                   undefined
  const userAgent = headersList.get('user-agent') || undefined

  // Get phone if collected (from Stripe customer details)
  const customerPhone = session.customer_details?.phone || undefined

  await fbCAPI.purchase({
    eventId,
    orderUrl: `${siteUrl}/checkout/success?session_id=${session.id}`,
    email: customerEmail || '',
    firstName: customerName?.split(' ')[0],
    lastName: customerName?.split(' ').slice(1).join(' '),
    phone: customerPhone,
    value: (session.amount_total || 0) / 100,
    currency: 'USD',
    contentIds,
    numItems: items.length,
    orderId: orderNumber,
    ip: clientIp,
    userAgent: userAgent,
    fbc: metadata.fb_fbc || undefined,  // Facebook Click ID
    fbp: metadata.fb_fbp || undefined,  // Facebook Browser ID
  })

  console.log(`Facebook CAPI Purchase event sent for order ${orderNumber}`)

  // Send server-side Purchase event to GA4 Measurement Protocol
  const gaClientId = metadata.ga_client_id || `server.${Date.now()}`

  await ga4Server.purchase({
    clientId: gaClientId,
    transactionId: orderNumber,
    value: (session.amount_total || 0) / 100,
    currency: 'USD',
    items: items.map((item: { designId: string; bundleId: string; bundle_name?: string; price: number; quantity?: number }) => ({
      itemId: `${item.designId}-${item.bundleId}`,
      itemName: item.bundle_name || 'Product',
      price: item.price / 100,
      quantity: item.quantity || 1,
    })),
    userData: {
      email: customerEmail || undefined,
      phone: customerPhone,
      firstName: customerName?.split(' ')[0],
      lastName: customerName?.split(' ').slice(1).join(' '),
      street: shippingAddress?.line1,
      city: shippingAddress?.city,
      region: shippingAddress?.state,
      postalCode: shippingAddress?.postal_code,
      country: shippingAddress?.country,
    },
  })

  console.log(`GA4 Measurement Protocol Purchase event sent for order ${orderNumber}`)
}

async function handlePaymentIntentSuccess(paymentIntent: Stripe.PaymentIntent, request: Request) {
  const supabase = await createClient()

  // Extract order data from payment intent metadata
  const metadata = paymentIntent.metadata
  if (!metadata || metadata.source !== 'pokemyheart-store') {
    // Not from our custom checkout, skip
    return
  }

  const items = JSON.parse(metadata.items || '[]')
  const customerEmail = metadata.customer_email
  const customerName = metadata.customer_name || null
  const shippingAddress = JSON.parse(metadata.shipping_address || 'null')

  if (!customerEmail) {
    console.error('No customer email in payment intent metadata')
    return
  }

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
    total: paymentIntent.amount,
    status: 'unfulfilled',
    shipping_address: shippingAddress,
    stripe_session_id: null,
    stripe_payment_intent: paymentIntent.id,
  })

  if (orderError) {
    console.error('Error creating order from payment intent:', orderError)
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
        total_spent: existingCustomer.total_spent + paymentIntent.amount,
      })
      .eq('email', customerEmail)
  } else {
    await supabase.from('customers').insert({
      email: customerEmail,
      name: customerName,
      orders_count: 1,
      total_spent: paymentIntent.amount,
      accepts_marketing: false,
    })
  }

  console.log(`Order ${orderNumber} created from Payment Intent`)

  // Send server-side Purchase event to Facebook CAPI
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokemyheart.com'
  const eventId = metadata.fb_event_id || generateEventId('purchase')

  const contentIds = items.map((item: { bundle_id: string; design_id: string }) =>
    `${item.design_id}-${item.bundle_id}`
  )

  const headersList = await headers()
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') ||
                   undefined
  const userAgent = headersList.get('user-agent') || undefined

  await fbCAPI.purchase({
    eventId,
    orderUrl: `${siteUrl}/checkout/success?payment_intent=${paymentIntent.id}`,
    email: customerEmail,
    firstName: customerName?.split(' ')[0],
    lastName: customerName?.split(' ').slice(1).join(' '),
    value: paymentIntent.amount / 100,
    currency: 'USD',
    contentIds,
    numItems: items.length,
    orderId: orderNumber,
    ip: clientIp,
    userAgent: userAgent,
    fbc: metadata.fb_fbc || undefined,
    fbp: metadata.fb_fbp || undefined,
  })

  console.log(`Facebook CAPI Purchase event sent for order ${orderNumber}`)

  // Send server-side Purchase event to GA4 Measurement Protocol
  const gaClientId = metadata.ga_client_id || `server.${Date.now()}`

  await ga4Server.purchase({
    clientId: gaClientId,
    transactionId: orderNumber,
    value: paymentIntent.amount / 100,
    currency: 'USD',
    items: items.map((item: { design_id: string; bundle_id: string; bundle_name?: string; price: number; quantity?: number }) => ({
      itemId: `${item.design_id}-${item.bundle_id}`,
      itemName: item.bundle_name || 'Product',
      price: item.price / 100,
      quantity: item.quantity || 1,
    })),
    userData: {
      email: customerEmail,
      firstName: customerName?.split(' ')[0],
      lastName: customerName?.split(' ').slice(1).join(' '),
      street: shippingAddress?.line1,
      city: shippingAddress?.city,
      region: shippingAddress?.state,
      postalCode: shippingAddress?.postal_code,
      country: shippingAddress?.country,
    },
  })

  console.log(`GA4 Measurement Protocol Purchase event sent for order ${orderNumber}`)
}
