import { NextResponse } from 'next/server'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'

// Cache for 1 hour - GMC fetches daily anyway
export const revalidate = 3600

const SITE_URL = 'https://www.ultrararelove.com'
const BRAND = 'UltraRareLove'

// Valentine's Pack bundle - the one we're advertising
const VALENTINES_PACK = BUNDLES.find(b => b.id === 'love-pack')!

export async function GET() {
  // TSV header row - Google Merchant Center format
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'additional_image_link',
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

  // Generate one product row per design variant
  const rows = PRODUCT.designs.map((design, index) => {
    const productId = `PMH-LOVEPACK-${design.id.toUpperCase()}`
    const title = `${design.name} - Premium Holographic Valentine's Card with Display Case`
    const description = `Make them feel truly special with this premium holographic Valentine's card featuring the "${design.name}" design. Includes display case, stand, and envelope. A unique, thoughtful keepsake they'll cherish forever.`
    const link = `${SITE_URL}/products/${PRODUCT.slug}`
    const imageLink = `${SITE_URL}/images/cards/cardd${index + 1}.png`

    // Additional images - show other card designs
    const additionalImages = PRODUCT.designs
      .filter(d => d.id !== design.id)
      .slice(0, 3)
      .map((d, i) => `${SITE_URL}/images/cards/cardd${PRODUCT.designs.indexOf(d) + 1}.png`)
      .join(',')

    // Price in USD format: "37.95 USD"
    const price = `${(VALENTINES_PACK.compareAt / 100).toFixed(2)} USD`
    const salePrice = `${(VALENTINES_PACK.price / 100).toFixed(2)} USD`

    // Shipping label - price qualifies for free shipping (above $35 threshold)
    const shippingLabel = 'free-ship'

    return [
      productId,                                           // id
      title,                                               // title
      description,                                         // description
      link,                                                // link
      imageLink,                                           // image_link
      additionalImages,                                    // additional_image_link
      'in_stock',                                          // availability
      price,                                               // price (compare at / original)
      salePrice,                                           // sale_price (current)
      BRAND,                                               // brand
      productId,                                           // mpn
      'new',                                               // condition
      'Arts & Entertainment > Hobbies & Creative Arts > Collectibles > Trading Cards',  // product_type
      '216',                                               // google_product_category (Collectibles)
      shippingLabel,                                       // shipping_label
      'false',                                             // identifier_exists (no GTIN)
      'false',                                             // adult
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
