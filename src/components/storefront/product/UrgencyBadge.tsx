'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function UrgencyBadge() {
  const [soldToday, setSoldToday] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Fetch real sales data
    const fetchSoldToday = async () => {
      try {
        const res = await fetch('/api/stats/sold-today')
        const data = await res.json()
        setSoldToday(data.soldToday)
      } catch (error) {
        console.error('Failed to fetch sold today:', error)
        setSoldToday(0)
      }
    }

    fetchSoldToday()

    // Refresh every 2 minutes
    const interval = setInterval(fetchSoldToday, 120000)
    return () => clearInterval(interval)
  }, [])

  // Reserve space to prevent CLS
  if (!mounted) {
    return <div className="h-[36px]" aria-hidden="true" />
  }

  // Don't show while loading
  if (soldToday === null) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="inline-flex items-center gap-2 bg-gray-900 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-sm font-medium">
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
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
    </motion.div>
  )
}
