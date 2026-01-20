'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const ANNOUNCEMENTS = [
  'ORDER NOW FOR FREE SHIPPING ON $35+ TODAY ONLY',
  'VALENTINE\'S DAY SPECIAL - LIMITED STOCK REMAINING',
  'PREMIUM HOLOGRAPHIC CARDS - HANDCRAFTED WITH LOVE',
]

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-brand-500 text-white py-2 px-4 text-center text-sm font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <span className="animate-pulse">{ANNOUNCEMENTS[currentIndex]}</span>
        <Link
          href="/products/i-choose-you-the-ultimate-valentines-gift"
          className="bg-white text-brand-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-brand-100 transition-colors"
        >
          Shop now!
        </Link>
      </div>
    </div>
  )
}
