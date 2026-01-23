'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { checkoutFormSchema, type CheckoutFormInput } from '@/lib/validation/checkout-schema'
import { useCartStore, SHIPPING_INSURANCE_PRICE } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { formatPrice } from '@/lib/utils'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { saveUserData } from '@/lib/analytics/user-data-store'

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

  const { items, getSubtotal, isFreeShipping, shippingInsurance, setShippingInsurance } = useCartStore()
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

  useEffect(() => {
    onShippingMethodChange(shippingMethod)
  }, [shippingMethod, onShippingMethodChange])

  const shippingCost = (() => {
    if (shippingMethod === 'express') {
      return qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express
    }
    return qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
  })()

  const insuranceCost = shippingInsurance ? SHIPPING_INSURANCE_PRICE : 0
  const total = subtotal + shippingCost + insuranceCost - discountAmount

  const onSubmit = async (data: CheckoutFormInput) => {
    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

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

      const patchResponse = await fetch('/api/payment-intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          shippingMethod: data.shippingMethod,
          subtotal,
          discountAmount,
          discountCode,
          shippingInsurance,
          fbEventId: purchaseEventId,
          email: data.email,
          customerName: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`.trim(),
          shippingAddress: data.shippingAddress,
        }),
      })

      const patchData = await patchResponse.json()
      const stripeCustomerId = patchData.stripeCustomerId

      // Build success URL with customer ID for 1-click post-purchase offers
      const successUrl = new URL(`${window.location.origin}/checkout/success`)
      if (stripeCustomerId) {
        successUrl.searchParams.set('customer', stripeCustomerId)
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: successUrl.toString(),
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
    } catch {
      setPaymentError('Failed to process payment. Please try again.')
      setIsSubmitting(false)
    }
  }

  const inputClassName = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
    }`

  const onExpressCheckoutConfirm = async () => {
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setPaymentError(null)

    try {
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

      await fetch('/api/payment-intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret?.split('_secret_')[0],
          shippingMethod: 'standard',
          subtotal,
          discountAmount,
          discountCode,
          shippingInsurance,
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
    } catch {
      setPaymentError('Express checkout failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Express Checkout - Standalone Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-5">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Express Checkout</h2>
        <ExpressCheckoutElement
          onConfirm={onExpressCheckoutConfirm}
          options={{
            buttonType: {
              applePay: 'buy',
              googlePay: 'buy',
            },
          }}
        />
      </div>

      {/* Divider - Outside Express Box */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-4 text-gray-500">or continue below</span>
        </div>
      </div>

      {/* Unified Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
        {/* Contact */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Contact</h2>
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

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Shipping */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Shipping</h2>
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

            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              autoComplete="address-line2"
              className={inputClassName(false)}
              {...register('shippingAddress.address2')}
            />

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

            {/* State, ZIP, Country - 3 column on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            </div>

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone (optional)"
              autoComplete="tel"
              className={inputClassName(false)}
              {...register('shippingAddress.phone')}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Delivery */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Delivery</h2>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-400 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="standard"
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                  {...register('shippingMethod')}
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {qualifiesForFreeShipping ? 'FREE Standard Shipping' : 'Standard Shipping'}
                  </p>
                  <p className="text-xs text-gray-500">5-7 business days</p>
                </div>
              </div>
              <span className="font-medium text-sm">
                {qualifiesForFreeShipping ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(PRODUCT.shipping.standard)
                )}
              </span>
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-400 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="express"
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                  {...register('shippingMethod')}
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Express Shipping</p>
                  <p className="text-xs text-gray-500">1-3 business days</p>
                </div>
              </div>
              <span className="font-medium text-sm">
                {formatPrice(qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express)}
              </span>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Protect Your Order - Add-on Section */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Protect Your Order</h2>
          <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
            shippingInsurance
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 shadow-sm'
              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={shippingInsurance}
              onChange={(e) => setShippingInsurance(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-emerald-500 rounded focus:ring-emerald-500 focus:ring-offset-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Shield Icon */}
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${shippingInsurance ? 'text-emerald-600' : 'text-gray-500'}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <span className={`font-semibold text-sm ${shippingInsurance ? 'text-emerald-900' : 'text-gray-900'}`}>
                  Package Protection
                </span>
                <span className={`font-bold text-sm ml-auto ${shippingInsurance ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {formatPrice(SHIPPING_INSURANCE_PRICE)}
                </span>
              </div>
              <p className={`text-xs mt-1.5 ${shippingInsurance ? 'text-emerald-700' : 'text-gray-500'}`}>
                Full coverage against loss, theft, or damage during shipping. Get a free replacement or full refund.
              </p>
            </div>
          </label>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Payment */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Payment</h2>
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

        {/* Error */}
        {paymentError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
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
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
          <Lock className="w-4 h-4" />
          <span>Secure 256-bit SSL encryption</span>
        </div>
      </form>
    </div>
  )
}
