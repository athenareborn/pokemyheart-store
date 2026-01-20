'use client'

import { Truck, Zap, Check } from 'lucide-react'
import { useCheckoutStore, type ShippingMethod } from '@/lib/store/checkout'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { PRODUCT } from '@/data/product'
import { cn } from '@/lib/utils'

interface ShippingOption {
  id: ShippingMethod
  name: string
  description: string
  price: number
  freePrice?: number
  estimatedDays: string
  icon: typeof Truck
}

export function ShippingMethodSelector() {
  const { selectedShippingMethod, setShippingMethod } = useCheckoutStore()
  const { isFreeShipping } = useCartStore()
  const qualifiesForFree = isFreeShipping()

  const options: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Reliable delivery',
      price: PRODUCT.shipping.standard,
      freePrice: 0,
      estimatedDays: '5-7 business days',
      icon: Truck,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Fast delivery',
      price: PRODUCT.shipping.express,
      freePrice: PRODUCT.shipping.standard,
      estimatedDays: '1-3 business days',
      icon: Zap,
    },
  ]

  // Calculate estimated delivery date
  const getDeliveryDate = (days: string) => {
    const [min, max] = days.split('-').map((d) => parseInt(d))
    const today = new Date()
    const minDate = new Date(today)
    const maxDate = new Date(today)
    minDate.setDate(today.getDate() + min)
    maxDate.setDate(today.getDate() + max)

    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Shipping Method</h2>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedShippingMethod === option.id
          const displayPrice = qualifiesForFree
            ? option.freePrice !== undefined
              ? option.freePrice
              : option.price
            : option.price
          const isFree = displayPrice === 0

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setShippingMethod(option.id)}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left',
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-5 h-5 mt-0.5 rounded-full border-2 transition-all',
                  isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <option.icon
                    className={cn(
                      'w-4 h-4',
                      isSelected ? 'text-pink-600' : 'text-gray-500'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-pink-900' : 'text-gray-900'
                    )}
                  >
                    {option.name}
                  </span>
                  {isFree && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {option.estimatedDays}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Arrives {getDeliveryDate(option.estimatedDays.split(' ')[0])}
                </p>
              </div>

              <div className="text-right">
                {isFree ? (
                  <span className="font-semibold text-green-600">Free</span>
                ) : (
                  <span className="font-semibold text-gray-900">
                    {formatPrice(displayPrice)}
                  </span>
                )}
                {qualifiesForFree && option.price !== displayPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(option.price)}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
