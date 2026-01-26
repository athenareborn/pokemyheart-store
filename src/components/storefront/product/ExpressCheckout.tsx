'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { ShippingRate, StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'
import { Zap, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'
import { generateEventId, getFbCookies } from '@/lib/analytics/facebook-capi'
import { getUserData, getExternalId } from '@/lib/analytics/user-data-store'
import { analytics as supabaseAnalytics } from '@/lib/analytics/tracker'
import { useCartStore } from '@/lib/store/cart'
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
function ExpressCheckoutButtons({
  designId,
  bundleId,
  compact,
  onFallback,
  purchaseEventId,
  clientSecret,
}: ExpressCheckoutProps & {
  onFallback: () => void
  purchaseEventId: string | null
  clientSecret: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [showFallback, setShowFallback] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const bundle = BUNDLES.find(b => b.id === bundleId)
  const design = PRODUCT.designs.find(d => d.id === designId)
  const paymentIntentId = clientSecret.split('_secret_')[0]
  const qualifiesForFreeShipping = bundle ? bundle.price >= PRODUCT.freeShippingThreshold : false

  const getShippingCostForMethod = (method: 'standard' | 'express') => {
    if (method === 'express') {
      return qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express
    }
    return qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
  }

  const getShippingLabel = (method: 'standard' | 'express', cost: number) => {
    if (cost === 0) {
      return 'Free Shipping'
    }
    return method === 'express' ? 'Express Shipping' : 'Standard Shipping'
  }

  const buildExpressShippingRates = (preferredMethod: 'standard' | 'express'): ShippingRate[] => {
    if (qualifiesForFreeShipping) {
      return [
        {
          id: 'free-shipping',
          displayName: 'Free Shipping',
          amount: 0,
          deliveryEstimate: {
            minimum: { unit: 'day' as const, value: 5 },
            maximum: { unit: 'day' as const, value: 7 },
          },
        },
      ]
    }

    const standardRate: ShippingRate = {
      id: 'standard-shipping',
      displayName: 'Standard Shipping',
      amount: PRODUCT.shipping.standard,
      deliveryEstimate: {
        minimum: { unit: 'day' as const, value: 5 },
        maximum: { unit: 'day' as const, value: 7 },
      },
    }

    const expressRate: ShippingRate = {
      id: 'express-shipping',
      displayName: 'Express Shipping',
      amount: PRODUCT.shipping.express,
      deliveryEstimate: {
        minimum: { unit: 'day' as const, value: 1 },
        maximum: { unit: 'day' as const, value: 3 },
      },
    }

    return preferredMethod === 'express'
      ? [expressRate, standardRate]
      : [standardRate, expressRate]
  }

  const buildExpressLineItems = (
    method: 'standard' | 'express',
    overrides?: { subtotal?: number; shippingCost?: number }
  ) => {
    const lineSubtotal = overrides?.subtotal ?? (bundle?.price ?? 0)
    const lineShippingCost = overrides?.shippingCost ?? getShippingCostForMethod(method)
    return [
      { name: 'Subtotal', amount: lineSubtotal },
      { name: getShippingLabel(method, lineShippingCost), amount: lineShippingCost },
    ]
  }

  const syncExpressCheckoutIntent = async (method: 'standard' | 'express') => {
    const res = await fetch('/api/express-checkout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        shippingMethod: method,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.details || 'Failed to update totals for express checkout')
    }

    return data
  }

  const handleConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements || !bundle || !design) {
      event.paymentFailed({ reason: 'fail', message: 'Payment system not ready. Please refresh and try again.' })
      return
    }

    // Use the same eventId that was sent to PaymentIntent metadata for deduplication
    const eventId = purchaseEventId || generateEventId('purchase')
    const shippingRateId = event.shippingRate?.id || (qualifiesForFreeShipping ? 'free-shipping' : 'standard-shipping')
    const shippingMethod = shippingRateId === 'express-shipping' ? 'express' : 'standard'
    const shippingCost = getShippingCostForMethod(shippingMethod)
    const total = (bundle.price + shippingCost) / 100
    const productName = `${PRODUCT.name} - ${design.name}`
    const email = event.billingDetails?.email || ''
    const shippingDetails = event.shippingAddress

    if (!shippingDetails) {
      event.paymentFailed({ reason: 'invalid_shipping_address', message: 'Shipping address is required.' })
      return
    }

    if (!email) {
      event.paymentFailed({ reason: 'invalid_payment_data', message: 'Email is required.' })
      return
    }

    const shippingAddress = {
      name: shippingDetails.name,
      address: {
        line1: shippingDetails.address.line1,
        line2: shippingDetails.address.line2 || undefined,
        city: shippingDetails.address.city,
        state: shippingDetails.address.state,
        postal_code: shippingDetails.address.postal_code,
        country: shippingDetails.address.country,
      },
    }

    // Store purchase data for success page tracking
    const purchaseData = {
      value: total,
      numItems: 1,
      contentIds: [`${designId}-${bundleId}`],
      currency: 'USD',
      eventId,
      items: [{
        itemId: `${designId}-${bundleId}`,
        itemName: productName,
        price: bundle.price / 100,
        quantity: 1,
      }],
    }
    safeSetSessionStorage('fb_purchase_data', JSON.stringify(purchaseData))

    const updateResponse = await fetch('/api/express-checkout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        email,
        shippingAddress,
        shippingMethod,
      }),
    })

    if (!updateResponse.ok) {
      event.paymentFailed({ reason: 'fail', message: 'Failed to update shipping details. Please try again.' })
      safeRemoveSessionStorage('fb_purchase_data')
      return
    }

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
        shipping: {
          name: shippingAddress.name,
          address: {
            line1: shippingAddress.address.line1,
            line2: shippingAddress.address.line2,
            city: shippingAddress.address.city,
            state: shippingAddress.address.state,
            postal_code: shippingAddress.address.postal_code,
            country: shippingAddress.address.country,
          },
        },
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
            const userData = getUserData()
            const { fbc, fbp } = getFbCookies()

            // Track AddToCart (client + server)
            const atcEventId = generateEventId('atc')
            fbPixel.addToCart(`${designId}-${bundleId}`, productName, price, 'USD', atcEventId)
            ga4.addToCart({ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 })

            // Server-side CAPI for AddToCart
            fetch('/api/analytics/fb-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventName: 'AddToCart',
                eventId: atcEventId,
                eventSourceUrl: window.location.href,
                userData: {
                  email: userData?.email,
                  phone: userData?.phone,
                  firstName: userData?.firstName,
                  lastName: userData?.lastName,
                  city: userData?.city,
                  state: userData?.state,
                  postalCode: userData?.postalCode,
                  country: userData?.country,
                  externalId: getExternalId(),
                  fbc,
                  fbp,
                },
                customData: {
                  value: price,
                  currency: 'USD',
                  content_name: productName,
                  content_type: 'product',
                  content_category: 'Valentine Cards',
                  contents: [{ id: `${designId}-${bundleId}`, quantity: 1, item_price: price }],
                },
              }),
            }).catch(() => {})

            // Track InitiateCheckout (client + server)
            const icEventId = generateEventId('ic')
            fbPixel.initiateCheckout(price, 1, [`${designId}-${bundleId}`], 'USD', icEventId)
            ga4.beginCheckout({ value: price, items: [{ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 }] })
            supabaseAnalytics.checkoutStart(price, 1)

            // Server-side CAPI for InitiateCheckout
            fetch('/api/analytics/fb-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventName: 'InitiateCheckout',
                eventId: icEventId,
                eventSourceUrl: window.location.href,
                userData: {
                  email: userData?.email,
                  phone: userData?.phone,
                  firstName: userData?.firstName,
                  lastName: userData?.lastName,
                  city: userData?.city,
                  state: userData?.state,
                  postalCode: userData?.postalCode,
                  country: userData?.country,
                  externalId: getExternalId(),
                  fbc,
                  fbp,
                },
                customData: {
                  value: price,
                  currency: 'USD',
                  content_type: 'product',
                  content_category: 'Valentine Cards',
                  num_items: 1,
                  contents: [{ id: `${designId}-${bundleId}`, quantity: 1, item_price: price }],
                },
              }),
            }).catch(() => {})
          }

          const lineItems = buildExpressLineItems('standard')
          resolve({
            lineItems,
            shippingRates: buildExpressShippingRates('standard'),
          })

          void syncExpressCheckoutIntent('standard').catch((err) => {
            console.error('[ExpressCheckout] Failed to sync totals:', err)
          })
        }}
        onShippingAddressChange={({ resolve }) => {
          // Just validate - shipping rates are set in options
          resolve({})
        }}
        onShippingRateChange={async ({ shippingRate, resolve, reject }) => {
          const nextMethod = shippingRate.id === 'express-shipping' ? 'express' : 'standard'
          try {
            const updated = await syncExpressCheckoutIntent(nextMethod)
            resolve({
              lineItems: buildExpressLineItems(nextMethod, updated ? {
                subtotal: updated.subtotal,
                shippingCost: updated.shippingCost,
              } : undefined),
            })
          } catch (err) {
            console.error('[ExpressCheckout] Failed to update shipping rate:', err)
            reject()
          }
        }}
        onConfirm={handleConfirm}
        options={{
          // Collect all customer data for order fulfillment + CAPI matching
          emailRequired: true,
          shippingAddressRequired: true,
          billingAddressRequired: true,
          phoneNumberRequired: true,
          allowedShippingCountries: PRODUCT.allowedShippingCountries,
          shippingRates: buildExpressShippingRates('standard'),
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
          layout: {
            maxColumns: 1,
            maxRows: 2,
          },
        }}
      />
    </div>
  )
}

