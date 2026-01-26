#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check() {
  const pis = await stripe.paymentIntents.list({ limit: 100 });

  console.log('=== PAYMENT INTENTS BY DATE ===\n');
  console.log('Campaign went live: ~Jan 24-25, 2026\n');

  // Group by date
  const byDate = {};

  for (const pi of pis.data) {
    const date = new Date(pi.created * 1000);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = date.toTimeString().split(' ')[0].slice(0,5); // HH:MM

    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }

    byDate[dateStr].push({
      amount: pi.amount / 100,
      status: pi.status,
      time,
      email: pi.receipt_email || pi.metadata?.customer_email || '-',
      ip: pi.metadata?.client_ip || '-'
    });
  }

  // Sort dates descending
  const sortedDates = Object.keys(byDate).sort().reverse();

  for (const date of sortedDates) {
    const items = byDate[date];
    const succeeded = items.filter(i => i.status === 'succeeded').length;
    const failed = items.filter(i => i.status === 'requires_payment_method').length;

    console.log(`=== ${date} === (${succeeded} paid, ${failed} abandoned)`);

    for (const item of items) {
      const emoji = item.status === 'succeeded' ? '✓' : '✗';
      const statusShort = item.status === 'succeeded' ? 'PAID' :
                          item.status === 'requires_payment_method' ? 'NO CARD' : item.status;
      console.log(`  ${emoji} $${item.amount.toFixed(2)} @ ${item.time} - ${statusShort} - ${item.email}`);
    }
    console.log('');
  }
}

check().catch(console.error);
