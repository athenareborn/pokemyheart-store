'use client'

import { useState } from 'react'
import { Search, Package, DollarSign, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

// Proper CSV escaping - handles commas, quotes, and newlines
function escapeCSV(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

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

  // Export for Meta Ads Custom Audience (with value for value-based lookalikes)
  const exportForMetaAds = (type: 'all' | 'high-value' | 'repeat') => {
    let customersToExport = initialCustomers
    let filename = 'customers-all'

    if (type === 'high-value') {
      customersToExport = initialCustomers.filter(c => c.total_spent >= 5000) // $50+
      filename = 'customers-high-value'
    } else if (type === 'repeat') {
      customersToExport = initialCustomers.filter(c => c.orders_count >= 2)
      filename = 'customers-repeat'
    }

    // Meta Ads format: email, fn (first name), ln (last name), value
    const headers = ['email', 'fn', 'ln', 'value']
    const rows = customersToExport.map(c => {
      const nameParts = (c.name || '').trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      return [
        escapeCSV(c.email),
        escapeCSV(firstName),
        escapeCSV(lastName),
        ((c.total_spent || 0) / 100).toFixed(2) // Convert cents to dollars
      ]
    })

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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

      {/* Search + Export */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Export for Meta Ads:</span>
          <Button variant="outline" size="sm" onClick={() => exportForMetaAds('all')}>
            <Download className="h-4 w-4 mr-1" />
            All
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportForMetaAds('high-value')}>
            <Download className="h-4 w-4 mr-1" />
            High Value ($50+)
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportForMetaAds('repeat')}>
            <Download className="h-4 w-4 mr-1" />
            Repeat Buyers
          </Button>
        </div>
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
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? 'No customers match your search' : 'No customers yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
