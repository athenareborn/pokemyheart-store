#!/usr/bin/env node

/**
 * Facebook Marketing API Setup Script
 *
 * This script helps you:
 * 1. Get your access token
 * 2. Find your ad account ID
 * 3. Test the connection
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 Facebook Marketing API Setup\n');
  console.log('Step 1: Get your Access Token');
  console.log('Go to: https://developers.facebook.com/tools/explorer');
  console.log('1. Select your App (or create one)');
  console.log('2. Click "Generate Access Token"');
  console.log('3. Select permissions: ads_read, ads_management, business_management\n');

  const accessToken = await question('Paste your Access Token (starts with EAAA...): ');

  if (!accessToken || !accessToken.startsWith('EAAA')) {
    console.log('❌ Invalid token. Please try again.');
    process.exit(1);
  }

  console.log('\nStep 2: Get your Ad Account ID');
  console.log('Go to: https://business.facebook.com/settings/ad-accounts\n');

  const adAccountId = await question('Paste your Ad Account ID (e.g., act_123456789): ');

  if (!adAccountId || !adAccountId.startsWith('act_')) {
    console.log('❌ Invalid Ad Account ID. Should start with "act_"');
    process.exit(1);
  }

  // Test connection
  console.log('\n🔍 Testing connection...');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.0/${adAccountId}?fields=name,currency&access_token=${accessToken}`
    );

    const data = await response.json();

    if (data.error) {
      console.log('❌ Error:', data.error.message);
      process.exit(1);
    }

    console.log('✅ Connected successfully!');
    console.log(`   Account Name: ${data.name}`);
    console.log(`   Currency: ${data.currency}`);

    // Save to .env.local
    const envPath = path.join(__dirname, '../.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (!envContent.includes('FB_MARKETING_ACCESS_TOKEN')) {
      envContent += `\nFB_MARKETING_ACCESS_TOKEN="${accessToken}"`;
    } else {
      envContent = envContent.replace(
        /FB_MARKETING_ACCESS_TOKEN=.*/,
        `FB_MARKETING_ACCESS_TOKEN="${accessToken}"`
      );
    }

    if (!envContent.includes('FB_AD_ACCOUNT_ID')) {
      envContent += `\nFB_AD_ACCOUNT_ID="${adAccountId}"`;
    } else {
      envContent = envContent.replace(
        /FB_AD_ACCOUNT_ID=.*/,
        `FB_AD_ACCOUNT_ID="${adAccountId}"`
      );
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Credentials saved to .env.local');
    console.log('\nYou can now run:');
    console.log('  node scripts/get-top-ads.js     - Get your best performing ads');
    console.log('  node scripts/create-campaign.js - Create a new campaign');

  } catch (error) {
    console.log('❌ Error testing connection:', error.message);
    process.exit(1);
  }

  rl.close();
}

setup();
