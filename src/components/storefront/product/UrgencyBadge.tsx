'use client'

import { Flame, Gift, Sparkles } from 'lucide-react'

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
      <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl border border-red-100">
        <Flame className="h-5 w-5 animate-pulse text-orange-500" />
        <span className="font-medium text-sm">
          Selling Fast! Only <span className="font-bold">{stockCount}</span> left in stock
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

      {/* Limited edition badge */}
      <div className="inline-flex items-center gap-2 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold">Limited Edition Collectible</span>
      </div>
    </div>
  )
}
