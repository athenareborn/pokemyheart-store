import Link from 'next/link'
import { ArrowRight, Heart, Sparkles, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About Us | PokeMyHeart',
  description: 'Discover the story behind PokeMyHeart - premium holographic Valentine\'s cards for gamers and anime fans.',
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-pink-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-block bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm font-medium">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Where Passion Meets <span className="text-pink-500">Heartfelt Gifts</span>
            </h1>
            <p className="text-lg text-gray-600">
              We create premium collectible cards that help you express your love in a language that speaks to gamers, anime fans, and collectors alike.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            {/* Story Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Born from a Love of Games and Genuine Connection
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  PokeMyHeart started with a simple idea: why should expressing love feel generic when the people we love are anything but? As lifelong gamers and anime enthusiasts, we noticed a gap in the market for meaningful, high-quality gifts that resonate with our community.
                </p>
                <p>
                  Traditional Valentine&apos;s cards felt impersonal. We wanted something that captured the excitement of pulling a rare card, the nostalgia of our favorite characters, and the genuine emotion of telling someone they&apos;re special.
                </p>
                <p>
                  That&apos;s how our premium holographic cards were born. Each one is designed to be a keepsake, a collectible that your partner will treasure long after Valentine&apos;s Day has passed.
                </p>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-8 sm:p-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <Heart className="h-10 w-10 text-pink-500 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">10K+</p>
                    <p className="text-sm text-gray-600">Happy Couples</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <Sparkles className="h-10 w-10 text-pink-500 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Holographic Quality</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <Users className="h-10 w-10 text-pink-500 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">4.9</p>
                    <p className="text-sm text-gray-600">Star Rating</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <Palette className="h-10 w-10 text-pink-500 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">Unique</p>
                    <p className="text-sm text-gray-600">Original Designs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every decision we make is guided by our commitment to quality, creativity, and making your special moments unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Value 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                We use only the finest materials and printing techniques. Our holographic finish is vibrant, durable, and truly eye-catching.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Made with Love</h3>
              <p className="text-gray-600">
                Every card is designed by fans, for fans. We pour our passion into every detail, from concept to packaging.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600">
                We listen to our community. Your feedback shapes our designs, and your stories inspire us to keep creating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make Their Heart Skip a Beat?
            </h2>
            <p className="text-pink-100 text-lg max-w-2xl mx-auto mb-8">
              Browse our collection of premium holographic cards and find the perfect way to say &quot;I choose you&quot; this Valentine&apos;s Day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 text-lg px-8 py-6"
                asChild
              >
                <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                  Shop Our Collection
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
