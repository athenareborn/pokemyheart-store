# Valentine's Day 2026 - Manual Campaign Setup

Use this guide if the automated script fails or you prefer manual setup.

---

## Step 1: Open Ads Manager

1. Go to https://business.facebook.com/adsmanager
2. Select Ad Account: **Ad Account 3** (act_483311192619824)

---

## Step 2: Create Campaign

1. Click **+ Create**
2. Select objective: **Sales**
3. Campaign name: `VDAY 2026 - US`
4. **Enable**: Advantage+ campaign budget (optional)
5. Click **Continue**

### Campaign Settings
- Special ad categories: None
- Buying type: Auction
- Campaign objective: Sales

---

## Step 3: Create Ad Set

### Ad Set Name
```
US Broad - Advantage+
```

### Budget & Schedule
- Daily budget: **$150** (scale based on performance)
- Start date: **Now**
- End date: **February 15, 2026** (optional)

### Audience
- **Locations**: United States only
- **Age**: 18-65
- **Advantage+ Audience**: ON (let Meta optimize)

### Placements
- **Advantage+ Placements**: ON
- Or manually select: Facebook Feed, Instagram Feed, Stories, Reels

### Conversion
- Conversion location: Website
- Pixel: Select your Pokemyheart pixel
- Conversion event: Purchase

---

## Step 4: Upload Images

Go to **Media Library** or upload directly in ad creation.

### Images to Upload
Located in: `ad-assets/2026-campaign/static/fresh/`

1. `winner-say-i-choose-you_20260123.png`
2. `winner-giftbox_20260123.png`
3. `winner-ultimate-valentine_20260123.png`

Optional video:
- `ad-assets/2026-campaign/video/liquidluck_trainer_gift.mp4`

---

## Step 5: Create Ads

Create **5 ads** with these combinations:

### Ad 1: Audience Expansion
- **Name**: Static 1 - Audience Expansion
- **Image**: winner-say-i-choose-you_20260123.png
- **Primary text**:
```
They don't have to be a Pokémon fan to love this card—it's shiny, thoughtful, and so romantic! The perfect Valentine's Day surprise.

Limited edition—shop now before they're gone!
```
- **Headline**: The Perfect Valentine's Gift for Pokémon Lovers!
- **Description**: Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone! Made in the USA!
- **CTA**: Order Now
- **URL**: https://pokemyhe.art/products/i-choose-you-the-ultimate-romantic-gift?variant=51026517754172

---

### Ad 2: Warning Hook
- **Name**: Static 2 - Warning Hook
- **Image**: winner-giftbox_20260123.png
- **Primary text**:
```
Warning: not just for Pokémon fans!

This limited edition card is so shiny, thoughtful & romantic... it's the perfect Valentine's Day surprise! Will you be their hero this year?

Shop now before they're gone!
```
- **Headline**: Catch Their Heart Now
- **Description**: Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone! Made in the USA!
- **CTA**: Order Now

---

### Ad 3: Nostalgia
- **Name**: Static 3 - Nostalgia
- **Image**: winner-ultimate-valentine_20260123.png
- **Primary text**:
```
Catch their heart this Valentine's Day with a one-of-a-kind Pokémon-inspired trading card!

Perfect for fans and collectors, this holographic card combines nostalgia and romance.

Order now—available only for a short time!
```
- **Headline**: Limited Edition Valentine's Gift
- **Description**: Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone! Made in the USA!
- **CTA**: Order Now

---

### Ad 4: Problem-Aware
- **Name**: Static 1 - Problem-Aware
- **Image**: winner-say-i-choose-you_20260123.png
- **Primary text**:
```
Tired of the same old V-Day routine? Skip the flowers and chocolate.

This holographic card is the gift they'll actually remember.

Limited edition—order before they're gone!
```
- **Headline**: One-of-a-Kind Valentine's Gift
- **Description**: The gift they'll keep forever. Holographic. Limited edition. Ships fast from the USA.
- **CTA**: Order Now

---

### Ad 5: Gift-Giver (Video)
- **Name**: Video - Gift-Giver
- **Video**: liquidluck_trainer_gift.mp4
- **Primary text**:
```
Your partner won't shut up about Pokémon? Get them a Valentine's gift they'll actually freak out over.

This holographic trading card looks like the real thing—but it says "I choose you" and it's meant for them.

Limited edition. Shop now before they sell out.
```
- **Headline**: Shiny Valentine's Day Surprise
- **Description**: Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone! Made in the USA!
- **CTA**: Order Now

---

## Step 6: Review & Publish

1. Review all ads in preview
2. Check mobile and desktop views
3. Verify tracking pixel is correct
4. Click **Publish**

Campaign will start in PAUSED state. Activate when ready.

---

## Post-Launch Checklist

- [ ] Campaign appears in Ads Manager
- [ ] All 5 ads are approved (check for policy issues)
- [ ] Pixel is firing on checkout
- [ ] Budget is correct ($150/day)
- [ ] Targeting is US only
- [ ] Activate campaign

---

## Scaling Rules

| ROAS | Action |
|------|--------|
| > 4x | Increase budget 25% |
| 3-4x | Increase budget 15% |
| 2-3x | Monitor, don't scale yet |
| < 2x | Pause ad, test new creative |

---

## Quick Links

- **Ads Manager**: https://business.facebook.com/adsmanager/manage/campaigns?act=483311192619824
- **Landing Page**: https://pokemyhe.art/products/i-choose-you-the-ultimate-romantic-gift
- **Copy Doc**: `ad-assets/2026-campaign/VDAY-2026-FINAL-COPY.md`
