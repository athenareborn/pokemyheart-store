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

interface CartItem {
  designId: string
  bundleId: BundleId
  quantity: number
  price: number
}

export interface ExpressCheckoutRequest {
  // Support both single item (legacy) and multiple items
  designId?: string
  bundleId?: BundleId
  items?: CartItem[]
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

    const { designId, bundleId, items, fbData, gaData } = body

    // Build order items - support both single item (legacy) and multiple items
    const orderItems: Array<{
      bundle_id: string
      bundle_name: string
      design_id: string
      design_name: string
      quantity: number
      price: number
    }> = []

    let subtotal = 0

    if (items && items.length > 0) {
      // Multiple items from cart
      for (const item of items) {
        const bundle = BUNDLES.find(b => b.id === item.bundleId)
        const design = PRODUCT.designs.find(d => d.id === item.designId)

        if (!bundle || !design) {
          return NextResponse.json(
            { error: 'Invalid item', details: `Bundle or design not found for item ${item.designId}-${item.bundleId}` },
            { status: 400 }
          )
        }

        // Validate quantity
        if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
          return NextResponse.json(
            { error: 'Invalid quantity', details: `Invalid quantity for item ${item.designId}-${item.bundleId}` },
            { status: 400 }
          )
        }

        // SECURITY: Use server-side bundle price, NOT client-provided price
        orderItems.push({
          bundle_id: item.bundleId,
          bundle_name: bundle.name,
          design_id: item.designId,
          design_name: design.name,
          quantity: item.quantity,
          price: bundle.price, // Server-side validated price
        })

        subtotal += bundle.price * item.quantity // Use bundle.price, NOT item.price
      }
    } else if (designId && bundleId) {
      // Legacy single item support
      const bundle = BUNDLES.find(b => b.id === bundleId)
      const design = PRODUCT.designs.find(d => d.id === designId)

      if (!bundle) {
        return NextResponse.json(
          { error: 'Invalid bundle', details: 'Bundle not found' },
          { status: 400 }
        )
      }

      if (!design) {
        return NextResponse.json(
          { error: 'Invalid design', details: 'Design not found' },
          { status: 400 }
        )
      }

      orderItems.push({
        bundle_id: bundleId,
        bundle_name: bundle.name,
        design_id: designId,
        design_name: design.name,
        quantity: 1,
        price: bundle.price,
      })

      subtotal = bundle.price
    } else {
      return NextResponse.json(
        { error: 'Invalid request', details: 'No items provided' },
        { status: 400 }
      )
    }

    const qualifiesForFreeShipping = subtotal >= PRODUCT.freeShippingThreshold
    const shippingCost = qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
    const total = subtotal + shippingCost

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
        items: JSON.stringify(orderItems),
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
      itemCount: orderItems.length,
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
