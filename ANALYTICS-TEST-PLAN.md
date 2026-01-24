# Analytics Testing Plan - Production Launch Checklist

Complete testing plan for Pokemyheart analytics stack before Valentine's Day launch.

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Dev server running
npm run dev

# 2. Required environment variables (check all present)
echo $NEXT_PUBLIC_FB_PIXEL_ID
echo $FB_CONVERSIONS_API_TOKEN
echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
echo $GA_API_SECRET
echo $NEXT_PUBLIC_POSTHOG_KEY
```

### Testing Tools Needed
- [ ] Facebook Events Manager (https://business.facebook.com/events_manager)
- [ ] Facebook Test Events tab
- [ ] Google Analytics 4 Real-Time reports (https://analytics.google.com)
- [ ] Google Tag Assistant Chrome extension
- [ ] Meta Pixel Helper Chrome extension
- [ ] PostHog dashboard (https://app.posthog.com)
- [ ] Supabase dashboard (analytics_events table)
- [ ] Browser DevTools Network tab
- [ ] Incognito/Private browser window

---

## PHASE 1: Environment & Configuration Validation

### 1.1 Environment Variables Check
| Variable | Required | Test |
|----------|----------|------|
| `NEXT_PUBLIC_FB_PIXEL_ID` | Yes | Should be numeric (e.g., `123456789012345`) |
| `FB_CONVERSIONS_API_TOKEN` | Yes | Should start with `EAA...` |
| `FB_TEST_EVENT_CODE` | Testing only | Format: `TEST12345` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Yes | Format: `G-XXXXXXXXXX` |
| `GA_API_SECRET` | Yes | Alphanumeric string |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | Format: `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | URL format |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | URL format |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | JWT format |

**Test Command:**
```bash
# Run from project root
node -e "
const vars = [
  'NEXT_PUBLIC_FB_PIXEL_ID',
  'FB_CONVERSIONS_API_TOKEN',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'GA_API_SECRET',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];
vars.forEach(v => {
  const val = process.env[v];
  console.log(v + ': ' + (val ? '✅ SET (' + val.substring(0,10) + '...)' : '❌ MISSING'));
});
"
```

### 1.2 Script Loading Verification
- [ ] Open site in incognito browser
- [ ] Open DevTools → Network tab
- [ ] Verify these scripts load:
  - [ ] `connect.facebook.net/en_US/fbevents.js` (FB Pixel)
  - [ ] `www.googletagmanager.com/gtag/js?id=G-...` (GA4)
  - [ ] PostHog script from `NEXT_PUBLIC_POSTHOG_HOST`

### 1.3 Global Objects Available
Open DevTools Console and verify:
```javascript
// FB Pixel
typeof window.fbq === 'function' // Should be true
window.fbq.version // Should show version

// GA4
typeof window.gtag === 'function' // Should be true
window.dataLayer // Should be array with events

// PostHog
typeof window.posthog === 'object' // Should be true
window.posthog.get_distinct_id() // Should return ID
```

---

## PHASE 2: Facebook Pixel Testing (Client-Side)

### 2.1 PageView Event
**Test Steps:**
1. Open Facebook Pixel Helper extension
2. Navigate to homepage
3. Verify `PageView` fires

**Expected in Pixel Helper:**
- Event: `PageView`
- Pixel ID: matches `NEXT_PUBLIC_FB_PIXEL_ID`

**Expected in FB Events Manager → Test Events:**
- Event received within 30 seconds
- Source: Browser (client-side)

### 2.2 ViewContent Event
**Test Steps:**
1. Navigate to product page (`/product/heartstealer-card`)
2. Check Pixel Helper

**Expected:**
- Event: `ViewContent`
- Parameters:
  - `content_ids`: Product ID array
  - `content_type`: `product`
  - `content_name`: Product name
  - `value`: Product price
  - `currency`: `USD`

### 2.3 AddToCart Event
**Test Steps:**
1. On product page, select variant
2. Click "Add to Cart" button
3. Check Pixel Helper

**Expected:**
- Event: `AddToCart`
- Parameters:
  - `content_ids`: Selected variant ID
  - `content_type`: `product`
  - `value`: Price
  - `currency`: `USD`
  - `content_name`: Product + variant name

