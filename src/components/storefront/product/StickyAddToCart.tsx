'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { ExpressCheckout } from './ExpressCheckout'

interface StickyAddToCartProps {
  designId: string
  bundleId: BundleId
  isVisible: boolean
}

export function StickyAddToCart({ designId, bundleId, isVisible }: StickyAddToCartProps) {
  const bundle = BUNDLES.find(b => b.id === bundleId)
  const design = PRODUCT.designs.find(d => d.id === designId)

  const hasFreeShipping = bundle && bundle.price >= 3500

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
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              {/* Design thumbnail */}
              <div className="w-11 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                {design?.thumbnail && (
                  <Image
                    src={design.thumbnail}
                    alt={design.name}
                    width={44}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Bundle name + Price */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {bundle?.name || 'Bundle'}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(bundle?.price || 0)}
                  </span>
                  {bundle?.compareAt && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(bundle.compareAt)}
                    </span>
                  )}
                </div>
                {hasFreeShipping && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase inline-block mt-0.5">
                    Free Shipping
                  </span>
                )}
              </div>

              {/* Single CTA - Express Checkout */}
              <div className="w-32 flex-shrink-0">
                <ExpressCheckout designId={designId} bundleId={bundleId} compact />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
