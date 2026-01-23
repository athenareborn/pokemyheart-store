import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Heart, Shield, Truck, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVIEWS, getAverageRating, getReviewCount } from '@/data/reviews'
import { PRODUCT } from '@/data/product'

export default function HomePage() {
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <span className="inline-block bg-brand-100 text-brand-600 px-4 py-2 rounded-full text-sm font-medium">
                Valentine&apos;s Day Special
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Say &quot;I Choose You&quot; This Valentine&apos;s Day
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Premium holographic cards that capture your love in a collectible that lasts forever. The perfect gift for your special someone.
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {averageRating} rating from {reviewCount} happy customers
                </span>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-2xl mx-auto">
                <Image
                  src="/images/hero2.png"
                  alt="Premium Valentine's Card"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-8 w-8 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Free Shipping $35+</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Gift className="h-8 w-8 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Gift-Ready Packaging</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="h-8 w-8 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Made with Love</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Customers Love Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy customers who have made their Valentine&apos;s Day unforgettable.
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.slice(0, 6).map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&quot;{review.body}&quot;</p>
                <p className="text-sm font-semibold text-gray-900">
                  — {review.author}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-brand-500 hover:bg-brand-600 text-white"
              asChild
            >
              <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                Get Yours Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
              <Image
                src="/images/Hero.png"
                alt="Product Showcase"
                fill
                className="object-contain rounded-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Premium Quality, Unforgettable Gift
              </h2>
              <p className="text-lg text-gray-600">
                Each card features a stunning holographic finish that shimmers and shifts in the light, creating a mesmerizing visual effect that captures the magic of your love.
              </p>
              <ul className="space-y-3">
                {[
                  'Premium holographic printing',
                  'High-quality card stock',
                  'Protective display case included',
                  'Gift-ready packaging',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white"
                asChild
              >
                <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
