'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
// Import PRODUCT for consistent shipping constants
import { analytics } from '@/lib/analytics'
import { getFbCookies, generateEventId } from '@/lib/analytics/facebook-capi'
import { ga4 } from '@/lib/analytics/ga4'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type StripePaymentRequest = ReturnType<NonNullable<ReturnType<typeof useStripe>>['paymentRequest']>

function CartExpressCheckoutInner() {
  const stripe = useStripe()
  const router = useRouter()
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null)

  const { items, getTotal, isFreeShipping, clearCart, closeCart, shippingInsurance, getInsuranceCost } = useCartStore()
  const total = getTotal()
  const insuranceCost = getInsuranceCost()

  const getTrackingProducts = useCallback(() => {
    return items.map(item => {
      const bundle = BUNDLES.find(b => b.id === item.bundleId)
      const design = PRODUCT.designs.find(d => d.id === item.designId)
      return {
        id: `${item.designId}-${item.bundleId}`,
        name: `${design?.name || item.designId} - ${bundle?.name || item.bundleId}`,
        price: item.price / 100,
        quantity: item.quantity,
        category: 'Valentine Card',
        variant: bundle?.name,
      }
    })
  }, [items])

  useEffect(() => {
    if (!stripe || items.length === 0) {
      // Reset payment request - the render condition (!paymentRequest) handles hiding the button
      setPaymentRequest(null)
      return
    }

    // Build displayItems to show line items in Apple Pay/Google Pay sheet
    const displayItems = items.map(item => {
      const bundle = BUNDLES.find(b => b.id === item.bundleId)
      const design = PRODUCT.designs.find(d => d.id === item.designId)
      return {
        label: `${design?.name || 'Card'} - ${bundle?.name || 'Bundle'}`,
        amount: item.price * item.quantity,
      }
    })

    // Add shipping line - use PRODUCT constants for consistency
    const shippingAmount = isFreeShipping() ? 0 : PRODUCT.shipping.standard
    displayItems.push({
      label: isFreeShipping() ? 'Free Shipping' : 'Standard Shipping',
      amount: shippingAmount,
    })

    // Add shipping insurance if enabled
    if (shippingInsurance && insuranceCost > 0) {
      displayItems.push({
        label: 'Shipping Insurance',
        amount: insuranceCost,
      })
    }

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'UltraRareLove Order',
        amount: total,
      },
      displayItems,
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: isFreeShipping() ? [
        { id: 'free', label: 'Free Shipping', detail: '5-7 business days', amount: 0 },
      ] : [
        { id: 'standard', label: 'Standard Shipping', detail: '5-7 business days', amount: PRODUCT.shipping.standard },
        { id: 'express', label: 'Express Shipping', detail: '1-3 business days', amount: PRODUCT.shipping.express },
      ],
    })

    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
      } else {
        setCanMakePayment(false)
      }
    })

    pr.on('paymentmethod', async (ev) => {
      try {
        analytics.trackInitiateCheckout(getTrackingProducts(), total / 100)
        analytics.trackAddPaymentInfo(total / 100, ev.paymentMethod.card?.brand || 'wallet')

        // Get tracking data for attribution
        const { fbc, fbp } = getFbCookies()
        const purchaseEventId = generateEventId('purchase')
        const gaClientId = await ga4.getClientId()

        // Send all cart items to the API
        const cartItems = items.map(item => ({
          designId: item.designId,
          bundleId: item.bundleId,
          quantity: item.quantity,
          price: item.price,
        }))

        const response = await fetch('/api/express-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            shippingInsurance,
            fbData: { fbc, fbp, eventId: purchaseEventId },
            gaData: { clientId: gaClientId },
          }),
        })

        if (!response.ok) {
          ev.complete('fail')
          return
        }

        const { clientSecret } = await response.json()

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        )

        if (confirmError) {
          ev.complete('fail')
          return
        }

        ev.complete('success')

        if (paymentIntent?.status === 'succeeded') {
          // Store purchase data for success page tracking (enables proper deduplication)
          try {
            sessionStorage.setItem('fb_purchase_data', JSON.stringify({
              value: total / 100,
              numItems: items.reduce((acc, i) => acc + i.quantity, 0),
              contentIds: items.map(i => `${i.designId}-${i.bundleId}`),
              currency: 'USD',
              eventId: purchaseEventId,
              items: getTrackingProducts(),
            }))
          } catch {
            // sessionStorage may not be available in iOS private browsing
          }

          analytics.trackPurchase(getTrackingProducts(), total / 100, paymentIntent.id)
          clearCart()
          closeCart()
          router.push(`/checkout/success?payment_intent=${paymentIntent.id}`)
        }
      } catch {
        ev.complete('fail')
      }
    })

    return () => {
      pr.off('paymentmethod')
    }
  }, [stripe, items, total, isFreeShipping, shippingInsurance, insuranceCost, clearCart, closeCart, router, getTrackingProducts])

  // Don't render anything if wallet payments aren't available
  if (!canMakePayment || !paymentRequest) {
    return null
  }

  return (
    <div className="space-y-3">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'buy',
              theme: 'dark',
              height: '44px',
            },
          },
        }}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-50 px-2 text-gray-500">or</span>
        </div>
      </div>
    </div>
  )
}

export function CartExpressCheckout() {
  const { items } = useCartStore()

  // Don't render if cart is empty
  if (items.length === 0) return null

  return (
    <Elements stripe={stripePromise}>
      <CartExpressCheckoutInner />
    </Elements>
  )
}
