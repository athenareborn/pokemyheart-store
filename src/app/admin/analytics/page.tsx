'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard, Sparkline } from '@/components/admin'
import { Calendar, TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

// Mock analytics data
const REVENUE_DATA = [1200, 1800, 1500, 2200, 2800, 2400, 3100, 2800, 3500, 3200, 3800, 4200, 3900, 4500]
const ORDERS_DATA = [12, 18, 15, 22, 28, 24, 31, 28, 35, 32, 38, 42, 39, 45]
const VISITORS_DATA = [450, 520, 480, 620, 780, 650, 820, 750, 920, 880, 1050, 1120, 980, 1200]

const BUNDLE_SALES = [
  { name: 'Deluxe Love', sales: 18, revenue: 95310, percentage: 42 },
  { name: 'Love Pack', sales: 21, revenue: 79695, percentage: 35 },
  { name: 'Card Only', sales: 11, revenue: 26345, percentage: 23 },
]

const TOP_LOCATIONS = [
  { location: 'California', orders: 12, percentage: 26 },
  { location: 'New York', orders: 9, percentage: 19 },
  { location: 'Texas', orders: 7, percentage: 15 },
  { location: 'Florida', orders: 5, percentage: 11 },
  { location: 'Other', orders: 14, percentage: 29 },
]

const DAILY_STATS = [
  { day: 'Mon', revenue: 1250, orders: 3 },
  { day: 'Tue', revenue: 890, orders: 2 },
  { day: 'Wed', revenue: 1680, orders: 4 },
  { day: 'Thu', revenue: 2100, orders: 5 },
  { day: 'Fri', revenue: 1950, orders: 4 },
  { day: 'Sat', revenue: 2400, orders: 6 },
  { day: 'Sun', revenue: 1800, orders: 4 },
]

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...DAILY_STATS.map(d => d.revenue))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your store performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="7d">
            <TabsList className="h-8">
              <TabsTrigger value="24h" className="text-xs px-2">24h</TabsTrigger>
              <TabsTrigger value="7d" className="text-xs px-2">7 days</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2">30 days</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(201350)}
          change={{ value: '+18.2%', trend: 'up' }}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Orders"
          value="50"
          change={{ value: '+12 orders', trend: 'up' }}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Conversion Rate"
          value="3.8%"
          change={{ value: '+0.6%', trend: 'up' }}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Visitors"
          value="1,320"
          change={{ value: '+245', trend: 'up' }}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">This period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-muted-foreground">Last period</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-semibold">{formatPrice(201350)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">+18.2%</span>
                <span className="text-sm text-muted-foreground">vs last period</span>
              </div>
            </div>
            <Sparkline data={REVENUE_DATA} width={200} height={60} color="#10b981" />
          </div>

          {/* Daily breakdown bars */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Daily Breakdown</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {DAILY_STATS.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bundle Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Bundle Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {BUNDLE_SALES.map((bundle) => (
                <div key={bundle.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{bundle.name}</p>
                      <p className="text-xs text-muted-foreground">{bundle.sales} orders</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(bundle.revenue)}</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                      style={{ width: `${bundle.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_LOCATIONS.map((loc, index) => (
                <div key={loc.location} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{loc.location}</p>
                      <p className="text-sm text-muted-foreground">{loc.orders} orders</p>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-muted-foreground/50 rounded-full"
                        style={{ width: `${loc.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic & Conversion */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold">1,320</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">+22.8%</span>
                </div>
              </div>
              <Sparkline data={VISITORS_DATA} width={80} height={32} color="#6366f1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Add to Cart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold">8.4%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">+1.2%</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>111 added to cart</p>
                <p>of 1,320 visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checkout Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold">45.0%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive">-2.1%</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>50 completed</p>
                <p>of 111 checkouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
