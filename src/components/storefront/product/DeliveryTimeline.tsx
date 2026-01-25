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
      <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  )
}

export function DeliveryTimeline({ className }: DeliveryTimelineProps) {
  const steps = useMemo(buildSteps, [])

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-4 sm:p-5', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Estimated timeline
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:hidden">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              <p className="text-xs text-gray-500">{step.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden sm:grid items-center grid-cols-[1fr_96px_1fr_96px_1fr] gap-4">
        <TimelineStepItem {...steps[0]} />
        <div className="h-1 w-full rounded-full bg-black/90" aria-hidden="true" />
        <TimelineStepItem {...steps[1]} />
        <div className="h-1 w-full rounded-full bg-black/90" aria-hidden="true" />
        <TimelineStepItem {...steps[2]} />
      </div>

      <p className="mt-3 text-[11px] text-gray-400">
        Standard shipping estimates. Exact delivery may vary.
      </p>
    </div>
  )
}
