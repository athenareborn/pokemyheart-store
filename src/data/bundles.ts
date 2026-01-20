export const BUNDLES = [
  {
    id: 'card-only',
    name: 'Card Only',
    price: 2395,      // $23.95 in cents
    compareAt: 2995,  // $29.95 in cents
    description: 'Simple, sleek, unforgettable',
    includes: ['Premium Holographic Card', 'Envelope'],
    badge: undefined,
    sku: 'PMH-CARD',
  },
  {
    id: 'love-pack',
    name: 'Love Pack',
    price: 3795,      // $37.95 in cents
    compareAt: 4995,  // $49.95 in cents
    description: 'Card + premium display case',
    includes: ['Premium Holographic Card', 'Display Case', 'Display Stand', 'Envelope'],
    badge: 'Most Popular',
    sku: 'PMH-LOVEPACK',
  },
  {
    id: 'deluxe-love',
    name: 'Deluxe Love',
    price: 5295,      // $52.95 in cents
    compareAt: 7495,  // $74.95 in cents
    description: 'The ultimate gift package',
    includes: ['Premium Holographic Card', 'Premium Display Case', 'Premium Stand', 'Luxury Gift Box', 'Tissue Paper', 'Envelope'],
    badge: 'Best Value',
    sku: 'PMH-DELUXE',
  },
] as const

export type Bundle = typeof BUNDLES[number]
export type BundleId = Bundle['id']

export function getBundle(id: BundleId): Bundle | undefined {
  return BUNDLES.find(b => b.id === id)
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function calculateSavings(bundle: Bundle): number {
  return bundle.compareAt - bundle.price
}
