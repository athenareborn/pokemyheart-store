'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Heart, CheckCircle, ChevronRight } from 'lucide-react'
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

const CARD_WIDTH = 260
const CARD_GAP = 12

export function ReviewsCarousel({ onSeeAll, className }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const reviews = getHighlightedReviews(8)
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50
      const velocityThreshold = 500

      if (
        (info.offset.x < -swipeThreshold ||
          info.velocity.x < -velocityThreshold) &&
        currentIndex < reviews.length - 1
      ) {
        setCurrentIndex((prev) => Math.min(prev + 1, reviews.length - 1))
      } else if (
        (info.offset.x > swipeThreshold ||
          info.velocity.x > velocityThreshold) &&
        currentIndex > 0
      ) {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
      }
    },
    [currentIndex, reviews.length]
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with summary stats */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        </div>

        <button
          onClick={onSeeAll}
          className="text-sm font-medium text-brand-500 flex items-center gap-0.5 hover:text-brand-600 active:text-brand-700"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-3 px-4 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{
            left: -(reviews.length - 1) * (CARD_WIDTH + CARD_GAP),
            right: 0,
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={{ x: -currentIndex * (CARD_WIDTH + CARD_GAP) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              isActive={index === currentIndex}
            />
          ))}

          {/* "See All" final card */}
          <div
            className="flex-shrink-0 bg-brand-50 rounded-xl p-4 flex flex-col items-center justify-center border border-brand-100"
            style={{ width: CARD_WIDTH }}
          >
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 text-brand-500 fill-brand-200" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {reviewCount - 8}+ more reviews
            </p>
            <button
              onClick={onSeeAll}
              className="text-sm text-brand-500 font-medium hover:text-brand-600"
            >
              View all reviews
            </button>
          </div>
        </motion.div>

        {/* Visual overflow hint - gradient fade on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 pt-1">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-200',
              index === currentIndex
                ? 'w-4 bg-brand-500'
                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Individual Review Card Component
function ReviewCard({
  review,
  isActive,
}: {
  review: Review
  isActive: boolean
}) {
  const videoUrl = 'video' in review ? (review as { video?: string }).video : undefined
  const imageUrl = 'image' in review ? (review as { image?: string }).image : undefined
  const hasMedia = !!videoUrl || !!imageUrl

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-xl border transition-all duration-200 overflow-hidden',
        isActive
          ? 'bg-white border-brand-200 shadow-sm'
          : 'bg-gray-50 border-gray-100'
      )}
      style={{ width: CARD_WIDTH }}
    >
      {/* Video/Image media */}
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-32 object-cover"
        />
      )}
      {imageUrl && !videoUrl && (
        <img
          src={imageUrl}
          alt={`Review by ${review.author}`}
          className="w-full h-32 object-cover"
        />
      )}

      <div className={cn('p-4', hasMedia && 'pt-3')}>
        {/* Verified badge */}
        {review.verified && (
          <div className="flex items-center gap-1 text-green-600 mb-2">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Verified Buyer</span>
          </div>
        )}

        {/* Rating hearts */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'w-3.5 h-3.5',
                i < review.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>

        {/* Highlighted quote */}
        {review.highlightQuote && (
          <p className="text-sm font-medium text-gray-900 mb-2 italic border-l-2 border-brand-300 pl-2">
            &ldquo;{review.highlightQuote}&rdquo;
          </p>
        )}

        {/* Full review text (truncated) */}
        <p className={cn('text-sm text-gray-600 mb-3', hasMedia ? 'line-clamp-2' : 'line-clamp-3')}>
          {review.body}
        </p>

        {/* Author and date */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">— {review.author}</p>
          <p className="text-xs text-gray-400">
            {new Date(review.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
