'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { useCheckoutStore } from '@/lib/store/checkout'
import { formatPrice } from '@/lib/utils'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { DiscountCodeInput } from './DiscountCodeInput'

export function OrderSummaryMobile() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { items, getSubtotal, getItemCount, isFreeShipping } = useCartStore()
  const { selectedShippingMethod, discountAmount, discountValid } = useCheckoutStore()

  const subtotal = getSubtotal()
  const qualifiesForFree = isFreeShipping()
  const itemCount = getItemCount()

  // Calculate shipping cost
  let shippingCost = 0
  if (selectedShippingMethod === 'express') {
    shippingCost = qualifiesForFree
      ? PRODUCT.shipping.standard
      : PRODUCT.shipping.express
  } else {
    shippingCost = qualifiesForFree ? 0 : PRODUCT.shipping.standard
  }

  const total = subtotal + shippingCost - (discountValid ? discountAmount : 0)

  return (
    <div className="lg:hidden bg-gray-50 border-b border-gray-200">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-brand-500">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </span>
          <span className="text-sm text-brand-500">
            {isExpanded ? 'Hide' : 'Show'} order summary
          </span>
          <span className="text-sm text-gray-500">({itemCount} items)</span>
        </div>
        <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item) => {
                  const bundle = BUNDLES.find((b) => b.id === item.bundleId)
                  const design = PRODUCT.designs.find((d) => d.id === item.designId)

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {design?.thumbnail && (
                          <Image
                            src={design.thumbnail}
                            alt={design.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-500 text-white text-[10px] rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {bundle?.name}
                        </p>
                        <p className="text-xs text-gray-500">{design?.name}</p>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Discount Code */}
              <DiscountCodeInput />

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {discountValid && discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
