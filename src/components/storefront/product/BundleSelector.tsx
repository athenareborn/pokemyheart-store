'use client'

import Image from 'next/image'
import { cn, formatPrice } from '@/lib/utils'
import { BUNDLES, type BundleId } from '@/data/bundles'

interface BundleSelectorProps {
  selectedId: BundleId
  onSelect: (id: BundleId) => void
}

export function BundleSelector({ selectedId, onSelect }: BundleSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-brand-200" />
        <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
          Bundle & Save
        </h3>
        <div className="flex-1 h-px bg-brand-200" />
      </div>

      {/* Bundle options */}
      <div className="space-y-2.5">
        {BUNDLES.map((bundle) => {
          const isSelected = selectedId === bundle.id
          const hasFreeShipping = bundle.id !== 'card-only'
          const isLovePack = bundle.id === 'love-pack'

          // Calculate savings
          const savings = bundle.compareAt - bundle.price
          const savingsPercent = savings > 0 ? Math.round((savings / bundle.compareAt) * 100) : 0

          return (
            <div key={bundle.id} className="relative">
              {/* Most Popular badge - only on Love Pack */}
              {isLovePack && (
                <div className="absolute -right-2 -top-3 z-10">
                  <Image
                    src="/images/most-popular-badge.png"
                    alt="Most Popular"
                    width={75}
                    height={60}
                    className="drop-shadow-md"
                  />
                </div>
              )}

              <button
                onClick={() => onSelect(bundle.id)}
                className={cn(
                  'w-full px-4 py-3.5 rounded-lg text-left transition-all duration-200',
                  isSelected
                    ? 'bg-white ring-2 ring-brand-400 shadow-sm'
                    : 'bg-brand-50/60 hover:bg-brand-50'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Radio */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected ? 'border-brand-400' : 'border-gray-300'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                        {hasFreeShipping && (
                          <span className="text-[10px] font-bold text-brand-500 bg-brand-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Free Shipping
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{bundle.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(bundle.price)}
                    </div>
                    {savingsPercent > 0 && (
                      <div className="text-xs text-emerald-600 font-medium">
                        Save {savingsPercent}%
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
