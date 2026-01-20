'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface VisitorsChartProps {
  data: Array<{ date: string; visitors: number; sessions: number }>
}

export function VisitorsChart({ data }: VisitorsChartProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">Sessions & Visitors</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg px-3 py-2">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Sessions: {payload[0].payload.sessions}
                        </p>
                        <p className="text-sm text-emerald-600">
                          Visitors: {payload[0].payload.visitors}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#sessionsGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Unique Visitors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
