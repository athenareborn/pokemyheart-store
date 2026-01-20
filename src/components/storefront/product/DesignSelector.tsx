'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { Design } from '@/data/product'

interface DesignSelectorProps {
  designs: Design[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DesignSelector({ designs, selectedId, onSelect }: DesignSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Choose Your Design
        </h3>
        <span className="text-sm text-gray-500">
          {designs.findIndex(d => d.id === selectedId) + 1} of {designs.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {designs.map((design, index) => {
          const isSelected = selectedId === design.id

          return (
            <button
              key={design.id}
              onClick={() => onSelect(design.id)}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all',
                'w-[calc(20%-6px)] sm:w-[calc(20%-10px)] aspect-[3/4]',
                'border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-brand-500 shadow-lg shadow-brand-200/50'
                  : 'border-gray-200 hover:border-brand-300'
              )}
              aria-label={`Select design ${index + 1}`}
              aria-pressed={isSelected}
            >
              <Image
                src={design.thumbnail || '/images/placeholder.webp'}
                alt={`Design ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 60px, 80px"
              />

              {/* Selection indicator overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-brand-500/10 flex items-end justify-end p-1">
                  <div className="bg-brand-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
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
