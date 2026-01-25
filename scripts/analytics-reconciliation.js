#!/usr/bin/env node

/**
 * Analytics Reconciliation Report
 *
 * Compares Supabase orders/events/sessions with Meta Ads insights.
 * GA4/PostHog reporting requires additional API credentials and is reported as "not configured".
 *
 * Usage:
 *   node scripts/analytics-reconciliation.js --days 7
 *   node scripts/analytics-reconciliation.js --since 2025-02-01 --until 2025-02-07 --format both
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const bizSdk = require('facebook-nodejs-business-sdk')
const { createClient } = require('@supabase/supabase-js')

const AdAccount = bizSdk.AdAccount

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const FB_MARKETING_ACCESS_TOKEN = process.env.FB_MARKETING_ACCESS_TOKEN
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID

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

function parseDate(value, fallback) {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed
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

function percentDelta(current, baseline) {
  if (!baseline) return null
  return ((current - baseline) / baseline) * 100
}

function printUsage() {
  console.log(`\nUsage:\n  node scripts/analytics-reconciliation.js [options]\n\nOptions:\n  --days <n>           Look back n days (default: 7)\n  --since <YYYY-MM-DD> Start date\n  --until <YYYY-MM-DD> End date\n  --format <json|csv|both> (default: json)\n  --out <path>         Output base path (default: analytics-recon-<start>-to-<end>)\n  --help               Show this help\n`)
}

async function fetchSupabase(startISO, endISO) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)')
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id,total,created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  if (ordersError) throw ordersError

  const { data: events, error: eventsError } = await supabase
    .from('analytics_events')
    .select('event_type,created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  if (eventsError) throw eventsError

  const { data: sessions, error: sessionsError } = await supabase
    .from('analytics_sessions')
    .select('id,started_checkout,added_to_cart,viewed_product,completed_purchase,started_at')
    .gte('started_at', startISO)
    .lte('started_at', endISO)

  if (sessionsError) throw sessionsError

  const orderCount = orders?.length || 0
  const revenueCents = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  const eventCounts = (events || []).reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1
    return acc
  }, {})

  const sessionCount = sessions?.length || 0
  const sessionPurchases = sessions?.filter(s => s.completed_purchase).length || 0
  const sessionCheckouts = sessions?.filter(s => s.started_checkout).length || 0
  const sessionAdds = sessions?.filter(s => s.added_to_cart).length || 0
  const sessionViews = sessions?.filter(s => s.viewed_product).length || 0

  return {
    orders: {
      count: orderCount,
      revenue_cents: revenueCents,
      revenue_usd: Number((revenueCents / 100).toFixed(2)),
    },
    events: {
      page_view: eventCounts.page_view || 0,
      product_view: eventCounts.product_view || 0,
      add_to_cart: eventCounts.add_to_cart || 0,
      checkout_start: eventCounts.checkout_start || 0,
      purchase: eventCounts.purchase || 0,
    },
    sessions: {
      total: sessionCount,
      viewed_product: sessionViews,
      added_to_cart: sessionAdds,
      started_checkout: sessionCheckouts,
      completed_purchase: sessionPurchases,
      conversion_rate: sessionCount > 0 ? Number(((sessionPurchases / sessionCount) * 100).toFixed(2)) : 0,
    },
  }
}

async function fetchMetaInsights(startDate, endDate) {
  if (!FB_MARKETING_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
    return { status: 'skipped', reason: 'Missing FB_MARKETING_ACCESS_TOKEN or FB_AD_ACCOUNT_ID' }
  }

  bizSdk.FacebookAdsApi.init(FB_MARKETING_ACCESS_TOKEN)
  const account = new AdAccount(FB_AD_ACCOUNT_ID)

  const params = {
    time_range: { since: startDate, until: endDate },
    level: 'account',
  }

  const fields = ['spend', 'actions', 'action_values', 'purchase_roas', 'impressions', 'clicks']

  try {
    const insights = await account.getInsights(fields, params)
    if (!insights || insights.length === 0) {
      return { status: 'no_data' }
    }

    const aggregated = insights.reduce((acc, row) => {
      acc.spend += toNumber(row.spend)
      acc.impressions += parseInt(row.impressions || 0, 10)
      acc.clicks += parseInt(row.clicks || 0, 10)
      acc.purchases += sumActionValue(row.actions, ['purchase', 'omni_purchase'])
      acc.purchase_value += sumActionValue(row.action_values, ['purchase', 'omni_purchase'])
      return acc
    }, { spend: 0, impressions: 0, clicks: 0, purchases: 0, purchase_value: 0 })

    const roas = aggregated.spend > 0 ? aggregated.purchase_value / aggregated.spend : 0

    return {
      status: 'ok',
      spend: Number(aggregated.spend.toFixed(2)),
      impressions: aggregated.impressions,
      clicks: aggregated.clicks,
      purchases: Number(aggregated.purchases),
      purchase_value: Number(aggregated.purchase_value.toFixed(2)),
      roas: Number(roas.toFixed(2)),
    }
  } catch (error) {
    return {
      status: 'error',
      reason: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }

  const days = args.days ? parseInt(args.days, 10) : 7
  const format = args.format || 'json'

  const now = new Date()
  const defaultStart = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000)

  const since = parseDate(args.since ? `${args.since}T00:00:00Z` : null, defaultStart)
  const until = parseDate(args.until ? `${args.until}T23:59:59Z` : null, now)

  const dateStart = formatDate(since)
  const dateEnd = formatDate(until)
  const outputBase = args.out
    ? args.out.replace(/\.(json|csv)$/i, '')
    : `analytics-recon-${dateStart}-to-${dateEnd}`

  console.log(`\nAnalytics Reconciliation`)
  console.log(`   Range: ${dateStart} -> ${dateEnd}`)

  const [supabaseSummary, metaSummary] = await Promise.all([
    fetchSupabase(since.toISOString(), until.toISOString()),
    fetchMetaInsights(dateStart, dateEnd),
  ])

  const discrepancies = {
    orders_vs_events_purchase: {
      delta: supabaseSummary.orders.count - supabaseSummary.events.purchase,
      percent: percentDelta(supabaseSummary.orders.count, supabaseSummary.events.purchase),
    },
    orders_vs_sessions_purchase: {
      delta: supabaseSummary.orders.count - supabaseSummary.sessions.completed_purchase,
      percent: percentDelta(supabaseSummary.orders.count, supabaseSummary.sessions.completed_purchase),
    },
  }

  if (metaSummary.status === 'ok') {
    discrepancies.meta_purchases_vs_orders = {
      delta: supabaseSummary.orders.count - metaSummary.purchases,
      percent: percentDelta(supabaseSummary.orders.count, metaSummary.purchases),
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    period: {
      start: dateStart,
      end: dateEnd,
      timezone: 'UTC',
    },
    supabase: supabaseSummary,
    meta: metaSummary,
    ga4: {
      status: 'not_configured',
      reason: 'GA4 Data API not configured. GA_API_SECRET only sends events; it does not allow reporting.',
    },
    posthog: {
      status: 'not_configured',
      reason: 'PostHog reporting API key not set. Add POSTHOG_API_KEY to enable server-side reconciliation.',
    },
    discrepancies,
  }

  if (format === 'json' || format === 'both') {
    fs.writeFileSync(`${outputBase}.json`, JSON.stringify(report, null, 2))
    console.log(`OK: JSON report saved to ${outputBase}.json`)
  }

  if (format === 'csv' || format === 'both') {
    const rows = [
      ['metric', 'value'],
      ['orders_count', report.supabase.orders.count],
      ['orders_revenue_usd', report.supabase.orders.revenue_usd],
      ['events_purchase', report.supabase.events.purchase],
      ['sessions_completed_purchase', report.supabase.sessions.completed_purchase],
      ['meta_status', report.meta.status],
      ['meta_purchases', report.meta.purchases || 0],
      ['meta_purchase_value', report.meta.purchase_value || 0],
    ]
    const csv = rows.map(row => row.join(',')).join('\n')
    fs.writeFileSync(`${outputBase}.csv`, csv)
    console.log(`OK: CSV report saved to ${outputBase}.csv`)
  }

  console.log('\nSummary')
  console.log(`- Orders: ${report.supabase.orders.count} ($${report.supabase.orders.revenue_usd})`)
  console.log(`- Purchases (events): ${report.supabase.events.purchase}`)
  console.log(`- Purchases (sessions): ${report.supabase.sessions.completed_purchase}`)
  if (report.meta.status === 'ok') {
    console.log(`- Meta purchases: ${report.meta.purchases} (ROAS ${report.meta.roas}x)`)
  } else {
    console.log(`- Meta: ${report.meta.status}`)
  }
}

run().catch((error) => {
  console.error('ERROR: analytics reconciliation failed:', error.message || error)
  process.exit(1)
})
