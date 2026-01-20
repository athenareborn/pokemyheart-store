import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BUNDLES } from '@/data/bundles'

// Validate environment variable exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
})

// Valid bundle IDs and prices for verification
const VALID_BUNDLE_IDS = new Set<string>(BUNDLES.map(b => b.id))
const BUNDLE_PRICES: Record<string, number> = Object.fromEntries(BUNDLES.map(b => [b.id, b.price]))

// Valid shipping amounts (in cents)
const VALID_SHIPPING_AMOUNTS = [0, 495, 995] // Free, Standard $4.95, Express $9.95

// Input validation schema
interface PaymentIntentBody {
  amount: number
  shipping: number
  designId: string
  designName: string
  bundleId: string
  bundleName: string
  bundleSku: string
}

function validateInput(body: unknown): PaymentIntentBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body')
  }

  const data = body as Record<string, unknown>

  // Validate amount (must be positive integer in cents)
  if (typeof data.amount !== 'number' || !Number.isInteger(data.amount) || data.amount <= 0) {
    throw new Error('Invalid amount: must be a positive integer in cents')
  }

  // Validate shipping (must be non-negative integer in cents)
  if (typeof data.shipping !== 'number' || !Number.isInteger(data.shipping) || data.shipping < 0) {
    throw new Error('Invalid shipping: must be a non-negative integer in cents')
  }

  // SECURITY: Validate shipping is a known amount
  if (!VALID_SHIPPING_AMOUNTS.includes(data.shipping as number)) {
    throw new Error('Invalid shipping: unknown shipping rate')
  }

  // Validate required string fields
  const stringFields = ['designId', 'designName', 'bundleId', 'bundleName', 'bundleSku'] as const
  for (const field of stringFields) {
    if (typeof data[field] !== 'string' || data[field].length === 0) {
      throw new Error(`Invalid ${field}: must be a non-empty string`)
    }
    // Prevent injection by limiting length and characters
    if ((data[field] as string).length > 200) {
      throw new Error(`Invalid ${field}: too long`)
    }
  }

  // SECURITY: Validate bundleId is valid
  const bundleId = data.bundleId as string
  if (!VALID_BUNDLE_IDS.has(bundleId)) {
    throw new Error('Invalid bundleId: unknown bundle')
  }

  // SECURITY: Verify amount matches expected bundle price (prevent price manipulation)
  const expectedPrice = BUNDLE_PRICES[bundleId]
  if (data.amount !== expectedPrice) {
    throw new Error('Invalid amount: price mismatch')
  }

  return {
    amount: data.amount as number,
    shipping: data.shipping as number,
    designId: data.designId as string,
    designName: data.designName as string,
    bundleId,
    bundleName: data.bundleName as string,
    bundleSku: data.bundleSku as string,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = validateInput(body)

    const { amount, shipping, designId, designName, bundleId, bundleName, bundleSku } = validatedData

    // Total = product amount + shipping
    const totalAmount = amount + shipping

    // Create PaymentIntent for standard checkout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'ultrararelove-checkout',
        designId,
        designName,
        bundleId,
        bundleName,
        sku: bundleSku,
        productAmount: String(amount),
        shippingAmount: String(shipping),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount,
    })
  } catch (error) {
    console.error('Payment intent error:', error)

    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.startsWith('Invalid')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
