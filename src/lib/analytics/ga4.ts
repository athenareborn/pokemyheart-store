/**
 * Google Analytics 4 Client-Side Library
 * Optimized for Google Ads conversion tracking
 *
 * Events tracked:
 * - page_view: Automatic on route change
 * - view_item: Product page views (remarketing)
 * - add_to_cart: Cart additions (cart abandonment audiences)
 * - begin_checkout: Checkout initiation (checkout abandonment)
 * - purchase: Order completion (PRIMARY CONVERSION)
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

// ============================================
// TYPES
// ============================================

interface ItemParams {
  itemId: string
  itemName: string
  price: number
  quantity?: number
}

interface ViewItemParams {
  itemId: string
  itemName: string
  price: number
  currency?: string
}

interface AddToCartParams {
  itemId: string
  itemName: string
  price: number
  quantity: number
  currency?: string
}

interface BeginCheckoutParams {
  value: number
  items: ItemParams[]
  currency?: string
}

interface PurchaseParams {
  transactionId: string
  value: number
  items: ItemParams[]
  currency?: string
}

interface UserDataParams {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if gtag is available
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Map items to GA4 format
 */
function mapItemsToGA4(items: ItemParams[]) {
  return items.map(item => ({
    item_id: item.itemId,
    item_name: item.itemName,
    price: item.price,
    quantity: item.quantity || 1,
  }))
}

// ============================================
// GA4 TRACKING FUNCTIONS
// ============================================

export const ga4 = {
  /**
   * Track page view
   * Called automatically on route change by GoogleAnalytics component
   */
  pageView: (url: string) => {
    if (!isGtagAvailable() || !GA_MEASUREMENT_ID) return
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  },

  /**
   * Track product view
   * Fires when user views a product page
   * Used for: Remarketing audiences in Google Ads
   */
  viewItem: (params: ViewItemParams) => {
    if (!isGtagAvailable()) return
    window.gtag('event', 'view_item', {
      currency: params.currency || 'USD',
      value: params.price,
      items: [{
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
      }]
    })
  },

  /**
   * Track add to cart
   * Fires when user adds item to cart
   * Used for: Cart abandonment audiences in Google Ads
   */
  addToCart: (params: AddToCartParams) => {
    if (!isGtagAvailable()) return
    window.gtag('event', 'add_to_cart', {
      currency: params.currency || 'USD',
      value: params.price * params.quantity,
      items: [{
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        quantity: params.quantity,
      }]
    })
  },

  /**
   * Track checkout initiation
   * Fires when user starts checkout
   * Used for: Checkout abandonment audiences in Google Ads
   */
  beginCheckout: (params: BeginCheckoutParams) => {
    if (!isGtagAvailable()) return
    window.gtag('event', 'begin_checkout', {
      currency: params.currency || 'USD',
      value: params.value,
      items: mapItemsToGA4(params.items),
    })
  },

  /**
   * Track purchase
   * PRIMARY CONVERSION for Google Ads
   * Fires on order completion
   */
  purchase: (params: PurchaseParams) => {
    if (!isGtagAvailable()) return
    window.gtag('event', 'purchase', {
      transaction_id: params.transactionId,
      currency: params.currency || 'USD',
      value: params.value,
      items: mapItemsToGA4(params.items),
    })
  },

  /**
   * Set user data for enhanced conversions
   * gtag automatically hashes this data before sending
   * Call this before purchase events for better attribution
   */
  setUserData: (params: UserDataParams) => {
    if (!isGtagAvailable()) return

    const userData: Record<string, unknown> = {}

    if (params.email) {
      userData.email = params.email
    }
    if (params.phone) {
      userData.phone_number = params.phone
    }

    // Address data
    const address: Record<string, string> = {}
    if (params.firstName) address.first_name = params.firstName
    if (params.lastName) address.last_name = params.lastName
    if (params.street) address.street = params.street
    if (params.city) address.city = params.city
    if (params.region) address.region = params.region
    if (params.postalCode) address.postal_code = params.postalCode
    if (params.country) address.country = params.country

    if (Object.keys(address).length > 0) {
      userData.address = address
    }

    window.gtag('set', 'user_data', userData)
  },

  /**
   * Get GA4 client ID for server-side tracking
   * The client ID is stored in the _ga cookie
   * Returns null if gtag not available or times out
   */
  getClientId: (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isGtagAvailable() || !GA_MEASUREMENT_ID) {
        resolve(null)
        return
      }

      let resolved = false

      // Try to get client ID via gtag
      window.gtag('get', GA_MEASUREMENT_ID, 'client_id', (clientId: string) => {
        if (!resolved) {
          resolved = true
          resolve(clientId || null)
        }
      })

      // Timeout fallback - try to read from _ga cookie
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          // Fallback: try to extract from _ga cookie
          const gaCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('_ga='))

          if (gaCookie) {
            // _ga cookie format: GA1.1.XXXXXXXXXX.YYYYYYYYYY
            // Client ID is the last two parts: XXXXXXXXXX.YYYYYYYYYY
            const parts = gaCookie.split('.')
            if (parts.length >= 4) {
              resolve(`${parts[2]}.${parts[3]}`)
              return
            }
          }
          resolve(null)
        }
      }, 1000)
    })
  },

  /**
   * Track custom event
   * For any additional events not covered above
   */
  event: (eventName: string, params: Record<string, unknown> = {}) => {
    if (!isGtagAvailable()) return
    window.gtag('event', eventName, params)
  },
}
