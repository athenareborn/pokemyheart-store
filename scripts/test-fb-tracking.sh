#!/bin/bash

# ============================================
# Facebook Pixel & CAPI Test Suite
# Tests both code implementation and live API
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

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

header() {
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  $1${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================
# 1. ENVIRONMENT VARIABLES CHECK
# ============================================
header "1. ENVIRONMENT VARIABLES CHECK"

# Load env vars
if [ -f .env.local ]; then
  # Export each line that looks like an env var
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
      continue
    fi
    # Export if it's a valid KEY=VALUE
    if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line" 2>/dev/null || true
    fi
  done < .env.local
  info "Loaded .env.local"
else
  fail ".env.local not found"
fi

# Check FB Pixel ID
if [ -n "$NEXT_PUBLIC_FB_PIXEL_ID" ]; then
  pass "NEXT_PUBLIC_FB_PIXEL_ID is set (${NEXT_PUBLIC_FB_PIXEL_ID:0:10}...)"
else
  fail "NEXT_PUBLIC_FB_PIXEL_ID not set"
fi

# Check FB CAPI Token
if [ -n "$FB_CONVERSIONS_API_TOKEN" ]; then
  pass "FB_CONVERSIONS_API_TOKEN is set (${FB_CONVERSIONS_API_TOKEN:0:10}...)"
else
  fail "FB_CONVERSIONS_API_TOKEN not set"
fi

# Check FB Test Event Code (optional but useful for testing)
if [ -n "$FB_TEST_EVENT_CODE" ]; then
  pass "FB_TEST_EVENT_CODE is set: $FB_TEST_EVENT_CODE"
else
  info "FB_TEST_EVENT_CODE not set (optional - for Events Manager testing)"
fi

# ============================================
# 2. CODE IMPLEMENTATION CHECKS
# ============================================
header "2. CODE IMPLEMENTATION CHECKS"

# Check facebook-capi.ts has graph.facebook.com
info "Checking facebook-capi.ts..."
if grep -q "graph.facebook.com" src/lib/analytics/facebook-capi.ts; then
  pass "facebook-capi.ts calls graph.facebook.com"
else
  fail "facebook-capi.ts missing graph.facebook.com call"
fi

# Check SHA256 hashing
if grep -q "sha256" src/lib/analytics/facebook-capi.ts; then
  pass "facebook-capi.ts implements SHA256 hashing"
else
  fail "facebook-capi.ts missing SHA256 hashing"
fi

# Check event_id for deduplication
if grep -q "event_id" src/lib/analytics/facebook-capi.ts; then
  pass "facebook-capi.ts supports event_id for deduplication"
else
  fail "facebook-capi.ts missing event_id support"
fi

# Check test_event_code support
if grep -q "test_event_code" src/lib/analytics/facebook-capi.ts; then
  pass "facebook-capi.ts supports test_event_code"
else
  fail "facebook-capi.ts missing test_event_code support"
fi

# Check fpixel.ts has eventID support
info "Checking fpixel.ts..."
if grep -q "eventID" src/lib/analytics/fpixel.ts; then
  pass "fpixel.ts supports eventID for deduplication"
else
  fail "fpixel.ts missing eventID support"
fi

# Check all standard events are implemented
for event in "PageView" "ViewContent" "AddToCart" "InitiateCheckout" "Purchase"; do
  if grep -q "$event" src/lib/analytics/fpixel.ts; then
    pass "fpixel.ts has $event event"
  else
    fail "fpixel.ts missing $event event"
  fi
done

# ============================================
# 3. FB CAPI INTEGRATION POINTS CHECK
# ============================================
header "3. FB CAPI INTEGRATION POINTS CHECK"

# Check success page has FB tracking
info "Checking success page..."
if grep -q "fb_purchase_data\|fbCAPI\|fb-event" src/app/\(checkout\)/checkout/success/page.tsx 2>/dev/null; then
  pass "Success page has FB tracking integration"
else
  fail "Success page missing FB tracking"
fi

# Check post-purchase offer has FB CAPI
info "Checking post-purchase offer..."
if grep -q "fb-event\|getFbCookies" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
  pass "PostPurchaseOffer has FB CAPI tracking"
else
  fail "PostPurchaseOffer missing FB CAPI tracking"
fi

# Check payment-intent API passes FB data to metadata
info "Checking payment-intent API..."
if grep -q "fb_fbc\|fb_fbp\|fb_event_id" src/app/api/payment-intent/route.ts; then
  pass "payment-intent API stores FB tracking data in metadata"
else
  fail "payment-intent API missing FB tracking metadata"
fi

# Check webhook sends FB CAPI event
info "Checking Stripe webhook..."
if grep -q "fbCAPI\|sendServerEvent" src/app/api/webhook/stripe/route.ts 2>/dev/null; then
  pass "Stripe webhook sends FB CAPI event"
else
  info "Stripe webhook doesn't send FB CAPI (may be triggered from success page instead)"
fi

# Check express checkout passes FB data
info "Checking express checkout..."
if grep -q "fbData\|fbc\|fbp" src/components/storefront/cart/CartExpressCheckout.tsx; then
  pass "Express checkout passes FB tracking data"
else
  fail "Express checkout missing FB tracking data"
fi

# Check express checkout API handles FB data
if grep -q "fb_fbc\|fb_fbp\|fb_event_id" src/app/api/express-checkout/route.ts; then
  pass "Express checkout API stores FB tracking metadata"
else
  fail "Express checkout API missing FB tracking metadata"
fi

# ============================================
# 4. LIVE API TEST (requires server running)
# ============================================
header "4. LIVE API TEST"

# Check if dev server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  info "Dev server not running - skipping live API tests"
  info "Start with: npm run dev"
else
  info "Dev server is running - testing FB CAPI endpoint"

  # Generate test event ID
  TEST_EVENT_ID="test_$(date +%s)_$(openssl rand -hex 4)"

  # Make test request to FB event endpoint
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/analytics/fb-event \
    -H "Content-Type: application/json" \
    -d "{
      \"eventName\": \"PageView\",
      \"eventId\": \"$TEST_EVENT_ID\",
      \"eventSourceUrl\": \"https://ultrararelove.com/test\",
      \"userData\": {
        \"email\": \"test@example.com\",
        \"fbc\": \"fb.1.1234567890.abcdef\",
        \"fbp\": \"fb.1.1234567890.123456789\"
      }
    }")

  echo "API Response: $RESPONSE"

  # Check response
  if echo "$RESPONSE" | grep -q '"success":true'; then
    pass "FB CAPI endpoint returned success"

    # Check events_received
    EVENTS_RECEIVED=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('eventsReceived', 0))" 2>/dev/null || echo "0")
    if [ "$EVENTS_RECEIVED" = "1" ]; then
      pass "Facebook received 1 event"
    else
      info "Events received: $EVENTS_RECEIVED"
    fi
  elif echo "$RESPONSE" | grep -q '"error":"Not configured"'; then
    fail "FB CAPI not configured - check env vars"
  else
    fail "FB CAPI endpoint failed"
    echo "Response: $RESPONSE"
  fi

  # Test with purchase event
  info "Testing Purchase event..."
  PURCHASE_EVENT_ID="purchase_test_$(date +%s)_$(openssl rand -hex 4)"

  PURCHASE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/analytics/fb-event \
    -H "Content-Type: application/json" \
    -d "{
      \"eventName\": \"Purchase\",
      \"eventId\": \"$PURCHASE_EVENT_ID\",
      \"eventSourceUrl\": \"https://ultrararelove.com/checkout/success\",
      \"userData\": {
        \"email\": \"customer@test.com\",
        \"firstName\": \"Test\",
        \"lastName\": \"Customer\",
        \"externalId\": \"test-customer-123\"
      },
      \"customData\": {
        \"value\": 37.95,
        \"currency\": \"USD\",
        \"content_ids\": [\"design-1-valentines-pack\"],
        \"content_type\": \"product\",
        \"num_items\": 1
      }
    }")

  echo "Purchase Response: $PURCHASE_RESPONSE"

  if echo "$PURCHASE_RESPONSE" | grep -q '"success":true'; then
    pass "Purchase event sent successfully"
  else
    fail "Purchase event failed"
  fi
