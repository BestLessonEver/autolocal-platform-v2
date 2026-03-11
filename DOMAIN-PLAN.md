# Custom Domain Integration — Architecture Plan

## Goal
Users should NEVER see a DNS settings page. AutoLocal handles everything:
1. User searches for a domain → sees availability + price
2. User picks a domain → we register it
3. DNS + SSL configured automatically → site goes live on their .com

## Two Systems Needed

### 1. Domain Registration (Namecheap API)
- **Why Namecheap**: Full REST API with `domains.create`, sandbox for testing, at-cost .com ~$10-13/yr
- **Why NOT Cloudflare**: No registration API (dashboard-only). Can only transfer/manage existing domains.
- **Flow**: Check availability → register with Namecheap API → set DNS to point to our infrastructure
- **Requirements**: Namecheap API key, account balance (prepaid), IP whitelisting
- **Sandbox**: `api.sandbox.namecheap.com` for testing with fake money

### 2. Domain Routing + SSL (Cloudflare for SaaS)
- **Why**: Industry standard for multi-tenant custom domains. Auto-SSL, $0.10/domain/month, 100 free.
- **Flow**: Add custom hostname via API → Cloudflare issues SSL → routes traffic to our origin
- **Fallback origin**: `autolocal.ai` zone, traffic routes to Railway app
- **Requirements**: Cloudflare account with autolocal.ai zone, CF for SaaS enabled

### Alternative: Skip Cloudflare for SaaS, use Vercel
- Vercel already handles our `slug.autolocal.ai` subdomains
- Vercel API supports adding custom domains to projects
- `POST /v10/projects/{projectId}/domains` with `{ name: "custom.com" }`
- Vercel handles SSL automatically
- **Simpler** — no second infrastructure layer
- **Tradeoff**: Tied to Vercel, less control

## Recommended Architecture (Phase 1 — Ship Fast)

### Registration: Namecheap API
### Routing: Vercel Custom Domains API (we already deploy there)

This avoids adding Cloudflare for SaaS as a new layer. Vercel already hosts the sites.

## User Flow

### In Dashboard (new "Domain" section)
1. **Search box**: "Find your perfect domain" → `domains.check` API
2. **Results**: Available .com, .net, .io with prices
3. **Purchase**: Click "Get This Domain — $12/yr" → Stripe one-time charge
4. **Auto-setup**: 
   - Register via Namecheap API (with AutoLocal's WHOIS info + privacy)
   - Set nameservers or CNAME to Vercel
   - Add domain to Vercel project
   - Update `custom_domain` in DB
   - Send "Your domain is live!" email
5. **Done**: User sees their site at `mybusiness.com` within minutes

### Already Have a Domain?
- "I already have a domain" option
- Shows current setup page instructions (CNAME to slug.autolocal.ai)
- OR: "Transfer to us" flow (Namecheap transfer API)

## Pricing Options
- **Bundle into $9/mo**: Domain included (we eat ~$1/mo cost) — massive differentiator
- **$12/yr add-on**: Pass through at cost
- **$15/yr add-on**: Small markup

## Database Changes
- `domain_provider`: 'namecheap' | 'external' | null
- `domain_registrar_id`: Namecheap domain ID for management
- `domain_status`: 'searching' | 'registering' | 'configuring_dns' | 'active' | 'failed'
- `domain_expires_at`: timestamptz
- `domain_auto_renew`: boolean

## API Routes Needed
- `POST /api/domains/search` — check availability via Namecheap
- `POST /api/domains/register` — purchase + auto-configure
- `GET /api/domains/status` — check propagation status
- `POST /api/domains/connect` — for users bringing their own domain (existing flow)

## Environment Variables
- `NAMECHEAP_API_USER` 
- `NAMECHEAP_API_KEY`
- `NAMECHEAP_CLIENT_IP` (whitelisted IP — Railway's outbound IP)
- `NAMECHEAP_SANDBOX` (true/false)

## Risks & Mitigations
- **Namecheap API downtime**: Registration is async — queue + retry
- **DNS propagation delay**: Show "Setting up..." status, poll until live
- **Railway IP changes**: Need static outbound IP or use proxy
- **Domain renewal**: Cron job to check expiring domains, auto-renew via API
- **Refunds**: If site is cancelled, domain is still theirs (registered to them)

## Build Order
1. ✅ Worktree created (`feature/custom-domains`)
2. Domain search API + dashboard UI (search box + results)
3. Namecheap sandbox integration (register test domains)
4. Auto-DNS configuration after registration
5. Vercel custom domain API integration
6. Stripe one-time charge for domain
7. Domain status polling + "Your domain is live!" email
8. Dashboard domain management (view, auto-renew toggle)
9. Production: Get Namecheap API key, fund account, whitelist IP
10. Merge to main
