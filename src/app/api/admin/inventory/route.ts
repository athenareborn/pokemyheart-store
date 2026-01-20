import { NextRequest, NextResponse } from 'next/server'
import {
  getInventory,
  updateInventoryQuantity,
  adjustInventory,
  updateLowStockThreshold,
  getInventoryAdjustments,
} from '@/lib/db/inventory'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeAdjustments = searchParams.get('includeAdjustments') === 'true'
    const inventoryId = searchParams.get('inventoryId')

    const { inventory, error } = await getInventory()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      )
    }

    let response: Record<string, unknown> = { inventory }

    if (includeAdjustments) {
      const { adjustments } = await getInventoryAdjustments(inventoryId || undefined)
      response.adjustments = adjustments
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity, adjustment, adjustmentType, threshold, reason } = body as {
      id: string
      quantity?: number
      adjustment?: number
      adjustmentType?: 'add' | 'remove'
      threshold?: number
      reason?: string
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory item ID is required' },
        { status: 400 }
      )
    }

    // Update low stock threshold
    if (threshold !== undefined) {
      const { item, error } = await updateLowStockThreshold(id, threshold)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update threshold' },
          { status: 500 }
        )
      }

      return NextResponse.json({ item })
    }

    // Adjust inventory (add or remove)
    if (adjustment !== undefined && adjustmentType) {
      const { item, error } = await adjustInventory(
        id,
        adjustment,
        adjustmentType,
        reason || `${adjustmentType === 'add' ? 'Added' : 'Removed'} ${adjustment} units`
      )

      if (error) {
        return NextResponse.json(
          { error: 'Failed to adjust inventory' },
          { status: 500 }
        )
      }

      return NextResponse.json({ item })
    }

    // Set exact quantity
    if (quantity !== undefined) {
      const { item, error } = await updateInventoryQuantity(
        id,
        quantity,
        reason || 'Manual quantity update'
      )

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update inventory' },
          { status: 500 }
        )
      }

      return NextResponse.json({ item })
    }

    return NextResponse.json(
      { error: 'Quantity, adjustment, or threshold is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
