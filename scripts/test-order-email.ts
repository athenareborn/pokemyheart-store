// Run with: npx tsx scripts/test-order-email.ts your@email.com

import { config } from 'dotenv'
config({ path: '.env.local' })

import { sendOrderConfirmation } from '../src/lib/email'

const testEmail = process.argv[2]

if (!testEmail) {
  console.error('Usage: npx tsx scripts/test-order-email.ts your@email.com')
  process.exit(1)
}

console.log(`Sending test order confirmation to ${testEmail}...`)

sendOrderConfirmation({
  orderNumber: 'PMH-042',
  customerEmail: testEmail,
  customerName: 'Sarah Johnson',
  items: [
    {
      bundle_name: '2-Card Bundle',
      bundle_id: 'bundle-2',
      design_name: 'Eternal Love',
      design_id: 'design-1',
      quantity: 1,
      price: 5999,
    },
  ],
  subtotal: 5999,
  shipping: 0,
  total: 5999,
  shippingAddress: {
    name: 'Sarah Johnson',
    line1: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    postal_code: '62701',
    country: 'US',
  },
})
  .then((result) => {
    if (result.success) {
      console.log('Email sent successfully!')
      console.log('Check your inbox (and spam folder)')
    } else {
      console.error('Failed to send:', result.error)
    }
  })
  .catch((err) => {
    console.error('Error:', err)
  })
