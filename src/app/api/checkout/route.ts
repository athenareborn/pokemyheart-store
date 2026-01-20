import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, successUrl, cancelUrl } = body

    // Create line items for Stripe with metadata
    const lineItems = items.map((item: {
      name: string
      description: string
      price: number
      quantity: number
      image?: string
      designId?: string
      designName?: string
      bundleId?: string
      bundleName?: string
      bundleSku?: string
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.image ? [item.image] : [],
          metadata: {
            designId: item.designId || '',
            designName: item.designName || '',
            bundleId: item.bundleId || '',
            bundleName: item.bundleName || '',
            sku: item.bundleSku || '',
          },
        },
        unit_amount: item.price, // Already in cents
      },
      quantity: item.quantity,
    }))

    // Build order items summary for session metadata
    const orderItemsSummary = items.map((item: {
      name: string
      description: string
      designId?: string
      designName?: string
      bundleId?: string
      bundleName?: string
      bundleSku?: string
      quantity: number
      price: number
      image?: string
    }) => ({
      name: item.name,
      description: item.description,
      designId: item.designId,
      designName: item.designName,
      bundleId: item.bundleId,
      bundleName: item.bundleName,
      sku: item.bundleSku,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))

    // Calculate subtotal (sum of all item prices * quantities)
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) =>
      sum + (item.price * item.quantity), 0
    )

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/products/i-choose-you-the-ultimate-valentines-gift`,
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
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
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
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        source: 'pokemyheart-store',
        items: JSON.stringify(orderItemsSummary),
        subtotal: String(subtotal),
        shipping: '495', // Default to standard shipping, actual amount determined by customer selection
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
