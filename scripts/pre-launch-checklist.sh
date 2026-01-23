#!/bin/bash

# ============================================
# PRE-LAUNCH CHECKLIST
# Final verification before going live
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  ((PASS_COUNT++))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  ((FAIL_COUNT++))
}

warn() {
  echo -e "${YELLOW}⚠ WARN${NC}: $1"
  ((WARN_COUNT++))
}

info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

header() {
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  $1${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Load env vars
if [ -f .env.local ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
      continue
    fi
    if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line" 2>/dev/null || true
    fi
  done < .env.local
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                      PRE-LAUNCH CHECKLIST                                ║"
echo "║                        UltraRareLove Store                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"

# ============================================
# 1. STRIPE CONFIGURATION
# ============================================
header "1. STRIPE CONFIGURATION"

# Check if using live keys
if echo "$STRIPE_SECRET_KEY" | grep -q "sk_live"; then
  pass "Stripe using LIVE keys"
elif echo "$STRIPE_SECRET_KEY" | grep -q "sk_test"; then
  warn "Stripe using TEST keys - switch to live before launch"
else
  fail "STRIPE_SECRET_KEY not configured"
fi

if echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | grep -q "pk_live"; then
  pass "Stripe publishable key is LIVE"
elif echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | grep -q "pk_test"; then
  warn "Stripe publishable key is TEST"
else
  fail "STRIPE_PUBLISHABLE_KEY not configured"
fi

# Check webhook secret
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  pass "Stripe webhook secret configured"
else
  warn "STRIPE_WEBHOOK_SECRET not set - webhooks won't verify"
fi

# ============================================
# 2. FACEBOOK/META TRACKING
# ============================================
header "2. FACEBOOK/META TRACKING"

if [ -n "$NEXT_PUBLIC_FB_PIXEL_ID" ]; then
  PIXEL_ID_CLEAN=$(echo "$NEXT_PUBLIC_FB_PIXEL_ID" | tr -d '"')
  pass "Facebook Pixel ID: $PIXEL_ID_CLEAN"
else
  fail "NEXT_PUBLIC_FB_PIXEL_ID not set"
fi

if [ -n "$FB_CONVERSIONS_API_TOKEN" ]; then
  pass "Facebook CAPI token configured"
else
  fail "FB_CONVERSIONS_API_TOKEN not set - iOS 14.5+ tracking will be limited"
fi

# ============================================
# 3. GOOGLE ANALYTICS
# ============================================
header "3. GOOGLE ANALYTICS"

if [ -n "$NEXT_PUBLIC_GA_MEASUREMENT_ID" ]; then
  GA_ID_CLEAN=$(echo "$NEXT_PUBLIC_GA_MEASUREMENT_ID" | tr -d '"')
  pass "GA4 Measurement ID: $GA_ID_CLEAN"
else
  warn "NEXT_PUBLIC_GA_MEASUREMENT_ID not set"
fi

# ============================================
# 4. PRICING VERIFICATION
# ============================================
header "4. PRICING VERIFICATION"

info "Verifying prices in bundles.ts..."

# Card Only
if grep -q "id: 'card-only'" src/data/bundles.ts && grep -A3 "id: 'card-only'" src/data/bundles.ts | grep -q "price: 2395"; then
  pass "Card Only price: \$23.95"
else
  fail "Card Only price issue"
fi

# Love Pack (Valentine's Pack)
if grep -A3 "id: 'love-pack'" src/data/bundles.ts | grep -q "price: 3795"; then
  pass "Love Pack price: \$37.95"
else
  fail "Love Pack price issue"
fi

# Deluxe Love
if grep -A3 "id: 'deluxe-love'" src/data/bundles.ts | grep -q "price: 5295"; then
  pass "Deluxe Love price: \$52.95"
else
  fail "Deluxe Love price issue"
fi

# Shipping insurance
if grep -q "SHIPPING_INSURANCE_PRICE = 299" src/lib/store/cart.ts; then
  pass "Shipping Insurance price: \$2.99"
else
  fail "Shipping Insurance price issue"
fi

# Free shipping threshold
if grep -q "freeShippingThreshold: 3500" src/data/product.ts; then
  pass "Free shipping threshold: \$35.00"
else
  fail "Free shipping threshold issue"
fi

# ============================================
# 5. UPSELL FEATURES
# ============================================
header "5. UPSELL FEATURES"

# Shipping insurance in cart
if grep -q "shippingInsurance" src/lib/store/cart.ts; then
  pass "Shipping insurance in cart store"
else
  fail "Shipping insurance missing from cart"
fi

# Bundle upgrade prompt
if grep -q "CartUpgradePrompt\|Upgrade.*Valentine" src/components/storefront/cart/CartDrawer.tsx; then
  pass "Bundle upgrade prompt in cart drawer"
else
  warn "Bundle upgrade prompt may be missing"
fi

# Post-purchase offer
if [ -f "src/components/storefront/checkout/PostPurchaseOffer.tsx" ]; then
  pass "Post-purchase offer component exists"
else
  fail "Post-purchase offer component missing"
fi

# Post-purchase API
if [ -f "src/app/api/post-purchase-charge/route.ts" ]; then
  pass "Post-purchase charge API exists"
else
  fail "Post-purchase charge API missing"
fi

# ============================================
# 6. SECURITY CHECKS
# ============================================
header "6. SECURITY CHECKS"

# Server-side price validation
if grep -q "bundle.price" src/app/api/payment-intent/route.ts && grep -q "NOT.*client" src/app/api/payment-intent/route.ts; then
  pass "Server-side price validation (payment-intent)"
else
  info "Verify server uses bundle.price, not client price"
fi

if grep -q "bundle.price" src/app/api/express-checkout/route.ts; then
  pass "Server-side price validation (express-checkout)"
else
  warn "Check express-checkout price validation"
fi

# No actual secret keys leaked (not placeholder checks)
if grep -r "sk_live_[A-Za-z0-9]\{10,\}\|sk_test_[A-Za-z0-9]\{20,\}" src/components src/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v ".d.ts" | grep -v "node_modules" | grep -v "placeholder"; then
  fail "Found actual secret key in code!"
else
  pass "No secret keys leaked in code"
fi

# ============================================
# 7. BUILD CHECK
# ============================================
header "7. BUILD CHECK"

info "Running type check..."
TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
if [ -z "$TSC_OUTPUT" ]; then
  pass "TypeScript compiles without errors"
else
  fail "TypeScript errors found"
  echo "$TSC_OUTPUT" | head -10
fi

# ============================================
# 8. LIVE API TEST
# ============================================
header "8. LIVE API TEST"

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  info "Dev server running - testing APIs..."

  # Test express checkout API (simpler, tests same payment flow)
  EC_RESPONSE=$(curl -s -X POST http://localhost:3000/api/express-checkout \
    -H "Content-Type: application/json" \
    -d '{
      "items": [{"bundleId": "love-pack", "designId": "design-1", "quantity": 1, "price": 3795}],
      "shippingInsurance": true
    }')

  if echo "$EC_RESPONSE" | grep -q "clientSecret"; then
    pass "Express Checkout API working"

    # Check total includes insurance
    TOTAL=$(echo "$EC_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('amount',0))" 2>/dev/null || echo "0")
    EXPECTED=$((3795 + 299))  # Love pack + insurance (free shipping included)
    if [ "$TOTAL" = "$EXPECTED" ]; then
      pass "Total correct: \$40.94 (bundle + insurance, free shipping)"
    else
      warn "Total: $TOTAL cents (expected: $EXPECTED)"
    fi
  else
    fail "Express Checkout API error"
    echo "$EC_RESPONSE"
  fi

  # Test FB CAPI
  FB_RESPONSE=$(curl -s -X POST http://localhost:3000/api/analytics/fb-event \
    -H "Content-Type: application/json" \
    -d '{
      "eventName": "PageView",
      "eventId": "prelaunch_test",
      "eventSourceUrl": "https://ultrararelove.com/test"
    }')

  if echo "$FB_RESPONSE" | grep -q '"success":true'; then
    pass "Facebook CAPI working"
  else
    warn "Facebook CAPI: $FB_RESPONSE"
  fi
else
  info "Dev server not running - skipping API tests"
fi

# ============================================
# SUMMARY
# ============================================
header "SUMMARY"

echo ""
echo -e "  ${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "  ${YELLOW}Warnings: $WARN_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║               🚀 ALL CHECKS PASSED - READY TO LAUNCH! 🚀                ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
elif [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║           ⚠️  WARNINGS FOUND - Review before launch                      ║${NC}"
  echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
else
  echo -e "${RED}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║              ❌ FAILURES FOUND - Fix before launch                       ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
