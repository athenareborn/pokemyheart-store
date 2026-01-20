'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Download, MoreHorizontal } from 'lucide-react'
import { StatusBadge } from '@/components/admin'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/lib/supabase/types'

interface OrdersClientProps {
  initialOrders: Order[]
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const filteredOrders = initialOrders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'all') return matchesSearch
    return matchesSearch && order.status === activeTab
  })

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    )
  }

  const toggleAll = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id)
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get primary item info for display
  const getPrimaryItemInfo = (order: Order) => {
    const items = order.items
    if (!items || items.length === 0) {
      return { bundle: 'Unknown', design: 'Unknown' }
    }
    const firstItem = items[0]
    return {
      bundle: firstItem.bundle_name,
      design: firstItem.design_name
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and fulfill customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Actions ({selectedOrders.length})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Mark as fulfilled</DropdownMenuItem>
                <DropdownMenuItem>Print packing slips</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Cancel orders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="py-3 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({initialOrders.length})</TabsTrigger>
              <TabsTrigger value="unfulfilled">Unfulfilled ({initialOrders.filter(o => o.status === 'unfulfilled').length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({initialOrders.filter(o => o.status === 'processing').length})</TabsTrigger>
              <TabsTrigger value="fulfilled">Fulfilled ({initialOrders.filter(o => o.status === 'fulfilled').length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const { bundle, design } = getPrimaryItemInfo(order)
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customer_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </TableCell>
                    <TableCell>
                      <p>{bundle}</p>
                      <p className="text-xs text-muted-foreground">{design}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>View details</Link>
                          </DropdownMenuItem>
                          {order.status !== 'fulfilled' && (
                            <DropdownMenuItem>Fulfill order</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
