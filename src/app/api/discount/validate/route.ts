import { NextRequest, NextResponse } from 'next/server'

// Discount codes configuration
// In production, this would come from a database
const DISCOUNT_CODES: Record<
  string,
  {
    type: 'percentage' | 'fixed'
    value: number // percentage (10 = 10%) or fixed amount in cents
    minPurchase?: number // minimum purchase in cents
    maxUses?: number
    expiresAt?: Date
  }
> = {
  WELCOME10: {
    type: 'percentage',
    value: 10,
  },
  LOVE15: {
    type: 'percentage',
    value: 15,
    minPurchase: 3500, // $35 minimum
  },
  SAVE5: {
    type: 'fixed',
    value: 500, // $5 off
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, subtotal } = body

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a discount code' },
        { status: 400 }
      )
    }

    const normalizedCode = code.toUpperCase().trim()
    const discount = DISCOUNT_CODES[normalizedCode]

    if (!discount) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid discount code',
      })
    }

    // Check minimum purchase
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      const minAmount = (discount.minPurchase / 100).toFixed(2)
      return NextResponse.json({
        valid: false,
        message: `Minimum purchase of $${minAmount} required`,
      })
    }

    // Check expiration
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json({
        valid: false,
        message: 'This discount code has expired',
      })
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.type === 'percentage') {
      discountAmount = Math.round((subtotal * discount.value) / 100)
    } else {
      discountAmount = Math.min(discount.value, subtotal) // Don't exceed subtotal
    }

    return NextResponse.json({
      valid: true,
      discountType: discount.type,
      discountValue: discount.value,
      discountAmount,
      message:
        discount.type === 'percentage'
          ? `${discount.value}% discount applied!`
          : `$${(discount.value / 100).toFixed(2)} discount applied!`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Discount validation error:', errorMessage, error)
    return NextResponse.json(
      { valid: false, message: 'Failed to validate discount code' },
      { status: 500 }
    )
  }
}
