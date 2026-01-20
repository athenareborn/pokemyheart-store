export type OrderStatus = 'unfulfilled' | 'processing' | 'fulfilled' | 'shipped' | 'cancelled'

// Product Types
export type ProductStatus = 'active' | 'draft'

export interface ProductDesign {
  id: string
  name: string
  image: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  images: string[]
  designs: ProductDesign[]
  stock: number
  status: ProductStatus
  sku: string | null
  created_at: string
  updated_at: string
}

export interface ProductInsert {
  name: string
  slug: string
  description?: string | null
  short_description?: string | null
  price: number
  compare_at_price?: number | null
  images?: string[]
  designs?: ProductDesign[]
  stock?: number
  status?: ProductStatus
  sku?: string | null
}

export interface ProductUpdate {
  name?: string
  slug?: string
  description?: string | null
  short_description?: string | null
  price?: number
  compare_at_price?: number | null
  images?: string[]
  designs?: ProductDesign[]
  stock?: number
  status?: ProductStatus
  sku?: string | null
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string | null
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  shipping_address: ShippingAddress | null
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  created_at: string
  fulfilled_at: string | null
  tracking_number: string | null
}

export interface OrderItem {
  bundle_id: string
  bundle_name: string
  design_id: string
  design_name: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Customer {
  id: string
  email: string
  name: string | null
  orders_count: number
  total_spent: number
  accepts_marketing: boolean
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  event_type: string
  event_data: Record<string, unknown> | null
  session_id: string | null
  created_at: string
}

// Launch TODO Types
export type TodoCategory =
  | 'legal'
  | 'storefront'
  | 'admin'
  | 'backend'
  | 'marketing'
  | 'integrations'
  | 'seo'
  | 'security'
  | 'analytics'
  | 'content'
  | 'payments'
  | 'email'

export type TodoPriority = 'critical' | 'high' | 'medium' | 'low'
export type TodoStatus = 'not_started' | 'in_progress' | 'blocked' | 'done'
export type TodoAssignee = 'human' | 'ai' | 'both'

export interface LaunchTodo {
  id: string
  category: TodoCategory
  subcategory: string | null
  title: string
  description: string | null
  priority: TodoPriority
  status: TodoStatus
  assignee: TodoAssignee
  blocked_by: string[] | null
  notes: string | null
  links: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}
