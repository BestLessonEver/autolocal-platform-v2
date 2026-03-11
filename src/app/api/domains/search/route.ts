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
    
    // Get .com pricing (use as baseline)
    let pricing = { register: 10.98, renew: 12.98 }
    try {
      pricing = await getPricing('com')
    } catch {
      // Use defaults if pricing API fails
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
      results: sorted.map(r => ({
        ...r,
        price: r.available ? pricing.register : undefined,
        renewPrice: r.available ? pricing.renew : undefined,
      })),
      searchName,
    })
  } catch (err) {
    console.error('[domains/search]', err)
    return NextResponse.json({ error: 'Domain search failed. Please try again.' }, { status: 500 })
  }
}
