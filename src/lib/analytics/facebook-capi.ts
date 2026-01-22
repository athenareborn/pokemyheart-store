/**
 * Facebook Conversions API (Server-Side)
 * For iOS 14.5+ tracking and improved attribution
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto'

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const FB_ACCESS_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN
const FB_API_VERSION = 'v21.0' // Updated to latest stable version (2025)
const FB_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE // Optional: for testing in Events Manager

// ============================================
// TYPES
// ============================================

interface UserData {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  externalId?: string // Customer ID for improved matching (high impact on EMQ)
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

export type EventName =
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
 * Normalize phone number to E.164 format (digits only, with country code)
 * Per Meta specs: remove formatting, keep country code and digits
 * Example: "(555) 123-4567" → "15551234567" (assumes US +1 if no country code)
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // If it's a 10-digit US number, prepend country code
  if (digits.length === 10) {
    return '1' + digits
  }
  return digits
}

/**
 * Normalize and hash user data according to Meta specs
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 *
 * All PII fields: lowercase, trim whitespace, then SHA-256 hash
 * Technical fields (IP, UA, fbc, fbp): send raw, do NOT hash
 */
function hashUserData(userData: UserData) {
  const hashed: Record<string, unknown> = {}

  // PII fields - all require lowercase + trim + SHA-256
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
    // Phone: normalize to E.164 format (digits only with country code), then hash
    const normalizedPhone = normalizePhone(userData.phone)
    if (normalizedPhone) {
      hashed.ph = [sha256(normalizedPhone)]
    }
  }

  // Location data - all require lowercase + trim + SHA-256
  if (userData.city) {
    hashed.ct = [sha256(userData.city)]
  }
  if (userData.state) {
    hashed.st = [sha256(userData.state)]
  }
  if (userData.postalCode) {
    // ZIP: use first 5 chars for US, full code for international
    const zip = userData.postalCode.substring(0, 5)
    hashed.zp = [sha256(zip)]
  }
  if (userData.country) {
    // Country: 2-letter ISO code (sha256 already lowercases)
    hashed.country = [sha256(userData.country)]
  }

  // External ID - high impact on EMQ, hash it
  if (userData.externalId) {
    hashed.external_id = [sha256(userData.externalId)]
  }

  // Technical fields - do NOT hash these
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

  const payload: Record<string, unknown> = {
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

  // Add test event code if configured (for debugging in Events Manager)
  if (FB_TEST_EVENT_CODE) {
    payload.test_event_code = FB_TEST_EVENT_CODE
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
   * Includes all user data fields for maximum EMQ score
   */
  purchase: async (params: {
    eventId: string
    orderUrl: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    externalId?: string
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
        city: params.city,
        state: params.state,
        postalCode: params.postalCode,
        country: params.country,
        externalId: params.externalId,
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
