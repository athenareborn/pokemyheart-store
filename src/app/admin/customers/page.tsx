'use client'

import { useState } from 'react'
import { Search, Mail, Package, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Mock data - will be replaced with real data from Supabase
const CUSTOMERS = [
  { id: '1', name: 'Laura Carter', email: 'laura@example.com', orders: 2, totalSpent: 9090, acceptsMarketing: true, createdAt: '2025-02-10' },
  { id: '2', name: 'Andrew F.', email: 'andrew@example.com', orders: 1, totalSpent: 3795, acceptsMarketing: true, createdAt: '2025-02-12' },
  { id: '3', name: 'Sam P.', email: 'sam@example.com', orders: 3, totalSpent: 11385, acceptsMarketing: false, createdAt: '2025-02-08' },
  { id: '4', name: 'Cody B.', email: 'cody@example.com', orders: 1, totalSpent: 5295, acceptsMarketing: true, createdAt: '2025-02-11' },
  { id: '5', name: 'Tina L.', email: 'tina@example.com', orders: 2, totalSpent: 7590, acceptsMarketing: true, createdAt: '2025-02-09' },
  { id: '6', name: 'Ryan Parker', email: 'ryan@example.com', orders: 1, totalSpent: 5295, acceptsMarketing: false, createdAt: '2025-02-07' },
  { id: '7', name: 'Emily Foster', email: 'emily@example.com', orders: 1, totalSpent: 3795, acceptsMarketing: true, createdAt: '2025-02-06' },
]

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = CUSTOMERS.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalCustomers = CUSTOMERS.length
  const subscribedCustomers = CUSTOMERS.filter(c => c.acceptsMarketing).length
  const totalRevenue = CUSTOMERS.reduce((sum, c) => sum + c.totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">View and manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Email Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{subscribedCustomers}</div>
            <p className="text-sm text-gray-500">{Math.round((subscribedCustomers / totalCustomers) * 100)}% of customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>{filteredCustomers.length} customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Marketing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Package className="h-4 w-4" />
                        {customer.orders}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {customer.acceptsMarketing ? (
                        <Badge className="bg-green-100 text-green-700">Subscribed</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Not subscribed</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{customer.createdAt}</td>
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
