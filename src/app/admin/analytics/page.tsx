import Link from 'next/link'
import { DollarSign, Package, TrendingUp, Users, ShoppingCart, Eye, ExternalLink, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin'
import { RevenueChart, FunnelChart, TopProductsChart, LocationChart, VisitorsChart, ConversionRates, TrafficSourcesChart, DeviceChart } from '@/components/admin/charts'
import { formatPrice } from '@/lib/utils'
import { getAnalyticsOverview, type TimePeriod } from '@/lib/db/analytics'

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>
}

const periods = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
] as const

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams
  const period = (params.period || '7d') as TimePeriod

  const analytics = await getAnalyticsOverview(period)

  const periodLabel = period === 'today' ? 'Today' :
    period === '7d' ? 'Last 7 days' :
    period === '30d' ? 'Last 30 days' : 'Last 90 days'

  const posthogUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST === 'https://eu.i.posthog.com'
    ? 'https://eu.posthog.com'
    : 'https://us.posthog.com'

  // Calculate rates
  const totalSessions = analytics.funnel.visitors
  const atcRate = analytics.funnel.productViews > 0
    ? ((analytics.funnel.addToCarts / analytics.funnel.productViews) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {periods.map((p) => (
            <Link key={p.value} href={`/admin/analytics?period=${p.value}`}>
              <Button
                variant={period === p.value ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
              >
                {p.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sales"
          value={formatPrice(analytics.revenue)}
          change={analytics.revenueChange !== 0 ? {
            value: `${analytics.revenueChange > 0 ? '+' : ''}${analytics.revenueChange}%`,
            trend: analytics.revenueChange > 0 ? 'up' : analytics.revenueChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Orders"
          value={analytics.orderCount.toString()}
          change={analytics.orderCountChange !== 0 ? {
            value: `${analytics.orderCountChange > 0 ? '+' : ''}${analytics.orderCountChange}%`,
            trend: analytics.orderCountChange > 0 ? 'up' : analytics.orderCountChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Sessions"
          value={totalSessions.toString()}
          change={analytics.visitorsChange !== 0 ? {
            value: `${analytics.visitorsChange > 0 ? '+' : ''}${analytics.visitorsChange}%`,
            trend: analytics.visitorsChange > 0 ? 'up' : analytics.visitorsChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Conversion"
          value={`${analytics.conversionRate}%`}
          change={analytics.conversionRateChange !== 0 ? {
            value: `${analytics.conversionRateChange > 0 ? '+' : ''}${analytics.conversionRateChange}%`,
            trend: analytics.conversionRateChange > 0 ? 'up' : analytics.conversionRateChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart data={analytics.revenueByDay} />
        <VisitorsChart data={analytics.visitorsByDay} />
      </div>

      {/* Conversion Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ConversionRates funnel={analytics.funnel} />
        <FunnelChart data={analytics.funnel} />
      </div>

      {/* Breakdown Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsChart
          bundles={analytics.salesByBundle}
          designs={analytics.salesByDesign}
        />
        <LocationChart data={analytics.topLocations} />
      </div>

      {/* Traffic & Device Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficSourcesChart data={analytics.trafficSources} />
        <DeviceChart data={analytics.deviceBreakdown} />
      </div>

      {/* PostHog */}
      {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Session Recordings & Heatmaps</p>
                  <p className="text-xs text-muted-foreground">Watch real user sessions in PostHog</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={posthogUrl} target="_blank" rel="noopener noreferrer">
                  Open PostHog
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
