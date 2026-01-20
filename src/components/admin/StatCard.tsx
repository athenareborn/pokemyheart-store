import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          {icon && (
            <div className="p-2 bg-muted rounded-md">
              {icon}
            </div>
          )}
        </div>
        {change && (
          <div className="mt-3 flex items-center gap-1">
            {change.trend === 'up' && (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            )}
            {change.trend === 'down' && (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={cn(
              'text-xs font-medium',
              change.trend === 'up' && 'text-emerald-600',
              change.trend === 'down' && 'text-destructive',
              change.trend === 'neutral' && 'text-muted-foreground'
            )}>
              {change.value}
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
