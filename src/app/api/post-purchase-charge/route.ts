import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key)
}

// Card Only price with 20% discount
const CARD_ONLY_BUNDLE = BUNDLES.find(b => b.id === 'card-only')
const CARD_ONLY_PRICE = CARD_ONLY_BUNDLE?.price || 2395
const DISCOUNT_PERCENT = 20
const DISCOUNTED_PRICE = Math.round(CARD_ONLY_PRICE * (1 - DISCOUNT_PERCENT / 100))

export interface PostPurchaseChargeRequest {
  customerId: string
  designId: string
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body: PostPurchaseChargeRequest = await req.json()

    const { customerId, designId, shippingAddress } = body

    // Validate customer ID
    if (!customerId || !customerId.startsWith('cus_')) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    // Validate design ID
    const design = PRODUCT.designs.find(d => d.id === designId)
    if (!design) {
      return NextResponse.json(
        { error: 'Invalid design ID' },
        { status: 400 }
      )
    }

    // Get customer's saved payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    if (paymentMethods.data.length === 0) {
      return NextResponse.json(
        { error: 'No saved payment method found', code: 'no_payment_method' },
        { status: 400 }
      )
    }

    // Use the most recent payment method (first in list)
    const paymentMethod = paymentMethods.data[0]

    // Calculate total (discounted price + standard shipping since Card Only doesn't qualify for free)
    const shippingCost = PRODUCT.shipping.standard
    const total = DISCOUNTED_PRICE + shippingCost

    // Create and confirm PaymentIntent immediately (off-session charge)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: true,
      metadata: {
        source: 'ultrararelove-store',
        is_post_purchase: 'true',
        bundle: 'card-only',
        bundle_name: 'Card Only',
        design_id: designId,
        design_name: design.name,
        discount_code: 'THANKYOU20',
        discount_percent: String(DISCOUNT_PERCENT),
        original_price: String(CARD_ONLY_PRICE),
        discounted_price: String(DISCOUNTED_PRICE),
        shipping: String(shippingCost),
      },
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
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: total,
      discountedPrice: DISCOUNTED_PRICE,
      shippingCost,
      cardLast4: paymentMethod.card?.last4,
    })
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    console.error('Post-purchase charge error:', stripeError.message, error)

    // Handle specific Stripe errors
    if (stripeError.type === 'StripeCardError') {
      return NextResponse.json(
        {
          error: 'Payment failed',
          code: 'card_declined',
          message: stripeError.message || 'Your card was declined. Please try another payment method.',
        },
        { status: 400 }
      )
    }

    if (stripeError.code === 'authentication_required') {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'authentication_required',
          message: 'Additional authentication is required. Please complete checkout manually.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process payment', details: stripeError.message },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve customer's payment method info (for display)
export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe()
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    if (!customerId || !customerId.startsWith('cus_')) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    // Get customer details
    const customer = await stripe.customers.retrieve(customerId)

    if (customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    const defaultPaymentMethod = paymentMethods.data[0]

    return NextResponse.json({
      customerId,
      hasPaymentMethod: paymentMethods.data.length > 0,
      cardLast4: defaultPaymentMethod?.card?.last4 || null,
      cardBrand: defaultPaymentMethod?.card?.brand || null,
      shippingAddress: customer.shipping?.address || null,
      shippingName: customer.shipping?.name || null,
      discountedPrice: DISCOUNTED_PRICE,
      originalPrice: CARD_ONLY_PRICE,
      shippingCost: PRODUCT.shipping.standard,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Get customer info error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to get customer info', details: errorMessage },
      { status: 500 }
    )
  }
}
