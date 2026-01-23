/**
 * Valentine's Day 2026 Campaign Creator
 *
 * Creates an Advantage+ Sales campaign on Meta with:
 * - 3 proven static images from 2025
 * - 5 copy variants
 * - US targeting only
 * - $150/day budget
 *
 * Usage: node scripts/create-vday-2026-campaign.js
 */

require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');
const fs = require('fs');
const path = require('path');

const accessToken = process.env.FB_MARKETING_ACCESS_TOKEN;
const adAccountId = process.env.FB_AD_ACCOUNT_ID || 'act_483311192619824';

// Initialize SDK
const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const AdSet = bizSdk.AdSet;
const Ad = bizSdk.Ad;
const AdCreative = bizSdk.AdCreative;
const AdImage = bizSdk.AdImage;

// Campaign Config
const CONFIG = {
  campaignName: 'VDAY 2026 - US',
  adSetName: 'US Broad - Advantage+',
  dailyBudget: 15000, // $150/day in cents

  // Landing page
  websiteUrl: 'https://pokemyhe.art/products/i-choose-you-the-ultimate-romantic-gift?variant=51026517754172',

  // Images (relative to project root)
  images: [
    'ad-assets/2026-campaign/static/fresh/winner-say-i-choose-you_20260123.png',
    'ad-assets/2026-campaign/static/fresh/winner-giftbox_20260123.png',
    'ad-assets/2026-campaign/static/fresh/winner-ultimate-valentine_20260123.png',
  ],

  // Copy variants
  bodies: [
    // Copy A - Audience Expansion
    `They don't have to be a Pokémon fan to love this card—it's shiny, thoughtful, and so romantic! The perfect Valentine's Day surprise.

Limited edition—shop now before they're gone!`,

    // Copy B - Warning Hook
    `Warning: not just for Pokémon fans!

This limited edition card is so shiny, thoughtful & romantic... it's the perfect Valentine's Day surprise! Will you be their hero this year?

Shop now before they're gone!`,

    // Copy C - Nostalgia
    `Catch their heart this Valentine's Day with a one-of-a-kind Pokémon-inspired trading card!

Perfect for fans and collectors, this holographic card combines nostalgia and romance.

Order now—available only for a short time!`,

    // Copy D - Problem-Aware
    `Tired of the same old V-Day routine? Skip the flowers and chocolate.

This holographic card is the gift they'll actually remember.

Limited edition—order before they're gone!`,

    // Copy E - Gift-Giver
    `Your partner won't shut up about Pokémon? Get them a Valentine's gift they'll actually freak out over.

This holographic trading card looks like the real thing—but it says "I choose you" and it's meant for them.

Limited edition. Shop now before they sell out.`,
  ],

  headlines: [
    'The Perfect Valentine\'s Gift for Pokémon Lovers!',
    'Catch Their Heart Now',
    'Limited Edition Valentine\'s Gift',
    'One-of-a-Kind Valentine\'s Gift',
    'Shiny Valentine\'s Day Surprise',
  ],

  description: 'Unique Pokémon-inspired Valentine\'s card with holographic shine. Limited edition—shop now before it\'s gone! Made in the USA!',
};

async function uploadImages(account) {
  console.log('📸 Uploading images...');
  const imageHashes = [];

  for (const imagePath of CONFIG.images) {
    const fullPath = path.join(process.cwd(), imagePath);
    const imageData = fs.readFileSync(fullPath).toString('base64');
    const fileName = path.basename(imagePath);

    try {
      const image = await account.createAdImage([], {
        bytes: imageData,
        name: fileName,
      });

      const hash = image._data.images[fileName].hash;
      imageHashes.push(hash);
      console.log(`  ✓ Uploaded: ${fileName} (hash: ${hash})`);
    } catch (error) {
      console.error(`  ✗ Failed to upload ${fileName}:`, error.message);
    }
  }

  return imageHashes;
}

async function createCampaign(account) {
  console.log('🚀 Creating campaign...');

  const campaign = await account.createCampaign([], {
    name: CONFIG.campaignName,
    objective: 'OUTCOME_SALES',
    status: 'PAUSED', // Start paused for review
    special_ad_categories: [],
  });

  console.log(`  ✓ Campaign created: ${campaign.id}`);
  return campaign;
}

