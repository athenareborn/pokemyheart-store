import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, updateOrderTracking } from '@/lib/db/orders'
import type { OrderStatus } from '@/lib/supabase/types'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, trackingNumber } = body as {
      orderId: string
      status?: OrderStatus
      trackingNumber?: string
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // If tracking number is provided, update tracking (which also sets status to fulfilled)
    if (trackingNumber) {
      const { order, error } = await updateOrderTracking(orderId, trackingNumber)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update order tracking' },
          { status: 500 }
        )
      }

      return NextResponse.json({ order })
    }

    // Otherwise, just update status
    if (status) {
      const { order, error } = await updateOrderStatus(orderId, status)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        )
      }

      return NextResponse.json({ order })
    }

    return NextResponse.json(
      { error: 'Status or tracking number is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
