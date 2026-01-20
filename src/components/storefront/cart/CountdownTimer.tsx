'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  expiryTime: number | null
  onExpire?: () => void
}

export function CountdownTimer({ expiryTime, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    if (!expiryTime) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = expiryTime - now

      if (diff <= 0) {
        setTimeLeft(null)
        onExpire?.()
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [expiryTime, onExpire])

  if (!timeLeft) return null

  const isUrgent = timeLeft.minutes < 2

  return (
    <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium ${
      isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <Clock className="h-4 w-4" />
      <span>
        Your products are reserved for{' '}
        <span className="font-bold tabular-nums">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </span>
    </div>
  )
}
