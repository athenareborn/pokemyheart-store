'use client'

import { ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { fbPixel } from '@/lib/analytics/fpixel'
import { generateEventId } from '@/lib/analytics/facebook-capi'

interface AddToCartProps {
  designId: string
  bundleId: BundleId
}

export function AddToCart({ designId, bundleId }: AddToCartProps) {
  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(designId, bundleId)

    // Track FB AddToCart event
    const bundle = BUNDLES.find(b => b.id === bundleId)
    const design = PRODUCT.designs.find(d => d.id === designId)
    const eventId = generateEventId('atc')
    fbPixel.addToCart(
      `${designId}-${bundleId}`,
      `${PRODUCT.name} - ${design?.name || 'Design'}`,
      (bundle?.price || BUNDLES[0].price) / 100,
      'USD',
      eventId
    )

    // Reset animation after a short delay
    setTimeout(() => setIsAdding(false), 600)
  }

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className={cn(
          'w-full text-lg py-6 bg-pink-500 hover:bg-pink-600 text-white transition-all',
          isAdding && 'scale-95'
        )}
        onClick={handleAddToCart}
      >
        <ShoppingBag className={cn('mr-2 h-5 w-5', isAdding && 'animate-bounce')} />
        {isAdding ? 'Added!' : 'Add to Cart'}
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="w-full text-lg py-6 border-pink-200 text-pink-600 hover:bg-pink-50"
      >
        <Heart className="mr-2 h-5 w-5" />
        Add to Wishlist
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 pt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secure Checkout
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          All Cards Accepted
        </span>
      </div>
    </div>
  )
}
