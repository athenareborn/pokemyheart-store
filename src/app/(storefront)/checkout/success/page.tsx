'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { fbPixel } from '@/lib/analytics/fpixel'
import { ga4 } from '@/lib/analytics/ga4'

function CheckoutSuccessContent() {
  const { clearCart } = useCartStore()
  const searchParams = useSearchParams()
  const hasTracked = useRef(false)

  // Clear cart and track FB Purchase on successful checkout
  useEffect(() => {
    clearCart()

    // Prevent double tracking (React StrictMode calls useEffect twice)
    if (hasTracked.current) return
    hasTracked.current = true

    // Track Purchase events (Facebook + GA4)
    const purchaseDataStr = sessionStorage.getItem('fb_purchase_data')
    if (purchaseDataStr) {
      try {
        const purchaseData = JSON.parse(purchaseDataStr)
        // Support both session_id (old flow) and payment_intent (new flow)
        const orderId = searchParams.get('session_id') ||
                        searchParams.get('payment_intent') ||
                        'unknown'

        // Facebook Pixel
        fbPixel.purchase(
          orderId,
          purchaseData.value,
          purchaseData.numItems,
          purchaseData.contentIds,
          purchaseData.currency,
          purchaseData.eventId
        )

        // Google Analytics 4 (client-side redundancy)
        if (purchaseData.items) {
          ga4.purchase({
            transactionId: orderId,
            value: purchaseData.value,
            items: purchaseData.items.map((item: { itemId: string; itemName: string; price: number; quantity: number }) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              price: item.price,
              quantity: item.quantity,
            })),
          })
        }

        // Clear stored data after tracking
        sessionStorage.removeItem('fb_purchase_data')
      } catch (e) {
        console.error('Failed to track Purchase:', e)
      }
    }
  }, [clearCart, searchParams])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600">
            Your order has been confirmed and is being processed.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
          <h2 className="font-semibold text-gray-900">What&apos;s Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You&apos;ll receive an email confirmation shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-brand-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Shipping Updates</p>
                <p className="text-sm text-gray-600">
                  We&apos;ll notify you when your order ships with tracking info.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-brand-600">
            <Heart className="w-5 h-5 fill-brand-500" />
            <span className="font-semibold">Special Offer</span>
          </div>
          <p className="text-gray-700">
            Add a second card and get <span className="font-bold">20% off</span>!
          </p>
          <Button className="bg-brand-500 hover:bg-brand-600 text-white" asChild>
            <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
              Shop Again
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Continue Shopping */}
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
