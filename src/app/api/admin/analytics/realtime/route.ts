import { NextResponse } from 'next/server'
import { getTodayMetrics } from '@/lib/db/analytics'
import { getAdminUser } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getAdminUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics = await getTodayMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching realtime metrics:', error)
    return NextResponse.json(
      { ordersToday: 0, revenueToday: 0, activeVisitors: 0, sessionsToday: 0, sessionsByHour: [] },
      { status: 200 }
    )
  }
}
