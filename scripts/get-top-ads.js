#!/usr/bin/env node

/**
 * Get Top Performing Ads (Facebook Marketing API)
 *
 * Usage:
 *   node scripts/get-top-ads.js --days 90 --level ad --limit 100 --sort roas --format json
 *   node scripts/get-top-ads.js --since 2025-12-01 --until 2025-12-31 --format both
 *   node scripts/get-top-ads.js --min-spend 50 --sort cpa --level adset
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const bizSdk = require('facebook-nodejs-business-sdk')

const AdAccount = bizSdk.AdAccount

const access_token = process.env.FB_MARKETING_ACCESS_TOKEN
const ad_account_id = process.env.FB_AD_ACCOUNT_ID

if (!access_token || !ad_account_id) {
  console.log('❌ Missing credentials. Run: node scripts/facebook-ads-setup.js')
  process.exit(1)
}

bizSdk.FacebookAdsApi.init(access_token)

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i += 1
    }
  }
  return args
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function toNumber(value, fallback = 0) {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : fallback
}

function sumActionValue(actions, actionTypes) {
  if (!Array.isArray(actions)) return 0
  return actionTypes.reduce((sum, type) => {
    const found = actions.find((a) => a.action_type === type)
    return sum + toNumber(found?.value, 0)
  }, 0)
}

function escapeCsv(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows, columns) {
  const header = columns.join(',')
  const body = rows.map((row) => columns.map((col) => escapeCsv(row[col])).join(',')).join('\n')
  return `${header}\n${body}`
}

function printUsage() {
  console.log(`\nUsage:\n  node scripts/get-top-ads.js [options]\n\nOptions:\n  --days <n>           Look back n days (default: 90)\n  --since <YYYY-MM-DD> Start date\n  --until <YYYY-MM-DD> End date\n  --level <ad|adset|campaign> (default: ad)\n  --limit <n>          Max rows (default: 100)\n  --min-spend <n>      Filter rows with spend >= n\n  --sort <roas|purchases|ctr|spend|cpa> (default: roas)\n  --format <json|csv|both> (default: json)\n  --out <path>         Output base path (default: facebook-ads-report-<level>-<date>)\n  --help               Show this help\n`)
}

function getInsightFields(level) {
  const baseFields = [
    'spend',
    'impressions',
    'clicks',
    'ctr',
    'cpc',
    'cpp',
    'actions',
    'action_values',
    'purchase_roas',
  ]

  if (level === 'campaign') {
    return ['campaign_id', 'campaign_name', ...baseFields]
  }

  if (level === 'adset') {
    return ['adset_id', 'adset_name', 'campaign_name', ...baseFields]
  }

  return ['ad_id', 'ad_name', 'adset_name', 'campaign_name', ...baseFields]
}

function getLabelForRow(level, row) {
  if (level === 'campaign') {
    return { id: row.campaign_id, name: row.campaign_name }
  }

  if (level === 'adset') {
    return { id: row.adset_id, name: row.adset_name }
  }

  return { id: row.ad_id, name: row.ad_name }
}

async function getTopAds() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }

  const days = args.days ? parseInt(args.days, 10) : 90
  const level = args.level || 'ad'
  const limit = args.limit ? parseInt(args.limit, 10) : 100
  const minSpend = args['min-spend'] ? parseFloat(args['min-spend']) : 0
  const sortBy = args.sort || 'roas'
  const format = args.format || 'json'

  const today = new Date()
  const since = args.since ? new Date(args.since) : new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
  const until = args.until ? new Date(args.until) : today

  const dateStart = formatDate(since)
  const dateEnd = formatDate(until)

  const outputBase = args.out
    ? args.out.replace(/\.(json|csv)$/i, '')
    : `facebook-ads-report-${level}-${dateStart}-to-${dateEnd}`

  console.log(`\n🎯 Fetching Facebook Ads (${level})`)
  console.log(`   Range: ${dateStart} → ${dateEnd}`)
  console.log(`   Limit: ${limit} | Min spend: ${minSpend}`)

  try {
    const account = new AdAccount(ad_account_id)

    const fields = getInsightFields(level)
    const params = {
      time_range: { since: dateStart, until: dateEnd },
      level,
      limit,
    }

    const insights = await account.getInsights(fields, params)

    if (!insights || insights.length === 0) {
      console.log('⚠️  No ad data found for this range')
      return
    }

    const adsWithMetrics = insights.map((ad) => {
      const label = getLabelForRow(level, ad)
      const spend = toNumber(ad.spend)
      const impressions = parseInt(ad.impressions || 0, 10)
      const clicks = parseInt(ad.clicks || 0, 10)
      const ctr = toNumber(ad.ctr)
      const cpc = toNumber(ad.cpc)
      const cpp = toNumber(ad.cpp)

      const purchases = sumActionValue(ad.actions, ['purchase', 'omni_purchase'])
      const purchaseValue = sumActionValue(ad.action_values, ['purchase', 'omni_purchase'])
      const roasFromField = toNumber(ad.purchase_roas?.[0]?.value)
      const roas = roasFromField > 0
        ? roasFromField
        : (purchaseValue > 0 && spend > 0 ? purchaseValue / spend : 0)

      const cpa = purchases > 0 ? spend / purchases : 0
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0

      return {
        id: label.id,
        name: label.name,
        adset: ad.adset_name,
        campaign: ad.campaign_name,
        spend,
        impressions,
        clicks,
        ctr,
        cpc,
        cpp,
        cpm,
        purchases: Number(purchases),
        purchase_value: purchaseValue,
        roas,
        cpa,
      }
    })
      .filter((row) => row.spend >= minSpend)

    const sorters = {
      roas: (a, b) => b.roas - a.roas,
      purchases: (a, b) => b.purchases - a.purchases,
      ctr: (a, b) => b.ctr - a.ctr,
      spend: (a, b) => b.spend - a.spend,
      cpa: (a, b) => (a.cpa || Number.MAX_VALUE) - (b.cpa || Number.MAX_VALUE),
    }

    const sorter = sorters[sortBy] || sorters.roas
    const sorted = [...adsWithMetrics].sort(sorter)

    console.log('\n🏆 TOP PERFORMERS')
    sorted.slice(0, 5).forEach((ad, i) => {
      console.log(`\n${i + 1}. ${ad.name}`)
      console.log(`   Campaign: ${ad.campaign}`)
      console.log(`   Spend: $${ad.spend.toFixed(2)} | Purchases: ${ad.purchases}`)
      console.log(`   ROAS: ${ad.roas.toFixed(2)}x | CPA: $${ad.cpa ? ad.cpa.toFixed(2) : '—'}`)
      console.log(`   CTR: ${ad.ctr.toFixed(2)}% | CPM: $${ad.cpm.toFixed(2)}`)
      console.log(`   Ad ID: ${ad.id}`)
    })

    const report = {
      generated: new Date().toISOString(),
      period: { start: dateStart, end: dateEnd },
      level,
      minSpend,
      sortBy,
      top: sorted.slice(0, 10),
      all: adsWithMetrics,
    }

    if (format === 'json' || format === 'both') {
      const jsonPath = `${outputBase}.json`
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
      console.log(`\n✅ JSON report saved to: ${jsonPath}`)
    }

    if (format === 'csv' || format === 'both') {
      const csvPath = `${outputBase}.csv`
      const csvColumns = [
        'id',
        'name',
        'campaign',
        'adset',
        'spend',
        'purchases',
        'purchase_value',
        'roas',
        'cpa',
        'ctr',
        'cpc',
        'cpm',
        'clicks',
        'impressions',
      ]
      fs.writeFileSync(csvPath, toCsv(adsWithMetrics, csvColumns))
      console.log(`✅ CSV report saved to: ${csvPath}`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.response && error.response.error) {
      console.error('Details:', error.response.error)
    }
  }
}

getTopAds()
