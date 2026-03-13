'use client'

import { useState, useEffect, useRef } from 'react'

interface DomainResult {
  domain: string
  available: boolean
  price?: number
  renewPrice?: number
  isPremium?: boolean
}

interface Props {
  siteId: string
  slug: string
  businessName: string
  email: string
  hostingStatus: string
  currentDomain?: string | null
  onTrackConversion?: (id: string, value: number) => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 63)
}

export default function GoLiveFlow({
  siteId, slug, businessName, email, hostingStatus, currentDomain, onTrackConversion,
}: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<DomainResult | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const autoSearched = useRef(false)

  // Auto-search on expand
  useEffect(() => {
    if (expanded && businessName && !autoSearched.current) {
      autoSearched.current = true
      const suggested = slugify(businessName)
      if (suggested) {
        setQuery(suggested)
        doSearch(suggested)
      }
    }
  }, [expanded, businessName]) // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/domains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), slug }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.results || [])
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleCheckout = async (withDomain: boolean) => {
    setCheckingOut(true)
    setError('')

    try {
      onTrackConversion?.('AW-17996760129/aj9PCKrgioYcEMGIw4VD', 1.0)

      const body: Record<string, unknown> = {
        product: withDomain && selectedDomain ? 'hosting_and_domain' : 'hosting',
        email: email || '',
        businessName,
        slug,
        siteId,
      }

      if (withDomain && selectedDomain) {
        body.domain = selectedDomain.domain
        body.domainPrice = Math.round((selectedDomain.price || 17.99) * 100)
        body.renewPrice = Math.round((selectedDomain.renewPrice || selectedDomain.price || 17.99) * 100)
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (result.url) {
        window.location.href = result.url
      } else {
        setError(result.error || 'Failed to start checkout')
        setCheckingOut(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setCheckingOut(false)
    }
  }

  // Already active — show domain section only if no domain
  if (hostingStatus === 'active') {
    if (currentDomain) {
      return (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mx-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-white font-bold text-sm">Your Site Is Live</p>
              <a href={`https://${currentDomain}`} target="_blank" className="text-green-400 text-sm font-mono hover:underline">
                {currentDomain} ↗
              </a>
            </div>
          </div>
        </div>
      )
    }
    // Active hosting but no domain — show domain upsell
    return <DomainUpsell siteId={siteId} slug={slug} businessName={businessName} email={email} />
  }

  // Not active — show Go Live flow
  const available = results.filter(r => r.available)
  const taken = results.filter(r => !r.available)

  if (!expanded) {
    return (
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">🚀</span>
              <div className="min-w-0">
                <p className="text-base font-bold text-white">Make {businessName} official</p>
                <p className="text-sm text-gray-400">Get your own .com and go live — first month free</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="shrink-0 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:brightness-110 transition shadow-lg shadow-indigo-500/25"
            >
              Get Your .com →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-indigo-600/10 to-transparent border-b border-indigo-500/20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            Get {businessName} online
          </h2>
          <p className="text-gray-400 text-sm">
            Pick your website address and we&apos;ll handle everything — domain, hosting, security, the works.
          </p>
        </div>

        {/* Domain Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query) }} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="yourbusiness"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-5 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50 shrink-0"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : 'Search'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {searching && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-4">
            <div className="w-8 h-8 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Checking availability...</p>
          </div>
        )}

        {/* Results */}
        {!searching && available.length > 0 && (
          <div className="space-y-2 mb-4">
            {available.map((r, i) => {
              const isRecommended = i === 0 && r.domain.endsWith('.com')
              const isSelected = selectedDomain?.domain === r.domain
              const hasDifferentRenewal = r.renewPrice && r.renewPrice !== r.price
              return (
                <button
                  key={r.domain}
                  onClick={() => setSelectedDomain(isSelected ? null : r)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-white/20'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white font-medium">{r.domain}</span>
                        {isRecommended && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                            Best choice
                          </span>
                        )}
                      </div>
                      {hasDifferentRenewal && (
                        <p className="text-[10px] text-gray-600 mt-0.5">Renews at ${r.renewPrice?.toFixed(2)}/yr</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">${r.price?.toFixed(2)}/yr</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Taken domains */}
        {!searching && taken.length > 0 && (
          <p className="text-gray-600 text-xs mb-4 px-1">
            Taken: {taken.map(r => r.domain).join(', ')}
          </p>
        )}

        {/* All taken */}
        {!searching && results.length > 0 && available.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center mb-4">
            <p className="text-yellow-300 text-sm font-medium mb-1">All variations are taken</p>
            <p className="text-gray-400 text-xs">Try adding your city — like <span className="text-gray-300 font-mono">{slugify(businessName)}houston</span></p>
          </div>
        )}

        {/* Checkout section */}
        {available.length > 0 && (
          <div className="space-y-3">
            {/* Primary CTA — with domain */}
            {selectedDomain && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">Your package</p>
                    <p className="text-gray-500 text-xs">Everything you need. Cancel anytime.</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">🌐 {selectedDomain.domain}</span>
                    <span className="text-gray-400">${selectedDomain.price?.toFixed(2)}/yr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">🚀 Website hosting</span>
                    <span className="text-gray-400">$9/mo <span className="text-green-400 text-xs">(1st month free)</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">🔒 SSL certificate</span>
                    <span className="text-green-400">Included</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">⚡ Google & ChatGPT optimization</span>
                    <span className="text-green-400">Included</span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 mb-4 flex justify-between">
                  <span className="text-white font-bold text-sm">Due today</span>
                  <span className="text-white font-bold text-sm">${selectedDomain.price?.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-[10px] mb-3">
                  Domain billed yearly. Hosting starts free for 30 days, then $9/mo. Cancel anytime.
                </p>
                <button
                  onClick={() => handleCheckout(true)}
                  disabled={checkingOut}
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:brightness-110 transition shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    `Get ${selectedDomain.domain} — $${selectedDomain.price?.toFixed(2)} today`
                  )}
                </button>
              </div>
            )}

            {/* Prompt to select if none selected */}
            {!selectedDomain && (
              <div className="text-center py-2">
                <p className="text-gray-500 text-sm">👆 Pick a domain above to continue</p>
              </div>
            )}

            {/* Skip domain option */}
            <div className="text-center space-y-2">
              <button
                onClick={() => handleCheckout(false)}
                disabled={checkingOut}
                className="text-xs text-gray-500 hover:text-gray-300 transition underline underline-offset-4"
              >
                Skip for now — just activate hosting at {slug}.autolocal.ai
              </button>
              <p className="text-[10px] text-gray-600">
                <a href={`/setup?slug=${slug}`} target="_blank" className="hover:text-indigo-400 transition">
                  Already own a domain? Connect it for free →
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Before search results, still show skip option */}
        {results.length === 0 && !searching && (
          <div className="text-center space-y-2 mt-2">
            <button
              onClick={() => handleCheckout(false)}
              disabled={checkingOut}
              className="text-xs text-gray-500 hover:text-gray-300 transition underline underline-offset-4"
            >
              Skip domain — just activate hosting
            </button>
            <p className="text-[10px] text-gray-600">
              <a href={`/setup?slug=${slug}`} target="_blank" className="hover:text-indigo-400 transition">
                Already own a domain? Connect it for free →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Domain upsell for users who already have hosting but no domain
function DomainUpsell({ siteId, slug, businessName, email }: {
  siteId: string; slug: string; businessName: string; email: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [searching, setSearching] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const autoSearched = useRef(false)

  useEffect(() => {
    if (businessName && !autoSearched.current) {
      autoSearched.current = true
      const suggested = slugify(businessName)
      if (suggested) {
        setQuery(suggested)
        doSearch(suggested)
      }
    }
  }, [businessName]) // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setSearching(true); setError(''); setResults([])
    try {
      const res = await fetch('/api/domains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim(), slug }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResults(data.results || [])
    } catch { setError('Search failed.') }
    finally { setSearching(false) }
  }

  const handleBuy = async (r: DomainResult) => {
    setCheckingOut(true); setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'domain', domain: r.domain, siteId, slug, email,
          domainPrice: Math.round((r.price || 17.99) * 100),
          renewPrice: Math.round((r.renewPrice || r.price || 17.99) * 100),
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setError(data.error || 'Checkout failed'); setCheckingOut(false) }
    } catch { setError('Something went wrong.'); setCheckingOut(false) }
  }

  const available = results.filter(r => r.available)

  return (
    <div className="px-4 py-6">
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <h3 className="text-white font-bold text-base mb-1">🌐 Get your own .com</h3>
        <p className="text-gray-400 text-sm mb-4">
          Your site is live at <span className="font-mono text-gray-300">{slug}.autolocal.ai</span> — upgrade to a professional domain.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query) }} className="flex gap-2 mb-4">
          <input
            type="text" placeholder="yourbusiness" value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-indigo-500 outline-none font-mono"
          />
          <button type="submit" disabled={searching || !query.trim()}
            className="px-5 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50 shrink-0">
            {searching ? '...' : 'Search'}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {available.length > 0 && (
          <div className="space-y-2">
            {available.map((r, i) => (
              <div key={r.domain} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <span className="font-mono text-sm text-white">{r.domain}</span>
                  {i === 0 && r.domain.endsWith('.com') && (
                    <span className="text-[10px] ml-2 bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">Best</span>
                  )}
                </div>
                <button onClick={() => handleBuy(r)} disabled={checkingOut}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50">
                  ${r.price?.toFixed(2)}/yr
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-center">
          <a href={`/setup?slug=${slug}`} target="_blank" className="text-xs text-gray-500 hover:text-indigo-400">
            Already own a domain? Connect it for free →
          </a>
        </div>
      </div>
    </div>
  )
}
