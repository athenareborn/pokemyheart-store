#!/bin/bash
# Full Analytics Testing Script
# Run with: bash scripts/test-analytics-full.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
}

fail() {
    echo -e "  ${RED}✗${NC} $1"
    FAIL=$((FAIL + 1))
}

warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARN=$((WARN + 1))
}

info() {
    echo -e "  ${BLUE}ℹ${NC} $1"
}

# ============================================================================
# PHASE 1: Environment Variables
# ============================================================================
print_header "PHASE 1: Environment Variables Check"

check_env() {
    local var_name=$1
    local required=$2
    local value=$(printenv $var_name)

    if [ -n "$value" ]; then
        local preview="${value:0:15}..."
        pass "$var_name = $preview"
        return 0
    else
        if [ "$required" = "required" ]; then
            fail "$var_name is MISSING (required)"
            return 0
        else
            warn "$var_name is not set (optional)"
            return 0
        fi
    fi
}

# Required variables
check_env "NEXT_PUBLIC_FB_PIXEL_ID" "required"
check_env "FB_CONVERSIONS_API_TOKEN" "required"
check_env "NEXT_PUBLIC_GA_MEASUREMENT_ID" "required"
check_env "GA_API_SECRET" "required"
check_env "NEXT_PUBLIC_POSTHOG_KEY" "required"
check_env "NEXT_PUBLIC_POSTHOG_HOST" "required"
check_env "NEXT_PUBLIC_SUPABASE_URL" "required"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "required"
check_env "SUPABASE_SERVICE_ROLE_KEY" "required"

# Optional variables
check_env "FB_TEST_EVENT_CODE" "optional"

# ============================================================================
# PHASE 2: Code Implementation Checks
# ============================================================================
print_header "PHASE 2: Code Implementation Verification"

# Check FB Pixel component exists
if [ -f "src/components/analytics/FacebookPixel.tsx" ]; then
    pass "FacebookPixel.tsx exists"

    # Check for key implementations
    if grep -q "fbq('track'" src/components/analytics/FacebookPixel.tsx 2>/dev/null || \
       grep -q "window.fbq" src/lib/analytics/fpixel.ts 2>/dev/null; then
        pass "FB Pixel tracking calls found"
    else
        fail "FB Pixel tracking calls not found"
    fi
else
    fail "FacebookPixel.tsx missing"
fi

# Check GA4 component
if [ -f "src/components/analytics/GoogleAnalytics.tsx" ]; then
    pass "GoogleAnalytics.tsx exists"
else
    fail "GoogleAnalytics.tsx missing"
fi

# Check CAPI implementation
if [ -f "src/lib/analytics/facebook-capi.ts" ]; then
    pass "Facebook CAPI library exists"

    # Check for SHA256 hashing
    if grep -q "sha256" src/lib/analytics/facebook-capi.ts 2>/dev/null || \
       grep -q "sha256" src/lib/analytics/hash.ts 2>/dev/null; then
        pass "SHA256 hashing implemented"
    else
        fail "SHA256 hashing not found (required for CAPI)"
    fi

    # Check for event_id (deduplication)
    if grep -q "event_id" src/lib/analytics/facebook-capi.ts 2>/dev/null; then
        pass "Event ID deduplication implemented"
    else
        warn "Event ID deduplication may be missing"
    fi
else
    fail "Facebook CAPI library missing"
fi

# Check GA4 server-side
if [ -f "src/lib/analytics/ga4-server.ts" ]; then
    pass "GA4 server-side (Measurement Protocol) exists"
else
    warn "GA4 server-side not implemented"
fi

# Check PostHog
if [ -f "src/lib/analytics/posthog.ts" ]; then
    pass "PostHog library exists"
else
    warn "PostHog library not found"
fi

# Check custom tracker
if [ -f "src/lib/analytics/tracker.ts" ]; then
    pass "Custom Supabase tracker exists"
else
    warn "Custom tracker not found"
fi

# Check API routes
if [ -f "src/app/api/analytics/fb-event/route.ts" ]; then
    pass "FB CAPI API endpoint exists"
else
    fail "FB CAPI API endpoint missing"
fi

if [ -f "src/app/api/analytics/track/route.ts" ]; then
    pass "Custom tracking API endpoint exists"
else
    warn "Custom tracking API endpoint missing"
fi

# ============================================================================
# PHASE 3: Event Implementation Audit
# ============================================================================
print_header "PHASE 3: Event Implementation Audit"

# Check for key FB events in codebase
echo "  Checking Facebook events..."

