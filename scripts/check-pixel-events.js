#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');

const PIXEL_ID = '3852621344992629';
const AD_ACCOUNT_ID = 'act_483311192619824';
const ACCESS_TOKEN = process.env.FB_MARKETING_ACCESS_TOKEN || process.env.FB_CONVERSIONS_API_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('ERROR: FB_MARKETING_ACCESS_TOKEN not found');
  process.exit(1);
}

bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);
const AdsPixel = bizSdk.AdsPixel;
const AdAccount = bizSdk.AdAccount;

async function checkPixel() {
  console.log('=== PIXEL VERIFICATION ===\n');

  try {
    // 1. Check pixel basic info
    const pixel = new AdsPixel(PIXEL_ID);
    const pixelData = await pixel.read(['name', 'last_fired_time', 'is_unavailable']);

    console.log('Pixel Name:', pixelData.name);
    console.log('Last Fired:', pixelData.last_fired_time || 'Unknown');
    console.log('Is Unavailable:', pixelData.is_unavailable ? 'YES ⚠️' : 'No ✓');

  } catch (e) {
    console.log('Pixel check failed:', e.message);
  }

  // 2. Check ad account insights for conversion events
  console.log('\n=== TODAY\'S CONVERSION EVENTS ===\n');

  try {
    const account = new AdAccount(AD_ACCOUNT_ID);
    const insights = await account.getInsights(['actions', 'action_values'], {
      date_preset: 'today',
      level: 'account'
    });

    if (insights.length > 0 && insights[0].actions) {
      const actions = insights[0].actions;

      // Key events to check
      const events = [
        'landing_page_view',
        'view_content',
        'add_to_cart',
        'initiate_checkout',
        'purchase'
      ];

      events.forEach(eventType => {
        const action = actions.find(a => a.action_type === eventType);
        const status = action ? '✓' : '—';
        const count = action?.value || 0;
        console.log(`${status} ${eventType}: ${count}`);
      });

      // Check for omni_purchase (includes all conversion types)
      const omniPurchase = actions.find(a => a.action_type === 'omni_purchase');
      if (omniPurchase) {
        console.log(`\n✓ omni_purchase (total): ${omniPurchase.value}`);
      }

    } else {
      console.log('No conversion events recorded today');
    }

  } catch (e) {
    console.log('Insights check failed:', e.message);
  }

  // 3. Check last 7 days for broader view
  console.log('\n=== LAST 7 DAYS PURCHASES ===\n');

  try {
    const account = new AdAccount(AD_ACCOUNT_ID);
    const insights = await account.getInsights(['actions', 'spend'], {
      date_preset: 'last_7d',
      level: 'account'
    });

    if (insights.length > 0) {
      const data = insights[0];
      const purchases = data.actions?.find(a => a.action_type === 'purchase');

      console.log('Spend: $' + (parseFloat(data.spend) || 0).toFixed(2));
      console.log('Purchases: ' + (purchases?.value || 0));

      if (purchases?.value > 0) {
        console.log('\n✓ Pixel IS firing Purchase events');
      } else {
        console.log('\n⚠️ No Purchase events in last 7 days');
      }
    }

  } catch (e) {
    console.log('7-day check failed:', e.message);
  }
}

checkPixel();
