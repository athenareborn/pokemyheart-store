'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ImageGalleryProps {
  images: Array<{ id: string; image: string }>
  selectedIndex: number
  onSelectIndex: (index: number) => void
  productName: string
}

export function ImageGallery({ images, selectedIndex, onSelectIndex, productName }: ImageGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    const velocityThreshold = 500

    if (isZoomed) return

    // Swipe left (next image)
    if ((info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) && selectedIndex < images.length - 1) {
      onSelectIndex(selectedIndex + 1)
    }
    // Swipe right (previous image)
    else if ((info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) && selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1)
    }

    setDragDirection(null)
  }, [selectedIndex, images.length, onSelectIndex, isZoomed])

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -20) {
      setDragDirection('left')
    } else if (info.offset.x > 20) {
      setDragDirection('right')
    } else {
      setDragDirection(null)
    }
  }, [])

  const handleDoubleTap = useCallback(() => {
    setIsZoomed(prev => !prev)
  }, [])

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden touch-pan-y">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, x: dragDirection === 'left' ? 100 : dragDirection === 'right' ? -100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dragDirection === 'left' ? -100 : dragDirection === 'right' ? 100 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag={isZoomed ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onDoubleClick={handleDoubleTap}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <motion.div
              animate={{ scale: isZoomed ? 2 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full h-full"
            >
              <Image
                src={images[selectedIndex]?.image || '/images/placeholder.webp'}
                alt={`${productName} - Design ${selectedIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Zoom Button */}
        <button
          onClick={() => setIsZoomed(prev => !prev)}
          className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
        >
          {isZoomed ? (
            <ZoomOut className="w-5 h-5 text-gray-700" />
          ) : (
            <ZoomIn className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Swipe Hint (only show on first visit) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full sm:hidden">
            <span className="text-white text-xs font-medium">Swipe to browse</span>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-200',
                index === selectedIndex
                  ? 'bg-brand-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`View design ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelectIndex(index)}
            className={cn(
              'relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden transition-all',
              'border-2',
              index === selectedIndex
                ? 'border-brand-500 ring-2 ring-brand-200'
                : 'border-transparent hover:border-gray-300'
            )}
          >
            <Image
              src={image.image}
              alt={`Design ${index + 1} thumbnail`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
