'use client'

import { useState, useCallback } from 'react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { X, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'

const stripePromise = getStripe()

interface EmbeddedCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{
    name: string
    description: string
    price: number
    quantity: number
    designId?: string
    designName?: string
    bundleId?: string
    bundleName?: string
    bundleSku?: string
  }>
  fbData?: {
    fbc?: string
    fbp?: string
    eventId?: string
  }
}

export function EmbeddedCheckoutModal({ isOpen, onClose, items, fbData }: EmbeddedCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/checkout/embedded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        returnUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        fbData,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.details || 'Failed to create checkout')
    }

    setIsLoading(false)
    return data.clientSecret
  }, [items, fbData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Checkout Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          )}

          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout className="embedded-checkout" />
          </EmbeddedCheckoutProvider>
        </div>
      </div>

      <style jsx global>{`
        .embedded-checkout {
          min-height: 400px;
        }
      `}</style>
    </div>
  )
}
