#!/bin/bash
# PostHog ingestion smoke test
# Usage: NEXT_PUBLIC_POSTHOG_KEY=phc_xxx bash scripts/test-posthog-event.sh

set -e

if [ -z "$NEXT_PUBLIC_POSTHOG_KEY" ]; then
  echo "Missing NEXT_PUBLIC_POSTHOG_KEY"
  exit 1
fi

POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST:-https://us.i.posthog.com}"
EVENT_NAME="${POSTHOG_TEST_EVENT:-pmh_posthog_test}"

PAYLOAD=$(cat <<EOF
{
  "api_key": "$NEXT_PUBLIC_POSTHOG_KEY",
  "event": "$EVENT_NAME",
  "distinct_id": "posthog-test-cli",
  "properties": {
    "source": "cli",
    "env": "manual"
  }
}
EOF
)

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$POSTHOG_HOST/capture/" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$STATUS" = "200" ]; then
  echo "OK: PostHog capture accepted (200)"
  echo "Check PostHog Live Events for: $EVENT_NAME"
else
  echo "ERROR: PostHog capture failed (HTTP $STATUS)"
  exit 1
fi
