#!/bin/bash
# AutoLocal Post-Deploy Smoke Test
# Runs after every Railway deploy to verify critical endpoints
# Usage: bash scripts/smoke-test.sh [base_url]
#
# Exit codes:
#   0 = all checks passed
#   1 = one or more checks failed

set -euo pipefail

BASE_URL="${1:-https://autolocal-platform-v2-production.up.railway.app}"
PASSED=0
FAILED=0
WARNINGS=0
RESULTS=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"
  local check_body="${4:-}"

  local response
  local http_code
  local body

  response=$(curl -sS -w "\n%{http_code}" --max-time 15 "$url" 2>&1) || {
    FAILED=$((FAILED + 1))
    RESULTS+=("${RED}✗ ${name}${NC} — connection failed (timeout or DNS)")
    return
  }

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    if [ -n "$check_body" ]; then
      if echo "$body" | grep -q "$check_body"; then
        PASSED=$((PASSED + 1))
        RESULTS+=("${GREEN}✓ ${name}${NC} — HTTP $http_code, body check passed")
      else
        FAILED=$((FAILED + 1))
        RESULTS+=("${RED}✗ ${name}${NC} — HTTP $http_code but missing expected content: '$check_body'")
      fi
    else
      PASSED=$((PASSED + 1))
      RESULTS+=("${GREEN}✓ ${name}${NC} — HTTP $http_code")
    fi
  else
    FAILED=$((FAILED + 1))
    RESULTS+=("${RED}✗ ${name}${NC} — expected HTTP $expected_status, got $http_code")
  fi
}

check_json() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  local response
  local http_code
  local body

  response=$(curl -sS -w "\n%{http_code}" --max-time 15 -H "Content-Type: application/json" "$url" 2>&1) || {
    FAILED=$((FAILED + 1))
    RESULTS+=("${RED}✗ ${name}${NC} — connection failed")
    return
  }

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    # Verify it's actually JSON
    if echo "$body" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
      PASSED=$((PASSED + 1))
      RESULTS+=("${GREEN}✓ ${name}${NC} — HTTP $http_code, valid JSON")
    else
      WARNINGS=$((WARNINGS + 1))
      RESULTS+=("${YELLOW}⚠ ${name}${NC} — HTTP $http_code but response is not valid JSON")
    fi
  else
    FAILED=$((FAILED + 1))
    RESULTS+=("${RED}✗ ${name}${NC} — expected HTTP $expected_status, got $http_code")
  fi
}

echo ""
echo "🔍 AutoLocal Post-Deploy Smoke Test"
echo "   Target: $BASE_URL"
echo "   Time:   $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Core Pages ──────────────────────────────────
echo "📄 Core Pages"
check "Landing page" "$BASE_URL" 200 "autolocal"
check "About page" "$BASE_URL/about" 200
check "Thank-you page" "$BASE_URL/thank-you" 200
check "Auth auto-login page" "$BASE_URL/auth/auto-login" 200
echo ""

# ── API Health ──────────────────────────────────
echo "🔌 API Endpoints"
# Search business is POST-only, so GET should return 405 (not 500)
check "Search business API (method check)" "$BASE_URL/api/search-business" 405
# Generate preview is POST-only
check "Generate preview API (method check)" "$BASE_URL/api/generate-preview" 405
# Admin endpoint (should return 401 without auth, not 500)
check "Admin API (unauthed)" "$BASE_URL/api/admin/clients" 401
# Dashboard me (should return 401 without auth, not 500)
check "Dashboard API (unauthed)" "$BASE_URL/api/dashboard/me" 401
# Deploy endpoint exists
check "Deploy API (method check)" "$BASE_URL/api/deploy" 405
echo ""

# ── Preview System ──────────────────────────────
echo "🖼️  Preview System"
# Check if any existing preview loads (will 404 if slug doesn't exist, which is fine)
check "Preview route exists" "$BASE_URL/preview/test-nonexistent" 404
echo ""

# ── Stripe Webhook ──────────────────────────────
echo "💳 Stripe"
# Checkout endpoint should exist
check "Checkout API (method check)" "$BASE_URL/api/checkout" 405
echo ""

# ── Static Assets ───────────────────────────────
echo "📦 Response Time"
# Check that the landing page responds within a reasonable time
start_time=$(python3 -c "import time; print(time.time())")
curl -sS --max-time 10 -o /dev/null "$BASE_URL" 2>/dev/null
end_time=$(python3 -c "import time; print(time.time())")
load_time=$(python3 -c "print(f'{$end_time - $start_time:.2f}')")
if python3 -c "exit(0 if $end_time - $start_time < 5 else 1)"; then
  PASSED=$((PASSED + 1))
  RESULTS+=("${GREEN}✓ Landing page load time${NC} — ${load_time}s")
else
  WARNINGS=$((WARNINGS + 1))
  RESULTS+=("${YELLOW}⚠ Landing page load time${NC} — ${load_time}s (slow)")
fi
echo ""

# ── Results ─────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
for result in "${RESULTS[@]}"; do
  echo -e "  $result"
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Passed: $PASSED${NC}  ${RED}Failed: $FAILED${NC}  ${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "  ${RED}❌ SMOKE TEST FAILED — $FAILED check(s) need attention${NC}"
  echo ""
  exit 1
else
  echo -e "  ${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo ""
  exit 0
fi
