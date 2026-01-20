'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { useCheckoutStore } from '@/lib/store/checkout'
import { formatPrice } from '@/lib/utils'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { DiscountCodeInput } from './DiscountCodeInput'
import { TrustBadges } from './TrustBadges'

export function OrderSummary() {
  const { items, getSubtotal, isFreeShipping } = useCartStore()
  const { selectedShippingMethod, discountAmount, discountValid } = useCheckoutStore()

  const subtotal = getSubtotal()
  const qualifiesForFree = isFreeShipping()

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
    <div className="bg-gray-50 rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => {
          const bundle = BUNDLES.find((b) => b.id === item.bundleId)
          const design = PRODUCT.designs.find((d) => d.id === item.designId)

          return (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                {design?.thumbnail && (
                  <Image
                    src={design.thumbnail}
                    alt={design.name}
                    fill
                    className="object-cover"
                  />
                )}
                {item.quantity > 1 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {PRODUCT.name}
                </p>
                <p className="text-sm text-gray-500">{design?.name}</p>
                <p className="text-sm text-gray-500">{bundle?.name}</p>
              </div>
              <p className="font-medium text-gray-900 text-sm">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Discount Code */}
      <div className="border-t border-gray-200 pt-4">
        <DiscountCodeInput />
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
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
        <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges variant="compact" />
    </div>
  )
}
