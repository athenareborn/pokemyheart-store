import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'
import { rateLimit } from '@/lib/rate-limit'

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
    const rateLimitResponse = await rateLimit(req, {
      keyPrefix: 'payment-intent',
      limit: 20,
      windowMs: 60_000,
    })
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const stripe = getStripe()
    const body: PaymentIntentRequest = await req.json()

    const {
      items,
      email,
      shippingAddress,
      shippingMethod,
      shippingInsurance = true, // Default to true (pre-selected on checkout)
      discountCode,
      discountAmount = 0,
      fbData,
      gaData,
    } = body

    // SECURITY: Validate and calculate subtotal using server-side prices
    let subtotal = 0
    const orderItemsSummary: Array<{
      bundle_id: string
      bundle_name: string
      design_id: string
      design_name: string
      quantity: number
      price: number
    }> = []
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

      const design = PRODUCT.designs.find(d => d.id === item.designId)
      if (!design) {
        return NextResponse.json(
          { error: 'Invalid design', details: `Design ${item.designId} not found` },
          { status: 400 }
        )
      }

      // Use server-side price, not client-provided price
      subtotal += bundle.price * item.quantity
      orderItemsSummary.push({
        bundle_id: bundle.id,
        bundle_name: bundle.name,
        design_id: design.id,
        design_name: design.name,
        quantity: item.quantity,
        price: bundle.price,
      })
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

    // Calculate insurance cost
    const insuranceCost = shippingInsurance ? SHIPPING_INSURANCE_PRICE : 0

    // Calculate total (subtotal + shipping + insurance - discount)
    const total = subtotal + shippingCost + insuranceCost - validDiscountAmount

    // Build shipping object only if we have address data
    const hasShippingData = shippingAddress.firstName && shippingAddress.address1

    // Create Payment Intent with automatic payment methods (supports Apple Pay, Google Pay, cards)
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
        shipping_insurance: shippingInsurance ? 'true' : 'false',
        shipping_insurance_amount: String(insuranceCost),
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
      insuranceCost,
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
    const rateLimitResponse = await rateLimit(req, {
      keyPrefix: 'payment-intent',
      limit: 30,
      windowMs: 60_000,
    })
    if (rateLimitResponse) {
      return rateLimitResponse
    }

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
      gaData,
      email,
      customerName,
      shippingAddress,
    } = body

    // Retrieve existing PaymentIntent to preserve metadata and trust server-side subtotal
    const existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const existingMetadata = existingIntent.metadata || {}
    const storedSubtotal = parseInt(existingMetadata.subtotal || '0')
    const requestedSubtotal = typeof subtotal === 'number' && Number.isFinite(subtotal) ? subtotal : 0
    const effectiveSubtotal = storedSubtotal > 0 ? storedSubtotal : requestedSubtotal

    // Calculate shipping
    const qualifiesForFreeShipping = effectiveSubtotal >= PRODUCT.freeShippingThreshold
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
    const validDiscountAmount = Math.max(0, Math.min(discountAmount, effectiveSubtotal))

    // Calculate new total (subtotal + shipping + insurance - discount)
    const total = effectiveSubtotal + shippingCost + insuranceCost - validDiscountAmount

    // Create or find Stripe Customer for 1-click post-purchase offers
    let stripeCustomerId: string | undefined
    if (email) {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: email,
          name: customerName || undefined,
          shipping: shippingAddress ? {
            name: customerName || '',
            address: {
              line1: shippingAddress.address1 || '',
              line2: shippingAddress.address2 || undefined,
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              postal_code: shippingAddress.postalCode || '',
              country: shippingAddress.country || 'US',
            },
          } : undefined,
          metadata: {
            source: 'ultrararelove-store',
          },
        })
        stripeCustomerId = newCustomer.id
      }
    }

    // Update Payment Intent with customer
    // NOTE: Cannot set setup_future_usage after creation when using automatic_payment_methods
    // IMPORTANT: Merge with existing metadata to preserve items, source, etc.
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: total,
      ...(stripeCustomerId ? {
        customer: stripeCustomerId,
      } : {}),
      // Update receipt_email and shipping if provided
      ...(email ? { receipt_email: email } : {}),
      ...(shippingAddress ? {
        shipping: {
          name: customerName || '',
          address: {
            line1: shippingAddress.address1 || '',
            line2: shippingAddress.address2 || undefined,
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postalCode || '',
            country: shippingAddress.country || 'US',
          },
          phone: shippingAddress.phone || undefined,
        },
      } : {}),
      metadata: {
        // Preserve existing metadata (items, source, subtotal, etc.)
        ...existingMetadata,
        // Update/add new fields
        shipping: String(shippingCost),
        shipping_method: shippingMethod,
        shipping_insurance: shippingInsurance ? 'true' : 'false',
        shipping_insurance_amount: String(insuranceCost),
        discount_amount: String(validDiscountAmount),
        // Update customer info
        ...(email ? { customer_email: email } : {}),
        ...(customerName ? { customer_name: customerName } : {}),
        ...(shippingAddress ? {
          shipping_address: JSON.stringify({
            name: customerName || '',
            line1: shippingAddress.address1 || '',
            line2: shippingAddress.address2 || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postalCode || '',
            country: shippingAddress.country || 'US',
          }),
        } : {}),
        ...(discountCode ? { discount_code: discountCode } : {}),
        ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
        // Update fb_event_id with purchase eventId for proper deduplication
        ...(fbEventId ? { fb_event_id: fbEventId } : {}),
        ...(gaData?.clientId ? { ga_client_id: gaData.clientId } : {}),
      },
    })

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      stripeCustomerId,
      amount: total,
      subtotal: effectiveSubtotal,
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
