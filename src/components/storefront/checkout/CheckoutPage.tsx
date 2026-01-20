'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, ShoppingBag, Loader2, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'
import { useCartStore } from '@/lib/store/cart'
import { useCheckoutStore } from '@/lib/store/checkout'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { fbPixel } from '@/lib/analytics/fpixel'
import { formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const stripePromise = getStripe()

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export function CheckoutPage() {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { items, isCartEmpty, getSubtotal, isFreeShipping, getTotal, clearCart } = useCartStore()
  const {
    email,
    setEmail,
    newsletterOptIn,
    setNewsletterOptIn,
    shippingAddress,
    setShippingAddress,
    selectedShippingMethod,
    setShippingMethod,
    resetCheckout,
  } = useCheckoutStore()

  const subtotal = getSubtotal()
  const qualifiesForFree = isFreeShipping()
  const shippingCost = selectedShippingMethod === 'express'
    ? (qualifiesForFree ? PRODUCT.shipping.standard : PRODUCT.shipping.express)
    : (qualifiesForFree ? 0 : PRODUCT.shipping.standard)
  const total = subtotal + shippingCost

  // Redirect if cart empty
  useEffect(() => {
    if (isCartEmpty()) {
      router.push('/products/i-choose-you-the-ultimate-valentines-gift')
    }
  }, [isCartEmpty, router])

  // Track InitiateCheckout
  useEffect(() => {
    if (items.length > 0) {
      const eventId = generateEventId('ic')
      const contentIds = items.map(item => `${item.designId}-${item.bundleId}`)
      fbPixel.initiateCheckout(getTotal() / 100, items.length, contentIds, 'USD', eventId)
    }
  }, [])

  // Create Payment Intent on page load
  useEffect(() => {
    if (items.length === 0) return

    const createIntent = async () => {
      try {
        const checkoutItems = items.map(item => {
          const bundle = BUNDLES.find(b => b.id === item.bundleId)
          const design = PRODUCT.designs.find(d => d.id === item.designId)
          return {
            name: `${PRODUCT.name} - ${design?.name || 'Design'}`,
            description: bundle?.name || 'Card',
            price: item.price,
            quantity: item.quantity,
            designId: item.designId,
            designName: design?.name || 'Unknown',
            bundleId: item.bundleId,
            bundleName: bundle?.name || 'Unknown',
            bundleSku: bundle?.sku || 'PMH-CARD',
          }
        })

        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
          return match ? match[2] : undefined
        }

        const res = await fetch('/api/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: checkoutItems,
            email: email || 'pending@checkout.com',
            shippingAddress: {
              firstName: shippingAddress.firstName || 'Pending',
              lastName: shippingAddress.lastName || 'Customer',
              address1: shippingAddress.address1 || '123 Main St',
              city: shippingAddress.city || 'City',
              state: shippingAddress.state || 'CA',
              postalCode: shippingAddress.postalCode || '90210',
              country: shippingAddress.country || 'US',
            },
            shippingMethod: selectedShippingMethod,
            fbData: {
              fbc: getCookie('_fbc'),
              fbp: getCookie('_fbp'),
              eventId: generateEventId('purchase'),
            },
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.details || 'Failed to initialize checkout')
        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    createIntent()
  }, [items])

  if (isCartEmpty()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add items to checkout</p>
        <Link href="/products/i-choose-you-the-ultimate-valentines-gift" className="text-brand-500">
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-500 mb-4">{error || 'Failed to load checkout'}</p>
        <Link href="/products/i-choose-you-the-ultimate-valentines-gift" className="text-brand-500">
          Return to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/products/i-choose-you-the-ultimate-valentines-gift" className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-gray-900">Checkout</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      {/* Main - Single Column, Centered */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-32">
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
            email={email}
            setEmail={setEmail}
            newsletterOptIn={newsletterOptIn}
            setNewsletterOptIn={setNewsletterOptIn}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            selectedShippingMethod={selectedShippingMethod}
            setShippingMethod={setShippingMethod}
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            qualifiesForFree={qualifiesForFree}
            onSuccess={() => {
              clearCart()
              resetCheckout()
            }}
          />
        </Elements>
      </main>
    </div>
  )
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface CheckoutFormProps {
  email: string
  setEmail: (email: string) => void
  newsletterOptIn: boolean
  setNewsletterOptIn: (v: boolean) => void
  shippingAddress: ShippingAddress
  setShippingAddress: (a: Partial<ShippingAddress>) => void
  selectedShippingMethod: 'standard' | 'express'
  setShippingMethod: (m: 'standard' | 'express') => void
  items: Array<{ id: string; designId: string; bundleId: string; price: number; quantity: number }>
  subtotal: number
  shippingCost: number
  total: number
  qualifiesForFree: boolean
  onSuccess: () => void
}

function CheckoutForm({
  email,
  setEmail,
  newsletterOptIn,
  setNewsletterOptIn,
  shippingAddress,
  setShippingAddress,
  selectedShippingMethod,
  setShippingMethod,
  items,
  subtotal,
  shippingCost,
  total,
  qualifiesForFree,
  onSuccess,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [showExpressCheckout, setShowExpressCheckout] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setPayError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setPayError(submitError.message || 'Payment failed')
      setIsProcessing(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
        shipping: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: {
            line1: shippingAddress.address1,
            line2: shippingAddress.address2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
        },
      },
    })

    if (error) {
      setPayError(error.message || 'Payment failed')
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Express Checkout */}
      {showExpressCheckout && (
        <div className="space-y-3">
          <ExpressCheckoutElement
            onReady={({ availablePaymentMethods }) => {
              // Hide the section if no express payment methods available
              if (!availablePaymentMethods || Object.keys(availablePaymentMethods).length === 0) {
                setShowExpressCheckout(false)
              }
            }}
            onConfirm={async () => {
              if (!stripe || !elements) return
              const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                  return_url: `${window.location.origin}/checkout/success`,
                },
              })
              if (!error) onSuccess()
            }}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-3 text-gray-500">or pay with card</span>
            </div>
          </div>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="h-12"
        />
        <div className="flex items-center gap-2">
          <Checkbox
            id="newsletter"
            checked={newsletterOptIn}
            onCheckedChange={(c) => setNewsletterOptIn(c === true)}
          />
          <Label htmlFor="newsletter" className="text-sm text-gray-600 font-normal">
            Email me news and offers
          </Label>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-3">
        <Label>Shipping</Label>
        <Select
          value={shippingAddress.country}
          onValueChange={(v) => setShippingAddress({ country: v })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="First name"
            value={shippingAddress.firstName}
            onChange={(e) => setShippingAddress({ firstName: e.target.value })}
            required
            autoComplete="given-name"
            className="h-12"
          />
          <Input
            placeholder="Last name"
            value={shippingAddress.lastName}
            onChange={(e) => setShippingAddress({ lastName: e.target.value })}
            required
            autoComplete="family-name"
            className="h-12"
          />
        </div>
        <Input
          placeholder="Address"
          value={shippingAddress.address1}
          onChange={(e) => setShippingAddress({ address1: e.target.value })}
          required
          autoComplete="address-line1"
          className="h-12"
        />
        <Input
          placeholder="Apartment, suite, etc. (optional)"
          value={shippingAddress.address2}
          onChange={(e) => setShippingAddress({ address2: e.target.value })}
          autoComplete="address-line2"
          className="h-12"
        />
        <div className="grid grid-cols-6 gap-3">
          <Input
            placeholder="City"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ city: e.target.value })}
            required
            autoComplete="address-level2"
            className="col-span-2 h-12"
          />
          {shippingAddress.country === 'US' ? (
            <Select
              value={shippingAddress.state}
              onValueChange={(v) => setShippingAddress({ state: v })}
            >
              <SelectTrigger className="col-span-2 h-12">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="State"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ state: e.target.value })}
              required
              className="col-span-2 h-12"
            />
          )}
          <Input
            placeholder="ZIP"
            value={shippingAddress.postalCode}
            onChange={(e) => setShippingAddress({ postalCode: e.target.value })}
            required
            autoComplete="postal-code"
            className="col-span-2 h-12"
          />
        </div>
      </div>

      {/* Shipping Method */}
      <div className="space-y-3">
        <Label>Shipping method</Label>
        <div className="space-y-2">
          <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${selectedShippingMethod === 'standard' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                checked={selectedShippingMethod === 'standard'}
                onChange={() => setShippingMethod('standard')}
                className="w-4 h-4 text-brand-500"
              />
              <div>
                <p className="font-medium text-sm">Standard (5-7 days)</p>
              </div>
            </div>
            <span className={`font-semibold text-sm ${qualifiesForFree ? 'text-green-600' : ''}`}>
              {qualifiesForFree ? 'FREE' : formatPrice(PRODUCT.shipping.standard)}
            </span>
          </label>
          <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${selectedShippingMethod === 'express' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                checked={selectedShippingMethod === 'express'}
                onChange={() => setShippingMethod('express')}
                className="w-4 h-4 text-brand-500"
              />
              <div>
                <p className="font-medium text-sm">Express (1-3 days)</p>
              </div>
            </div>
            <span className="font-semibold text-sm">
              {formatPrice(qualifiesForFree ? PRODUCT.shipping.standard : PRODUCT.shipping.express)}
            </span>
          </label>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-3">
        <Label>Payment</Label>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <PaymentElement />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Secured by Stripe</span>
        </div>
      </div>

      {/* Order Summary (Collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="w-full flex items-center justify-between p-4 bg-white"
        >
          <span className="font-medium">Order summary</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPrice(total)}</span>
            {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {summaryOpen && (
          <div className="p-4 bg-gray-50 space-y-3 border-t">
            {items.map((item) => {
              const bundle = BUNDLES.find((b) => b.id === item.bundleId)
              const design = PRODUCT.designs.find((d) => d.id === item.designId)
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-12 h-12 bg-white rounded border overflow-hidden flex-shrink-0">
                    {design?.thumbnail && (
                      <Image src={design.thumbnail} alt={design.name} fill className="object-cover" />
                    )}
                    {item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bundle?.name}</p>
                    <p className="text-xs text-gray-500">{design?.name}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              )
            })}
            <div className="pt-3 border-t space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {payError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {payError}
        </div>
      )}

      {/* Sticky Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 text-lg transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay {formatPrice(total)}
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            30-day guarantee · Free returns
          </p>
        </div>
      </div>
    </form>
  )
}
