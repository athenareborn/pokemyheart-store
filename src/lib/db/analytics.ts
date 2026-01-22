import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'

export type TimePeriod = 'today' | '7d' | '30d' | '90d'

function getPeriodRange(period: TimePeriod): { startDate: Date; endDate: Date; prevStartDate: Date; prevEndDate: Date } {
  const now = new Date()
  const todayStart = startOfDay(now)

  switch (period) {
    case 'today':
      // Today: midnight today → now
      // Previous: yesterday midnight → yesterday end
      return {
        startDate: todayStart,
        endDate: now,
        prevStartDate: startOfDay(subDays(now, 1)),
        prevEndDate: endOfDay(subDays(now, 1)),
      }
    case '7d':
      return {
        startDate: startOfDay(subDays(now, 6)),
        endDate: now,
        prevStartDate: startOfDay(subDays(now, 13)),
        prevEndDate: endOfDay(subDays(now, 7)),
      }
    case '30d':
      return {
        startDate: startOfDay(subDays(now, 29)),
        endDate: now,
        prevStartDate: startOfDay(subDays(now, 59)),
        prevEndDate: endOfDay(subDays(now, 30)),
      }
    case '90d':
      return {
        startDate: startOfDay(subDays(now, 89)),
        endDate: now,
        prevStartDate: startOfDay(subDays(now, 179)),
        prevEndDate: endOfDay(subDays(now, 90)),
      }
    default:
      return {
        startDate: startOfDay(subDays(now, 6)),
        endDate: now,
        prevStartDate: startOfDay(subDays(now, 13)),
        prevEndDate: endOfDay(subDays(now, 7)),
      }
  }
}

export interface AnalyticsOverview {
  // Key metrics
  revenue: number
  revenueChange: number
  orderCount: number
  orderCountChange: number
  averageOrderValue: number
  aovChange: number
  visitors: number
  visitorsChange: number
  conversionRate: number
  conversionRateChange: number

  // Time series
  revenueByDay: Array<{ date: string; revenue: number }>
  ordersByDay: Array<{ date: string; orders: number }>
  visitorsByDay: Array<{ date: string; visitors: number; sessions: number }>

  // Funnel
  funnel: {
    visitors: number
    productViews: number
    addToCarts: number
    checkouts: number
    purchases: number
  }

  // Breakdowns
  salesByBundle: Array<{ name: string; sales: number; revenue: number }>
  salesByDesign: Array<{ name: string; revenue: number }>
  topLocations: Array<{ location: string; orders: number; revenue: number }>

  // Traffic sources
  trafficSources: Array<{ source: string; sessions: number; conversions: number }>

  // Device breakdown
  deviceBreakdown: Array<{ device: string; sessions: number; percentage: number }>
}

