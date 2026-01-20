'use client'

import { cn, formatPrice } from '@/lib/utils'
import { BUNDLES, type BundleId } from '@/data/bundles'

interface BundleSelectorProps {
  selectedId: BundleId
  onSelect: (id: BundleId) => void
}

export function BundleSelector({ selectedId, onSelect }: BundleSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header with decorative lines */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-pink-400" />
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide">
          BUNDLE & SAVE
        </h3>
        <div className="flex-1 h-px bg-pink-400" />
      </div>

      {/* Bundle options */}
      <div className="space-y-3">
        {BUNDLES.map((bundle) => {
          const isSelected = selectedId === bundle.id

          return (
            <button
              key={bundle.id}
              onClick={() => onSelect(bundle.id)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all relative',
                'bg-pink-50',
                isSelected
                  ? 'border-pink-500'
                  : 'border-pink-200 hover:border-pink-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'border-pink-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-600">{bundle.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-xl font-bold text-gray-900 flex-shrink-0">
                  {formatPrice(bundle.price)}
                </div>
              </div>

              {/* Most Popular badge */}
              {bundle.badge === 'Most Popular' && (
                <div className="absolute -bottom-4 right-4">
                  <div className="bg-pink-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-md text-center leading-tight">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-yellow-300">+</span>
                      <span>Most</span>
                      <span className="text-yellow-300">+</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-yellow-300">+</span>
                      <span>Popular</span>
                      <span className="text-yellow-300">+</span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
