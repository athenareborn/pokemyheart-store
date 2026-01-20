import { getInventory } from '@/lib/db/inventory'
import { InventoryClient } from './inventory-client'

export default async function InventoryPage() {
  const { inventory } = await getInventory()
  return <InventoryClient initialInventory={inventory} />
}
