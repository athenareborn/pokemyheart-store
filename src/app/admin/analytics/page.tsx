import Link from 'next/link'
import { DollarSign, Package, TrendingUp, Users, Percent, ExternalLink, Play, MousePointerClick, BarChart3, ShoppingCart, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin'
import { RevenueChart, FunnelChart, TopProductsChart, LocationChart, VisitorsChart, ConversionRates } from '@/components/admin/charts'
import { formatPrice } from '@/lib/utils'
import { getAnalyticsOverview, type TimePeriod } from '@/lib/db/analytics'

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams
  const period = (params.period || '7d') as TimePeriod

  const analytics = await getAnalyticsOverview(period)

  const periodLabel = period === '24h' ? 'Last 24 hours' :
    period === '7d' ? 'Last 7 days' :
    period === '30d' ? 'Last 30 days' : 'Last 90 days'

  const posthogUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST === 'https://eu.i.posthog.com'
    ? 'https://eu.posthog.com'
    : 'https://us.posthog.com'

  // Calculate additional Shopify-style metrics
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

      {/* Key Metrics - Row 1: Revenue */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
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
          title="Avg Order Value"
          value={formatPrice(analytics.averageOrderValue)}
          change={analytics.aovChange !== 0 ? {
            value: `${analytics.aovChange > 0 ? '+' : ''}${analytics.aovChange}%`,
            trend: analytics.aovChange > 0 ? 'up' : analytics.aovChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          change={analytics.conversionRateChange !== 0 ? {
            value: `${analytics.conversionRateChange > 0 ? '+' : ''}${analytics.conversionRateChange}%`,
            trend: analytics.conversionRateChange > 0 ? 'up' : analytics.conversionRateChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Key Metrics - Row 2: Traffic */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          title="Unique Visitors"
          value={analytics.visitors.toString()}
          change={analytics.visitorsChange !== 0 ? {
            value: `${analytics.visitorsChange > 0 ? '+' : ''}${analytics.visitorsChange}%`,
            trend: analytics.visitorsChange > 0 ? 'up' : analytics.visitorsChange < 0 ? 'down' : 'neutral'
          } : undefined}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Add to Cart Rate"
          value={`${atcRate}%`}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Product Views"
          value={analytics.funnel.productViews.toString()}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={analytics.revenueByDay} />

      {/* Sessions & Visitors Chart */}
      <VisitorsChart data={analytics.visitorsByDay} />

      {/* Conversion Rates + Funnel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ConversionRates funnel={analytics.funnel} />
        <FunnelChart data={analytics.funnel} />
      </div>

      {/* Top Products + Locations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsChart
          bundles={analytics.salesByBundle}
          designs={analytics.salesByDesign}
        />
        <LocationChart data={analytics.topLocations} />
      </div>

      {/* PostHog Integration */}
      {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Session Recordings & Heatmaps
            </CardTitle>
            <CardDescription>
              Watch real user sessions and see where they click
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
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
    </div>
  )
}
