import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCT } from '@/data/product'
import { BUNDLES, type BundleId } from '@/data/bundles'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key)
}

export interface ExpressCheckoutRequest {
  designId: string
  bundleId: BundleId
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
    const body: ExpressCheckoutRequest = await req.json()

    const { designId, bundleId, fbData, gaData } = body

    // Get bundle and design info
    const bundle = BUNDLES.find(b => b.id === bundleId)
    if (!bundle) {
      return NextResponse.json(
        { error: 'Invalid bundle', details: 'Bundle not found' },
        { status: 400 }
      )
    }

    const design = PRODUCT.designs.find(d => d.id === designId)
    if (!design) {
      return NextResponse.json(
        { error: 'Invalid design', details: 'Design not found' },
        { status: 400 }
      )
    }

    const subtotal = bundle.price
    const qualifiesForFreeShipping = subtotal >= PRODUCT.freeShippingThreshold
    const shippingCost = qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
    const total = subtotal + shippingCost

    // Build order item for metadata
    const orderItem = {
      bundle_id: bundleId,
      bundle_name: bundle.name,
      design_id: designId,
      design_name: design.name,
      quantity: 1,
      price: bundle.price,
    }

    // Create Payment Intent with deferred shipping (collected in payment sheet)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'ultrararelove-store',
        checkout_type: 'express',
        items: JSON.stringify([orderItem]),
        subtotal: String(subtotal),
        shipping: String(shippingCost),
        shipping_method: 'standard',
        fb_fbc: fbData?.fbc || '',
        fb_fbp: fbData?.fbp || '',
        fb_event_id: fbData?.eventId || '',
        ga_client_id: gaData?.clientId || '',
      },
    })

    console.log('[ExpressCheckout API] Created PaymentIntent:', {
      id: paymentIntent.id,
      amount: total,
      payment_method_types: paymentIntent.payment_method_types,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Express checkout error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to create express checkout', details: errorMessage },
      { status: 500 }
    )
  }
}

// Update Payment Intent with shipping details from payment sheet
export async function PATCH(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await req.json()

    const {
      paymentIntentId,
      email,
      shippingAddress,
      shippingMethod = 'standard',
    } = body

    // Get current Payment Intent to access metadata
    const currentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const subtotal = parseInt(currentIntent.metadata?.subtotal || '0')

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

    const total = subtotal + shippingCost

    // Update Payment Intent
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: total,
      receipt_email: email,
      shipping: shippingAddress ? {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.address?.line1,
          line2: shippingAddress.address?.line2 || undefined,
          city: shippingAddress.address?.city,
          state: shippingAddress.address?.state,
          postal_code: shippingAddress.address?.postal_code,
          country: shippingAddress.address?.country,
        },
      } : undefined,
      metadata: {
        ...currentIntent.metadata,
        shipping: String(shippingCost),
        shipping_method: shippingMethod,
        customer_email: email || '',
        customer_name: shippingAddress?.name || '',
        shipping_address: shippingAddress ? JSON.stringify({
          name: shippingAddress.name,
          line1: shippingAddress.address?.line1,
          line2: shippingAddress.address?.line2 || '',
          city: shippingAddress.address?.city,
          state: shippingAddress.address?.state,
          postal_code: shippingAddress.address?.postal_code,
          country: shippingAddress.address?.country,
        }) : '',
      },
    })

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Express checkout update error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to update express checkout', details: errorMessage },
      { status: 500 }
    )
  }
}
