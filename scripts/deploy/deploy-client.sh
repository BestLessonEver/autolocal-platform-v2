#!/bin/bash
#
# deploy-client.sh — Generate and deploy a client site to Vercel
#
# Usage:
#   ./deploy-client.sh <slug> [domain]
#
# Examples:
#   ./deploy-client.sh for-him-mens-salon-friendswood
#   ./deploy-client.sh for-him-mens-salon-friendswood forhimmens.com
#
# Requires: vercel CLI (npm i -g vercel), npx tsx, Supabase env vars
#

set -euo pipefail

SLUG="${1:?Usage: deploy-client.sh <slug> [domain]}"
DOMAIN="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLIENT_SITES_DIR="$PROJECT_DIR/client-sites"
SITE_DIR="$CLIENT_SITES_DIR/$SLUG"

# Load env vars from .env.local
if [ -f "$PROJECT_DIR/.env.local" ]; then
  set -a
  source "$PROJECT_DIR/.env.local"
  set +a
fi

echo "╔══════════════════════════════════════════════╗"
echo "║     AutoLocal — Client Site Deployment       ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Slug:   $SLUG"
echo "║  Domain: ${DOMAIN:-none (Vercel subdomain only)}"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Step 1: Generate static site
echo "📦 Step 1: Generating static site..."
cd "$SCRIPT_DIR"
npx tsx generate-static-site.ts "$SLUG" --out "$SITE_DIR"
echo ""

# Step 2: Deploy to Vercel
echo "🚀 Step 2: Deploying to Vercel..."
cd "$SITE_DIR"

# Create a new Vercel project with the slug as the name
# Use token from env
VERCEL_TOKEN="${VERCEL_TOKEN:?Missing VERCEL_TOKEN — set in .env.local or export it}"
VERCEL_URL=$(vercel deploy --prod --yes --name "autolocal-$SLUG" --token "$VERCEL_TOKEN" 2>&1 | tee /dev/stderr | grep -oE 'https://autolocal[^ ]+\.vercel\.app' | tail -1)

if [ -z "$VERCEL_URL" ]; then
  echo "❌ Deployment failed. Check vercel output above."
  exit 1
fi

echo "✅ Deployed to: $VERCEL_URL"
echo ""

# Step 3: Add custom domain (if provided)
if [ -n "$DOMAIN" ]; then
  echo "🌐 Step 3: Adding custom domain: $DOMAIN"
  vercel domains add "$DOMAIN" "autolocal-$SLUG" --token "$VERCEL_TOKEN" 2>&1 || true
  echo ""
  echo "📋 DNS Setup Required:"
  echo "   Add an A record:     @ → 76.76.21.21"
  echo "   Add a CNAME record:  www → cname.vercel-dns.com"
  echo ""
  echo "   Or point nameservers to Vercel:"
  echo "   ns1.vercel-dns.com"
  echo "   ns2.vercel-dns.com"
  echo ""
fi

# Step 4: Summary
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Deployment Complete!                     ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Vercel URL:  $VERCEL_URL"
[ -n "$DOMAIN" ] && echo "║  Domain:      https://$DOMAIN (pending DNS)"
echo "║  Local files: $SITE_DIR"
echo "╚══════════════════════════════════════════════╝"
