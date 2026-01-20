import { createClient } from '@/lib/supabase/server'
import type { InventoryItem, InventoryAdjustment } from '@/data/inventory'
import { INITIAL_INVENTORY } from '@/data/inventory'

// In-memory cache for development (when Supabase table doesn't exist)
let inventoryCache: InventoryItem[] = [...INITIAL_INVENTORY]
let adjustmentsCache: InventoryAdjustment[] = []

export async function getInventory(): Promise<{
  inventory: InventoryItem[]
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('bundle_name', { ascending: true })

    if (error) {
      // If table doesn't exist, use in-memory data
      if (error.code === '42P01' || error.message?.includes('relation')) {
        console.log('Inventory table not found, using in-memory data')
        return { inventory: inventoryCache, error: null }
      }
      throw error
    }

    return { inventory: data as InventoryItem[], error: null }
  } catch (err) {
    console.error('Error fetching inventory:', err)
    // Fallback to in-memory data
    return { inventory: inventoryCache, error: null }
  }
}

export async function getInventoryItem(id: string): Promise<{
  item: InventoryItem | null
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // Fallback to in-memory
      const item = inventoryCache.find(i => i.id === id) || null
      return { item, error: null }
    }

    return { item: data as InventoryItem, error: null }
  } catch (err) {
    console.error('Error fetching inventory item:', err)
    const item = inventoryCache.find(i => i.id === id) || null
    return { item, error: null }
  }
}

export async function updateInventoryQuantity(
  id: string,
  quantity: number,
  reason: string = 'Manual adjustment'
): Promise<{
  item: InventoryItem | null
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    // Get current item
    const { item: currentItem } = await getInventoryItem(id)
    if (!currentItem) {
      return { item: null, error: new Error('Inventory item not found') }
    }

    const previousQuantity = currentItem.quantity
    const newQuantity = Math.max(0, quantity)

    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Update in-memory cache
      const index = inventoryCache.findIndex(i => i.id === id)
      if (index !== -1) {
        inventoryCache[index] = {
          ...inventoryCache[index],
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        }

        // Log adjustment
        const adjustment: InventoryAdjustment = {
          id: `adj-${Date.now()}`,
          inventory_id: id,
          adjustment_type: 'set',
          quantity_change: newQuantity - previousQuantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason,
          created_at: new Date().toISOString(),
        }
        adjustmentsCache.unshift(adjustment)

        return { item: inventoryCache[index], error: null }
      }
      throw error
    }

    // Log adjustment in database
    await logInventoryAdjustment({
      inventory_id: id,
      adjustment_type: 'set',
      quantity_change: newQuantity - previousQuantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reason,
    })

    return { item: data as InventoryItem, error: null }
  } catch (err) {
    console.error('Error updating inventory:', err)

    // Fallback to in-memory update
    const index = inventoryCache.findIndex(i => i.id === id)
    if (index !== -1) {
      const previousQuantity = inventoryCache[index].quantity
      const newQuantity = Math.max(0, quantity)
      inventoryCache[index] = {
        ...inventoryCache[index],
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      }

      const adjustment: InventoryAdjustment = {
        id: `adj-${Date.now()}`,
        inventory_id: id,
        adjustment_type: 'set',
        quantity_change: newQuantity - previousQuantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason,
        created_at: new Date().toISOString(),
      }
      adjustmentsCache.unshift(adjustment)

      return { item: inventoryCache[index], error: null }
    }

    return { item: null, error: err as Error }
  }
}

export async function adjustInventory(
  id: string,
  adjustment: number,
  type: 'add' | 'remove',
  reason: string = 'Manual adjustment'
): Promise<{
  item: InventoryItem | null
  error: Error | null
}> {
  const { item: currentItem } = await getInventoryItem(id)
  if (!currentItem) {
    return { item: null, error: new Error('Inventory item not found') }
  }

  const newQuantity = type === 'add'
    ? currentItem.quantity + Math.abs(adjustment)
    : currentItem.quantity - Math.abs(adjustment)

  return updateInventoryQuantity(id, newQuantity, reason)
}

export async function updateLowStockThreshold(
  id: string,
  threshold: number
): Promise<{
  item: InventoryItem | null
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('inventory')
      .update({
        low_stock_threshold: Math.max(0, threshold),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Update in-memory cache
      const index = inventoryCache.findIndex(i => i.id === id)
      if (index !== -1) {
        inventoryCache[index] = {
          ...inventoryCache[index],
          low_stock_threshold: Math.max(0, threshold),
          updated_at: new Date().toISOString(),
        }
        return { item: inventoryCache[index], error: null }
      }
      throw error
    }

    return { item: data as InventoryItem, error: null }
  } catch (err) {
    console.error('Error updating threshold:', err)

    // Fallback to in-memory
    const index = inventoryCache.findIndex(i => i.id === id)
    if (index !== -1) {
      inventoryCache[index] = {
        ...inventoryCache[index],
        low_stock_threshold: Math.max(0, threshold),
        updated_at: new Date().toISOString(),
      }
      return { item: inventoryCache[index], error: null }
    }

    return { item: null, error: err as Error }
  }
}

async function logInventoryAdjustment(adjustment: Omit<InventoryAdjustment, 'id' | 'created_at'>) {
  try {
    const supabase = await createClient()

    await supabase
      .from('inventory_adjustments')
      .insert({
        ...adjustment,
        created_at: new Date().toISOString(),
      })
  } catch (err) {
    // Silently fail - adjustments logging is not critical
    console.error('Error logging adjustment:', err)
  }
}

export async function getInventoryAdjustments(inventoryId?: string): Promise<{
  adjustments: InventoryAdjustment[]
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('inventory_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (inventoryId) {
      query = query.eq('inventory_id', inventoryId)
    }

    const { data, error } = await query

    if (error) {
      // Fallback to in-memory
      const filtered = inventoryId
        ? adjustmentsCache.filter(a => a.inventory_id === inventoryId)
        : adjustmentsCache
      return { adjustments: filtered.slice(0, 50), error: null }
    }

    return { adjustments: data as InventoryAdjustment[], error: null }
  } catch (err) {
    console.error('Error fetching adjustments:', err)
    const filtered = inventoryId
      ? adjustmentsCache.filter(a => a.inventory_id === inventoryId)
      : adjustmentsCache
    return { adjustments: filtered.slice(0, 50), error: null }
  }
}

// Get low stock items
export async function getLowStockItems(): Promise<{
  items: InventoryItem[]
  error: Error | null
}> {
  const { inventory, error } = await getInventory()

  if (error) {
    return { items: [], error }
  }

  const lowStock = inventory.filter(item => {
    const available = item.quantity - item.reserved
    return item.track_inventory && available <= item.low_stock_threshold
  })

  return { items: lowStock, error: null }
}
