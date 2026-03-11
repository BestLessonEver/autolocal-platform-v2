import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability, getPricing } from '@/lib/namecheap'

// Common TLDs to check alongside the requested domain
const TLDS = ['com', 'net', 'co', 'io', 'ai', 'biz', 'info', 'us']

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
    
    // Fallback pricing by TLD (Namecheap approximate rates)
    const FALLBACK_PRICES: Record<string, { register: number; renew: number }> = {
      com: { register: 10.98, renew: 14.98 },
      net: { register: 12.98, renew: 14.98 },
      co:  { register: 11.98, renew: 30.98 },
      io:  { register: 32.98, renew: 39.98 },
      ai:  { register: 74.98, renew: 74.98 },
      biz: { register: 11.98, renew: 17.98 },
      info: { register: 4.98, renew: 19.98 },
      us:  { register: 5.98, renew: 9.98 },
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
