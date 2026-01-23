'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Generate high-urgency "sold today" numbers
function getSoldToday() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const valentinesDate = new Date('2026-02-14')
  const daysUntil = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Aggressive Valentine's multipliers
  let seasonMultiplier = 1.5
  if (daysUntil <= 3) seasonMultiplier = 6
  else if (daysUntil <= 7) seasonMultiplier = 5
  else if (daysUntil <= 14) seasonMultiplier = 4
  else if (daysUntil <= 21) seasonMultiplier = 3
  else if (daysUntil <= 30) seasonMultiplier = 2.5

  // Higher base numbers - cumulative throughout the day
  const hourlyPattern: Record<number, number> = {
    0: 18, 1: 19, 2: 20, 3: 21, 4: 22, 5: 24,
    6: 28, 7: 34, 8: 42, 9: 52, 10: 64, 11: 78,
    12: 94, 13: 112, 14: 132, 15: 154, 16: 178, 17: 204,
    18: 232, 19: 262, 20: 294, 21: 328, 22: 364, 23: 402
  }

  let baseSold = hourlyPattern[hour] || 18
  if (isWeekend) baseSold = Math.floor(baseSold * 1.4)
  baseSold = Math.floor(baseSold * seasonMultiplier)

  // Add some variance so it doesn't look static
  const seed = Math.floor(Date.now() / 60000)
  const variance = ((seed % 15) - 7) / 100
  baseSold = Math.floor(baseSold * (1 + variance))

  // Minimum 18 at any hour
  return Math.max(18, baseSold)
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
