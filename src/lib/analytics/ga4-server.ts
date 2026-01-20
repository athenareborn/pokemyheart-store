/**
 * Google Analytics 4 Server-Side (Measurement Protocol)
 * For reliable conversion tracking with Google Ads
 *
 * Pattern matches facebook-capi.ts
 *
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

import { createHash } from 'crypto'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GA_API_SECRET = process.env.GA_API_SECRET

// ============================================
// TYPES
// ============================================

interface UserData {
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

interface Item {
  itemId: string
  itemName: string
  price: number
  quantity: number
}

interface PurchaseParams {
  clientId: string // GA client ID from _ga cookie
  transactionId: string
  value: number
  currency: string
  items: Item[]
  userData?: UserData
  sessionId?: string
  timestamp?: number
}

// ============================================
// HASHING FUNCTIONS
// ============================================

/**
 * SHA256 hash for enhanced conversions
 * Google requires lowercase, trimmed values before hashing
 */
function sha256(value: string): string {
  return createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex')
}

/**
 * Normalize phone number to E.164 format before hashing
 * Google requires E.164 format: +[country code][number]
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If US number without country code (10 digits), add +1
  if (!digits.startsWith('1') && digits.length === 10) {
    return '+1' + digits
  }

  // If starts with 1 and has 11 digits (US with country code)
  if (digits.startsWith('1') && digits.length === 11) {
    return '+' + digits
  }

  // Otherwise assume international, just add +
  return '+' + digits
}

// ============================================
// CORE API FUNCTION
// ============================================

/**
 * Send event to GA4 via Measurement Protocol
 */
async function sendMeasurementProtocolEvent(payload: Record<string, unknown>): Promise<{
  success: boolean
  error?: string
}> {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    console.warn('GA4 Measurement Protocol not configured - missing MEASUREMENT_ID or API_SECRET')
    return { success: false, error: 'Not configured' }
  }

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // GA4 Measurement Protocol returns 204 No Content on success
    if (response.status === 204 || response.ok) {
      return { success: true }
    }

    const errorText = await response.text()
    console.error('GA4 Measurement Protocol Error:', response.status, errorText)
    return { success: false, error: `HTTP ${response.status}: ${errorText}` }
  } catch (error) {
    console.error('GA4 Measurement Protocol Request Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// GA4 SERVER TRACKING
// ============================================

export const ga4Server = {
  /**
   * Server-side purchase event via Measurement Protocol
   *
   * CRITICAL for Google Ads conversion tracking
   * Includes enhanced conversions data (hashed user data)
   *
   * @param params - Purchase event parameters
   * @returns Promise with success status
   */
  purchase: async (params: PurchaseParams): Promise<{ success: boolean; error?: string }> => {
    // Build user_data object with hashed values for enhanced conversions
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/user-properties
    const userData: Record<string, unknown> = {}

    if (params.userData) {
      // Hashed email (most important for matching)
      if (params.userData.email) {
        userData.sha256_email_address = sha256(params.userData.email)
      }

      // Hashed phone (E.164 format)
      if (params.userData.phone) {
        userData.sha256_phone_number = sha256(normalizePhone(params.userData.phone))
      }

      // Hashed name
      if (params.userData.firstName) {
        userData['address.sha256_first_name'] = sha256(params.userData.firstName)
      }
      if (params.userData.lastName) {
        userData['address.sha256_last_name'] = sha256(params.userData.lastName)
      }

      // Hashed street
      if (params.userData.street) {
        userData['address.sha256_street'] = sha256(params.userData.street)
      }

      // Plain text address components (not hashed)
      if (params.userData.city) {
        userData['address.city'] = params.userData.city
      }
      if (params.userData.region) {
        userData['address.region'] = params.userData.region
      }
      if (params.userData.postalCode) {
        userData['address.postal_code'] = params.userData.postalCode
      }
      if (params.userData.country) {
        userData['address.country'] = params.userData.country
      }
    }

    // Build the event payload
    const payload = {
      client_id: params.clientId,
      timestamp_micros: String((params.timestamp || Date.now()) * 1000),
      user_data: Object.keys(userData).length > 0 ? userData : undefined,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: params.transactionId,
          currency: params.currency,
          value: params.value,
          items: params.items.map(item => ({
            item_id: item.itemId,
            item_name: item.itemName,
            price: item.price,
            quantity: item.quantity,
          })),
          ...(params.sessionId && { session_id: params.sessionId }),
        },
      }],
    }

    const result = await sendMeasurementProtocolEvent(payload)

    if (result.success) {
      console.log(`GA4 Measurement Protocol: purchase event sent for transaction ${params.transactionId}`)
    }

    return result
  },

  /**
   * Debug/validate an event without sending to production
   * Uses the debug endpoint to check if event is valid
   */
  debugPurchase: async (params: PurchaseParams): Promise<{
    valid: boolean
    validationMessages?: Array<{ fieldPath: string; description: string }>
  }> => {
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      return { valid: false, validationMessages: [{ fieldPath: '', description: 'Not configured' }] }
    }

    const userData: Record<string, unknown> = {}
    if (params.userData?.email) {
      userData.sha256_email_address = sha256(params.userData.email)
    }

    const payload = {
      client_id: params.clientId,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: params.transactionId,
          currency: params.currency,
          value: params.value,
          items: params.items.map(item => ({
            item_id: item.itemId,
            item_name: item.itemName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      }],
    }

    try {
      const url = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      return {
        valid: !result.validationMessages || result.validationMessages.length === 0,
        validationMessages: result.validationMessages,
      }
    } catch (error) {
      return {
        valid: false,
        validationMessages: [{
          fieldPath: '',
          description: error instanceof Error ? error.message : 'Unknown error',
        }],
      }
    }
  },
}
