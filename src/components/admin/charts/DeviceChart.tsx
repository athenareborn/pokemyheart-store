'use client'

import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeviceChartProps {
  data: Array<{ device: string; sessions: number; percentage: number }>
}

const deviceIcons: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
}

const deviceColors: Record<string, string> = {
  Desktop: 'bg-violet-500/60',
  Mobile: 'bg-amber-500/60',
  Tablet: 'bg-cyan-500/60',
}

export function DeviceChart({ data }: DeviceChartProps) {
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0)

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">Device Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {totalSessions === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        ) : (
          <div className="space-y-4">
            {/* Stacked bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              {data.map((item) => (
                <div
                  key={item.device}
                  className={`h-full ${deviceColors[item.device] || 'bg-gray-500/60'} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2">
              {data.map((item) => (
                <div key={item.device} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deviceColors[item.device] || 'bg-gray-500/60'}`} />
                  <div className="flex items-center gap-1.5 text-sm">
                    {deviceIcons[item.device]}
                    <span className="text-muted-foreground">{item.device}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              {data.map((item) => (
                <div key={item.device} className="text-center">
                  <p className="text-lg font-semibold">{item.percentage}%</p>
                  <p className="text-xs text-muted-foreground">{item.sessions.toLocaleString()} sessions</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
