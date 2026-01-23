#!/bin/bash

# =============================================================================
# COMPREHENSIVE UPSELL FEATURE TEST SUITE
# =============================================================================
# Tests all upsell features before go-live:
# 1. Shipping Insurance
# 2. Bundle Upgrade Prompt
# 3. 1-Click Post-Purchase Offer
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
BASE_URL="${BASE_URL:-http://localhost:3000}"

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# =============================================================================
section "1. CODE VERIFICATION - Shipping Insurance"
# =============================================================================

info "Checking cart.ts for shippingInsurance state..."
if grep -q "shippingInsurance: true" src/lib/store/cart.ts; then
    pass "shippingInsurance defaults to true in cart store"
else
    fail "shippingInsurance not defaulting to true"
fi

info "Checking SHIPPING_INSURANCE_PRICE constant..."
PRICE=$(grep "SHIPPING_INSURANCE_PRICE = " src/lib/store/cart.ts | grep -o '[0-9]*')
if [ "$PRICE" = "299" ]; then
    pass "SHIPPING_INSURANCE_PRICE is 299 cents (\$2.99)"
else
    fail "SHIPPING_INSURANCE_PRICE is not 299 (found: $PRICE)"
fi

info "Checking CheckoutForm has insurance toggle..."
if grep -q "Shipping Insurance" src/components/storefront/checkout/CheckoutForm.tsx && \
   grep -q "setShippingInsurance" src/components/storefront/checkout/CheckoutForm.tsx; then
    pass "CheckoutForm has insurance toggle with setShippingInsurance"
else
    fail "CheckoutForm missing insurance toggle"
fi

info "Checking CartDrawer has insurance toggle..."
if grep -q "setShippingInsurance" src/components/storefront/cart/CartDrawer.tsx && \
   grep -q 'type="checkbox"' src/components/storefront/cart/CartDrawer.tsx; then
    pass "CartDrawer has insurance checkbox toggle"
else
    fail "CartDrawer missing insurance toggle"
fi

info "Checking payment-intent API includes insurance..."
if grep -q "shipping_insurance" src/app/api/payment-intent/route.ts && \
   grep -q "insuranceCost" src/app/api/payment-intent/route.ts; then
    pass "Payment intent API handles insurance in metadata and total"
else
    fail "Payment intent API missing insurance handling"
fi

info "Checking CheckoutOrderSummary shows insurance..."
if grep -q "insuranceAmount" src/components/storefront/checkout/CheckoutOrderSummary.tsx; then
    pass "CheckoutOrderSummary displays insurance amount"
else
    fail "CheckoutOrderSummary missing insurance display"
fi

# =============================================================================
section "2. CODE VERIFICATION - Bundle Upgrade Prompt"
# =============================================================================

info "Checking CartDrawer detects card-only bundle..."
if grep -q "hasBundle('card-only')" src/components/storefront/cart/CartDrawer.tsx; then
    pass "CartDrawer checks for card-only bundle"
else
    fail "CartDrawer not checking for card-only bundle"
fi

info "Checking upgrade prompt UI exists..."
if grep -q "Upgrade & Save" src/components/storefront/cart/CartDrawer.tsx && \
   grep -q "upgradeToBundle" src/components/storefront/cart/CartDrawer.tsx; then
    pass "CartDrawer has upgrade prompt with upgradeToBundle action"
else
    fail "CartDrawer missing upgrade prompt"
fi

info "Checking upgradeToBundle function in cart store..."
if grep -q "upgradeToBundle:" src/lib/store/cart.ts; then
    pass "Cart store has upgradeToBundle function"
else
    fail "Cart store missing upgradeToBundle function"
fi

# =============================================================================
section "3. CODE VERIFICATION - 1-Click Post-Purchase"
# =============================================================================

info "Checking Stripe Customer creation in payment-intent..."
if grep -q "stripe.customers.create" src/app/api/payment-intent/route.ts && \
   grep -q "stripe.customers.list" src/app/api/payment-intent/route.ts; then
    pass "Payment intent creates/finds Stripe Customer"
else
    fail "Payment intent not creating Stripe Customer"
fi

info "Checking setup_future_usage for saving cards..."
if grep -q "setup_future_usage: 'off_session'" src/app/api/payment-intent/route.ts; then
    pass "Payment intent sets setup_future_usage: off_session"
else
    fail "Payment intent not saving payment method for future use"
fi

info "Checking customer ID passed to success page..."
if grep -q "customer.*stripeCustomerId" src/components/storefront/checkout/CheckoutForm.tsx || \
   grep -q "searchParams.set('customer'" src/components/storefront/checkout/CheckoutForm.tsx; then
    pass "Customer ID passed to success page URL"
else
    fail "Customer ID not passed to success page"
fi

info "Checking post-purchase-charge API exists..."
if [ -f "src/app/api/post-purchase-charge/route.ts" ]; then
    pass "Post-purchase charge API exists"
else
    fail "Post-purchase charge API missing"
fi