FB_EVENTS=("PageView" "ViewContent" "AddToCart" "InitiateCheckout" "Purchase")
for event in "${FB_EVENTS[@]}"; do
    if grep -r "$event" src/lib/analytics src/components/analytics 2>/dev/null | grep -q .; then
        pass "FB Event: $event implemented"
    else
        warn "FB Event: $event may not be implemented"
    fi
done

# Check for key GA4 events
echo ""
echo "  Checking GA4 events..."

GA4_EVENTS=("view_item" "add_to_cart" "begin_checkout" "purchase")
for event in "${GA4_EVENTS[@]}"; do
    if grep -r "'$event'" src/lib/analytics 2>/dev/null | grep -q .; then
        pass "GA4 Event: $event implemented"
    else
        warn "GA4 Event: $event may not be implemented"
    fi
done

# ============================================================================
# PHASE 4: API Endpoint Tests (requires dev server)
# ============================================================================
print_header "PHASE 4: API Endpoint Tests"

# Check if dev server is running
DEV_URL="http://localhost:3000"
if curl -s -o /dev/null -w "%{http_code}" "$DEV_URL" | grep -q "200\|301\|302"; then
    pass "Dev server is running at $DEV_URL"
    SERVER_RUNNING=true
else
    warn "Dev server not running - skipping API tests"
    info "Start with: npm run dev"
    SERVER_RUNNING=false
fi

if [ "$SERVER_RUNNING" = true ]; then
    # Test FB CAPI endpoint
    echo ""
    echo "  Testing FB CAPI endpoint..."

    EVENT_ID="test-$(date +%s)"
    CAPI_RESPONSE=$(curl -s -X POST "$DEV_URL/api/analytics/fb-event" \
        -H "Content-Type: application/json" \
        -d "{
            \"eventName\": \"PageView\",
            \"eventId\": \"$EVENT_ID\",
            \"eventSourceUrl\": \"$DEV_URL/test\",
            \"userData\": {
                \"email\": \"test@example.com\"
            }
        }" 2>&1)

    if echo "$CAPI_RESPONSE" | grep -q "success.*true\|eventsReceived"; then
        pass "FB CAPI endpoint working"
        info "Response: $CAPI_RESPONSE"
    elif echo "$CAPI_RESPONSE" | grep -q "error"; then
        fail "FB CAPI endpoint returned error"
        info "Response: $CAPI_RESPONSE"
    else
        warn "FB CAPI endpoint response unclear"
        info "Response: $CAPI_RESPONSE"
    fi

    # Test custom tracking endpoint
    echo ""
    echo "  Testing custom tracking endpoint..."

    TRACK_RESPONSE=$(curl -s -X POST "$DEV_URL/api/analytics/track" \
        -H "Content-Type: application/json" \
        -d "{
            \"event_type\": \"test_event\",
            \"event_data\": {\"test\": true},
            \"session_id\": \"test-session-$EVENT_ID\",
            \"page_path\": \"/test\"
        }" 2>&1)

    if echo "$TRACK_RESPONSE" | grep -qE "success|200|ok|created"; then
        pass "Custom tracking endpoint working"
    elif echo "$TRACK_RESPONSE" | grep -q "error"; then
        fail "Custom tracking endpoint returned error"
        info "Response: $TRACK_RESPONSE"
    else
        # Empty response might mean success
        if [ -z "$TRACK_RESPONSE" ] || [ "$TRACK_RESPONSE" = "{}" ]; then
            pass "Custom tracking endpoint appears working (empty response)"
        else
            warn "Custom tracking endpoint response unclear"
            info "Response: $TRACK_RESPONSE"
        fi
    fi
fi

# ============================================================================
# PHASE 5: Direct Facebook API Test
# ============================================================================
print_header "PHASE 5: Direct Facebook API Test"

FB_PIXEL_ID="$NEXT_PUBLIC_FB_PIXEL_ID"
FB_TOKEN="$FB_CONVERSIONS_API_TOKEN"
FB_TEST_CODE="$FB_TEST_EVENT_CODE"

