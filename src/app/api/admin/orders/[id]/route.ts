import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendShippingNotification } from '@/lib/email'
import type { Order, OrderStatus } from '@/lib/supabase/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch single order by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update order (status, tracking, fulfillment)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      status,
      trackingNumber,
      sendNotification = false
    } = body as {
      status?: OrderStatus
      trackingNumber?: string
      sendNotification?: boolean
    }

    const supabase = createAdminClient()

    // First, get the current order to check its state
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Build the update object
    const updates: Partial<Order> = {}

    if (status) {
      updates.status = status

      // Set fulfilled_at timestamp when marking as fulfilled or shipped
      if ((status === 'fulfilled' || status === 'shipped') && !currentOrder.fulfilled_at) {
        updates.fulfilled_at = new Date().toISOString()
      }
    }

    if (trackingNumber !== undefined) {
      updates.tracking_number = trackingNumber

      // If tracking is added and status isn't explicitly set, mark as fulfilled
      if (!status && currentOrder.status === 'unfulfilled') {
        updates.status = 'fulfilled'
        updates.fulfilled_at = new Date().toISOString()
      }
    }

    // Perform the update
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Send shipping notification email if requested and tracking number exists
    if (sendNotification && updatedOrder.tracking_number) {
      try {
        await sendShippingNotification({
          orderNumber: updatedOrder.order_number,
          customerEmail: updatedOrder.customer_email,
          customerName: updatedOrder.customer_name,
          trackingNumber: updatedOrder.tracking_number,
        })
      } catch (emailError) {
        console.error('Error sending shipping notification:', emailError)
        // Don't fail the request if email fails, just log it
      }
    }

    return NextResponse.json({
      order: updatedOrder,
      emailSent: sendNotification && !!updatedOrder.tracking_number
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
