# Pokemyheart Ad Assets Map

## Ad Account
- **Account:** Ad Account 3 (`act_483311192619824`)
- **Business:** MOVE IT FAST OTT KTD
- **Currency:** AUD

---

## 2025 US Campaign Performance (Jan-Mar 2025)

**Campaign:** US POKE BROAD Campaign (`120215987861490096`)
**Totals:** $4,934 spent | 266 purchases | $17,155 revenue | 3.48x ROAS

### Top Performing Ads

| Ad Name | Purchases | Revenue | ROAS | CPA | Media Type |
|---------|-----------|---------|------|-----|------------|
| **Static AD - Copy** | 157 | $9,931 | 4.04x | $15.64 | Static Image |
| **INTIAL TT VID** | 98 | $6,665 | 2.91x | $23.40 | Video |
| new creative multi card brock | 5 | $230 | 5.77x | $7.99 | Multi-card |
| Say I choose You - Copy | 3 | $154 | 3.67x | $14.02 | Static |
| Tired of the same old Vday | 3 | $173 | 2.98x | $19.37 | Static |

---

## Asset Locations

### 2025 Winners (Proven Performers)

**Static Ads (4.04x ROAS winner):**
```
ad-assets/2025-winners/static-ads/
├── design 1 anniversary brown static.png
├── design 1 romantic brown static.png
├── design 2 anniversary brown static.png
├── design 2 romantic brown static.png
├── design 3 anniversary brown static.png
└── design 3 romantic brown static.png
```

**Video Ads (2.91x ROAS):**
```
ad-assets/2025-winners/video-ads/
├── Video I choose you Anniversary.mp4  (67MB - original)
└── Video I choose you Love.MOV         (67MB - love variant)
```

### 2026 Campaign Assets

**Video (cleaned, metadata stripped):**
```
ad-assets/2026-campaign/video/
└── pokemyheart_vday_2026_fresh.mp4  (5.6MB - ready for upload)
```

### Card Designs (Product Images)

```
ad-assets/card-designs/
├── valentines day 1.png
├── valentines day 2.png
├── valentines day 3.png
├── valentines day 4.png
└── valentines day 5.png
```

---

## Facebook Creative IDs (for reference)

**Main Video Creative:**
- Video ID: `1198294722110926`
- Creative Name: "The Perfect Gift for Pokmon Lovers!"

**Static Image Hashes (2025):**
- `ab21ec3a59d007ab7c714ba466787adf`
- `a681805dfa14f33e8e07e4be1309f195`
- `ce65a688f3d2bbee69f08869c5b26bf0`
- `28ea62b6d54bff464bc23a1ef8754335`

---

## Recommendations for 2026

1. **Lead with Static AD** - 4.04x ROAS, lowest CPA ($15.64)
2. **Use video as secondary** - Still profitable but higher CPA
3. **Test "multi card brock" style** - Small sample but 5.77x ROAS potential
4. **Target US only** (as planned)
5. **Start conservative** ($50-75/day), scale winners

---

## Scripts

```bash
# Pull ad performance
cd /Users/atzarakis/Documents/pokemyheart-store
node scripts/get-top-ads.js

# Create new campaign
node scripts/create-campaign.js
```

---

## Credentials

Add to `.env.local`:
```
FB_MARKETING_ACCESS_TOKEN="EAAQG5Bagh2sBQ..."
FB_AD_ACCOUNT_ID="act_483311192619824"
```

Token needs permissions: ads_read, ads_management, business_management, read_insights
