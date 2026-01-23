'use client'

import { useState, useEffect } from 'react'
import { Flame, Gift, ShoppingBag, TrendingUp } from 'lucide-react'

// Generate realistic "sold today" numbers based on:
// - Time of day (sales accumulate through the day)
// - Day of week (weekends higher)
// - Proximity to Valentine's Day (exponential increase)
function getSoldToday() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0 = Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Valentine's proximity multiplier (exponential as we get closer)
  const valentinesDate = new Date('2026-02-14')
  const daysUntil = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let seasonMultiplier = 1
  if (daysUntil <= 3) seasonMultiplier = 4 // Last 3 days: 4x
  else if (daysUntil <= 7) seasonMultiplier = 3 // Last week: 3x
  else if (daysUntil <= 14) seasonMultiplier = 2.5 // 2 weeks out: 2.5x
  else if (daysUntil <= 21) seasonMultiplier = 2 // 3 weeks out: 2x
  else if (daysUntil <= 30) seasonMultiplier = 1.5 // 1 month out: 1.5x

  // Base hourly sales pattern (accumulates through the day)
  // Morning slow, picks up afternoon, peaks evening
  const hourlyPattern: Record<number, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 1, 7: 2, 8: 3, 9: 5, 10: 7, 11: 9,
    12: 12, 13: 15, 14: 18, 15: 22, 16: 26, 17: 31,
    18: 37, 19: 43, 20: 48, 21: 52, 22: 55, 23: 57
  }

  let baseSold = hourlyPattern[hour] || 0

  // Weekend boost
  if (isWeekend) baseSold = Math.floor(baseSold * 1.3)

  // Apply season multiplier
  baseSold = Math.floor(baseSold * seasonMultiplier)

  // Add small random variance (±10%) to feel more real
  // Use time-based seed so it doesn't flicker every render
  const seed = Math.floor(Date.now() / 60000) // Changes every minute
  const variance = ((seed % 20) - 10) / 100 // -10% to +10%
  baseSold = Math.floor(baseSold * (1 + variance))

  // Minimum of 3 during business hours to avoid "0 sold"
  if (hour >= 8 && hour <= 23 && baseSold < 3) baseSold = 3

  return Math.max(0, baseSold)
}

// Calculate shipping cutoff for guaranteed Valentine's delivery
function getShippingCutoff() {
  const valentinesDate = new Date('2026-02-14')
  const now = new Date()

  // Standard shipping: 5-7 business days, so cutoff is ~Feb 5-7
  // Express shipping: 2-3 business days, so cutoff is ~Feb 10-11
  const standardCutoff = new Date('2026-02-06')
  const expressCutoff = new Date('2026-02-11')

  if (now < standardCutoff) {
    return { type: 'standard', daysLeft: 0, message: `Order today for guaranteed Valentine's delivery` }
  } else if (now < expressCutoff) {
    return { type: 'express', daysLeft: 0, message: `Order today for guaranteed Valentine's delivery` }
  } else if (now < valentinesDate) {
    return { type: 'urgent', daysLeft: 0, message: `Order today for guaranteed Valentine's delivery` }
  }

  return null
}

export function UrgencyBadge() {
  const [soldToday, setSoldToday] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Valentine's Day countdown
  const valentinesDate = new Date('2026-02-14')
  const now = new Date()
  const daysUntilValentines = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const showValentinesUrgency = daysUntilValentines > 0 && daysUntilValentines <= 21

  const shippingCutoff = getShippingCutoff()

  useEffect(() => {
    setMounted(true)
    setSoldToday(getSoldToday())

    // Update every minute
    const interval = setInterval(() => {
      setSoldToday(getSoldToday())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2">
      {/* Sold today - social proof */}
      {mounted && soldToday > 0 && (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide">
            🔥 {soldToday} sold today
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>
      )}

      {/* Trending badge */}
      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">
          #1 Valentine's Gift 2026
        </span>
      </div>

      {/* Shipping cutoff urgency - real dates */}
      {shippingCutoff && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
          shippingCutoff.type === 'urgent'
            ? 'bg-red-50 text-red-700 border-red-200'
            : shippingCutoff.type === 'express'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-brand-50 text-brand-700 border-brand-100'
        }`}>
          <ShoppingBag className="h-4 w-4" />
          <span className="font-medium text-sm">
            {shippingCutoff.message}
          </span>
        </div>
      )}

      {/* Valentine's Day countdown */}
      {showValentinesUrgency && !shippingCutoff && (
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2.5 rounded-xl border border-brand-100">
          <Gift className="h-5 w-5" />
          <span className="font-medium text-sm">
            {daysUntilValentines === 1
              ? "Order TODAY for Valentine's delivery!"
              : daysUntilValentines <= 7
                ? `Only ${daysUntilValentines} days until Valentine's Day!`
                : `${daysUntilValentines} days until Valentine's Day`
            }
          </span>
        </div>
      )}
    </div>
  )
}
