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
  businessName?: string
  currentDomain?: string | null
  onDomainRegistered?: (domain: string) => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 63)
}

export default function DomainSearch({ siteId, slug, businessName, currentDomain }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [searching, setSearching] = useState(false)
  const [registering, setRegistering] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const autoSearched = useRef(false)

  // Auto-search on load with business name
  useEffect(() => {
    if (businessName && !autoSearched.current && !currentDomain) {
      autoSearched.current = true
      const suggested = slugify(businessName)
      if (suggested) {
        setQuery(suggested)
        doSearch(suggested)
      }
    }
  }, [businessName, currentDomain]) // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setError('')
    setResults([])
    setHasSearched(false)

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
      setHasSearched(true)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  const handleRegister = async (domain: string, price: number, renewPrice: number) => {
    setRegistering(domain)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'domain',
          domain,
          domainPrice: Math.round(price * 100),
          renewPrice: Math.round(renewPrice * 100),
          siteId,
          slug,
          email: '',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
        setRegistering(null)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setRegistering(null)
    }
  }

  // Already has a domain — show success state
  if (currentDomain) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-white font-bold text-sm">Your Domain Is Live</p>
            <a
              href={`https://${currentDomain}`}
              target="_blank"
              className="text-green-400 text-sm font-mono hover:underline"
            >
              {currentDomain} ↗
            </a>
          </div>
        </div>
      </div>
    )
  }

  const available = results.filter(r => r.available)
  const taken = results.filter(r => !r.available)

  return (
    <div className="space-y-4">
      {/* Header + Search */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <h3 className="text-white font-bold text-base mb-1 flex items-center gap-2">
          🌐 Get Your Own .com
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Your website address — like <span className="text-gray-300">google.com</span>, but for your business.
          We handle registration, setup, and security. Just pick a name.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
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
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50 shrink-0"
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </span>
            ) : 'Search'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {searching && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Checking availability across {results.length || 6} extensions...</p>
        </div>
      )}

      {/* Available domains */}
      {!searching && available.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-green-500/5">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">
              ✓ {available.length} Domain{available.length > 1 ? 's' : ''} Available
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {available.map((r, i) => {
              const isRecommended = i === 0 && r.domain.endsWith('.com')
              const hasDifferentRenewal = r.renewPrice && r.renewPrice !== r.price
              return (
                <div
                  key={r.domain}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition ${isRecommended ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white font-medium">{r.domain}</span>
                        {isRecommended && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      {hasDifferentRenewal && (
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          Renews at ${r.renewPrice?.toFixed(2)}/yr
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRegister(r.domain, r.price || 17.99, r.renewPrice || r.price || 17.99)}
                    disabled={!!registering}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition disabled:opacity-50 shrink-0 ${
                      isRecommended
                        ? 'bg-indigo-600 hover:bg-indigo-500'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    {registering === r.domain ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </span>
                    ) : (
                      `Get — $${r.price?.toFixed(2)}/yr`
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Taken domains — collapsed */}
      {!searching && taken.length > 0 && (
        <div className="px-1">
          <p className="text-gray-600 text-xs">
            Taken: {taken.map(r => r.domain).join(', ')}
          </p>
        </div>
      )}

      {/* No results */}
      {!searching && hasSearched && available.length === 0 && taken.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-yellow-300 text-sm font-medium mb-1">All variations are taken</p>
          <p className="text-gray-400 text-xs">Try a different name, or add your city — like <span className="text-gray-300 font-mono">{slugify(businessName || 'yourbiz')}houston</span></p>
        </div>
      )}

      {/* Fine print + already have a domain */}
      {(hasSearched || results.length > 0) && (
        <div className="space-y-2 text-center">
          <p className="text-[10px] text-gray-600">
            Domains are billed yearly. Includes registration, DNS setup, and SSL certificate. Cancel anytime.
          </p>
          <a
            href={`/setup?slug=${slug}`}
            target="_blank"
            className="text-xs text-gray-500 hover:text-indigo-400 transition inline-block"
          >
            Already own a domain? Connect it for free →
          </a>
        </div>
      )}
    </div>
  )
}
