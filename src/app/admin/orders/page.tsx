'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Eye, Truck, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Mock data - will be replaced with real data from Supabase
const ORDERS = [
  { id: 'PMH-001', customer: 'Laura Carter', email: 'laura@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', status: 'fulfilled', date: '2025-02-14', tracking: 'ABC123456' },
  { id: 'PMH-002', customer: 'Andrew F.', email: 'andrew@example.com', total: 3795, items: 1, bundle: 'Love Pack', status: 'processing', date: '2025-02-13', tracking: null },
  { id: 'PMH-003', customer: 'Sam P.', email: 'sam@example.com', total: 2395, items: 1, bundle: 'Card Only', status: 'unfulfilled', date: '2025-02-12', tracking: null },
  { id: 'PMH-004', customer: 'Cody B.', email: 'cody@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', status: 'fulfilled', date: '2025-02-11', tracking: 'DEF789012' },
  { id: 'PMH-005', customer: 'Tina L.', email: 'tina@example.com', total: 3795, items: 1, bundle: 'Love Pack', status: 'processing', date: '2025-02-10', tracking: null },
  { id: 'PMH-006', customer: 'Ryan Parker', email: 'ryan@example.com', total: 5295, items: 1, bundle: 'Deluxe Love', status: 'fulfilled', date: '2025-02-09', tracking: 'GHI345678' },
  { id: 'PMH-007', customer: 'Emily Foster', email: 'emily@example.com', total: 3795, items: 1, bundle: 'Love Pack', status: 'unfulfilled', date: '2025-02-08', tracking: null },
]

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    fulfilled: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    unfulfilled: 'bg-yellow-100 text-yellow-700',
    refunded: 'bg-red-100 text-red-700',
  }
  return (
    <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = ORDERS.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'all') return matchesSearch
    return matchesSearch && order.status === activeTab
  })

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Bundle', 'Total', 'Status', 'Date', 'Tracking']
    const rows = filteredOrders.map(order => [
      order.id,
      order.customer,
      order.email,
      order.bundle,
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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and fulfill customer orders</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer, or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({ORDERS.length})</TabsTrigger>
              <TabsTrigger value="unfulfilled">
                Unfulfilled ({ORDERS.filter(o => o.status === 'unfulfilled').length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({ORDERS.filter(o => o.status === 'processing').length})
              </TabsTrigger>
              <TabsTrigger value="fulfilled">
                Fulfilled ({ORDERS.filter(o => o.status === 'fulfilled').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bundle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-pink-600 hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{order.bundle}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500">{order.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {order.status !== 'fulfilled' && (
                          <Button variant="ghost" size="icon">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
