'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore()

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart()
  }, [clearCart])

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
              <Mail className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You&apos;ll receive an email confirmation shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-pink-500 mt-0.5" />
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
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-pink-600">
            <Heart className="w-5 h-5 fill-pink-500" />
            <span className="font-semibold">Special Offer</span>
          </div>
          <p className="text-gray-700">
            Add a second card and get <span className="font-bold">20% off</span>!
          </p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" asChild>
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
