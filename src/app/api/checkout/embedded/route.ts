import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_placeholder')) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(key)
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await req.json()
    const { items, returnUrl, fbData } = body

    // Build line items for Stripe
    const lineItems = items.map((item: {
      name: string
      description: string
      price: number
      quantity: number
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.price,
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
    }) => ({
      bundle_name: item.bundleName || item.name,
      design_name: item.designName || item.description,
      quantity: item.quantity,
      price: item.price,
    }))

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) =>
      sum + (item.price * item.quantity), 0
    )

    // Determine shipping
    const qualifiesForFreeShipping = subtotal >= PRODUCT.freeShippingThreshold

    // Create embedded checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      shipping_options: qualifiesForFreeShipping ? [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'FREE Standard Shipping (5-7 days)',
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: PRODUCT.shipping.standard, currency: 'usd' },
            display_name: 'Express Shipping (1-3 days)',
          },
        },
      ] : [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: PRODUCT.shipping.standard, currency: 'usd' },
            display_name: 'Standard Shipping (5-7 days)',
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: PRODUCT.shipping.express, currency: 'usd' },
            display_name: 'Express Shipping (1-3 days)',
          },
        },
      ],
      metadata: {
        source: 'ultrararelove-store',
        checkout_type: 'embedded',
        items: JSON.stringify(orderItemsSummary),
        subtotal: String(subtotal),
        shipping: qualifiesForFreeShipping ? '0' : String(PRODUCT.shipping.standard),
        fb_fbc: fbData?.fbc || '',
        fb_fbp: fbData?.fbp || '',
        fb_event_id: fbData?.eventId || '',
      },
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Embedded checkout error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    )
  }
}
