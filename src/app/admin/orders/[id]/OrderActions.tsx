'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, RefreshCw, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Order, OrderStatus } from '@/lib/supabase/types'

interface OrderActionsProps {
  order: Order
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showFulfillDialog, setShowFulfillDialog] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')

  const updateOrderStatus = async (status: OrderStatus, tracking?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status,
          trackingNumber: tracking,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Refresh the page to show updated data
      router.refresh()
      setShowFulfillDialog(false)
      setTrackingNumber('')
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFulfill = () => {
    updateOrderStatus('fulfilled', trackingNumber || undefined)
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus('cancelled')
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {order.status === 'unfulfilled' && (
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowFulfillDialog(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            Fulfill order
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.print()}>
              Print packing slip
            </DropdownMenuItem>
            <DropdownMenuItem>Send invoice</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refund order
            </DropdownMenuItem>
            {order.status !== 'cancelled' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleCancel}
              >
                Cancel order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fulfill Order Dialog */}
      <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfill Order {order.order_number}</DialogTitle>
            <DialogDescription>
              Mark this order as fulfilled and optionally add a tracking number.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tracking">Tracking Number (optional)</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFulfillDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleFulfill} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Truck className="h-4 w-4 mr-2" />
              )}
              Fulfill Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
