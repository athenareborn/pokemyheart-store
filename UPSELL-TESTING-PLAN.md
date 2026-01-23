# Upsell Features Testing Plan

## Overview
Testing plan for the three upsell features:
1. Shipping Insurance ($2.99)
2. Bundle Upgrade Prompt (Cart Drawer)
3. 1-Click Post-Purchase Offer (Success Page)

---

## Pre-Test Setup

### Environment
- [ ] Use Stripe test mode (test API keys)
- [ ] Have Stripe test cards ready:
  - `4242 4242 4242 4242` - Success
  - `4000 0000 0000 0002` - Card declined
  - `4000 0025 0000 3155` - Requires authentication (3D Secure)
- [ ] Open Stripe Dashboard > Test mode > Payments (to verify charges)
- [ ] Open browser DevTools > Network tab (to monitor API calls)
- [ ] Clear localStorage: `localStorage.removeItem('ultrararelove-cart')`

---

## Test 1: Shipping Insurance

### 1.1 Default State (Pre-selected)
- [ ] Add any bundle to cart
- [ ] Go to `/checkout`
- [ ] **Verify**: Insurance toggle shows checked by default
- [ ] **Verify**: Insurance icon (package+shield) displays correctly
- [ ] **Verify**: Order summary shows "Shipping Insurance: $2.99"
- [ ] **Verify**: Total includes $2.99 insurance

### 1.2 Toggle Off
- [ ] Uncheck the insurance toggle
- [ ] **Verify**: Order summary removes insurance line OR shows "$0.00"
- [ ] **Verify**: Total decreases by $2.99
- [ ] **Verify**: Toggle state persists if you navigate away and return

### 1.3 Toggle On Again
- [ ] Re-check the insurance toggle
- [ ] **Verify**: Total increases by $2.99
- [ ] **Verify**: Insurance line reappears in summary

### 1.4 Persistence Across Sessions
- [ ] Add item to cart with insurance ON
- [ ] Close browser tab
- [ ] Open new tab, go to `/checkout`
- [ ] **Verify**: Insurance is still checked (persisted in localStorage)

### 1.5 Payment Includes Insurance
- [ ] Complete checkout with insurance ON
- [ ] **Verify** in Stripe Dashboard: Payment amount includes insurance
- [ ] **Verify** in Stripe metadata: `shipping_insurance: "true"`, `shipping_insurance_amount: "299"`

### 1.6 Payment Without Insurance
- [ ] Complete checkout with insurance OFF
- [ ] **Verify** in Stripe Dashboard: Payment amount excludes insurance
- [ ] **Verify** in Stripe metadata: `shipping_insurance: "false"`, `shipping_insurance_amount: "0"`

---

## Test 2: Bundle Upgrade Prompt (Cart Drawer)

### 2.1 Shows When Card Only in Cart
- [ ] Clear cart
- [ ] Add "Card Only" bundle ($23.95)
- [ ] **Verify**: Cart drawer opens
- [ ] **Verify**: Yellow/amber upgrade prompt appears above checkout buttons
- [ ] **Verify**: Shows "Upgrade & Save" heading
- [ ] **Verify**: Shows "Add display case + stand for just $14.00 more"
- [ ] **Verify**: Shows checkmarks for benefits (10x impressive, FREE shipping)
- [ ] **Verify**: Button shows "Upgrade to Valentine's Pack - $37.95"

### 2.2 Upgrade Works Correctly
- [ ] Click the upgrade button
- [ ] **Verify**: Cart item changes from "Card Only" to "Valentine's Pack"
- [ ] **Verify**: Price updates from $23.95 to $37.95
- [ ] **Verify**: Design selection is preserved (same design)
- [ ] **Verify**: Upgrade prompt disappears (no longer has card-only)
- [ ] **Verify**: Shipping changes to "FREE" (now qualifies for free shipping)

### 2.3 Does NOT Show for Valentine's Pack
- [ ] Clear cart
- [ ] Add "Valentine's Pack" bundle
- [ ] **Verify**: NO upgrade prompt appears (already have the pack)

### 2.4 Does NOT Show for Deluxe Valentine
- [ ] Clear cart
- [ ] Add "Deluxe Valentine" bundle
- [ ] **Verify**: NO upgrade prompt appears (already highest tier)

### 2.5 Multiple Items - Mixed Bundles
- [ ] Add "Card Only" (Design 1)
- [ ] Add "Valentine's Pack" (Design 2)
- [ ] **Verify**: Upgrade prompt DOES appear (has at least one card-only)
- [ ] Click upgrade
- [ ] **Verify**: Only the Card Only item upgrades, Valentine's Pack unchanged

