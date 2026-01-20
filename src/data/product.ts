export const PRODUCT = {
  id: 'eternal-love-card',
  name: 'I Choose You - The Ultimate Valentine\'s Gift',
  slug: 'i-choose-you-the-ultimate-valentines-gift',
  description: 'A premium holographic card that says "I Choose You" - the perfect Valentine\'s gift for your special someone.',
  shortDescription: 'Premium holographic Valentine\'s card with display case',

  // Design variants
  designs: [
    { id: 'design-1', name: 'Eternal Love', image: '/images/design-1.svg', thumbnail: '/images/design-1.svg' },
    { id: 'design-2', name: 'Forever Yours', image: '/images/design-2.svg', thumbnail: '/images/design-2.svg' },
    { id: 'design-3', name: 'My Heart', image: '/images/design-3.svg', thumbnail: '/images/design-3.svg' },
    { id: 'design-4', name: 'True Love', image: '/images/design-4.svg', thumbnail: '/images/design-4.svg' },
    { id: 'design-5', name: 'Soulmate', image: '/images/design-5.svg', thumbnail: '/images/design-5.svg' },
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

  // Stock urgency
  stockCount: 8, // "Selling Fast! 8 pieces left!"

  // Free shipping threshold (cents)
  freeShippingThreshold: 3500, // $35

  // Shipping rates (cents)
  shipping: {
    standard: 495, // $4.95
    express: 995,  // $9.95
  },
}

export type Design = typeof PRODUCT.designs[number]
