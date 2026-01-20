'use client'

import { useState } from 'react'
import { Package, AlertTriangle, CheckCircle, Edit2, Save, X, Plus, Minus, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/data/inventory'
import { getStockStatus, getAvailableStock } from '@/data/inventory'

interface InventoryClientProps {
  initialInventory: InventoryItem[]
}

export function InventoryClient({ initialInventory }: InventoryClientProps) {
  const [inventory, setInventory] = useState(initialInventory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustValue, setAdjustValue] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // Summary stats
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0)
  const lowStockItems = inventory.filter(item => {
    const status = getStockStatus(item)
    return status === 'low_stock' || status === 'out_of_stock'
  })

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditValue(String(item.quantity))
    setAdjustingId(null)
  }

  const handleSave = async (id: string) => {
    const newQuantity = parseInt(editValue, 10)
    if (isNaN(newQuantity) || newQuantity < 0) return

    setLoading(id)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: newQuantity }),
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(prev =>
          prev.map(item => item.id === id ? data.item : item)
        )
      }
    } catch (err) {
      console.error('Failed to update inventory:', err)
    } finally {
      setLoading(null)
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleAdjust = async (id: string, type: 'add' | 'remove') => {
    const adjustment = parseInt(adjustValue, 10)
    if (isNaN(adjustment) || adjustment <= 0) return

    setLoading(id)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, adjustment, adjustmentType: type }),
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(prev =>
          prev.map(item => item.id === id ? data.item : item)
        )
        setAdjustingId(null)
        setAdjustValue('')
      }
    } catch (err) {
      console.error('Failed to adjust inventory:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleRefresh = async () => {
    setLoading('refresh')
    try {
      const response = await fetch('/api/admin/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
      }
    } catch (err) {
      console.error('Failed to refresh inventory:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
    setAdjustingId(null)
    setAdjustValue('')
  }

  const getStatusBadge = (item: InventoryItem) => {
    const status = getStockStatus(item)
    const available = getAvailableStock(item)

    switch (status) {
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="h-3 w-3" />
            Out of Stock
          </span>
        )
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <TrendingDown className="h-3 w-3" />
            Low ({available})
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3 w-3" />
            In Stock
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage stock levels for all products</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading === 'refresh'}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', loading === 'refresh' && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-semibold">{totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-semibold">{totalReserved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={lowStockItems.length > 0 ? 'border-amber-200 bg-amber-50/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                lowStockItems.length > 0 ? 'bg-red-100' : 'bg-emerald-100'
              )}>
                <AlertTriangle className={cn(
                  'h-5 w-5',
                  lowStockItems.length > 0 ? 'text-red-600' : 'text-emerald-600'
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-semibold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Levels</CardTitle>
          <CardDescription>Click edit to change quantity, or use +/- to adjust</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product / Bundle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    On Hand
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => {
                  const status = getStockStatus(item)
                  const isEditing = editingId === item.id
                  const isAdjusting = adjustingId === item.id
                  const isLoading = loading === item.id

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'hover:bg-muted/50',
                        status === 'out_of_stock' && 'bg-red-50',
                        status === 'low_stock' && 'bg-amber-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{item.product_name}</div>
                            <div className="text-xs text-muted-foreground">{item.bundle_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 text-right h-8"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span className={cn(
                            'text-sm font-semibold',
                            status === 'out_of_stock' && 'text-red-600',
                            status === 'low_stock' && 'text-amber-600'
                          )}>
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {item.reserved}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          'text-sm font-semibold',
                          status === 'out_of_stock' && 'text-red-600',
                          status === 'low_stock' && 'text-amber-600',
                          status === 'in_stock' && 'text-emerald-600'
                        )}>
                          {getAvailableStock(item)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSave(item.id)}
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : isAdjusting ? (
                          <div className="flex items-center justify-end gap-1">
                            <Input
                              type="number"
                              value={adjustValue}
                              onChange={(e) => setAdjustValue(e.target.value)}
                              className="w-16 text-right h-8"
                              min="1"
                              placeholder="Qty"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjust(item.id, 'add')}
                              disabled={isLoading || !adjustValue}
                              className="h-8 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjust(item.id, 'remove')}
                              disabled={isLoading || !adjustValue}
                              className="h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAdjustingId(item.id)
                                setEditingId(null)
                              }}
                              className="h-8"
                            >
                              <Plus className="h-3 w-3" />
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base text-amber-800">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} attention.
              Consider restocking to avoid stockouts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <span
                  key={item.id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-amber-200"
                >
                  {item.bundle_name}: {getAvailableStock(item)} left
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
