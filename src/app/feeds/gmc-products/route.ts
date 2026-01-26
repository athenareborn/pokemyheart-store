import { NextResponse } from 'next/server'
import { BUNDLES } from '@/data/bundles'

// Cache for 1 hour - GMC fetches daily anyway
export const revalidate = 3600

const SITE_URL = 'https://www.ultrararelove.com'
const BRAND = 'UltraRareLove'

// Valentine's Pack bundle - the one we're advertising
const VALENTINES_PACK = BUNDLES.find(b => b.id === 'love-pack')!

// Single optimized title - "I Choose You" + "Valentine's Gift" = top converting combo
const TITLE = '"I Choose You" Valentine\'s Gift - Holographic Trading Card with Display Case'
const DESCRIPTION = 'Say "I Choose You" this Valentine\'s Day. Premium holographic trading card with display case, stand, and envelope. Perfect for gamers, collectors, and fans of nostalgia. A unique keepsake they\'ll treasure forever.'

// 5 products with same title, different images (GMC allows this)
const PRODUCTS = [
  { id: 'PMH-ICHOOSEYOU-1', image: 'cardd1.png' },
  { id: 'PMH-ICHOOSEYOU-2', image: 'cardd2.png' },
  { id: 'PMH-ICHOOSEYOU-3', image: 'cardd3.png' },
  { id: 'PMH-ICHOOSEYOU-4', image: 'cardd4.png' },
  { id: 'PMH-ICHOOSEYOU-5', image: 'cardd5.png' },
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
      TITLE,
      DESCRIPTION,
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
