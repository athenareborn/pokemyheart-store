'use client'

import { cn } from '@/lib/utils'

interface MiniChartProps {
  data: number[]
  height?: number
  color?: 'emerald' | 'blue' | 'rose' | 'amber'
  className?: string
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
}

export function MiniChart({ data, height = 32, color = 'emerald', className }: MiniChartProps) {
  if (!data.length) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div
      className={cn('flex items-end gap-0.5', className)}
      style={{ height }}
    >
      {data.map((value, index) => {
        const normalizedHeight = ((value - min) / range) * 100
        const barHeight = Math.max(normalizedHeight, 10) // Minimum 10% height

        return (
          <div
            key={index}
            className={cn(
              'flex-1 rounded-sm transition-all',
              colorClasses[color],
              index === data.length - 1 ? 'opacity-100' : 'opacity-40'
            )}
            style={{ height: `${barHeight}%` }}
          />
        )
      })}
    </div>
  )
}

// Sparkline variant
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({ data, width = 80, height = 24, color = '#10b981', className }: SparklineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
