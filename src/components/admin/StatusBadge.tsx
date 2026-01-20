import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type StatusType = 'fulfilled' | 'processing' | 'unfulfilled' | 'refunded' | 'cancelled' | 'pending' | 'paid'

interface StatusBadgeProps {
  status: StatusType | string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  fulfilled: { variant: 'default', label: 'Fulfilled' },
  paid: { variant: 'default', label: 'Paid' },
  processing: { variant: 'secondary', label: 'Processing' },
  unfulfilled: { variant: 'outline', label: 'Unfulfilled' },
  pending: { variant: 'outline', label: 'Pending' },
  refunded: { variant: 'destructive', label: 'Refunded' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'outline' as const, label: status }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm'
      )}
    >
      {config.label}
    </Badge>
  )
}
