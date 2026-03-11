'use client'

import { useState } from 'react'

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
  currentDomain?: string | null
  onDomainRegistered?: (domain: string) => void
}

export default function DomainSearch({ siteId, slug, currentDomain }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [searching, setSearching] = useState(false)
  const [registering, setRegistering] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/domains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), slug }),
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

  const handleRegister = async (domain: string, price: number, renewPrice: number) => {
    setRegistering(domain)
    setError('')

    try {
      // Create Stripe checkout for yearly domain subscription
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

  // Already has a domain
  if (currentDomain) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-white font-bold text-sm">Custom Domain Active</p>
            <p className="text-green-400 text-sm font-mono">{currentDomain}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
          <span>🌐</span> Get Your Own Domain
        </h3>
        <p className="text-gray-500 text-xs mb-4">
          A custom .com makes your business look professional. We handle everything — registration, setup, SSL.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="yourbusiness"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50 shrink-0"
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching
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

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Available Domains</p>
          </div>
          <div className="divide-y divide-white/5">
            {results.map(r => (
              <div key={r.domain} className={`flex items-center justify-between px-4 py-3 ${r.available ? 'hover:bg-white/5' : 'opacity-40'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-lg ${r.available ? '✅' : '❌'}`}>
                    {r.available ? '✅' : '❌'}
                  </span>
                  <span className={`font-mono text-sm ${r.available ? 'text-white' : 'text-gray-500 line-through'}`}>
                    {r.domain}
                  </span>
                </div>
                {r.available && (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-400 text-xs">${r.price?.toFixed(2)}/yr</span>
                    <button
                      onClick={() => handleRegister(r.domain, r.price || 12.98, r.renewPrice || r.price || 12.98)}
                      disabled={!!registering}
                      className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition disabled:opacity-50"
                    >
                      {registering === r.domain ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redirecting...
                        </span>
                      ) : `$${r.price?.toFixed(2) || '12.98'}/yr`}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already have a domain */}
      <div className="text-center">
        <a
          href={`/setup?slug=${slug}`}
          target="_blank"
          className="text-xs text-gray-500 hover:text-indigo-400 transition"
        >
          Already have a domain? Connect it manually →
        </a>
      </div>
    </div>
  )
}
