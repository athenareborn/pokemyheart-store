'use client'

interface MetricCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  sparklineData?: number[]
  color?: string
}

export function MetricCard({ title, value, change, changeLabel }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% {changeLabel}
        </p>
      )}
    </div>
  )
}

interface ChartProps {
  data: unknown[]
  title?: string
}

export function RevenueChart({ title }: ChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">{title || 'Revenue Chart'}</h3>
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Chart placeholder
      </div>
    </div>
  )
}

export function VisitorsChart({ data }: ChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">Visitors</h3>
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        {data?.length || 0} data points
      </div>
    </div>
  )
}

export function FunnelChart({ data }: ChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">Conversion Funnel</h3>
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        {data?.length || 0} steps
      </div>
    </div>
  )
}

interface TopProductsChartProps {
  bundles: unknown[]
  designs: unknown[]
}

export function TopProductsChart({ bundles, designs }: TopProductsChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">Top Products</h3>
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        {bundles?.length || 0} bundles, {designs?.length || 0} designs
      </div>
    </div>
  )
}

export function LocationChart({ data }: ChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-4">Top Locations</h3>
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        {data?.length || 0} locations
      </div>
    </div>
  )
}
