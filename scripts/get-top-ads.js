#!/usr/bin/env node

/**
 * Get Top Performing Ads
 *
 * Analyzes your Facebook ad campaigns and shows:
 * - Best performing ads by ROAS
 * - Best ads by CTR
 * - Best ads by conversions
 * - Ad spend and performance metrics
 */

require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');

const AdAccount = bizSdk.AdAccount;
const Ad = bizSdk.Ad;

const access_token = process.env.FB_MARKETING_ACCESS_TOKEN;
const ad_account_id = process.env.FB_AD_ACCOUNT_ID;

if (!access_token || !ad_account_id) {
  console.log('❌ Missing credentials. Run: node scripts/facebook-ads-setup.js');
  process.exit(1);
}

const api = bizSdk.FacebookAdsApi.init(access_token);

async function getTopAds() {
  console.log('\n🎯 Fetching your ad performance data...\n');

  try {
    const account = new AdAccount(ad_account_id);

    // Get ads from the last 90 days
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    const dateStart = ninetyDaysAgo.toISOString().split('T')[0];
    const dateEnd = today.toISOString().split('T')[0];

    const fields = [
      'id',
      'name',
      'adset_name',
      'campaign_name',
      'status',
    ];

    const params = {
      time_range: {
        since: dateStart,
        until: dateEnd,
      },
      level: 'ad',
      fields: [
        'ad_id',
        'ad_name',
        'adset_name',
        'campaign_name',
        'spend',
        'impressions',
        'clicks',
        'ctr',
        'cpc',
        'cpp',
        'actions',
        'action_values',
        'purchase_roas',
      ],
      limit: 100,
    };

    const insights = await account.getInsights([], params);

    if (!insights || insights.length === 0) {
      console.log('⚠️  No ad data found for the last 90 days');
      return;
    }

    // Process and sort ads
    const adsWithMetrics = insights.map(ad => {
      const purchases = ad.actions?.find(a => a.action_type === 'purchase')?.value || 0;
      const spend = parseFloat(ad.spend || 0);
      const roas = parseFloat(ad.purchase_roas?.[0]?.value || 0);
      const ctr = parseFloat(ad.ctr || 0);

      return {
        id: ad.ad_id,
        name: ad.ad_name,
        adset: ad.adset_name,
        campaign: ad.campaign_name,
        spend: spend,
        impressions: parseInt(ad.impressions || 0),
        clicks: parseInt(ad.clicks || 0),
        ctr: ctr,
        purchases: parseInt(purchases),
        roas: roas,
      };
    });

    // Sort by ROAS
    const byROAS = [...adsWithMetrics]
      .filter(ad => ad.roas > 0)
      .sort((a, b) => b.roas - a.roas);

    // Sort by CTR
    const byCTR = [...adsWithMetrics]
      .filter(ad => ad.ctr > 0)
      .sort((a, b) => b.ctr - a.ctr);

    // Sort by conversions
    const byConversions = [...adsWithMetrics]
      .filter(ad => ad.purchases > 0)
      .sort((a, b) => b.purchases - a.purchases);

    console.log('📊 TOP PERFORMING ADS (Last 90 Days)\n');

    console.log('🏆 BEST BY ROAS (Return on Ad Spend):');
    byROAS.slice(0, 5).forEach((ad, i) => {
      console.log(`\n${i + 1}. ${ad.name}`);
      console.log(`   Campaign: ${ad.campaign}`);
      console.log(`   ROAS: ${ad.roas.toFixed(2)}x`);
      console.log(`   Spend: $${ad.spend.toFixed(2)}`);
      console.log(`   Purchases: ${ad.purchases}`);
      console.log(`   Ad ID: ${ad.id}`);
    });

    console.log('\n\n🎯 BEST BY CTR (Click-Through Rate):');
    byCTR.slice(0, 5).forEach((ad, i) => {
      console.log(`\n${i + 1}. ${ad.name}`);
      console.log(`   Campaign: ${ad.campaign}`);
      console.log(`   CTR: ${ad.ctr.toFixed(2)}%`);
      console.log(`   Clicks: ${ad.clicks}`);
      console.log(`   Impressions: ${ad.impressions}`);
      console.log(`   Ad ID: ${ad.id}`);
    });

    console.log('\n\n💰 BEST BY CONVERSIONS:');
    byConversions.slice(0, 5).forEach((ad, i) => {
      console.log(`\n${i + 1}. ${ad.name}`);
      console.log(`   Campaign: ${ad.campaign}`);
      console.log(`   Purchases: ${ad.purchases}`);
      console.log(`   Spend: $${ad.spend.toFixed(2)}`);
      console.log(`   ROAS: ${ad.roas.toFixed(2)}x`);
      console.log(`   Ad ID: ${ad.id}`);
    });

    // Save to file
    const report = {
      generated: new Date().toISOString(),
      period: { start: dateStart, end: dateEnd },
      topByROAS: byROAS.slice(0, 10),
      topByCTR: byCTR.slice(0, 10),
      topByConversions: byConversions.slice(0, 10),
      allAds: adsWithMetrics,
    };

    const fs = require('fs');
    fs.writeFileSync(
      'facebook-ads-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n\n✅ Full report saved to: facebook-ads-report.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response);
    }
  }
}

getTopAds();
