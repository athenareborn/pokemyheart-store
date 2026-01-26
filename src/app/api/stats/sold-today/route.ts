import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = await createClient()

    // Get start of today (UTC)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Count orders created today
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    if (error) {
      console.error('Error fetching sold today:', error)
      return NextResponse.json({ soldToday: 0 })
    }

    return NextResponse.json({
      soldToday: count || 0,
      asOf: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in sold-today API:', error)
    return NextResponse.json({ soldToday: 0 })
  }
}
