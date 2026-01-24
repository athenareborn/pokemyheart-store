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
    .select('*', { count: 'exact' })
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

  // First check if already fulfilled to preserve original fulfilled_at
  const { data: existing } = await supabase
    .from('orders')
    .select('fulfilled_at')
    .eq('id', id)
    .single()

  const updates: { tracking_number: string; status: string; fulfilled_at?: string } = {
    tracking_number: trackingNumber,
    status: 'fulfilled',
  }

  // Only set fulfilled_at if not already set
  if (!existing?.fulfilled_at) {
    updates.fulfilled_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
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

  // Use parallel queries with SQL aggregation instead of loading all orders
  const [totalsResult, unfulfilledResult, processingResult, fulfilledResult] = await Promise.all([
    supabase.from('orders').select('total.sum(), id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'unfulfilled'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'fulfilled'),
  ])

  const orderCount = totalsResult.count ?? 0
  const revenue = totalsResult.data?.[0]?.sum ?? 0
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0

  return {
    revenue,
    orderCount,
    averageOrderValue,
    unfulfilled: unfulfilledResult.count ?? 0,
    processing: processingResult.count ?? 0,
    fulfilled: fulfilledResult.count ?? 0,
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
