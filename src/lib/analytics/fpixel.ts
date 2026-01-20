/**
 * Facebook Pixel Client-Side Library
 * Based on official Vercel/Next.js example
 * https://github.com/vercel/next.js/tree/canary/examples/with-facebook-pixel
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

// ============================================
// CORE TRACKING FUNCTIONS
// ============================================

/**
 * Track PageView - called automatically on route change
 */
export const pageview = () => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}

/**
 * Track custom events
 * https://developers.facebook.com/docs/facebook-pixel/reference
 */
export const event = (
  name: string,
  options: Record<string, unknown> = {},
  eventId?: string
) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (eventId) {
      window.fbq('track', name, options, { eventID: eventId })
    } else {
      window.fbq('track', name, options)
    }
  }
}

// ============================================
// E-COMMERCE STANDARD EVENTS
// ============================================

interface ViewContentParams {
  content_ids: string[]
  content_name: string
  content_type: 'product'
  value: number
  currency: string
}

interface AddToCartParams {
  content_ids: string[]
  content_name: string
  content_type: 'product'
  value: number
  currency: string
}

interface InitiateCheckoutParams {
  content_ids?: string[]
  value: number
  currency: string
  num_items: number
}

interface PurchaseParams {
  content_ids: string[]
  content_name?: string
  content_type: 'product'
  value: number
  currency: string
  num_items: number
}

/**
 * ViewContent - When a user views a product page
 * Required for Dynamic Ads
 */
export const viewContent = (params: ViewContentParams) => {
  event('ViewContent', params as unknown as Record<string, unknown>)
}

/**
 * AddToCart - When a user adds item to cart
 * Required for Dynamic Ads
 */
export const addToCart = (params: AddToCartParams, eventId?: string) => {
  event('AddToCart', params as unknown as Record<string, unknown>, eventId)
}

/**
 * InitiateCheckout - When checkout begins
 */
export const initiateCheckout = (params: InitiateCheckoutParams, eventId?: string) => {
  event('InitiateCheckout', params as unknown as Record<string, unknown>, eventId)
}

/**
 * Purchase - When order is completed
 * REQUIRED: value and currency
 */
export const purchase = (params: PurchaseParams, eventId?: string) => {
  event('Purchase', params as unknown as Record<string, unknown>, eventId)
}

// ============================================
// CONVENIENCE WRAPPER
// ============================================

export const fbPixel = {
  pageview,
  event,

  /**
   * Track product view
   */
  viewContent: (
    productId: string,
    productName: string,
    value: number,
    currency: string = 'USD'
  ) => {
    viewContent({
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
      value,
      currency,
    })
  },

  /**
   * Track add to cart
   */
  addToCart: (
    productId: string,
    productName: string,
    value: number,
    currency: string = 'USD',
    eventId?: string
  ) => {
    addToCart(
      {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value,
        currency,
      },
      eventId
    )
  },

  /**
   * Track checkout initiation
   */
  initiateCheckout: (
    value: number,
    numItems: number,
    contentIds?: string[],
    currency: string = 'USD',
    eventId?: string
  ) => {
    initiateCheckout(
      {
        content_ids: contentIds,
        value,
        currency,
        num_items: numItems,
      },
      eventId
    )
  },

  /**
   * Track purchase completion
   */
  purchase: (
    orderId: string,
    value: number,
    numItems: number,
    contentIds: string[],
    currency: string = 'USD',
    eventId?: string
  ) => {
    purchase(
      {
        content_ids: contentIds,
        content_name: `Order ${orderId}`,
        content_type: 'product',
        value,
        currency,
        num_items: numItems,
      },
      eventId
    )
  },
}
