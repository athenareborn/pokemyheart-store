'use client'

import { Check } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { BUNDLES, type BundleId, calculateSavings } from '@/data/bundles'
import { Badge } from '@/components/ui/badge'

interface BundleSelectorProps {
  selectedId: BundleId
  onSelect: (id: BundleId) => void
}

export function BundleSelector({ selectedId, onSelect }: BundleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Choose your bundle
      </label>
      <div className="space-y-3">
        {BUNDLES.map((bundle) => {
          const isSelected = selectedId === bundle.id
          const savings = calculateSavings(bundle)

          return (
            <button
              key={bundle.id}
              onClick={() => onSelect(bundle.id)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all relative',
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300 bg-white'
              )}
            >
              {/* Badge */}
              {bundle.badge && (
                <Badge
                  className={cn(
                    'absolute -top-2 right-4',
                    bundle.badge === 'Most Popular'
                      ? 'bg-pink-500'
                      : 'bg-green-500'
                  )}
                >
                  {bundle.badge}
                </Badge>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{bundle.description}</p>
                    <ul className="mt-2 space-y-1">
                      {bundle.includes.map((item, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(bundle.price)}
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(bundle.compareAt)}
                  </div>
                  {savings > 0 && (
                    <div className="text-sm font-medium text-green-600">
                      Save {formatPrice(savings)}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
