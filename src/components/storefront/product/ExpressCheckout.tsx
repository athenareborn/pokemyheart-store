'use client'

import { useState, useEffect } from 'react'
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Zap, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { Button } from '@/components/ui/button'

// Safe sessionStorage helpers for iOS private browsing mode
function safeSetSessionStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch (e) {
    console.warn('[ExpressCheckout] sessionStorage unavailable (private mode?):', e)
  }
}

function safeRemoveSessionStorage(key: string) {
  try {
    sessionStorage.removeItem(key)
  } catch (e) {
    // Ignore - storage not available
  }
}

const stripePromise = getStripe()

interface ExpressCheckoutProps {
  designId: string
  bundleId: BundleId
  /** Compact mode for sticky bar - shows only the button, no dividers */
  compact?: boolean
}

// Inner component that uses Stripe hooks
function ExpressCheckoutButtons({ designId, bundleId, compact, onFallback }: ExpressCheckoutProps & { onFallback: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [showFallback, setShowFallback] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const bundle = BUNDLES.find(b => b.id === bundleId)
  const design = PRODUCT.designs.find(d => d.id === designId)

  const handleConfirm = async () => {
    if (!stripe || !elements || !bundle || !design) return

    // Track analytics
    const eventId = generateEventId('purchase')
    const price = bundle.price / 100
    const productName = `${PRODUCT.name} - ${design.name}`

    // Store purchase data for success page tracking
    const purchaseData = {
      value: price,
      numItems: 1,
      contentIds: [`${designId}-${bundleId}`],
      currency: 'USD',
      eventId,
      items: [{
        itemId: `${designId}-${bundleId}`,
        itemName: productName,
        price,
        quantity: 1,
      }],
    }
    safeSetSessionStorage('fb_purchase_data', JSON.stringify(purchaseData))

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error) {
      console.error('Express checkout error:', error.message)
      // Remove stored data on error
      safeRemoveSessionStorage('fb_purchase_data')
    }
  }

  // Show fallback button if no wallet methods available
  if (showFallback) {
    return null // Parent will handle the fallback
  }

  return (
    <div className={compact ? '' : 'min-h-[44px]'}>
      <ExpressCheckoutElement
        onReady={({ availablePaymentMethods }) => {
          console.log('[ExpressCheckout] Ready. Payment methods:', JSON.stringify(availablePaymentMethods))
          console.log('[ExpressCheckout] User Agent:', navigator.userAgent)
          console.log('[ExpressCheckout] Protocol:', window.location.protocol)
          setIsReady(true)
          if (!availablePaymentMethods || Object.keys(availablePaymentMethods).length === 0) {
            console.log('[ExpressCheckout] No wallet methods - showing fallback')
            setShowFallback(true)
            onFallback()
          }
        }}
        onClick={({ resolve }) => {
          // Track AddToCart and InitiateCheckout when user clicks
          const bundle = BUNDLES.find(b => b.id === bundleId)
          const design = PRODUCT.designs.find(d => d.id === designId)
          if (bundle && design) {
            const price = bundle.price / 100
            const productName = `${PRODUCT.name} - ${design.name}`

            // Track AddToCart
            const atcEventId = generateEventId('atc')
            fbPixel.addToCart(`${designId}-${bundleId}`, productName, price, 'USD', atcEventId)
            ga4.addToCart({ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 })

            // Track InitiateCheckout
            const icEventId = generateEventId('ic')
            fbPixel.initiateCheckout(price, 1, [`${designId}-${bundleId}`], 'USD', icEventId)
            ga4.beginCheckout({ value: price, items: [{ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 }] })
          }
          resolve()
        }}
        onConfirm={handleConfirm}
        options={{
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
          layout: {
            maxColumns: 1,
            maxRows: 3,
          },
        }}
      />
    </div>
  )
}

/**
 * Smart Express Checkout Component
 *
 * Shows Apple Pay / Google Pay buttons when available.
 * Falls back to a "Buy Now" button that redirects to Stripe checkout.
 *
 * Desktop: Shows below Add to Cart with "or checkout with" divider
 * Mobile (compact): Shows just the button, suitable for sticky bars
 */
