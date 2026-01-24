import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { fbCAPI, generateEventId } from '@/lib/analytics/facebook-capi'
import { ga4Server } from '@/lib/analytics/ga4-server'
import { sendOrderConfirmation } from '@/lib/email'

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

async function getSupabaseClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient()
  }
  return createClient()
}

type OrderItemMetadata = {
  bundle_id: string
  bundle_name?: string
  design_id: string
  design_name?: string
  quantity?: number
  price: number
}

function parseOrderItems(raw: string | null | undefined, context: string): OrderItemMetadata[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`[Webhook] Failed to parse items metadata (${context}):`, error)
    return []
  }
}

async function findExistingOrder(
  supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
  stripeSessionId?: string | null,
  stripePaymentIntent?: string | null
) {
  const filters: string[] = []
  if (stripeSessionId) {
    filters.push(`stripe_session_id.eq.${stripeSessionId}`)
  }
  if (stripePaymentIntent) {
    filters.push(`stripe_payment_intent.eq.${stripePaymentIntent}`)
  }
  if (filters.length === 0) return null

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number')
    .or(filters.join(','))
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error checking for existing order:', error)
    return null
  }
  return data
}

async function getNextOrderNumber(supabase: Awaited<ReturnType<typeof getSupabaseClient>>) {
  const { data: lastOrder, error } = await supabase
    .from('orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  let nextNumber = 1
  if (lastOrder?.order_number) {
    const match = lastOrder.order_number.match(/PMH-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `PMH-${String(nextNumber).padStart(3, '0')}`
}

async function createOrderWithRetry(
  supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
  payload: {
    customer_email: string
    customer_name: string | null
    items: OrderItemMetadata[]
    subtotal: number
    shipping: number
    total: number
    status: string
    shipping_address: unknown
    stripe_session_id: string | null
    stripe_payment_intent: string | null
  }
) {
  const maxAttempts = 3
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const orderNumber = await getNextOrderNumber(supabase)
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        ...payload,
      })
      .select('order_number')
      .single()

    if (!error) {
      return { orderNumber: data.order_number, wasDuplicate: false }
    }

    if (error.code === '23505') {
      const existing = await findExistingOrder(
        supabase,
        payload.stripe_session_id,
        payload.stripe_payment_intent
      )
      if (existing?.order_number) {
        return { orderNumber: existing.order_number, wasDuplicate: true }
      }
      continue
    }

    throw error
  }

  throw new Error('Failed to create order after retries')
}

