# Google Ads 2025 Campaign - Detailed Findings Report

**Report Date:** January 24, 2026
**Data Period:** January 17, 2025 - February 17, 2025
**Campaign:** US GOOGLE ADS (Performance Max)

---

## TABLE OF CONTENTS

1. [Campaign Overview](#1-campaign-overview)
2. [Age Report Analysis](#2-age-report-analysis)
3. [Device Report Analysis](#3-device-report-analysis)
4. [Search Terms Report Analysis](#4-search-terms-report-analysis)
5. [Asset Performance Analysis](#5-asset-performance-analysis)
6. [Shopping Products Analysis](#6-shopping-products-analysis)
7. [Placement Analysis](#7-placement-analysis)
8. [Auction Insights Analysis](#8-auction-insights-analysis)
9. [Ad Asset & Sitelink Analysis](#9-ad-asset--sitelink-analysis)
10. [Campaign Configuration Export](#10-campaign-configuration-export)
11. [Key Recommendations](#11-key-recommendations)

---

## 1. CAMPAIGN OVERVIEW

### Source File: `google-ads-export-utf8.csv`

#### Campaign Settings
| Setting | Value |
|---------|-------|
| Campaign Name | US GOOGLE ADS |
| Campaign Type | Performance Max |
| Networks | Google Search, Search Partners, Display Network |
| Daily Budget | $100.00 AUD |
| Bid Strategy | Maximize Conversion Value |
| Target ROAS | 300% |
| Start Date | January 14, 2025 |
| Merchant ID | 5529923692 |
| Brand Business Name | Pokémyheart |
| Campaign Status | Paused |

#### Geographic Targeting
| Location | Status | Reach |
|----------|--------|-------|
| United States | Targeted | 319,000,000 |
| United Kingdom | Negative (Excluded) | 71,100,000 |
| Canada | Negative (Excluded) | 42,200,000 |
| France | Negative (Excluded) | 75,300,000 |
| Australia | Negative (Excluded) | 23,600,000 |
| Mexico | Negative (Excluded) | 102,000,000 |

**Finding:** Campaign was US-only. All other English-speaking markets explicitly excluded.

#### Campaign Features Enabled
- Text Customization: Enabled
- Final URL Expansion: Enabled
- Image Enhancement: Enabled
- Video Enhancement: Enabled
- Brand Guidelines: Enabled
- Parked Domains: Excluded

#### Tracking Template
```
{lpurl}?tw_source=google&tw_adid={creative}&tw_campaign={campaignid}
```

---

## 2. AGE REPORT ANALYSIS

### Source File: `Age report.csv`

#### Complete Age Breakdown
| Age Group | Clicks | Impressions | CTR | Avg CPC | Cost | Conv Rate | Conversions | CPA |
|-----------|--------|-------------|-----|---------|------|-----------|-------------|-----|
| **25-34** | 3,451 | 228,441 | 1.51% | $1.00 | $3,434.35 | **1.29%** | **198.67** | **$17.29** |
| **35-44** | 1,719 | 133,213 | 1.29% | $0.93 | $1,601.55 | **0.67%** | **86.00** | **$18.62** |
| 18-24 | 1,700 | 175,116 | 0.97% | $0.80 | $1,353.95 | 0.28% | 46.00 | $29.43 |
| 45-54 | 379 | 45,090 | 0.84% | $0.82 | $311.79 | 0.15% | 7.00 | $44.54 |
| 55-64 | 137 | 15,358 | 0.89% | $1.01 | $138.97 | 0.22% | 3.00 | $46.32 |
| 65+ | 129 | 12,046 | 1.07% | $0.83 | $106.62 | 0.19% | 2.00 | $53.31 |
| Unknown | 1,482 | 206,369 | 0.72% | $0.88 | $1,304.20 | 0.69% | 54.33 | $24.00 |
| **TOTAL** | **8,997** | **815,633** | **1.10%** | **$0.92** | **$8,251.43** | **0.66%** | **397.00** | **$20.78** |

#### Key Findings

**Best Performing Age Groups:**
1. **25-34**: 50.0% of conversions, best CPA ($17.29), highest conv rate (1.29%)
2. **35-44**: 21.7% of conversions, second best CPA ($18.62)

**Worst Performing Age Groups:**
1. **65+**: Only 2 conversions, CPA 3x higher than 25-34
2. **55-64**: Only 3 conversions, CPA 2.7x higher than 25-34
3. **45-54**: Only 7 conversions, CPA 2.6x higher than 25-34

**Wasted Spend on 45+ Demographics:**
- Total Spend on 45+: $557.38
- Total Conversions from 45+: 12
- CPA for 45+: $46.45
- If reallocated to 25-34: Would have generated ~32 conversions instead of 12

**RECOMMENDATION:** Exclude ages 45+ entirely. Focus budget on 25-44.

---

## 3. DEVICE REPORT ANALYSIS

### Source File: `Device report.csv`

#### Complete Device Breakdown
| Device | Clicks | Impressions | CTR | Avg CPC | Cost | Conv Rate | Conversions | CPA |
|--------|--------|-------------|-----|---------|------|-----------|-------------|-----|
| **Mobile** | 8,258 | 698,054 | 1.18% | $0.89 | $7,311.86 | **0.70%** | **362.01** | **$20.20** |
| Desktop | 612 | 73,015 | 0.84% | $1.32 | $808.55 | 0.79% | 32.99 | $24.51 |
| Tablet | 127 | 44,547 | 0.29% | $1.03 | $130.81 | 0.05% | 2.00 | $65.41 |
| TV Screens | 0 | 17 | 0.00% | $0.00 | $0.21 | 0.00% | 0.00 | N/A |
| **TOTAL** | **8,997** | **815,633** | **1.10%** | **$0.92** | **$8,251.43** | **0.66%** | **397.00** | **$20.78** |

#### Key Findings

**Traffic Distribution:**
- Mobile: 85.6% of traffic
- Desktop: 9.0% of traffic
- Tablet: 5.5% of traffic
- TV: 0.002% of traffic

**Conversion Distribution:**
- Mobile: **91.2%** of all conversions
- Desktop: 8.3% of conversions
- Tablet: 0.5% of conversions
- TV: 0% of conversions

**Cost Efficiency:**
- Mobile CPA: $20.20 (baseline)
- Desktop CPA: $24.51 (21% higher than mobile)
- Tablet CPA: $65.41 (224% higher than mobile)

**RECOMMENDATION:**
- Set Mobile bid adjustment: +20%
- Set Tablet bid adjustment: -50% or exclude
- Exclude TV screens entirely
- Desktop is acceptable but monitor

---

## 4. SEARCH TERMS REPORT ANALYSIS

### Source File: `Search terms report.csv`

#### Report Statistics
- Total unique search terms: **18,107**
- Search terms with conversions: **~150**
- Total search term conversions tracked: 302.38
- Total "Other search terms" conversions: 65.84

#### TOP 50 CONVERTING SEARCH TERMS

| Rank | Search Term | Clicks | Impressions | CTR | Conv Rate | Conversions | CPA |
|------|-------------|--------|-------------|-----|-----------|-------------|-----|
| 1 | pokemon valentines cards | 415 | 16,792 | 2.47% | 10.64% | **44.17** | $12.78 |
| 2 | i choose you pokemon card | 208 | 4,151 | 5.01% | 9.14% | **19.02** | $12.89 |
| 3 | valentine's day pokemon card | 155 | 3,849 | 4.03% | 10.00% | **15.50** | $14.45 |
| 4 | valentines pokemon cards | 114 | 4,143 | 2.75% | 13.68% | **15.59** | $8.42 |
| 5 | pokemon valentines | 130 | 7,681 | 1.69% | 8.52% | **11.08** | $14.19 |
| 6 | valentine pokemon cards | 66 | 2,104 | 3.14% | 12.63% | **8.33** | $8.37 |
| 7 | custom valentines pokemon card | 64 | 1,263 | 5.07% | 12.50% | **8.00** | $8.81 |
| 8 | i choose you pokemon valentine card | 60 | 1,331 | 4.51% | 12.10% | **7.26** | $6.80 |
| 9 | pokemon card valentines day gift | 66 | 1,851 | 3.57% | 10.61% | **7.00** | $12.72 |
| 10 | valentines day pokemon card | 107 | 2,978 | 3.59% | 6.54% | **7.00** | $19.40 |
| 11 | pokemon i choose you valentine card | 31 | 709 | 4.37% | 19.35% | **6.00** | $8.78 |
| 12 | pokemon card valentines | 60 | 1,705 | 3.52% | 9.44% | **5.67** | $11.82 |
| 13 | custom pokemon valentines cards | 40 | 1,004 | 3.98% | 13.00% | **5.20** | $9.16 |
| 14 | valentines pokemon card | 80 | 2,418 | 3.31% | 6.47% | **5.17** | $23.30 |
| 15 | valentines day pokemon cards | 27 | 896 | 3.01% | 18.52% | **5.00** | $6.84 |
| 16 | i choose you pokemon card valentines | 30 | 584 | 5.14% | 16.67% | **5.00** | $5.69 |
| 17 | pokemyheart (BRAND) | 36 | 51 | 70.59% | 11.11% | **4.00** | $6.83 |
| 18 | i choose you custom pokemon card | 16 | 290 | 5.52% | 25.00% | **4.00** | $3.87 |
| 19 | i choose you valentines card | 52 | 1,260 | 4.13% | 7.69% | **4.00** | $8.95 |
| 20 | custom valentines day pokemon card | 44 | 853 | 5.16% | 9.09% | **4.00** | $12.34 |
| 21 | pokemon valentines day cards | 35 | 1,803 | 1.94% | 11.43% | **4.00** | $12.57 |
| 22 | valentine's day gifts | 79 | 9,067 | 0.87% | 3.80% | **3.00** | $37.87 |
| 23 | i choose you cards | 7 | 140 | 5.00% | 42.86% | **3.00** | $3.92 |
| 24 | custom pokemon card valentines day | 28 | 723 | 3.87% | 10.71% | **3.00** | $11.56 |
| 25 | couple pokemon card | 32 | 607 | 5.27% | 9.38% | **3.00** | $9.37 |

#### HIGHEST EFFICIENCY SEARCH TERMS (Best Conv Rate)

| Search Term | Conv Rate | Conversions | CPA |
|-------------|-----------|-------------|-----|
| good gifts for valentine's day girlfriend | 200.00% | 2.00 | $2.06 |
| i choose you valentine card | 100.00% | 2.00 | $0.44 |
| valentines day ideas from kids | 50.00% | 1.00 | $2.00 |
| i love you pokemon card | 50.00% | 2.00 | $2.11 |
| i choose you cards | 42.86% | 3.00 | $3.92 |
| i choose you custom pokemon card | 25.00% | 4.00 | $3.87 |
| pokemon card valentines gift | 25.00% | 2.00 | $7.13 |
| pokemon card valentine | 22.22% | 2.00 | $5.02 |
| pokemon i choose you valentine card | 19.35% | 6.00 | $8.78 |
| valentines day pokemon cards | 18.52% | 5.00 | $6.84 |

#### SEARCH TERM CATEGORIES

**Category 1: "Pokemon Valentines" Variations (BEST)**
- Combined conversions: ~150
- Average CPA: $11.50
- Terms: pokemon valentines cards, pokemon valentines, valentines pokemon cards, etc.

**Category 2: "I Choose You" Variations (EXCELLENT)**
- Combined conversions: ~50
- Average CPA: $8.00
- Terms: i choose you pokemon card, i choose you valentines card, etc.

**Category 3: "Custom Pokemon Card" Variations (GOOD)**
- Combined conversions: ~30
- Average CPA: $12.00
- Terms: custom pokemon valentines cards, custom valentines pokemon card, etc.

**Category 4: Generic Gift Terms (POOR)**
- Combined conversions: ~10
- Average CPA: $30+
- Terms: valentine's day gifts, valentines gift for him, etc.

**Category 5: Brand Search (EXCELLENT)**
- "pokemyheart": 4 conversions, $6.83 CPA, 70.59% CTR

#### NEGATIVE KEYWORD OPPORTUNITIES

Search terms with 0 conversions and high impressions (waste):
- "pick a card" - 120 impressions, 0 conversions
- "anniversary gifts" - 213 impressions, 0 conversions
- "pokemon card" (generic) - 417 impressions, 0 conversions
- "valentines day drawings" - 106 impressions, 0 conversions
- "i love you" - 8,115 impressions, 0 conversions

**RECOMMENDED NEGATIVE KEYWORDS:**
```
pick a card
drawing
drawings
make
diy
free
printable
template
tutorial
classroom
school
kids
bulk
wholesale
meme
```

---

## 5. ASSET PERFORMANCE ANALYSIS

### Source File: `Asset group asset details report.csv`

#### VIDEO PERFORMANCE (Critical Finding)

| Video ID | Title | Conversions | Conv Value | Impressions | Clicks | Cost | CPA |
|----------|-------|-------------|------------|-------------|--------|------|-----|
| **ShOimbofW8A** | Remember the thrill?.MOV | **20.13** | **$1,238.83** | 279,527 | 2,293 | $1,329.06 | $66.02 |
| Atq4-ASPkWc | Flowers chocolates enough.MOV | 3.00 | $233.90 | 94,096 | 716 | $392.35 | $130.78 |
| vKm1YjTXJVk | Calling all trainers.MOV | 3.00 | $197.33 | 38,567 | 252 | $265.99 | $88.66 |
| 7Pb_djNzr1o | LiquidLuck TikTok | 2.00 | $170.24 | 44,298 | 351 | $255.55 | $127.78 |
| muDm0rI1kag | Tired of routine.MOV | 0.00 | $0.00 | 8,237 | 71 | $50.13 | N/A |

**Key Finding:** Video ShOimbofW8A generated **77%** of all video conversions.

#### DESCRIPTION PERFORMANCE

| Description | Conversions | Conv Value | Impressions | Clicks | Cost |
|-------------|-------------|------------|-------------|--------|------|
| "Perfect for gamers, collectors, and Pokémon fans—order NOW!" | **10.00** | **$700.13** | 103,345 | 800 | $552.32 |
| Celebrate love with a unique and heartfelt gift! | 0.00 | $0.00 | 0 | 0 | $0.00 |
| Say 'I Choose You' with a romantic exclusive Pokémon card! | 0.00 | $0.00 | 0 | 0 | $0.00 |
| A romantic gift as unique as your love—holographic Pokémon-inspired cards! | 0.00 | $0.00 | 0 | 0 | $0.00 |
| Romance meets nostalgia with limited-edition Pokémon-inspired love cards! | 0.00 | $0.00 | 0 | 0 | $0.00 |

**Key Finding:** Only ONE description got significant distribution. Use this as primary.

#### LONG HEADLINE PERFORMANCE

| Long Headline | Conversions | Conv Value | Impressions | Clicks |
|---------------|-------------|------------|-------------|--------|
| Limited Edition Valentine's Cards—Perfect for Fans of Pokémon & Nostalgia! | **6.50** | **$387.21** | 104,082 | 799 |
| The Perfect Romantic Gift for Pokémon Lovers! | 0.00 | $0.00 | 0 | 0 |
| Say 'I Choose You' with a Unique Romantic Pokémon Card—Shop Now! | 0.00 | $0.00 | 0 | 0 |

#### HEADLINE PERFORMANCE

| Headline | Conversions | Clicks | Impressions |
|----------|-------------|--------|-------------|
| Say 'I Choose You' | **0.10** | 16 | 274 |
| Perfect Gift for Gamers | 0.00 | 3 | 43 |
| Romantic Poke-style Cards! | 0.00 | 2 | 97 |
| Say 'I Choose You' Today! | 0.00 | 4 | 219 |
| Celebrate your love | 0.00 | 3 | 48 |
| Limited edition | 0.00 | 0 | 172 |

#### IMAGE PERFORMANCE

| Image ID | Type | Conversions | Conv Value | Impressions | Clicks |
|----------|------|-------------|------------|-------------|--------|
| 987265813471612863 | Square | **8.50** | $539.56 | 477 | 83 |
| 2346237648930491960 | Square | **3.00** | $213.21 | 206 | 23 |
| 6411592185977050879 | Square | **2.00** | $112.96 | 106 | 15 |
| 11883699875136348234 | Square | 0.00 | $0.00 | 101 | 3 |
| Others | Various | 0.00 | $0.00 | <100 each | <5 each |

**Key Finding:** Square images significantly outperformed horizontal and portrait.

---

## 6. SHOPPING PRODUCTS ANALYSIS

### Source File: `Shopping products.csv`

#### Product Performance by Variant

| Variant ID | Clicks | Impressions | CTR | Conv Rate | Conversions | CPA |
|------------|--------|-------------|-----|-----------|-------------|-----|
| **50712508727612** | 2,606 | 124,543 | 2.09% | **7.76%** | **202.39** | $13.55 |
| 50712508760380 | 420 | 16,058 | 2.62% | **8.70%** | **36.53** | $13.68 |
| 50712508858684 | 223 | 15,429 | 1.45% | **8.63%** | **19.25** | $16.96 |
| 50712884314428 | 548 | 72,412 | 0.76% | 3.41% | 18.80 | $22.76 |
| 50712884347196 | 315 | 16,922 | 1.86% | 4.70% | 14.79 | $23.37 |
| 50712508793148 | 197 | 14,838 | 1.33% | 6.68% | 13.17 | $18.56 |
| 50712884379964 | 49 | 3,632 | 1.35% | **11.22%** | 5.50 | $8.33 |
| 50712884412732 | 118 | 7,632 | 1.55% | 7.77% | 9.17 | $15.44 |
| 50712508891452 | 135 | 15,100 | 0.89% | 5.80% | 7.83 | $24.94 |
| 50712884576572 | 134 | 10,665 | 1.26% | 5.22% | 7.00 | $21.26 |

#### Key Findings

**Best Performing Variant:** 50712508727612
- 50.9% of all product conversions
- Highest volume (2,606 clicks)
- Competitive CPA ($13.55)

**Highest Conversion Rate Variant:** 50712884379964
- 11.22% conversion rate
- Best CPA ($8.33)
- Lower volume (49 clicks) - opportunity to scale

**Poor Performers (High CPA):**
- 50712508825916: $29.72 CPA (1.5x average)
- 50712508891452: $24.94 CPA
- 50712884511036: $43.61 CPA

---

## 7. PLACEMENT ANALYSIS

### Source File: `Performance Max campaigns placement.csv`

#### Report Statistics
- Total placements: **28,386**
- YouTube video placements: **27,737** (97.7%)
- Mobile app placements: **576** (2.0%)
- Website placements: **73** (0.3%)

#### Top Placement Categories

| Placement Type | Impressions | % of Total |
|----------------|-------------|------------|
| Google Owned & Operated | 70,836 | 8.7% |
| YouTube Videos | ~700,000 | 85.8% |
| Video No Longer Available | 35,327 | 4.3% |
| bestbuy.com | 31,219 | 3.8% |
| Mobile Apps | ~3,000 | 0.4% |
| Other Websites | ~500 | 0.1% |

#### Top Website Placements

| Website | Impressions |
|---------|-------------|
| bestbuy.com | 31,219 |
| ebay.com | 200 |
| yahoo.com | 124 |
| fandom.com | 59 |

**Key Finding:** 97.7% of placements were YouTube videos. This campaign was essentially a YouTube video ad campaign with Shopping supplements.

#### Top Mobile App Placements

| App | Impressions |
|-----|-------------|
| Block Blast! (Google Play) | 263 |
| Going Balls (iOS) | 113 |
| Block Puzzle Jewel Legend (iOS) | 103 |
| Mahjong Club (Google Play) | 90 |

**Key Finding:** Mobile app placements had minimal volume. Not a significant traffic source.

---

## 8. AUCTION INSIGHTS ANALYSIS

### Source File: `Auction insights report.csv`

#### Competitive Landscape

| Competitor | Impression Share | Overlap Rate | Position Above Rate | Top of Page Rate | Abs Top Rate |
|------------|------------------|--------------|---------------------|------------------|--------------|
| **You** | 10.28% | -- | -- | 90.97% | 45.90% |
| etsy.com | **43.23%** | 74.19% | 54.91% | 90.51% | 63.70% |
| amazon.com | 18.37% | 23.41% | 31.10% | 85.88% | 30.10% |
| pokepetshop.com | 15.59% | 33.55% | 36.81% | 96.11% | 27.16% |

#### Key Findings

**Market Position:**
- You captured only **10.28%** of available impressions
- Etsy dominated with **43.23%** impression share (4.2x your share)
- Amazon had **18.37%** (1.8x your share)
- Direct competitor pokepetshop.com had **15.59%** (1.5x your share)

**Quality Signals:**
- Your Top of Page Rate (90.97%) was competitive
- Your Absolute Top Rate (45.90%) was second only to Etsy
- Etsy appeared above you 54.91% of the time when you overlapped

**Opportunity:**
- With 10.28% impression share, there's **~90%** of the market you didn't reach
- Scaling budget could significantly increase volume
- Etsy's dominance suggests marketplace aggregator advantage

---

## 9. AD ASSET & SITELINK ANALYSIS

### Source File: `Ad asset report.csv`

#### Sitelink Performance & Approvals

| Sitelink | Status | CTR | Conversions | Conv Value | Cost |
|----------|--------|-----|-------------|------------|------|
| Read The FAQs | **DISAPPROVED** | 12.40% | 10.60 | $716.07 | $230.08 |
| Buy Now (Limited stock left) | **DISAPPROVED** | 14.74% | 6.00 | $404.15 | $174.63 |
| Buy Now (Limited stock - get yours now!) | **DISAPPROVED** | 10.93% | 5.10 | $344.54 | $83.70 |
| Business Name (Pokémyheart) | Eligible | 1.57% | 0.00 | $0.00 | $6.11 |
| Logo | Eligible | 1.07% | 0.00 | $0.00 | $19.77 |

#### CRITICAL FINDING: Disapproved Sitelinks

**ALL converting sitelinks were DISAPPROVED:**
1. "Buy Now / Limited stock left / Order NOW" - DISAPPROVED
2. "Buy Now / Limited stock - get yours now! / Selling fast!" - DISAPPROVED
3. "Read The FAQs" - DISAPPROVED

**Disapproval Reason:** Likely "Misrepresentation" - urgency/scarcity claims

**Impact:** These sitelinks drove **21.7 conversions** worth **$1,464.76** before being disapproved.

#### Callout Extensions (Approved)

| Callout | Status |
|---------|--------|
| Instant Results | Approved |
| Complete Privacy | Approved |
| 30-Day Guarantee | Approved |
| No Subscription | Approved |

---

## 10. CAMPAIGN CONFIGURATION EXPORT

### Source File: `google-ads-export-utf8.csv`

#### Asset Group: "Pokemon Valentines Day"

**Headlines (15):**
1. One-of-a-Kind Romantic Gift
2. Exclusive Romantic Card
3. Poke Romantic Love Cards
4. Pokemon Anniversary Gift
5. Limited Edition Gamer Gift
6. Perfect Romantic Gift
7. Pokemon Gift for Him
8. Unique Romantic Gifts
9. Pokemon Gift for Boyfriend
10. Romantic Gamer Collectible
11. Say 'I Choose You' Today!
12. Limited Edition Pokemon Love
13. Say 'I Choose You'
14. Perfect Gift for Gamers
15. Romantic Poke-style Cards!

**Long Headlines (5):**
1. The Perfect Romantic Gift for Pokémon Lovers!
2. Say 'I Choose You' with a Unique Romantic Pokémon Card—Shop Now!
3. Limited Edition Valentine's Cards—Perfect for Fans of Pokémon & Nostalgia!
4. Celebrate Love & Nostalgia with Our Pokémon Love Cards – Shop Now!
5. Surprise Your Love with a Pokémon-Inspired Trading Card They'll Treasure Forever!

**Descriptions (5):**
1. Perfect for gamers, collectors, and Pokémon fans—order NOW!
2. Celebrate love with a unique and heartfelt gift!
3. Say 'I Choose You' with a romantic exclusive Pokémon card!
4. A romantic gift as unique as your love—holographic Pokémon-inspired cards!
5. Romance meets nostalgia with limited-edition Pokémon-inspired love cards!

**Videos (5):**
1. 7Pb_djNzr1o - LiquidLuck TikTok
2. muDm0rI1kag - Tired of routine
3. Atq4-ASPkWc - Flowers chocolates enough
4. ShOimbofW8A - Remember the thrill (TOP PERFORMER)
5. vKm1YjTXJVk - Calling all trainers

**URL Paths:**
- Path 1: ichooseyou
- Path 2: loveedition

**Final URL:** https://pokemyhe.art/products/i-choose-you-the-ultimate-romantic-gift?variant=51026517754172

#### Search Themes (23 total)
1. Pokemon Valentines card
2. Pokemon-themed Valentines gift
3. Pokemon trading card Valentines
4. I Choose You Pokemon card
5. Limited edition Valentines card Pokémon
6. Custom Pokémon love card
7. Romantic Pokémon trading cards
8. Pokemon collectible Valentines gift
9. Valentines Day gifts for Pokemon fans
10. Cute Valentines Day cards
11. Romantic trading cards for Valentines
12. Collectible Valentines gifts
13. Unique Valentines card ideas
14. Valentines gift for collectors
15. Nostalgic Pokémon gifts
16. Pokémon collectors item
17. Pokemon gifts for couples
18. Geeky Valentines Day cards
19. pokémon gifts for boyfriends/girlfriends
20. Romantic nostalgia gift
21. Valentines Day cards with a twist
22. Sentimental Valentines trading card
23. I choose you valentine gift

#### Audience Signals

**Age Demographics:** 18-24, 25-34, 35-44, Unknown

**Income Demographics:** Unknown, 41-50%, 31-40%, 21-30%, 11-20%, Top 10%

**Interest Categories:**
- Consumer Electronics > Game Consoles > Nintendo Consoles
- Gifts & Occasions
- Gifts & Occasions > Personalized Gifts
- Media & Entertainment > Video Games
- Media & Entertainment > Gamers
- Media & Entertainment > Gamers > Casual & Social Gamers
- Media & Entertainment > Comics & Animation Fans
- Gifts & Occasions > Holiday Items & Decorations > Valentine's Day Items & Decor

**Custom Audience Segments:**
- pokemon
- Pokemon Cards
- pokémon
- cards de pokemon
- Pokemon Games and Products
- Classic Video Games
- Pokemon Products
- Anniversary Gift
- Pokemon Mobile Game
- Personalized Gifts
- Gift Sending
- Valentine's Day Cards and Gifts
- Valentine's Day Decor
- Valentine's Day Cards

**Life Events:** Marital Status > In a Relationship

**Detailed Demographics:** Marital Status > In a Relationship, Marital Status > Married

---

## 11. KEY RECOMMENDATIONS

### Immediate Actions for 2026 Campaign

#### 1. Demographic Targeting
- **INCLUDE:** Ages 25-44 only
- **EXCLUDE:** Ages 45+
- **Bid Adjustments:** Mobile +20%, Tablet -50%, TV -100%

#### 2. Search Themes to Use
Top 10 converting themes (copy exactly):
```
pokemon valentines cards
i choose you pokemon card
valentine's day pokemon card
valentines pokemon cards
pokemon valentines
valentine pokemon cards
custom valentines pokemon card
i choose you pokemon valentine card
pokemon card valentines day gift
pokemyheart
```

#### 3. Creative Assets
**Primary Video:** ShOimbofW8A (77% of video conversions)
**Primary Description:** "Perfect for gamers, collectors, and Pokémon fans—order today!"
**Primary Long Headline:** "Limited Edition Valentine's Cards—Perfect for Fans of Pokémon & Nostalgia!"
**Image Format:** Prioritize square images

#### 4. Sitelinks (AVOID URGENCY)
**DO NOT USE:**
- "Limited stock"
- "Selling fast"
- "Order NOW"
- Any scarcity claims

**SAFE TO USE:**
- "Shop Now" / "Browse Collection"
- "FAQ" / "Questions Answered"
- "Our Story"
- "Reviews"

#### 5. Negative Keywords
```
pick a card
drawing
make
diy
free
printable
template
tutorial
classroom
school
kids
bulk
wholesale
meme
```

#### 6. Budget Allocation
- Previous: $100/day
- Recommendation: Scale to $150-200/day during Feb 7-14 (peak period in 2025)
- Monitor 45+ exclusion impact on reach

#### 7. Product Feed
- Prioritize variant 50712508727612 (hero product)
- Consider excluding variants with >$25 CPA

---

## APPENDIX: File Checksums

| File | Size | Lines |
|------|------|-------|
| Ad asset report.csv | 1,259 bytes | 18 |
| Age report.csv | 724 bytes | 13 |
| Asset group asset details report.csv | 11,103 bytes | 84 |
| Auction insights report.csv | 380 bytes | 8 |
| Device report.csv | 659 bytes | 9 |
| Performance Max campaigns placement.csv | 2,521,708 bytes | 28,386 |
| Search terms report.csv | 1,548,445 bytes | 18,107 |
| Shopping products.csv | 2,216 bytes | 28 |
| google-ads-export-utf8.csv | 27,287 bytes | 109 |

---

**Report Generated:** January 24, 2026
**Data Analyst:** Claude AI
