# Meta Ad Asset Preparation Guide

Complete guide for preparing fresh, optimized ad assets that maximize reach on Meta platforms (Facebook, Instagram, Reels, Stories).

---

## Table of Contents

1. [Why Fresh Assets Matter](#why-fresh-assets-matter)
2. [The "Freshness" Checklist](#the-freshness-checklist)
3. [Image Specifications](#image-specifications)
4. [Video Specifications](#video-specifications)
5. [Metadata Stripping](#metadata-stripping)
6. [Making Assets "Fresh" for Meta](#making-assets-fresh-for-meta)
7. [Filename Best Practices](#filename-best-practices)
8. [Downloading TikTok/Social Videos](#downloading-tiktouksocial-videos)
9. [Quick Reference Commands](#quick-reference-commands)
10. [Troubleshooting](#troubleshooting)

---

## Why Fresh Assets Matter

Meta's algorithm treats "fresh" creative differently:

1. **New creatives get exploration budget** - Meta allocates extra impressions to test new ads
2. **Duplicate detection** - Meta fingerprints assets; re-uploading the same file can trigger duplicate detection
3. **Quality scoring** - Assets with metadata, low resolution, or compression artifacts score lower
4. **Competitor protection** - Metadata can leak your tools, templates, or strategies

**Bottom line:** Clean, properly formatted assets = better reach, lower CPMs, more consistent delivery.

---

## The "Freshness" Checklist

Before uploading ANY asset to Meta:

### Images
- [ ] Resolution is 1080x1080 (1:1) or 1080x1350 (4:5) minimum
- [ ] File format is PNG or JPG (PNG preferred for graphics)
- [ ] File size under 30MB (aim for under 5MB)
- [ ] All metadata stripped (EXIF, XMP, ICC profiles except sRGB)
- [ ] No watermarks, logos from other platforms
- [ ] Filename is clean (no spaces, special characters)
- [ ] Color profile is sRGB

### Videos
- [ ] Resolution is 1080x1920 (9:16) for Reels/Stories, 1080x1080 (1:1) for Feed
- [ ] Codec is H.264 (NOT HEVC/H.265 - some devices don't support it)
- [ ] Audio codec is AAC
- [ ] Frame rate is 30fps (60fps acceptable but larger files)
- [ ] All metadata stripped
- [ ] `faststart` flag enabled (moov atom at beginning)
- [ ] File size under 4GB (aim for under 100MB)
- [ ] No TikTok/Instagram watermarks
- [ ] Filename is clean

---

## Image Specifications

### Recommended Specs by Placement

| Placement | Aspect Ratio | Resolution | Format |
|-----------|--------------|------------|--------|
| Feed (Square) | 1:1 | 1080x1080 | PNG/JPG |
| Feed (Vertical) | 4:5 | 1080x1350 | PNG/JPG |
| Stories/Reels | 9:16 | 1080x1920 | PNG/JPG |
| Carousel | 1:1 | 1080x1080 | PNG/JPG |

### Image Quality Tips

1. **Export at 2x** - Design at 2160x2160, export at 1080x1080 for crisp edges
2. **Use PNG for graphics** - Text, logos, flat colors compress better
3. **Use JPG for photos** - Natural images compress smaller
4. **Avoid gradients** - Can cause banding after Meta's compression
5. **High contrast text** - Meta re-compresses; ensure text remains readable

### Color Profile

Always export in **sRGB**. Other profiles (Adobe RGB, ProPhoto) can cause color shifts.

```bash
# Check color profile
exiftool -ColorSpace -ProfileDescription image.png

# Convert to sRGB (ImageMagick)
convert input.png -colorspace sRGB -strip output.png
```

---

## Video Specifications

### Recommended Specs

| Spec | Requirement | Notes |
|------|-------------|-------|
| **Resolution** | 1080x1920 (9:16) | For Reels/Stories |
| **Codec** | H.264 | HEVC has compatibility issues |
| **Audio** | AAC, 128kbps+ | Mono or Stereo |
| **Frame Rate** | 30fps | 60fps for fast motion |
| **Bitrate** | 8-12 Mbps | Higher = better quality |
| **Duration** | 15-60 sec | Under 15 for Stories |
| **Container** | MP4 | Not MOV, AVI, etc. |

### Video Quality Hierarchy

Best to worst quality for same file size:

1. **CRF 18** - Visually lossless, larger files
2. **CRF 20-22** - Excellent quality, good balance
3. **CRF 23** - Default, good quality
4. **CRF 25+** - Noticeable quality loss

### The faststart Flag

**Critical for web delivery.** Moves metadata to the beginning of the file so playback can start before full download.

```bash
# Always include -movflags +faststart
ffmpeg -i input.mp4 -movflags +faststart output.mp4
```

---

## Metadata Stripping

### What Metadata to Remove

| Type | Contains | Risk |
|------|----------|------|
| **EXIF** | Camera, GPS, date, device | Privacy leak |
| **XMP** | Software (Photoshop, Canva) | Competitor intel |
| **ICC Profile** | Color profile | Keep sRGB only |
| **Thumbnails** | Embedded previews | File bloat |
| **IPTC** | Copyright, author | Usually fine to remove |
| **Video metadata** | Encoder, creation date | Fingerprinting |

### Strip Image Metadata (Python)

```python
from PIL import Image

def strip_metadata(filepath):
    img = Image.open(filepath)
    data = list(img.getdata())
    clean = Image.new(img.mode, img.size)
    clean.putdata(data)
    clean.save(filepath, optimize=True)

# Usage
strip_metadata("ad-image.png")
```

### Strip Video Metadata (FFmpeg)

```bash
# Copy streams, strip metadata
ffmpeg -i input.mp4 -map_metadata -1 -c copy output.mp4

# Full re-encode with optimal settings
ffmpeg -i input.mp4 \
  -map_metadata -1 \
  -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

### Verify Metadata Removed

```bash
# Images
exiftool image.png  # Should show minimal data

# Videos
ffprobe -v quiet -print_format json -show_format video.mp4
# Check "tags" section is empty/minimal
```

---

## Making Assets "Fresh" for Meta

Beyond metadata, these techniques help assets appear "fresh" to Meta's systems:

### 1. Slight Modifications

Even tiny changes create a new file hash:

```bash
# Trim 1 frame from start
ffmpeg -i input.mp4 -ss 0.033 -c copy output.mp4

# Slight color adjustment (imperceptible)
ffmpeg -i input.mp4 -vf "eq=brightness=0.01" -c:a copy output.mp4

# Add 1 pixel transparent border (images)
convert input.png -bordercolor transparent -border 1x1 output.png
```

### 2. Re-encode (Don't Just Copy)

```bash
# Creates entirely new file structure
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 18 \
  -c:a aac \
  output.mp4
```

### 3. Change Container

```bash
# MOV to MP4 (re-mux)
ffmpeg -i input.mov -c copy output.mp4
```

### 4. Unique Filenames

Each upload should have a unique filename:

```bash
# Good
liquidluck_trainer_v2_jan2026.mp4
pokemon_vday_1080x1920_final.mp4

# Bad
video.mp4
final_final_v3.mp4
```

### 5. Batch Freshening Script

```bash
#!/bin/bash
# freshen-assets.sh - Make assets fresh for Meta

for f in *.mp4; do
    base="${f%.mp4}"
    ffmpeg -y -i "$f" \
        -map_metadata -1 \
        -c:v libx264 -crf 18 -preset slow \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "${base}_fresh.mp4"
    echo "Freshened: $f"
done
```

---

## Filename Best Practices

### Do
- Use lowercase
- Use underscores or hyphens (not spaces)
- Include version/date
- Be descriptive

### Don't
- Use spaces
- Use special characters (!@#$%^&*)
- Use very long names (>50 chars)
- Use generic names (video1.mp4)

### Good Examples
```
pokemon_vday_trainer_gift_v1.mp4
brown_static_anniversary_1080x1080.png
liquidluck_holographic_jan2026.mp4
```

### Batch Rename Script
```bash
# Remove spaces, lowercase, add date
for f in *.mp4; do
    new=$(echo "$f" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
    mv "$f" "${new%.mp4}_$(date +%Y%m%d).mp4"
done
```

---

## Downloading TikTok/Social Videos

### Method 1: tikwm API (Recommended - 2026)

Works without authentication, returns no-watermark HD video:

```python
import urllib.request
import json

def download_tiktok(video_id, output_path):
    api = f"https://www.tikwm.com/api/?url=https://www.tiktok.com/@user/video/{video_id}&hd=1"
    req = urllib.request.Request(api, headers={"User-Agent": "Mozilla/5.0"})

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8', errors='replace'))

    video_url = data['data'].get('hdplay') or data['data']['play']

    req = urllib.request.Request(video_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        with open(output_path, 'wb') as f:
            f.write(resp.read())

# Usage
download_tiktok("7456001773870828831", "video.mp4")
```

### Method 2: yt-dlp with curl-cffi

```bash
# Install
pip install "yt-dlp[default,curl-cffi]"

# Download
yt-dlp --impersonate chrome "https://www.tiktok.com/@user/video/123"
```

### Method 3: Web Tools (Manual)

- **SnapTik**: https://snaptik.app
- **SSSTik**: https://ssstik.io
- **TikMate**: https://tikmate.app

### Post-Download Processing

TikTok videos are usually HEVC. Convert to H.264 for Meta:

```bash
ffmpeg -i tiktok_video.mp4 \
  -map_metadata -1 \
  -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  tiktok_video_clean.mp4
```

---

## Quick Reference Commands

### Check Asset Specs
```bash
# Image dimensions and format
file image.png
identify image.png  # ImageMagick

# Video specs
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,codec_name,r_frame_rate \
  -of csv=p=0 video.mp4
```

### Strip Metadata
```bash
# Image (Python)
python3 -c "from PIL import Image; img=Image.open('i.png'); Image.new(img.mode, img.size).putdata(list(img.getdata())).save('i.png')"

# Video (copy, no re-encode)
ffmpeg -i in.mp4 -map_metadata -1 -c copy out.mp4
```

### Convert to Meta-Optimal
```bash
# Video: Full optimization
ffmpeg -i input.mp4 \
  -map_metadata -1 \
  -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4

# Image: Strip + optimize
convert input.png -strip -quality 95 output.png
```

### Convert MOV to MP4
```bash
ffmpeg -i input.MOV \
  -map_metadata -1 \
  -c:v libx264 -c:a aac \
  -movflags +faststart \
  output.mp4
```

### Verify Clean
```bash
# Check video metadata
ffprobe -v quiet -print_format json -show_format video.mp4 | grep -A20 '"tags"'

# Check image metadata
exiftool image.png
```

---

## Troubleshooting

### "Video won't upload to Meta"
1. Check codec: `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name video.mp4`
2. If HEVC, convert to H.264
3. Check file size (under 4GB)
4. Ensure faststart: re-run ffmpeg with `-movflags +faststart`

### "Image looks different after upload"
1. Export in sRGB color profile
2. Avoid fine gradients
3. Use PNG for graphics with text
4. Expect some compression - design for it

### "Low reach/delivery"
1. Try freshening the asset (re-encode)
2. Change filename
3. Slight modification (trim frame, adjust brightness 1%)
4. Check aspect ratio matches placement

### "yt-dlp TikTok not working"
1. Update: `pip install --upgrade "yt-dlp[default,curl-cffi]"`
2. Use tikwm API instead
3. Use web tools (SnapTik, SSSTik)

### "Video quality degraded after processing"
1. Use lower CRF (18 instead of 23)
2. Use `-preset slow` or `-preset veryslow`
3. Don't re-encode multiple times
4. Keep source files, only re-encode once

---

## Complete Processing Pipeline

```bash
#!/bin/bash
# process-ad-assets.sh

INPUT_DIR="./raw"
OUTPUT_DIR="./ready"
mkdir -p "$OUTPUT_DIR"

# Process videos
for f in "$INPUT_DIR"/*.{mp4,mov,MOV}; do
    [ -f "$f" ] || continue
    base=$(basename "${f%.*}" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')

    ffmpeg -y -i "$f" \
        -map_metadata -1 \
        -c:v libx264 -crf 18 -preset slow \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "$OUTPUT_DIR/${base}_$(date +%Y%m%d).mp4"

    echo "✓ Processed: $f"
done

# Process images
for f in "$INPUT_DIR"/*.{png,jpg,jpeg,PNG,JPG}; do
    [ -f "$f" ] || continue
    base=$(basename "${f%.*}" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
    ext="${f##*.}"

    python3 << PYEOF
from PIL import Image
img = Image.open("$f")
data = list(img.getdata())
clean = Image.new(img.mode, img.size)
clean.putdata(data)
clean.save("$OUTPUT_DIR/${base}_$(date +%Y%m%d).${ext,,}", optimize=True)
PYEOF

    echo "✓ Processed: $f"
done

echo "Done! Assets ready in $OUTPUT_DIR"
```

---

## Summary: The 60-Second Checklist

Before every upload:

1. **Resolution** - 1080x1920 (video) or 1080x1080 (image) minimum
2. **Codec** - H.264 for video, PNG/JPG for images
3. **Metadata** - Stripped
4. **faststart** - Enabled (video)
5. **Filename** - Clean, unique, descriptive
6. **Watermarks** - None
7. **Fresh** - Re-encoded, not copied from previous campaign

---

*Guide created: January 2026*
*Last updated: January 2026*
