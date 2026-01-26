#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const bizSdk = require('facebook-nodejs-business-sdk');

const ACCESS_TOKEN = process.env.FB_MARKETING_ACCESS_TOKEN || process.env.FB_CONVERSIONS_API_TOKEN;
const CAMPAIGN_ID = '120241180475110096';

bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);
const Campaign = bizSdk.Campaign;
const AdSet = bizSdk.AdSet;

async function main() {
  try {
    const campaign = new Campaign(CAMPAIGN_ID);

    // Get campaign status
    const campaignData = await campaign.read(['name', 'status', 'effective_status', 'daily_budget']);
    console.log('=== CAMPAIGN ===');
    console.log('Name:', campaignData.name);
    console.log('Status:', campaignData.status);
    console.log('Effective Status:', campaignData.effective_status);

    // Get insights
    const insights = await campaign.getInsights(['spend', 'impressions', 'clicks', 'ctr', 'cpc', 'actions', 'cost_per_action_type', 'purchase_roas'], {
      date_preset: 'today'
    });

    if (insights.length > 0) {
      const data = insights[0];
      console.log('\n=== TODAY ===');
      console.log('Spend: $' + (parseFloat(data.spend) || 0).toFixed(2));
      console.log('Impressions:', data.impressions || 0);
      console.log('Clicks:', data.clicks || 0);
      console.log('CTR:', (parseFloat(data.ctr) || 0).toFixed(2) + '%');

      if (data.actions) {
        const purchases = data.actions.find(a => a.action_type === 'purchase');
        if (purchases) console.log('Purchases:', purchases.value);
      }
      if (data.cost_per_action_type) {
        const cpa = data.cost_per_action_type.find(a => a.action_type === 'purchase');
        if (cpa) console.log('CPA: $' + parseFloat(cpa.value).toFixed(2));
      }
      if (data.purchase_roas) {
        const roas = data.purchase_roas.find(a => a.action_type === 'omni_purchase');
        if (roas) console.log('ROAS:', parseFloat(roas.value).toFixed(2) + 'x');
      }
    } else {
      console.log('\nNo data yet (campaign may be new or paused)');
    }

    // Get ad set breakdown
    console.log('\n=== AD SETS ===');
    const adSets = await campaign.getAdSets(['name', 'status', 'effective_status']);
    for (const adSet of adSets) {
      console.log(`\n${adSet.name}`);
      console.log('  Status:', adSet.effective_status);

      const asInsights = await new AdSet(adSet.id).getInsights(['spend', 'impressions', 'actions'], { date_preset: 'today' });
      if (asInsights.length > 0) {
        const d = asInsights[0];
        const purchases = d.actions?.find(a => a.action_type === 'purchase');
        console.log('  Spend: $' + (parseFloat(d.spend) || 0).toFixed(2));
        console.log('  Impressions:', d.impressions || 0);
        if (purchases) console.log('  Purchases:', purchases.value);
      } else {
        console.log('  No delivery yet');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
