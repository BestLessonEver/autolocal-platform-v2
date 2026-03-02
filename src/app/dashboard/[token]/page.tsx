/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface SiteData {
  business_name: string
  slug: string
  tagline: string | null
  category: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  address: string | null
  google_rating: number | null
  google_review_count: number
  status: string
  template: string
  hero_image_url: string | null
  services: { name: string; description: string; price?: string }[]
  hours: Record<string, string> | null
  preview_url: string
  view_count: number
  created_at: string
}

const CHANGE_TYPES = [
  { value: 'text', label: '✏️ Text / Copy Changes', desc: 'Update headings, descriptions, or service info' },
  { value: 'photos', label: '📸 Photo Changes', desc: 'Swap hero image, add gallery photos' },
  { value: 'colors', label: '🎨 Colors / Style', desc: 'Adjust brand colors, fonts, or layout' },
  { value: 'services', label: '📋 Services / Pricing', desc: 'Add, remove, or update services and prices' },
  { value: 'hours', label: '🕐 Hours / Contact', desc: 'Update business hours, phone, or address' },
  { value: 'other', label: '💬 Other', desc: 'Anything else — just describe what you need' },
]

export default function ClientDashboard() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Change request form
  const [changeType, setChangeType] = useState('')
  const [changeMessage, setChangeMessage] = useState('')
  const [changePriority, setChangePriority] = useState('normal')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/dashboard/${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setData)
      .catch(() => setError('Invalid or expired dashboard link.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeMessage.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/dashboard/${token}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: changeType || 'other',
          message: changeMessage.trim(),
          priority: changePriority,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setSubmitted(true)
        setChangeMessage('')
        setChangeType('')
      } else {
        alert(result.error || 'Something went wrong')
      }
    } catch {
      alert('Connection error. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🔒</span>
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">{error || 'This dashboard link is invalid or expired.'}</p>
          <p className="text-gray-600 text-sm mt-4">
            Need help? Email <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Your Website Dashboard</p>
            <h1 className="text-xl font-black text-white">{data.business_name}</h1>
          </div>
          <a
            href={data.preview_url}
            target="_blank"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition"
          >
            View My Site →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Site Status Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          {data.hero_image_url && (
            <div className="h-48 sm:h-56 overflow-hidden">
              <img src={data.hero_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">{data.business_name}</h2>
                {data.tagline && <p className="text-gray-400 mt-1">{data.tagline}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  {data.city}{data.state ? `, ${data.state}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {data.google_rating && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-yellow-400 font-bold">★ {data.google_rating}</span>
                    {data.google_review_count >= 20 && (
                      <span className="text-yellow-400/60 text-sm">({data.google_review_count})</span>
                    )}
                  </div>
                )}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                  data.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {data.status === 'published' ? '● Live' : data.status}
                </span>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-2xl font-black">{data.view_count || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Preview Views</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-2xl font-black">{data.services?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Services Listed</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-2xl font-black capitalize">{data.template}</p>
                <p className="text-xs text-gray-500 mt-1">Design Style</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-sm font-bold text-white">{new Date(data.created_at).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-1">Created</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href={data.preview_url}
            target="_blank"
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group"
          >
            <span className="text-2xl mb-2 block">🌐</span>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition">View My Website</h3>
            <p className="text-gray-500 text-xs mt-1">See your live site with all current changes</p>
          </a>
          <a
            href="/setup"
            target="_blank"
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group"
          >
            <span className="text-2xl mb-2 block">🔗</span>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition">Connect My Domain</h3>
            <p className="text-gray-500 text-xs mt-1">Step-by-step guide to point your domain</p>
          </a>
          <a
            href="#changes"
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group"
          >
            <span className="text-2xl mb-2 block">✏️</span>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition">Request Changes</h3>
            <p className="text-gray-500 text-xs mt-1">Need something updated? Tell us below</p>
          </a>
        </div>

        {/* Current Site Details */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Your Site Details</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business Name</p>
                <p className="text-white font-medium">{data.business_name}</p>
              </div>
              {data.phone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-white font-medium">{data.phone}</p>
                </div>
              )}
              {data.email && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-white font-medium">{data.email}</p>
                </div>
              )}
              {data.address && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-white font-medium">
                    {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}
                  </p>
                </div>
              )}
            </div>
            <div>
              {data.services && data.services.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Services</p>
                  <div className="space-y-2">
                    {data.services.map((s, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{s.name}</span>
                        {s.price && <span className="text-gray-500">{s.price}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Changes Form */}
        <div id="changes" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">Request Changes</h2>
          <p className="text-gray-500 text-sm mb-6">
            Need something updated on your site? Tell us what you&apos;d like changed and we&apos;ll handle it — usually within 24 hours.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">✅</span>
              <h3 className="text-xl font-bold text-white mb-2">Change Request Submitted!</h3>
              <p className="text-gray-400 mb-6">We&apos;ll review your request and get back to you within 24 hours.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitChange} className="space-y-5">
              {/* Change type selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">What do you want to change?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHANGE_TYPES.map(ct => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setChangeType(ct.value)}
                      className={`text-left p-3 rounded-xl border text-sm transition ${
                        changeType === ct.value
                          ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <p className="font-semibold">{ct.label}</p>
                      <p className="text-xs mt-0.5 opacity-60">{ct.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Describe what you&apos;d like changed
                </label>
                <textarea
                  value={changeMessage}
                  onChange={e => setChangeMessage(e.target.value)}
                  rows={4}
                  required
                  placeholder="E.g., 'Change the hero image to a photo of our storefront' or 'Update our hours — we're now open Sundays 10am-4pm'"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                <div className="flex gap-2">
                  {[
                    { value: 'low', label: 'Low', desc: 'Whenever you get to it' },
                    { value: 'normal', label: 'Normal', desc: 'Within 24 hours' },
                    { value: 'urgent', label: 'Urgent', desc: 'ASAP please!' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setChangePriority(p.value)}
                      className={`flex-1 p-3 rounded-xl border text-sm text-center transition ${
                        changePriority === p.value
                          ? p.value === 'urgent'
                            ? 'bg-red-600/20 border-red-500/40 text-red-400'
                            : 'bg-indigo-600/20 border-indigo-500/40 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <p className="font-semibold">{p.label}</p>
                      <p className="text-xs mt-0.5 opacity-60">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !changeMessage.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Change Request'}
              </button>
            </form>
          )}
        </div>

        {/* Support */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Need help? Email us at{' '}
            <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">
          Powered by <a href="https://autolocal.ai" className="text-indigo-400 hover:underline">AutoLocal.ai</a>
        </p>
      </footer>
    </div>
  )
}
