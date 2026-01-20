'use client'

import Link from 'next/link'
import { DollarSign, Package, Users, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import { StatCard, ActivityFeed, StatusBadge, Sparkline } from '@/components/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

const STATS = {
  revenue: { value: 284750, change: '+12.5%', trend: 'up' as const },
  orders: { value: 47, change: '+8', trend: 'up' as const },
  customers: { value: 42, change: '+3', trend: 'up' as const },
  conversionRate: { value: 3.2, change: '+0.4%', trend: 'up' as const },
}

const REVENUE_SPARKLINE = [120, 180, 150, 220, 280, 240, 310, 280, 350, 320, 380, 420]

const RECENT_ORDERS = [
  { id: 'PMH-008', customer: 'Jessica M.', total: 5295, status: 'unfulfilled', date: '2 min ago', bundle: 'Deluxe Love' },
  { id: 'PMH-007', customer: 'Emily Foster', total: 3795, status: 'unfulfilled', date: '1 hour ago', bundle: 'Love Pack' },
  { id: 'PMH-006', customer: 'Ryan Parker', total: 5295, status: 'processing', date: '3 hours ago', bundle: 'Deluxe Love' },
  { id: 'PMH-005', customer: 'Tina L.', total: 3795, status: 'fulfilled', date: '5 hours ago', bundle: 'Love Pack' },
  { id: 'PMH-004', customer: 'Cody B.', total: 5295, status: 'fulfilled', date: '1 day ago', bundle: 'Deluxe Love' },
]

const RECENT_ACTIVITY = [
  { id: '1', type: 'order' as const, title: 'New order #PMH-008', description: 'Jessica M. ordered Deluxe Love bundle', time: '2 minutes ago' },
  { id: '2', type: 'customer' as const, title: 'New customer', description: 'jessica@example.com signed up', time: '2 minutes ago' },
  { id: '3', type: 'fulfillment' as const, title: 'Order fulfilled', description: '#PMH-005 shipped via USPS', time: '5 hours ago' },
  { id: '4', type: 'payment' as const, title: 'Payment received', description: '$52.95 from Ryan Parker', time: '3 hours ago' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/analytics">View Analytics</Link>
        </Button>
      </div>

      {/* Alert */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">2 orders need fulfillment</p>
              <p className="text-xs text-amber-700">Customers are waiting</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
            <Link href="/admin/orders?status=unfulfilled">
              View orders
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(STATS.revenue.value)}
          change={{ value: STATS.revenue.change, trend: STATS.revenue.trend }}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Orders"
          value={STATS.orders.value.toString()}
          change={{ value: STATS.orders.change, trend: STATS.orders.trend }}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Customers"
          value={STATS.customers.value.toString()}
          change={{ value: STATS.customers.change, trend: STATS.customers.trend }}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${STATS.conversionRate.value}%`}
          change={{ value: STATS.conversionRate.change, trend: STATS.conversionRate.trend }}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
          <span className="text-xs text-muted-foreground">Last 12 days</span>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold">{formatPrice(STATS.revenue.value)}</p>
              <p className="text-sm text-emerald-600">+12.5% from last period</p>
            </div>
            <Sparkline data={REVENUE_SPARKLINE} width={120} height={40} color="hsl(var(--primary))" />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="space-y-3">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium hover:underline">
                        {order.id}
                      </Link>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium w-16 text-right">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <ActivityFeed activities={RECENT_ACTIVITY} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
