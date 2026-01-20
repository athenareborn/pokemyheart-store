'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Design } from '@/data/product'

interface DesignSelectorProps {
  designs: Design[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DesignSelector({ designs, selectedId, onSelect }: DesignSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Select your Design!
      </h3>
      <div className="flex flex-wrap gap-3">
        {designs.map((design) => (
          <button
            key={design.id}
            onClick={() => onSelect(design.id)}
            className={cn(
              'relative rounded-lg overflow-hidden transition-all border-2',
              selectedId === design.id
                ? 'border-gray-800'
                : 'border-transparent hover:border-gray-300'
            )}
          >
            <div className="relative w-20 h-28 sm:w-24 sm:h-32">
              <Image
                src={design.thumbnail || '/images/placeholder.webp'}
                alt={design.name}
                fill
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
