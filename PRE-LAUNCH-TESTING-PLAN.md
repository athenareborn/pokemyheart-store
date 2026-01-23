# Pre-Launch Testing Plan - Pokemyheart Store

## Overview

Comprehensive testing plan before Valentine's Day 2026 launch. Organized into distinct testing phases that can be run independently.

**Existing Resources:**
- `UPSELL-TESTING-PLAN.md` - Detailed upsell feature tests (shipping insurance, bundle upgrade, 1-click post-purchase)
- `scripts/pre-launch-checklist.sh` - Environment & configuration verification
- `scripts/test-fb-tracking.sh` - Facebook Pixel/CAPI verification
- `scripts/test-upsells.sh` - Automated upsell code verification

---

## Phase 1: Speed Optimization Testing

### 1.1 Lighthouse Audit

Run on both desktop and mobile:

```bash
# Install lighthouse if needed
npm i -g lighthouse

# Run audits (with dev server running)
lighthouse https://localhost:3000 --view --preset=desktop
lighthouse https://localhost:3000 --view --preset=mobile
```

**Targets:**
- [ ] Performance score: 90+
- [ ] Accessibility score: 90+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

**Critical Pages to Test:**
- [ ] Homepage `/`
- [ ] Product page `/products/heartstealer-card`
- [ ] Checkout `/checkout`
- [ ] Success page `/checkout/success`

### 1.2 Core Web Vitals

| Metric | Target | How to Check |
|--------|--------|--------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, Chrome DevTools |
| **FID** (First Input Delay) | < 100ms | Real user monitoring |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| **INP** (Interaction to Next Paint) | < 200ms | Chrome DevTools Performance |
| **TTFB** (Time to First Byte) | < 800ms | Network tab |

### 1.3 Bundle Size Analysis

```bash
# Build with bundle analysis
ANALYZE=true npm run build
```

**Checks:**
- [ ] Main bundle < 250KB gzipped
- [ ] No duplicate dependencies
- [ ] Stripe loaded lazily (not blocking)
- [ ] Images optimized (WebP/AVIF)

### 1.4 Image Optimization

- [ ] All product images use Next.js `<Image>` with proper sizing
- [ ] Hero images have `priority` attribute
- [ ] Below-fold images lazy load
- [ ] Proper `sizes` attribute for responsive images

### 1.5 Third-Party Script Loading

- [ ] Facebook Pixel: loads async, doesn't block render
- [ ] GA4: loads via next/script with afterInteractive
- [ ] Stripe: lazy-loaded only when needed
- [ ] No render-blocking scripts

---

## Phase 2: Full Sales Flow Testing

### 2.1 Product Discovery Flow

