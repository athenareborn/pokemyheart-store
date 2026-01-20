'use client'

import { Truck, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { PRODUCT } from '@/data/product'

interface FreeShippingBarProps {
  amountToFreeShipping: number
  isFreeShipping: boolean
}

export function FreeShippingBar({ amountToFreeShipping, isFreeShipping }: FreeShippingBarProps) {
  const threshold = PRODUCT.freeShippingThreshold
  const progress = isFreeShipping ? 100 : Math.min(100, ((threshold - amountToFreeShipping) / threshold) * 100)

  return (
    <div className="space-y-2">
      {isFreeShipping ? (
        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
          <Check className="h-5 w-5" />
          <span>You&apos;ve unlocked FREE shipping!</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Truck className="h-5 w-5" />
          <span>
            <span className="font-semibold text-pink-500">{formatPrice(amountToFreeShipping)}</span>
            {' '}away from free shipping!
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out rounded-full ${
            isFreeShipping ? 'bg-green-500' : 'bg-pink-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
