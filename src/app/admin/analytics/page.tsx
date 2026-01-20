import Link from 'next/link'
import { DollarSign, Package, TrendingUp, ExternalLink, Play, MousePointerClick, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin'
import { formatPrice } from '@/lib/utils'
import { getAnalyticsOverview, getTodayMetrics, type TimePeriod } from '@/lib/db/analytics'

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams
  const period = (params.period || '7d') as TimePeriod

  const [metrics, todayMetrics] = await Promise.all([
    getBasicMetrics(period),
    getTodayMetrics(),
  ])

  const periodLabel = period === '24h' ? 'Last 24 hours' :
    period === '7d' ? 'Last 7 days' :
    period === '30d' ? 'Last 30 days' : 'Last 90 days'

  const posthogUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST === 'https://eu.i.posthog.com'
    ? 'https://eu.posthog.com'
    : 'https://us.posthog.com'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Link key={p} href={`/admin/analytics?period=${p}`}>
              <Button
                variant={period === p ? 'default' : 'outline'}
                size="sm"
              >
                {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Revenue"
          value={formatPrice(metrics.revenue)}
          change={metrics.revenueChange !== 0 ? {
            value: `${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange}%`,
            trend: metrics.revenueChange > 0 ? 'up' : metrics.revenueChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Orders"
          value={metrics.orderCount.toString()}
          change={metrics.orderCountChange !== 0 ? {
            value: `${metrics.orderCountChange > 0 ? '+' : ''}${metrics.orderCountChange}%`,
            trend: metrics.orderCountChange > 0 ? 'up' : metrics.orderCountChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg Order Value"
          value={formatPrice(metrics.averageOrderValue)}
          change={metrics.aovChange !== 0 ? {
            value: `${metrics.aovChange > 0 ? '+' : ''}${metrics.aovChange}%`,
            trend: metrics.aovChange > 0 ? 'up' : metrics.aovChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Today's Snapshot */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base font-medium">Today</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-xl font-semibold">{todayMetrics.ordersToday}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-semibold">{formatPrice(todayMetrics.revenueToday)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PostHog Integration */}
      {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>
              Funnels, session recordings, and heatmaps powered by PostHog
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-background rounded-md">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Funnels</p>
                  <p className="text-xs text-muted-foreground">View → Cart → Checkout → Purchase</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-background rounded-md">
                  <Play className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Session Recordings</p>
                  <p className="text-xs text-muted-foreground">Watch real user sessions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-background rounded-md">
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Heatmaps</p>
                  <p className="text-xs text-muted-foreground">See where users click</p>
                </div>
              </div>
            </div>
            <Button asChild>
              <a href={posthogUrl} target="_blank" rel="noopener noreferrer">
                Open PostHog Dashboard
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No PostHog Warning */}
      {!process.env.NEXT_PUBLIC_POSTHOG_KEY && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">PostHog not configured</p>
                <p className="text-xs text-amber-700">Add NEXT_PUBLIC_POSTHOG_KEY to enable funnels, session recordings, and heatmaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
