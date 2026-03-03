/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  plan: 'starter' | 'living'
  changes_this_month: number
  free_changes_remaining: number
  unlimited_changes: boolean
  logo_url: string | null
  brand_color_primary: string
  brand_color_secondary: string
  brand_color_accent: string
  preview_id: string
}

const CHANGE_TYPES = [
  { value: 'text', label: '✏️ Text / Copy Changes', desc: 'Update headings, descriptions, or service info' },
  { value: 'photos', label: '📸 Photo Changes', desc: 'Swap hero image, add gallery photos' },
  { value: 'colors', label: '🎨 Colors / Style', desc: 'Adjust brand colors, fonts, or layout' },
  { value: 'services', label: '📋 Services / Pricing', desc: 'Add, remove, or update services and prices' },
  { value: 'hours', label: '🕐 Hours / Contact', desc: 'Update business hours, phone, or address' },
  { value: 'other', label: '💬 Other', desc: 'Anything else — just describe what you need' },
]

const COLOR_PALETTES = [
  { name: 'Ocean', primary: '#0f172a', secondary: '#1e293b', accent: '#3b82f6' },
  { name: 'Forest', primary: '#14532d', secondary: '#166534', accent: '#22c55e' },
  { name: 'Sunset', primary: '#7c2d12', secondary: '#9a3412', accent: '#f97316' },
  { name: 'Royal', primary: '#1e1b4b', secondary: '#312e81', accent: '#8b5cf6' },
  { name: 'Rose', primary: '#4c0519', secondary: '#881337', accent: '#f43f5e' },
  { name: 'Slate', primary: '#1e293b', secondary: '#334155', accent: '#94a3b8' },
  { name: 'Gold', primary: '#1a1a2e', secondary: '#16213e', accent: '#c8a97e' },
  { name: 'Teal', primary: '#134e4a', secondary: '#115e59', accent: '#14b8a6' },
  { name: 'Cherry', primary: '#1c1917', secondary: '#292524', accent: '#dc2626' },
  { name: 'Midnight', primary: '#09090b', secondary: '#18181b', accent: '#6366f1' },
]