### 2.4 InitiateCheckout Event
**Test Steps:**
1. With items in cart, proceed to checkout
2. Check Pixel Helper on checkout page

**Expected:**
- Event: `InitiateCheckout`
- Parameters:
  - `content_ids`: All cart item IDs
  - `value`: Cart total
  - `currency`: `USD`
  - `num_items`: Item count

### 2.5 Purchase Event (Client-Side)
**Test Steps:**
1. Complete test purchase (use Stripe test card `4242 4242 4242 4242`)
2. Land on success page
3. Check Pixel Helper

**Expected:**
- Event: `Purchase`
- Parameters:
  - `content_ids`: Purchased item IDs
  - `value`: Order total
  - `currency`: `USD`
  - `content_type`: `product`
  - `order_id`: Order ID (for deduplication)

---

## PHASE 3: Facebook Conversions API Testing (Server-Side)

### 3.1 Enable Test Mode
Set environment variable:
```bash
FB_TEST_EVENT_CODE=TEST12345  # Get from FB Events Manager → Test Events
```

### 3.2 API Endpoint Health Check
```bash
curl -X POST http://localhost:3000/api/analytics/fb-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "PageView",
    "eventId": "test-'$(date +%s)'",
    "userData": {
      "email": "test@example.com"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "eventsReceived": 1
}
```

### 3.3 Purchase Event via CAPI
```bash
curl -X POST http://localhost:3000/api/analytics/fb-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Purchase",
    "eventId": "test-purchase-'$(date +%s)'",
    "eventData": {
      "value": 59.99,
      "currency": "USD",
      "content_ids": ["heartstealer-bundle-2"],
      "content_type": "product",
      "order_id": "TEST-001"
    },
    "userData": {
      "email": "test@example.com",
      "phone": "+14155551234",
      "firstName": "Test",
      "lastName": "User",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "US"
    }
  }'
```

### 3.4 Verify in FB Events Manager
1. Go to Events Manager → Test Events
2. Find the test purchase event
3. Verify:
   - [ ] Event received
   - [ ] Event Match Quality score (aim for >7/10)
   - [ ] User data parameters present (hashed)
   - [ ] Custom data (value, currency) correct

### 3.5 Event Deduplication Test
**Purpose:** Ensure same event isn't counted twice

**Test Steps:**
1. Generate a unique event ID: `test-dedup-123`
2. Send via client-side pixel (manually in console):
```javascript
fbq('track', 'Purchase', {
  value: 59.99,
  currency: 'USD',
  content_ids: ['test-product']
}, { eventID: 'test-dedup-123' });
```

3. Send same event via CAPI with same eventId
4. Check FB Events Manager → Overview

**Expected:**
- Only 1 event counted (deduplicated)
- Both sources visible in event details

---

## PHASE 4: Google Analytics 4 Testing (Client-Side)

### 4.1 PageView Event
**Test Steps:**
1. Install Google Tag Assistant extension
2. Enable Tag Assistant recording
3. Navigate to homepage

**Expected in GA4 Real-Time:**
- Users: 1
- Page: / (homepage)

### 4.2 view_item Event
**Test Steps:**
1. Navigate to product page
2. Check Tag Assistant for `view_item` event

**Expected Parameters:**
- `currency`: USD
- `value`: product price
- `items[]`: Array with product details
  - `item_id`
  - `item_name`
  - `price`
  - `quantity`

### 4.3 add_to_cart Event
**Test Steps:**
1. Add product to cart
2. Check Tag Assistant

**Expected:**
- Event: `add_to_cart`
- Items array with added product

### 4.4 begin_checkout Event
**Test Steps:**
1. Proceed to checkout
2. Check Tag Assistant

**Expected:**
- Event: `begin_checkout`
- Items array with all cart items
- `value`: cart total

### 4.5 purchase Event
**Test Steps:**
1. Complete test purchase
2. Check GA4 Real-Time → Events

**Expected:**
- Event: `purchase`
- `transaction_id`: order ID
- `value`: order total
- `currency`: USD
- `items[]`: purchased items

### 4.6 Enhanced Conversions Verification
In GA4 Admin → Data Streams → Web → Enhanced Measurement:
- [ ] Enhanced conversions enabled
- [ ] User-provided data collection enabled

---

## PHASE 5: Google Analytics 4 Server-Side (Measurement Protocol)

