import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { BUNDLES } from '@/data/bundles'

// Lazy Stripe initialization to avoid build-time errors
let stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return stripe
}

// Valid bundle IDs and prices for verification
const VALID_BUNDLE_IDS = new Set<string>(BUNDLES.map(b => b.id))
const BUNDLE_PRICES: Record<string, number> = Object.fromEntries(BUNDLES.map(b => [b.id, b.price]))

// Input validation schema
interface ExpressCheckoutBody {
  amount: number
  designId: string
  designName: string
  bundleId: string
  bundleName: string
  bundleSku: string
}

function validateInput(body: unknown): ExpressCheckoutBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body')
  }

  const data = body as Record<string, unknown>

  // Validate amount (must be positive integer in cents)
  if (typeof data.amount !== 'number' || !Number.isInteger(data.amount) || data.amount <= 0) {
    throw new Error('Invalid amount: must be a positive integer in cents')
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

    const { amount, designId, designName, bundleId, bundleName, bundleSku } = validatedData

    // Create PaymentIntent for express checkout (Apple Pay/Google Pay)
    // Express checkout includes FREE shipping
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'ultrararelove-express-checkout',
        designId,
        designName,
        bundleId,
        bundleName,
        sku: bundleSku,
        shipping: 'free',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Express checkout error:', error)

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
