import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'

// Shipping insurance price in cents - must match cart.ts
const SHIPPING_INSURANCE_PRICE = 299 // $2.99

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
  shippingInsurance?: boolean
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

    // SECURITY: Validate and calculate subtotal using server-side prices
    let subtotal = 0
    for (const item of items) {
      // Validate quantity
      if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json(
          { error: 'Invalid quantity', details: `Invalid quantity for ${item.bundleId}` },
          { status: 400 }
        )
      }

      // Get server-side bundle price
      const bundle = BUNDLES.find(b => b.id === item.bundleId)
      if (!bundle) {
        return NextResponse.json(
          { error: 'Invalid bundle', details: `Bundle ${item.bundleId} not found` },
          { status: 400 }
        )
      }

      // Use server-side price, not client-provided price
      subtotal += bundle.price * item.quantity
    }

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

    // Validate discount amount - must be non-negative and not exceed subtotal
    const validDiscountAmount = Math.max(0, Math.min(discountAmount, subtotal))

    // Calculate total
    const total = subtotal + shippingCost - validDiscountAmount

    // Build order summary for metadata
    const orderItemsSummary = items.map((item) => ({
      bundle_id: item.bundleId,
      bundle_name: item.bundleName,
      design_id: item.designId,
      design_name: item.designName,
      quantity: item.quantity,
      price: item.price,
    }))

    // Build shipping object only if we have address data
    const hasShippingData = shippingAddress.firstName && shippingAddress.address1

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'ultrararelove-store',
        items: JSON.stringify(orderItemsSummary),
        subtotal: String(subtotal),
        shipping: String(shippingCost),
        discount_code: discountCode || '',
        discount_amount: String(validDiscountAmount),
        customer_email: email || '',
        customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        shipping_method: shippingMethod,
        shipping_address: JSON.stringify({
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
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
      // Only set receipt_email if we have a valid email
      ...(email ? { receipt_email: email } : {}),
      // Only set shipping if we have address data
      ...(hasShippingData ? {
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
      } : {}),
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
      discountAmount: validDiscountAmount,
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
      shippingInsurance = true, // Default to true (pre-selected)
      discountAmount = 0,
      discountCode,
      subtotal,
      fbEventId,
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

    // Calculate insurance cost
    const insuranceCost = shippingInsurance ? SHIPPING_INSURANCE_PRICE : 0

    // Validate discount amount in PATCH as well
    const validDiscountAmount = Math.max(0, Math.min(discountAmount, subtotal))

    // Calculate new total (subtotal + shipping + insurance - discount)
    const total = subtotal + shippingCost + insuranceCost - validDiscountAmount

    // Update Payment Intent
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: total,
      metadata: {
        shipping: String(shippingCost),
        shipping_method: shippingMethod,
        shipping_insurance: shippingInsurance ? 'true' : 'false',
        shipping_insurance_amount: String(insuranceCost),
        discount_amount: String(validDiscountAmount),
        ...(discountCode ? { discount_code: discountCode } : {}),
        // Update fb_event_id with purchase eventId for proper deduplication
        ...(fbEventId ? { fb_event_id: fbEventId } : {}),
      },
    })

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      shippingCost,
      insuranceCost,
      discountAmount: validDiscountAmount,
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
