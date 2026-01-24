export const PRODUCT = {
  id: 'eternal-love-card',
  name: 'The Ultimate Valentine\'s Gift',
  slug: 'i-choose-you-the-ultimate-valentines-gift',
  shortDescription: 'Premium holographic Valentine\'s card with display case',

  // Product taglines with emoji prefixes
  taglines: [
    {
      emoji: '🌟',
      title: 'Make Them Feel Truly Special.',
      description: 'Because love like this deserves more than just flowers.',
    },
    {
      emoji: '💎',
      title: 'A Forever Keepsake.',
      description: 'Crafted with premium materials and custom holographic details, they\'ll cherish this forever.',
    },
    {
      emoji: '🎁',
      title: 'Unique & Thoughtful.',
      description: 'Capture your connection and celebrate your love in a way no other gift can.',
    },
  ],

  // Design variants
  designs: [
    { id: 'design-1', name: 'Eternal Love', image: '/images/cards/cardd1.png', thumbnail: '/images/cards/cardd1.png' },
    { id: 'design-2', name: 'Forever Yours', image: '/images/cards/cardd2.png', thumbnail: '/images/cards/cardd2.png' },
    { id: 'design-3', name: 'My Heart', image: '/images/cards/cardd3.png', thumbnail: '/images/cards/cardd3.png' },
    { id: 'design-4', name: 'True Love', image: '/images/cards/cardd4.png', thumbnail: '/images/cards/cardd4.png' },
    { id: 'design-5', name: 'Soulmate', image: '/images/cards/cardd5.png', thumbnail: '/images/cards/cardd5.png' },
  ],

  // Gallery images (6 images as per spec)
  images: [
    '/images/gallery-1.svg',
    '/images/gallery-2.svg',
    '/images/gallery-3.svg',
    '/images/gallery-4.svg',
    '/images/gallery-5.svg',
    '/images/gallery-6.svg',
  ],

  // Free shipping threshold (cents)
  freeShippingThreshold: 3500, // $35.00

  // Shipping rates (cents)
  shipping: {
    standard: 595, // $5.95
    express: 995,  // $9.95
  },

  // Allowed shipping countries (force AU during test even if env is stale)
  allowedShippingCountries: Array.from(
    new Set(['US', 'AU', ...(process.env.NEXT_PUBLIC_ALLOWED_COUNTRIES?.split(',') || [])])
  ) as ('US' | 'AU' | 'CA' | 'GB')[],
}

export type Design = typeof PRODUCT.designs[number]
export type Tagline = typeof PRODUCT.taglines[number]
