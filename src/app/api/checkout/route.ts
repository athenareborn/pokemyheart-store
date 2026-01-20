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

function getSiteUrl(): string {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('NEXT_PUBLIC_SITE_URL environment variable is required')
  }
  return process.env.NEXT_PUBLIC_SITE_URL
}

// Valid bundle IDs for price verification
const VALID_BUNDLE_IDS = new Set<string>(BUNDLES.map(b => b.id))
const BUNDLE_PRICES: Record<string, number> = Object.fromEntries(BUNDLES.map(b => [b.id, b.price]))

// Input validation
interface CheckoutItem {
  name: string
  description: string
  price: number
  quantity: number
  image?: string
  designId: string
  designName: string
  bundleId: string
  bundleName: string
  bundleSku: string
}

function validateItem(item: unknown, index: number): CheckoutItem {
  if (!item || typeof item !== 'object') {
    throw new Error(`Invalid item at index ${index}`)
  }

  const data = item as Record<string, unknown>

  // Validate required string fields
  const stringFields = ['name', 'description', 'designId', 'designName', 'bundleId', 'bundleName', 'bundleSku'] as const
  for (const field of stringFields) {
    if (typeof data[field] !== 'string' || (data[field] as string).length === 0) {
      throw new Error(`Invalid ${field} at item ${index}: must be a non-empty string`)
    }
    if ((data[field] as string).length > 500) {
      throw new Error(`Invalid ${field} at item ${index}: too long`)
    }
  }

  // Validate price is positive integer in cents
  if (typeof data.price !== 'number' || !Number.isInteger(data.price) || data.price <= 0) {
    throw new Error(`Invalid price at item ${index}: must be a positive integer in cents`)
  }

  // Validate quantity is positive integer
  if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity <= 0 || data.quantity > 10) {
    throw new Error(`Invalid quantity at item ${index}: must be 1-10`)
  }

  // Validate bundleId is valid
  const bundleId = data.bundleId as string
  if (!VALID_BUNDLE_IDS.has(bundleId)) {
    throw new Error(`Invalid bundleId at item ${index}: unknown bundle`)
  }

  // SECURITY: Verify price matches expected bundle price (prevent price manipulation)
  const expectedPrice = BUNDLE_PRICES[bundleId]
  if (data.price !== expectedPrice) {
    throw new Error(`Invalid price at item ${index}: price mismatch`)
  }

  // Validate optional image URL
  let image: string | undefined
  if (data.image !== undefined) {
    if (typeof data.image !== 'string') {
      throw new Error(`Invalid image at item ${index}: must be a string`)
    }
    // Only allow images from our own domain or relative paths
    if (data.image.startsWith('/') || data.image.startsWith(getSiteUrl())) {
      image = data.image
    }
    // Silently ignore other image URLs for security
  }

  return {
    name: data.name as string,
    description: data.description as string,
    price: data.price as number,
    quantity: data.quantity as number,
    image,
    designId: data.designId as string,
    designName: data.designName as string,
    bundleId,
    bundleName: data.bundleName as string,
    bundleSku: data.bundleSku as string,
  }
}

function validateInput(body: unknown): { items: CheckoutItem[] } {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body')
  }

  const data = body as Record<string, unknown>

  // Validate items array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Invalid items: must be a non-empty array')
  }

  if (data.items.length > 20) {
    throw new Error('Invalid items: too many items (max 20)')
  }

  const items = data.items.map((item, index) => validateItem(item, index))

  // SECURITY: Ignore successUrl and cancelUrl from client to prevent open redirect
  // Always use our own hardcoded URLs

  return { items }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = validateInput(body)

    // Create line items for Stripe with metadata
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.image ? [item.image.startsWith('/') ? `${getSiteUrl()}${item.image}` : item.image] : [],
          metadata: {
            designId: item.designId,
            designName: item.designName,
            bundleId: item.bundleId,
            bundleName: item.bundleName,
            sku: item.bundleSku,
          },
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    // Build order items summary for session metadata
    const orderItemsSummary = items.map((item) => ({
      designId: item.designId,
      designName: item.designName,
      bundleId: item.bundleId,
      bundleName: item.bundleName,
      sku: item.bundleSku,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create Stripe Checkout Session
    // SECURITY: Use hardcoded URLs to prevent open redirect attacks
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/products/i-choose-you-the-ultimate-valentines-gift`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 495, // $4.95
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 995, // $9.95
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        source: 'ultrararelove-store',
        orderItems: JSON.stringify(orderItemsSummary),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)

    // Return user-friendly error messages for validation errors
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
