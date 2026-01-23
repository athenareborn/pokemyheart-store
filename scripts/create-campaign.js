#!/usr/bin/env node

/**
 * Create Facebook Ad Campaign
 *
 * Creates a complete ad campaign with:
 * - Campaign
 * - Ad Set (with targeting)
 * - Ad Creative (video/image)
 * - Ad
 */

require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');
const readline = require('readline');
const fs = require('fs');

const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const AdSet = bizSdk.AdSet;
const AdCreative = bizSdk.AdCreative;
const Ad = bizSdk.Ad;
const AdVideo = bizSdk.AdVideo;

const access_token = process.env.FB_MARKETING_ACCESS_TOKEN;
const ad_account_id = process.env.FB_AD_ACCOUNT_ID;
const fb_page_id = process.env.FB_PAGE_ID || ''; // Add this to your .env

if (!access_token || !ad_account_id) {
  console.log('❌ Missing credentials. Run: node scripts/facebook-ads-setup.js');
  process.exit(1);
}

const api = bizSdk.FacebookAdsApi.init(access_token);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createCampaign() {
  console.log('\n🚀 Create Valentine\'s Day Campaign\n');

  const campaignName = await question('Campaign Name (e.g., "Valentine 2026 - Video Ads"): ');
  const dailyBudget = await question('Daily Budget in cents (e.g., 5000 = $50): ');
  const videoPath = await question('Video file path (e.g., ~/Desktop/pokemyheart_vday_2026_fresh.mp4): ');

  if (!fs.existsSync(videoPath.replace('~', process.env.HOME))) {
    console.log('❌ Video file not found');
    process.exit(1);
  }

  console.log('\n📝 Targeting Options:');
  const minAge = await question('Minimum age (default: 18): ') || '18';
  const maxAge = await question('Maximum age (default: 65): ') || '65';
  const genders = await question('Gender (1=Male, 2=Female, 0=All, default: 0): ') || '0';
  const countries = await question('Countries (comma-separated, e.g., US,CA,GB, default: US): ') || 'US';

  console.log('\n🎯 Creating campaign...');

  try {
    const account = new AdAccount(ad_account_id);

    // Step 1: Create Campaign
    console.log('1️⃣ Creating campaign...');
    const campaign = await account.createCampaign([], {
      name: campaignName,
      objective: 'OUTCOME_SALES',
      status: 'PAUSED', // Start paused for safety
      special_ad_categories: [],
    });

    console.log(`✅ Campaign created: ${campaign.id}`);

    // Step 2: Create Ad Set
    console.log('2️⃣ Creating ad set...');

    const targeting = {
      age_min: parseInt(minAge),
      age_max: parseInt(maxAge),
      geo_locations: {
        countries: countries.split(',').map(c => c.trim()),
      },
    };

    if (genders !== '0') {
      targeting.genders = [parseInt(genders)];
    }

    // Add interest targeting for Pokemon/gaming/romance
    targeting.flexible_spec = [
      {
        interests: [
          { id: '6003139266461', name: 'Pokemon' },
          { id: '6003056083857', name: 'Valentine\'s Day' },
          { id: '6003020834693', name: 'Online shopping' },
        ],
      },
    ];

    const adset = await account.createAdSet([], {
      name: `${campaignName} - AdSet 1`,
      campaign_id: campaign.id,
      daily_budget: dailyBudget,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      promoted_object: {
        pixel_id: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
        custom_event_type: 'PURCHASE',
      },
      targeting: targeting,
      status: 'PAUSED',
    });

    console.log(`✅ Ad Set created: ${adset.id}`);

    // Step 3: Upload Video
    console.log('3️⃣ Uploading video...');
    const fullVideoPath = videoPath.replace('~', process.env.HOME);

    const video = await account.createAdVideo([], {
      file_url: fullVideoPath,
      name: `${campaignName} - Video`,
    });

    console.log(`✅ Video uploaded: ${video.id}`);

    // Step 4: Create Ad Creative
    console.log('4️⃣ Creating ad creative...');

    const creative = await account.createAdCreative([], {
      name: `${campaignName} - Creative`,
      object_story_spec: {
        video_data: {
          video_id: video.id,
          message: `💝 Say "I Choose You" this Valentine's Day!\n\n✨ Premium holographic cards that capture your love forever\n🎁 Perfect gift for your special someone\n🚚 Free shipping on orders $35+\n\nShop now at ultrararelove.com`,
          call_to_action: {
            type: 'SHOP_NOW',
            value: {
              link: 'https://www.ultrararelove.com/products/i-choose-you-the-ultimate-valentines-gift',
            },
          },
        },
        page_id: fb_page_id,
      },
      degrees_of_freedom_spec: {
        creative_features_spec: {
          standard_enhancements: {
            enroll_status: 'OPT_IN',
          },
        },
      },
    });

    console.log(`✅ Creative created: ${creative.id}`);

    // Step 5: Create Ad
    console.log('5️⃣ Creating ad...');

    const ad = await account.createAd([], {
      name: `${campaignName} - Ad 1`,
      adset_id: adset.id,
      creative: { creative_id: creative.id },
      status: 'PAUSED',
    });

    console.log(`✅ Ad created: ${ad.id}`);

    console.log('\n\n🎉 SUCCESS! Campaign created:\n');
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Ad Set ID: ${adset.id}`);
    console.log(`Ad ID: ${ad.id}`);
    console.log('\n⚠️  Campaign is PAUSED. Review in Ads Manager then activate.');
    console.log(`View in Ads Manager: https://business.facebook.com/adsmanager/manage/campaigns?act=${ad_account_id.replace('act_', '')}`);

    // Save campaign info
    const campaignInfo = {
      created: new Date().toISOString(),
      campaign_id: campaign.id,
      adset_id: adset.id,
      ad_id: ad.id,
      creative_id: creative.id,
      video_id: video.id,
      name: campaignName,
      daily_budget: dailyBudget,
      targeting: targeting,
    };

    fs.writeFileSync(
      `campaign-${Date.now()}.json`,
      JSON.stringify(campaignInfo, null, 2)
    );

    console.log(`\n📄 Campaign details saved to: campaign-${Date.now()}.json`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response && error.response.error) {
      console.error('Details:', error.response.error);
    }
  }

  rl.close();
}

createCampaign();
