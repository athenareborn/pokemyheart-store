'use client'

import Image from 'next/image'

interface ImageGalleryProps {
  selectedDesignImage: string
  productName: string
}

export function ImageGallery({ selectedDesignImage, productName }: ImageGalleryProps) {
  return (
    <div className="space-y-4">
      {/* Main Image - Shows selected design */}
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        <Image
          src={selectedDesignImage || '/images/placeholder.webp'}
          alt={productName}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
