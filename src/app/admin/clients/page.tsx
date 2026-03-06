/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: string
  business_name: string
  owner_name: string | null
  email: string
  phone: string | null
  website: string | null
  package: string | null
  status: string
  stripe_customer_id: string | null
  created_at: string
  city?: string
  state?: string
}

interface Preview {
  id: string
  slug: string
  business_name: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  category: string
  google_rating: number | null
  google_review_count: number
  status: string
  template: string
  created_at: string
  view_count: number
}

const STATUS_COLORS: Record<string, string> = {
  onboarding: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  published: 'bg-green-500/20 text-green-400',
  deployed: 'bg-blue-500/20 text-blue-400',
  paused: 'bg-gray-500/20 text-gray-400',
  draft: 'bg-gray-500/20 text-gray-400',
}

const PACKAGE_LABELS: Record<string, string> = {
  starter: '$99 Website',
  living: '$49/mo Living',
  social_revive: '$499/mo Social',
  growth: '$1,499/mo Growth',
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [previews, setPreviews] = useState<Preview[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'previews' | 'clients'>('previews')
  const [search, setSearch] = useState('')
  const [deploying, setDeploying] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Try cookie-based auth first (middleware already verified admin email)
      const [clientsRes, previewsRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/previews'),
      ])
      if (clientsRes.status === 401 || previewsRes.status === 401) {
        // Fallback: prompt for API key
        const adminKey = sessionStorage.getItem('adminKey') || prompt('Admin API Key:')
        if (!adminKey) { setLoading(false); return }
        sessionStorage.setItem('adminKey', adminKey)
        const headers = { 'x-admin-key': adminKey }
        const [cr, pr] = await Promise.all([
          fetch('/api/admin/clients', { headers }),
          fetch('/api/admin/previews', { headers }),
        ])
        if (cr.status === 401 || pr.status === 401) {
          sessionStorage.removeItem('adminKey')
          alert('Invalid admin key')
          setLoading(false)
          return
        }
        if (cr.ok) setClients(await cr.json())
        if (pr.ok) setPreviews(await pr.json())
      } else {
        if (clientsRes.ok) setClients(await clientsRes.json())
        if (previewsRes.ok) setPreviews(await previewsRes.json())
      }
    } catch (e) {
      console.error('Failed to load data:', e)
    }
    setLoading(false)
  }

  const filteredPreviews = previews.filter(p =>
    p.business_name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_name || c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-black">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AutoLocal</span>
              <span className="text-gray-500">.ai</span>
            </a>
            <span className="text-gray-600 text-sm">/ Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-3xl font-black text-white">{previews.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Previews</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-3xl font-black text-white">{clients.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Clients</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-3xl font-black text-white">{previews.reduce((sum, p) => sum + (p.view_count || 0), 0)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Views</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-3xl font-black text-white">{clients.filter(c => c.status === 'active').length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Active</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setTab('previews')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                tab === 'previews' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Previews ({previews.length})
            </button>
            <button
              onClick={() => setTab('clients')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                tab === 'clients' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Clients ({clients.length})
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none text-sm w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : tab === 'previews' ? (
          /* Previews Table */
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Business</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Location</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Rating</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Views</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Created</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPreviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        No previews yet. Generate one from the homepage or pipeline script.
                      </td>
                    </tr>
                  ) : filteredPreviews.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{p.business_name}</p>
                        <p className="text-xs text-gray-500">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.city}{p.state ? `, ${p.state}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        {p.google_rating ? (
                          <span className="text-yellow-400">★ {p.google_rating}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                        {p.google_review_count >= 20 && (
                          <span className="text-gray-500 text-xs ml-1">({p.google_review_count})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{p.view_count || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || STATUS_COLORS.draft}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/preview/${p.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-white/20 hover:text-white transition"
                          >
                            Preview
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://autolocal.ai/preview/${p.slug}`)
                              alert('Link copied!')
                            }}
                            className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-white/20 hover:text-white transition"
                          >
                            Copy Link
                          </button>
                          <a
                            href={`/offer?business=${encodeURIComponent(p.business_name)}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-400 hover:bg-indigo-600/30 transition"
                          >
                            Send Offer
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Clients Table */
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Business</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Contact</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Package</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Joined</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No clients yet. They&apos;ll show up here once they sign up through the offer page.
                      </td>
                    </tr>
                  ) : filteredClients.map(c => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{c.business_name}</p>
                        {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300">{c.owner_name || c.business_name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-xs font-medium">
                          {(c.package && PACKAGE_LABELS[c.package]) || c.package || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(() => {
                          // Find matching preview by business name or email
                          const match = previews.find(p =>
                            p.business_name.toLowerCase() === c.business_name.toLowerCase() ||
                            (p.email && c.email && p.email === c.email)
                          )
                          const dashUrl = match
                            ? `/my-site/${match.id.substring(0, 8)}-${match.slug}`
                            : `/client/${c.id}`
                          return (
                            <a
                              href={dashUrl}
                              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-white/20 hover:text-white transition"
                            >
                              Dashboard
                            </a>
                          )
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
