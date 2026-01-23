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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-brand-300" />
        <h3 className="text-xs font-bold text-brand-600 tracking-widest uppercase">
          Bundle & Save
        </h3>
        <div className="flex-1 h-px bg-brand-300" />
      </div>

      {/* Bundle options */}
      <div className="space-y-2.5">
        {BUNDLES.map((bundle) => {
          const isSelected = selectedId === bundle.id
          const hasFreeShipping = bundle.id !== 'card-only'
          const isValentinesPack = bundle.id === 'love-pack'

          // Calculate savings
          const savings = bundle.compareAt - bundle.price
          const savingsPercent = savings > 0 ? Math.round((savings / bundle.compareAt) * 100) : 0
          const showSavings = savingsPercent > 0 && bundle.id !== 'card-only'

          return (
            <div key={bundle.id} className="relative">
              {/* Most Popular badge */}
              {isValentinesPack && (
                <Image
                  src="/images/most-popular-badge.png"
                  alt="Most Popular"
                  width={110}
                  height={88}
                  className="absolute -top-8 -right-3 z-10 drop-shadow-md sm:-top-6 sm:w-[100px] sm:h-auto"
                />
              )}
              <button
                onClick={() => onSelect(bundle.id)}
                className={cn(
                  'w-full px-4 py-3.5 rounded-xl text-left transition-all',
                  isSelected
                    ? 'bg-white ring-2 ring-brand-500 shadow-md'
                    : 'bg-brand-50/70 hover:bg-brand-50 border border-brand-100'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Radio */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{bundle.name}</span>
                      {hasFreeShipping && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                          Free Shipping
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{bundle.description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    {showSavings && (
                      <span className="text-[10px] text-gray-400 line-through block">{formatPrice(bundle.compareAt)}</span>
                    )}
                    <span className="text-lg font-bold text-gray-900">{formatPrice(bundle.price)}</span>
                    {showSavings && (
                      <div className="text-xs font-semibold text-emerald-600">
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
