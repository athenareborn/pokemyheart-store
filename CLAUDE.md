# Pokemyheart Store - AI Assistant Reference

This document provides context for AI assistants working on the Pokemyheart store codebase.

## Business Overview

**Pokemyheart** (brand: UltraRareLove) sells Pokemon-themed Valentine's Day trading cards. Primary product is a holographic "Heartstealer" card available in romantic and anniversary variants.

- **Primary Season**: January - March (Valentine's Day)
- **Markets**: US + Australia
- **Sales Channel**: Shopify-style checkout via Stripe
- **Marketing**: Meta (Facebook/Instagram) ads

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (checkout + embedded)
- **Analytics**: Custom + Meta Pixel
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── (storefront)/     # Customer-facing pages
│   ├── (checkout)/       # Checkout flow
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/
│   ├── storefront/       # Store components
│   ├── admin/            # Admin components
│   └── ui/               # shadcn/ui base components
├── lib/                  # Utilities, Supabase client, Stripe
└── data/                 # Static data files (marketing JSON)

ad-assets/                # Ad creatives and marketing assets
scripts/                  # Utility scripts
```

## Key Admin Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard |
| `/admin/orders` | Order management |
| `/admin/products` | Product management |
| `/admin/customers` | Customer list |
| `/admin/analytics` | Performance analytics |
| `/admin/marketing` | Marketing source of truth |
| `/admin/todos` | Launch task tracker |
| `/admin/settings` | Store settings |

## Environment Variables

Key variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Meta Marketing API
FB_MARKETING_ACCESS_TOKEN=
FB_AD_ACCOUNT_ID=act_483311192619824

# Analytics
NEXT_PUBLIC_FB_PIXEL_ID=
```

## Domain-Specific Reference Docs

### Marketing & Ads
See **[CLAUDE-MARKETING.md](./CLAUDE-MARKETING.md)** for:
- Ad campaign performance data
- Copy library and patterns
- Asset preparation guidelines
- Meta API usage
- Source of truth structure

### Ad Assets
See **[ad-assets/](./ad-assets/)** folder containing:
- `AD-ASSETS-MAP.md` - Asset organization guide
- `META-AD-ASSET-GUIDE.md` - Metadata cleaning & freshness
- `PERFORMANCE-REPORT-2025.md` - Detailed 2025 stats

## Common Patterns

### UI Components
Uses shadcn/ui. Import from `@/components/ui/`:
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
```

### Data Fetching (Server)
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select()
  // ...
}
```

### Admin Auth
Admin routes check authentication via Supabase. Protected by middleware.

### Analytics Tracking
```tsx
import { trackEvent } from '@/lib/analytics'
trackEvent('purchase', { value: 59.99, currency: 'USD' })
```

## Product Data

Main product: **Heartstealer Card**
- Single card: $39.99
- Bundle (2 cards): $59.99 (most popular)
- Bundle (3 cards): $79.99

Variants: Romantic, Anniversary (same price)

## Important Conventions

1. **No time estimates** - Never promise how long tasks will take
2. **Edit over create** - Prefer editing existing files over creating new ones
3. **Keep it simple** - Don't over-engineer or add unnecessary features
4. **Test builds** - Run `npm run build` to verify changes compile
5. **Commit separately** - Keep marketing/checkout/other changes in separate commits

## Seasonal Context

- **Q1 (Jan-Mar)**: Valentine's rush - primary sales period
- **Q4 (Oct-Dec)**: Anniversary/evergreen testing
- Current focus (Jan 2026): Valentine's 2026 campaign launch

## Recent Work (Jan 2026)

- Marketing Source of Truth created (`/admin/marketing`)
- 2025 ad performance data imported
- 2026 campaign assets prepared (LiquidLuck TikTok videos)
- Checkout flow improvements (separate agent work)
