import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key || key.startsWith('sk_test_placeholder')) {
      throw new Error('Stripe secret key not configured')
    }

    const body = await req.json()
    const { items, successUrl, cancelUrl, fbData } = body

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

    // Create checkout session via fetch
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('success_url', successUrl || 'https://pokemyheart-store.vercel.app/checkout/success?session_id={CHECKOUT_SESSION_ID}')
    params.append('cancel_url', cancelUrl || 'https://pokemyheart-store.vercel.app')

    // Add line items
    lineItems.forEach((item: { price_data: { currency: string; product_data: { name: string; description: string }; unit_amount: number }; quantity: number }, index: number) => {
      params.append(`line_items[${index}][price_data][currency]`, item.price_data.currency)
      params.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name)
      params.append(`line_items[${index}][price_data][product_data][description]`, item.price_data.product_data.description)
      params.append(`line_items[${index}][price_data][unit_amount]`, String(item.price_data.unit_amount))
      params.append(`line_items[${index}][quantity]`, String(item.quantity))
    })

    // Add shipping address collection
    params.append('shipping_address_collection[allowed_countries][0]', 'US')
    params.append('shipping_address_collection[allowed_countries][1]', 'CA')
    params.append('shipping_address_collection[allowed_countries][2]', 'GB')
    params.append('shipping_address_collection[allowed_countries][3]', 'AU')

    // Free shipping threshold: $35 (3500 cents)
    const FREE_SHIPPING_THRESHOLD = 3500
    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

    if (qualifiesForFreeShipping) {
      // Free standard shipping for orders $35+
      params.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount')
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '0')
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd')
      params.append('shipping_options[0][shipping_rate_data][display_name]', 'FREE Standard Shipping (5-7 days)')

      // Express shipping still available at reduced rate
      params.append('shipping_options[1][shipping_rate_data][type]', 'fixed_amount')
      params.append('shipping_options[1][shipping_rate_data][fixed_amount][amount]', '495')
      params.append('shipping_options[1][shipping_rate_data][fixed_amount][currency]', 'usd')
      params.append('shipping_options[1][shipping_rate_data][display_name]', 'Express Shipping (1-3 days)')
    } else {
      // Standard shipping
      params.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount')
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '495')
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd')
      params.append('shipping_options[0][shipping_rate_data][display_name]', 'Standard Shipping (5-7 days)')

      // Express shipping
      params.append('shipping_options[1][shipping_rate_data][type]', 'fixed_amount')
      params.append('shipping_options[1][shipping_rate_data][fixed_amount][amount]', '995')
      params.append('shipping_options[1][shipping_rate_data][fixed_amount][currency]', 'usd')
      params.append('shipping_options[1][shipping_rate_data][display_name]', 'Express Shipping (1-3 days)')
    }

    // Add metadata
    params.append('metadata[source]', 'pokemyheart-store')
    params.append('metadata[items]', JSON.stringify(orderItemsSummary))
    params.append('metadata[subtotal]', String(subtotal))
    params.append('metadata[shipping]', qualifiesForFreeShipping ? '0' : '495')

    // Facebook attribution data
    if (fbData?.fbc) params.append('metadata[fb_fbc]', fbData.fbc)
    if (fbData?.fbp) params.append('metadata[fb_fbp]', fbData.fbp)
    if (fbData?.eventId) params.append('metadata[fb_event_id]', fbData.eventId)

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await response.json()

    if (!response.ok) {
      throw new Error(session.error?.message || 'Failed to create checkout session')
    }

    return NextResponse.json({
      url: session.url,
      fbEventId: fbData?.eventId, // Return for client-side deduplication
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Checkout error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    )
  }
}
