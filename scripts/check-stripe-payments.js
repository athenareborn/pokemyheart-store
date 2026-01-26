#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('No STRIPE_SECRET_KEY found');
  process.exit(1);
}

const stripe = new Stripe(key);

async function check() {
  const weekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

  console.log('=== PAYMENT INTENTS (Last 7 Days) ===\n');

  const pis = await stripe.paymentIntents.list({
    limit: 50,
    created: { gte: weekAgo }
  });

  let succeeded = 0, failed = 0, abandoned = 0, pending = 0;

  for (const pi of pis.data) {
    const amt = '$' + (pi.amount / 100).toFixed(2);
    const date = new Date(pi.created * 1000).toLocaleDateString();

    if (pi.status === 'succeeded') {
      succeeded++;
      console.log(`✓ ${amt} - PAID (${date})`);
    } else if (pi.status === 'canceled') {
      abandoned++;
      console.log(`✗ ${amt} - ABANDONED (${date})`);
    } else if (pi.status === 'requires_payment_method') {
      failed++;
      const err = pi.last_payment_error;
      const msg = err?.message || 'No card entered';
      const code = err?.decline_code || '';
      console.log(`✗ ${amt} - FAILED: ${msg} ${code ? '(' + code + ')' : ''} (${date})`);
    } else {
      pending++;
      console.log(`? ${amt} - ${pi.status} (${date})`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Succeeded:', succeeded);
  console.log('Failed (card declined):', failed);
  console.log('Abandoned (no payment attempt):', abandoned);
  console.log('Pending/Other:', pending);

  // Check for charges with decline reasons
  console.log('\n=== RECENT DECLINES ===\n');

  const charges = await stripe.charges.list({
    limit: 20,
    created: { gte: weekAgo }
  });

  const declines = charges.data.filter(c => c.status === 'failed');
  if (declines.length === 0) {
    console.log('No declined charges found');
  } else {
    for (const c of declines) {
      console.log(`✗ $${(c.amount/100).toFixed(2)} - ${c.failure_message} (${c.failure_code})`);
    }
  }
}

check().catch(console.error);
