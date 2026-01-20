'use client'

import { useRef, useEffect } from 'react'
import { Heart, CheckCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getHighlightedReviews,
  getAverageRating,
  getReviewCount,
} from '@/data/reviews'

interface ReviewsCarouselProps {
  onSeeAll?: () => void
  className?: string
}

export function ReviewsCarousel({ onSeeAll, className }: ReviewsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const reviews = getHighlightedReviews(6) // Video + images + best text
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  // Autoplay video when in view
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'w-4 h-4 -ml-0.5 first:ml-0',
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-base font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {reviewCount} reviews
          </span>
        </div>
      </div>

      {/* Scrollable Cards - Shows peek of next */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '16px' }}
      >
        {reviews.map((review, index) => {
          const videoUrl = 'video' in review ? (review as { video?: string }).video : undefined
          const imageUrl = 'image' in review ? (review as { image?: string }).image : undefined
          const hasMedia = !!videoUrl || !!imageUrl

          return (
            <div
              key={review.id}
              className={cn(
                'flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden',
                'border border-gray-100 shadow-sm',
                index === 0 ? 'w-[85vw] max-w-[320px]' : 'w-[75vw] max-w-[280px]'
              )}
            >
              {/* Video */}
              {videoUrl && (
                <div className="relative">
                  <video
                    ref={index === 0 ? videoRef : undefined}
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Play className="w-3 h-3 text-white fill-white" />
                    <span className="text-xs text-white font-medium">Video</span>
                  </div>
                </div>
              )}

              {/* Image */}
              {imageUrl && !videoUrl && (
                <img
                  src={imageUrl}
                  alt={`Review by ${review.author}`}
                  className="w-full h-40 object-cover"
                />
              )}

              {/* Content */}
              <div className={cn('p-4', hasMedia ? 'pt-3' : '')}>
                {/* Verified + Stars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5',
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  {review.verified && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">Verified</span>
                    </div>
                  )}
                </div>

                {/* Body text - clean quote style */}
                <p className={cn(
                  'text-gray-800 leading-relaxed',
                  hasMedia ? 'text-sm line-clamp-3' : 'text-[15px] line-clamp-4'
                )}>
                  &ldquo;{review.body}&rdquo;
                </p>

                {/* Author */}
                <p className="text-xs text-gray-400 mt-3 font-medium">
                  — {review.author}
                </p>
              </div>
            </div>
          )
        })}

        {/* See All Card */}
        <div
          onClick={onSeeAll}
          className="flex-shrink-0 snap-start w-[50vw] max-w-[180px] bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl border border-brand-200 flex flex-col items-center justify-center p-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <Heart className="w-7 h-7 text-brand-500 fill-brand-200" />
          </div>
          <p className="text-2xl font-bold text-brand-600 mb-1">
            +{reviewCount - 6}
          </p>
          <p className="text-sm text-brand-600 font-medium text-center">
            more reviews
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 mt-3">
        <button
          onClick={onSeeAll}
          className="w-full py-3 text-center text-sm font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-sm"
        >
          See all {reviewCount} reviews
        </button>
      </div>
    </div>
  )
}
