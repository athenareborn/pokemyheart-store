'use client'

import { memo, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Tag, X, Loader2 } from 'lucide-react'
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

  // Calculate savings if bundle has compareAt price
  const hasDiscount = bundle && bundle.compareAt && bundle.compareAt > bundle.price
  const savingsPercent = hasDiscount
    ? Math.round(((bundle.compareAt - bundle.price) / bundle.compareAt) * 100)
    : 0

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
        {hasDiscount && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(bundle.compareAt * item.quantity)}
            </span>
            <span className="text-xs font-medium text-green-600">
              Save {savingsPercent}%
            </span>
          </div>
        )}
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
  discountCode: string | null
  discountAmount: number
  insuranceAmount: number
  onApplyDiscount: (code: string) => Promise<{ valid: boolean; message: string; amount?: number }>
  onRemoveDiscount: () => void
}

export const CheckoutOrderSummary = memo(function CheckoutOrderSummary({
  shippingMethod,
  className = '',
  discountCode,
  discountAmount,
  insuranceAmount,
  onApplyDiscount,
  onRemoveDiscount,
}: CheckoutOrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false) // Start collapsed on mobile
  const [codeInput, setCodeInput] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

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

  const total = subtotal + shippingCost + insuranceAmount - discountAmount

  const handleApplyDiscount = useCallback(async () => {
    if (!codeInput.trim()) return

    setIsApplying(true)
    setDiscountError(null)

    try {
      const result = await onApplyDiscount(codeInput.trim())
      if (!result.valid) {
        setDiscountError(result.message)
      } else {
        setCodeInput('')
      }
    } catch {
      setDiscountError('Failed to apply discount code')
    } finally {
      setIsApplying(false)
    }
  }, [codeInput, onApplyDiscount])

  const handleRemoveDiscount = useCallback(() => {
    onRemoveDiscount()
    setDiscountError(null)
  }, [onRemoveDiscount])

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

        {/* Discount Code */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {discountCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{discountCode}</span>
              </div>
              <button
                onClick={handleRemoveDiscount}
                className="p-1 hover:bg-green-100 rounded transition-colors"
                aria-label="Remove discount"
              >
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value)
                    setDiscountError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplying || !codeInput.trim()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isApplying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
              {discountError && (
                <p className="text-sm text-red-600">{discountError}</p>
              )}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-600">-{formatPrice(discountAmount)}</span>
            </div>
          )}

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

          {insuranceAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Insurance</span>
              <span className="font-medium">{formatPrice(insuranceAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
})
