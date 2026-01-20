import { BUNDLES } from './bundles'
import { PRODUCT } from './product'

export interface InventoryItem {
  id: string
  sku: string
  product_id: string
  product_name: string
  bundle_id: string
  bundle_name: string
  quantity: number
  reserved: number
  low_stock_threshold: number
  track_inventory: boolean
  allow_backorder: boolean
  updated_at: string
}

export interface InventoryAdjustment {
  id: string
  inventory_id: string
  adjustment_type: 'add' | 'remove' | 'set'
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  reason: string
  created_at: string
}

// Initial inventory data based on bundles
export const INITIAL_INVENTORY: InventoryItem[] = BUNDLES.map((bundle) => ({
  id: `inv-${bundle.id}`,
  sku: bundle.sku,
  product_id: PRODUCT.id,
  product_name: PRODUCT.name,
  bundle_id: bundle.id,
  bundle_name: bundle.name,
  quantity: bundle.id === 'card-only' ? 25 : bundle.id === 'love-pack' ? 15 : 8,
  reserved: bundle.id === 'love-pack' ? 2 : 0,
  low_stock_threshold: 10,
  track_inventory: true,
  allow_backorder: false,
  updated_at: new Date().toISOString(),
}))

export function getStockStatus(item: InventoryItem): 'in_stock' | 'low_stock' | 'out_of_stock' {
  const available = item.quantity - item.reserved
  if (available <= 0) return 'out_of_stock'
  if (available <= item.low_stock_threshold) return 'low_stock'
  return 'in_stock'
}

export function getAvailableStock(item: InventoryItem): number {
  return Math.max(0, item.quantity - item.reserved)
}
