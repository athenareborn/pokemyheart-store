'use client'

import { Package, UserPlus, CreditCard, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

type ActivityType = 'order' | 'customer' | 'payment' | 'fulfillment'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  time: string
}

interface ActivityFeedProps {
  activities: Activity[]
  className?: string
}

const activityIcons: Record<ActivityType, { icon: React.ElementType; bg: string; color: string }> = {
  order: { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600' },
  customer: { icon: UserPlus, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  payment: { icon: CreditCard, bg: 'bg-purple-100', color: 'text-purple-600' },
  fulfillment: { icon: Truck, bg: 'bg-amber-100', color: 'text-amber-600' },
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => {
        const config = activityIcons[activity.type]
        const Icon = config.icon

        return (
          <div key={activity.id} className="flex gap-3">
            <div className={cn('p-2 rounded-lg h-fit', config.bg)}>
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
              <p className="text-xs text-slate-500 truncate">{activity.description}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