if [ -n "$FB_PIXEL_ID" ] && [ -n "$FB_TOKEN" ]; then
    echo "  Testing direct connection to Facebook Graph API..."

    # Build test event payload
    TIMESTAMP=$(date +%s)
    TEST_EVENT_ID="direct-test-$TIMESTAMP"

    # Hash test email
    TEST_EMAIL_HASH=$(echo -n "test@example.com" | shasum -a 256 | cut -d' ' -f1)

    # Build payload
    if [ -n "$FB_TEST_CODE" ]; then
        TEST_CODE_PARAM="\"test_event_code\": \"$FB_TEST_CODE\","
        info "Using test event code: $FB_TEST_CODE"
    else
        TEST_CODE_PARAM=""
        warn "No test event code set - event will go to production"
    fi

    FB_PAYLOAD=$(cat <<EOF
{
    "data": [{
        "event_name": "PageView",
        "event_time": $TIMESTAMP,
        "event_id": "$TEST_EVENT_ID",
        "action_source": "website",
        "user_data": {
            "em": ["$TEST_EMAIL_HASH"],
            "client_ip_address": "127.0.0.1",
            "client_user_agent": "Mozilla/5.0 (Test)"
        }
    }],
    $TEST_CODE_PARAM
    "access_token": "$FB_TOKEN"
}
EOF
)

    FB_RESPONSE=$(curl -s -X POST \
        "https://graph.facebook.com/v21.0/$FB_PIXEL_ID/events" \
        -H "Content-Type: application/json" \
        -d "$FB_PAYLOAD" 2>&1)

    if echo "$FB_RESPONSE" | grep -q "events_received"; then
        EVENTS_RECEIVED=$(echo "$FB_RESPONSE" | grep -o '"events_received":[0-9]*' | cut -d':' -f2)
        pass "Facebook API connection successful (events_received: $EVENTS_RECEIVED)"

        if [ -n "$FB_TEST_CODE" ]; then
            info "Check FB Events Manager → Test Events for event ID: $TEST_EVENT_ID"
        fi
    else
        fail "Facebook API connection failed"
        info "Response: $FB_RESPONSE"
    fi
else
    warn "Skipping Facebook API test - missing credentials"
fi

# ============================================================================
# PHASE 6: Database Schema Check
# ============================================================================
print_header "PHASE 6: Database Schema Verification"

if [ -d "supabase/migrations" ]; then
    pass "Supabase migrations directory exists"

    # Check for analytics tables in migrations
    if grep -r "analytics_events" supabase/migrations/*.sql 2>/dev/null | grep -q .; then
        pass "analytics_events table defined"
    else
        warn "analytics_events table not found in migrations"
    fi

    if grep -r "analytics_sessions" supabase/migrations/*.sql 2>/dev/null | grep -q .; then
        pass "analytics_sessions table defined"
    else
        warn "analytics_sessions table not found in migrations"
    fi

    if grep -r "analytics_daily" supabase/migrations/*.sql 2>/dev/null | grep -q .; then
        pass "analytics_daily table defined"
    else
        warn "analytics_daily table not found in migrations"
    fi
else
    warn "No Supabase migrations directory found"
fi

# ============================================================================
# PHASE 7: Admin Dashboard Check
# ============================================================================
print_header "PHASE 7: Admin Dashboard Verification"

if [ -f "src/app/admin/analytics/page.tsx" ] || [ -f "src/app/(admin)/admin/analytics/page.tsx" ]; then
    pass "Admin analytics page exists"
else
    # Check alternative locations
    ANALYTICS_PAGE=$(find src -name "page.tsx" -path "*admin*analytics*" 2>/dev/null | head -1)
    if [ -n "$ANALYTICS_PAGE" ]; then
        pass "Admin analytics page found at: $ANALYTICS_PAGE"
    else
        warn "Admin analytics page not found"
    fi
fi

if [ -f "src/components/admin/analytics.tsx" ]; then
    pass "Admin analytics component exists"

    # Check for key dashboard elements
    if grep -q "Conversion" src/components/admin/analytics.tsx 2>/dev/null; then
        pass "Conversion metrics implemented"
    fi

    if grep -q "Revenue" src/components/admin/analytics.tsx 2>/dev/null; then
        pass "Revenue metrics implemented"
    fi
else
    warn "Admin analytics component not found"
fi

# ============================================================================
# SUMMARY
# ============================================================================
print_header "TEST SUMMARY"

TOTAL=$((PASS + FAIL + WARN))

echo ""
echo -e "  ${GREEN}Passed:${NC}  $PASS"
echo -e "  ${RED}Failed:${NC}  $FAIL"
echo -e "  ${YELLOW}Warnings:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}  ALL CRITICAL CHECKS PASSED${NC}"
    echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${RED}  $FAIL CRITICAL CHECKS FAILED - FIX BEFORE LAUNCH${NC}"
    echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo "  Next Steps:"
echo "  1. Fix any failed checks"
echo "  2. Run manual browser tests (see ANALYTICS-TEST-PLAN.md)"
echo "  3. Complete end-to-end purchase test"
echo "  4. Verify in FB Events Manager and GA4 Real-Time"
echo ""

exit $FAIL
