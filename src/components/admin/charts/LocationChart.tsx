'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface LocationChartProps {
  data: Array<{ location: string; orders: number; revenue: number }>
}

export function LocationChart({ data }: LocationChartProps) {
  const maxOrders = Math.max(...data.map(d => d.orders), 1)

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">Top Locations</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = (item.orders / maxOrders) * 100

              return (
                <div key={item.location}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {index + 1}. {item.location}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {item.orders} orders
                      </span>
                      <span className="text-sm font-semibold">{formatPrice(item.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
