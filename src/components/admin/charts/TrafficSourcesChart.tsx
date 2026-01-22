'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrafficSourcesChartProps {
  data: Array<{ source: string; sessions: number; conversions: number }>
}

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  const maxSessions = Math.max(...data.map(d => d.sessions), 1)

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = (item.sessions / maxSessions) * 100
              const conversionRate = item.sessions > 0
                ? ((item.conversions / item.sessions) * 100).toFixed(1)
                : '0.0'

              return (
                <div key={item.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {index + 1}. {item.source}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {item.sessions} sessions
                      </span>
                      <span className="text-sm font-semibold">{conversionRate}% CVR</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/60 rounded-full transition-all duration-500"
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
