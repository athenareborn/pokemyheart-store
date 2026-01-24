'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, Suspense, createContext, useContext } from 'react'
import { initPostHog, getPostHog } from '@/lib/analytics/posthog'
import {
  analytics,
  getSessionId,
  getVisitorId,
  getDeviceType,
  getUTMParams,
  type AnalyticsEventType
} from '@/lib/analytics/tracker'

interface AnalyticsContextType {
  trackEvent: (eventType: AnalyticsEventType, properties?: Record<string, unknown>) => void
  sessionId: string
  visitorId: string
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPathRef = useRef<string>('')
  const sessionInitializedRef = useRef(false)

  useEffect(() => {
    // Initialize PostHog after idle to reduce main-thread work on first load
    let idleId: number | null = null
    const schedulePostHog = () => initPostHog()
    if (typeof window !== 'undefined') {
      const idleWindow = window as Window & {
        requestIdleCallback?: (cb: () => void) => number
        cancelIdleCallback?: (id: number) => void
      }
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(schedulePostHog)
      } else {
        idleId = window.setTimeout(schedulePostHog, 2000)
      }
    }

    // Initialize session on first load
    if (!sessionInitializedRef.current) {
      sessionInitializedRef.current = true

      // Check if this is a new session (no session_id in sessionStorage)
      const existingSession = sessionStorage.getItem('pmh_session_id')
      if (!existingSession) {
        analytics.sessionStart()

        // Create/update session in Supabase with UTM params
        const utm = getUTMParams()
        const sessionId = getSessionId()
        const visitorId = getVisitorId()

        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'session_start',
            session_id: sessionId,
            visitor_id: visitorId,
            page_path: pathname,
            device_type: getDeviceType(),
            referrer: document.referrer,
            event_data: utm,
            create_session: true,
          }),
        }).catch(() => {})
      }
    }
    return () => {
      if (idleId === null || typeof window === 'undefined') {
        return
      }
      const idleWindow = window as Window & {
        cancelIdleCallback?: (id: number) => void
      }
      if (idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId)
      } else {
        window.clearTimeout(idleId)
      }
    }
  }, [pathname])

  useEffect(() => {
    // Track page views on route change
    const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`

    if (currentPath !== lastPathRef.current) {
      lastPathRef.current = currentPath
      analytics.pageView(pathname)
    }
  }, [pathname, searchParams])

  return null
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const contextValue: AnalyticsContextType = {
    trackEvent: (eventType, properties) => {
      const posthog = getPostHog()
      if (posthog) {
        posthog.capture(eventType, properties)
      }
    },
    get sessionId() {
      return getSessionId()
    },
    get visitorId() {
      return getVisitorId()
    },
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  )
}
