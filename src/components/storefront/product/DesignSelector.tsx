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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Choose your design
      </label>
      <div className="flex flex-wrap gap-3">
        {designs.map((design) => (
          <button
            key={design.id}
            onClick={() => onSelect(design.id)}
            className={cn(
              'relative group rounded-lg overflow-hidden transition-all',
              selectedId === design.id
                ? 'ring-2 ring-pink-500 ring-offset-2'
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
            )}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image
                src={design.thumbnail || '/images/placeholder.webp'}
                alt={design.name}
                fill
                className="object-cover"
              />
            </div>
            {selectedId === design.id && (
              <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Selected: <span className="font-medium text-gray-900">{designs.find(d => d.id === selectedId)?.name}</span>
      </p>
    </div>
  )
}
