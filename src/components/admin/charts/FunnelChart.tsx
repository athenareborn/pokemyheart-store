'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FunnelData {
  visitors: number
  productViews: number
  addToCarts: number
  checkouts: number
  purchases: number
}

interface FunnelChartProps {
  data: FunnelData
}

const stages = [
  { key: 'visitors', label: 'Visitors' },
  { key: 'productViews', label: 'Product Views' },
  { key: 'addToCarts', label: 'Add to Cart' },
  { key: 'checkouts', label: 'Checkout' },
  { key: 'purchases', label: 'Purchase' },
] as const

export function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(data.visitors, 1)

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const value = data[stage.key]
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
            const prevValue = index > 0 ? data[stages[index - 1].key] : value
            const dropoff = prevValue > 0 ? Math.round((1 - value / prevValue) * 100) : 0

            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{value.toLocaleString()}</span>
                    {index > 0 && dropoff > 0 && (
                      <span className="text-xs text-muted-foreground">
                        -{dropoff}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Conversion rate summary */}
        {data.visitors > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Conversion</span>
              <span className="text-sm font-semibold">
                {((data.purchases / data.visitors) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
