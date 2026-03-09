/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SiteData {
  business_name: string
  slug: string
  tagline: string | null
  description: string | null
  category: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  contact_email: string | null
  address: string | null
  google_rating: number | null
  google_review_count: number
  status: string
  template: string
  site_mode: string
  hero_image_url: string | null
  hero_crop: number
  gallery_images: string[]
  services: ServiceItem[]
  hours: Record<string, string> | null
  preview_url: string
  subdomain: string
  view_count: number
  created_at: string
  plan: 'starter' | 'living'
  hosting_status: 'preview' | 'active' | 'expired'
  changes_this_month: number
  free_changes_remaining: number
  unlimited_changes: boolean
  logo_url: string | null
  brand_color_primary: string
  brand_color_secondary: string
  brand_color_accent: string
  website_current: string | null
}

interface ServiceItem {
  name: string
  description?: string
  price?: string
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'modern', name: 'Modern', emoji: '✨' },
  { id: 'bold', name: 'Bold', emoji: '⚡' },
  { id: 'clutch', name: 'Clutch', emoji: '🔥' },
  { id: 'artika', name: 'Artika', emoji: '🎨' },
  { id: 'myspace', name: 'YourSpace', emoji: '🎵' },
  { id: 'aim', name: 'AIM', emoji: '💬' },
  { id: 'win95', name: 'Win95', emoji: '🖥️' },
  { id: 'receipt', name: 'Receipt', emoji: '🧾' },
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ─── Hooks ──────────────────────────────────────────────────────────────────────

function useAutosave(token: string, onSaved: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = useCallback(
    (fields: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        setSaving(true)
        try {
          const res = await fetch(`/api/dashboard/${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fields),
          })
          if (res.ok) {
            setSaved(true)
            onSaved()
            setTimeout(() => setSaved(false), 2000)
          }
        } catch {
          // silent
        }
        setSaving(false)
      }, 2000)
    },
    [token, onSaved]
  )

  const saveNow = useCallback(
    async (fields: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaving(true)
      try {
        const res = await fetch(`/api/dashboard/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        })
        if (res.ok) {
          setSaved(true)
          onSaved()
          setTimeout(() => setSaved(false), 2000)
        }
      } catch {
        // silent
      }
      setSaving(false)
    },
    [token, onSaved]
  )

  return { save, saveNow, saving, saved }
}

// ─── Inline Editable Text ───────────────────────────────────────────────────────

function InlineEdit({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit',
  multiline = false,
  tag = 'span',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
  tag?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
          rows={4}
          className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-indigo-500/50 text-white outline-none resize-none ${className}`}
          placeholder={placeholder}
        />
      )
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        className={`w-full px-3 py-1 rounded-lg bg-white/5 border border-indigo-500/50 text-white outline-none ${className}`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition inline-block ${!value ? 'text-gray-600 italic' : ''} ${className}`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  )
}

// ─── Save Indicator ─────────────────────────────────────────────────────────────

