# AutoLocal Outbound Engine — Brian's Setup Checklist

## Priority 1: Email Sending (CRITICAL — nothing works without this)

### Option A: Resend.com (Recommended — simplest)
1. Go to https://resend.com and create an account
2. Add domain: `autolocal.ai`
3. Resend will give you DNS records to add (TXT records for SPF, DKIM, DMARC)
4. Add those DNS records wherever autolocal.ai DNS is managed (probably Railway or your registrar)
5. Once verified, create an API key
6. Give me: **Resend API key**
7. Cost: Free tier = 100 emails/day, $20/mo = 50,000 emails/mo

### Option B: SendGrid (More established, harder setup)
1. Go to https://sendgrid.com and create account
2. Same DNS verification process
3. Give me the API key
4. Free tier = 100 emails/day

### DNS Records You'll Need to Add (for either option):
- **SPF** TXT record: allows the email service to send on behalf of autolocal.ai
- **DKIM** TXT record: proves emails are legitimate
- **DMARC** TXT record: tells receiving servers how to handle auth failures
- The email provider will give you the exact values — just copy/paste them into your DNS

### Email Address to Create:
- `audits@autolocal.ai` — for sending audit reports
- `hello@autolocal.ai` — general contact/reply-to
- These are set up in the email provider, not separately

---

## Priority 2: Stripe Account for AutoLocal

### If you already have Stripe:
1. Go to https://dashboard.stripe.com
2. Create a new "Product" for each package:
   - **Social Media Revive** — $500 one-time
   - **Full Digital Cleanup** — $1,000 one-time
   - **Growth Engine** — $2,000 one-time (or $2,000 + $199/mo subscription)
   - **New Website + SEO** — $3,500 one-time
   - **Monthly AI Marketing** — $49/$99/$199 per month (subscriptions)
3. Go to Developers → API Keys
4. Give me: **Stripe Secret Key** (starts with sk_live_) and **Publishable Key** (starts with pk_live_)
5. Set up a webhook endpoint (I'll give you the URL once the app is ready)

### If you need a new Stripe account:
1. Go to https://dashboard.stripe.com/register
2. Use autolocal.ai as the business
3. Complete identity verification
4. Same steps as above

---

## Priority 3: Google Places API Key (for prospect finding)

This is how I find businesses in target cities automatically.

1. Go to https://console.cloud.google.com
2. Use the existing project (835237797162) or create a new one for AutoLocal
3. Enable these APIs:
   - **Places API (New)** — for finding businesses
   - **PageSpeed Insights API** — for website speed testing
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key to only those APIs (for security)
6. Give me: **Google API Key**
7. Cost: Places API = $17 per 1,000 requests (finding ~50 businesses per request = ~$0.34 per city scan). PageSpeed = free.

---

## Priority 4: Domain DNS Access

I need to know where autolocal.ai DNS is managed so I can tell you exactly what records to add.

**Check:** Where did you buy autolocal.ai? Common options:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare
- Railway (if using Railway's DNS)

Just tell me which one and I'll give you the exact records.

---

## Priority 5: Railway Environment Variables

Once you have the above, add these to the **autolocal-platform-v2** Railway project:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | (from step 1) |
| `STRIPE_SECRET_KEY` | (from step 2) |
| `STRIPE_PUBLISHABLE_KEY` | (from step 2) |
| `STRIPE_WEBHOOK_SECRET` | (I'll provide after webhook setup) |
| `GOOGLE_PLACES_API_KEY` | (from step 3) |
| `OPENAI_API_KEY` | (already set ✅) |
| `NEXT_PUBLIC_SUPABASE_URL` | (already set ✅) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (already set ✅) |
| `SUPABASE_SERVICE_ROLE_KEY` | (already set ✅) |

---

## Optional But Recommended

### Calendly (for consultation booking)
1. If you don't have one: https://calendly.com (free tier works)
2. Create a "Free Marketing Consultation" event type (30 min)
3. Give me the **Calendly link**
4. This goes on the /custom page and in audit report CTAs

### Separate Reply Email
- Consider setting up a Google Workspace email on autolocal.ai (hello@autolocal.ai) so you can receive and reply to responses
- OR just forward replies to bestlessoninfo@gmail.com
- The email sending service handles outbound; you need something for inbound replies

---

## Timeline

| Task | Time | Priority |
|------|------|----------|
| Resend account + DNS records | 15-20 min | 🔴 Do first |
| Stripe products + API keys | 10-15 min | 🔴 Do second |
| Google Places API key | 10 min | 🟡 Do third |
| Tell me your DNS provider | 1 min | 🟡 |
| Add Railway env vars | 5 min | 🟡 After above |
| Calendly setup | 5 min | 🟢 Can wait |

**Total: ~45-60 minutes of your time. Then I run autonomously.**

---

## What I'm Building Right Now (while you do this):

1. Prospect finder — Google Maps scraper + scoring system
2. Deep audit engine — website speed, reviews, social, competitors
3. Branded report generator — web-based report at /audit/[id]
4. Outbound email templates — the cold email that delivers the report
5. City targeting system — priority-ranked list of 50+ target cities

Questions? Just ask in #autolocal-platform.