### 5.1 Debug Endpoint Test
```bash
curl -X POST "https://www.google-analytics.com/debug/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client-123",
    "events": [{
      "name": "purchase",
      "params": {
        "transaction_id": "TEST-MP-001",
        "value": 59.99,
        "currency": "USD",
        "items": [{
          "item_id": "heartstealer-bundle-2",
          "item_name": "Heartstealer Bundle",
          "quantity": 1,
          "price": 59.99
        }]
      }
    }]
  }'
```

**Expected Response:**
```json
{
  "validationMessages": []
}
```

Empty `validationMessages` = valid payload.

### 5.2 Live Server-Side Event
Test via internal API (if implemented):
```bash
curl -X POST http://localhost:3000/api/analytics/ga4-server \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "purchase",
    "clientId": "test-123",
    "transactionId": "TEST-SERVER-001",
    "value": 59.99,
    "items": [{"item_id": "test", "item_name": "Test", "quantity": 1, "price": 59.99}],
    "userData": {
      "email": "test@example.com"
    }
  }'
```

---

## PHASE 6: PostHog Testing

### 6.1 Initialization Check
```javascript
// In browser console
window.posthog.get_distinct_id() // Should return string
window.posthog.get_session_id() // Should return string
```

### 6.2 Session Recording
**Test Steps:**
1. Navigate through site (home → product → cart → checkout)
2. Wait 2-3 minutes
3. Check PostHog → Recordings

**Expected:**
- [ ] New recording appears
- [ ] All page views visible in recording
- [ ] Clicks captured
- [ ] Console logs visible (if enabled)
- [ ] No PII visible in replay

### 6.3 Autocapture Events
**Test Steps:**
1. Check PostHog → Events
2. Filter by last hour

**Expected Events:**
- `$pageview` - Page navigation
- `$pageleave` - Page exit
- `$autocapture` - Button clicks
- `$rageclick` - Frustration clicks (if any)

### 6.4 Session Properties
In PostHog → Persons, find your session:
- [ ] `$initial_referrer` captured
- [ ] `$initial_utm_source` (if applicable)
- [ ] `$device_type` correct
- [ ] `$browser` correct
- [ ] `$os` correct

---

## PHASE 7: Custom Supabase Analytics Testing

### 7.1 Session Creation
**Test Steps:**
1. Open new incognito window
2. Navigate to site
3. Check Supabase → `analytics_sessions` table

**Expected:**
- New session row created
- `session_id` populated
- `visitor_id` populated
- `started_at` = now
- `landing_page` = first page visited
- `device_type` = correct (desktop/mobile/tablet)

### 7.2 Event Tracking
**Test Steps:**
1. Navigate to product page
2. Add to cart
3. Check Supabase → `analytics_events` table

**Expected Events:**
- `page_view` with page_path
- `product_view` with product data
- `add_to_cart` with cart data

### 7.3 Session Funnel Flags
**Test Steps:**
1. Complete full funnel (view → cart → checkout → purchase)
2. Check session row in `analytics_sessions`

**Expected Flags (all true):**
- [ ] `viewed_product`
- [ ] `added_to_cart`
- [ ] `started_checkout`
- [ ] `completed_purchase`

### 7.4 UTM Attribution
**Test Steps:**
1. Open incognito
2. Navigate with UTM: `/?utm_source=test&utm_medium=cpc&utm_campaign=launch`
3. Check session in Supabase

**Expected:**
- `utm_source`: test
- `utm_medium`: cpc
- `utm_campaign`: launch

### 7.5 API Endpoint Test
```bash
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test_event",
    "event_data": {"test": true},
    "session_id": "test-session-123",
    "visitor_id": "test-visitor-123",
    "page_path": "/test"
  }'
```

**Expected:** 200 OK, event in database

---

## PHASE 8: Attribution & Identity Testing

### 8.1 Facebook Click ID (fbc) Capture
**Test Steps:**
1. Simulate FB click by visiting: `/?fbclid=fb.1.1234567890.abcdef123456`
2. Check localStorage:
```javascript
localStorage.getItem('_fbc')
```

**Expected:**
- `_fbc` value stored
- Format: `fb.1.{timestamp}.{fbclid}`

