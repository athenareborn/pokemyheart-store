import { NextResponse } from 'next/server'
import { BUNDLES } from '@/data/bundles'

// Cache for 1 hour - GMC fetches daily anyway
export const revalidate = 3600

const SITE_URL = 'https://www.ultrararelove.com'
const BRAND = 'UltraRareLove'

// Valentine's Pack bundle - the one we're advertising
const VALENTINES_PACK = BUNDLES.find(b => b.id === 'love-pack')!

// 5 products targeting different search intents (based on 2025 converting terms)
const PRODUCTS = [
  {
    id: 'PMH-ICHOOSEYOU',
    title: 'I Choose You Valentine Card - Holographic Trading Card Gift Set with Display Case',
    description: 'Say "I Choose You" this Valentine\'s Day. Premium holographic card with display case, stand, and envelope. Perfect for gamers, collectors, and fans of nostalgia. A unique keepsake they\'ll treasure forever.',
    image: 'cardd1.png',
  },
  {
    id: 'PMH-GIFTFORHIM',
    title: 'Valentine Gift for Him - Holographic Trading Card with Display Case | Boyfriend Husband',
    description: 'The perfect Valentine\'s Day gift for him. Premium holographic card with collector display case and stand. For the boyfriend or husband who loves gaming, collecting, or nostalgia. Way better than flowers.',
    image: 'cardd2.png',
  },
  {
    id: 'PMH-GIFTFORHER',
    title: 'Valentine Gift for Her - Holographic Trading Card with Display Case | Girlfriend Wife',
    description: 'A Valentine\'s gift as unique as she is. Premium holographic card with elegant display case and stand. For the girlfriend or wife who appreciates thoughtful, one-of-a-kind gifts. She\'ll cherish it forever.',
    image: 'cardd3.png',
  },
  {
    id: 'PMH-UNIQUEGIFT',
    title: 'Unique Valentine Gift - Custom Holographic Card with Display Case | Not Flowers',
    description: 'Tired of boring Valentine\'s gifts? This premium holographic card comes with a collector display case and stand. A unique, thoughtful keepsake that shows you put real thought into it.',
    image: 'cardd4.png',
  },
  {
    id: 'PMH-COUPLEGIFT',
    title: 'Couples Valentine Card - Romantic Holographic Trading Card Gift with Display Case',
    description: 'Celebrate your love with a premium holographic card and display case. Perfect for couples, anniversaries, or saying "I love you." A romantic keepsake you\'ll both treasure.',
    image: 'cardd5.png',
  },
]

export async function GET() {
  // TSV header row - Google Merchant Center format
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'availability',
    'price',
    'sale_price',
    'brand',
    'mpn',
    'condition',
    'product_type',
    'google_product_category',
    'shipping_label',
    'identifier_exists',
    'adult',
  ].join('\t')

  // Price in USD format
  const price = `${(VALENTINES_PACK.compareAt / 100).toFixed(2)} USD`
  const salePrice = `${(VALENTINES_PACK.price / 100).toFixed(2)} USD`
  const link = `${SITE_URL}/products/i-choose-you-the-ultimate-valentines-gift`

  const rows = PRODUCTS.map((product) => {
    return [
      product.id,
      product.title,
      product.description,
      link,
      `${SITE_URL}/images/cards/${product.image}`,
      'in_stock',
      price,
      salePrice,
      BRAND,
      product.id,
      'new',
      'Arts & Entertainment > Hobbies & Creative Arts > Collectibles > Trading Cards',
      '216',
      'free-ship',  // $37.95 > $35 threshold = free shipping
      'false',
      'false',
    ].join('\t')
  })

  const tsvContent = [headers, ...rows].join('\n')

  return new NextResponse(tsvContent, {
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Content-Disposition': 'inline; filename="gmc-products.tsv"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
