import { createClient } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@/lib/supabase/types'

export async function getOrders(options?: {
  status?: OrderStatus
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], count: 0, error }
  }

  return { orders: data as Order[], count, error: null }
}

export async function getOrderById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return { order: null, error }
  }

  return { order: data as Order, error: null }
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return { order: null, error }
  }

  return { order: data as Order, error: null }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient()

  const updates: Partial<Order> = { status }
  if (status === 'fulfilled') {
    updates.fulfilled_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    return { order: null, error }
  }

  return { order: data as Order, error: null }
}

export async function updateOrderTracking(id: string, trackingNumber: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({
      tracking_number: trackingNumber,
      status: 'fulfilled',
      fulfilled_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tracking:', error)
    return { order: null, error }
  }

  return { order: data as Order, error: null }
}

export async function getOrderStats() {
  const supabase = await createClient()

  // Get total revenue and order count
  const { data: orders } = await supabase
    .from('orders')
    .select('total, status, created_at')

  if (!orders) return { revenue: 0, orderCount: 0, averageOrderValue: 0 }

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const orderCount = orders.length
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0

  const unfulfilled = orders.filter(o => o.status === 'unfulfilled').length
  const processing = orders.filter(o => o.status === 'processing').length
  const fulfilled = orders.filter(o => o.status === 'fulfilled').length

  return {
    revenue,
    orderCount,
    averageOrderValue,
    unfulfilled,
    processing,
    fulfilled,
  }
}

export async function getRecentOrders(limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }

  return data as Order[]
}
