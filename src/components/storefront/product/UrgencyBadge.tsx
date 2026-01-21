'use client'

import { Flame, Gift } from 'lucide-react'

interface UrgencyBadgeProps {
  stockCount: number
}

export function UrgencyBadge({ stockCount }: UrgencyBadgeProps) {
  // Valentine's Day countdown
  const valentinesDate = new Date('2026-02-14')
  const now = new Date()
  const daysUntilValentines = Math.ceil((valentinesDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const showValentinesUrgency = daysUntilValentines > 0 && daysUntilValentines <= 21

  return (
    <div className="space-y-2">
      {/* Stock urgency - flashing animation */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
        <Flame className="h-5 w-5 animate-bounce" />
        <span className="text-sm font-bold tracking-wide">
          🔥 Selling Fast! Only {stockCount} left
        </span>
      </div>

      {/* Valentine's Day urgency */}
      {showValentinesUrgency && (
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
