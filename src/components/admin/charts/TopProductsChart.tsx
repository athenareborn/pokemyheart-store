'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

type BundleItem = { name: string; sales: number; revenue: number }
type DesignItem = { name: string; revenue: number }

interface TopProductsChartProps {
  bundles: BundleItem[]
  designs: DesignItem[]
}

export function TopProductsChart({ bundles, designs }: TopProductsChartProps) {
  const [view, setView] = useState<'bundles' | 'designs'>('bundles')

  const maxRevenue = view === 'bundles'
    ? Math.max(...bundles.map(b => b.revenue), 1)
    : Math.max(...designs.map(d => d.revenue), 1)

  return (
    <Card>
      <CardHeader className="py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Top Products</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={view === 'bundles' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView('bundles')}
          >
            Bundles
          </Button>
          <Button
            variant={view === 'designs' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView('designs')}
          >
            Designs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {view === 'bundles' ? (
          bundles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {bundles.slice(0, 5).map((item, index) => {
                const percentage = (item.revenue / maxRevenue) * 100
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[60%]">
                        {index + 1}. {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {item.sales} sold
                        </span>
                        <span className="text-sm font-semibold">{formatPrice(item.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          designs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {designs.slice(0, 5).map((item, index) => {
                const percentage = (item.revenue / maxRevenue) * 100
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[60%]">
                        {index + 1}. {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{formatPrice(item.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