fi

# ============================================
# 5. DIRECT FACEBOOK API TEST
# ============================================
header "5. DIRECT FACEBOOK API TEST"

if [ -n "$NEXT_PUBLIC_FB_PIXEL_ID" ] && [ -n "$FB_CONVERSIONS_API_TOKEN" ]; then
  info "Testing direct connection to Facebook Graph API..."

  # Build test payload
  DIRECT_EVENT_ID="direct_test_$(date +%s)_$(openssl rand -hex 4)"
  EVENT_TIME=$(date +%s)

  # Hash email for test
  EMAIL_HASH=$(echo -n "test@example.com" | openssl dgst -sha256 | awk '{print $2}')

  PAYLOAD=$(cat <<EOF
{
  "data": [
    {
      "event_name": "PageView",
      "event_time": $EVENT_TIME,
      "event_id": "$DIRECT_EVENT_ID",
      "event_source_url": "https://ultrararelove.com/test",
      "action_source": "website",
      "user_data": {
        "em": ["$EMAIL_HASH"],
        "client_user_agent": "Test Script/1.0"
      }
    }
  ]
EOF
)

  # Add test event code if available
  if [ -n "$FB_TEST_EVENT_CODE" ]; then
    PAYLOAD=$(echo "$PAYLOAD" | sed 's/}$/,"test_event_code":"'$FB_TEST_EVENT_CODE'"}/')
  fi

  # Close JSON
  PAYLOAD="${PAYLOAD}}"

  # Make request to Facebook
  FB_RESPONSE=$(curl -s -X POST \
    "https://graph.facebook.com/v21.0/${NEXT_PUBLIC_FB_PIXEL_ID}/events?access_token=${FB_CONVERSIONS_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  echo "Facebook Response: $FB_RESPONSE"

  if echo "$FB_RESPONSE" | grep -q '"events_received":1'; then
    pass "Direct Facebook API test successful - 1 event received"
  elif echo "$FB_RESPONSE" | grep -q '"error"'; then
    fail "Facebook API error"
    # Extract error message
    ERROR_MSG=$(echo "$FB_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('message','Unknown'))" 2>/dev/null || echo "$FB_RESPONSE")
    echo "Error: $ERROR_MSG"
  else
    info "Facebook response: $FB_RESPONSE"
  fi

  # Provide Events Manager test link
  if [ -n "$FB_TEST_EVENT_CODE" ]; then
    echo ""
    info "To verify in Events Manager:"
    echo "   1. Go to: https://business.facebook.com/events_manager"
    echo "   2. Select your pixel: $NEXT_PUBLIC_FB_PIXEL_ID"
    echo "   3. Click 'Test Events' tab"
    echo "   4. Look for event_id: $DIRECT_EVENT_ID"
    echo "   5. Test code: $FB_TEST_EVENT_CODE"
  fi
else
  fail "Cannot test - FB credentials not configured"
fi

# ============================================
# 6. EVENT DEDUPLICATION CHECK
# ============================================
header "6. EVENT DEDUPLICATION CHECK"

info "Checking deduplication setup..."

# Check success page uses same eventId
if grep -q "eventId.*purchaseEventId\|eventId:.*purchaseEventId" src/app/\(checkout\)/checkout/success/page.tsx 2>/dev/null; then
  pass "Success page uses consistent eventId"
else
  info "Checking alternative deduplication patterns..."
  if grep -q "sessionStorage.*eventId\|fb_purchase_data" src/app/\(checkout\)/checkout/success/page.tsx 2>/dev/null; then
    pass "Success page stores eventId in sessionStorage for deduplication"
  fi
fi

# Check PostPurchaseOffer generates and uses eventId
if grep -q "generateEventId" src/components/storefront/checkout/PostPurchaseOffer.tsx; then
  pass "PostPurchaseOffer generates unique eventId"
else
  fail "PostPurchaseOffer missing eventId generation"
fi

# Check CartExpressCheckout generates eventId
if grep -q "generateEventId\|purchaseEventId" src/components/storefront/cart/CartExpressCheckout.tsx; then
  pass "CartExpressCheckout generates unique eventId"
else
  fail "CartExpressCheckout missing eventId generation"
fi

# ============================================
# SUMMARY
# ============================================
header "TEST SUMMARY"

TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo -e "  ${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
echo "  Total:  $TOTAL"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ALL FACEBOOK TRACKING TESTS PASSED!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}  $FAIL_COUNT TEST(S) FAILED - Please review above${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi
