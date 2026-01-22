'use client'

import { memo } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useCartStore, type CartItem } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { formatPrice } from '@/lib/utils'

interface OrderItemProps {
  item: CartItem
}

const OrderItem = memo(function OrderItem({ item }: OrderItemProps) {
  const bundle = BUNDLES.find(b => b.id === item.bundleId)
  const design = PRODUCT.designs.find(d => d.id === item.designId)

  return (
    <div className="flex gap-3 py-3">
      {/* Product Image */}
      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {design?.thumbnail && (
          <Image
            src={design.thumbnail}
            alt={design.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        )}
        {/* Quantity badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {item.quantity}
        </div>
      </div>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {bundle?.name || 'Valentine\'s Pack'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {design?.name || 'Design'}
        </p>
      </div>

      {/* Price */}
      <div className="text-sm font-medium text-gray-900">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  )
})

interface CheckoutOrderSummaryProps {
  shippingMethod: 'standard' | 'express'
  className?: string
}

export const CheckoutOrderSummary = memo(function CheckoutOrderSummary({
  shippingMethod,
  className = '',
}: CheckoutOrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { items, getSubtotal, isFreeShipping } = useCartStore()

  const subtotal = getSubtotal()
  const qualifiesForFreeShipping = isFreeShipping()

  // Calculate shipping based on method
  const shippingCost = (() => {
    if (shippingMethod === 'express') {
      return qualifiesForFreeShipping ? PRODUCT.shipping.standard : PRODUCT.shipping.express
    }
    return qualifiesForFreeShipping ? 0 : PRODUCT.shipping.standard
  })()

  const total = subtotal + shippingCost

  return (
    <div className={`bg-gray-50 rounded-xl p-4 lg:p-6 ${className}`}>
      {/* Mobile: Collapsible header */}
      <button
        className="flex items-center justify-between w-full lg:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-gray-900">Order Summary</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(total)}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Desktop: Static header */}
      <h2 className="hidden lg:block font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Items list */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>

          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
})
