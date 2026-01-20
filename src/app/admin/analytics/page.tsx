'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkline } from '@/components/admin'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

// Mock analytics data
const REVENUE_DATA = [1200, 1800, 1500, 2200, 2800, 2400, 3100, 2800, 3500, 3200, 3800, 4200, 3900, 4500]

const BUNDLE_SALES = [
  { name: 'Deluxe Love', sales: 18, revenue: 95310, percentage: 47 },
  { name: 'Love Pack', sales: 21, revenue: 79695, percentage: 40 },
  { name: 'Card Only', sales: 11, revenue: 26345, percentage: 13 },
]

const DESIGN_SALES = [
  { name: 'Eternal Love', revenue: 68450, percentage: 34 },
  { name: 'Forever Yours', revenue: 52395, percentage: 26 },
  { name: 'My Heart', revenue: 42300, percentage: 21 },
  { name: 'Soulmate', revenue: 38205, percentage: 19 },
]

const TOP_LOCATIONS = [
  { location: 'California', orders: 12, percentage: 26 },
  { location: 'New York', orders: 9, percentage: 19 },
  { location: 'Texas', orders: 7, percentage: 15 },
  { location: 'Florida', orders: 5, percentage: 11 },
  { location: 'Other', orders: 14, percentage: 29 },
]

const DAILY_STATS = [
  { day: 'Mon', revenue: 1250 },
  { day: 'Tue', revenue: 890 },
  { day: 'Wed', revenue: 1680 },
  { day: 'Thu', revenue: 2100 },
  { day: 'Fri', revenue: 1950 },
  { day: 'Sat', revenue: 2400 },
  { day: 'Sun', revenue: 1800 },
]

const FUNNEL = [
  { stage: 'Visitors', count: 1320, percentage: 100 },
  { stage: 'Product Views', count: 892, percentage: 68 },
  { stage: 'Add to Cart', count: 111, percentage: 8 },
  { stage: 'Checkout', count: 67, percentage: 5 },
  { stage: 'Purchase', count: 50, percentage: 4 },
]

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...DAILY_STATS.map(d => d.revenue))
  const avgOrderValue = 201350 / 50

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <Tabs defaultValue="7d">
          <TabsList className="h-8">
            <TabsTrigger value="24h" className="text-xs px-2.5">24h</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs px-2.5">7d</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2.5">30d</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2.5">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Row - Inline stats, no heavy cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold">{formatPrice(201350)}</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+18.2%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-lg font-semibold">50</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+12</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">AOV</p>
            <p className="text-lg font-semibold">{formatPrice(avgOrderValue)}</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+$4.20</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Conversion</p>
            <p className="text-lg font-semibold">3.8%</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+0.6%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Visitors</p>
            <p className="text-lg font-semibold">1,320</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+245</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <Sparkline data={REVENUE_DATA} width={160} height={32} color="#10b981" />
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-4">
          <div className="flex items-end gap-1.5 h-24">
            {DAILY_STATS.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-sm hover:bg-primary transition-colors"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column: Sales by Bundle + Sales by Design */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Sales by Bundle</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4 space-y-2.5">
            {BUNDLE_SALES.map((bundle) => (
              <div key={bundle.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{bundle.name}</span>
                    <span className="text-sm font-medium">{formatPrice(bundle.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${bundle.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{bundle.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Sales by Design</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4 space-y-2.5">
            {DESIGN_SALES.map((design) => (
              <div key={design.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{design.name}</span>
                    <span className="text-sm font-medium">{formatPrice(design.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${design.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{design.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Two Column: Top Locations + Conversion Funnel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4 space-y-2">
            {TOP_LOCATIONS.map((loc, index) => (
              <div key={loc.location} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">{loc.location}</span>
                  <span className="text-xs text-muted-foreground">{loc.orders} orders</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4 space-y-2">
            {FUNNEL.map((step, index) => (
              <div key={step.stage} className="flex items-center gap-3">
                <div
                  className="h-6 bg-primary/20 rounded-sm flex items-center justify-end pr-2"
                  style={{ width: `${step.percentage}%`, minWidth: '60px' }}
                >
                  <span className="text-xs font-medium">{step.count.toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">{step.stage}</span>
                {index > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {((FUNNEL[index].count / FUNNEL[index - 1].count) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
