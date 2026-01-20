/**
 * Client-side SHA256 hashing for Advanced Matching
 * Uses Web Crypto API (works in browsers)
 */

/**
 * Hash a value using SHA256 for Facebook Advanced Matching
 * Values are normalized (lowercase, trimmed) before hashing
 */
export async function hashForFB(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash an email for Facebook Advanced Matching
 */
export async function hashEmail(email: string): Promise<string> {
  return hashForFB(email)
}

/**
 * Hash a phone number for Facebook Advanced Matching
 * Removes non-digits before hashing
 */
export async function hashPhone(phone: string): Promise<string> {
  const digitsOnly = phone.replace(/\D/g, '')
  return hashForFB(digitsOnly)
}

/**
 * Hash a name (first or last) for Facebook Advanced Matching
 */
export async function hashName(name: string): Promise<string> {
  return hashForFB(name)
}
