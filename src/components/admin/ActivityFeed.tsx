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

const activityIcons: Record<ActivityType, { icon: React.ElementType; className: string }> = {
  order: { icon: Package, className: 'text-blue-600 bg-blue-100' },
  customer: { icon: UserPlus, className: 'text-emerald-600 bg-emerald-100' },
  payment: { icon: CreditCard, className: 'text-purple-600 bg-purple-100' },
  fulfillment: { icon: Truck, className: 'text-amber-600 bg-amber-100' },
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {activities.map((activity) => {
        const config = activityIcons[activity.type]
        const Icon = config.icon

        return (
          <div key={activity.id} className="flex gap-2.5">
            <div className={cn('p-1.5 rounded-md h-fit', config.className)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
