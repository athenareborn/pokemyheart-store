import { getPostHog } from './posthog'

// Event types for the analytics system
export type AnalyticsEventType =
  | 'page_view'
  | 'session_start'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'checkout_complete'
  | 'purchase'

export interface TrackEventOptions {
  sessionId: string
  visitorId: string
  pagePath?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  referrer?: string
  properties?: Record<string, unknown>
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Generate a unique visitor ID (persistent across sessions)
export function generateVisitorId(): string {
  return `vis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Get or create session ID from sessionStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('pmh_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('pmh_session_id', sessionId)
  }
  return sessionId
}

// Get or create visitor ID from localStorage (persists across sessions)
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('pmh_visitor_id')
  if (!visitorId) {
    visitorId = generateVisitorId()
    localStorage.setItem('pmh_visitor_id', visitorId)
  }
  return visitorId
}

// Detect device type
export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'

  const userAgent = navigator.userAgent.toLowerCase()

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet'
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
    return 'mobile'
  }

  return 'desktop'
}

// Get UTM parameters from URL
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  utmKeys.forEach(key => {
    const value = params.get(key)
    if (value) utm[key] = value
  })

  return utm
}

// Track event to both Supabase and PostHog
export async function trackEvent(
  eventType: AnalyticsEventType,
  options: Partial<TrackEventOptions> = {}
): Promise<void> {
  const sessionId = options.sessionId || getSessionId()
  const visitorId = options.visitorId || getVisitorId()
  const pagePath = options.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '')
  const deviceType = options.deviceType || getDeviceType()
  const referrer = options.referrer || (typeof document !== 'undefined' ? document.referrer : '')

  // Track to PostHog
  const posthog = getPostHog()
  if (posthog) {
    posthog.capture(eventType, {
      session_id: sessionId,
      visitor_id: visitorId,
      page_path: pagePath,
      device_type: deviceType,
      ...options.properties,
    })
  }

  // Track to Supabase via API
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionId,
        visitor_id: visitorId,
        page_path: pagePath,
        device_type: deviceType,
        referrer,
        event_data: options.properties,
      }),
    })
  } catch (error) {
    // Silently fail - don't break the user experience for analytics
    console.error('Analytics tracking error:', error)
  }
}

// Convenience methods for common events
export const analytics = {
  pageView: (pagePath?: string) =>
    trackEvent('page_view', { pagePath }),

  sessionStart: () =>
    trackEvent('session_start', {
      properties: getUTMParams()
    }),

  productView: (productId: string, productName: string, price: number) =>
    trackEvent('product_view', {
      properties: { product_id: productId, product_name: productName, price },
    }),

  addToCart: (productId: string, productName: string, price: number, quantity: number) =>
    trackEvent('add_to_cart', {
      properties: { product_id: productId, product_name: productName, price, quantity },
    }),

  removeFromCart: (productId: string, productName: string) =>
    trackEvent('remove_from_cart', {
      properties: { product_id: productId, product_name: productName },
    }),

  checkoutStart: (cartTotal: number, itemCount: number) =>
    trackEvent('checkout_start', {
      properties: { cart_total: cartTotal, item_count: itemCount },
    }),

  purchase: (orderId: string, total: number, items: unknown[]) =>
    trackEvent('purchase', {
      properties: { order_id: orderId, total, items, item_count: items.length },
    }),
}

export default analytics
