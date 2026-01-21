'use client'

import Link from 'next/link'

const ANNOUNCEMENTS = [
  'ORDER NOW FOR FREE SHIPPING ON $35+ TODAY ONLY',
  "VALENTINE'S DAY SPECIAL - LIMITED STOCK REMAINING",
  'PREMIUM HOLOGRAPHIC CARDS - HANDCRAFTED WITH LOVE',
]

export function AnnouncementBar() {
  // Create the scrolling text with heart separators
  const scrollText = ANNOUNCEMENTS.map(text => `💖 ${text}`).join('    ')
  // Duplicate for seamless loop
  const fullText = `${scrollText}    ${scrollText}    ${scrollText}    `

  return (
    <div className="bg-gray-900 text-white py-2.5 relative overflow-hidden">
      {/* Scrolling marquee */}
      <div className="flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-sm font-semibold tracking-wide">
            {fullText}
          </span>
        </div>
      </div>

      {/* Shop now button - fixed on right */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pl-8 bg-gradient-to-l from-gray-900 via-gray-900 to-transparent">
        <Link
          href="/products/i-choose-you-the-ultimate-valentines-gift"
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors shadow-lg"
        >
          Shop now!
        </Link>
      </div>
    </div>
  )
}