export function ExpressCheckout({ designId, bundleId, compact = false }: ExpressCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  // Get FB cookies for attribution
  const getFbCookies = () => {
    if (typeof document === 'undefined') return { fbc: undefined, fbp: undefined }
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    return {
      fbc: cookies['_fbc'],
      fbp: cookies['_fbp'],
    }
  }

  // Warn if not HTTPS - Apple Pay requires HTTPS
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('[ExpressCheckout] Apple Pay requires HTTPS. Current protocol:', window.location.protocol)
    }
  }, [])

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { fbc, fbp } = getFbCookies()
        const eventId = generateEventId('ec')

        const res = await fetch('/api/express-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId,
            bundleId,
            fbData: { fbc, fbp, eventId },
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.details || 'Failed to initialize checkout')
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Express checkout init error:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
        // Show fallback on error
        setShowFallback(true)
      } finally {
        setIsLoading(false)
      }
    }

    createIntent()
  }, [designId, bundleId])

  // Handle Buy Now fallback - redirects to Stripe hosted checkout
  const handleBuyNow = async () => {
    setIsBuyingNow(true)

    const bundle = BUNDLES.find(b => b.id === bundleId)
    const design = PRODUCT.designs.find(d => d.id === designId)
    if (!bundle || !design) return

    const price = bundle.price / 100
    const productName = `${PRODUCT.name} - ${design.name}`

    // Track AddToCart
    const atcEventId = generateEventId('atc')
    fbPixel.addToCart(`${designId}-${bundleId}`, productName, price, 'USD', atcEventId)
    ga4.addToCart({ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 })

    // Track InitiateCheckout
    const icEventId = generateEventId('ic')
    fbPixel.initiateCheckout(price, 1, [`${designId}-${bundleId}`], 'USD', icEventId)
    ga4.beginCheckout({ value: price, items: [{ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 }] })

    // Store purchase data for success page tracking
    const purchaseEventId = generateEventId('purchase')
    const purchaseData = {
      value: price,
      numItems: 1,
      contentIds: [`${designId}-${bundleId}`],
      currency: 'USD',
      eventId: purchaseEventId,
      items: [{
        itemId: `${designId}-${bundleId}`,
        itemName: productName,
        price,
        quantity: 1,
      }],
    }
    safeSetSessionStorage('fb_purchase_data', JSON.stringify(purchaseData))

    // Create Stripe Checkout Session
    try {
      const { fbc, fbp } = getFbCookies()

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            name: productName,
            description: bundle.description || 'Premium Valentine Card',
            price: bundle.price,
            quantity: 1,
            designId,
            designName: design.name,
            bundleId,
            bundleName: bundle.name,
            bundleSku: bundle.sku,
          }],
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
          fbData: {
            fbc,
            fbp,
            eventId: purchaseEventId,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      // Redirect to Stripe hosted checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Buy Now error:', err)
      setIsBuyingNow(false)
    }
  }

  // Show loading spinner initially
  if (isLoading) {
    return (
      <div className={compact ? 'h-11' : 'h-11 flex items-center justify-center'}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  // Show fallback Buy Now button if wallet methods not available or there's an error
  if (showFallback || error || !clientSecret) {
    return (
      <Button
        onClick={handleBuyNow}
        disabled={isBuyingNow}
        className={compact
          ? 'bg-gray-900 hover:bg-gray-800 text-white font-semibold'
          : 'w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-semibold'
        }
      >
        {isBuyingNow ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Buy Now
          </>
        )}
      </Button>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#ec4899',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <ExpressCheckoutButtons
        designId={designId}
        bundleId={bundleId}
        compact={compact}
        onFallback={() => setShowFallback(true)}
      />
      {/* Show Buy Now if Stripe says no wallet methods available */}
      {showFallback && (
        <Button
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          className={compact
            ? 'bg-gray-900 hover:bg-gray-800 text-white font-semibold'
            : 'w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-semibold'
          }
        >
          {isBuyingNow ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Buy Now
            </>
          )}
        </Button>
      )}
    </Elements>
  )
}