function SaveBadge({ saving, saved }: { saving: boolean; saved: boolean }) {
  if (saving) return <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
  if (saved) return <span className="text-xs text-green-400 transition-opacity">✓ Saved</span>
  return null
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewKey, setPreviewKey] = useState(0)
  const [mobilePreview, setMobilePreview] = useState(false)

  // Change request
  const [changeMessage, setChangeMessage] = useState('')
  const [submittingChange, setSubmittingChange] = useState(false)
  const [changeSubmitted, setChangeSubmitted] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const refreshPreview = useCallback(() => {
    setPreviewKey(k => k + 1)
  }, [])

  const { save, saveNow, saving, saved } = useAutosave(token, refreshPreview)

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

  // Field updater helper
  const updateField = useCallback(
    (field: string, value: unknown) => {
      if (!data) return
      setData(prev => (prev ? { ...prev, [field]: value } : prev))
      save({ [field]: value })
    },
    [data, save]
  )

  const updateFieldNow = useCallback(
    (field: string, value: unknown) => {
      if (!data) return
      setData(prev => (prev ? { ...prev, [field]: value } : prev))
      saveNow({ [field]: value })
    },
    [data, saveNow]
  )

  // ─── Loading / Error states ─────────────────

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

  // ─── Photo Upload Handler ─────────────────

  const handlePhotoUpload = async (file: File, target: 'hero' | 'gallery') => {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('target', target)
    try {
      const res = await fetch(`/api/dashboard/${token}/photos`, {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (res.ok) {
        if (target === 'hero') {
          setData(prev => prev ? { ...prev, hero_image_url: result.url } : prev)
        } else {
          setData(prev => prev ? { ...prev, gallery_images: [...(prev.gallery_images || []), result.url] } : prev)
        }
        refreshPreview()
      }
    } catch { /* silent */ }
  }

  const handlePhotoRemove = async (url: string) => {
    try {
      const res = await fetch(`/api/dashboard/${token}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', url }),
      })
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev
          const gallery = prev.gallery_images.filter(u => u !== url)
          const heroUrl = prev.hero_image_url === url ? (gallery[0] || null) : prev.hero_image_url
          return { ...prev, gallery_images: gallery, hero_image_url: heroUrl }
        })
        refreshPreview()
      }
    } catch { /* silent */ }
  }

  // ─── Logo Upload Handler ──────────────────

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)
    try {
      const res = await fetch(`/api/dashboard/${token}/brand`, {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (res.ok && result.logo_url) {
        setData(prev => prev ? { ...prev, logo_url: result.logo_url } : prev)
        refreshPreview()
      }
    } catch { /* silent */ }
  }

  // ─── Color Save Handler ───────────────────

  const handleColorSave = async (primary: string, secondary: string, accent: string) => {
    try {
      const res = await fetch(`/api/dashboard/${token}/brand`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_color_primary: primary,
          brand_color_secondary: secondary,
          brand_color_accent: accent,
        }),
      })
      if (res.ok) {
        setData(prev => prev ? { ...prev, brand_color_primary: primary, brand_color_secondary: secondary, brand_color_accent: accent } : prev)
        refreshPreview()
      }
    } catch { /* silent */ }
  }

  // ─── Service Handlers ─────────────────────

  const updateService = (idx: number, field: keyof ServiceItem, value: string) => {
    const services = [...(data.services || [])]
    services[idx] = { ...services[idx], [field]: value }
    setData(prev => prev ? { ...prev, services } : prev)
    save({ services })
  }

  const addService = () => {
    const services = [...(data.services || []), { name: 'New Service', description: '', price: '' }]
    setData(prev => prev ? { ...prev, services } : prev)
    saveNow({ services })
  }

  const removeService = (idx: number) => {
    const services = (data.services || []).filter((_, i) => i !== idx)
    setData(prev => prev ? { ...prev, services } : prev)
    saveNow({ services })
  }

  // ─── Hours Handler ────────────────────────

  const updateHour = (day: string, value: string) => {
    const hours = { ...(data.hours || {}), [day]: value }
    setData(prev => prev ? { ...prev, hours } : prev)
    save({ hours })
  }

  const toggleDayClosed = (day: string) => {
    const current = data.hours?.[day] || ''
    const isClosed = current.toLowerCase() === 'closed' || !current
    const newVal = isClosed ? '9:00 AM - 5:00 PM' : 'Closed'
    updateHour(day, newVal)
  }

  const copyToWeekdays = () => {
    const mondayHours = data.hours?.['Monday'] || '9:00 AM - 5:00 PM'
    const hours = { ...(data.hours || {}) }
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
      hours[day] = mondayHours
    }
    setData(prev => prev ? { ...prev, hours } : prev)
    saveNow({ hours })
  }

  // ─── Change Request ───────────────────────

  const submitChange = async () => {
    if (!changeMessage.trim()) return
    setSubmittingChange(true)
    try {
      const res = await fetch(`/api/dashboard/${token}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'other', message: changeMessage.trim(), priority: 'normal' }),
      })
      if (res.ok) {
        setChangeSubmitted(true)
        setChangeMessage('')
        setTimeout(() => setChangeSubmitted(false), 5000)
      }
    } catch { /* silent */ }
    setSubmittingChange(false)
  }

  // ─── Render ───────────────────────────────

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ═══ Sticky Header ═══ */}
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          {/* Business Name — inline editable */}
          <div className="flex items-center gap-2 min-w-0">
            <InlineEdit
              value={data.business_name}
              onChange={v => updateFieldNow('business_name', v)}
              className="text-lg font-black text-white truncate"
              placeholder="Business Name"
            />
          </div>

          {/* Status Badge */}
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            data.hosting_status === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/20'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
          }`}>
            {data.hosting_status === 'active' ? '🟢 LIVE' : '👁️ PREVIEW'}
          </span>

          {/* Subdomain */}
          <span className="hidden sm:inline text-xs text-gray-500 font-mono truncate">
            {data.subdomain}
          </span>

          {/* Site Type Toggle */}
          <button
            onClick={() => {
              const newMode = data.site_mode === 'individual' ? 'business' : 'individual'
              updateFieldNow('site_mode', newMode)
            }}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            {data.site_mode === 'individual' ? '👤 Individual' : '🏢 Business'}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Save indicator */}
          <SaveBadge saving={saving} saved={saved} />

          {/* Billing */}
          <span className="hidden md:inline text-xs text-gray-500">
            {data.hosting_status === 'active' ? '🟢 Hosting — $9/mo' : '👁️ Free Preview'}
          </span>

          {/* View Site */}
          <a
            href={`/preview/${data.slug}?token=${token}`}
            target="_blank"
            className="shrink-0 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition"
          >
            View Site ↗
          </a>
        </div>
      </header>

      {/* ═══ Go Live Banner (when hosting not active) ═══ */}
      {data.hosting_status !== 'active' && (
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-indigo-500/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg">🚀</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Ready to go live?</p>
                <p className="text-xs text-gray-400 truncate">Activate hosting to get your own {data.slug}.autolocal.ai URL — first month free!</p>
              </div>
            </div>
            <button
              onClick={async () => {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    product: 'hosting',
                    email: data.email || data.contact_email || '',
                    businessName: data.business_name,
                    slug: data.slug,
                  }),
                })
                const result = await res.json()
                if (result.url) window.location.href = result.url
              }}
              className="shrink-0 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:brightness-110 transition shadow-lg shadow-indigo-500/25"
            >
              Go Live — $0 Today
            </button>
          </div>
        </div>
      )}

      {/* ═══ Main Layout ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* ─── Left: Content Editor ─── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ═══ Template Carousel ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Design Template</h3>
              <div className="grid grid-cols-4 gap-3 pb-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateFieldNow('template', t.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                      data.template === t.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className={`text-xs font-semibold ${data.template === t.id ? 'text-white' : 'text-gray-400'}`}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ═══ Brand Controls ═══ */}
            <BrandControls
              data={data}
              onLogoUpload={handleLogoUpload}
              onColorSave={handleColorSave}
            />

            {/* ═══ Hero Section ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400">Hero</h3>

              {/* Hero Image */}
              <div className="relative group rounded-xl overflow-hidden h-48 bg-white/5">
                {data.hero_image_url ? (
                  <img
                    src={data.hero_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${data.hero_crop || 50}%` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold">
                    📤 Change Hero Image
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoUpload(f, 'hero')
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Headline</label>
                <InlineEdit
                  value={data.business_name}
                  onChange={v => updateField('business_name', v)}
                  className="text-xl font-black"
                  placeholder="Your Business Name"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tagline</label>
                <InlineEdit
                  value={data.tagline || ''}
                  onChange={v => updateField('tagline', v)}
                  className="text-gray-300"
                  placeholder="A short description of your business"
                />
              </div>
            </section>

            {/* ═══ About ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">About</h3>
              <InlineEdit
                value={data.description || ''}
                onChange={v => updateField('description', v)}
                className="text-gray-300 text-sm leading-relaxed"
                placeholder="Tell customers about your business..."
                multiline
              />
            </section>

            {/* ═══ Services ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">Services</h3>
              <div className="space-y-2">
                {(data.services || []).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group">
                    <div className="flex-1 space-y-1">
                      <InlineEdit
                        value={s.name}
                        onChange={v => updateService(i, 'name', v)}
                        className="font-semibold text-sm"
                        placeholder="Service name"
                      />
                      <InlineEdit
                        value={s.description || ''}
                        onChange={v => updateService(i, 'description', v)}
                        className="text-xs text-gray-400"
                        placeholder="Description (optional)"
                      />
                    </div>
                    <InlineEdit
                      value={s.price || ''}
                      onChange={v => updateService(i, 'price', v)}
                      className="text-sm text-gray-400 shrink-0 w-24 text-right"
                      placeholder="Price"
                    />
                    <button
                      onClick={() => removeService(i)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition shrink-0"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addService}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 text-sm transition"
              >
                ＋ Add Service
              </button>
            </section>

            {/* ═══ Hours ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400">Hours</h3>
                <button
                  onClick={copyToWeekdays}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Copy Monday to all weekdays
                </button>
              </div>
              <div className="space-y-1.5">
                {DAYS.map(day => {
                  const val = data.hours?.[day] || ''
                  const isClosed = val.toLowerCase() === 'closed' || !val
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-gray-400 shrink-0">{day}</span>
                      <button
                        onClick={() => toggleDayClosed(day)}
                        className={`w-10 h-5 rounded-full transition relative ${isClosed ? 'bg-white/10' : 'bg-green-600'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isClosed ? 'left-0.5' : 'left-5'}`} />
                      </button>
                      {isClosed ? (
                        <span className="text-xs text-gray-600">Closed</span>
                      ) : (
                        <InlineEdit
                          value={val}
                          onChange={v => updateHour(day, v)}
                          className="text-xs text-gray-300 flex-1"
                          placeholder="9:00 AM - 5:00 PM"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ═══ Contact ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">Contact Info</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">📞 Phone</label>
                  <InlineEdit
                    value={data.phone || ''}
                    onChange={v => updateField('phone', v)}
                    className="text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">📧 Email</label>
                  <InlineEdit
                    value={data.contact_email || data.email || ''}
                    onChange={v => updateField('display_email', v)}
                    className="text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">📍 Address</label>
                  <InlineEdit
                    value={data.address || ''}
                    onChange={v => updateField('address', v)}
                    className="text-sm"
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </section>

            {/* ═══ Photos / Gallery ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">Photos</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(data.gallery_images || []).map((url, i) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && url === data.hero_image_url && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                        Hero
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePhotoRemove(url)}
                        className="px-2 py-1 rounded bg-red-600/80 text-white text-xs font-bold hover:bg-red-500"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo */}
                <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 transition cursor-pointer">
                  <span className="text-2xl">＋</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoUpload(f, 'gallery')
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </section>

            {/* ═══ Bottom Section ═══ */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              {/* Custom Changes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Need something special?</h3>
                {changeSubmitted ? (
                  <p className="text-sm text-green-400">✅ Request submitted! We&apos;ll get back to you within 24 hours.</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={changeMessage}
                      onChange={e => setChangeMessage(e.target.value)}
                      placeholder="Describe what you'd like changed..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none focus:border-indigo-500 transition"
                      onKeyDown={e => { if (e.key === 'Enter') submitChange() }}
                    />
                    <button
                      onClick={submitChange}
                      disabled={submittingChange || !changeMessage.trim()}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-40"
                    >
                      {submittingChange ? '...' : 'Submit'}
                    </button>
                  </div>
                )}
                {!data.unlimited_changes && (
                  <p className="text-xs text-gray-600 mt-1.5">
                    {data.free_changes_remaining > 0
                      ? `${data.free_changes_remaining} free changes remaining · `
                      : 'Additional changes $19 each · '}
                    <a href="/offer?upgrade=living" className="text-amber-400 hover:underline">Upgrade to unlimited →</a>
                  </p>
                )}
              </div>

              {/* Billing + Feedback row */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/[0.06] text-xs text-gray-500">
                <span>
                  {data.hosting_status === 'active' ? '🟢 Hosting Active — $9/mo' : '👁️ Free Preview Mode'}
                </span>
                <a href="/api/billing-portal" className="text-indigo-400 hover:underline">Manage Billing</a>
                <span className="text-gray-700">·</span>
                <a href="mailto:support@autolocal.ai?subject=Feedback" className="hover:text-gray-300 transition">💡 Feedback</a>
                <a href="mailto:support@autolocal.ai?subject=Bug Report" className="hover:text-gray-300 transition">🐛 Bug</a>
              </div>
            </section>
          </div>

          {/* ─── Right: Live Preview (desktop) ─── */}
          <div className="hidden lg:block w-[420px] shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h3>
                <a
                  href={`/preview/${data.slug}?token=${token}`}
                  target="_blank"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Full size ↗
                </a>
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden overflow-y-auto bg-white" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <div style={{ width: '420px', height: '787px', position: 'relative' }}>
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src={`/preview/${data.slug}?token=${token}&t=${previewKey}`}
                    className="w-[1280px] h-[2400px] origin-top-left"
                    style={{ transform: 'scale(0.328)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}
                    title="Live Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mobile Preview Toggle ─── */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobilePreview(!mobilePreview)}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white text-xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:bg-indigo-500 transition"
          >
            👁
          </button>
        </div>

        {/* Mobile Preview Overlay */}
        {mobilePreview && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur flex flex-col">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-sm font-bold text-white">Preview</h3>
              <button
                onClick={() => setMobilePreview(false)}
                className="text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                key={previewKey}
                src={`/preview/${data.slug}?token=${token}&t=${previewKey}`}
                className="w-full h-full rounded-xl border border-white/10"
                style={{ minHeight: '600px' }}
                title="Mobile Preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── SEO & Discovery Tips ─── */}
      <section className="px-4 py-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-400">🔍 Get Found on Search & ChatGPT</h3>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <p className="text-sm text-gray-400">Your site is automatically optimized with structured data, meta tags, and semantic HTML. Here&apos;s how to maximize your visibility:</p>
          <div className="space-y-3">
            {[
              { icon: '📝', title: 'Write a detailed About section', desc: 'Search engines and AI assistants use your description to understand your business. Be specific — mention your city, services, and what makes you different.', field: 'about' as const },
              { icon: '🏷️', title: 'List all your services with descriptions', desc: 'Each service becomes structured data that Google and ChatGPT can reference. Include prices when possible.', field: 'services' as const },
              { icon: '📸', title: 'Upload quality photos with your hero image', desc: 'Google uses images in local search results. Your hero image shows up in social shares and AI summaries.', field: 'photos' as const },
              { icon: '⏰', title: 'Keep your hours up to date', desc: 'Accurate hours build trust with search engines and prevent customers from showing up when you\'re closed.', field: 'hours' as const },
              { icon: '📍', title: 'Add your full address', desc: 'A complete address helps you show up in "near me" searches and Google Maps results.', field: 'contact' as const },
              { icon: '⭐', title: 'Get Google reviews', desc: 'Sites with 20+ reviews at 4.0+ stars get priority in local search. Ask happy customers to leave a review!', field: null },
              { icon: '🌐', title: 'Connect a custom domain', desc: 'A branded domain (yourbusiness.com) signals authority to search engines vs. a subdomain.', field: null },
              { icon: '🤖', title: 'How ChatGPT finds you', desc: 'ChatGPT and other AI assistants read your structured data (JSON-LD) — your business name, services, reviews, and location are all included automatically.', field: null },
            ].map((tip, i) => {
              const complete = tip.field === 'about' ? !!data.description
                : tip.field === 'services' ? (data.services?.length ?? 0) > 0
                : tip.field === 'photos' ? !!data.hero_image_url
                : tip.field === 'hours' ? Object.keys(data.hours || {}).length > 0
                : tip.field === 'contact' ? !!data.address
                : null
              return (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-lg flex-shrink-0">{tip.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{tip.title}</p>
                      {complete === true && <span className="text-green-400 text-xs">✓ Done</span>}
                      {complete === false && <span className="text-yellow-400 text-xs">Missing</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">
          Powered by <a href="https://autolocal.ai" className="text-indigo-400 hover:underline">AutoLocal.ai</a>
        </p>
      </footer>
    </div>
  )
}

// ─── Brand Controls Sub-Component ───────────────────────────────────────────────

function BrandControls({
  data,
  onLogoUpload,
  onColorSave,
}: {
  data: SiteData
  onLogoUpload: (file: File) => Promise<void>
  onColorSave: (primary: string, secondary: string, accent: string) => Promise<void>
}) {
  const [primary, setPrimary] = useState(data.brand_color_primary)
  const [secondary, setSecondary] = useState(data.brand_color_secondary)
  const [accent, setAccent] = useState(data.brand_color_accent)
  const [colorSaving, setColorSaving] = useState(false)
  const [colorSaved, setColorSaved] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setPrimary(data.brand_color_primary)
    setSecondary(data.brand_color_secondary)
    setAccent(data.brand_color_accent)
  }, [data.brand_color_primary, data.brand_color_secondary, data.brand_color_accent])

  const hasChanges = primary !== data.brand_color_primary || secondary !== data.brand_color_secondary || accent !== data.brand_color_accent

  const handleSave = async () => {
    setColorSaving(true)
    await onColorSave(primary, secondary, accent)
    setColorSaving(false)
    setColorSaved(true)
    setTimeout(() => setColorSaved(false), 2000)
  }

  const applyPalette = (p: typeof COLOR_PALETTES[0]) => {
    setPrimary(p.primary)
    setSecondary(p.secondary)
    setAccent(p.accent)
  }

  return (
    <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">Brand</h3>

      <div className="flex items-center gap-6 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xl text-gray-600">📷</span>
            )}
          </div>
          <label className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:border-white/20 transition cursor-pointer">
            {data.logo_url ? 'Change' : 'Upload Logo'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) onLogoUpload(f)
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* Color Circles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition"
            title="Edit colors"
          >
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: primary }} />
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: secondary }} />
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: accent }} />
            <span className="text-xs text-gray-400 ml-1">Colors</span>
          </button>
          {colorSaved && <span className="text-xs text-green-400">✓ Saved</span>}
        </div>
      </div>

      {/* Expanded Color Picker */}
      {showPicker && (
        <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTES.map(p => (
              <button
                key={p.name}
                onClick={() => applyPalette(p)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                  primary === p.primary && accent === p.accent
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                    : 'border-white/[0.06] text-gray-500 hover:border-white/10'
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                {p.name}
              </button>
            ))}
          </div>

          {/* Custom Pickers */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Primary', value: primary, set: setPrimary },
              { label: 'Secondary', value: secondary, set: setSecondary },
              { label: 'Accent', value: accent, set: setAccent },
            ].map(c => (
              <div key={c.label}>
                <label className="block text-[10px] text-gray-500 mb-1">{c.label}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={c.value}
                    onChange={e => c.set(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={c.value}
                    onChange={e => c.set(e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[11px] font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preview Strip + Save */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg overflow-hidden flex h-8">
              <div className="flex-[3]" style={{ backgroundColor: primary }} />
              <div className="flex-[2]" style={{ backgroundColor: secondary }} />
              <div className="flex-[1]" style={{ backgroundColor: accent }} />
            </div>
            <button
              onClick={handleSave}
              disabled={colorSaving || !hasChanges}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition disabled:opacity-40"
            >
              {colorSaving ? '...' : 'Save Colors'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