**Homepage → Product:**
- [ ] Homepage loads with hero section
- [ ] "Shop Now" CTA works
- [ ] Product page loads correctly
- [ ] Product images display properly
- [ ] Design selector works (5 designs)
- [ ] Bundle selector works (Card Only, Valentine's Pack, Deluxe)
- [ ] Price updates correctly per bundle
- [ ] "Add to Cart" button works

### 2.2 Cart Flow

**Add to Cart → Cart Drawer:**
- [ ] Adding item opens cart drawer
- [ ] Item appears with correct design/bundle
- [ ] Quantity can be updated
- [ ] Item can be removed
- [ ] Multiple items can be added
- [ ] Subtotal calculates correctly
- [ ] Shipping shows correctly (free vs $4.95)
- [ ] Free shipping progress bar works
- [ ] Timer countdown displays (5 min reservation)

### 2.3 Express Checkout (Apple Pay / Google Pay)

**Prerequisites:** Test on device with Apple Pay/Google Pay set up

**From Product Page:**
- [ ] Express checkout buttons appear (if supported)
- [ ] Apple Pay opens payment sheet
- [ ] Correct amount shown in payment sheet
- [ ] Successful payment redirects to success page
- [ ] Order created in Supabase (check admin)
- [ ] Analytics events fire (FB, GA4)

**From Cart Drawer:**
- [ ] Express checkout buttons appear
- [ ] Shows all cart items in payment sheet
- [ ] Includes shipping insurance if selected
- [ ] Successful payment clears cart
- [ ] Redirects to success page

### 2.4 Regular Checkout Flow

**Cart → Checkout Page → Success:**

1. **Checkout Page Load:**
   - [ ] Page loads without errors
   - [ ] Order summary shows correct items
   - [ ] InitiateCheckout event fires

2. **Form Sections:**
   - [ ] Contact: Email input validates
   - [ ] Shipping: All fields work (name, address, city, state, ZIP, phone)
   - [ ] Country selector works (US, CA, UK, AU)
   - [ ] Postal code validation per country
   - [ ] Delivery: Standard/Express radio buttons work
   - [ ] Shipping cost updates for Express

3. **Shipping Insurance:**
   - [ ] Pre-selected by default
   - [ ] Toggle on/off works
   - [ ] Total updates by $2.99
   - [ ] State persists on page refresh

4. **Payment:**
   - [ ] PaymentElement loads
   - [ ] Card tab shows by default
   - [ ] Test card `4242 4242 4242 4242` works
   - [ ] 3D Secure card `4000 0025 0000 3155` works
   - [ ] Card declined `4000 0000 0000 0002` shows error

5. **Order Completion:**
   - [ ] "Complete Order" button processes payment
   - [ ] Redirect to success page
   - [ ] Order created in Supabase
   - [ ] Webhook fires (check Stripe Dashboard)
   - [ ] FB CAPI Purchase event sent
   - [ ] GA4 Purchase event sent

### 2.5 Embedded Checkout (Fallback)

When no wallet methods available:

- [ ] "Buy Now" button shows on product page
- [ ] Clicking opens embedded checkout modal
- [ ] Stripe Checkout loads correctly
- [ ] Can complete payment
- [ ] Redirects to success page
- [ ] Order created correctly

### 2.6 Success Page

- [ ] Order confirmation message displays
- [ ] Order details shown (if available from session storage)
- [ ] "Continue Shopping" button works
- [ ] No errors in console

---

## Phase 3: Upsell Features Testing

**See: `UPSELL-TESTING-PLAN.md`** for detailed tests covering:
- Shipping Insurance (7 tests)
- Bundle Upgrade Prompt (6 tests)
- 1-Click Post-Purchase Offer (10 tests)
- Integration tests (6 tests)
- Analytics tracking (2 tests)
- Error handling (4 tests)

**Quick Smoke Test:**
1. [ ] Add Card Only → Upgrade prompt appears
2. [ ] Upgrade works → Changes to Valentine's Pack
3. [ ] Checkout with insurance ON → $2.99 added
4. [ ] Complete purchase → 1-click offer appears
5. [ ] 1-click purchase works → Second charge in Stripe

---

## Phase 4: Analytics Verification

### 4.1 Facebook Pixel (Client-Side)

Install Facebook Pixel Helper Chrome extension.

**Events to verify:**
- [ ] `PageView` - On every page load
- [ ] `ViewContent` - On product page (with product ID, name, price)
- [ ] `AddToCart` - When adding to cart
- [ ] `InitiateCheckout` - When checkout loads
- [ ] `Purchase` - On success page (with value, transaction ID)

### 4.2 Facebook CAPI (Server-Side)

Check Facebook Events Manager > Test Events

- [ ] `ViewContent` events appear
- [ ] `Purchase` events appear with user data
- [ ] Event deduplication working (check event_id match)
- [ ] User data quality (email, phone hashed)

**Run verification script:**
```bash
./scripts/test-fb-tracking.sh
```

### 4.3 Google Analytics 4

Check GA4 Realtime view while testing.

- [ ] `page_view` - On navigation
- [ ] `view_item` - On product page
- [ ] `add_to_cart` - On cart add
- [ ] `begin_checkout` - On checkout page
- [ ] `purchase` - On success

### 4.4 Custom Analytics (Supabase)

Check `analytics_events` table:

- [ ] Sessions being created
- [ ] Events logged with correct data
- [ ] UTM parameters captured
- [ ] Visitor IDs persisting

---

## Phase 5: Mobile Responsiveness

Test on real devices or Chrome DevTools device emulation.

### 5.1 Viewports to Test

- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] Samsung Galaxy (360px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)

### 5.2 Critical Mobile Checks

**Homepage:**
- [ ] Hero text readable
- [ ] CTA buttons tappable (min 44px)
- [ ] No horizontal scroll

**Product Page:**
- [ ] Image carousel works (swipe)
- [ ] Design thumbnails tappable
- [ ] Bundle selector scrolls if needed
- [ ] Add to Cart button visible

**Cart Drawer:**
- [ ] Full-width on mobile
- [ ] Items scrollable
- [ ] Upgrade prompt fits
- [ ] Checkout button sticky

**Checkout:**
- [ ] Form inputs full-width
- [ ] Keyboard doesn't obscure inputs
- [ ] Order summary collapsible
- [ ] Insurance toggle tappable
- [ ] Payment form usable

**Success Page:**
- [ ] 1-click offer fits on screen
- [ ] Design selector scrolls horizontally
- [ ] Timer visible
- [ ] Buy button accessible

---

## Phase 6: Error Handling & Edge Cases

