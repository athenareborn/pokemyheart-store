'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Generate believable "sold today" numbers
function getSoldToday() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
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

export function UrgencyBadge() {
  const [soldToday, setSoldToday] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSoldToday(getSoldToday())

    const interval = setInterval(() => {
      setSoldToday(getSoldToday())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Reserve space to prevent CLS (Cumulative Layout Shift)
  if (!mounted) {
    return <div className="h-[36px]" aria-hidden="true" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center gap-2"
    >
      {/* Selling Fast badge */}
      <div className="inline-flex items-center gap-2 bg-gray-900 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-sm font-medium">
        {/* Animated fire icon */}
        <motion.span
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="text-base"
        >
          🔥
        </motion.span>
        <span>Selling Fast · {soldToday} sold today</span>
        {/* Live pulse */}
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>

      {/* Delivery guarantee */}
      <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Order today for guaranteed Valentine's delivery</span>
      </div>
    </motion.div>
  )
}
