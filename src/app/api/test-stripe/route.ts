import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    return NextResponse.json({ error: 'No Stripe key found', envKeys: Object.keys(process.env).filter(k => k.includes('STRIPE')) })
  }

  try {
    // Try a simple API call
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${key}`,
      },
    })

    const data = await response.json()
    return NextResponse.json({ success: true, status: response.status, data })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed', details: errorMessage })
  }
}
