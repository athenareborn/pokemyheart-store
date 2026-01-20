'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Heart, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getHighlightedReviews,
  getAverageRating,
  getReviewCount,
  type Review,
} from '@/data/reviews'

interface ReviewsCarouselProps {
  onSeeAll?: () => void
  className?: string
}

export function ReviewsCarousel({ onSeeAll, className }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const reviews = getHighlightedReviews(5) // Show only 5 best reviews
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  const goToNext = useCallback(() => {
    if (currentIndex < reviews.length - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, reviews.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50
      const velocityThreshold = 300

      if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
        goToNext()
      } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
        goToPrev()
      }
    },
    [goToNext, goToPrev]
  )

  const currentReview = reviews[currentIndex]
  const videoUrl = 'video' in currentReview ? (currentReview as { video?: string }).video : undefined
  const imageUrl = 'image' in currentReview ? (currentReview as { image?: string }).image : undefined

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Based on {reviewCount} reviews
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 active:text-brand-800"
        >
          See all
        </button>
      </div>

      {/* Main Review Card - Full Width */}
      <div className="px-4">
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Video/Image */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing"
            >
              {videoUrl && (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-48 object-cover"
                />
              )}
              {imageUrl && !videoUrl && (
                <img
                  src={imageUrl}
                  alt={`Review by ${currentReview.author}`}
                  className="w-full h-48 object-cover"
                />
              )}

              {/* Review Content */}
              <div className="p-5">
                {/* Verified + Rating row */}
                <div className="flex items-center justify-between mb-3">
                  {currentReview.verified && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-semibold">Verified Purchase</span>
                    </div>
                  )}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5',
                          i < currentReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                {currentReview.highlightQuote && (
                  <p className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                    &ldquo;{currentReview.highlightQuote}&rdquo;
                  </p>
                )}

                {/* Full text */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {currentReview.body}
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {currentReview.author}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(currentReview.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {currentIndex < reviews.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom: Dots + See All CTA */}
      <div className="mt-4 px-4">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'w-6 bg-brand-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* See all reviews button */}
        <button
          onClick={onSeeAll}
          className="w-full py-3 text-center text-sm font-semibold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 active:bg-brand-200 transition-colors"
        >
          See all {reviewCount} reviews
        </button>
      </div>
    </div>
  )
}
