import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (initialized) return
  if (!POSTHOG_KEY) {
    console.warn('PostHog key not configured')
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We handle this manually for consistency
    capture_pageleave: true,
    autocapture: true, // Capture clicks, form submits, etc.
    persistence: 'localStorage+cookie',
    // Session recording - watch real user sessions
    enable_recording_console_log: true,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        // In dev, you might want to disable or debug
        // posthog.debug()
      }
    },
  })

  initialized = true
}

export function getPostHog() {
  if (typeof window === 'undefined') return null
  if (!initialized) initPostHog()
  return posthog
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  const ph = getPostHog()
  if (!ph) return
  ph.identify(userId, properties)
}

export function resetUser() {
  const ph = getPostHog()
  if (!ph) return
  ph.reset()
}

export { posthog }
