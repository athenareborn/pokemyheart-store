import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsOverview(days = 7) {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get orders in date range
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())

  if (!orders) {
    return {
      revenue: 0,
      orderCount: 0,
      averageOrderValue: 0,
      revenueByDay: [],
      salesByBundle: [],
      salesByDesign: [],
    }
  }

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const orderCount = orders.length
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0

  // Revenue by day
  const revenueByDay: Record<string, number> = {}
  orders.forEach(order => {
    const day = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    revenueByDay[day] = (revenueByDay[day] || 0) + order.total
  })

  // Sales by bundle
  const bundleSales: Record<string, { sales: number; revenue: number }> = {}
  orders.forEach(order => {
    const items = order.items as Array<{ bundle_name: string; price: number; quantity: number }>
    items.forEach(item => {
      if (!bundleSales[item.bundle_name]) {
        bundleSales[item.bundle_name] = { sales: 0, revenue: 0 }
      }
      bundleSales[item.bundle_name].sales += item.quantity
      bundleSales[item.bundle_name].revenue += item.price * item.quantity
    })
  })

  // Sales by design
  const designSales: Record<string, number> = {}
  orders.forEach(order => {
    const items = order.items as Array<{ design_name: string; price: number; quantity: number }>
    items.forEach(item => {
      designSales[item.design_name] = (designSales[item.design_name] || 0) + item.price * item.quantity
    })
  })

  return {
    revenue,
    orderCount,
    averageOrderValue,
    revenueByDay: Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue })),
    salesByBundle: Object.entries(bundleSales).map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: data.revenue,
    })),
    salesByDesign: Object.entries(designSales).map(([name, revenue]) => ({ name, revenue })),
  }
}

export async function trackEvent(eventType: string, eventData?: Record<string, unknown>, sessionId?: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    event_data: eventData,
    session_id: sessionId,
  })

  if (error) {
    console.error('Error tracking event:', error)
  }
}
