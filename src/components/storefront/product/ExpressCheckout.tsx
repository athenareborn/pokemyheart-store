'use client'

import { useState, useEffect } from 'react'
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'
import { generateEventId } from '@/lib/analytics/facebook-capi'

const stripePromise = getStripe()

interface ExpressCheckoutProps {
  designId: string
  bundleId: BundleId
}

// Inner component that uses Stripe hooks
function ExpressCheckoutButtons({ designId, bundleId }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isAvailable, setIsAvailable] = useState(true)

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
    sessionStorage.setItem('fb_purchase_data', JSON.stringify(purchaseData))

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
      sessionStorage.removeItem('fb_purchase_data')
    }
  }

  if (!isAvailable) return null

  return (
    <ExpressCheckoutElement
      onReady={({ availablePaymentMethods }) => {
        if (!availablePaymentMethods || Object.keys(availablePaymentMethods).length === 0) {
          setIsAvailable(false)
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
      }}
    />
  )
}

// Wrapper component that provides Elements context
export function ExpressCheckout({ designId, bundleId }: ExpressCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      }
    }

    createIntent()
  }, [designId, bundleId])

  // Don't render anything if there's an error or no client secret yet
  if (error || !clientSecret) return null

  return (
    <div className="space-y-3">
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
        <ExpressCheckoutButtons designId={designId} bundleId={bundleId} />
      </Elements>
    </div>
  )
}
