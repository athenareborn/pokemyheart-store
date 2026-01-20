'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Eye, Truck, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/utils'

// Mock data
const ORDERS = [
  { id: 'PMH-008', customer: 'Jessica M.', email: 'jessica@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', design: 'Forever Yours', status: 'unfulfilled', date: '2025-02-20', time: '9:15 AM' },
  { id: 'PMH-007', customer: 'Emily Foster', email: 'emily@example.com', total: 3795, items: 1, bundle: 'Love Pack', design: 'My Heart', status: 'unfulfilled', date: '2025-02-19', time: '3:45 PM' },
  { id: 'PMH-006', customer: 'Ryan Parker', email: 'ryan@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', design: 'Eternal Love', status: 'processing', date: '2025-02-18', time: '11:20 AM' },
  { id: 'PMH-005', customer: 'Tina L.', email: 'tina@example.com', total: 3795, items: 1, bundle: 'Love Pack', design: 'Soulmate', status: 'fulfilled', date: '2025-02-17', time: '2:30 PM', tracking: 'ABC123' },
  { id: 'PMH-004', customer: 'Cody B.', email: 'cody@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', design: 'True Love', status: 'fulfilled', date: '2025-02-16', time: '10:00 AM', tracking: 'DEF456' },
  { id: 'PMH-003', customer: 'Sam P.', email: 'sam@example.com', total: 2395, items: 1, bundle: 'Card Only', design: 'Eternal Love', status: 'fulfilled', date: '2025-02-15', time: '4:15 PM', tracking: 'GHI789' },
  { id: 'PMH-002', customer: 'Andrew F.', email: 'andrew@example.com', total: 3795, items: 1, bundle: 'Love Pack', design: 'Forever Yours', status: 'fulfilled', date: '2025-02-14', time: '1:00 PM', tracking: 'JKL012' },
  { id: 'PMH-001', customer: 'Laura Carter', email: 'laura@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', design: 'Eternal Love', status: 'fulfilled', date: '2025-02-14', time: '10:30 AM', tracking: 'MNO345' },
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
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Bundle', 'Design', 'Total', 'Status', 'Date', 'Tracking']
    const rows = filteredOrders.map(order => [
      order.id,
      order.customer,
      order.email,
      order.bundle,
      order.design,
      formatPrice(order.total),
      order.status,
      order.date,
      order.tracking || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and fulfill customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk actions ({selectedOrders.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Mark as fulfilled</DropdownMenuItem>
                <DropdownMenuItem>Print packing slips</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Cancel orders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order ID, customer, or email..."
                className="pl-9 h-9 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-slate-100">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8 bg-transparent p-0 gap-4">
              <TabsTrigger value="all" className="h-8 px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                All ({ORDERS.length})
              </TabsTrigger>
              <TabsTrigger value="unfulfilled" className="h-8 px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                Unfulfilled ({ORDERS.filter(o => o.status === 'unfulfilled').length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="h-8 px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                Processing ({ORDERS.filter(o => o.status === 'processing').length})
              </TabsTrigger>
              <TabsTrigger value="fulfilled" className="h-8 px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none">
                Fulfilled ({ORDERS.filter(o => o.status === 'fulfilled').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-10 py-3 px-4">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="w-10 py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrder(order.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-slate-900 hover:text-pink-600">
                        {order.id}
                      </Link>
                      <p className="text-xs text-slate-400">{order.date} at {order.time}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-900">{order.customer}</p>
                      <p className="text-xs text-slate-400">{order.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-900">{order.bundle}</p>
                      <p className="text-xs text-slate-400">{order.design}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-slate-900">{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View details
                            </Link>
                          </DropdownMenuItem>
                          {order.status !== 'fulfilled' && (
                            <DropdownMenuItem>
                              <Truck className="h-4 w-4 mr-2" />
                              Fulfill order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {filteredOrders.length} of {ORDERS.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">1</Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