### 6.1 Network Errors

- [ ] Checkout with slow connection (throttle to 3G)
- [ ] Payment fails gracefully on network error
- [ ] Retry works after network restored
- [ ] Loading states visible during delays

### 6.2 Payment Errors

Test cards:
- [ ] `4000 0000 0000 0002` - Card declined
- [ ] `4000 0000 0000 9995` - Insufficient funds
- [ ] `4000 0000 0000 9987` - Lost card
- [ ] `4100 0000 0000 0019` - Fraudulent

**Verify:**
- [ ] User-friendly error messages
- [ ] Can retry with different card
- [ ] No duplicate charges

### 6.3 Form Validation

- [ ] Empty email shows error
- [ ] Invalid email shows error
- [ ] Empty shipping fields show errors
- [ ] Invalid postal codes rejected
- [ ] Phone validates correctly

### 6.4 Cart Edge Cases

- [ ] Empty cart redirects from checkout
- [ ] Cart survives page refresh
- [ ] Cart survives browser close/reopen
- [ ] Can add same item multiple times
- [ ] Quantity limits enforced (1-99)

### 6.5 URL Edge Cases

- [ ] Direct access to `/checkout` with empty cart
- [ ] Direct access to `/checkout/success` without payment
- [ ] Invalid product slug shows 404
- [ ] Non-existent pages show 404

---

## Phase 7: Security Verification

### 7.1 Run Pre-Launch Script

```bash
./scripts/pre-launch-checklist.sh
```

### 7.2 Manual Security Checks

- [ ] No API keys in client code (search for `sk_`)
- [ ] Server validates prices (doesn't trust client)
- [ ] Webhook signature verification working
- [ ] Admin routes protected (require auth)
- [ ] No XSS vulnerabilities in inputs
- [ ] HTTPS enforced in production

### 7.3 Stripe Configuration

- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Events subscribed: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Webhook signing secret set in env

---

## Phase 8: Cross-Browser Testing

### 8.1 Browsers to Test

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari iOS
- [ ] Chrome Android

### 8.2 Critical Checks Per Browser

- [ ] Homepage renders correctly
- [ ] Product page functions
- [ ] Cart drawer works
- [ ] Checkout completes
- [ ] Payment processing works
- [ ] No console errors

---

## Phase 9: Production Deployment Checklist

### 9.1 Environment Variables

Verify in Vercel/production environment:

- [ ] `STRIPE_SECRET_KEY` is `sk_live_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is `pk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` set for production webhook
- [ ] `NEXT_PUBLIC_FB_PIXEL_ID` set
- [ ] `FB_CONVERSIONS_API_TOKEN` set
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` set
- [ ] `SUPABASE_*` keys are production

### 9.2 Stripe Webhook

- [ ] Production webhook URL registered
- [ ] Events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Webhook secret updated in Vercel

### 9.3 Domain Configuration

- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Redirects working (www → non-www or vice versa)

### 9.4 DNS & CDN

- [ ] DNS propagated
- [ ] Vercel edge network active
- [ ] Images served from CDN

---

## Test Execution Order

Recommended order for testing:

1. **Run automated scripts first:**
   ```bash
   ./scripts/pre-launch-checklist.sh
   ./scripts/test-fb-tracking.sh
   ./scripts/test-upsells.sh
   ```

2. **Speed optimization** (Phase 1) - Fix any issues before other tests

3. **Full sales flow** (Phase 2) - Core functionality

4. **Upsell features** (Phase 3) - Revenue optimization

5. **Analytics** (Phase 4) - Attribution verification

6. **Mobile** (Phase 5) - Mobile traffic is likely 60%+

7. **Error handling** (Phase 6) - Edge cases

8. **Security** (Phase 7) - Final security check

9. **Cross-browser** (Phase 8) - Compatibility

10. **Production deploy** (Phase 9) - Go live

---

## Sign-Off Checklist

| Phase | Tester | Date | Status | Notes |
|-------|--------|------|--------|-------|
| 1. Speed Optimization | | | | |
| 2. Full Sales Flow | | | | |
| 3. Upsell Features | | | | |
| 4. Analytics | | | | |
| 5. Mobile | | | | |
| 6. Error Handling | | | | |
| 7. Security | | | | |
| 8. Cross-Browser | | | | |
| 9. Production Deploy | | | | |

---

## Quick Test Commands

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run pre-launch checks
./scripts/pre-launch-checklist.sh

# Run FB tracking tests
./scripts/test-fb-tracking.sh

# Run upsell code verification
./scripts/test-upsells.sh

# Lighthouse (with server running)
lighthouse http://localhost:3000 --view
```