### 2.6 Cart Total Updates
- [ ] Add Card Only ($23.95)
- [ ] **Verify**: Subtotal = $23.95, Shipping = $4.95, Total = $28.90
- [ ] Click upgrade to Valentine's Pack ($37.95)
- [ ] **Verify**: Subtotal = $37.95, Shipping = FREE, Total = $37.95

---

## Test 3: 1-Click Post-Purchase Offer

### 3.1 Setup - Complete Initial Purchase
- [ ] Add any bundle to cart
- [ ] Go to checkout
- [ ] Fill in email: use a real email for testing
- [ ] Fill in shipping address completely
- [ ] Use test card `4242 4242 4242 4242`
- [ ] Complete purchase
- [ ] **Verify**: Redirected to `/checkout/success?payment_intent=...&customer=cus_...`
- [ ] **Note the customer ID** from URL for later verification

### 3.2 Offer Displays Correctly
- [ ] On success page, **Verify**:
  - [ ] "Send One to Your Bestie Too!" header with heart icon
  - [ ] Countdown timer showing ~10:00 (decreasing)
  - [ ] Card Only product image
  - [ ] Price shows $19.16 (crossed out $23.95, 20% OFF badge)
  - [ ] "+ $4.95 shipping" note
  - [ ] 5 design selector thumbnails
  - [ ] Default design is DIFFERENT from what you just bought
  - [ ] Shipping address displayed (from original order)
  - [ ] Card last 4 digits displayed (e.g., "Visa ending in 4242")
  - [ ] "Buy Now - $24.11" button ($19.16 + $4.95 shipping)
  - [ ] Consent text at bottom

### 3.3 Design Selector Works
- [ ] Click different design thumbnails
- [ ] **Verify**: Selection highlight moves to clicked design
- [ ] **Verify**: Design name updates below thumbnails
- [ ] **Verify**: Product image updates to show selected design

### 3.4 Countdown Timer
- [ ] Watch timer count down
- [ ] **Verify**: Updates every second
- [ ] **Verify**: Format is MM:SS

### 3.5 Successful 1-Click Purchase
- [ ] Select a design
- [ ] Click "Buy Now - $24.11"
- [ ] **Verify**: Button shows "Processing..." with spinner
- [ ] **Verify**: After success, shows green "Order Confirmed!" message
- [ ] **Verify**: Shows selected design name
- [ ] Check Stripe Dashboard:
  - [ ] New payment of $24.11 ($19.16 + $4.95)
  - [ ] Same customer ID as original purchase
  - [ ] Metadata shows `is_post_purchase: "true"`, `discount_code: "THANKYOU20"`

### 3.6 Card Declined Error
- [ ] Complete a NEW initial purchase using card `4000 0000 0000 0002` (will fail on 1-click)
  - Actually, this card declines immediately. Use a different approach:
  - Complete initial purchase with `4242...4242`
  - Then in Stripe Dashboard, delete the customer's payment method
- [ ] Try 1-click purchase
- [ ] **Verify**: Error message appears: "No saved payment method found"
- [ ] **Verify**: Link to "Complete checkout manually" appears

### 3.7 Timer Expiration
- [ ] Complete initial purchase
- [ ] Wait for timer to reach 0:00 (or set `COUNTDOWN_DURATION = 10` temporarily for quick test)
- [ ] **Verify**: Offer changes to "Offer Expired" state
- [ ] **Verify**: Shows "Shop Cards" button instead of buy button

### 3.8 No Customer ID (Express Checkout)
- [ ] Use Express Checkout (Apple Pay / Google Pay) if available
- [ ] **Verify**: Success page loads WITHOUT `customer=` param
- [ ] **Verify**: Post-purchase offer does NOT appear (returns null gracefully)

### 3.9 Stripe Customer Created
- [ ] After completing checkout, go to Stripe Dashboard > Customers
- [ ] Search for the email used
- [ ] **Verify**: Customer exists with:
  - [ ] Correct email
  - [ ] Name populated
  - [ ] Shipping address saved
  - [ ] Payment method attached

### 3.10 Existing Customer Reused
- [ ] Complete checkout with the SAME email as a previous test
- [ ] **Verify**: No duplicate customer created
- [ ] **Verify**: Same customer ID reused
- [ ] Check customer in Stripe: may have multiple payment methods attached

---

## Test 4: Integration / Edge Cases

