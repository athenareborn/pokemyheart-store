'use client'

import { Flame } from 'lucide-react'

interface UrgencyBadgeProps {
  stockCount: number
}

export function UrgencyBadge({ stockCount }: UrgencyBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
      <Flame className="h-5 w-5 animate-pulse" />
      <span className="font-medium">
        Selling Fast! Only <span className="font-bold">{stockCount}</span> pieces left!
      </span>
    </div>
  )
}