export async function getAnalyticsOverview(period: TimePeriod = '7d'): Promise<AnalyticsOverview> {
  const supabase = await createClient()
  const { startDate, endDate, prevStartDate, prevEndDate } = getPeriodRange(period)

  // Get orders for current period
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get orders for previous period (for comparison)
  const { data: prevOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', prevStartDate.toISOString())
    .lte('created_at', prevEndDate.toISOString())

  // Get sessions for current period
  const { data: sessions } = await supabase
    .from('analytics_sessions')
    .select('*')
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())

  // Get sessions for previous period
  const { data: prevSessions } = await supabase
    .from('analytics_sessions')
    .select('*')
    .gte('started_at', prevStartDate.toISOString())
    .lte('started_at', prevEndDate.toISOString())

  const currentOrders = orders || []
  const previousOrders = prevOrders || []
  const currentSessions = sessions || []
  const previousSessions = prevSessions || []

  // Calculate current period metrics
  const revenue = currentOrders.reduce((sum, o) => sum + o.total, 0)
  const orderCount = currentOrders.length
  const averageOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0
  const visitors = new Set(currentSessions.map(s => s.visitor_id)).size
  const sessionCount = currentSessions.length
  const purchases = currentSessions.filter(s => s.completed_purchase).length
  const conversionRate = sessionCount > 0 ? Math.round((purchases / sessionCount) * 10000) / 100 : 0

  // Calculate previous period metrics
  const prevRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0)
  const prevOrderCount = previousOrders.length
  const prevAOV = prevOrderCount > 0 ? Math.round(prevRevenue / prevOrderCount) : 0
  const prevVisitors = new Set(previousSessions.map(s => s.visitor_id)).size
  const prevPurchases = previousSessions.filter(s => s.completed_purchase).length
  const prevConversionRate = previousSessions.length > 0
    ? Math.round((prevPurchases / previousSessions.length) * 10000) / 100
    : 0

  // Calculate percentage changes
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // Revenue by day
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
  const revenueByDayMap: Record<string, number> = {}
  const ordersByDayMap: Record<string, number> = {}

  dateRange.forEach(date => {
    const key = format(date, 'yyyy-MM-dd')
    revenueByDayMap[key] = 0
    ordersByDayMap[key] = 0
  })

  currentOrders.forEach(order => {
    const key = format(new Date(order.created_at), 'yyyy-MM-dd')
    if (revenueByDayMap[key] !== undefined) {
      revenueByDayMap[key] += order.total
      ordersByDayMap[key] += 1
    }
  })

  // Visitors by day
  const visitorsByDayMap: Record<string, Set<string>> = {}
  const sessionsByDayMap: Record<string, number> = {}

  dateRange.forEach(date => {
    const key = format(date, 'yyyy-MM-dd')
    visitorsByDayMap[key] = new Set()
    sessionsByDayMap[key] = 0
  })

  currentSessions.forEach(session => {
    const key = format(new Date(session.started_at), 'yyyy-MM-dd')
    if (visitorsByDayMap[key]) {
      visitorsByDayMap[key].add(session.visitor_id)
      sessionsByDayMap[key] += 1
    }
  })

  // Funnel metrics
  const funnel = {
    visitors: sessionCount,
    productViews: currentSessions.filter(s => s.viewed_product).length,
    addToCarts: currentSessions.filter(s => s.added_to_cart).length,
    checkouts: currentSessions.filter(s => s.started_checkout).length,
    purchases: purchases,
  }

  // Sales by bundle
  const bundleSales: Record<string, { sales: number; revenue: number }> = {}
  currentOrders.forEach(order => {
    const items = order.items as Array<{ bundle_name: string; price: number; quantity: number }>
    items?.forEach(item => {
      const name = item.bundle_name || 'Unknown'
      if (!bundleSales[name]) {
        bundleSales[name] = { sales: 0, revenue: 0 }
      }
      bundleSales[name].sales += item.quantity || 1
      bundleSales[name].revenue += (item.price || 0) * (item.quantity || 1)
    })
  })

  // Sales by design
  const designSales: Record<string, number> = {}
  currentOrders.forEach(order => {
    const items = order.items as Array<{ design_name: string; price: number; quantity: number }>
    items?.forEach(item => {
      const name = item.design_name || 'Unknown'
      designSales[name] = (designSales[name] || 0) + (item.price || 0) * (item.quantity || 1)
    })
  })

  // Top locations from shipping addresses
  const locationCounts: Record<string, { orders: number; revenue: number }> = {}
  currentOrders.forEach(order => {
    const address = order.shipping_address as { state?: string; country?: string } | null
    const location = address?.state || address?.country || 'Unknown'
    if (!locationCounts[location]) {
      locationCounts[location] = { orders: 0, revenue: 0 }
    }
    locationCounts[location].orders += 1
    locationCounts[location].revenue += order.total
  })

  // Traffic sources breakdown
  const sourceCounts: Record<string, { sessions: number; conversions: number }> = {}
  currentSessions.forEach(session => {
    const source = session.utm_source || (session.referrer ? new URL(session.referrer).hostname : null) || 'Direct'
    if (!sourceCounts[source]) {
      sourceCounts[source] = { sessions: 0, conversions: 0 }
    }
    sourceCounts[source].sessions += 1
    if (session.completed_purchase) {
      sourceCounts[source].conversions += 1
    }
  })

  // Device breakdown
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 }
  currentSessions.forEach(session => {
    const device = session.device_type || 'desktop'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })
  const totalDeviceSessions = Object.values(deviceCounts).reduce((a, b) => a + b, 0)

  return {
    revenue,
    revenueChange: calcChange(revenue, prevRevenue),
    orderCount,
    orderCountChange: calcChange(orderCount, prevOrderCount),
    averageOrderValue,
    aovChange: calcChange(averageOrderValue, prevAOV),
    visitors,
    visitorsChange: calcChange(visitors, prevVisitors),
    conversionRate,
    conversionRateChange: calcChange(conversionRate, prevConversionRate),

    revenueByDay: Object.entries(revenueByDayMap).map(([date, revenue]) => ({
      date: format(new Date(date), period === 'today' ? 'HH:mm' : 'MMM d'),
      revenue,
    })),

    ordersByDay: Object.entries(ordersByDayMap).map(([date, orders]) => ({
      date: format(new Date(date), period === 'today' ? 'HH:mm' : 'MMM d'),
      orders,
    })),

    visitorsByDay: Object.entries(visitorsByDayMap).map(([date, visitorSet]) => ({
      date: format(new Date(date), period === 'today' ? 'HH:mm' : 'MMM d'),
      visitors: visitorSet.size,
      sessions: sessionsByDayMap[date] || 0,
    })),

    funnel,

    salesByBundle: Object.entries(bundleSales)
      .map(([name, data]) => ({ name, sales: data.sales, revenue: data.revenue }))
      .sort((a, b) => b.revenue - a.revenue),

    salesByDesign: Object.entries(designSales)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue),

    topLocations: Object.entries(locationCounts)
      .map(([location, data]) => ({ location, orders: data.orders, revenue: data.revenue }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5),

    trafficSources: Object.entries(sourceCounts)
      .map(([source, data]) => ({ source, sessions: data.sessions, conversions: data.conversions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5),

    deviceBreakdown: Object.entries(deviceCounts)
      .map(([device, sessions]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        sessions,
        percentage: totalDeviceSessions > 0 ? Math.round((sessions / totalDeviceSessions) * 100) : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions),
  }
}

export async function getTodayMetrics() {
  const supabase = await createClient()
  const now = new Date()
  const todayStart = startOfDay(now)
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

  // Get today's orders
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', todayStart.toISOString())

  // Get active sessions (started in last 30 minutes)
  const { data: activeSessions } = await supabase
    .from('analytics_sessions')
    .select('id')
    .gte('started_at', thirtyMinutesAgo.toISOString())

  // Get today's sessions for hourly breakdown
  const { data: todaySessions } = await supabase
    .from('analytics_sessions')
    .select('started_at')
    .gte('started_at', todayStart.toISOString())

  const ordersToday = todayOrders?.length || 0
  const revenueToday = todayOrders?.reduce((sum, o) => sum + o.total, 0) || 0
  const activeVisitors = activeSessions?.length || 0
  const sessionsToday = todaySessions?.length || 0

  // Calculate hourly breakdown
  const hourlyData: Record<number, number> = {}
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = 0
  }
  todaySessions?.forEach(session => {
    const hour = new Date(session.started_at).getHours()
    hourlyData[hour] = (hourlyData[hour] || 0) + 1
  })

  const sessionsByHour = Object.entries(hourlyData)
    .map(([hour, sessions]) => ({
      hour: parseInt(hour),
      label: `${hour.toString().padStart(2, '0')}:00`,
      sessions,
    }))
    .filter(h => h.hour <= now.getHours()) // Only show hours up to current time

  return {
    ordersToday,
    revenueToday,
    activeVisitors,
    sessionsToday,
    sessionsByHour,
  }
}
