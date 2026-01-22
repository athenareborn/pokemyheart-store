/**
 * Facebook Conversions API (Server-Side)
 * For iOS 14.5+ tracking and improved attribution
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto'

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const FB_ACCESS_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN
const FB_API_VERSION = 'v19.0'

// ============================================
// TYPES
// ============================================

interface UserData {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  ip?: string
  userAgent?: string
  fbc?: string // Click ID from _fbc cookie
  fbp?: string // Browser ID from _fbp cookie
}

interface CustomData {
  value?: number
  currency?: string
  content_ids?: string[]
  content_type?: string
  content_name?: string
  num_items?: number
  order_id?: string
}

type EventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'

interface ServerEventParams {
  eventName: EventName
  eventId: string
  eventSourceUrl: string
  userData: UserData
  customData?: CustomData
}

// ============================================
// HASHING FUNCTIONS
// ============================================

/**
 * SHA256 hash for user data (required by Meta)
 */
function sha256(value: string): string {
  return createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex')
}

/**
 * Normalize and hash user data according to Meta specs
 */
function hashUserData(userData: UserData) {
  const hashed: Record<string, unknown> = {}

  if (userData.email) {
    hashed.em = [sha256(userData.email)]
  }
  if (userData.firstName) {
    hashed.fn = [sha256(userData.firstName)]
  }
  if (userData.lastName) {
    hashed.ln = [sha256(userData.lastName)]
  }
  if (userData.phone) {
    // Remove non-digits before hashing
    hashed.ph = [sha256(userData.phone.replace(/\D/g, ''))]
  }
  if (userData.ip) {
    hashed.client_ip_address = userData.ip
  }
  if (userData.userAgent) {
    hashed.client_user_agent = userData.userAgent
  }
  if (userData.fbc) {
    hashed.fbc = userData.fbc
  }
  if (userData.fbp) {
    hashed.fbp = userData.fbp
  }

  return hashed
}

// ============================================
// CORE API FUNCTION
// ============================================

/**
 * Send event to Facebook Conversions API
 */
export async function sendServerEvent(params: ServerEventParams): Promise<{
  success: boolean
  eventsReceived?: number
  error?: string
}> {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    console.warn('Facebook CAPI not configured - missing PIXEL_ID or ACCESS_TOKEN')
    return { success: false, error: 'Not configured' }
  }

  const payload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId, // Must match client-side for deduplication
        event_source_url: params.eventSourceUrl,
        action_source: 'website',
        user_data: hashUserData(params.userData),
        custom_data: params.customData,
      },
    ],
  }

  try {
    const url = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Facebook CAPI Error:', result)
      return { success: false, error: result.error?.message || 'API Error' }
    }

    return {
      success: true,
      eventsReceived: result.events_received,
    }
  } catch (error) {
    console.error('Facebook CAPI Request Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const fbCAPI = {
  /**
   * Track purchase event server-side
   */
  purchase: async (params: {
    eventId: string
    orderUrl: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    value: number
    currency: string
    contentIds: string[]
    numItems: number
    orderId?: string
    ip?: string
    userAgent?: string
    fbc?: string
    fbp?: string
  }) => {
    return sendServerEvent({
      eventName: 'Purchase',
      eventId: params.eventId,
      eventSourceUrl: params.orderUrl,
      userData: {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone,
        ip: params.ip,
        userAgent: params.userAgent,
        fbc: params.fbc,
        fbp: params.fbp,
      },
      customData: {
        value: params.value,
        currency: params.currency,
        content_ids: params.contentIds,
        content_type: 'product',
        num_items: params.numItems,
        order_id: params.orderId,
      },
    })
  },

  /**
   * Track add to cart event server-side (optional, usually client-side is enough)
   */
  addToCart: async (params: {
    eventId: string
    pageUrl: string
    email?: string
    value: number
    currency: string
    contentIds: string[]
    ip?: string
    userAgent?: string
  }) => {
    return sendServerEvent({
      eventName: 'AddToCart',
      eventId: params.eventId,
      eventSourceUrl: params.pageUrl,
      userData: {
        email: params.email,
        ip: params.ip,
        userAgent: params.userAgent,
      },
      customData: {
        value: params.value,
        currency: params.currency,
        content_ids: params.contentIds,
        content_type: 'product',
      },
    })
  },

  /**
   * Track initiate checkout server-side (optional)
   */
  initiateCheckout: async (params: {
    eventId: string
    pageUrl: string
    email?: string
    value: number
    currency: string
    numItems: number
    contentIds?: string[]
    ip?: string
    userAgent?: string
  }) => {
    return sendServerEvent({
      eventName: 'InitiateCheckout',
      eventId: params.eventId,
      eventSourceUrl: params.pageUrl,
      userData: {
        email: params.email,
        ip: params.ip,
        userAgent: params.userAgent,
      },
      customData: {
        value: params.value,
        currency: params.currency,
        content_ids: params.contentIds,
        num_items: params.numItems,
      },
    })
  },
}

/**
 * Generate a unique event ID for deduplication
 * Use same ID for both client-side pixel and server-side CAPI
 */
export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get Facebook attribution cookies (fbc and fbp)
 * Checks localStorage first (persisted), then falls back to cookies
 * Use this everywhere you need fbc/fbp for consistent attribution
 */
export function getFbCookies(): { fbc: string | undefined; fbp: string | undefined } {
  if (typeof window === 'undefined') {
    return { fbc: undefined, fbp: undefined }
  }

  // Try localStorage first (persisted across sessions)
  let fbc = localStorage.getItem('_fbc') || undefined
  let fbp = localStorage.getItem('_fbp') || undefined

  // Fall back to cookies if not in localStorage
  if (!fbc) {
    const fbcMatch = document.cookie.match(/(^| )_fbc=([^;]+)/)
    fbc = fbcMatch ? fbcMatch[2] : undefined
  }

  if (!fbp) {
    const fbpMatch = document.cookie.match(/(^| )_fbp=([^;]+)/)
    fbp = fbpMatch ? fbpMatch[2] : undefined
  }

  return { fbc, fbp }
}