/**
 * Smart Express Checkout Component
 *
 * Shows Apple Pay / Google Pay buttons when available (newer GPay with card digits).
 * Falls back to a "Buy Now" button that redirects to /checkout.
 *
 * Desktop: Shows below Add to Cart with "or checkout with" divider
 * Mobile (compact): Shows just the button, suitable for sticky bars
 */
export function ExpressCheckout({ designId, bundleId, compact = false }: ExpressCheckoutProps) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Store the purchase eventId for deduplication between client and server
  const [purchaseEventId, setPurchaseEventId] = useState<string | null>(null)

  // Warn if not HTTPS - Apple Pay requires HTTPS
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('[ExpressCheckout] Apple Pay requires HTTPS. Current protocol:', window.location.protocol)
    }
  }, [])

  useEffect(() => {
    // Reset state when bundle changes to show loading and force Elements remount
    setClientSecret(null)
    setIsLoading(true)
    setError(null)
    setShowFallback(false)

    const createIntent = async () => {
      try {
        const { fbc, fbp } = getFbCookies()
        // Use 'purchase' prefix so eventId matches between client success page and webhook
        const eventId = generateEventId('purchase')
        setPurchaseEventId(eventId)

        const res = await fetch('/api/express-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId,
            bundleId,
            shippingInsurance: false, // Product page express checkout - no hidden fees
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

  // Handle Buy Now fallback - add to cart and redirect to /checkout
  const handleBuyNow = () => {
    const bundle = BUNDLES.find(b => b.id === bundleId)
    const design = PRODUCT.designs.find(d => d.id === designId)
    if (!bundle || !design) return

    const price = bundle.price / 100
    const productName = `${PRODUCT.name} - ${design.name}`
    const userData = getUserData()
    const { fbc, fbp } = getFbCookies()

    // Track AddToCart (client + server)
    const atcEventId = generateEventId('atc')
    fbPixel.addToCart(`${designId}-${bundleId}`, productName, price, 'USD', atcEventId)
    ga4.addToCart({ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 })

    // Server-side CAPI for AddToCart
    fetch('/api/analytics/fb-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'AddToCart',
        eventId: atcEventId,
        eventSourceUrl: window.location.href,
        userData: {
          email: userData?.email,
          phone: userData?.phone,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          city: userData?.city,
          state: userData?.state,
          postalCode: userData?.postalCode,
          country: userData?.country,
          externalId: getExternalId(),
          fbc,
          fbp,
        },
        customData: {
          value: price,
          currency: 'USD',
          content_name: productName,
          content_type: 'product',
          content_category: 'Valentine Cards',
          contents: [{ id: `${designId}-${bundleId}`, quantity: 1, item_price: price }],
        },
      }),
    }).catch(() => {})

    // Track InitiateCheckout (client + server)
    const icEventId = generateEventId('ic')
    fbPixel.initiateCheckout(price, 1, [`${designId}-${bundleId}`], 'USD', icEventId)
    ga4.beginCheckout({ value: price, items: [{ itemId: `${designId}-${bundleId}`, itemName: productName, price, quantity: 1 }] })

    // Server-side CAPI for InitiateCheckout
    fetch('/api/analytics/fb-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'InitiateCheckout',
        eventId: icEventId,
        eventSourceUrl: window.location.href,
        userData: {
          email: userData?.email,
          phone: userData?.phone,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          city: userData?.city,
          state: userData?.state,
          postalCode: userData?.postalCode,
          country: userData?.country,
          externalId: getExternalId(),
          fbc,
          fbp,
        },
        customData: {
          value: price,
          currency: 'USD',
          content_type: 'product',
          content_category: 'Valentine Cards',
          num_items: 1,
          contents: [{ id: `${designId}-${bundleId}`, quantity: 1, item_price: price }],
        },
      }),
    }).catch(() => {})

    // Add to cart and redirect to checkout
    addItem(designId, bundleId)
    router.push('/checkout')
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
        className={compact
          ? 'w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm'
          : 'w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg font-semibold'
        }
      >
        <Zap className="mr-2 h-5 w-5" />
        Buy Now
      </Button>
    )
  }

  return (
    <>
      <Elements
        key={`${bundleId}-${clientSecret}`}
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
          purchaseEventId={purchaseEventId}
          clientSecret={clientSecret}
        />
        {/* Show Buy Now if Stripe says no wallet methods available */}
        {showFallback && (
          <Button
            onClick={handleBuyNow}
            className={compact
              ? 'w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm'
              : 'w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg font-semibold'
            }
          >
            <Zap className="mr-2 h-5 w-5" />
            Buy Now
          </Button>
        )}
      </Elements>
    </>
  )
}
