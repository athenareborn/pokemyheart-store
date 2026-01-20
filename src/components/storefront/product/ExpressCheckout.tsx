'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js'
import { Zap, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBundle, type BundleId, formatPrice } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { analytics } from '@/lib/analytics'
import { cn } from '@/lib/utils'

// Initialize Stripe - use publishable key from env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ExpressCheckoutProps {
  designId: string
  bundleId: BundleId
}

type StripePaymentRequest = ReturnType<NonNullable<ReturnType<typeof useStripe>>['paymentRequest']>

function ExpressCheckoutInner({ designId, bundleId }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bundle = getBundle(bundleId)
  const design = PRODUCT.designs.find(d => d.id === designId)

  // Get the tracking product data
  const getTrackingProduct = useCallback(() => ({
    id: `${designId}-${bundleId}`,
    name: `${design?.name || designId} - ${bundle?.name || bundleId}`,
    price: (bundle?.price || 0) / 100,
    quantity: 1,
    category: 'Valentine Card',
    variant: bundle?.name,
  }), [designId, bundleId, design?.name, bundle?.name, bundle?.price])

  useEffect(() => {
    if (!stripe || !bundle) return

    // Create payment request for Apple Pay / Google Pay
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: `${bundle.name} - UltraRareLove`,
        amount: bundle.price, // Amount in cents, FREE shipping for express
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'free-shipping',
          label: 'Free Shipping (Valentine Special)',
          detail: '5-7 business days',
          amount: 0,
        },
      ],
    })

    // Check if Apple Pay / Google Pay is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
      } else {
        setCanMakePayment(false)
      }
    })

    // Handle payment method
    pr.on('paymentmethod', async (ev) => {
      setIsProcessing(true)
      setError(null)

      try {
        // Track initiate checkout
        analytics.trackInitiateCheckout([getTrackingProduct()], bundle.price / 100)

        // Create payment intent on our server
        const response = await fetch('/api/express-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bundle.price,
            designId,
            designName: design?.name || designId,
            bundleId,
            bundleName: bundle.name,
            bundleSku: bundle.sku,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create payment')
        }

        const { clientSecret } = await response.json()

        // Track payment info added
        analytics.trackAddPaymentInfo(
          bundle.price / 100,
          ev.paymentMethod.card?.brand || 'wallet'
        )

        // Confirm the payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        )

        if (confirmError) {
          ev.complete('fail')
          setError(confirmError.message || 'Payment failed')
          setIsProcessing(false)
          return
        }

        ev.complete('success')

        // Track purchase
        if (paymentIntent?.status === 'succeeded') {
          analytics.trackPurchase(
            [getTrackingProduct()],
            bundle.price / 100,
            paymentIntent.id
          )
        }

        // Redirect to success page
        window.location.href = `/checkout/success?payment_intent=${paymentIntent?.id}`
      } catch (err) {
        ev.complete('fail')
        setError(err instanceof Error ? err.message : 'Payment failed')
        setIsProcessing(false)
      }
    })

    // Cleanup
    return () => {
      pr.off('paymentmethod')
    }
  }, [stripe, bundle, bundleId, designId, design?.name, getTrackingProduct])

  // Buy Now button handler (fallback when Apple/Google Pay not available)
  const handleBuyNow = async () => {
    if (!bundle) return

    setIsProcessing(true)
    setError(null)

    try {
      // Track initiate checkout
      analytics.trackInitiateCheckout([getTrackingProduct()], bundle.price / 100)

      // Use standard checkout flow
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            name: `${design?.name || designId} - ${bundle.name}`,
            description: bundle.description,
            price: bundle.price,
            quantity: 1,
            image: design?.image,
            designId,
            designName: design?.name || designId,
            bundleId,
            bundleName: bundle.name,
            bundleSku: bundle.sku,
          }],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setIsProcessing(false)
    }
  }

  if (!bundle) return null

  return (
    <div className="space-y-3">
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && (
        <div className="relative">
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'buy',
                  theme: 'dark',
                  height: '48px',
                },
              },
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-white/80 -translate-y-6">
            <span className="bg-black/50 px-2 py-0.5 rounded text-[10px]">
              FREE Shipping
            </span>
          </div>
        </div>
      )}

      {/* Loading state while checking payment availability */}
      {canMakePayment === null && (
        <Button
          size="lg"
          disabled
          className="w-full text-lg py-6 bg-gray-800"
        >
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </Button>
      )}

      {/* Buy Now fallback button (shown when Apple/Google Pay not available) */}
      {canMakePayment === false && (
        <Button
          size="lg"
          onClick={handleBuyNow}
          disabled={isProcessing}
          className={cn(
            'w-full text-lg py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white',
            isProcessing && 'opacity-75'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Buy Now - {formatPrice(bundle.price)}
            </>
          )}
        </Button>
      )}

      {/* Or divider - only show when wallet pay is available */}
      {canMakePayment && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>
      )}

      {/* Standard checkout button - only show when wallet pay is available */}
      {canMakePayment && (
        <Button
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
          disabled={isProcessing}
          className="w-full text-lg py-6 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Pay with Card
        </Button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}

export function ExpressCheckout(props: ExpressCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <ExpressCheckoutInner {...props} />
    </Elements>
  )
}