function BrandCustomizer({ data, onUpdate }: { data: SiteData; onUpdate: (d: SiteData) => void }) {
  const [logoUploading, setLogoUploading] = useState(false)
  const [colorSaving, setColorSaving] = useState(false)
  const [colorSaved, setColorSaved] = useState(false)
  const [primary, setPrimary] = useState(data.brand_color_primary)
  const [secondary, setSecondary] = useState(data.brand_color_secondary)
  const [accent, setAccent] = useState(data.brand_color_accent)
  const [expanded, setExpanded] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const formData = new FormData()
    formData.append('logo', file)
    try {
      const res = await fetch('/api/dashboard/me/brand', { method: 'POST', body: formData })
      const result = await res.json()
      if (res.ok && result.logo_url) {
        onUpdate({ ...data, logo_url: result.logo_url })
      } else {
        alert(result.error || 'Upload failed')
      }
    } catch {
      alert('Upload failed. Please try again.')
    }
    setLogoUploading(false)
  }

  const handleColorSave = async () => {
    setColorSaving(true)
    try {
      const res = await fetch('/api/dashboard/me/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_color_primary: primary,
          brand_color_secondary: secondary,
          brand_color_accent: accent,
        }),
      })
      if (res.ok) {
        onUpdate({ ...data, brand_color_primary: primary, brand_color_secondary: secondary, brand_color_accent: accent })
        setColorSaved(true)
        setTimeout(() => setColorSaved(false), 3000)
      } else {
        const result = await res.json()
        alert(result.error || 'Save failed')
      }
    } catch {
      alert('Save failed. Please try again.')
    }
    setColorSaving(false)
  }

  const applyPalette = (p: typeof COLOR_PALETTES[0]) => {
    setPrimary(p.primary)
    setSecondary(p.secondary)
    setAccent(p.accent)
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-white">Customize Your Brand</h2>
            <p className="text-gray-500 text-sm">Upload your logo and choose your colors</p>
          </div>
        </div>
        <span className={`text-gray-500 text-xl transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-8 border-t border-white/[0.06] pt-6">
          {/* Logo Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Your Logo</h3>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {data.logo_url ? (
                  <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-3xl text-gray-600">📷</span>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition cursor-pointer">
                  {logoUploading ? (
                    <><span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />Uploading...</>
                  ) : (
                    <>📤 {data.logo_url ? 'Replace Logo' : 'Upload Logo'}</>
                  )}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
                </label>
                <p className="text-xs text-gray-600 mt-2">PNG, JPG, WebP, or SVG. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Color Palette</h3>
            <p className="text-xs text-gray-500 mb-4">Choose a preset or customize your own colors below.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {COLOR_PALETTES.map(p => (
                <button key={p.name} onClick={() => applyPalette(p)} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition ${primary === p.primary && accent === p.accent ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/10'}`}>
                  <div className="flex gap-0.5 shrink-0">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                  </div>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Primary', value: primary, set: setPrimary },
                { label: 'Secondary', value: secondary, set: setSecondary },
                { label: 'Accent', value: accent, set: setAccent },
              ].map(c => (
                <div key={c.label}>
                  <label className="block text-xs text-gray-500 mb-2">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={c.value} onChange={e => c.set(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
                    <input type="text" value={c.value} onChange={e => c.set(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl overflow-hidden flex h-12">
              <div className="flex-[3]" style={{ backgroundColor: primary }} />
              <div className="flex-[2]" style={{ backgroundColor: secondary }} />
              <div className="flex-[1]" style={{ backgroundColor: accent }} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleColorSave} disabled={colorSaving || (primary === data.brand_color_primary && secondary === data.brand_color_secondary && accent === data.brand_color_accent)} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {colorSaving ? 'Saving...' : colorSaved ? '✓ Saved!' : 'Save Colors'}
              </button>
              {colorSaved && <span className="text-green-400 text-sm">Colors updated! Refresh your site preview to see changes.</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClientDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')

  // Change request form
  const [changeType, setChangeType] = useState('')
  const [changeMessage, setChangeMessage] = useState('')
  const [changePriority, setChangePriority] = useState('normal')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      try {
        const res = await fetch('/api/dashboard/me')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'No website found for this account.')
          setLoading(false)
          return
        }
        setData(await res.json())
      } catch {
        setError('Failed to load dashboard.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeMessage.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/dashboard/me/changes', {
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
          <span className="text-5xl mb-4 block">🔍</span>
          <h1 className="text-2xl font-black text-white mb-2">No Website Found</h1>
          <p className="text-gray-400">{error || 'We couldn\'t find a website linked to your account.'}</p>
          <p className="text-gray-500 text-sm mt-2">Signed in as <span className="text-cyan-400">{userEmail}</span></p>
          <div className="flex gap-3 justify-center mt-6">
            <a href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">Get a Website — $99</a>
            <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white transition">Sign Out</button>
          </div>
          <p className="text-gray-600 text-sm mt-6">
            Think this is wrong? Email <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
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
          <div className="flex items-center gap-3">
            <a href={data.preview_url} target="_blank" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">
              View My Site →
            </a>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition">
              Sign Out
            </button>
          </div>
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
                <p className="text-gray-500 text-sm mt-1">{data.city}{data.state ? `, ${data.state}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                {data.google_rating && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-yellow-400 font-bold">★ {data.google_rating}</span>
                    {data.google_review_count >= 20 && <span className="text-yellow-400/60 text-sm">({data.google_review_count})</span>}
                  </div>
                )}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${data.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                  {data.status === 'published' ? '● Live' : data.status}
                </span>
              </div>
            </div>

            {/* Plan + Changes Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${data.plan === 'living' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-white/10 text-gray-400 border border-white/10'}`}>
                {data.plan === 'living' ? '🚀 Living Website' : '📄 Starter Plan'}
              </span>
              <span className="text-gray-600">·</span>
              {data.unlimited_changes ? (
                <span className="text-sm text-gray-400"><span className="text-green-400 font-semibold">Unlimited</span> changes included</span>
              ) : (
                <span className="text-sm text-gray-400">
                  <span className={`font-semibold ${data.free_changes_remaining > 0 ? 'text-white' : 'text-red-400'}`}>{data.free_changes_remaining}</span> free change{data.free_changes_remaining !== 1 ? 's' : ''} remaining this month
                  <span className="text-gray-600"> · {data.changes_this_month} used</span>
                </span>
              )}
              {data.plan !== 'living' && (
                <a href="/offer?upgrade=living" className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 transition">Upgrade to Unlimited →</a>
              )}
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
          <a href={data.preview_url} target="_blank" className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group">
            <span className="text-2xl mb-2 block">🌐</span>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition">View My Website</h3>
            <p className="text-gray-500 text-xs mt-1">See your live site with all current changes</p>
          </a>
          <a href="/setup" target="_blank" className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group">
            <span className="text-2xl mb-2 block">🔗</span>
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition">Connect My Domain</h3>
            <p className="text-gray-500 text-xs mt-1">Step-by-step guide to point your domain</p>
          </a>
          <a href="#changes" className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 transition group">
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
              {data.phone && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p><p className="text-white font-medium">{data.phone}</p></div>}
              {data.email && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p><p className="text-white font-medium">{data.email}</p></div>}
              {data.address && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p><p className="text-white font-medium">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p></div>}
            </div>
            <div>
              {data.services && data.services.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Services</p>
                  <div className="space-y-2">
                    {data.services.map((s: any, i: number) => (
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

        {/* Brand Customization */}
        <BrandCustomizer data={data} onUpdate={setData} />

        {/* Out of free changes — upgrade prompt */}
        {!data.unlimited_changes && data.free_changes_remaining <= 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">You&apos;ve used your 2 free changes this month</h3>
                <p className="text-gray-400 text-sm">
                  Additional changes are <strong className="text-white">$19 each</strong>, or upgrade to the Living Website for <strong className="text-white">$49/mo</strong> and get <strong className="text-white">unlimited changes</strong> — plus A/B testing, SEO updates, and priority support.
                </p>
              </div>
              <a href="/offer?upgrade=living" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold hover:brightness-110 transition shrink-0">
                Upgrade — $49/mo
              </a>
            </div>
          </div>
        )}

        {/* Request Changes Form */}
        <div id="changes" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Request Changes</h2>
            {!data.unlimited_changes && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${data.free_changes_remaining > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {data.free_changes_remaining > 0 ? `${data.free_changes_remaining} free left` : '$19 per change'}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-6">
            {data.unlimited_changes
              ? 'Unlimited changes included with your Living Website plan. We\'ll handle it within 24 hours.'
              : data.free_changes_remaining > 0
                ? `You have ${data.free_changes_remaining} free change${data.free_changes_remaining !== 1 ? 's' : ''} remaining this month.`
                : 'You\'ve used your free changes this month. Additional changes are $19 each, or upgrade to unlimited for $49/mo.'}
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">✅</span>
              <h3 className="text-xl font-bold text-white mb-2">Change Request Submitted!</h3>
              <p className="text-gray-400 mb-6">We&apos;ll review your request and get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition">
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitChange} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">What do you want to change?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHANGE_TYPES.map(ct => (
                    <button key={ct.value} type="button" onClick={() => setChangeType(ct.value)} className={`text-left p-3 rounded-xl border text-sm transition ${changeType === ct.value ? 'bg-indigo-600/20 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'}`}>
                      <p className="font-semibold">{ct.label}</p>
                      <p className="text-xs mt-0.5 opacity-60">{ct.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Describe what you&apos;d like changed</label>
                <textarea value={changeMessage} onChange={e => setChangeMessage(e.target.value)} rows={4} required placeholder="E.g., 'Change the hero image to a photo of our storefront' or 'Update our hours — we're now open Sundays 10am-4pm'" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setChangePriority('normal')} className={`flex-1 p-4 rounded-xl border text-sm text-center transition ${changePriority === 'normal' ? 'bg-indigo-600/20 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'}`}>
                    <p className="font-semibold">Normal</p>
                    <p className="text-xs mt-1 opacity-60">Within 24 hours</p>
                    <p className="text-xs mt-1 text-green-400 font-medium">Included</p>
                  </button>
                  <button type="button" onClick={() => setChangePriority('urgent')} className={`flex-1 p-4 rounded-xl border text-sm text-center transition relative ${changePriority === 'urgent' ? 'bg-red-600/20 border-red-500/40 text-red-400' : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'}`}>
                    {data.plan !== 'living' && <span className="absolute -top-2 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">+$29</span>}
                    <p className="font-semibold">🚨 Urgent</p>
                    <p className="text-xs mt-1 opacity-60">Within 2 hours</p>
                    {data.plan === 'living' ? <p className="text-xs mt-1 text-green-400 font-medium">Included with plan</p> : <p className="text-xs mt-1 text-red-400 font-medium">$29 rush fee</p>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting || !changeMessage.trim()} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...'
                  : changePriority === 'urgent' && data.plan !== 'living'
                    ? data.free_changes_remaining > 0 ? 'Submit Urgent Request — $29 rush fee' : 'Submit Urgent Request — $19 + $29 rush'
                    : data.unlimited_changes ? 'Submit Change Request'
                    : data.free_changes_remaining > 0 ? `Submit Change Request (${data.free_changes_remaining} free left)` : 'Submit Change Request — $19'}
              </button>
              {!data.unlimited_changes && data.free_changes_remaining <= 0 && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  This change will be billed at $19. <a href="/offer?upgrade=living" className="text-amber-400 hover:underline">Upgrade to unlimited for $49/mo →</a>
                </p>
              )}
            </form>
          )}
        </div>

        {/* Support */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Need help? Email us at <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
          </p>
        </div>
      </div>

      <footer className="py-6 px-4 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">Powered by <a href="https://autolocal.ai" className="text-indigo-400 hover:underline">AutoLocal.ai</a></p>
      </footer>
    </div>
  )
}