### 4.1 Full Flow - All Upsells
- [ ] Clear cart and localStorage
- [ ] Add "Card Only" bundle
- [ ] **Verify**: Upgrade prompt appears in cart
- [ ] Upgrade to Valentine's Pack
- [ ] Go to checkout
- [ ] **Verify**: Insurance pre-selected
- [ ] Keep insurance ON
- [ ] Complete purchase
- [ ] **Verify**: Success page shows 1-click offer
- [ ] Complete 1-click purchase
- [ ] **Verify**: Two separate charges in Stripe:
  1. Valentine's Pack + Insurance = $37.95 + $2.99 = $40.94
  2. Card Only (20% off) + Shipping = $19.16 + $4.95 = $24.11

### 4.2 Discount Code + Insurance
- [ ] Add item to cart
- [ ] Apply a discount code at checkout (if discount system exists)
- [ ] Keep insurance ON
- [ ] **Verify**: Total = Subtotal + Shipping + Insurance - Discount
- [ ] Complete purchase
- [ ] **Verify**: Stripe payment amount is correct

### 4.3 Multiple Items + Insurance
- [ ] Add 2 different bundles to cart
- [ ] Go to checkout
- [ ] **Verify**: Insurance is single flat $2.99 (not per-item)
- [ ] Complete purchase
- [ ] **Verify**: Stripe metadata shows all items + insurance

### 4.4 Mobile Responsiveness
- [ ] Test all features on mobile viewport (or Chrome DevTools mobile)
- [ ] **Verify**: Insurance toggle is tappable and visible
- [ ] **Verify**: Upgrade prompt in cart drawer fits on screen
- [ ] **Verify**: Post-purchase offer is single column, scrollable
- [ ] **Verify**: Design selector thumbnails are large enough to tap

### 4.5 Page Refresh on Success
- [ ] Complete purchase, land on success page with 1-click offer
- [ ] Refresh the page (F5)
- [ ] **Verify**: Offer still appears (customer param preserved in URL)
- [ ] **Verify**: Timer resets (expected behavior - no server-side timer)

### 4.6 Direct URL Access
- [ ] Try accessing `/checkout/success` without any params
- [ ] **Verify**: Page loads without errors
- [ ] **Verify**: 1-click offer does NOT appear (no customer ID)
- [ ] Try accessing `/checkout/success?customer=invalid_id`
- [ ] **Verify**: Offer shows loading then gracefully hides (API returns error)

---

## Test 5: Analytics Tracking

### 5.1 Post-Purchase Tracking
- [ ] Complete 1-click purchase
- [ ] Check browser DevTools Console
- [ ] **Verify**: `gtag('event', 'purchase', {...})` fired with:
  - [ ] Correct transaction_id (paymentIntentId)
  - [ ] Correct value ($24.11)
  - [ ] Correct item details

### 5.2 Facebook Pixel (if configured)
- [ ] Use Facebook Pixel Helper extension
- [ ] Complete 1-click purchase
- [ ] **Verify**: Purchase event fires with correct value

---

## Test 6: Error Handling

### 6.1 Network Failure on 1-Click
- [ ] Complete initial purchase
- [ ] Open DevTools > Network > Offline mode
- [ ] Try 1-click purchase
- [ ] **Verify**: Error message "Something went wrong. Please try again."
- [ ] Go back online
- [ ] Try again
- [ ] **Verify**: Works after reconnection

### 6.2 API Error Responses
Test each error code from `/api/post-purchase-charge`:
- [ ] `no_payment_method` → "No saved payment method found."
- [ ] `card_declined` → "Your card was declined..."
- [ ] `authentication_required` → "Additional authentication required..."

### 6.3 Invalid Design ID
- [ ] Manually call API with invalid designId
- [ ] **Verify**: Returns 400 error, doesn't charge

### 6.4 Invalid Customer ID
- [ ] Manually call API with `customerId: "invalid"`
- [ ] **Verify**: Returns 400 error "Invalid customer ID"

---

## Cleanup After Testing

- [ ] Delete test customers in Stripe Dashboard (optional)
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Verify no test orders went to production (if using live mode accidentally)

---

## Sign-Off

| Feature | Tester | Date | Pass/Fail | Notes |
|---------|--------|------|-----------|-------|
| Shipping Insurance | | | | |
| Bundle Upgrade | | | | |
| 1-Click Post-Purchase | | | | |
| Integration Tests | | | | |
| Mobile Tests | | | | |
| Error Handling | | | | |
