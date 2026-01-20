'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { PRODUCT } from '@/data/product'
import { type BundleId } from '@/data/bundles'
import { REVIEWS, getAverageRating, getReviewCount } from '@/data/reviews'
import { ImageGallery } from '@/components/storefront/product/ImageGallery'
import { DesignSelector } from '@/components/storefront/product/DesignSelector'
import { BundleSelector } from '@/components/storefront/product/BundleSelector'
import { AddToCart } from '@/components/storefront/product/AddToCart'
import { ProductFAQ } from '@/components/storefront/product/ProductFAQ'

export default function ProductPage() {
  const [selectedDesign, setSelectedDesign] = useState(PRODUCT.designs[0].id)
  const [selectedBundle, setSelectedBundle] = useState<BundleId>('card-only')

  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  // Get the selected design object to display its image
  const selectedDesignData = PRODUCT.designs.find(d => d.id === selectedDesign)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
        {/* Left: Image Gallery - Shows selected design */}
        <div>
          <ImageGallery
            selectedDesignImage={selectedDesignData?.image || PRODUCT.designs[0].image}
            productName={PRODUCT.name}
          />
        </div>

        {/* Right: Product Details */}
        <div className="space-y-6">
          {/* Title & Rating */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {PRODUCT.name}
            </h1>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                {averageRating} ({reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Taglines */}
          <div className="space-y-3">
            {PRODUCT.taglines.map((tagline, index) => (
              <p key={index} className="text-gray-700">
                <span className="mr-1">{tagline.emoji}</span>
                <span className="font-semibold">{tagline.title}</span>{' '}
                <span className="text-gray-600">{tagline.description}</span>
              </p>
            ))}
          </div>

          {/* Design Selector */}
          <DesignSelector
            designs={PRODUCT.designs}
            selectedId={selectedDesign}
            onSelect={setSelectedDesign}
          />

          {/* Bundle Selector */}
          <BundleSelector
            selectedId={selectedBundle}
            onSelect={setSelectedBundle}
          />

          {/* Add to Cart */}
          <AddToCart designId={selectedDesign} bundleId={selectedBundle} />
        </div>
      </div>

      {/* Product FAQ */}
      <div className="mt-16">
        <ProductFAQ />
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Customer Reviews ({reviewCount})
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.slice(0, 6).map((review) => (
            <div
              key={review.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
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
              <p className="text-sm text-gray-600 mb-2">{review.body}</p>
              <p className="text-xs text-gray-500 font-medium">
                — {review.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
