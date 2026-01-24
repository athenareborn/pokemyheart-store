#!/usr/bin/env node
/**
 * Add the new Google Ads winner video as a separate ad
 * Creates a NEW ad set since DCO ad sets only allow 1 ad
 * Video already uploaded: 885739280665984
 */

require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');

const ACCESS_TOKEN = process.env.FB_MARKETING_ACCESS_TOKEN;
const AD_ACCOUNT_ID = 'act_483311192619824';
const CAMPAIGN_ID = '120241180475110096';
const PAGE_ID = '543079702223019';
const PIXEL_ID = '3852621344992629';
const VIDEO_ID = '885739280665984';
const LANDING_URL = 'https://www.ultrararelove.com/products/i-choose-you-the-ultimate-valentines-gift?bundle=love-pack';

if (!ACCESS_TOKEN) {
  console.error('ERROR: FB_MARKETING_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

const Api = bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);
const AdAccount = bizSdk.AdAccount;
const AdSet = bizSdk.AdSet;
const AdCreative = bizSdk.AdCreative;
const Ad = bizSdk.Ad;

async function main() {
  try {
    const account = new AdAccount(AD_ACCOUNT_ID);

    // Step 1: Create a new ad set for this video (DCO = 1 ad per ad set)
    console.log('Creating new ad set for G Ads Winner video...');

    const adSet = await account.createAdSet([], {
      name: 'Video - G Ads Winner',
      campaign_id: CAMPAIGN_ID,
      status: 'ACTIVE',
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      is_dynamic_creative: true,
      targeting: {
        geo_locations: {
          countries: ['US']
        },
        age_min: 18,
        age_max: 65
      },
      promoted_object: {
        pixel_id: PIXEL_ID,
        custom_event_type: 'PURCHASE'
      },
      attribution_spec: [
        { event_type: 'CLICK_THROUGH', window_days: 7 },
        { event_type: 'VIEW_THROUGH', window_days: 1 }
      ]
    });

    console.log('Ad set created:', adSet.id);

    // Step 2: Create creative
    console.log('Creating creative...');

    const creative = await account.createAdCreative([], {
      name: 'Video Winner - Remember the Thrill (G Ads Winner)',
      asset_feed_spec: {
        videos: [
          { video_id: VIDEO_ID }
        ],
        bodies: [
          { text: "They don't have to be a Pokémon fan to love this card—it's shiny, thoughtful, and so romantic! The perfect Valentine's Day surprise. Limited edition—shop now!" },
          { text: "NOT a Pokémon fan? No problem! This shiny, romantic card is for anyone who loves love. Limited edition - will you be their Valentine's Day hero? Shop now and make it unforgettable!" },
          { text: "Catch their heart this Valentine's Day with a one-of-a-kind Pokémon-inspired trading card! Perfect for fans and collectors, this holographic card combines nostalgia and romance in a thoughtful, limited-edition gift. Order now—available only for a short time!" },
          { text: "Looking for the perfect Valentine's gift? Surprise your Pokémon-loving partner with this one-of-a-kind gift! Exclusive, romantic, and designed to impress—get yours before it's gone!" },
          { text: "This Valentine's, don't settle for ordinary—get the ultimate Pokémon-inspired card for someone special. Limited edition, stunning holographic finish. Order now before they're all gone!" }
        ],
        titles: [
          { text: "The Perfect Valentine's Gift for Pokémon Lovers!" },
          { text: "Catch Their Heart this Valentine's Day" },
          { text: "One-of-a-Kind Valentine's Gift" },
          { text: "Limited Edition Valentine's Gift" },
          { text: "Limited Edition Heartstealer" }
        ],
        descriptions: [
          { text: "Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone!" },
          { text: "Unique Pokémon-inspired Valentine's card with holographic shine. Limited edition—shop now before it's gone! Made in the USA!" }
        ],
        ad_formats: ['SINGLE_VIDEO'],
        call_to_action_types: ['ORDER_NOW'],
        link_urls: [
          { website_url: LANDING_URL }
        ]
      },
      object_story_spec: {
        page_id: PAGE_ID
      }
    });

    console.log('Creative created:', creative.id);

    // Step 3: Create ad
    console.log('Creating ad...');

    const ad = await account.createAd([], {
      name: 'Video - G Ads Winner (Remember the Thrill)',
      adset_id: adSet.id,
      creative: { creative_id: creative.id },
      status: 'ACTIVE'
    });

    console.log('Ad created:', ad.id);
    console.log('\n✅ Success! New video ad set added to campaign.');
    console.log('Ad Set ID:', adSet.id);
    console.log('Creative ID:', creative.id);
    console.log('Ad ID:', ad.id);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

main();
