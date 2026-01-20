import Link from 'next/link'
import { DollarSign, Package, Users, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import { StatCard, ActivityFeed, StatusBadge, Sparkline } from '@/components/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { getOrderStats, getRecentOrders } from '@/lib/db/orders'
import { getCustomerStats } from '@/lib/db/customers'
import { formatDistanceToNow } from 'date-fns'

// Mock activity data (we don't have a full activity log table yet)
const RECENT_ACTIVITY = [
  { id: '1', type: 'order' as const, title: 'New order received', description: 'Check recent orders for details', time: 'recently' },
  { id: '2', type: 'customer' as const, title: 'Customer activity', description: 'View customer list for updates', time: 'recently' },
  { id: '3', type: 'fulfillment' as const, title: 'Fulfillment pending', description: 'Check orders to fulfill', time: 'recently' },
]

export default async function AdminDashboard() {
  // Fetch real data from Supabase
  const [orderStats, customerStats, recentOrders] = await Promise.all([
    getOrderStats(),
    getCustomerStats(),
    getRecentOrders(5),
  ])

  const hasOrders = orderStats.orderCount > 0
  const hasCustomers = customerStats.total > 0
  const unfulfilledCount = orderStats.unfulfilled || 0

  // Format recent orders for display
  const formattedOrders = recentOrders.map((order) => ({
    id: order.order_number,
    customer: order.customer_name || order.customer_email.split('@')[0],
    total: order.total,
    status: order.status,
    date: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
    bundle: order.items[0]?.bundle_name || 'Unknown',
  }))

  return (
    <div className="space-y-6">
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

      {/* Alert - only show if there are unfulfilled orders */}
      {unfulfilledCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-base font-medium text-amber-900">
                  {unfulfilledCount} {unfulfilledCount === 1 ? 'order needs' : 'orders need'} fulfillment
                </p>
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
      )}

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(orderStats.revenue)}
          change={hasOrders ? { value: 'All time', trend: 'up' as const } : undefined}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Orders"
          value={orderStats.orderCount.toString()}
          change={hasOrders ? { value: `${orderStats.fulfilled || 0} fulfilled`, trend: 'up' as const } : undefined}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Customers"
          value={customerStats.total.toString()}
          change={hasCustomers ? { value: `${customerStats.subscribers} subscribers`, trend: 'up' as const } : undefined}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg Order Value"
          value={formatPrice(orderStats.averageOrderValue)}
          change={hasOrders ? { value: 'Per order', trend: 'up' as const } : undefined}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
          <span className="text-xs text-muted-foreground">All time</span>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold">{formatPrice(orderStats.revenue)}</p>
              <p className="text-sm text-muted-foreground">
                {hasOrders
                  ? `${orderStats.orderCount} orders, ${formatPrice(orderStats.averageOrderValue)} avg`
                  : 'No orders yet'}
              </p>
            </div>
            {/* Sparkline placeholder - would need historical data */}
            <Sparkline
              data={hasOrders ? [orderStats.revenue * 0.1, orderStats.revenue * 0.3, orderStats.revenue * 0.5, orderStats.revenue * 0.7, orderStats.revenue] : [0, 0, 0, 0, 0]}
              width={120}
              height={40}
              color="hsl(var(--primary))"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            {formattedOrders.length > 0 ? (
              <div className="space-y-4">
                {formattedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="text-base font-medium hover:underline">
                          {order.id}
                        </Link>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <StatusBadge status={order.status} />
                      <span className="text-base font-medium w-16 text-right">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs">Orders will appear here when customers make purchases</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <ActivityFeed activities={RECENT_ACTIVITY} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
