// Analytics utility for FB Pixel and GA4 tracking
// These are safe to call even if the pixels aren't loaded

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export type TrackingProduct = {
  id: string
  name: string
  price: number // in dollars
  quantity: number
  category?: string
  variant?: string
}

// Facebook Pixel Events
export const fbPixel = {
  // Track when user views a product
  viewContent: (product: TrackingProduct) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'USD',
      })
    }
  },

  // Track when user adds to cart
  addToCart: (product: TrackingProduct) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price * product.quantity,
        currency: 'USD',
      })
    }
  },

  // Track when user initiates checkout
  initiateCheckout: (products: TrackingProduct[], totalValue: number) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: products.map(p => p.id),
        content_type: 'product',
        num_items: products.reduce((sum, p) => sum + p.quantity, 0),
        value: totalValue,
        currency: 'USD',
      })
    }
  },

  // Track when payment info is added
  addPaymentInfo: (totalValue: number, paymentMethod: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', {
        value: totalValue,
        currency: 'USD',
        content_category: paymentMethod,
      })
    }
  },

  // Track purchase completion
  purchase: (products: TrackingProduct[], totalValue: number, transactionId: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: products.map(p => p.id),
        content_type: 'product',
        value: totalValue,
        currency: 'USD',
        num_items: products.reduce((sum, p) => sum + p.quantity, 0),
        transaction_id: transactionId,
      })
    }
  },
}

// Google Analytics 4 Events
export const ga4 = {
  // Track when user views a product
  viewItem: (product: TrackingProduct) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          item_category: product.category,
          item_variant: product.variant,
        }],
      })
    }
  },

  // Track when user adds to cart
  addToCart: (product: TrackingProduct) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.price * product.quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          item_category: product.category,
          item_variant: product.variant,
        }],
      })
    }
  },

  // Track when user initiates checkout
  beginCheckout: (products: TrackingProduct[], totalValue: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: totalValue,
        items: products.map(p => ({
          item_id: p.id,
          item_name: p.name,
          price: p.price,
          quantity: p.quantity,
          item_category: p.category,
          item_variant: p.variant,
        })),
      })
    }
  },

  // Track when payment info is added
  addPaymentInfo: (totalValue: number, paymentMethod: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_payment_info', {
        currency: 'USD',
        value: totalValue,
        payment_type: paymentMethod,
      })
    }
  },

  // Track purchase completion
  purchase: (products: TrackingProduct[], totalValue: number, transactionId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'USD',
        value: totalValue,
        items: products.map(p => ({
          item_id: p.id,
          item_name: p.name,
          price: p.price,
          quantity: p.quantity,
          item_category: p.category,
          item_variant: p.variant,
        })),
      })
    }
  },
}

// Combined tracking helper
export const analytics = {
  trackViewContent: (product: TrackingProduct) => {
    fbPixel.viewContent(product)
    ga4.viewItem(product)
  },

  trackAddToCart: (product: TrackingProduct) => {
    fbPixel.addToCart(product)
    ga4.addToCart(product)
  },

  trackInitiateCheckout: (products: TrackingProduct[], totalValue: number) => {
    fbPixel.initiateCheckout(products, totalValue)
    ga4.beginCheckout(products, totalValue)
  },

  trackAddPaymentInfo: (totalValue: number, paymentMethod: string) => {
    fbPixel.addPaymentInfo(totalValue, paymentMethod)
    ga4.addPaymentInfo(totalValue, paymentMethod)
  },

  trackPurchase: (products: TrackingProduct[], totalValue: number, transactionId: string) => {
    fbPixel.purchase(products, totalValue, transactionId)
    ga4.purchase(products, totalValue, transactionId)
  },
}
