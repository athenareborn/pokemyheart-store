# GMC Feed Setup (Designs 1-3)

Feed file: `public/feeds/gmc-products.csv`  
Live URL (after deploy): `https://ultrararelove.com/feeds/gmc-products.csv`

## What’s in the feed
- 6 items total: design-1, design-2, design-3 × (love-pack + card-only)
- No deluxe bundle
- Design-specific landing pages via `?design=design-1|2|3`
- Bundle-specific landing pages via `?bundle=love-pack|card-only`

## Shipping labels
Use `shipping_label` to apply different shipping rules in Merchant Center:
- `free-ship`: love-pack items (standard shipping is free at $37.95)
- `standard-ship`: card-only items (standard shipping is $5.95)

In GMC, set shipping services that match these labels:
- `free-ship` → $0 standard shipping
- `standard-ship` → $5.95 standard shipping

## Campaign controls (Google Ads)
Use listing groups or filters:
- `custom_label_0` = design ID (design-1/2/3)
- `custom_label_1` = bundle (love-pack/card-only)
- `custom_label_2` = priority (primary/secondary)

Recommended: bid up `custom_label_2=primary` (love-pack) and keep card-only as secondary.
