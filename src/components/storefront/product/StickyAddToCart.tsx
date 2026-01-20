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
import { cn } from '@/lib/utils'

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
    const eventId = generateEventId('atc')
    fbPixel.addToCart(
      `${designId}-${bundleId}`,
      `${PRODUCT.name} - ${design?.name || 'Design'}`,
      (bundle?.price || BUNDLES[0].price) / 100,
      'USD',
      eventId
    )

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
            <div className="flex items-center justify-between gap-3">
              {/* Price section */}
              <div className="flex flex-col min-w-0">
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
                  <span className="text-xs text-green-600 font-semibold">
                    You save {formatPrice(savings)} ({savingsPercent}% off)
                  </span>
                )}
              </div>

              {/* Add to Cart button */}
              <Button
                size="lg"
                className={cn(
                  'flex-shrink-0 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 text-base font-semibold transition-all',
                  isAdding && 'scale-95'
                )}
                onClick={handleAddToCart}
              >
                <ShoppingBag className={cn('mr-2 h-5 w-5', isAdding && 'animate-bounce')} />
                {isAdding ? 'Added!' : 'Add to Cart'}
              </Button>
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
