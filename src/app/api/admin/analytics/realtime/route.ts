import { NextResponse } from 'next/server'
import { getTodayMetrics } from '@/lib/db/analytics'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const metrics = await getTodayMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching realtime metrics:', error)
    return NextResponse.json(
      { ordersToday: 0, revenueToday: 0 },
      { status: 200 }
    )
  }
}
