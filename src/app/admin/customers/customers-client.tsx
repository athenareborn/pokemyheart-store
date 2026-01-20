'use client'

import { useState } from 'react'
import { Search, Package, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatPrice, formatDate } from '@/lib/utils'
import type { Customer } from '@/lib/supabase/types'

interface CustomerStats {
  total: number
  subscribers: number
  totalRevenue: number
}

interface CustomersClientProps {
  initialCustomers: Customer[]
  stats: CustomerStats
}

export function CustomersClient({ initialCustomers, stats }: CustomersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = initialCustomers.filter(customer =>
    (customer.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const subscriberPercentage = stats.total > 0
    ? Math.round((stats.subscribers / stats.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">View and manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.total.toString()}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Email Subscribers"
          value={stats.subscribers.toString()}
          change={{ value: `${subscriberPercentage}% of customers`, trend: 'neutral' }}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
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
                      <p className="font-medium">{customer.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {customer.orders_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {formatPrice(customer.total_spent)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.accepts_marketing ? (
                      <Badge variant="default">Subscribed</Badge>
                    ) : (
                      <Badge variant="secondary">Not subscribed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.created_at)}
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
