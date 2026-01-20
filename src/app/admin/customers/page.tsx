'use client'

import { useState } from 'react'
import { Search, Package, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/admin'
import { formatPrice } from '@/lib/utils'

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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">View and manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Email Subscribers"
          value={subscribedCustomers.toString()}
          change={{ value: `${Math.round((subscribedCustomers / totalCustomers) * 100)}% of customers`, trend: 'neutral' }}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">All Customers</CardTitle>
          <CardDescription>{filteredCustomers.length} customers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {customer.orders}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {formatPrice(customer.totalSpent)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.acceptsMarketing ? (
                      <Badge variant="default">Subscribed</Badge>
                    ) : (
                      <Badge variant="secondary">Not subscribed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
