import { createClient } from '@/lib/supabase/server'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/lib/supabase/types'

export async function getProducts(options?: {
  status?: ProductStatus
  limit?: number
  offset?: number
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0, error }
  }

  return { products: data as Product[], count: count || 0, error: null }
}

export async function getProductById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function createProduct(productData: ProductInsert) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      images: productData.images || [],
      designs: productData.designs || [],
      stock: productData.stock ?? 0,
      status: productData.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function updateProduct(id: string, productData: ProductUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...productData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

export async function updateProductStock(id: string, stock: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      stock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product stock:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product status:', error)
    return { product: null, error }
  }

  return { product: data as Product, error: null }
}

export async function getProductStats() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('stock, status')

  if (error || !products) {
    return { totalProducts: 0, activeProducts: 0, draftProducts: 0, totalStock: 0 }
  }

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const draftProducts = products.filter(p => p.status === 'draft').length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)

  return {
    totalProducts,
    activeProducts,
    draftProducts,
    totalStock,
  }
}

// Helper to generate a slug from a product name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
