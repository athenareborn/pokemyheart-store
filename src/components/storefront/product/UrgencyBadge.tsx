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
      {/* Stock urgency */}
      <div className="inline-flex items-center gap-1.5 text-orange-600">
        <Flame className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-bold">
          Selling Fast! Only {stockCount} left
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
