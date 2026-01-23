'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Generate realistic "sold today" numbers
function getSoldToday() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const valentinesDate = new Date('2026-02-14')
  const daysUntil = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let seasonMultiplier = 1
  if (daysUntil <= 3) seasonMultiplier = 4
  else if (daysUntil <= 7) seasonMultiplier = 3
  else if (daysUntil <= 14) seasonMultiplier = 2.5
  else if (daysUntil <= 21) seasonMultiplier = 2
  else if (daysUntil <= 30) seasonMultiplier = 1.5

  const hourlyPattern: Record<number, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 1, 7: 2, 8: 3, 9: 5, 10: 7, 11: 9,
    12: 12, 13: 15, 14: 18, 15: 22, 16: 26, 17: 31,
    18: 37, 19: 43, 20: 48, 21: 52, 22: 55, 23: 57
  }

  let baseSold = hourlyPattern[hour] || 0
  if (isWeekend) baseSold = Math.floor(baseSold * 1.3)
  baseSold = Math.floor(baseSold * seasonMultiplier)

  const seed = Math.floor(Date.now() / 60000)
  const variance = ((seed % 20) - 10) / 100
  baseSold = Math.floor(baseSold * (1 + variance))

  if (hour >= 8 && hour <= 23 && baseSold < 3) baseSold = 3

  return Math.max(0, baseSold)
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

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center gap-2"
    >
      {/* Sold today - main urgency indicator */}
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
        <span>{soldToday} sold today</span>
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
        <span>Valentine's delivery guaranteed</span>
      </div>
    </motion.div>
  )
}
