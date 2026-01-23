# Marketing & Ad Campaign Reference

This document provides context for AI assistants working on Pokemyheart marketing and ad campaigns.

## Project Overview

**Pokemyheart** sells Pokemon-themed Valentine's Day trading cards. The primary sales period is January-March (Valentine's season). The business runs Meta (Facebook/Instagram) ads targeting US and Australian markets.

## Key Files & Locations

### Source of Truth
- **`/src/data/marketing-source-of-truth.json`** - Central data store for all marketing decisions
  - Campaign performance metrics
  - Winning ad creative rankings
  - Copy library (bodies, headlines, patterns)
  - Asset file locations
  - AI recommendations and decisions log

### Admin Interface
- **`/admin/marketing`** - Marketing dashboard in the admin app
  - Overview tab: Campaign stats, top performers, recommendations
  - Winners tab: All winning ads with expandable metrics
  - Copy tab: Copy library with one-click copy functionality
  - Assets tab: File locations for all ad creatives

### Ad Assets
```
ad-assets/
├── 2025-winners/
│   ├── static-ads/          # 6 brown static images (1080x1080)
│   └── video-ads/           # 2 "I Choose You" videos (1080x1920)
├── 2026-campaign/
│   └── video/               # 3 LiquidLuck TikTok videos (1080x1920)
├── card-designs/            # 5 product images
├── AD-ASSETS-MAP.md         # Asset organization guide
├── META-AD-ASSET-GUIDE.md   # Metadata cleaning & freshness guide
└── PERFORMANCE-REPORT-2025.md
```

### Environment Variables
```
FB_MARKETING_ACCESS_TOKEN=   # Meta Marketing API token (in .env.local)
FB_AD_ACCOUNT_ID=act_483311192619824
```

## 2025 Campaign Performance Summary

| Metric | Value |
|--------|-------|
| Total Spend | $8,167.52 |
| Total Purchases | 418 |
| Overall ROAS | 3.48x |
| Average CPA | $19.54 |
| Period | Jan-Mar 2025 |
| Markets | US + Australia |

### Top Performers (by ROAS)
1. **Multi-card Brock carousel** - 5.77x ROAS, $7.99 CPA (small sample, worth scaling)
2. **Static AD - Copy** - 4.04x ROAS, $15.64 CPA (top volume performer)
3. **TT VID - OG Copy** - 5.04x ROAS, $12.17 CPA (best video CPA)

### Creative Insights
- **Static ads outperform video** on ROAS (60% budget recommended)
- **Brown/warm tones** work best for static images
- **"I Choose You"** Pokemon reference resonates strongly
- **Audience expansion hooks** ("NOT a Pokemon fan? No problem!") widen reach

## Copy Patterns That Work

### Hooks
- "NOT a Pokemon fan? No problem!"
- "Warning: not just for Pokemon fans!"
- "Tired of the same old V-Day routine?"

### Urgency Phrases
- "Limited edition"
- "Shop now before they're gone"
- "Will you be their Valentine's Day hero?"

### Pokemon References
- "I choose you"
- "Catch their heart"
- "Shiny" (Pokemon terminology)

## Meta API Usage

### Pull Ad Performance
```bash
# Get all ads for account
curl -G "https://graph.facebook.com/v21.0/act_483311192619824/ads" \
  -d "fields=id,name,status,insights{spend,purchases,purchase_roas}" \
  -d "access_token=$FB_MARKETING_ACCESS_TOKEN"
```

### Pull Creative Copy
```bash
# Get ad creative details
curl -G "https://graph.facebook.com/v21.0/{creative_id}" \
  -d "fields=body,title,object_story_spec" \
  -d "access_token=$FB_MARKETING_ACCESS_TOKEN"
```

## Asset Preparation for Meta Ads

### Specifications
| Type | Dimensions | Format | Notes |
|------|------------|--------|-------|
| Static | 1080x1080 | PNG | Square format |
| Video | 1080x1920 | MP4 H.264 | Vertical/Stories |

### Freshness Checklist (before uploading to Meta)
1. Strip all metadata (EXIF, XMP, ICC profiles)
2. Re-encode videos to H.264 with `-movflags +faststart`
3. Use unique filenames (avoid "copy", "v2", etc.)
4. Verify resolution matches specs

### Metadata Stripping Commands
```bash
# Images (Python PIL)
from PIL import Image
img = Image.open("file.png")
clean = Image.new(img.mode, img.size)
clean.putdata(list(img.getdata()))
clean.save("file.png", optimize=True)

# Videos (FFmpeg)
ffmpeg -i input.mp4 -map_metadata -1 -c:v libx264 -c:a aac -movflags +faststart output.mp4
```

## TikTok Video Downloads

Use tikwm API (yt-dlp often blocked by TikTok):
```bash
VIDEO_ID="7456001773870828831"
curl -s "https://www.tikwm.com/api/?url=https://www.tiktok.com/@user/video/$VIDEO_ID" | \
  jq -r '.data.hdplay' | xargs curl -L -o video.mp4
```

## Updating the Source of Truth

When making campaign decisions or adding new winners:

1. Edit `/src/data/marketing-source-of-truth.json`
2. Update the `last_updated` field
3. Add decisions to `decisions_log` array:
```json
{
  "decisions_log": [
    {
      "date": "2026-01-23",
      "decision": "Scale multi-card Brock creative to $100/day",
      "rationale": "5.77x ROAS with lowest CPA, testing scalability"
    }
  ]
}
```

## 2026 Campaign Assets Ready

Three TikTok videos from @_liquidluckgaming downloaded and cleaned:
- `liquidluck_trainer_gift.mp4`
- `liquidluck_video2.mp4`
- `liquidluck_holographic.mp4`

All at 1080x1920, H.264, metadata stripped, faststart enabled.

## Common Tasks

### Create New Campaign
1. Review winners in source of truth
2. Select top-performing copy from copy_library
3. Prepare assets following META-AD-ASSET-GUIDE.md
4. Log decisions in decisions_log

### Analyze Performance
1. Pull latest data from Meta API
2. Compare against source of truth benchmarks
3. Update winners list if new top performers emerge

### Add New Creative
1. Download/create asset
2. Clean metadata per guide
3. Add to appropriate folder in ad-assets/
4. Update source of truth assets section
