'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TimePeriodSelectorProps {
  currentPeriod: string
}

export function TimePeriodSelector({ currentPeriod }: TimePeriodSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', e.target.value)
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      value={currentPeriod}
      onChange={handleChange}
      className="text-sm border rounded-md px-3 py-1.5 bg-white"
    >
      <option value="24h">Last 24 hours</option>
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
    </select>
  )
}

interface RealtimeIndicatorProps {
  initialActiveVisitors: number
}

export function RealtimeIndicator({ initialActiveVisitors }: RealtimeIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-muted-foreground">
        {initialActiveVisitors} active now
      </span>
    </div>
  )
}
