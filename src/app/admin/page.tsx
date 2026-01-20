'use client'

import Link from 'next/link'
import { DollarSign, Package, Users, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
import { StatCard, ActivityFeed, StatusBadge, Sparkline } from '@/components/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Mock data
const STATS = {
  revenue: { value: 284750, change: '+12.5%', trend: 'up' as const },
  orders: { value: 47, change: '+8', trend: 'up' as const },
  customers: { value: 42, change: '+3', trend: 'up' as const },
  conversionRate: { value: 3.2, change: '+0.4%', trend: 'up' as const },
}

const REVENUE_SPARKLINE = [120, 180, 150, 220, 280, 240, 310, 280, 350, 320, 380, 420]

const RECENT_ORDERS = [
  { id: 'PMH-008', customer: 'Jessica M.', email: 'jessica@example.com', total: 5295, status: 'unfulfilled', date: '2 min ago', bundle: 'Deluxe Love' },
  { id: 'PMH-007', customer: 'Emily Foster', email: 'emily@example.com', total: 3795, status: 'unfulfilled', date: '1 hour ago', bundle: 'Love Pack' },
  { id: 'PMH-006', customer: 'Ryan Parker', email: 'ryan@example.com', total: 5295, status: 'processing', date: '3 hours ago', bundle: 'Deluxe Love' },
  { id: 'PMH-005', customer: 'Tina L.', email: 'tina@example.com', total: 3795, status: 'fulfilled', date: '5 hours ago', bundle: 'Love Pack' },
  { id: 'PMH-004', customer: 'Cody B.', email: 'cody@example.com', total: 5295, status: 'fulfilled', date: '1 day ago', bundle: 'Deluxe Love' },
]

const RECENT_ACTIVITY = [
  { id: '1', type: 'order' as const, title: 'New order #PMH-008', description: 'Jessica M. ordered Deluxe Love bundle', time: '2 minutes ago' },
  { id: '2', type: 'customer' as const, title: 'New customer', description: 'jessica@example.com signed up', time: '2 minutes ago' },
  { id: '3', type: 'fulfillment' as const, title: 'Order fulfilled', description: '#PMH-005 shipped via USPS', time: '5 hours ago' },
  { id: '4', type: 'payment' as const, title: 'Payment received', description: '$52.95 from Ryan Parker', time: '3 hours ago' },
]

const UNFULFILLED_COUNT = 2

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">View Analytics</Link>
          </Button>
        </div>
      </div>

      {/* Needs Attention */}
      {UNFULFILLED_COUNT > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    {UNFULFILLED_COUNT} orders need fulfillment
                  </p>
                  <p className="text-xs text-amber-700">Customers are waiting for their orders</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
                <Link href="/admin/orders?status=unfulfilled">
                  View orders
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(STATS.revenue.value)}
          change={{ value: STATS.revenue.change, trend: STATS.revenue.trend }}
          icon={<DollarSign className="h-4 w-4 text-slate-600" />}
        />
        <StatCard
          title="Orders"
          value={STATS.orders.value.toString()}
          change={{ value: STATS.orders.change, trend: STATS.orders.trend }}
          icon={<Package className="h-4 w-4 text-slate-600" />}
        />
        <StatCard
          title="Customers"
          value={STATS.customers.value.toString()}
          change={{ value: STATS.customers.change, trend: STATS.customers.trend }}
          icon={<Users className="h-4 w-4 text-slate-600" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${STATS.conversionRate.value}%`}
          change={{ value: STATS.conversionRate.change, trend: STATS.conversionRate.trend }}
          icon={<TrendingUp className="h-4 w-4 text-slate-600" />}
        />
      </div>

      {/* Revenue Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-600">Revenue Overview</CardTitle>
            <span className="text-xs text-slate-400">Last 12 days</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-2xl font-semibold text-slate-900">{formatPrice(STATS.revenue.value)}</p>
              <p className="text-sm text-emerald-600">+12.5% from last period</p>
            </div>
            <Sparkline data={REVENUE_SPARKLINE} width={120} height={40} color="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders" className="text-slate-600">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-slate-900 hover:text-pink-600">
                          {order.id}
                        </Link>
                        <p className="text-xs text-slate-400">{order.date}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="text-sm text-slate-900">{order.customer}</p>
                        <p className="text-xs text-slate-400">{order.bundle}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-sm font-medium text-slate-900">{formatPrice(order.total)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Takes 1 column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ActivityFeed activities={RECENT_ACTIVITY} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Top Product</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">Love Pack</p>
                <p className="text-xs text-slate-400">24 orders this week</p>
              </div>
              <div className="text-2xl">💝</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Order Value</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">$42.85</p>
                <p className="text-xs text-emerald-600">+$3.20 from last week</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stock Level</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">8 units</p>
                <p className="text-xs text-amber-600">Low stock warning</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
