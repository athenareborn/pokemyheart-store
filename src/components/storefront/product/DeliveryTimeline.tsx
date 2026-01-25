'use client'

import { useMemo } from 'react'
import { ShoppingBag, Truck, MapPin } from 'lucide-react'
import { addBusinessDays, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DeliveryTimelineProps {
  className?: string
}

interface TimelineStep {
  id: string
  label: string
  date: string
  icon: typeof ShoppingBag
}

function buildSteps(): TimelineStep[] {
  const today = new Date()
  const orderedDate = format(today, 'MMM d')

  const readyStart = addBusinessDays(today, 1)
  const readyEnd = addBusinessDays(today, 2)
  const deliveredStart = addBusinessDays(today, 5)
  const deliveredEnd = addBusinessDays(today, 7)

  return [
    {
      id: 'ordered',
      label: 'Ordered',
      date: orderedDate,
      icon: ShoppingBag,
    },
    {
      id: 'ready',
      label: 'Order Ready',
      date: `${format(readyStart, 'MMM d')} - ${format(readyEnd, 'MMM d')}`,
      icon: Truck,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      date: `${format(deliveredStart, 'MMM d')} - ${format(deliveredEnd, 'MMM d')}`,
      icon: MapPin,
    },
  ]
}

function TimelineStepItem({ label, date, icon: Icon }: TimelineStep) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-200/70 ring-4 ring-brand-100">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-900">{label}</p>
      <p className="text-xs text-brand-700/80">{date}</p>
    </div>
  )
}

export function DeliveryTimeline({ className }: DeliveryTimelineProps) {
  const steps = useMemo(buildSteps, [])
  const deliveredRange = steps[2]?.date || ''

  return (
    <div className={cn('rounded-2xl border border-brand-100 bg-brand-50/70 p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          Estimated delivery
        </p>
        <span className="rounded-full border border-brand-200 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
          Ships in 24h
        </span>
      </div>

      <div className="mt-4 sm:hidden">
        <div className="relative">
          <div className="absolute left-6 right-6 top-5 h-0.5 rounded-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" aria-hidden="true" />
          <div className="grid grid-cols-3 gap-2 text-center">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-200/70 ring-4 ring-brand-100">
                  <step.icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-brand-900 leading-tight">
                  {step.label}
                </p>
                <p className="text-[10px] text-brand-700/80 leading-tight">
                  {step.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 hidden sm:grid items-center grid-cols-[1fr_96px_1fr_96px_1fr] gap-4">
        <TimelineStepItem {...steps[0]} />
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" aria-hidden="true" />
        <TimelineStepItem {...steps[1]} />
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" aria-hidden="true" />
        <TimelineStepItem {...steps[2]} />
      </div>

      <p className="mt-3 text-[11px] text-brand-700/70">
        Order today, estimated delivery {deliveredRange}. Standard shipping estimates.
      </p>
    </div>
  )
}
