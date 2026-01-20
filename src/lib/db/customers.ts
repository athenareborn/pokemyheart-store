import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/lib/supabase/types'

export async function getCustomers(options?: {
  limit?: number
  offset?: number
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.search) {
    query = query.or(`email.ilike.%${options.search}%,name.ilike.%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return { customers: [], count: 0, error }
  }

  return { customers: data as Customer[], count: count || 0, error: null }
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return { customer: null, error }
  }

  return { customer: data as Customer, error: null }
}

export async function getCustomerByEmail(email: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer:', error)
    return { customer: null, error }
  }

  return { customer: data as Customer | null, error: null }
}

export async function getCustomerStats() {
  const supabase = await createClient()

  const { data: customers, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })

  if (!customers) return { total: 0, subscribers: 0, totalRevenue: 0 }

  const subscribers = customers.filter(c => c.accepts_marketing).length
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)

  return {
    total: count || 0,
    subscribers,
    totalRevenue,
  }
}