info "Checking post-purchase API has off_session charge..."
if grep -q "off_session: true" src/app/api/post-purchase-charge/route.ts && \
   grep -q "confirm: true" src/app/api/post-purchase-charge/route.ts; then
    pass "Post-purchase API does off_session immediate charge"
else
    fail "Post-purchase API not doing off_session charge"
fi

info "Checking post-purchase API sends receipt_email..."
if grep -q "receipt_email" src/app/api/post-purchase-charge/route.ts; then
    pass "Post-purchase API sends receipt email"
else
    fail "Post-purchase API not sending receipt email"
fi

info "Checking PostPurchaseOffer component exists..."
if [ -f "src/components/storefront/checkout/PostPurchaseOffer.tsx" ]; then
    pass "PostPurchaseOffer component exists"
else
    fail "PostPurchaseOffer component missing"
fi

info "Checking PostPurchaseOffer has countdown timer..."
if grep -q "COUNTDOWN_DURATION" src/components/storefront/checkout/PostPurchaseOffer.tsx && \
   grep -q "timeRemaining" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer has countdown timer"
else
    fail "PostPurchaseOffer missing countdown timer"
fi

info "Checking PostPurchaseOffer has design selector..."
if grep -q "selectedDesignId" src/components/storefront/checkout/PostPurchaseOffer.tsx && \
   grep -q "PRODUCT.designs" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer has design selector"
else
    fail "PostPurchaseOffer missing design selector"
fi

info "Checking PostPurchaseOffer displays card info..."
if grep -q "cardLast4" src/components/storefront/checkout/PostPurchaseOffer.tsx && \
   grep -q "cardBrand" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer displays card last4 and brand"
else
    fail "PostPurchaseOffer not displaying card info"
fi

info "Checking PostPurchaseOffer has consent text..."
if grep -q "authorize.*charge" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer has consent/authorization text"
else
    fail "PostPurchaseOffer missing consent text"
fi

info "Checking success page integrates PostPurchaseOffer..."
if grep -q "PostPurchaseOffer" src/app/\(checkout\)/checkout/success/page.tsx && \
   grep -q "customerId" src/app/\(checkout\)/checkout/success/page.tsx; then
    pass "Success page integrates PostPurchaseOffer with customerId"
else
    fail "Success page not integrating PostPurchaseOffer properly"
fi

# =============================================================================
section "4. CODE VERIFICATION - Analytics Tracking"
# =============================================================================

info "Checking post_purchase_offer_viewed tracking..."
if grep -q "post_purchase_offer_viewed" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "Tracks post_purchase_offer_viewed event"
else
    fail "Missing post_purchase_offer_viewed tracking"
fi

info "Checking post_purchase_offer_clicked tracking..."
if grep -q "post_purchase_offer_clicked" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "Tracks post_purchase_offer_clicked event"
else
    fail "Missing post_purchase_offer_clicked tracking"
fi

info "Checking post_purchase_order_completed tracking..."
if grep -q "post_purchase_order_completed" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "Tracks post_purchase_order_completed event"
else
    fail "Missing post_purchase_order_completed tracking"
fi

info "Checking post_purchase_offer_expired tracking..."
if grep -q "post_purchase_offer_expired" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "Tracks post_purchase_offer_expired event"
else
    fail "Missing post_purchase_offer_expired tracking"
fi

info "Checking Facebook CAPI tracking for post-purchase..."
if grep -q "fb-event" src/components/storefront/checkout/PostPurchaseOffer.tsx || \
   grep -q "api/analytics/fb-event" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer tracks to Facebook CAPI"
else
    fail "PostPurchaseOffer missing Facebook CAPI tracking"
fi

# =============================================================================
section "5. CODE VERIFICATION - Express Checkout Insurance"
# =============================================================================

info "Checking Express Checkout includes insurance..."
if grep -q "shippingInsurance" src/components/storefront/cart/CartExpressCheckout.tsx && \
   grep -q "insuranceCost" src/components/storefront/cart/CartExpressCheckout.tsx; then
    pass "Express Checkout component handles insurance"
else
    fail "Express Checkout component missing insurance"
fi

info "Checking Express Checkout API handles insurance..."
if grep -q "shippingInsurance" src/app/api/express-checkout/route.ts && \
   grep -q "SHIPPING_INSURANCE_PRICE" src/app/api/express-checkout/route.ts; then
    pass "Express Checkout API handles insurance"
else
    fail "Express Checkout API missing insurance handling"
fi

# =============================================================================
section "6. CODE VERIFICATION - Error Handling"
# =============================================================================

info "Checking post-purchase handles card_declined..."
if grep -q "card_declined" src/app/api/post-purchase-charge/route.ts; then
    pass "Post-purchase API handles card_declined error"
else
    fail "Post-purchase API missing card_declined handling"
fi

info "Checking post-purchase handles authentication_required..."
if grep -q "authentication_required" src/app/api/post-purchase-charge/route.ts; then
    pass "Post-purchase API handles authentication_required error"
else
    fail "Post-purchase API missing authentication_required handling"
fi