### 8.2 Facebook Browser ID (fbp) Capture
**Test Steps:**
1. Visit site (pixel sets cookie)
2. Wait for pixel to initialize
3. Check:
```javascript
document.cookie.match(/_fbp=([^;]+)/)
localStorage.getItem('_fbp')
```

**Expected:**
- `_fbp` cookie set by pixel
- Value also stored in localStorage

### 8.3 Identity Persistence
**Test Steps:**
1. Note visitor_id from localStorage
2. Close browser completely
3. Reopen and revisit site
4. Check localStorage again

**Expected:**
- Same `visitor_id` persists (90 day lifetime)
- New `session_id` created

### 8.4 Cross-Session Attribution
**Test Steps:**
1. Session 1: Visit with UTM `?utm_source=facebook`
2. Close browser
3. Session 2: Return directly (no UTM)
4. Complete purchase
5. Check which session/source gets attribution

**Expected:**
- Both sessions linked by `visitor_id`
- First-touch attribution to Facebook (in session 1)
- Purchase recorded in session 2

---

## PHASE 9: Admin Dashboard Testing

### 9.1 Dashboard Load
**Test Steps:**
1. Login to `/admin`
2. Navigate to `/admin/analytics`
3. Verify page loads without errors

**Expected:**
- [ ] 4 KPI cards visible (Sales, Orders, Sessions, Conversion Rate)
- [ ] Charts render
- [ ] No console errors

### 9.2 Time Period Selector
**Test Steps:**
1. Click each time period: Today, 7D, 30D, 90D
2. Verify data updates

**Expected:**
- Data changes appropriately for each period
- Period-over-period % change shown

### 9.3 Real-Time Metrics
**Test Steps:**
1. Open site in another browser/incognito
2. Check `/admin/analytics` for "Active Visitors"

**Expected:**
- Active visitors count > 0
- Updates within 30 seconds

### 9.4 Conversion Funnel
**Test Steps:**
1. Complete a test purchase
2. Check funnel visualization

**Expected:**
- Visitors → Product Views → Cart → Checkout → Purchase
- Percentages calculated correctly

### 9.5 PostHog Link
**Test Steps:**
1. Click "View Recordings" or PostHog link in dashboard

**Expected:**
- Opens PostHog dashboard
- Shows recent recordings

---

## PHASE 10: End-to-End Purchase Flow Test

### 10.1 Complete Purchase Journey
**Test Steps:**
1. Open incognito with UTM: `/?utm_source=test_e2e&utm_campaign=launch_test`
2. Navigate: Home → Product → Add to Cart → Checkout
3. Complete purchase with Stripe test card
4. Land on success page

### 10.2 Verify All Events Fired

**Facebook (check Events Manager):**
- [ ] PageView (multiple)
- [ ] ViewContent (product page)
- [ ] AddToCart
- [ ] InitiateCheckout
- [ ] Purchase (client-side)
- [ ] Purchase (server-side CAPI) - should be deduplicated

**Google Analytics (check Real-Time):**
- [ ] page_view (multiple)
- [ ] view_item
- [ ] add_to_cart
- [ ] begin_checkout
- [ ] purchase

**PostHog (check Events):**
- [ ] $pageview (multiple)
- [ ] $autocapture (clicks)
- [ ] Session recording created

**Supabase (check tables):**
- [ ] analytics_sessions row with all funnel flags true
- [ ] analytics_events with all event types
- [ ] UTM attribution captured

### 10.3 Event Data Accuracy
Verify in FB Events Manager:
- [ ] Purchase value matches order total
- [ ] Currency is USD
- [ ] Product IDs match
- [ ] Event Match Quality > 7/10

Verify in GA4:
- [ ] transaction_id matches order ID
- [ ] Revenue matches order total
- [ ] Item details accurate

### 10.4 Deduplication Check
**In FB Events Manager:**
- [ ] Only 1 Purchase event counted (not 2)
- [ ] Event shows both Browser and Server sources

---

## PHASE 11: Error Handling & Edge Cases

### 11.1 Analytics Failure Doesn't Break Checkout
**Test Steps:**
1. Temporarily break analytics (invalid pixel ID)
2. Attempt purchase
3. Verify checkout still works

**Expected:**
- Purchase completes successfully
- Analytics errors logged but don't block user

