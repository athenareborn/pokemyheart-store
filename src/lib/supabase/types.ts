export type OrderStatus = 'unfulfilled' | 'processing' | 'fulfilled' | 'cancelled'

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
