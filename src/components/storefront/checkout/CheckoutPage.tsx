'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { generateEventId, getFbCookies } from '@/lib/analytics/facebook-capi'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutOrderSummary } from './CheckoutOrderSummary'

const stripePromise = getStripe()

export function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')

  const { items, isCartEmpty, getSubtotal, isFreeShipping } = useCartStore()

  // Prevent hydration mismatch - cart store uses localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track InitiateCheckout and create PaymentIntent
  useEffect(() => {
    if (items.length === 0) return

    const initCheckout = async () => {
      // Track InitiateCheckout
      const eventId = generateEventId('ic')
      const total = getSubtotal()
      const contentIds = items.map(item => `${item.designId}-${item.bundleId}`)

      fbPixel.initiateCheckout(total / 100, items.length, contentIds, 'USD', eventId)
      ga4.beginCheckout({
        value: total / 100,
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

      // Create PaymentIntent
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

        const qualifiesForFreeShipping = isFreeShipping()
        const shippingCost = qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard

        const res = await fetch('/api/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: checkoutItems,
            email: '', // Will be updated on form submit
            shippingAddress: {
              firstName: '',
              lastName: '',
              address1: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'US',
            },
            shippingMethod: 'standard',
            fbData: {
              ...getFbCookies(), // Gets fbc/fbp from localStorage (persistent) or cookies
              eventId,
            },
            gaData: {
              clientId: null,
            },
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.details || 'Failed to initialize checkout')
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize checkout')
      }
    }

    initCheckout()
  }, [items, getSubtotal, isFreeShipping])

  // Redirect if cart is empty (only after mounted)
  useEffect(() => {
    if (mounted && isCartEmpty()) {
      router.push('/products/i-choose-you-the-ultimate-valentines-gift')
    }
  }, [mounted, isCartEmpty, router])

  // Loading state until client-side hydration completes
  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Checkout Error</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
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

  // Loading state while creating PaymentIntent
  if (!clientSecret) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p className="text-gray-500">Preparing checkout...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/products/i-choose-you-the-ultimate-valentines-gift"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to shop</span>
          </Link>

          <Link href="/" className="font-bold text-xl text-brand-500">
            UltraRareLove
          </Link>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left: Form */}
          <div className="order-2 lg:order-1">
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
              <CheckoutForm
                onShippingMethodChange={setShippingMethod}
                clientSecret={clientSecret}
              />
            </Elements>
          </div>

          {/* Right: Order Summary */}
          <div className="order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <CheckoutOrderSummary shippingMethod={shippingMethod} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
