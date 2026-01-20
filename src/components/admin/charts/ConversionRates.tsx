'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConversionRatesProps {
  funnel: {
    visitors: number
    productViews: number
    addToCarts: number
    checkouts: number
    purchases: number
  }
}

export function ConversionRates({ funnel }: ConversionRatesProps) {
  // Calculate rates
  const viewRate = funnel.visitors > 0
    ? ((funnel.productViews / funnel.visitors) * 100).toFixed(1)
    : '0.0'

  const atcRate = funnel.productViews > 0
    ? ((funnel.addToCarts / funnel.productViews) * 100).toFixed(1)
    : '0.0'

  const checkoutRate = funnel.addToCarts > 0
    ? ((funnel.checkouts / funnel.addToCarts) * 100).toFixed(1)
    : '0.0'

  const purchaseRate = funnel.checkouts > 0
    ? ((funnel.purchases / funnel.checkouts) * 100).toFixed(1)
    : '0.0'

  const overallCvr = funnel.visitors > 0
    ? ((funnel.purchases / funnel.visitors) * 100).toFixed(2)
    : '0.00'

  const rates = [
    { label: 'View Rate', value: `${viewRate}%`, description: 'Sessions → Product View', color: 'bg-blue-500' },
    { label: 'Add to Cart Rate', value: `${atcRate}%`, description: 'Product View → Add to Cart', color: 'bg-amber-500' },
    { label: 'Checkout Rate', value: `${checkoutRate}%`, description: 'Add to Cart → Checkout', color: 'bg-purple-500' },
    { label: 'Purchase Rate', value: `${purchaseRate}%`, description: 'Checkout → Purchase', color: 'bg-emerald-500' },
  ]

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Conversion Rates</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-semibold">{overallCvr}%</p>
            <p className="text-xs text-muted-foreground">Overall CVR</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {rates.map((rate) => (
            <div key={rate.label} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${rate.color}`} />
                <span className="text-sm font-medium">{rate.label}</span>
              </div>
              <p className="text-xl font-semibold">{rate.value}</p>
              <p className="text-xs text-muted-foreground">{rate.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