async function upsertCustomerStats(
  supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
  params: {
    email: string
    name: string | null
    totalSpent: number
    acceptsMarketing?: boolean
  }
) {
  if (!params.email) return

  const { error } = await supabase.rpc('upsert_customer_stats', {
    p_email: params.email,
    p_name: params.name,
    p_total_spent: params.totalSpent,
    p_accepts_marketing: params.acceptsMarketing ?? false,
  })

  if (!error) return

  console.error('Customer stats RPC failed, falling back to manual update:', error)

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select()
    .eq('email', params.email)
    .maybeSingle()

  if (existingCustomer) {
    await supabase
      .from('customers')
      .update({
        name: params.name || existingCustomer.name,
        orders_count: existingCustomer.orders_count + 1,
        total_spent: existingCustomer.total_spent + params.totalSpent,
      })
      .eq('email', params.email)
  } else {
    await supabase.from('customers').insert({
      email: params.email,
      name: params.name,
      orders_count: 1,
      total_spent: params.totalSpent,
      accepts_marketing: params.acceptsMarketing ?? false,
    })
  }
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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // Pass request for IP/UserAgent extraction
      await handleCheckoutComplete(session)
    }

    // Handle Payment Intent success (for custom checkout)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentSuccess(paymentIntent)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failure' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = await getSupabaseClient()

  // Extract order data from session metadata
  const metadata = session.metadata
  if (!metadata) {
    throw new Error('Missing metadata in checkout session')
  }

  const items = parseOrderItems(metadata.items, 'checkout.session.completed')
  const rawEmail = session.customer_details?.email || metadata.customerEmail || metadata.customer_email || null
  const customerEmail = rawEmail?.trim() || `missing+${session.id}@ultrararelove.com`
  const customerName = session.customer_details?.name || null
  const stripePaymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null

  const existingOrder = await findExistingOrder(supabase, session.id, stripePaymentIntent)
  if (existingOrder?.order_number) {
    console.log(`[Webhook] Order already exists for session ${session.id}: ${existingOrder.order_number}`)
    return
  }

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

  const { orderNumber, wasDuplicate } = await createOrderWithRetry(supabase, {
    customer_email: customerEmail,
    customer_name: customerName,
    items,
    subtotal: parseInt(metadata.subtotal || '0'),
    shipping: parseInt(metadata.shipping || '0'),
    total: session.amount_total || 0,
    status: 'unfulfilled',
    shipping_address: shippingAddress,
    stripe_session_id: session.id,
    stripe_payment_intent: stripePaymentIntent,
  })

  if (wasDuplicate) {
    console.log(`[Webhook] Duplicate order skipped for session ${session.id}: ${orderNumber}`)
    return
  }

  await upsertCustomerStats(supabase, {
    email: customerEmail,
    name: customerName,
    totalSpent: session.amount_total || 0,
    acceptsMarketing: metadata.acceptsMarketing === 'true',
  })

  console.log(`Order ${orderNumber} created successfully`)

  // Send order confirmation email
  try {
    await sendOrderConfirmation({
      orderNumber,
      customerEmail: customerEmail || '',
      customerName,
      items: items.map((item: { bundle_id: string; bundle_name?: string; design_id: string; design_name?: string; quantity?: number; price: number }) => ({
        bundle_name: item.bundle_name || item.bundle_id,
        design_name: item.design_name || item.design_id,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      subtotal: parseInt(metadata.subtotal || '0'),
      shipping: parseInt(metadata.shipping || '0'),
      total: session.amount_total || 0,
      shippingAddress,
    })
    console.log(`Order confirmation email sent for ${orderNumber}`)
  } catch (emailError) {
    // Log but don't fail the webhook - order is already created
    console.error('Failed to send order confirmation email:', emailError)
  }

  // Send server-side Purchase event to Facebook CAPI
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ultrararelove.com'

  // Use same eventId from client for deduplication, or generate new one
  const eventId = metadata.fb_event_id || generateEventId('purchase')

  // Items in metadata use snake_case (bundle_id, design_id)
  const contentIds = items.map((item: { bundle_id: string; design_id: string }) =>
    `${item.design_id}-${item.bundle_id}`
  )

  // Get IP and UserAgent from request headers
  const headersList = await headers()
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') ||
                   undefined
  const userAgent = headersList.get('user-agent') || undefined

  // Get phone if collected (from Stripe customer details)
  const customerPhone = session.customer_details?.phone || undefined

  try {
    await fbCAPI.purchase({
      eventId,
      orderUrl: `${siteUrl}/checkout/success?session_id=${session.id}`,
      email: customerEmail || '',
      firstName: customerName?.split(' ')[0],
      lastName: customerName?.split(' ').slice(1).join(' '),
      phone: customerPhone,
      // Address data for improved EMQ
      city: shippingAddress?.city,
      state: shippingAddress?.state,
      postalCode: shippingAddress?.postal_code,
      country: shippingAddress?.country,
      // external_id for ~12% EMQ improvement - use email as consistent identifier
      externalId: customerEmail || undefined,
      value: (session.amount_total || 0) / 100,
      currency: 'USD',
      contentIds,
      numItems: items.length,
      orderId: orderNumber,
      ip: clientIp,
      userAgent: userAgent,
      fbc: metadata.fb_fbc || undefined,  // Facebook Click ID
      fbp: metadata.fb_fbp || undefined,  // Facebook Browser ID
      // Dynamic Ads: detailed product info (snake_case from metadata)
      contents: items.map((item: { bundle_id: string; design_id: string; price: number; quantity?: number }) => ({
        id: `${item.design_id}-${item.bundle_id}`,
        quantity: item.quantity || 1,
        item_price: item.price / 100,
      })),
    })

    console.log(`Facebook CAPI Purchase event sent for order ${orderNumber}`)
  } catch (error) {
    console.error('Facebook CAPI Purchase event failed:', error)
  }

  // Send server-side Purchase event to GA4 Measurement Protocol
  const gaClientId = metadata.ga_client_id || `server.${Date.now()}`

  try {
    await ga4Server.purchase({
      clientId: gaClientId,
      transactionId: orderNumber,
      value: (session.amount_total || 0) / 100,
      currency: 'USD',
      items: items.map((item: { design_id: string; bundle_id: string; bundle_name?: string; price: number; quantity?: number }) => ({
        itemId: `${item.design_id}-${item.bundle_id}`,
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
  } catch (error) {
    console.error('GA4 Measurement Protocol Purchase event failed:', error)
  }
}

async function handlePaymentIntentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await getSupabaseClient()

  // Extract order data from payment intent metadata
  const metadata = paymentIntent.metadata
  if (!metadata || metadata.source !== 'ultrararelove-store') {
    // Not from our custom checkout, skip
    return
  }

  const items = parseOrderItems(metadata.items, 'payment_intent.succeeded')
  const existingOrder = await findExistingOrder(supabase, null, paymentIntent.id)
  if (existingOrder?.order_number) {
    console.log(`[Webhook] Order already exists for PaymentIntent ${paymentIntent.id}: ${existingOrder.order_number}`)
    return
  }

  // For ExpressCheckout: customer data is on paymentIntent directly, not in metadata
  // For regular checkout: data is in metadata
  // Also try latest_charge billing_details as last resort
  let customerEmail = metadata.customer_email || paymentIntent.receipt_email || null

  // If still no email, try to get from the charge's billing details
  if (!customerEmail && paymentIntent.latest_charge) {
    try {
      const stripe = getStripe()
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string)
      customerEmail = charge.billing_details?.email || null
    } catch (e) {
      console.warn('Could not retrieve charge for email:', e)
    }
  }
  if (!customerEmail) {
    customerEmail = `missing+${paymentIntent.id}@ultrararelove.com`
  }

  const customerName = metadata.customer_name || paymentIntent.shipping?.name || null
  const customerPhone = paymentIntent.shipping?.phone || undefined

  // Shipping address: check metadata first (regular checkout), then paymentIntent.shipping (ExpressCheckout)
  let shippingAddress = null
  if (metadata.shipping_address) {
    try {
      shippingAddress = JSON.parse(metadata.shipping_address)
    } catch (error) {
      console.error('Failed to parse shipping_address metadata:', error)
    }
  } else if (paymentIntent.shipping?.address) {
    shippingAddress = {
      name: paymentIntent.shipping.name || '',
      line1: paymentIntent.shipping.address.line1 || '',
      line2: paymentIntent.shipping.address.line2 || undefined,
      city: paymentIntent.shipping.address.city || '',
      state: paymentIntent.shipping.address.state || '',
      postal_code: paymentIntent.shipping.address.postal_code || '',
      country: paymentIntent.shipping.address.country || '',
    }
  }

  console.log('[Webhook] Processing order:', {
    email: customerEmail,
    name: customerName,
    phone: customerPhone ? 'yes' : 'no',
    hasShippingAddress: !!shippingAddress,
    checkoutType: metadata.checkout_type || 'unknown',
  })

  const { orderNumber, wasDuplicate } = await createOrderWithRetry(supabase, {
    customer_email: customerEmail,
    customer_name: customerName,
    items,
    subtotal: parseInt(metadata.subtotal || '0'),
    shipping: parseInt(metadata.shipping || '0'),
    total: paymentIntent.amount,
    status: 'unfulfilled',
    shipping_address: shippingAddress,
    stripe_session_id: null,
    stripe_payment_intent: paymentIntent.id,
  })

  if (wasDuplicate) {
    console.log(`[Webhook] Duplicate order skipped for PaymentIntent ${paymentIntent.id}: ${orderNumber}`)
    return
  }

  await upsertCustomerStats(supabase, {
    email: customerEmail,
    name: customerName,
    totalSpent: paymentIntent.amount,
    acceptsMarketing: false,
  })

  console.log(`Order ${orderNumber} created from Payment Intent`)

  // Send order confirmation email
  try {
    await sendOrderConfirmation({
      orderNumber,
      customerEmail,
      customerName,
      items: items.map((item: { bundle_id: string; bundle_name?: string; design_id: string; design_name?: string; quantity?: number; price: number }) => ({
        bundle_name: item.bundle_name || item.bundle_id,
        design_name: item.design_name || item.design_id,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      subtotal: parseInt(metadata.subtotal || '0'),
      shipping: parseInt(metadata.shipping || '0'),
      total: paymentIntent.amount,
      shippingAddress,
    })
    console.log(`Order confirmation email sent for ${orderNumber}`)
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError)
  }

  // Send server-side Purchase event to Facebook CAPI
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ultrararelove.com'
  const eventId = metadata.fb_event_id || generateEventId('purchase')

  const contentIds = items.map((item: { bundle_id: string; design_id: string }) =>
    `${item.design_id}-${item.bundle_id}`
  )

  const headersList = await headers()
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') ||
                   undefined
  const userAgent = headersList.get('user-agent') || undefined

  try {
    await fbCAPI.purchase({
      eventId,
      orderUrl: `${siteUrl}/checkout/success?payment_intent=${paymentIntent.id}`,
      email: customerEmail,
      firstName: customerName?.split(' ')[0],
      lastName: customerName?.split(' ').slice(1).join(' '),
      phone: customerPhone,
      // Address data for improved EMQ
      city: shippingAddress?.city,
      state: shippingAddress?.state,
      postalCode: shippingAddress?.postal_code,
      country: shippingAddress?.country,
      // external_id for ~12% EMQ improvement - use email as consistent identifier
      externalId: customerEmail,
      value: paymentIntent.amount / 100,
      currency: 'USD',
      contentIds,
      numItems: items.length,
      orderId: orderNumber,
      ip: clientIp,
      userAgent: userAgent,
      fbc: metadata.fb_fbc || undefined,
      fbp: metadata.fb_fbp || undefined,
      // Dynamic Ads: detailed product info
      contents: items.map((item: { bundle_id: string; design_id: string; price: number; quantity?: number }) => ({
        id: `${item.design_id}-${item.bundle_id}`,
        quantity: item.quantity || 1,
        item_price: item.price / 100,
      })),
    })

    console.log(`Facebook CAPI Purchase event sent for order ${orderNumber}`)
  } catch (error) {
    console.error('Facebook CAPI Purchase event failed:', error)
  }

  // Send server-side Purchase event to GA4 Measurement Protocol
  const gaClientId = metadata.ga_client_id || `server.${Date.now()}`

  try {
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
  } catch (error) {
    console.error('GA4 Measurement Protocol Purchase event failed:', error)
  }
}
