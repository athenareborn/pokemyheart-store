'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { checkoutFormSchema, type CheckoutFormInput } from '@/lib/validation/checkout-schema'
import { useCartStore, SHIPPING_INSURANCE_PRICE } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { formatPrice } from '@/lib/utils'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { saveUserData } from '@/lib/analytics/user-data-store'
import { ga4 } from '@/lib/analytics/ga4'

const splitName = (fullName: string | null | undefined) => {
  const trimmed = fullName?.trim() || ''
  if (!trimmed) {
    return { firstName: '', lastName: '' }
  }
  const parts = trimmed.split(/\s+/)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

const parseUsAddress = (value: string) => {
  const parts = value.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length < 3) return null

  const city = parts[parts.length - 2]
  const stateZip = parts[parts.length - 1].split(/\s+/).filter(Boolean)
  if (stateZip.length < 2) return null

  const state = stateZip[0].toUpperCase()
  const postalCode = stateZip.slice(1).join(' ')

  if (!/^[A-Z]{2}$/.test(state)) return null
  if (!/^\d{5}(-\d{4})?$/.test(postalCode)) return null

  return { city, state, postalCode }
}

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
  const [hideExpressCheckout, setHideExpressCheckout] = useState(false)

  const { items, getSubtotal, isFreeShipping, shippingInsurance, setShippingInsurance } = useCartStore()
  const subtotal = getSubtotal()
  const qualifiesForFreeShipping = isFreeShipping()
  const allowedCountries = PRODUCT.allowedShippingCountries.length
    ? PRODUCT.allowedShippingCountries
    : (['US'] as Array<'US' | 'AU' | 'CA' | 'GB'>)
  const defaultCountry = allowedCountries[0] ?? 'US'

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
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
        country: defaultCountry,
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const showExpressCheckout = !hideExpressCheckout

  const onSubmit = async (data: CheckoutFormInput) => {
    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    const email = typeof data.email === 'string' ? data.email.trim() : ''
    const phone = data.shippingAddress.phone?.trim() || ''

    saveUserData({
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      postalCode: data.shippingAddress.postalCode,
      country: data.shippingAddress.country,
    })

    ga4.setUserData({
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      street: data.shippingAddress.address1,
      city: data.shippingAddress.city,
      region: data.shippingAddress.state,
      postalCode: data.shippingAddress.postalCode,
      country: data.shippingAddress.country,
    })

    try {
      const gaClientId = await ga4.getClientId()
      const purchaseEventId = generateEventId('purchase')
      const purchaseData = {
        value: total / 100,
        numItems: itemCount,
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
          gaData: { clientId: gaClientId },
          ...(email ? { email } : {}),
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

      // Don't include shipping in confirmParams - it was already set server-side via PATCH
      // Stripe doesn't allow changing shipping set with secret key using publishable key
      const confirmParams = {
        return_url: successUrl.toString(),
        ...(email ? { receipt_email: email } : {}),
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams,
      })

      if (error) {
        try {
          sessionStorage.removeItem('fb_purchase_data')
        } catch {
          // sessionStorage may not be available
        }

        // Always show the actual error message from Stripe for better debugging
        console.error('Stripe payment error:', error.type, error.message)
        setPaymentError(error.message || 'Payment failed. Please try again.')
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

  const handleAddressBlur = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const parsed = parseUsAddress(trimmed)
    if (!parsed) return

    const current = getValues('shippingAddress')
    if (!current.city) {
      setValue('shippingAddress.city', parsed.city, { shouldValidate: true, shouldDirty: true })
    }
    if (!current.state) {
      setValue('shippingAddress.state', parsed.state, { shouldValidate: true, shouldDirty: true })
    }
    if (!current.postalCode) {
      setValue('shippingAddress.postalCode', parsed.postalCode, { shouldValidate: true, shouldDirty: true })
    }
  }

  const address1Register = register('shippingAddress.address1')

  const onExpressCheckoutConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements || !clientSecret) {
      event.paymentFailed({ reason: 'fail', message: 'Payment system not ready. Please refresh and try again.' })
      setPaymentError('Payment system not ready. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    const billingDetails = event.billingDetails
    const shippingDetails = event.shippingAddress
    const shippingRateId = event.shippingRate?.id || (qualifiesForFreeShipping ? 'free-shipping' : 'standard-shipping')
    const shippingMethod = shippingRateId === 'express-shipping' ? 'express' : 'standard'
    const email = billingDetails?.email || ''
    const phone = billingDetails?.phone || ''
    const name = shippingDetails?.name || billingDetails?.name || ''
    const { firstName, lastName } = splitName(name)

    if (!shippingDetails) {
      event.paymentFailed({ reason: 'invalid_shipping_address', message: 'Shipping address is required.' })
      setPaymentError('Shipping address is required for express checkout.')
      setIsSubmitting(false)
      return
    }

    if (!email) {
      event.paymentFailed({ reason: 'invalid_payment_data', message: 'Email is required.' })
      setPaymentError('Email is required for express checkout.')
      setIsSubmitting(false)
      return
    }

    const shippingAddress = {
      firstName,
      lastName,
      address1: shippingDetails.address.line1,
      address2: shippingDetails.address.line2 || '',
      city: shippingDetails.address.city,
      state: shippingDetails.address.state,
      postalCode: shippingDetails.address.postal_code,
      country: shippingDetails.address.country,
      phone,
    }

    saveUserData({
      email,
      phone,
      firstName,
      lastName,
      city: shippingDetails.address.city,
      state: shippingDetails.address.state,
      postalCode: shippingDetails.address.postal_code,
      country: shippingDetails.address.country,
    })

    try {
      ga4.setUserData({
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        firstName,
        lastName,
        street: shippingDetails.address.line1,
        city: shippingDetails.address.city,
        region: shippingDetails.address.state,
        postalCode: shippingDetails.address.postal_code,
        country: shippingDetails.address.country,
      })

      const gaClientId = await ga4.getClientId()
      const purchaseEventId = generateEventId('purchase')
      const purchaseData = {
        value: total / 100,
        numItems: itemCount,
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

      // For express checkout, don't send shippingAddress - Apple Pay already set it correctly on the PI
      // Just update amount, insurance, and customer for post-purchase offers
      const patchResponse = await fetch('/api/payment-intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          shippingMethod,
          subtotal,
          discountAmount,
          discountCode,
          shippingInsurance,
          fbEventId: purchaseEventId,
          email,
          customerName: name,
          gaData: { clientId: gaClientId },
          // Don't send shippingAddress - let Stripe keep Apple Pay's data
        }),
      })

      if (!patchResponse.ok) {
        event.paymentFailed({ reason: 'fail', message: 'Failed to update shipping details. Please try again.' })
        setPaymentError('Failed to update shipping details. Please try again.')
        setIsSubmitting(false)
        return
      }

      const patchData = await patchResponse.json()
      const stripeCustomerId = patchData.stripeCustomerId

      const successUrl = new URL(`${window.location.origin}/checkout/success`)
      if (stripeCustomerId) {
        successUrl.searchParams.set('customer', stripeCustomerId)
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: successUrl.toString(),
          receipt_email: email,
          shipping: {
            name: name || `${firstName} ${lastName}`.trim(),
            address: {
              line1: shippingDetails.address.line1,
              line2: shippingDetails.address.line2 || undefined,
              city: shippingDetails.address.city,
              state: shippingDetails.address.state,
              postal_code: shippingDetails.address.postal_code,
              country: shippingDetails.address.country,
            },
            phone: phone || undefined,
          },
        },
      })

      if (error) {
        try {
          sessionStorage.removeItem('fb_purchase_data')
        } catch {
          // sessionStorage may not be available
        }
        event.paymentFailed({ reason: 'fail', message: error.message || 'Express checkout failed.' })
        setPaymentError(error.message || 'Express checkout failed. Please try again.')
        setIsSubmitting(false)
      }
    } catch {
      event.paymentFailed({ reason: 'fail', message: 'Express checkout failed. Please try again.' })
      setPaymentError('Express checkout failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Express Checkout - Hidden if no Apple Pay / Google Pay available */}
      {showExpressCheckout && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Express checkout</p>
          <ExpressCheckoutElement
            onReady={({ availablePaymentMethods }) => {
              if (!availablePaymentMethods || Object.keys(availablePaymentMethods).length === 0) {
                setHideExpressCheckout(true)
              }
            }}
            onShippingAddressChange={({ resolve }) => resolve({})}
            onShippingRateChange={({ resolve }) => resolve({})}
            onConfirm={onExpressCheckoutConfirm}
            options={{
              emailRequired: true,
              shippingAddressRequired: true,
              billingAddressRequired: true,
              phoneNumberRequired: true,
              allowedShippingCountries: PRODUCT.allowedShippingCountries,
              shippingRates: qualifiesForFreeShipping
                ? [
                    {
                      id: 'free-shipping',
                      displayName: 'Free Shipping',
                      amount: 0,
                      deliveryEstimate: {
                        minimum: { unit: 'day', value: 5 },
                        maximum: { unit: 'day', value: 7 },
                      },
                    },
                  ]
                : [
                    {
                      id: 'standard-shipping',
                      displayName: 'Standard Shipping',
                      amount: PRODUCT.shipping.standard,
                      deliveryEstimate: {
                        minimum: { unit: 'day', value: 5 },
                        maximum: { unit: 'day', value: 7 },
                      },
                    },
                    {
                      id: 'express-shipping',
                      displayName: 'Express Shipping',
                      amount: PRODUCT.shipping.express,
                      deliveryEstimate: {
                        minimum: { unit: 'day', value: 1 },
                        maximum: { unit: 'day', value: 3 },
                      },
                    },
                  ],
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
      )}

      {showExpressCheckout && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      )}

      {/* Main Checkout Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
        {/* Contact */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Contact</h2>
          <div>
            <input
              type="text"
              placeholder="Email or phone number"
              autoComplete="email tel"
              className={inputClassName(!!errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">For order updates and shipping notifications</p>
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
                placeholder="Street address"
                autoComplete="street-address"
                className={inputClassName(!!errors.shippingAddress?.address1)}
                {...address1Register}
                onBlur={(event) => {
                  address1Register.onBlur(event)
                  handleAddressBlur(event.target.value)
                }}
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

            {/* City, State, ZIP row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
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
                  placeholder="ZIP"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  className={inputClassName(!!errors.shippingAddress?.postalCode)}
                  {...register('shippingAddress.postalCode')}
                />
                {errors.shippingAddress?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
                )}
              </div>
            </div>
            {allowedCountries.length > 1 ? (
              <div className="mt-3">
                <select
                  className={inputClassName(!!errors.shippingAddress?.country)}
                  {...register('shippingAddress.country')}
                >
                  {allowedCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.shippingAddress?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
                )}
              </div>
            ) : (
              <input type="hidden" value={defaultCountry} {...register('shippingAddress.country')} />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Delivery - styled to match Stripe payment tabs */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Delivery</h2>
          <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
            <label className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors has-[:checked]:bg-brand-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="standard"
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                  {...register('shippingMethod')}
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {qualifiesForFreeShipping ? 'Free Standard Shipping' : 'Standard Shipping'}
                  </p>
                  <p className="text-xs text-gray-500">5-7 business days</p>
                </div>
              </div>
              <span className="font-semibold text-sm">
                {qualifiesForFreeShipping ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(PRODUCT.shipping.standard)
                )}
              </span>
            </label>

            <label className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors has-[:checked]:bg-brand-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="express"
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                  {...register('shippingMethod')}
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Express Shipping</p>
                  <p className="text-xs text-gray-500">1-3 business days</p>
                </div>
              </div>
              <span className="font-semibold text-sm">
                {formatPrice(qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express)}
              </span>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Protect Your Order */}
        <div className="pb-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Protect Your Order</h2>
          <label className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
            shippingInsurance
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={shippingInsurance}
              onChange={(e) => setShippingInsurance(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-emerald-500 rounded focus:ring-emerald-500 focus:ring-offset-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${shippingInsurance ? 'text-emerald-600' : 'text-gray-400'}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <span className={`font-semibold text-sm ${shippingInsurance ? 'text-emerald-900' : 'text-gray-900'}`}>
                  Package Protection
                </span>
                <span className={`font-bold text-sm ml-auto ${shippingInsurance ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {formatPrice(SHIPPING_INSURANCE_PRICE)}
                </span>
              </div>
              <p className={`text-xs mt-1 ${shippingInsurance ? 'text-emerald-700' : 'text-gray-500'}`}>
                Full coverage against loss, theft, or damage. Free replacement or refund.
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

        {/* Order recap - compact */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          {/* Product thumbnails row */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {items.map((item) => {
                const design = PRODUCT.designs.find(d => d.id === item.designId)
                return (
                  <div key={item.id} className="relative w-10 h-10 rounded-md overflow-hidden border-2 border-white bg-white flex-shrink-0 shadow-sm">
                    {design?.thumbnail && (
                      <Image
                        src={design.thumbnail}
                        alt={design.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                    {item.quantity > 1 && (
                      <div className="absolute top-0 right-0 bg-gray-900 text-white text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-bl-sm">
                        {item.quantity}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex-1 min-w-0 ml-1">
              <p className="text-xs text-gray-600">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>

          {/* Expandable breakdown - just key lines */}
          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            {shippingInsurance && (
              <div className="flex justify-between">
                <span>Protection</span>
                <span>{formatPrice(SHIPPING_INSURANCE_PRICE)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {paymentError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-600">{paymentError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !isPaymentReady || !stripe || !elements}
          className="w-full py-5 px-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay {formatPrice(total)}
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
