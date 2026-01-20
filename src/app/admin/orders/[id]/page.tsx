'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, RefreshCw, MoreHorizontal, MapPin, Mail, Phone, Package, CreditCard, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/utils'

// Mock order data
const ORDERS: Record<string, {
  id: string
  status: string
  customer: { name: string; email: string; phone: string }
  shipping: { address: string; city: string; state: string; zip: string; country: string }
  items: { name: string; variant: string; quantity: number; price: number; image: string }[]
  subtotal: number
  shipping_cost: number
  total: number
  payment: { method: string; last4: string; status: string }
  tracking?: string
  created_at: string
  fulfilled_at?: string
  timeline: { event: string; time: string; description: string }[]
}> = {
  'PMH-001': {
    id: 'PMH-001',
    status: 'fulfilled',
    customer: { name: 'Laura Carter', email: 'laura@example.com', phone: '+1 (555) 123-4567' },
    shipping: { address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'United States' },
    items: [{ name: 'I Choose You Card', variant: 'Deluxe Love - Eternal Love', quantity: 1, price: 5295, image: '/images/design-1.svg' }],
    subtotal: 5295,
    shipping_cost: 0,
    total: 5295,
    payment: { method: 'Visa', last4: '4242', status: 'paid' },
    tracking: 'ABC123456789',
    created_at: '2025-02-14 10:30 AM',
    fulfilled_at: '2025-02-14 2:00 PM',
    timeline: [
      { event: 'Delivered', time: '2025-02-16 2:30 PM', description: 'Package delivered to recipient' },
      { event: 'Out for delivery', time: '2025-02-16 8:00 AM', description: 'Package is out for delivery' },
      { event: 'Shipped', time: '2025-02-14 2:00 PM', description: 'Tracking: ABC123456789' },
      { event: 'Payment received', time: '2025-02-14 10:30 AM', description: 'Visa ending in 4242' },
      { event: 'Order placed', time: '2025-02-14 10:30 AM', description: 'Customer completed checkout' },
    ],
  },
  'PMH-008': {
    id: 'PMH-008',
    status: 'unfulfilled',
    customer: { name: 'Jessica M.', email: 'jessica@example.com', phone: '+1 (555) 987-6543' },
    shipping: { address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'United States' },
    items: [{ name: 'I Choose You Card', variant: 'Deluxe Love - Forever Yours', quantity: 1, price: 5295, image: '/images/design-2.svg' }],
    subtotal: 5295,
    shipping_cost: 0,
    total: 5295,
    payment: { method: 'Mastercard', last4: '5555', status: 'paid' },
    created_at: '2025-02-20 9:15 AM',
    timeline: [
      { event: 'Payment received', time: '2025-02-20 9:15 AM', description: 'Mastercard ending in 5555' },
      { event: 'Order placed', time: '2025-02-20 9:15 AM', description: 'Customer completed checkout' },
    ],
  },
}

// Default order for unknown IDs
const DEFAULT_ORDER = {
  id: 'PMH-007',
  status: 'unfulfilled',
  customer: { name: 'Emily Foster', email: 'emily@example.com', phone: '+1 (555) 456-7890' },
  shipping: { address: '789 Pine St', city: 'Chicago', state: 'IL', zip: '60601', country: 'United States' },
  items: [{ name: 'I Choose You Card', variant: 'Love Pack - My Heart', quantity: 1, price: 3795, image: '/images/design-3.svg' }],
  subtotal: 3795,
  shipping_cost: 495,
  total: 4290,
  payment: { method: 'Visa', last4: '1234', status: 'paid' },
  created_at: '2025-02-19 3:45 PM',
  timeline: [
    { event: 'Payment received', time: '2025-02-19 3:45 PM', description: 'Visa ending in 1234' },
    { event: 'Order placed', time: '2025-02-19 3:45 PM', description: 'Customer completed checkout' },
  ],
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const order = ORDERS[id] || { ...DEFAULT_ORDER, id }

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
              <h1 className="text-2xl font-semibold tracking-tight">Order {order.id}</h1>
              <StatusBadge status={order.status} size="md" />
            </div>
            <p className="text-sm text-muted-foreground">{order.created_at}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'unfulfilled' && (
            <Button className="bg-primary hover:bg-primary/90">
              <Truck className="h-4 w-4 mr-2" />
              Fulfill order
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Print packing slip</DropdownMenuItem>
              <DropdownMenuItem>Send invoice</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refund order
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.variant}</p>
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
                  <span className="text-foreground">{order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span>
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
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                      {index < order.timeline.length - 1 && (
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
                <p className="font-medium text-foreground">{order.customer.name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${order.customer.email}`} className="hover:text-pink-600">
                  {order.customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {order.customer.phone}
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
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>{order.customer.name}</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
                <p>{order.shipping.country}</p>
              </div>
              {order.tracking && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tracking</p>
                  <p className="text-sm font-mono text-foreground">{order.tracking}</p>
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
                  <p>{order.payment.method} •••• {order.payment.last4}</p>
                </div>
                <StatusBadge status={order.payment.status === 'paid' ? 'fulfilled' : 'pending'} />
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
