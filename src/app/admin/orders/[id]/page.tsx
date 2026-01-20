import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Mail, Package, CreditCard, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { getOrderByNumber } from '@/lib/db/orders'
import { OrderActions } from './OrderActions'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id: orderNumber } = await params
  const { order, error } = await getOrderByNumber(orderNumber)

  if (error || !order) {
    notFound()
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Build timeline from order data
  const timeline: { event: string; time: string; description: string }[] = []

  if (order.fulfilled_at) {
    timeline.push({
      event: 'Fulfilled',
      time: formatDate(order.fulfilled_at),
      description: order.tracking_number
        ? `Tracking: ${order.tracking_number}`
        : 'Order has been shipped',
    })
  }

  timeline.push({
    event: 'Payment received',
    time: formatDate(order.created_at),
    description: 'Payment confirmed',
  })

  timeline.push({
    event: 'Order placed',
    time: formatDate(order.created_at),
    description: 'Customer completed checkout',
  })

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Order {order.order_number}</h1>
              <StatusBadge status={order.status} size="md" />
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <OrderActions order={order} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          {/* Order Items */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 py-3">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.bundle_name}</p>
                    <p className="text-sm text-muted-foreground">{item.design_name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-3">
          {/* Customer Info */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">{order.customer_name || 'Guest'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${order.customer_email}`} className="hover:text-pink-600">
                  {order.customer_email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address provided</p>
              )}
              {order.tracking_number && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tracking</p>
                  <p className="text-sm font-mono text-foreground">{order.tracking_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Stripe Payment</p>
                </div>
                <StatusBadge status="paid" />
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