async function createAdSet(account, campaignId) {
  console.log('📦 Creating ad set...');

  const adSet = await account.createAdSet([], {
    name: CONFIG.adSetName,
    campaign_id: campaignId,
    status: 'PAUSED',
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'OFFSITE_CONVERSIONS',
    daily_budget: CONFIG.dailyBudget,
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',

    // US only targeting
    targeting: {
      geo_locations: {
        countries: ['US'],
      },
      age_min: 18,
      age_max: 65,
      publisher_platforms: ['facebook', 'instagram'],
      facebook_positions: ['feed', 'video_feeds', 'story', 'reels'],
      instagram_positions: ['stream', 'story', 'reels', 'explore'],
    },

    // Conversion tracking
    promoted_object: {
      pixel_id: process.env.FB_PIXEL_ID,
      custom_event_type: 'PURCHASE',
    },
  });

  console.log(`  ✓ Ad set created: ${adSet.id}`);
  return adSet;
}

async function createAds(account, adSetId, imageHashes) {
  console.log('📝 Creating ads...');

  const adCombinations = [
    { imageIndex: 0, bodyIndex: 0, headlineIndex: 0, name: 'Static 1 - Audience Expansion' },
    { imageIndex: 1, bodyIndex: 1, headlineIndex: 1, name: 'Static 2 - Warning Hook' },
    { imageIndex: 2, bodyIndex: 2, headlineIndex: 2, name: 'Static 3 - Nostalgia' },
    { imageIndex: 0, bodyIndex: 3, headlineIndex: 3, name: 'Static 1 - Problem-Aware' },
    { imageIndex: 1, bodyIndex: 4, headlineIndex: 4, name: 'Static 2 - Gift-Giver' },
  ];

  for (const combo of adCombinations) {
    try {
      // Create creative
      const creative = await account.createAdCreative([], {
        name: `VDAY 2026 - ${combo.name}`,
        object_story_spec: {
          page_id: process.env.FB_PAGE_ID,
          link_data: {
            image_hash: imageHashes[combo.imageIndex],
            link: CONFIG.websiteUrl,
            message: CONFIG.bodies[combo.bodyIndex],
            name: CONFIG.headlines[combo.headlineIndex],
            description: CONFIG.description,
            call_to_action: {
              type: 'ORDER_NOW',
            },
          },
        },
      });

      // Create ad
      const ad = await account.createAd([], {
        name: `VDAY 2026 - ${combo.name}`,
        adset_id: adSetId,
        creative: { creative_id: creative.id },
        status: 'PAUSED',
      });

      console.log(`  ✓ Ad created: ${combo.name} (${ad.id})`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${combo.name}:`, error.message);
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   VALENTINE\'S DAY 2026 CAMPAIGN CREATOR');
  console.log('═══════════════════════════════════════════════');
  console.log(`Ad Account: ${adAccountId}`);
  console.log(`Daily Budget: $${CONFIG.dailyBudget / 100}`);
  console.log('');

  try {
    const account = new AdAccount(adAccountId);

    // Step 1: Upload images
    const imageHashes = await uploadImages(account);
    if (imageHashes.length === 0) {
      throw new Error('No images uploaded');
    }

    // Step 2: Create campaign
    const campaign = await createCampaign(account);

    // Step 3: Create ad set
    const adSet = await createAdSet(account, campaign.id);

    // Step 4: Create ads
    await createAds(account, adSet.id, imageHashes);

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ CAMPAIGN CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Ad Set ID: ${adSet.id}`);
    console.log('');
    console.log('⚠️  Campaign is PAUSED. Review in Ads Manager and activate when ready.');
    console.log(`   https://business.facebook.com/adsmanager/manage/campaigns?act=${adAccountId.replace('act_', '')}`);

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('If this fails, use the manual setup guide:');
    console.error('  ad-assets/2026-campaign/CAMPAIGN-SETUP-MANUAL.md');
    process.exit(1);
  }
}

main();
