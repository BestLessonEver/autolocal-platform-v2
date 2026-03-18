/**
 * Vercel Domains Registrar API client
 * Replaces Namecheap — simpler, one vendor, auto-DNS + SSL
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || ''
const BASE = 'https://api.vercel.com/v1/registrar'

function teamParam(): string {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
}

function headers() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

// Our retail markup over Vercel wholesale
const MARKUP: Record<string, { register: number; renew: number }> = {
  com:  { register: 17.99, renew: 17.99 },
  net:  { register: 18.99, renew: 18.99 },
  org:  { register: 14.99, renew: 17.99 },
  co:   { register: 24.99, renew: 34.99 },
  us:   { register: 12.99, renew: 12.99 },
  biz:  { register: 24.99, renew: 29.99 },
}

export interface DomainAvailability {
  domain: string
  available: boolean
  purchasePrice: number | null
  renewalPrice: number | null
  retailPrice: number | null    // what we charge
  retailRenew: number | null    // what we charge on renewal
}

/**
 * Check availability + pricing for multiple domains in one call
 */
export async function checkAvailability(domains: string[]): Promise<DomainAvailability[]> {
  // 1. Bulk availability check
  const availRes = await fetch(`${BASE}/domains/availability${teamParam()}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ domains }),
  })

  if (!availRes.ok) {
    const err = await availRes.text()
    throw new Error(`Vercel availability check failed: ${err}`)
  }

  const { results } = await availRes.json() as {
    results: { domain: string; available: boolean }[]
  }

  // 2. Get pricing for available domains (parallel)
  const enriched = await Promise.all(
    results.map(async (r) => {
      if (!r.available) {
        return {
          domain: r.domain,
          available: false,
          purchasePrice: null,
          renewalPrice: null,
          retailPrice: null,
          retailRenew: null,
        }
      }

      try {
        const priceRes = await fetch(
          `${BASE}/domains/${r.domain}/price${teamParam()}`,
          { headers: headers() }
        )

        if (priceRes.ok) {
          const price = await priceRes.json() as {
            purchasePrice: number | null
            renewalPrice: number | null
          }

          const tld = r.domain.split('.').pop() || ''
          const markup = MARKUP[tld]

          return {
            domain: r.domain,
            available: true,
            purchasePrice: price.purchasePrice,
            renewalPrice: price.renewalPrice,
            retailPrice: markup?.register ?? (price.purchasePrice ? Math.ceil(price.purchasePrice * 1.5 * 100) / 100 : null),
            retailRenew: markup?.renew ?? (price.renewalPrice ? Math.ceil(price.renewalPrice * 1.5 * 100) / 100 : null),
          }
        }
      } catch { /* fall through */ }

      // Pricing failed — use markup table only
      const tld = r.domain.split('.').pop() || ''
      const markup = MARKUP[tld]
      return {
        domain: r.domain,
        available: true,
        purchasePrice: null,
        renewalPrice: null,
        retailPrice: markup?.register ?? 17.99,
        retailRenew: markup?.renew ?? 17.99,
      }
    })
  )

  return enriched
}

/**
 * Register a domain via Vercel
 * Domain is instantly available on Vercel — no DNS setup needed
 */
export async function registerDomain(
  domain: string,
  expectedPrice: number,
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    city: string
    state: string
    zip: string
    country: string
    companyName?: string
  }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const res = await fetch(`${BASE}/domains/${domain}/buy${teamParam()}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      autoRenew: true,
      years: 1,
      expectedPrice,
      contactInformation: contactInfo,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    return { success: false, error: err.message || `Registration failed (${res.status})` }
  }

  const data = await res.json()
  return { success: true, orderId: data.orderId }
}

/**
 * Add domain to a Vercel project (connects DNS)
 */
export async function addDomainToProject(domain: string, projectId: string): Promise<boolean> {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/domains${teamParam()}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name: domain }),
    }
  )

  return res.ok
}

export const SUPPORTED_TLDS = Object.keys(MARKUP)
