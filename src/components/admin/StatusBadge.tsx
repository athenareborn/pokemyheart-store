import { cn } from '@/lib/utils'

type StatusType = 'fulfilled' | 'processing' | 'unfulfilled' | 'refunded' | 'cancelled' | 'pending'

interface StatusBadgeProps {
  status: StatusType | string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  fulfilled: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Fulfilled',
  },
  processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Processing',
  },
  unfulfilled: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Unfulfilled',
  },
  pending: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    label: 'Pending',
  },
  refunded: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Refunded',
  },
  cancelled: {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'Cancelled',
  },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
