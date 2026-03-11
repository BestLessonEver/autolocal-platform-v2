import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability, getPricing } from '@/lib/namecheap'

// Common TLDs to check alongside the requested domain
const TLDS = ['com', 'net', 'org', 'co', 'us', 'biz']

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }

    // Clean the query — strip spaces, special chars
    const clean = query.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!clean || clean.length < 2) {
      return NextResponse.json({ error: 'Domain name too short' }, { status: 400 })
    }

    // If user typed a full domain (e.g. "mybusiness.com"), parse it
    const parts = query.toLowerCase().trim().split('.')
    let searchName = clean
    if (parts.length >= 2 && TLDS.includes(parts[parts.length - 1])) {
      searchName = parts.slice(0, -1).join('')
    }

    // Build list of domains to check
    const domainsToCheck = TLDS.map(tld => `${searchName}.${tld}`)
    
    // Check availability
    const results = await checkAvailability(domainsToCheck)
    
    // Retail pricing by TLD — based on actual Namecheap API costs + markup
    // Format: { register: first year price, renew: annual renewal price }
    // Stripe takes 2.9% + $0.30 per charge
    //
    // Actual Namecheap costs (YourPrice):
    //   .com: register $11.48, renew $15.18  → sell $17.99, profit ~$2-4
    //   .net: register $13.18, renew $15.18  → sell $18.99, profit ~$2-4
    //   .co:  register $6.98,  renew $33.98  → sell $39.99 (renewal is brutal)
    //   .io:  register $34.98, renew $75.98  → sell $84.99
    //   .us:  register $5.98,  renew $8.48   → sell $12.99
    //   .info: register $4.18, renew $29.18  → sell $34.99
    //   .biz:  register $8.68, renew $21.18  → sell $24.99
    //   .ai:  not available via API
    const FALLBACK_PRICES: Record<string, { register: number; renew: number }> = {
      com:  { register: 17.99, renew: 17.99 },
      net:  { register: 18.99, renew: 18.99 },
      org:  { register: 14.99, renew: 17.99 },
      co:   { register: 14.99, renew: 39.99 },
      us:   { register: 9.99,  renew: 12.99 },

      biz:  { register: 14.99, renew: 24.99 },
    }

    // Try to get live pricing for .com (fallback to hardcoded if API fails)
    try {
      const comPricing = await getPricing('com')
      FALLBACK_PRICES.com = comPricing
    } catch {
      // Use fallback
    }

    // Sort: available first, .com first among available
    const sorted = results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1
      const aIsCom = a.domain.endsWith('.com')
      const bIsCom = b.domain.endsWith('.com')
      if (aIsCom !== bIsCom) return aIsCom ? -1 : 1
      return 0
    })

    return NextResponse.json({
      results: sorted.map(r => {
        const tld = r.domain.split('.').pop() || 'com'
        const prices = FALLBACK_PRICES[tld] || FALLBACK_PRICES.com
        return {
          ...r,
          price: r.available ? prices.register : undefined,
          renewPrice: r.available ? prices.renew : undefined,
        }
      }),
      searchName,
    })
  } catch (err) {
    console.error('[domains/search]', err)
    return NextResponse.json({ error: 'Domain search failed. Please try again.' }, { status: 500 })
  }
}
