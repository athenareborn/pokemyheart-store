'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { fbPixel } from '@/lib/analytics/fpixel'
import { PRODUCT } from '@/data/product'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { REVIEWS, getAverageRating, getReviewCount } from '@/data/reviews'
import { ImageGallery } from '@/components/storefront/product/ImageGallery'
import { DesignSelector } from '@/components/storefront/product/DesignSelector'
import { BundleSelector } from '@/components/storefront/product/BundleSelector'
import { AddToCart } from '@/components/storefront/product/AddToCart'
import { StickyAddToCart } from '@/components/storefront/product/StickyAddToCart'
import { ProductFAQ } from '@/components/storefront/product/ProductFAQ'
import { UrgencyBadge } from '@/components/storefront/product/UrgencyBadge'
import { ReviewsCarousel } from '@/components/storefront/product/ReviewsCarousel'
import { CheckCircle } from 'lucide-react'

const BASE_URL = 'https://pokemyheart-store.vercel.app'

// Generate JSON-LD structured data for the product
function generateProductJsonLd() {
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()
  const lowestPrice = Math.min(...BUNDLES.map(b => b.price))
  const highestPrice = Math.max(...BUNDLES.map(b => b.price))

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: PRODUCT.name,
    description: PRODUCT.shortDescription,
    image: PRODUCT.images.map(img => `${BASE_URL}${img}`),
    sku: BUNDLES[0].sku,
    brand: {
      '@type': 'Brand',
      name: 'PokeMyHeart',
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: (lowestPrice / 100).toFixed(2),
      highPrice: (highestPrice / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: PRODUCT.stockCount > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      offerCount: BUNDLES.length,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: REVIEWS.slice(0, 5).map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.body,
    })),
  }
}

export default function ProductPage() {
  const jsonLd = generateProductJsonLd()
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(0)
  const [selectedBundle, setSelectedBundle] = useState<BundleId>('love-pack')
  const [showStickyCart, setShowStickyCart] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const addToCartRef = useRef<HTMLDivElement>(null)
  const reviewsSectionRef = useRef<HTMLDivElement>(null)

  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  const selectedDesign = PRODUCT.designs[selectedDesignIndex]

  // Intersection Observer for sticky cart
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCart(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
    )

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Track ViewContent on page load
  useEffect(() => {
    const bundle = BUNDLES.find(b => b.id === selectedBundle)
    fbPixel.viewContent(
      PRODUCT.id,
      PRODUCT.name,
      (bundle?.price || BUNDLES[0].price) / 100,
      'USD'
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle design selection from DesignSelector
  const handleDesignSelect = (designId: string) => {
    const index = PRODUCT.designs.findIndex(d => d.id === designId)
    if (index !== -1) {
      setSelectedDesignIndex(index)
    }
  }

  // Scroll to all reviews section
  const scrollToAllReviews = () => {
    setShowAllReviews(true)
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ImageGallery
              images={PRODUCT.designs}
              selectedIndex={selectedDesignIndex}
              onSelectIndex={setSelectedDesignIndex}
              productName={PRODUCT.name}
            />
          </div>

          {/* Right: Product Details */}
          <div className="space-y-5">
            {/* Title & Rating */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {PRODUCT.name}
              </h1>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < Math.round(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  {averageRating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Urgency Badge */}
            <UrgencyBadge stockCount={PRODUCT.stockCount} />

            {/* Taglines - Collapsed on mobile, expanded on desktop */}
            <div className="space-y-2 sm:space-y-3">
              {PRODUCT.taglines.map((tagline, index) => (
                <p key={index} className="text-sm sm:text-base text-gray-700">
                  <span className="mr-1">{tagline.emoji}</span>
                  <span className="font-semibold">{tagline.title}</span>{' '}
                  <span className="text-gray-600 hidden sm:inline">{tagline.description}</span>
                </p>
              ))}
            </div>

            {/* Design Selector */}
            <DesignSelector
              designs={PRODUCT.designs}
              selectedId={selectedDesign.id}
              onSelect={handleDesignSelect}
            />

            {/* Bundle Selector */}
            <BundleSelector
              selectedId={selectedBundle}
              onSelect={setSelectedBundle}
            />

            {/* Add to Cart */}
            <AddToCart
              ref={addToCartRef}
              designId={selectedDesign.id}
              bundleId={selectedBundle}
            />

            {/* Mobile Reviews Carousel - right after cart */}
            <div className="sm:hidden -mx-4 mt-6">
              <ReviewsCarousel onSeeAll={scrollToAllReviews} />
            </div>
          </div>
        </div>

        {/* Product FAQ */}
        <div className="mt-12 sm:mt-16">
          <ProductFAQ />
        </div>

        {/* Reviews Section */}
        <div ref={reviewsSectionRef} className="mt-12 sm:mt-16">
          {/* Mobile: Show button to expand, Desktop: Always show */}
          <div className={showAllReviews ? 'block' : 'hidden sm:block'}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Reviews ({reviewCount})
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Verified badge */}
                  {review.verified && (
                    <div className="flex items-center gap-1 text-green-600 mb-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Verified Buyer</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Highlighted quote */}
                  {review.highlightQuote && (
                    <p className="text-sm font-medium text-gray-900 mb-2 italic border-l-2 border-brand-300 pl-2">
                      &ldquo;{review.highlightQuote}&rdquo;
                    </p>
                  )}

                  <p className="text-sm text-gray-600 mb-3">{review.body}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                      — {review.author}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Show expand button when collapsed */}
          {!showAllReviews && (
            <div className="sm:hidden">
              <button
                onClick={() => setShowAllReviews(true)}
                className="w-full py-4 text-center text-brand-500 font-medium border border-brand-200 rounded-xl hover:bg-brand-50 active:bg-brand-100 transition-colors"
              >
                Show all {reviewCount} reviews
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Add to Cart - Mobile Only */}
      <StickyAddToCart
        designId={selectedDesign.id}
        bundleId={selectedBundle}
        isVisible={showStickyCart}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </>
  )
}
