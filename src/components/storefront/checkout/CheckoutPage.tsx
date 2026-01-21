'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'

/**
 * Checkout Page - Redirects to Stripe Hosted Checkout
 *
 * This page automatically creates a Stripe Checkout Session and redirects
 * to Stripe's full-page hosted checkout (checkout.stripe.com).
 */
export function CheckoutPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const hasInitiated = useRef(false)

  const { items, isCartEmpty, getTotal } = useCartStore()

  // Redirect if cart empty
  useEffect(() => {
    if (isCartEmpty()) {
      router.push('/products/i-choose-you-the-ultimate-valentines-gift')
    }
  }, [isCartEmpty, router])

  // Track InitiateCheckout and redirect to Stripe
  useEffect(() => {
    if (items.length === 0 || hasInitiated.current) return
    hasInitiated.current = true

    const initiateCheckout = async () => {
      setIsRedirecting(true)

      // Track InitiateCheckout (Facebook + GA4)
      const eventId = generateEventId('ic')
      const contentIds = items.map(item => `${item.designId}-${item.bundleId}`)
      fbPixel.initiateCheckout(getTotal() / 100, items.length, contentIds, 'USD', eventId)

      ga4.beginCheckout({
        value: getTotal() / 100,
        items: items.map(item => {
          const bundle = BUNDLES.find(b => b.id === item.bundleId)
          const design = PRODUCT.designs.find(d => d.id === item.designId)
          return {
            itemId: `${item.designId}-${item.bundleId}`,
            itemName: `${PRODUCT.name} - ${design?.name || 'Design'}`,
            price: item.price / 100,
            quantity: item.quantity,
          }
        }),
      })

      // Store purchase data for client-side tracking on success page
      const purchaseData = {
        value: getTotal() / 100,
        numItems: items.length,
        contentIds,
        currency: 'USD',
        eventId: generateEventId('purchase'),
        items: items.map(item => {
          const bundle = BUNDLES.find(b => b.id === item.bundleId)
          const design = PRODUCT.designs.find(d => d.id === item.designId)
          return {
            itemId: `${item.designId}-${item.bundleId}`,
            itemName: `${PRODUCT.name} - ${design?.name || 'Design'}`,
            price: item.price / 100,
            quantity: item.quantity,
          }
        }),
      }
      sessionStorage.setItem('fb_purchase_data', JSON.stringify(purchaseData))

      // Create Stripe Checkout Session
      try {
        const checkoutItems = items.map(item => {
          const bundle = BUNDLES.find(b => b.id === item.bundleId)
          const design = PRODUCT.designs.find(d => d.id === item.designId)
          return {
            name: `${PRODUCT.name} - ${design?.name || 'Design'}`,
            description: bundle?.description || 'Premium Valentine Card',
            price: item.price,
            quantity: item.quantity,
            designId: item.designId,
            designName: design?.name || 'Unknown',
            bundleId: item.bundleId,
            bundleName: bundle?.name || 'Unknown',
            bundleSku: bundle?.sku || 'PMH-CARD',
          }
        })

        // Get FB attribution cookies
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
          return match ? match[2] : undefined
        }

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: checkoutItems,
            successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: window.location.origin,
            fbData: {
              fbc: getCookie('_fbc'),
              fbp: getCookie('_fbp'),
              eventId: purchaseData.eventId,
            },
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.details || data.error || 'Failed to create checkout')
        }

        // Redirect to Stripe hosted checkout
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize checkout')
        setIsRedirecting(false)
      }
    }

    initiateCheckout()
  }, [items, getTotal])

  // Empty cart state
  if (isCartEmpty()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add items to checkout</p>
        <Link
          href="/products/i-choose-you-the-ultimate-valentines-gift"
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Checkout Error</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              hasInitiated.current = false
              setError(null)
              setIsRedirecting(true)
              window.location.reload()
            }}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Try Again
          </button>
          <Link
            href="/products/i-choose-you-the-ultimate-valentines-gift"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Loading/redirecting state
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        {isRedirecting ? 'Redirecting to checkout...' : 'Preparing checkout...'}
      </h1>
      <p className="text-gray-500">Please wait, you&apos;ll be redirected to our secure payment page.</p>
    </div>
  )
}
