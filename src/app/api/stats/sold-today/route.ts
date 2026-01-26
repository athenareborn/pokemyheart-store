import { NextResponse } from 'next/server'

export const revalidate = 60 // Cache for 60 seconds

// Server-side "sold today" calculation - not visible to client
function getSoldToday() {
  const now = new Date()
  const hour = now.getUTCHours()
  const dayOfWeek = now.getUTCDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const valentinesDate = new Date('2026-02-14')
  const daysUntil = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Modest Valentine's multipliers
  let seasonMultiplier = 1.0
  if (daysUntil <= 3) seasonMultiplier = 1.6
  else if (daysUntil <= 7) seasonMultiplier = 1.4
  else if (daysUntil <= 14) seasonMultiplier = 1.25
  else if (daysUntil <= 30) seasonMultiplier = 1.1

  // Realistic base numbers - builds throughout day
  const hourlyPattern: Record<number, number> = {
    0: 8, 1: 8, 2: 9, 3: 9, 4: 10, 5: 11,
    6: 13, 7: 16, 8: 19, 9: 23, 10: 27, 11: 31,
    12: 35, 13: 39, 14: 43, 15: 47, 16: 51, 17: 55,
    18: 58, 19: 62, 20: 65, 21: 68, 22: 71, 23: 74
  }

  let baseSold = hourlyPattern[hour] || 12
  if (isWeekend) baseSold = Math.floor(baseSold * 1.15)
  baseSold = Math.floor(baseSold * seasonMultiplier)

  // Add some variance so it doesn't look static
  const seed = Math.floor(Date.now() / 60000)
  const variance = ((seed % 10) - 5) / 100
  baseSold = Math.floor(baseSold * (1 + variance))

  // Range: ~8-85 depending on time/season
  return Math.max(8, Math.min(baseSold, 89))
}

export async function GET() {
  return NextResponse.json({
    soldToday: getSoldToday(),
    asOf: new Date().toISOString()
  })
}