### 11.2 Ad Blocker Resilience
**Test Steps:**
1. Enable ad blocker (uBlock Origin)
2. Complete purchase journey
3. Check server-side events

**Expected:**
- Client-side events blocked (expected)
- Server-side CAPI events still fire
- Supabase events still recorded

### 11.3 Mobile Device Testing
**Test Steps:**
1. Test on actual mobile device (not just responsive mode)
2. Complete full purchase journey

**Expected:**
- All events fire correctly
- `device_type` = mobile in Supabase
- Touch interactions captured in PostHog

### 11.4 Slow Network Simulation
**Test Steps:**
1. DevTools → Network → Slow 3G
2. Complete purchase journey

**Expected:**
- Events queued and eventually fire
- No lost events
- No timeouts blocking checkout

---

## PHASE 12: Production Verification (Post-Deploy)

### 12.1 Production Environment Check
- [ ] All environment variables set in Vercel/production
- [ ] FB_TEST_EVENT_CODE removed (or set to empty)
- [ ] Production domain in FB/GA settings

### 12.2 Domain Verification
**Facebook:**
- [ ] Domain verified in Business Settings
- [ ] Pixel connected to domain

**Google:**
- [ ] Domain property verified in GA4
- [ ] Enhanced conversions enabled for domain

### 12.3 First Production Purchase Test
**Test Steps:**
1. Complete real purchase with real card
2. Verify all events in production dashboards
3. Request refund after verification

**Expected:**
- All analytics match test environment
- No test event codes in data

### 12.4 Monitoring Setup
- [ ] Set up Vercel/hosting alerts for API errors
- [ ] Set up FB Events Manager alerts for event issues
- [ ] Set up GA4 anomaly detection

---

## Quick Reference: Test Commands

```bash
# Run existing test script
bash scripts/test-fb-tracking.sh

# Check all env vars
node -e "['NEXT_PUBLIC_FB_PIXEL_ID','FB_CONVERSIONS_API_TOKEN','NEXT_PUBLIC_GA_MEASUREMENT_ID','GA_API_SECRET','NEXT_PUBLIC_POSTHOG_KEY'].forEach(v=>console.log(v+': '+(process.env[v]?'✅':'❌')))"

# Test FB CAPI endpoint
curl -X POST http://localhost:3000/api/analytics/fb-event \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Test","eventId":"test-'$(date +%s)'"}'

# Test Supabase tracking endpoint
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","event_data":{}}'

# Check localStorage (run in browser console)
console.table({
  fbc: localStorage.getItem('_fbc'),
  fbp: localStorage.getItem('_fbp'),
  visitor: localStorage.getItem('pmh_visitor_id'),
  session: sessionStorage.getItem('pmh_session_id')
})
```

---

## Acceptance Criteria for Launch

### Must Pass (Blockers)
- [ ] All Facebook events fire correctly (Pixel + CAPI)
- [ ] Purchase event deduplicated (not double-counted)
- [ ] Event Match Quality > 6/10 for Purchase
- [ ] All GA4 events fire correctly
- [ ] Supabase sessions created and tracked
- [ ] Admin dashboard shows accurate data
- [ ] Mobile purchase works end-to-end
- [ ] Ad blocker doesn't break checkout

### Should Pass (Important)
- [ ] PostHog recordings working
- [ ] UTM attribution captured
- [ ] Click ID (fbc) captured from FB ads
- [ ] Real-time admin metrics accurate
- [ ] Conversion funnel accurate

### Nice to Have
- [ ] Event Match Quality > 8/10
- [ ] Session recordings show full user journey
- [ ] All edge cases handled gracefully

---

## Sign-Off Checklist

| Phase | Tester | Date | Pass/Fail | Notes |
|-------|--------|------|-----------|-------|
| 1. Environment | | | | |
| 2. FB Pixel | | | | |
| 3. FB CAPI | | | | |
| 4. GA4 Client | | | | |
| 5. GA4 Server | | | | |
| 6. PostHog | | | | |
| 7. Supabase | | | | |
| 8. Attribution | | | | |
| 9. Admin Dashboard | | | | |
| 10. E2E Purchase | | | | |
| 11. Edge Cases | | | | |
| 12. Production | | | | |

**Final Sign-Off:**
- Tested By: ________________
- Date: ________________
- Ready for Launch: Yes / No
