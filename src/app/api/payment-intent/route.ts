import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCT } from '@/data/product'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key)
}

export interface PaymentIntentRequest {
  items: Array<{
    name: string
    description: string
    price: number
    quantity: number
    designId: string
    designName: string
    bundleId: string
    bundleName: string
    bundleSku: string
  }>
  email: string
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingMethod: 'standard' | 'express'
  discountCode?: string
  discountAmount?: number
  fbData?: {
    fbc?: string
    fbp?: string
    eventId?: string
  }
  gaData?: {
    clientId?: string | null
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body: PaymentIntentRequest = await req.json()

    const {
      items,
      email,
      shippingAddress,
      shippingMethod,
      discountCode,
      discountAmount = 0,
      fbData,
      gaData,
    } = body

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Calculate shipping
    const qualifiesForFreeShipping = subtotal >= PRODUCT.freeShippingThreshold
    let shippingCost = 0

    if (shippingMethod === 'express') {
      shippingCost = qualifiesForFreeShipping
        ? PRODUCT.shipping.standard // Reduced express when free shipping unlocked
        : PRODUCT.shipping.express
    } else {
      shippingCost = qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
    }

    // Calculate total
    const total = subtotal + shippingCost - discountAmount

    // Build order summary for metadata
    const orderItemsSummary = items.map((item) => ({
      bundle_id: item.bundleId,
      bundle_name: item.bundleName,
      design_id: item.designId,
      design_name: item.designName,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'pokemyheart-store',
        items: JSON.stringify(orderItemsSummary),
        subtotal: String(subtotal),
        shipping: String(shippingCost),
        discount_code: discountCode || '',
        discount_amount: String(discountAmount),
        customer_email: email,
        customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        shipping_method: shippingMethod,
        shipping_address: JSON.stringify({
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          line1: shippingAddress.address1,
          line2: shippingAddress.address2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        }),
        fb_fbc: fbData?.fbc || '',
        fb_fbp: fbData?.fbp || '',
        fb_event_id: fbData?.eventId || '',
        ga_client_id: gaData?.clientId || '',
      },
      receipt_email: email,
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: {
          line1: shippingAddress.address1,
          line2: shippingAddress.address2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        phone: shippingAddress.phone || undefined,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
      discountAmount,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Payment Intent error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: errorMessage },
      { status: 500 }
    )
  }
}

// Update existing Payment Intent
export async function PATCH(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await req.json()

    const {
      paymentIntentId,
      shippingMethod,
      discountAmount = 0,
      subtotal,
    } = body

    // Calculate shipping
    const qualifiesForFreeShipping = subtotal >= PRODUCT.freeShippingThreshold
    let shippingCost = 0

    if (shippingMethod === 'express') {
      shippingCost = qualifiesForFreeShipping
        ? PRODUCT.shipping.standard
        : PRODUCT.shipping.express
    } else {
      shippingCost = qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
    }

    // Calculate new total
    const total = subtotal + shippingCost - discountAmount

    // Update Payment Intent
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: total,
      metadata: {
        shipping: String(shippingCost),
        shipping_method: shippingMethod,
        discount_amount: String(discountAmount),
      },
    })

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
      discountAmount,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Payment Intent update error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to update payment intent', details: errorMessage },
      { status: 500 }
    )
  }
}
