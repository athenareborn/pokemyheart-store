'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'cookie-consent'

type ConsentStatus = 'accepted' | 'declined' | null

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | 'pending'>('pending')

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus
    setConsentStatus(storedConsent)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setConsentStatus('accepted')
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setConsentStatus('declined')
  }

  // Don't render anything while checking localStorage or if user has made a choice
  if (consentStatus === 'pending' || consentStatus !== null) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            We use cookies to enhance your browsing experience. By continuing to use our site, you agree to our use of cookies.{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Learn more in our Privacy Policy
            </Link>
          </p>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
