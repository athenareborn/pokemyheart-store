'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Heart, CreditCard, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { getFbCookies, generateEventId } from '@/lib/analytics/facebook-capi'
import { getExternalId } from '@/lib/analytics/user-data-store'

interface CustomerInfo {
  customerId: string
  hasPaymentMethod: boolean
  cardLast4: string | null
  cardBrand: string | null
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  } | null
  shippingName: string | null
  discountedPrice: number
  originalPrice: number
  shippingCost: number
}

interface PostPurchaseOfferProps {
  customerId: string | null
  originalDesignId?: string
}

// Card Only bundle with 20% discount
const CARD_ONLY_BUNDLE = BUNDLES.find(b => b.id === 'card-only')
const ORIGINAL_PRICE = CARD_ONLY_BUNDLE?.price || 2395
const DISCOUNT_PERCENT = 20
const DISCOUNTED_PRICE = Math.round(ORIGINAL_PRICE * (1 - DISCOUNT_PERCENT / 100))
const SHIPPING_COST = PRODUCT.shipping.standard // Card Only doesn't qualify for free shipping

// Countdown duration in seconds (10 minutes)
const COUNTDOWN_DURATION = 10 * 60

export function PostPurchaseOffer({ customerId, originalDesignId }: PostPurchaseOfferProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Design selection - default to different design than original
  const [selectedDesignId, setSelectedDesignId] = useState<string>(() => {
    // Try to pick a different design than what they just bought
    const otherDesign = PRODUCT.designs.find(d => d.id !== originalDesignId)
    return otherDesign?.id || PRODUCT.designs[0].id
  })

  // Purchase state
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  // Countdown timer
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_DURATION)
  const [isExpired, setIsExpired] = useState(false)

  // Track analytics event helper
  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params)
    }
  }, [])

  // Fetch customer info
  useEffect(() => {
    if (!customerId) {
      setIsLoading(false)
      setError('No customer information available')
      return
    }

    const fetchCustomerInfo = async () => {
      try {
        const response = await fetch(`/api/post-purchase-charge?customerId=${customerId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch customer info')
        }
        const data = await response.json()
        setCustomerInfo(data)

        // Track offer viewed
        trackEvent('post_purchase_offer_viewed', {
          offer_type: 'card_only_20_off',
          original_price: ORIGINAL_PRICE / 100,
          discounted_price: DISCOUNTED_PRICE / 100,
        })
      } catch (err) {
        setError('Unable to load offer')
        console.error('Error fetching customer info:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerInfo()
  }, [customerId, trackEvent])

  // Countdown timer
  useEffect(() => {
    if (isExpired || purchaseSuccess) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true)
          clearInterval(interval)
          // Track offer expired
          trackEvent('post_purchase_offer_expired', {
            offer_type: 'card_only_20_off',
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isExpired, purchaseSuccess, trackEvent])

  // Format time remaining
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Handle 1-click purchase
  const handlePurchase = async () => {
    if (!customerId || !customerInfo?.hasPaymentMethod || !customerInfo?.shippingAddress) {
      return
    }

    // Track click event
    trackEvent('post_purchase_offer_clicked', {
      offer_type: 'card_only_20_off',
      design_id: selectedDesignId,
      design_name: PRODUCT.designs.find(d => d.id === selectedDesignId)?.name,
    })

    setIsPurchasing(true)
    setPurchaseError(null)

    try {
      const response = await fetch('/api/post-purchase-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          designId: selectedDesignId,
          shippingAddress: {
            firstName: customerInfo.shippingName?.split(' ')[0] || '',
            lastName: customerInfo.shippingName?.split(' ').slice(1).join(' ') || '',
            address1: customerInfo.shippingAddress.line1,
            address2: customerInfo.shippingAddress.line2 || '',
            city: customerInfo.shippingAddress.city,
            state: customerInfo.shippingAddress.state,
            postalCode: customerInfo.shippingAddress.postal_code,
            country: customerInfo.shippingAddress.country,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'card_declined') {
          setPurchaseError('Your card was declined. Please try a different payment method.')
        } else if (data.code === 'authentication_required') {
          setPurchaseError('Additional authentication required. Please complete checkout manually.')
        } else if (data.code === 'no_payment_method') {
          setPurchaseError('No saved payment method found.')
        } else {
          setPurchaseError(data.message || 'Payment failed. Please try again.')
        }
        return
      }

      setPurchaseSuccess(true)

      // Track post-purchase order completed (specific event per plan)
      trackEvent('post_purchase_order_completed', {
        transaction_id: data.paymentIntentId,
        value: data.amount / 100,
        currency: 'USD',
        offer_type: 'card_only_20_off',
        design_id: selectedDesignId,
        design_name: PRODUCT.designs.find(d => d.id === selectedDesignId)?.name,
        discount_percent: DISCOUNT_PERCENT,
      })

      // Also track as standard purchase for GA4 ecommerce
      trackEvent('purchase', {
        transaction_id: data.paymentIntentId,
        value: data.amount / 100,
        currency: 'USD',
        items: [{
          item_id: `card-only-${selectedDesignId}`,
          item_name: `Card Only - ${PRODUCT.designs.find(d => d.id === selectedDesignId)?.name}`,
          price: data.discountedPrice / 100,
          quantity: 1,
        }],
      })

      // Facebook CAPI tracking for iOS 14.5+ attribution
      const { fbc, fbp } = getFbCookies()
      const fbEventId = generateEventId('purchase')
      fetch('/api/analytics/fb-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Purchase',
          eventId: fbEventId,
          eventSourceUrl: window.location.href,
          userData: {
            externalId: getExternalId(),
            fbc,
            fbp,
          },
          customData: {
            value: data.amount / 100,
            currency: 'USD',
            order_id: data.paymentIntentId,
            num_items: 1,
            content_type: 'product',
            contents: [{
              id: `card-only-${selectedDesignId}`,
              quantity: 1,
              item_price: data.discountedPrice / 100,
            }],
            is_post_purchase: true,
          },
        }),
      }).catch(() => {
        // Silent fail - primary tracking already done
      })
    } catch (err) {
      console.error('Purchase error:', err)
      setPurchaseError('Something went wrong. Please try again.')
    } finally {
      setIsPurchasing(false)
    }
  }

  // Format card brand for display
  const formatCardBrand = (brand: string | null) => {
    if (!brand) return 'Card'
    const brandMap: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
    }
    return brandMap[brand.toLowerCase()] || brand
  }

  // Format shipping address for display
  const formatShippingAddress = () => {
    if (!customerInfo?.shippingAddress) return null
    const addr = customerInfo.shippingAddress
    return `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ''}, ${addr.city}, ${addr.state} ${addr.postal_code}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span className="text-gray-600">Loading special offer...</span>
        </div>
      </div>
    )
  }

  // Error state or no customer ID
  if (error || !customerId || !customerInfo?.hasPaymentMethod) {
    return null // Don't show offer if we can't do 1-click
  }

  // Success state
  if (purchaseSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold text-lg">Order Confirmed!</span>
        </div>
        <p className="text-center text-gray-700">
          Your second card has been added to your order. You&apos;ll receive a confirmation email shortly.
        </p>
        <div className="text-center text-sm text-gray-500">
          Design: {PRODUCT.designs.find(d => d.id === selectedDesignId)?.name}
        </div>
      </div>
    )
  }

  // Expired state
  if (isExpired) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Offer Expired</span>
        </div>
        <p className="text-center text-gray-600">
          This special offer has expired. You can still shop for more cards at regular prices.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/products/i-choose-you-the-ultimate-valentines-gift'}
        >
          Shop Cards
        </Button>
      </div>
    )
  }

  const selectedDesign = PRODUCT.designs.find(d => d.id === selectedDesignId)
  const totalPrice = DISCOUNTED_PRICE + SHIPPING_COST

  return (
    <div className="bg-gradient-to-br from-brand-50 via-pink-50 to-rose-50 border border-brand-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-brand-600">
          <Heart className="w-5 h-5 fill-brand-500" />
          <span className="font-bold text-lg">Send One to Your Bestie Too!</span>
        </div>
        <p className="text-sm text-gray-600">
          One-time exclusive offer for you
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 rounded-lg py-2 px-4">
        <Clock className="w-4 h-4" />
        <span className="font-medium text-sm">
          Offer expires in <span className="font-bold tabular-nums">{formatTime(timeRemaining)}</span>
        </span>
      </div>

      {/* Product Display */}
      <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
        {selectedDesign && (
          <div className="w-20 h-20 relative flex-shrink-0">
            <Image
              src={selectedDesign.thumbnail}
              alt={selectedDesign.name}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Card Only</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-brand-600">
              {formatPrice(DISCOUNTED_PRICE)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(ORIGINAL_PRICE)}
            </span>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              {DISCOUNT_PERCENT}% OFF
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            + {formatPrice(SHIPPING_COST)} shipping
          </p>
        </div>
      </div>

      {/* Design Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose your design:
        </label>
        <div className="grid grid-cols-5 gap-2">
          {PRODUCT.designs.map((design) => (
            <button
              key={design.id}
              onClick={() => setSelectedDesignId(design.id)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedDesignId === design.id
                  ? 'border-brand-500 ring-2 ring-brand-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={design.thumbnail}
                alt={design.name}
                fill
                className="object-cover"
              />
              {selectedDesignId === design.id && (
                <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-500">
          {selectedDesign?.name}
        </p>
      </div>

      {/* Shipping & Payment Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="truncate">{formatShippingAddress()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="w-4 h-4 flex-shrink-0" />
          <span>
            {formatCardBrand(customerInfo.cardBrand)} ending in {customerInfo.cardLast4}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {purchaseError && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p>{purchaseError}</p>
            <a
              href="/products/i-choose-you-the-ultimate-valentines-gift"
              className="underline hover:no-underline mt-1 inline-block"
            >
              Complete checkout manually
            </a>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <Button
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-6 text-base"
        onClick={handlePurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>Buy Now - {formatPrice(totalPrice)}</>
        )}
      </Button>

      {/* Consent Text */}
      <p className="text-xs text-center text-gray-500">
        By clicking, you authorize a one-time charge of {formatPrice(totalPrice)} to your card on file.
      </p>
    </div>
  )
}
