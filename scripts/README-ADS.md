# Facebook Ads Management Scripts

Automate your Facebook ad campaigns with these scripts!

## Setup (Do This First!)

### Step 1: Run the setup script

```bash
cd /Users/atzarakis/Documents/pokemyheart-store
node scripts/facebook-ads-setup.js
```

This will guide you through:
1. Getting your Facebook Marketing API access token
2. Finding your ad account ID
3. Testing the connection
4. Saving credentials to `.env.local`

### Step 2: Add your Facebook Page ID

Edit `.env.local` and add:
```
FB_PAGE_ID="your_page_id_here"
```

To find your Page ID:
1. Go to your Facebook Page
2. Click "About"
3. Scroll to "Page ID" or check the URL

---

## Available Commands

### 1. Get Top Performing Ads

Analyze your best ads from the last 90 days:

```bash
node scripts/get-top-ads.js
```

**What it shows:**
- ✅ Top 5 ads by ROAS (Return on Ad Spend)
- ✅ Top 5 ads by CTR (Click-Through Rate)
- ✅ Top 5 ads by Conversions
- ✅ Full metrics: spend, impressions, clicks, purchases

**Output:** `facebook-ads-report.json` with all data

---

### 2. Create New Campaign

Create a complete ad campaign with video:

```bash
node scripts/create-campaign.js
```

**What it does:**
1. Creates a new campaign
2. Sets up ad set with targeting
3. Uploads your video
4. Creates ad creative
5. Creates the ad

**You'll be asked for:**
- Campaign name
- Daily budget
- Video file path (use the processed video!)
- Targeting options (age, gender, countries)

**Campaign starts PAUSED** so you can review before activating!

---

## Example Workflow

### Reuse Last Year's Winning Ad

1. **Process the video** (already done!):
   ```bash
   # Video ready at: ~/Desktop/pokemyheart_vday_2026_fresh.mp4
   ```

2. **Check last year's performance**:
   ```bash
   node scripts/get-top-ads.js
   ```
   Look for your winning ad and note its metrics

3. **Create new campaign**:
   ```bash
   node scripts/create-campaign.js
   ```
   - Campaign Name: "Valentine 2026 - Video Relaunch"
   - Daily Budget: 5000 (= $50/day)
   - Video: ~/Desktop/pokemyheart_vday_2026_fresh.mp4
   - Keep targeting similar to last year

4. **Review & Activate**:
   - Open Ads Manager
   - Review the campaign
   - Click "Activate" when ready!

---

## Troubleshooting

### "Missing credentials" error
Run setup again: `node scripts/facebook-ads-setup.js`

### "Invalid token" error
Token may have expired. Generate a new one:
1. Go to https://developers.facebook.com/tools/explorer
2. Generate new token with same permissions
3. Run setup again

### "Permission denied" error
Make sure your token has these permissions:
- `ads_read`
- `ads_management`
- `business_management`

---

## Tips

- Start with a small daily budget ($20-50) to test
- Run ads for 3-7 days before optimizing
- Keep winning ads running, pause losers
- Test multiple creatives with same video
- Monitor ROAS - aim for 2.5x+ minimum

---

## Need Help?

Check the Facebook Marketing API docs:
https://developers.facebook.com/docs/marketing-api
