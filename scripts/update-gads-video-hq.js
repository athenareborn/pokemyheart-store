#!/usr/bin/env node
/**
 * Upload HQ video and update the G Ads Winner ad
 */

require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.FB_MARKETING_ACCESS_TOKEN;
const AD_ACCOUNT_ID = 'act_483311192619824';
const AD_SET_ID = '120241204953890096';
const OLD_AD_ID = '120241204955700096';
const PAGE_ID = '543079702223019';
const LANDING_URL = 'https://www.ultrararelove.com/products/i-choose-you-the-ultimate-valentines-gift?bundle=love-pack';
const VIDEO_PATH = 'ad-assets/2025-winners/video-ads/remember-the-thrill-winner-hq.mp4';

if (!ACCESS_TOKEN) {
  console.error('ERROR: FB_MARKETING_ACCESS_TOKEN not found');
  process.exit(1);
}

bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);
const AdAccount = bizSdk.AdAccount;
const AdVideo = bizSdk.AdVideo;
const Ad = bizSdk.Ad;

async function main() {
  try {
    const account = new AdAccount(AD_ACCOUNT_ID);

    // Step 1: Upload HQ video
    console.log('Uploading HQ video to Meta...');
    const videoFile = fs.readFileSync(path.resolve(VIDEO_PATH));

    const video = await account.createAdVideo([], {
      name: 'G Ads Winner - Remember the Thrill (HQ)',
      source: videoFile
    });

    console.log('Video uploaded:', video.id);

    // Wait for video to process
    console.log('Waiting for video processing...');
    await new Promise(r => setTimeout(r, 10000));

    // Step 2: Delete old ad
    console.log('Removing old ad...');
    const oldAd = new Ad(OLD_AD_ID);
    await oldAd.delete();
    console.log('Old ad deleted');

    // Step 3: Create new creative with HQ video
    console.log('Creating creative with HQ video...');
    const creative = await account.createAdCreative([], {
      name: 'Video Winner - Remember the Thrill HQ',
      asset_feed_spec: {
        videos: [
          { video_id: video.id }
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

    // Step 4: Create new ad
    console.log('Creating new ad...');
    const ad = await account.createAd([], {
      name: 'Video - G Ads Winner (Remember the Thrill) HQ',
      adset_id: AD_SET_ID,
      creative: { creative_id: creative.id },
      status: 'ACTIVE'
    });

    console.log('\n✅ Done! Updated to HQ video.');
    console.log('New Video ID:', video.id);
    console.log('New Creative ID:', creative.id);
    console.log('New Ad ID:', ad.id);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

main();
