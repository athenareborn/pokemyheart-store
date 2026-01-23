/**
 * User Data Store for Facebook Attribution
 * Persists user data in localStorage for improved Event Match Quality
 * Data is used to enrich server-side CAPI events with user info
 */

export interface UserAttributionData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  updatedAt: number
}

const STORAGE_KEY = 'fb_user_data'
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000 // 90 days (matches _fbc cookie lifetime)

/**
 * Save user attribution data to localStorage
 * Merges with existing data to preserve fields not being updated
 */
export function saveUserData(data: Partial<Omit<UserAttributionData, 'updatedAt'>>) {
  if (typeof window === 'undefined') return

  const existing = getUserData()
  const merged: UserAttributionData = {
    ...existing,
    ...data,
    updatedAt: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // localStorage might be full or disabled
    console.warn('Failed to save user attribution data')
  }
}

/**
 * Get user attribution data from localStorage
 * Returns null if no data or data is expired
 */
export function getUserData(): UserAttributionData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data: UserAttributionData = JSON.parse(stored)

    // Check if expired
    if (Date.now() - data.updatedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

/**
 * Clear user attribution data
 * Call this on logout or when user requests data deletion
 */
export function clearUserData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Get external_id for Facebook CAPI
 * Uses stored email to generate a consistent identifier
 * Returns undefined if no user data is available
 *
 * Per Meta: external_id should be a unique, consistent identifier
 * We use the raw email (will be hashed by CAPI before sending)
 */
export function getExternalId(): string | undefined {
  const userData = getUserData()
  if (!userData?.email) return undefined

  // Return email as external_id - it will be hashed by the CAPI library
  // This ensures the same user gets the same external_id across sessions
  return userData.email
}
