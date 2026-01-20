'use client'

import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { useCartStore, type CartItem as CartItemType } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const bundle = BUNDLES.find(b => b.id === item.bundleId)
  const design = PRODUCT.designs.find(d => d.id === item.designId)

  if (!bundle || !design) return null

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={design.thumbnail || '/images/placeholder.webp'}
          alt={`${PRODUCT.name} - ${design.name}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">{PRODUCT.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Design: {design.name} | {bundle.name}
        </p>
        <p className="font-semibold text-gray-900 mt-1">{formatPrice(item.price)}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500"
        onClick={() => removeItem(item.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
