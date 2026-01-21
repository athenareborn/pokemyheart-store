'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { useCartStore } from '@/lib/store/cart'
import { PRODUCT } from '@/data/product'
import { fbPixel } from '@/lib/analytics/fpixel'
import { generateEventId } from '@/lib/analytics/facebook-capi'
import { ga4 } from '@/lib/analytics/ga4'
import { cn } from '@/lib/utils'
import { ExpressCheckout } from './ExpressCheckout'

interface StickyAddToCartProps {
  designId: string
  bundleId: BundleId
  isVisible: boolean
  onScrollToTop?: () => void
}

export function StickyAddToCart({ designId, bundleId, isVisible, onScrollToTop }: StickyAddToCartProps) {
  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const bundle = BUNDLES.find(b => b.id === bundleId)
  const savings = bundle ? bundle.compareAt - bundle.price : 0
  const savingsPercent = bundle ? Math.round((savings / bundle.compareAt) * 100) : 0

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(designId, bundleId)

    // Track FB AddToCart event
    const design = PRODUCT.designs.find(d => d.id === designId)
    const price = (bundle?.price || BUNDLES[0].price) / 100
    const productName = `${PRODUCT.name} - ${design?.name || 'Design'}`

    const eventId = generateEventId('atc')
    fbPixel.addToCart(
      `${designId}-${bundleId}`,
      productName,
      price,
      'USD',
      eventId
    )

    // Track GA4 add_to_cart
    ga4.addToCart({
      itemId: `${designId}-${bundleId}`,
      itemName: productName,
      price,
      quantity: 1,
    })

    setTimeout(() => setIsAdding(false), 600)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="px-4 pt-3 pb-3">
            {/* Price and savings */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(bundle?.price || 0)}
                </span>
                {savings > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(bundle?.compareAt || 0)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                  Save {savingsPercent}%
                </span>
              )}
            </div>

            {/* Buttons row */}
            <div className="flex items-center gap-3">
              {/* Add to Cart button */}
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  'flex-1 border-2 border-brand-500 text-brand-600 hover:bg-brand-50 px-4 py-3 text-base font-semibold transition-all',
                  isAdding && 'scale-95'
                )}
                onClick={handleAddToCart}
              >
                <ShoppingBag className={cn('mr-2 h-5 w-5', isAdding && 'animate-bounce')} />
                {isAdding ? 'Added!' : 'Add to Cart'}
              </Button>

              {/* Express Checkout / Buy Now button */}
              <div className="flex-1">
                <ExpressCheckout designId={designId} bundleId={bundleId} compact />
              </div>
            </div>

            {/* Scroll to top button */}
            {onScrollToTop && (
              <button
                onClick={onScrollToTop}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-md"
                aria-label="Scroll to top"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
