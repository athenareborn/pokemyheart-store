'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
    <div className={cn('bg-white rounded-lg border border-slate-200 p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2 bg-slate-100 rounded-lg">
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
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          {change.trend === 'neutral' && (
            <Minus className="h-3 w-3 text-slate-400" />
          )}
          <span className={cn(
            'text-xs font-medium',
            change.trend === 'up' && 'text-emerald-600',
            change.trend === 'down' && 'text-red-600',
            change.trend === 'neutral' && 'text-slate-500'
          )}>
            {change.value}
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  )
}
