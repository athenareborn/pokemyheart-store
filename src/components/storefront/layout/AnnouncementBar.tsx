'use client'

import Link from 'next/link'

export function AnnouncementBar() {
  return (
    <div className="bg-black relative overflow-hidden">
      <div className="h-11 flex items-center">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap pr-8">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="text-pink-400">💖</span>
              <span className="text-white text-sm font-medium uppercase tracking-wider">
                Order now for free shipping on $35+ today only
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Button */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pl-16 bg-gradient-to-l from-black from-70% to-transparent">
        <Link
          href="/products/i-choose-you-the-ultimate-valentines-gift"
          className="bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
        >
          Shop now!
        </Link>
      </div>
    </div>
  )
}
