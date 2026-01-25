'use client'

import { forwardRef, useState } from 'react'
import { ShoppingBag, Shield, Truck, Clock, Award, CreditCard } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fbPixel } from '@/lib/analytics/fpixel'
import { generateEventId, getFbCookies } from '@/lib/analytics/facebook-capi'
import { getUserData, getExternalId } from '@/lib/analytics/user-data-store'
import { ga4 } from '@/lib/analytics/ga4'
import { analytics as supabaseAnalytics } from '@/lib/analytics/tracker'
import { ExpressCheckout } from './ExpressCheckout'
import { DeliveryTimeline } from './DeliveryTimeline'

interface AddToCartProps {
  designId: string
  bundleId: BundleId
}

export const AddToCart = forwardRef<HTMLDivElement, AddToCartProps>(
  function AddToCart({ designId, bundleId }, ref) {
    const { addItem } = useCartStore()
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = () => {
      setIsAdding(true)
      addItem(designId, bundleId)

      const bundle = BUNDLES.find(b => b.id === bundleId)
      const design = PRODUCT.designs.find(d => d.id === designId)
      const price = (bundle?.price || BUNDLES[0].price) / 100
      const productName = `${PRODUCT.name} - ${design?.name || 'Design'}`

      // Track Facebook AddToCart (client-side pixel)
      const eventId = generateEventId('atc')
      fbPixel.addToCart(
        `${designId}-${bundleId}`,
        productName,
        price,
        'USD',
        eventId
      )

      // Track Facebook AddToCart (server-side CAPI for improved match quality)
      const userData = getUserData()
      const { fbc, fbp } = getFbCookies()

      fetch('/api/analytics/fb-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'AddToCart',
          eventId,
          eventSourceUrl: window.location.href,
          userData: {
            email: userData?.email,
            phone: userData?.phone,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            city: userData?.city,
            state: userData?.state,
            postalCode: userData?.postalCode,
            country: userData?.country,
            externalId: getExternalId(),
            fbc,
            fbp,
          },
          customData: {
            value: price,
            currency: 'USD',
            content_name: productName,
            content_type: 'product',
            content_category: 'Valentine Cards',
            // Per Meta: use contents (not content_ids) when we have full product info
            contents: [{
              id: `${designId}-${bundleId}`,
              quantity: 1,
              item_price: price,
            }],
          },
        }),
      }).catch(() => {
        // Silent fail - don't break user experience for analytics
      })

      // Track GA4 add_to_cart
      ga4.addToCart({
        itemId: `${designId}-${bundleId}`,
        itemName: productName,
        price,
        quantity: 1,
      })

      // Track Supabase analytics funnel
      supabaseAnalytics.addToCart(PRODUCT.id, productName, price, 1)

      // Reset animation after a short delay
      setTimeout(() => setIsAdding(false), 600)
    }

    return (
      <div ref={ref} className="space-y-4">
        {/* Valentine's delivery callout - right above CTA */}
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Order today for estimated Valentine's delivery (US)</span>
        </div>

        <DeliveryTimeline />

        {/* Main CTA Button */}
        <Button
          size="lg"
          className={cn(
            'w-full text-lg py-6 bg-brand-500 hover:bg-brand-600 text-white transition-all font-semibold',
            isAdding && 'scale-95'
          )}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingBag className={cn('mr-2 h-5 w-5', isAdding && 'animate-bounce')} />
          {isAdding ? 'Added!' : 'Add to Cart'}
        </Button>

        {/* Express Checkout (Apple Pay / Google Pay) */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-500">
                or checkout with
              </span>
            </div>
          </div>
          <ExpressCheckout designId={designId} bundleId={bundleId} />
        </div>

        {/* Primary Trust Badge - Money Back Guarantee */}
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
          <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-green-800 text-sm">30-Day Money Back Guarantee</p>
            <p className="text-xs text-green-600">Not happy? Full refund, no questions asked.</p>
          </div>
        </div>

        {/* Secondary Trust Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700">Free Shipping</p>
              <p className="text-xs text-gray-500">On orders $35+</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700">Fast Shipping</p>
              <p className="text-xs text-gray-500">Ships in 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700">Premium Quality</p>
              <p className="text-xs text-gray-500">Holographic finish</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700">Secure Checkout</p>
              <p className="text-xs text-gray-500">SSL encrypted</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="text-xs text-gray-400">We accept:</span>
          <div className="flex gap-1.5">
            {/* Visa */}
            <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-7 h-5">
                <rect fill="#1A1F71" width="48" height="32" rx="4"/>
                <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">VISA</text>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-7 h-5">
                <rect fill="#000" width="48" height="32" rx="4"/>
                <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
              </svg>
            </div>
            {/* Amex */}
            <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-7 h-5">
                <rect fill="#006FCF" width="48" height="32" rx="4"/>
                <text x="24" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
              </svg>
            </div>
            {/* Apple Pay */}
            <div className="w-9 h-6 bg-black border border-gray-200 rounded flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-7 h-5">
                <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif">Pay</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
