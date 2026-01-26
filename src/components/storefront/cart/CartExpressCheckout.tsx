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
import { analytics as marketingAnalytics } from '@/lib/analytics'
import { getFbCookies, generateEventId } from '@/lib/analytics/facebook-capi'
import { ga4 } from '@/lib/analytics/ga4'
import { analytics as supabaseAnalytics } from '@/lib/analytics/tracker'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type StripePaymentRequest = ReturnType<NonNullable<ReturnType<typeof useStripe>>['paymentRequest']>

function CartExpressCheckoutInner() {
  const stripe = useStripe()
  const router = useRouter()
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null)

  const { items, getSubtotal, getTotal, isFreeShipping, clearCart, closeCart, shippingInsurance, getInsuranceCost } = useCartStore()
  const subtotal = getSubtotal()
  const total = getTotal()
  const insuranceCost = getInsuranceCost()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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

    const buildDisplayItems = (shippingAmount: number, shippingLabel: string) => {
      const lineItems = items.map(item => {
        const bundle = BUNDLES.find(b => b.id === item.bundleId)
        const design = PRODUCT.designs.find(d => d.id === item.designId)
        return {
          label: `${design?.name || 'Card'} - ${bundle?.name || 'Bundle'}`,
          amount: item.price * item.quantity,
        }
      })

      lineItems.push({
        label: shippingLabel,
        amount: shippingAmount,
      })

      if (shippingInsurance && insuranceCost > 0) {
        lineItems.push({
          label: 'Shipping Insurance',
          amount: insuranceCost,
        })
      }

      return lineItems
    }

    const getShippingDetails = (shippingOptionId?: string) => {
      if (isFreeShipping()) {
        return { amount: 0, label: 'Free Shipping' }
      }
      if (shippingOptionId === 'express') {
        return { amount: PRODUCT.shipping.express, label: 'Express Shipping' }
      }
      return { amount: PRODUCT.shipping.standard, label: 'Standard Shipping' }
    }

    const getTotalAmount = (shippingAmount: number) => subtotal + shippingAmount + insuranceCost

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'UltraRareLove Order',
        amount: total,
      },
      displayItems: buildDisplayItems(
        isFreeShipping() ? 0 : PRODUCT.shipping.standard,
        isFreeShipping() ? 'Free Shipping' : 'Standard Shipping'
      ),
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

    pr.on('shippingaddresschange', (ev) => {
      const shippingDetails = getShippingDetails()
      ev.updateWith({
        status: 'success',
        total: {
          label: 'UltraRareLove Order',
          amount: getTotalAmount(shippingDetails.amount),
        },
        displayItems: buildDisplayItems(shippingDetails.amount, shippingDetails.label),
        shippingOptions: isFreeShipping() ? [
          { id: 'free', label: 'Free Shipping', detail: '5-7 business days', amount: 0 },
        ] : [
          { id: 'standard', label: 'Standard Shipping', detail: '5-7 business days', amount: PRODUCT.shipping.standard },
          { id: 'express', label: 'Express Shipping', detail: '1-3 business days', amount: PRODUCT.shipping.express },
        ],
      })
    })

    pr.on('shippingoptionchange', (ev) => {
      const shippingDetails = getShippingDetails(ev.shippingOption?.id)
      ev.updateWith({
        status: 'success',
        total: {
          label: 'UltraRareLove Order',
          amount: getTotalAmount(shippingDetails.amount),
        },
        displayItems: buildDisplayItems(shippingDetails.amount, shippingDetails.label),
      })
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
        marketingAnalytics.trackInitiateCheckout(getTrackingProducts(), total / 100)
        marketingAnalytics.trackAddPaymentInfo(total / 100, ev.paymentMethod.card?.brand || 'wallet')
        supabaseAnalytics.checkoutStart(total / 100, itemCount)

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

        const { clientSecret, paymentIntentId } = await response.json()

        const shippingOptionId = ev.shippingOption?.id || (isFreeShipping() ? 'free' : 'standard')
        const shippingMethod = shippingOptionId === 'express' ? 'express' : 'standard'
        const shippingAddress = ev.shippingAddress ? {
          name: ev.shippingAddress.recipient || ev.payerName || '',
          address: {
            line1: ev.shippingAddress.addressLine?.[0] || '',
            line2: ev.shippingAddress.addressLine?.[1] || undefined,
            city: ev.shippingAddress.city || '',
            state: ev.shippingAddress.region || '',
            postal_code: ev.shippingAddress.postalCode || '',
            country: ev.shippingAddress.country || 'US',
          },
        } : undefined

        const updateResponse = await fetch('/api/express-checkout', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            email: ev.payerEmail,
            shippingAddress,
            shippingMethod,
          }),
        })

        if (!updateResponse.ok) {
          ev.complete('fail')
          return
        }

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
      pr.off('shippingaddresschange')
      pr.off('shippingoptionchange')
    }
  }, [stripe, items, subtotal, total, isFreeShipping, shippingInsurance, insuranceCost, clearCart, closeCart, router, getTrackingProducts])

  // Don't render anything if wallet payments aren't available
  if (!canMakePayment || !paymentRequest) {
    return null
  }

  return (
    <div className="mb-3">
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
