import { getCustomers, getCustomerStats } from '@/lib/db/customers'
import { CustomersClient } from './customers-client'

export default async function CustomersPage() {
  const { customers } = await getCustomers()
  const stats = await getCustomerStats()

  return <CustomersClient initialCustomers={customers} stats={stats} />
}
