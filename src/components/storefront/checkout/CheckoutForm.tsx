'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { checkoutFormSchema, type CheckoutFormInput } from '@/lib/validation/checkout-schema'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { formatPrice } from '@/lib/utils'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { saveUserData } from '@/lib/analytics/user-data-store'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
] as const

interface CheckoutFormProps {
  onShippingMethodChange: (method: 'standard' | 'express') => void
  clientSecret: string | null
  discountCode: string | null
  discountAmount: number
}

export function CheckoutForm({ onShippingMethodChange, clientSecret, discountCode, discountAmount }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isPaymentReady, setIsPaymentReady] = useState(false)

  const { items, getSubtotal, isFreeShipping, clearCart } = useCartStore()
  const subtotal = getSubtotal()
  const qualifiesForFreeShipping = isFreeShipping()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phone: '',
      },
      shippingMethod: 'standard',
    },
    mode: 'onBlur',
  })

  const shippingMethod = watch('shippingMethod')

  // Notify parent of shipping method changes
  useEffect(() => {
    onShippingMethodChange(shippingMethod)
  }, [shippingMethod, onShippingMethodChange])

  // Calculate shipping cost
  const shippingCost = (() => {
    if (shippingMethod === 'express') {
      return qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express
    }
    return qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
  })()

  const total = subtotal + shippingCost - discountAmount

  // Get FB cookies
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return undefined
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : undefined
  }

  const onSubmit = async (data: CheckoutFormInput) => {
    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    // Save user data for Facebook attribution (improves Event Match Quality)
    saveUserData({
      email: data.email,
      phone: data.shippingAddress.phone,
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      postalCode: data.shippingAddress.postalCode,
      country: data.shippingAddress.country,
    })

    try {
      // Store purchase data for success page
      const purchaseEventId = generateEventId('purchase')
      const purchaseData = {
        value: total / 100,
        numItems: items.length,
        contentIds: items.map(item => `${item.designId}-${item.bundleId}`),
        currency: 'USD',
        eventId: purchaseEventId,
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

      // Update PaymentIntent with shipping info and purchase eventId for deduplication
      await fetch('/api/payment-intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          shippingMethod: data.shippingMethod,
          subtotal,
          discountAmount,
          discountCode,
          fbEventId: purchaseEventId, // Critical: same eventId for client and server deduplication
        }),
      })

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: data.email,
          shipping: {
            name: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
            address: {
              line1: data.shippingAddress.address1,
              line2: data.shippingAddress.address2 || undefined,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state,
              postal_code: data.shippingAddress.postalCode,
              country: data.shippingAddress.country,
            },
            phone: data.shippingAddress.phone || undefined,
          },
        },
      })

      if (error) {
        // Clear stored purchase data on failure to prevent stale data on retry
        try {
          sessionStorage.removeItem('fb_purchase_data')
        } catch {
          // sessionStorage may not be available
        }

        if (error.type === 'card_error' || error.type === 'validation_error') {
          setPaymentError(error.message || 'Payment failed. Please try again.')
        } else {
          setPaymentError('An unexpected error occurred. Please try again.')
        }
        setIsSubmitting(false)
      }
      // If no error, Stripe will redirect to success page
    } catch (err) {
      setPaymentError('Failed to process payment. Please try again.')
      setIsSubmitting(false)
    }
  }

  const inputClassName = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
    }`

  // Handle express checkout confirmation
  const onExpressCheckoutConfirm = async () => {
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      // Store purchase data for success page (same as regular checkout)
      const purchaseEventId = generateEventId('purchase')
      const purchaseData = {
        value: total / 100,
        numItems: items.length,
        contentIds: items.map(item => `${item.designId}-${item.bundleId}`),
        currency: 'USD',
        eventId: purchaseEventId,
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

      // Update PaymentIntent with purchase eventId
      await fetch('/api/payment-intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret?.split('_secret_')[0],
          shippingMethod: 'standard',
          subtotal,
          discountAmount,
          discountCode,
          fbEventId: purchaseEventId,
        }),
      })

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      })

      if (error) {
        sessionStorage.removeItem('fb_purchase_data')
        setPaymentError(error.message || 'Express checkout failed. Please try again.')
        setIsSubmitting(false)
      }
    } catch (err) {
      setPaymentError('Express checkout failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Express Checkout - Apple Pay, Google Pay, Link */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Express Checkout</h2>
        <ExpressCheckoutElement
          onConfirm={onExpressCheckoutConfirm}
          options={{
            buttonType: {
              applePay: 'buy',
              googlePay: 'buy',
            },
          }}
        />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">or pay with card</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Contact</h2>
        <div>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className={inputClassName(!!errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Shipping Address</h2>
        <div className="space-y-3">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                className={inputClassName(!!errors.shippingAddress?.firstName)}
                {...register('shippingAddress.firstName')}
              />
              {errors.shippingAddress?.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.firstName.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                autoComplete="family-name"
                className={inputClassName(!!errors.shippingAddress?.lastName)}
                {...register('shippingAddress.lastName')}
              />
              {errors.shippingAddress?.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <input
              type="text"
              placeholder="Address"
              autoComplete="address-line1"
              className={inputClassName(!!errors.shippingAddress?.address1)}
              {...register('shippingAddress.address1')}
            />
            {errors.shippingAddress?.address1 && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.address1.message}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              autoComplete="address-line2"
              className={inputClassName(false)}
              {...register('shippingAddress.address2')}
            />
          </div>

          {/* City */}
          <div>
            <input
              type="text"
              placeholder="City"
              autoComplete="address-level2"
              className={inputClassName(!!errors.shippingAddress?.city)}
              {...register('shippingAddress.city')}
            />
            {errors.shippingAddress?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
            )}
          </div>

          {/* State, ZIP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="State"
                autoComplete="address-level1"
                className={inputClassName(!!errors.shippingAddress?.state)}
                {...register('shippingAddress.state')}
              />
              {errors.shippingAddress?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="ZIP code"
                autoComplete="postal-code"
                className={inputClassName(!!errors.shippingAddress?.postalCode)}
                {...register('shippingAddress.postalCode')}
              />
              {errors.shippingAddress?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <select
              autoComplete="country"
              className={inputClassName(!!errors.shippingAddress?.country)}
              {...register('shippingAddress.country')}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.shippingAddress?.country && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              autoComplete="tel"
              className={inputClassName(false)}
              {...register('shippingAddress.phone')}
            />
          </div>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Shipping Method</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="standard"
                className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                {...register('shippingMethod')}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {qualifiesForFreeShipping ? 'FREE Standard Shipping' : 'Standard Shipping'}
                </p>
                <p className="text-sm text-gray-500">5-7 business days</p>
              </div>
            </div>
            <span className="font-medium">
              {qualifiesForFreeShipping ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatPrice(PRODUCT.shipping.standard)
              )}
            </span>
          </label>

          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="express"
                className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                {...register('shippingMethod')}
              />
              <div>
                <p className="font-medium text-gray-900">Express Shipping</p>
                <p className="text-sm text-gray-500">1-3 business days</p>
              </div>
            </div>
            <span className="font-medium">
              {formatPrice(qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express)}
            </span>
          </label>
        </div>
      </div>

      {/* Payment - Card only (express methods shown above) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Card Details</h2>
        <div>
          <PaymentElement
            onReady={() => setIsPaymentReady(true)}
            options={{
              layout: 'tabs',
              wallets: {
                applePay: 'never',
                googlePay: 'never',
              },
            }}
          />
        </div>
      </div>

      {/* Error */}
      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{paymentError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !isPaymentReady || !stripe || !elements}
        className="w-full py-4 px-6 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Complete Purchase - {formatPrice(total)}
          </>
        )}
      </button>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Secure 256-bit SSL encryption</span>
      </div>
    </form>
  )
}
