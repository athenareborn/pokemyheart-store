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
      <div className="space-y-2">
        {BUNDLES.map((bundle) => {
          const isSelected = selectedId === bundle.id
          const hasFreeShipping = bundle.id !== 'card-only'
          const isValentinesPack = bundle.id === 'love-pack'

          // Calculate savings
          const savings = bundle.compareAt - bundle.price
          const savingsPercent = savings > 0 ? Math.round((savings / bundle.compareAt) * 100) : 0
          const showSavings = savingsPercent > 0 && bundle.id !== 'card-only'

          return (
            <div key={bundle.id} className="relative overflow-visible">
              {/* Most Popular badge - on Valentine's Pack row */}
              {isValentinesPack && (
                <Image
                  src="/images/most-popular-badge.png"
                  alt="Most Popular"
                  width={85}
                  height={68}
                  className="absolute -top-5 -right-3 z-10 drop-shadow-md"
                />
              )}
              <button
                onClick={() => onSelect(bundle.id)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-left transition-all duration-150',
                  isSelected
                    ? 'bg-white ring-2 ring-brand-500 shadow-md'
                    : 'bg-brand-50 hover:bg-brand-100/80 border border-brand-100'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Radio */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300 bg-white'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{bundle.name}</h4>
                        {hasFreeShipping && (
                          <span className="text-[9px] font-bold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Free Shipping
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{bundle.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    {showSavings && (
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(bundle.compareAt)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-extrabold text-gray-900">
                        {formatPrice(bundle.price)}
                      </span>
                      {showSavings && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          -{savingsPercent}%
                        </span>
                      )}
                    </div>
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