info "Checking post-purchase handles no_payment_method..."
if grep -q "no_payment_method" src/app/api/post-purchase-charge/route.ts; then
    pass "Post-purchase API handles no_payment_method error"
else
    fail "Post-purchase API missing no_payment_method handling"
fi

info "Checking PostPurchaseOffer displays errors..."
if grep -q "purchaseError" src/components/storefront/checkout/PostPurchaseOffer.tsx && \
   grep -q "AlertCircle" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
    pass "PostPurchaseOffer displays error messages"
else
    fail "PostPurchaseOffer missing error display"
fi

# =============================================================================
section "7. API TESTS"
# =============================================================================

info "Testing payment-intent API creates PaymentIntent..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/payment-intent" \
    -H "Content-Type: application/json" \
    -d '{
        "items": [{
            "name": "Test",
            "description": "Test",
            "price": 3795,
            "quantity": 1,
            "designId": "eternal-love",
            "designName": "Eternal Love",
            "bundleId": "love-pack",
            "bundleName": "Valentine Pack",
            "bundleSku": "LOVE-PACK"
        }],
        "email": "test@test.com",
        "shippingAddress": {
            "firstName": "Test",
            "lastName": "User",
            "address1": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "postalCode": "90210",
            "country": "US"
        },
        "shippingMethod": "standard"
    }' 2>/dev/null)

if echo "$RESPONSE" | grep -q "clientSecret"; then
    pass "Payment intent API returns clientSecret"
else
    fail "Payment intent API failed: $RESPONSE"
fi

if echo "$RESPONSE" | grep -q "paymentIntentId"; then
    pass "Payment intent API returns paymentIntentId"
else
    fail "Payment intent API missing paymentIntentId"
fi

info "Testing post-purchase-charge GET endpoint..."
# Use a fake customer ID - should return error gracefully
RESPONSE=$(curl -s "$BASE_URL/api/post-purchase-charge?customerId=cus_invalid123" 2>/dev/null)
if echo "$RESPONSE" | grep -q "error\|hasPaymentMethod"; then
    pass "Post-purchase GET endpoint responds (returns error for invalid customer)"
else
    fail "Post-purchase GET endpoint not responding"
fi

info "Testing express-checkout API..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/express-checkout" \
    -H "Content-Type: application/json" \
    -d '{
        "items": [{
            "designId": "eternal-love",
            "bundleId": "love-pack",
            "quantity": 1,
            "price": 3795
        }],
        "shippingInsurance": true
    }' 2>/dev/null)

if echo "$RESPONSE" | grep -q "clientSecret"; then
    pass "Express checkout API returns clientSecret"
else
    fail "Express checkout API failed: $RESPONSE"
fi

if echo "$RESPONSE" | grep -q "insuranceCost"; then
    pass "Express checkout API returns insuranceCost"
else
    fail "Express checkout API missing insuranceCost in response"
fi

# =============================================================================
section "8. PRICE VERIFICATION"
# =============================================================================

info "Verifying Card Only price ($23.95 = 2395 cents)..."
PRICE=$(grep -A2 "id: 'card-only'" src/data/bundles.ts | grep "price:" | grep -o '[0-9]*')
if [ "$PRICE" = "2395" ]; then
    pass "Card Only price is 2395 cents"
else
    fail "Card Only price incorrect (found: $PRICE, expected: 2395)"
fi

info "Verifying Valentine's Pack price ($37.95 = 3795 cents)..."
PRICE=$(grep -A2 "id: 'love-pack'" src/data/bundles.ts | grep "price:" | grep -o '[0-9]*')
if [ "$PRICE" = "3795" ]; then
    pass "Valentine's Pack price is 3795 cents"
else
    fail "Valentine's Pack price incorrect (found: $PRICE, expected: 3795)"
fi

info "Verifying 20% discount calculation..."
DISCOUNTED=$(grep "DISCOUNTED_PRICE" src/components/storefront/checkout/PostPurchaseOffer.tsx | head -1)
if echo "$DISCOUNTED" | grep -q "0.8\|1 - DISCOUNT_PERCENT / 100"; then
    pass "20% discount calculation correct (price * 0.8)"
else
    fail "Discount calculation may be incorrect"
fi

info "Verifying free shipping threshold ($35 = 3500 cents)..."
THRESHOLD=$(grep "freeShippingThreshold" src/data/product.ts | grep -o '[0-9]*')
if [ "$THRESHOLD" = "3500" ]; then
    pass "Free shipping threshold is 3500 cents"
else
    fail "Free shipping threshold incorrect (found: $THRESHOLD, expected: 3500)"
fi

# =============================================================================
section "9. BUILD VERIFICATION"
# =============================================================================

info "Running TypeScript check..."
if npm run build > /dev/null 2>&1; then
    pass "Build succeeds without errors"
else
    fail "Build failed - check for TypeScript errors"
fi

# =============================================================================
section "TEST SUMMARY"
# =============================================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo -e "  Total Tests: $TOTAL"
echo -e "  ${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED - READY FOR GO-LIVE${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED - FIX BEFORE GO-LIVE${NC}"
    exit 1
fi
