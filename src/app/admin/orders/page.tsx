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

const ORDERS = [
  { id: 'PMH-008', customer: 'Jessica M.', email: 'jessica@example.com', total: 5295, bundle: 'Deluxe Love', design: 'Forever Yours', status: 'unfulfilled', date: 'Feb 20, 2025' },
  { id: 'PMH-007', customer: 'Emily Foster', email: 'emily@example.com', total: 3795, bundle: 'Love Pack', design: 'My Heart', status: 'unfulfilled', date: 'Feb 19, 2025' },
  { id: 'PMH-006', customer: 'Ryan Parker', email: 'ryan@example.com', total: 5295, bundle: 'Deluxe Love', design: 'Eternal Love', status: 'processing', date: 'Feb 18, 2025' },
  { id: 'PMH-005', customer: 'Tina L.', email: 'tina@example.com', total: 3795, bundle: 'Love Pack', design: 'Soulmate', status: 'fulfilled', date: 'Feb 17, 2025' },
  { id: 'PMH-004', customer: 'Cody B.', email: 'cody@example.com', total: 5295, bundle: 'Deluxe Love', design: 'True Love', status: 'fulfilled', date: 'Feb 16, 2025' },
  { id: 'PMH-003', customer: 'Sam P.', email: 'sam@example.com', total: 2395, bundle: 'Card Only', design: 'Eternal Love', status: 'fulfilled', date: 'Feb 15, 2025' },
  { id: 'PMH-002', customer: 'Andrew F.', email: 'andrew@example.com', total: 3795, bundle: 'Love Pack', design: 'Forever Yours', status: 'fulfilled', date: 'Feb 14, 2025' },
  { id: 'PMH-001', customer: 'Laura Carter', email: 'laura@example.com', total: 5295, bundle: 'Deluxe Love', design: 'Eternal Love', status: 'fulfilled', date: 'Feb 14, 2025' },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const filteredOrders = ORDERS.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

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

  return (
    <div className="space-y-4">
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
              <TabsTrigger value="all">All ({ORDERS.length})</TabsTrigger>
              <TabsTrigger value="unfulfilled">Unfulfilled ({ORDERS.filter(o => o.status === 'unfulfilled').length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({ORDERS.filter(o => o.status === 'processing').length})</TabsTrigger>
              <TabsTrigger value="fulfilled">Fulfilled ({ORDERS.filter(o => o.status === 'fulfilled').length})</TabsTrigger>
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                      {order.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </TableCell>
                  <TableCell>
                    <p>{order.bundle}</p>
                    <p className="text-xs text-muted-foreground">{order.design}</p>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
