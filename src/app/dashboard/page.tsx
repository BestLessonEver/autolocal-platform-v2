/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  website_url: string
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
  { id: 'professional', name: 'Professional', emoji: '💼' },
  { id: 'clutch', name: 'Clutch', emoji: '🔥' },
  { id: 'artika', name: 'Artika', emoji: '🎨' },
  { id: 'bde', name: 'BDE', emoji: '🚀' },
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

const TIME_OPTIONS = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM',
]

const SECTION_IDS = [
  { id: 'sec-template', label: 'Template' },
  { id: 'sec-brand', label: 'Brand' },
  { id: 'sec-hero', label: 'Hero' },
  { id: 'sec-contact', label: 'Contact' },
  { id: 'sec-about', label: 'About' },
  { id: 'sec-services', label: 'Services' },
  { id: 'sec-hours', label: 'Hours' },
  { id: 'sec-photos', label: 'Photos' },
]

// ─── Autosave Hook ──────────────────────────────────────────────────────────────

function useAutosave(onSaved: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [deploying, setDeploying] = useState(false)
  const deployTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [undoData, setUndoData] = useState<{ fields: Record<string, unknown>; expires: number } | null>(null)

  const triggerDeploy = useCallback(() => {
    setDeploying(true)
    if (deployTimerRef.current) clearTimeout(deployTimerRef.current)
    deployTimerRef.current = setTimeout(() => setDeploying(false), 20000)
  }, [])

  const save = useCallback(
    (fields: Record<string, unknown>, prevValues?: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        setSaving(true)
        try {
          const res = await fetch('/api/dashboard/me/details', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fields),
          })
          if (res.ok) {
            setLastSaved(new Date())
            if (prevValues) setUndoData({ fields: prevValues, expires: Date.now() + 5000 })
            triggerDeploy()
            onSaved()
          }
        } catch { /* silent */ }
        setSaving(false)
      }, 2000)
    },
    [onSaved, triggerDeploy]
  )

  const saveNow = useCallback(
    async (fields: Record<string, unknown>, prevValues?: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaving(true)
      try {
        const res = await fetch('/api/dashboard/me/details', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        })
        if (res.ok) {
          setLastSaved(new Date())
          if (prevValues) setUndoData({ fields: prevValues, expires: Date.now() + 5000 })
          triggerDeploy()
          onSaved()
        }
      } catch { /* silent */ }
      setSaving(false)
    },
    [onSaved, triggerDeploy]
  )

  const undo = useCallback(async () => {
    if (!undoData || Date.now() > undoData.expires) { setUndoData(null); return }
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/me/details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(undoData.fields),
      })
      if (res.ok) {
        setLastSaved(new Date())
        triggerDeploy()
        onSaved()
      }
    } catch { /* silent */ }
    setUndoData(null)
    setSaving(false)
  }, [undoData, onSaved, triggerDeploy])

  // Clear undo after expiry
  useEffect(() => {
    if (!undoData) return
    const t = setTimeout(() => setUndoData(null), Math.max(0, undoData.expires - Date.now()))
    return () => clearTimeout(t)
  }, [undoData])

  return { save, saveNow, saving, lastSaved, deploying, triggerDeploy, undoData, undo }
}

// ─── Inline Editable Text ───────────────────────────────────────────────────────

function InlineEdit({
  value, onChange, className = '', placeholder = 'Click to edit', multiline = false,
}: {
  value: string; onChange: (v: string) => void; className?: string; placeholder?: string; multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

  const commit = () => { setEditing(false); if (draft !== value) onChange(draft) }

  if (editing) {
    if (multiline) {
      return <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }} rows={4}
        className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-indigo-500/50 text-white outline-none resize-none ${className}`} placeholder={placeholder} />
    }
    return <input ref={inputRef as React.RefObject<HTMLInputElement>} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      className={`px-3 py-1 rounded-lg bg-white/5 border border-indigo-500/50 text-white outline-none ${className}`} placeholder={placeholder} />
  }

  return <span onClick={() => setEditing(true)} className={`cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition inline-block ${!value ? 'text-gray-600 italic' : ''} ${className}`} title="Click to edit">{value || placeholder}</span>
}

// ─── Save Status ────────────────────────────────────────────────────────────────

function SaveStatus({ saving, lastSaved, undoData, onUndo }: {
  saving: boolean; lastSaved: Date | null; undoData: { fields: Record<string, unknown>; expires: number } | null; onUndo: () => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t) }, [])

  if (saving) return <span className="text-xs text-gray-400 animate-pulse">Saving...</span>

  if (undoData && now < undoData.expires) {
    return (
      <span className="text-xs text-green-400 flex items-center gap-2">
        ✓ Saved
        <button onClick={onUndo} className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition">Undo</button>
      </span>
    )
  }

  if (lastSaved) {
    const secs = Math.floor((now - lastSaved.getTime()) / 1000)
    const label = secs < 10 ? 'just now' : secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`
    return <span className="text-xs text-gray-500">Saved {label}</span>
  }

  return null
}

// ─── Subdomain Editor ───────────────────────────────────────────────────────────

function SubdomainField({ slug, onUpdate }: { slug: string; onUpdate: (s: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(slug)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setValue(slug) }, [slug])
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

  const handleSave = async () => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
    if (clean.length < 3) { setError('Min 3 chars'); return }
    if (clean === slug) { setEditing(false); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/dashboard/me/subdomain', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subdomain: clean }) })
      const result = await res.json()
      if (res.ok) { onUpdate(result.slug); setEditing(false) } else setError(result.error || 'Failed')
    } catch { setError('Error') }
    setSaving(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-white/5 border border-indigo-500/50 rounded-lg overflow-hidden">
          <input ref={inputRef} type="text" value={value} onChange={e => { setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setValue(slug); setEditing(false) } }}
            className="px-2 py-1 bg-transparent text-white text-xs outline-none w-32" />
          <span className="text-gray-500 text-xs pr-2">.autolocal.ai</span>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition disabled:opacity-40">{saving ? '...' : '✓'}</button>
        <button onClick={() => { setValue(slug); setEditing(false) }} className="text-gray-500 text-xs hover:text-white">✕</button>
        {error && <span className="text-red-400 text-[10px]">{error}</span>}
      </div>
    )
  }
  return <button onClick={() => setEditing(true)} className="text-xs text-gray-500 font-mono hover:text-indigo-400 transition truncate" title="Click to change subdomain">{slug}.autolocal.ai <span className="text-gray-700 ml-1">✎</span></button>
}

// ─── Photo Action Sheet (mobile) ────────────────────────────────────────────────

function PhotoActionSheet({
  url, isHero, canMoveLeft, canMoveRight, onSetHero, onMoveLeft, onMoveRight, onCrop, onRemove, onClose,
}: {
  url: string; isHero: boolean; canMoveLeft: boolean; canMoveRight: boolean
  onSetHero: () => void; onMoveLeft: () => void; onMoveRight: () => void; onCrop: () => void; onRemove: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#18181b] border-t border-white/10 rounded-t-2xl p-4 pb-8 space-y-2 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
        <div className="rounded-xl overflow-hidden mb-3 h-32">
          <img src={url} alt="" className="w-full h-full object-cover" />
        </div>
        {!isHero && <button onClick={() => { onSetHero(); onClose() }} className="w-full py-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-sm">⭐ Set as Hero Image</button>}
        <div className="flex gap-2">
          <button onClick={() => { onMoveLeft(); onClose() }} disabled={!canMoveLeft} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm disabled:opacity-30">← Move Left</button>
          <button onClick={() => { onMoveRight(); onClose() }} disabled={!canMoveRight} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm disabled:opacity-30">Move Right →</button>
        </div>
        <button onClick={() => { onCrop(); onClose() }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm">🔲 Crop Photo</button>
        <button onClick={() => { onRemove(); onClose() }} className="w-full py-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-sm">✕ Remove Photo</button>
        <button onClick={onClose} className="w-full py-3 rounded-xl text-gray-500 font-bold text-sm">Cancel</button>
      </div>
    </div>
  )
}

// ─── Photo Crop Modal ───────────────────────────────────────────────────────────

function PhotoCropModal({ imageUrl, onSave, onClose }: { imageUrl: string; onSave: (cropY: number) => void; onClose: () => void }) {
  const [cropY, setCropY] = useState(50)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-lg w-full">
        <h3 className="text-lg font-bold text-white mb-4">Crop Photo (4:3)</h3>
        <div className="rounded-xl overflow-hidden bg-white/5 mb-4" style={{ aspectRatio: '4/3' }}>
          <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${cropY}%` }} />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-2">Vertical Position</label>
          <input type="range" min="0" max="100" value={cropY} onChange={e => setCropY(parseInt(e.target.value))} className="w-full accent-indigo-600" />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>Top</span><span>Center</span><span>Bottom</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onSave(cropY)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition">Save</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:text-white transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Color Picker Bottom Sheet (mobile) / Inline (desktop) ──────────────────────

function BrandControls({ data, onUpdate, onDeploy }: { data: SiteData; onUpdate: (d: Partial<SiteData>) => void; onDeploy: () => void }) {
  const [primary, setPrimary] = useState(data.brand_color_primary)
  const [secondary, setSecondary] = useState(data.brand_color_secondary)
  const [accent, setAccent] = useState(data.brand_color_accent)
  const [colorSaving, setColorSaving] = useState(false)
  const [colorSaved, setColorSaved] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => { setPrimary(data.brand_color_primary); setSecondary(data.brand_color_secondary); setAccent(data.brand_color_accent) }, [data.brand_color_primary, data.brand_color_secondary, data.brand_color_accent])

  const hasChanges = primary !== data.brand_color_primary || secondary !== data.brand_color_secondary || accent !== data.brand_color_accent

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)
    try {
      const res = await fetch('/api/dashboard/me/brand', { method: 'POST', body: formData })
      const result = await res.json()
      if (res.ok && result.logo_url) { onUpdate({ logo_url: result.logo_url }); onDeploy() }
    } catch { /* silent */ }
  }

  const handleSave = async () => {
    setColorSaving(true)
    try {
      const res = await fetch('/api/dashboard/me/brand', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand_color_primary: primary, brand_color_secondary: secondary, brand_color_accent: accent }) })
      if (res.ok) { onUpdate({ brand_color_primary: primary, brand_color_secondary: secondary, brand_color_accent: accent }); onDeploy(); setColorSaved(true); setTimeout(() => setColorSaved(false), 2000) }
    } catch { /* silent */ }
    setColorSaving(false)
  }

  const pickerContent = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PALETTES.map(p => (
          <button key={p.name} onClick={() => { setPrimary(p.primary); setSecondary(p.secondary); setAccent(p.accent) }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${primary === p.primary && accent === p.accent ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-white/[0.06] text-gray-500 hover:border-white/10'}`}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Primary', value: primary, set: setPrimary }, { label: 'Secondary', value: secondary, set: setSecondary }, { label: 'Accent', value: accent, set: setAccent }].map(c => (
          <div key={c.label}>
            <label className="block text-[10px] text-gray-500 mb-1">{c.label}</label>
            <div className="flex items-center gap-1.5">
              <input type="color" value={c.value} onChange={e => c.set(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
              <input type="text" value={c.value} onChange={e => c.set(e.target.value)} className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[11px] font-mono focus:border-indigo-500 outline-none" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg overflow-hidden flex h-8">
          <div className="flex-[3]" style={{ backgroundColor: primary }} />
          <div className="flex-[2]" style={{ backgroundColor: secondary }} />
          <div className="flex-[1]" style={{ backgroundColor: accent }} />
        </div>
        <button onClick={handleSave} disabled={colorSaving || !hasChanges} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition disabled:opacity-40">{colorSaving ? '...' : 'Save Colors'}</button>
      </div>
    </div>
  )

  return (
    <section id="sec-brand" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">Brand</h3>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {data.logo_url ? <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-xl text-gray-600">📷</span>}
          </div>
          <label className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:border-white/20 transition cursor-pointer">
            {data.logo_url ? 'Change' : 'Upload Logo'}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }} className="hidden" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition" title="Edit colors">
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: primary }} />
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: secondary }} />
            <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: accent }} />
            <span className="text-xs text-gray-400 ml-1">Colors</span>
          </button>
          {colorSaved && <span className="text-xs text-green-400">✓ Saved</span>}
        </div>
      </div>

      {/* Desktop: inline picker */}
      {showPicker && <div className="hidden md:block p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">{pickerContent}</div>}

      {/* Mobile: bottom sheet */}
      {showPicker && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-lg bg-[#18181b] border-t border-white/10 rounded-t-2xl p-5 pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white mb-4">Brand Colors</h3>
            {pickerContent}
            <button onClick={() => setShowPicker(false)} className="w-full mt-4 py-3 rounded-xl text-gray-500 font-bold text-sm">Done</button>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Sortable Photo Item ────────────────────────────────────────────────────────

function SortablePhoto({
  url, isHero, index, totalCount, onSetHero, onCrop, onRemove, onReorder, onActionSheet,
}: {
  url: string; isHero: boolean; index: number; totalCount: number
  onSetHero: () => void; onCrop: () => void; onRemove: () => void
  onReorder: (from: number, to: number) => void; onActionSheet: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url })
  const sortStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
    aspectRatio: '4/3',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
  }

  return (
    <div ref={setNodeRef} style={sortStyle} {...attributes} {...listeners}
      className={`relative rounded-lg overflow-hidden bg-white/5 cursor-grab active:cursor-grabbing group touch-none select-none ${isDragging ? 'shadow-2xl shadow-indigo-500/20 scale-105 ring-2 ring-indigo-500/50' : ''}`}
      onClick={e => {
        // Only open action sheet on quick tap (not after drag), mobile only
        if (!isDragging && window.innerWidth < 768) { e.preventDefault(); onActionSheet() }
      }}>
      <img src={url} alt="" className="w-full h-full object-cover pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: 'none' }} />
      {isHero && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white pointer-events-none">Hero</span>}
      {/* Desktop hover overlay */}
      <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex-col items-center justify-center gap-1.5 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex gap-1">
          {!isHero && <button onClick={e => { e.stopPropagation(); onSetHero() }} className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 cursor-pointer">Set Hero</button>}
          <button onClick={e => { e.stopPropagation(); onCrop() }} className="px-2 py-1 rounded bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 cursor-pointer">Crop</button>
          <button onClick={e => { e.stopPropagation(); onRemove() }} className="px-2 py-1 rounded bg-red-600/80 text-white text-[10px] font-bold hover:bg-red-500 cursor-pointer">✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Photo Grid with Drag ───────────────────────────────────────────────────────

function PhotoGrid({
  galleryImages, heroImageUrl, onReorder, onSetHero, onCrop, onRemove, onActionSheet, onUpload,
}: {
  galleryImages: string[]; heroImageUrl: string | null
  onReorder: (oldIndex: number, newIndex: number) => void
  onSetHero: (url: string) => void; onCrop: (url: string, i: number) => void
  onRemove: (url: string) => void; onActionSheet: (url: string, i: number) => void
  onUpload: (f: File) => void
}) {
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  const sensors = useSensors(pointerSensor, touchSensor)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = galleryImages.indexOf(active.id as string)
    const newIndex = galleryImages.indexOf(over.id as string)
    if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex)
  }

  return (
    <section id="sec-photos" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400">Photos</h3>
      <p className="text-xs text-gray-600">Hold and drag to reorder. Tap to manage. All photos display at 4:3.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={galleryImages} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {galleryImages.map((url, i) => (
              <SortablePhoto
                key={url}
                url={url}
                isHero={url === heroImageUrl}
                index={i}
                totalCount={galleryImages.length}
                onSetHero={() => onSetHero(url)}
                onCrop={() => onCrop(url, i)}
                onRemove={() => onRemove(url)}
                onReorder={onReorder}
                onActionSheet={() => onActionSheet(url, i)}
              />
            ))}
            <label className="rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 transition cursor-pointer" style={{ aspectRatio: '4/3' }}>
              <span className="text-2xl">＋</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} className="hidden" />
            </label>
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

// ─── Hours Helpers ──────────────────────────────────────────────────────────────

function parseHours(val: string): { open: string; close: string } {
  if (!val || val.toLowerCase() === 'closed') return { open: '', close: '' }
  const parts = val.split(/\s*[-–]\s*/)
  return { open: parts[0]?.trim() || '', close: parts[1]?.trim() || '' }
}

// ─── Hamburger Menu (mobile) ────────────────────────────────────────────────────

function MobileMenu({ data, onLogout, onClose, onSubdomainUpdate, onSiteTypeToggle }: {
  data: SiteData; onLogout: () => void; onClose: () => void; onSubdomainUpdate: (s: string) => void; onSiteTypeToggle: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#18181b] border-l border-white/10 p-6 space-y-5 animate-slide-left" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-500 text-xl hover:text-white">✕</button>
        </div>

        {/* Subdomain */}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Website URL</label>
          <SubdomainField slug={data.slug} onUpdate={onSubdomainUpdate} />
        </div>

        {/* Site Type */}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Site Type</label>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${data.site_mode !== 'individual' ? 'text-white' : 'text-gray-500'}`}>Business</span>
            <button onClick={onSiteTypeToggle}
              className={`relative w-9 h-5 rounded-full transition ${data.site_mode === 'individual' ? 'bg-indigo-600' : 'bg-white/20'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${data.site_mode === 'individual' ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            <span className={`text-xs font-medium ${data.site_mode === 'individual' ? 'text-white' : 'text-gray-500'}`}>Individual</span>
          </div>
        </div>

        {/* Billing */}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Plan</label>
          <p className="text-sm text-white">{data.plan === 'living' ? '🚀 Living — $49/mo' : '📄 Starter — $9/mo'}</p>
          <button onClick={async () => {
            try { const res = await fetch('/api/billing-portal', { method: 'POST' }); const d = await res.json(); if (d.url) window.location.href = d.url } catch { /* */ }
          }} className="text-xs text-indigo-400 hover:underline mt-1">Manage Billing</button>
        </div>

        {/* Actions */}
        <a href={data.website_url || data.preview_url} target="_blank" className="block w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold text-center hover:bg-indigo-500 transition">View Site ↗</a>
        <button onClick={onLogout} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-bold hover:text-white transition">Sign Out</button>
      </div>
    </div>
  )
}

// ─── Section Nav Pills ──────────────────────────────────────────────────────────

function SectionNav({ activeSection }: { activeSection: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lg:hidden sticky top-[57px] z-40 bg-[#09090b]/95 backdrop-blur border-b border-white/[0.06] px-3 py-2 overflow-x-auto">
      <div className="flex gap-1.5 min-w-max">
        {SECTION_IDS.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeSection === s.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [previewKey, setPreviewKey] = useState(0)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [cropPhoto, setCropPhoto] = useState<{ url: string; index: number } | null>(null)
  const [actionSheet, setActionSheet] = useState<{ url: string; index: number } | null>(null)
  const [activeSection, setActiveSection] = useState('sec-template')
  const [tabletPreview, setTabletPreview] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('al_tablet_preview') === '1'
    return false
  })
  const [expandedService, setExpandedService] = useState<number | null>(null)

  // Change request
  const [changeMessage, setChangeMessage] = useState('')
  const [submittingChange, setSubmittingChange] = useState(false)
  const [changeSubmitted, setChangeSubmitted] = useState(false)

  const refreshPreview = useCallback(() => { setPreviewKey(k => k + 1) }, [])
  const { save, saveNow, saving, lastSaved, deploying, triggerDeploy, undoData, undo } = useAutosave(refreshPreview)

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )
    const timeout = setTimeout(() => {
      SECTION_IDS.forEach(s => {
        const el = document.getElementById(s.id)
        if (el) observer.observe(el)
      })
    }, 500)
    return () => { clearTimeout(timeout); observer.disconnect() }
  }, [data])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')
      try {
        const res = await fetch('/api/dashboard/me')
        if (res.status === 401) { router.push('/login'); return }
        if (!res.ok) { const err = await res.json(); setError(err.error || 'No website found.'); setLoading(false); return }
        setData(await res.json())
      } catch { setError('Failed to load dashboard.') }
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const updateField = useCallback((field: string, value: unknown) => {
    if (!data) return
    const prev = { [field]: (data as any)[field] }
    setData(p => p ? { ...p, [field]: value } : p)
    save({ [field]: value }, prev)
  }, [data, save])

  const updateFieldNow = useCallback((field: string, value: unknown) => {
    if (!data) return
    const prev = { [field]: (data as any)[field] }
    setData(p => p ? { ...p, [field]: value } : p)
    saveNow({ [field]: value }, prev)
  }, [data, saveNow])

  const mergeUpdate = useCallback((partial: Partial<SiteData>) => {
    setData(p => p ? { ...p, ...partial } : p)
    refreshPreview()
  }, [refreshPreview])

  // Photo handlers
  const handlePhotoUpload = async (file: File, target: 'hero' | 'gallery') => {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('target', target)
    try {
      const res = await fetch('/api/dashboard/me/photos', { method: 'POST', body: formData })
      const result = await res.json()
      if (res.ok) {
        if (target === 'hero') setData(p => p ? { ...p, hero_image_url: result.url } : p)
        else {
          setData(p => p ? { ...p, gallery_images: [...(p.gallery_images || []), result.url] } : p)
          setCropPhoto({ url: result.url, index: (data?.gallery_images?.length || 0) })
        }
        triggerDeploy(); refreshPreview()
      }
    } catch { /* */ }
  }

  const handlePhotoRemove = async (url: string) => {
    try {
      const res = await fetch('/api/dashboard/me/photos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove', url }) })
      if (res.ok) {
        setData(p => {
          if (!p) return p
          const gallery = p.gallery_images.filter(u => u !== url)
          return { ...p, gallery_images: gallery, hero_image_url: p.hero_image_url === url ? (gallery[0] || null) : p.hero_image_url }
        })
        triggerDeploy(); refreshPreview()
      }
    } catch { /* */ }
  }

  const handlePhotoReorder = async (fromIdx: number, toIdx: number) => {
    if (!data) return
    const gallery = [...(data.gallery_images || [])]
    if (toIdx < 0 || toIdx >= gallery.length) return
    const [moved] = gallery.splice(fromIdx, 1)
    gallery.splice(toIdx, 0, moved)
    setData(p => p ? { ...p, gallery_images: gallery } : p)
    await fetch('/api/dashboard/me/photos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reorder', gallery_images: gallery }) })
    triggerDeploy(); refreshPreview()
  }

  const handlePhotoDragEnd = async (oldIndex: number, newIndex: number) => {
    if (!data) return
    const newGallery = arrayMove(data.gallery_images || [], oldIndex, newIndex)
    setData(p => p ? { ...p, gallery_images: newGallery } : p)
    await fetch('/api/dashboard/me/photos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reorder', gallery_images: newGallery }) })
    triggerDeploy(); refreshPreview()
  }

  const handleSetHero = async (url: string) => {
    const res = await fetch('/api/dashboard/me/photos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set_hero', url }) })
    if (res.ok) { setData(p => p ? { ...p, hero_image_url: url } : p); triggerDeploy(); refreshPreview() }
  }

  // Service handlers
  const updateService = (idx: number, field: keyof ServiceItem, value: string) => {
    if (!data) return
    const services = [...(data.services || [])]; services[idx] = { ...services[idx], [field]: value }
    setData(p => p ? { ...p, services } : p); save({ services })
  }
  const addService = () => { if (!data) return; const services = [...(data.services || []), { name: 'New Service', description: '', price: '' }]; setData(p => p ? { ...p, services } : p); saveNow({ services }) }
  const removeService = (idx: number) => { if (!data) return; const services = (data.services || []).filter((_, i) => i !== idx); setData(p => p ? { ...p, services } : p); saveNow({ services }) }

  // Hours
  const updateHours = (day: string, open: string, close: string) => {
    if (!data) return
    const val = open && close ? `${open} - ${close}` : 'Closed'
    const hours = { ...(data.hours || {}), [day]: val }
    setData(p => p ? { ...p, hours } : p); save({ hours })
  }
  const toggleDayClosed = (day: string) => {
    if (!data) return
    const current = data.hours?.[day] || ''
    const isClosed = current.toLowerCase() === 'closed' || !current
    const hours = { ...(data.hours || {}), [day]: isClosed ? '9:00 AM - 5:00 PM' : 'Closed' }
    setData(p => p ? { ...p, hours } : p); saveNow({ hours })
  }
  const copyToWeekdays = () => {
    if (!data) return
    const mon = data.hours?.['Monday'] || '9:00 AM - 5:00 PM'
    const hours = { ...(data.hours || {}) }
    for (const d of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) hours[d] = mon
    setData(p => p ? { ...p, hours } : p); saveNow({ hours })
  }

  // Change request
  const submitChange = async () => {
    if (!changeMessage.trim()) return
    setSubmittingChange(true)
    try {
      const res = await fetch('/api/dashboard/me/changes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'custom', message: changeMessage.trim(), priority: 'normal' }) })
      if (res.ok) { setChangeSubmitted(true); setChangeMessage(''); setTimeout(() => setChangeSubmitted(false), 5000) }
    } catch { /* */ }
    setSubmittingChange(false)
  }

  // ─── Loading / Error ──────────────────────

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <h1 className="text-2xl font-black text-white mb-2">No Website Found</h1>
          <p className="text-gray-400">{error || 'No website linked to your account.'}</p>
          <p className="text-gray-500 text-sm mt-2">Signed in as <span className="text-indigo-400">{userEmail}</span></p>
          <div className="flex gap-3 justify-center mt-6">
            <a href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">Get a Website — $99</a>
            <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white transition">Sign Out</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* ═══ CSS for animations ═══ */}
      <style jsx global>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-left { animation: slide-left 0.25s ease-out; }
      `}</style>

      {/* ═══ Header — Desktop ═══ */}
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {/* Business Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-none">
            <InlineEdit value={data.business_name} onChange={v => updateFieldNow('business_name', v)} className="text-lg font-black text-white truncate" placeholder="Business Name" />
          </div>

          {/* Deploy Badge */}
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            deploying ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'
              : data.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/20'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
          }`}>
            {deploying ? '⟳ Deploying...' : data.status === 'published' ? '🟢 LIVE' : '🟡 DRAFT'}
          </span>

          {/* Desktop-only controls */}
          <div className="hidden md:flex items-center gap-3 flex-1">
            <SubdomainField slug={data.slug} onUpdate={s => { setData(p => p ? { ...p, slug: s } : p); refreshPreview() }} />

            <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
              <span className={`text-xs font-medium ${data.site_mode !== 'individual' ? 'text-white' : 'text-gray-500'}`}>Business</span>
              <button onClick={() => updateFieldNow('site_mode', data.site_mode === 'individual' ? 'business' : 'individual')}
                className={`relative w-9 h-5 rounded-full transition ${data.site_mode === 'individual' ? 'bg-indigo-600' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${data.site_mode === 'individual' ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
              <span className={`text-xs font-medium ${data.site_mode === 'individual' ? 'text-white' : 'text-gray-500'}`}>Individual</span>
            </div>

            <div className="flex-1" />

            <SaveStatus saving={saving} lastSaved={lastSaved} undoData={undoData} onUndo={async () => { await undo(); const res = await fetch('/api/dashboard/me'); if (res.ok) setData(await res.json()) }} />

            <span className="text-xs text-gray-500">{data.plan === 'living' ? '🚀 Living — $49/mo' : '📄 Starter — $9/mo'}</span>

            <a href={data.website_url || data.preview_url} target="_blank" className="shrink-0 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">View Site ↗</a>

            <button onClick={handleLogout} className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition">Sign Out</button>
          </div>

          {/* Mobile: save status + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <SaveStatus saving={saving} lastSaved={lastSaved} undoData={undoData} onUndo={async () => { await undo(); const res = await fetch('/api/dashboard/me'); if (res.ok) setData(await res.json()) }} />
            <button onClick={() => setMobileMenu(true)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Section Nav Pills (mobile + tablet) ═══ */}
      <SectionNav activeSection={activeSection} />

      {/* ═══ Tablet Preview (768-1024px) ═══ */}
      <div className="hidden md:block lg:hidden px-4 pt-4 max-w-7xl mx-auto">
        <button onClick={() => { const v = !tabletPreview; setTabletPreview(v); localStorage.setItem('al_tablet_preview', v ? '1' : '0') }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Preview</span>
          <span className="text-xs text-gray-500">{tabletPreview ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {tabletPreview && (
          <div className="mt-2 rounded-xl border border-white/10 overflow-hidden bg-white" style={{ height: '280px' }}>
            <iframe key={previewKey} src={`/preview/${data.slug}?t=${previewKey}`} className="w-[1280px] h-[2400px] origin-top-left" style={{ transform: 'scale(0.22)', transformOrigin: 'top left' }} title="Preview" />
          </div>
        )}
      </div>

      {/* ═══ Main Layout ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* ─── Left: Content Editor ─── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Template Carousel */}
            <section id="sec-template" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Design Template</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => updateFieldNow('template', t.id)}
                    className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition min-w-[80px] sm:min-w-[90px] ${
                      data.template === t.id ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                    }`}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className={`text-xs font-semibold ${data.template === t.id ? 'text-white' : 'text-gray-400'}`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Brand */}
            <BrandControls data={data} onUpdate={mergeUpdate} onDeploy={triggerDeploy} />

            {/* Hero */}
            <section id="sec-hero" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400">Hero</h3>
              <div className="relative group rounded-xl overflow-hidden bg-white/5" style={{ aspectRatio: '4/3', maxHeight: '300px' }}>
                {data.hero_image_url ? (
                  <img src={data.hero_image_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${data.hero_crop || 50}%` }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><span className="text-4xl">📷</span></div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition cursor-pointer">
                  <span className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold">📤 Change Hero Image</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'hero') }} className="hidden" />
                </label>
              </div>
              {/* Hero Crop Slider */}
              {data.hero_image_url && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Image Position</label>
                  <input type="range" min="0" max="100" value={data.hero_crop || 50}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      setData(p => p ? { ...p, hero_crop: v } : p)
                    }}
                    onMouseUp={e => saveNow({ hero_crop: parseInt((e.target as HTMLInputElement).value) })}
                    onTouchEnd={e => saveNow({ hero_crop: parseInt((e.target as HTMLInputElement).value) })}
                    className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-0.5"><span>Top</span><span>Center</span><span>Bottom</span></div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Headline</label>
                <InlineEdit value={data.business_name} onChange={v => updateField('business_name', v)} className="text-xl font-black" placeholder="Your Business Name" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tagline</label>
                <InlineEdit value={data.tagline || ''} onChange={v => updateField('tagline', v)} className="text-gray-300" placeholder="A short description" />
              </div>
            </section>

            {/* Contact */}
            <section id="sec-contact" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">Contact Info</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">📞 Phone</label><InlineEdit value={data.phone || ''} onChange={v => updateField('phone', v)} className="text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">📧 Email</label><InlineEdit value={data.contact_email || data.email || ''} onChange={v => updateField('display_email', v)} className="text-sm" placeholder="you@example.com" /></div>
                <div className="sm:col-span-2"><label className="block text-xs text-gray-500 mb-1">📍 Address</label><InlineEdit value={data.address || ''} onChange={v => updateField('address', v)} className="text-sm" placeholder="123 Main St, City, State" /></div>
              </div>
            </section>

            {/* About */}
            <section id="sec-about" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">About</h3>
              <InlineEdit value={data.description || ''} onChange={v => updateField('description', v)} className="text-gray-300 text-sm leading-relaxed" placeholder="Tell customers about your business..." multiline />
            </section>

            {/* Services — progressive disclosure on mobile */}
            <section id="sec-services" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400">Services</h3>
              <div className="space-y-2">
                {(data.services || []).map((s, i) => {
                  const isExpanded = expandedService === i
                  return (
                    <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] group">
                      {/* Mobile: compact row, tap to expand */}
                      <div className="md:hidden">
                        <button onClick={() => setExpandedService(isExpanded ? null : i)} className="w-full flex items-center justify-between p-3">
                          <span className="font-semibold text-sm text-white truncate">{s.name || 'New Service'}</span>
                          <div className="flex items-center gap-2">
                            {s.price && <span className="text-xs text-gray-400">{s.price}</span>}
                            <span className={`text-gray-500 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04] pt-2">
                            <InlineEdit value={s.name} onChange={v => updateService(i, 'name', v)} className="font-semibold text-sm w-full" placeholder="Service name" />
                            <InlineEdit value={s.description || ''} onChange={v => updateService(i, 'description', v)} className="text-xs text-gray-400 w-full" placeholder="Description" />
                            <div className="flex items-center justify-between">
                              <InlineEdit value={s.price || ''} onChange={v => updateService(i, 'price', v)} className="text-sm text-gray-400" placeholder="Price" />
                              <button onClick={() => removeService(i)} className="text-red-400 text-xs">✕ Remove</button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Desktop: fully expanded */}
                      <div className="hidden md:flex items-start gap-3 p-3">
                        <div className="flex-1 space-y-1">
                          <InlineEdit value={s.name} onChange={v => updateService(i, 'name', v)} className="font-semibold text-sm" placeholder="Service name" />
                          <InlineEdit value={s.description || ''} onChange={v => updateService(i, 'description', v)} className="text-xs text-gray-400" placeholder="Description (optional)" />
                        </div>
                        <InlineEdit value={s.price || ''} onChange={v => updateService(i, 'price', v)} className="text-sm text-gray-400 shrink-0 w-24 text-right" placeholder="Price" />
                        <button onClick={() => removeService(i)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition shrink-0">✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button onClick={addService} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 text-sm transition">＋ Add Service</button>
            </section>

            {/* Hours */}
            <section id="sec-hours" className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400">Hours</h3>
                <button onClick={copyToWeekdays} className="text-xs text-indigo-400 hover:text-indigo-300 transition">Copy Mon → weekdays</button>
              </div>
              <div className="space-y-2">
                {DAYS.map(day => {
                  const val = data.hours?.[day] || ''
                  const isClosed = val.toLowerCase() === 'closed' || !val
                  const { open, close } = parseHours(val)
                  return (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-12 sm:w-20 text-xs text-gray-400 shrink-0">{day.slice(0, 3)}</span>
                      <button onClick={() => toggleDayClosed(day)} className={`w-10 h-5 rounded-full transition relative shrink-0 ${isClosed ? 'bg-white/10' : 'bg-green-600'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isClosed ? 'left-0.5' : 'left-5'}`} />
                      </button>
                      {isClosed ? <span className="text-xs text-gray-600">Closed</span> : (
                        <div className="flex items-center gap-1.5 flex-1">
                          <select value={open} onChange={e => updateHours(day, e.target.value, close)} className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-indigo-500 outline-none appearance-none">
                            <option value="" className="bg-[#18181b]">Open</option>
                            {TIME_OPTIONS.map(t => <option key={t} value={t} className="bg-[#18181b]">{t}</option>)}
                          </select>
                          <span className="text-gray-600 text-xs hidden sm:inline">to</span>
                          <select value={close} onChange={e => updateHours(day, open, e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-indigo-500 outline-none appearance-none">
                            <option value="" className="bg-[#18181b]">Close</option>
                            {TIME_OPTIONS.map(t => <option key={t} value={t} className="bg-[#18181b]">{t}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Photos — drag to reorder */}
            <PhotoGrid
              galleryImages={data.gallery_images || []}
              heroImageUrl={data.hero_image_url}
              onReorder={handlePhotoDragEnd}
              onSetHero={handleSetHero}
              onCrop={(url, i) => setCropPhoto({ url, index: i })}
              onRemove={handlePhotoRemove}
              onActionSheet={(url, i) => setActionSheet({ url, index: i })}
              onUpload={f => handlePhotoUpload(f, 'gallery')}
            />

            {/* Bottom */}
            <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Need something special?</h3>
                {changeSubmitted ? <p className="text-sm text-green-400">✅ Request submitted!</p> : (
                  <div className="flex gap-2">
                    <input value={changeMessage} onChange={e => setChangeMessage(e.target.value)} placeholder="Describe what you'd like changed..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none focus:border-indigo-500 transition"
                      onKeyDown={e => { if (e.key === 'Enter') submitChange() }} />
                    <button onClick={submitChange} disabled={submittingChange || !changeMessage.trim()} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-40">{submittingChange ? '...' : 'Submit'}</button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/[0.06] text-xs text-gray-500">
                <span>{data.plan === 'living' ? '🚀 Living — $49/mo' : '📄 Starter — $9/mo'}</span>
                <button onClick={async () => { try { const res = await fetch('/api/billing-portal', { method: 'POST' }); const d = await res.json(); if (d.url) window.location.href = d.url } catch { /* */ } }} className="text-indigo-400 hover:underline">Manage Billing</button>
                <span className="text-gray-700">·</span>
                <a href="mailto:support@autolocal.ai?subject=Feedback" className="hover:text-gray-300 transition">💡 Feedback</a>
                <a href="mailto:support@autolocal.ai?subject=Bug Report" className="hover:text-gray-300 transition">🐛 Bug</a>
              </div>
            </section>
          </div>

          {/* ─── Right: Live Preview (desktop only, lg+) ─── */}
          <div className="hidden lg:block w-[420px] shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h3>
                <a href={data.preview_url || data.website_url} target="_blank" className="text-xs text-indigo-400 hover:underline">Full size ↗</a>
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden bg-white" style={{ height: '680px' }}>
                <iframe key={previewKey} src={`/preview/${data.slug}?t=${previewKey}`} className="w-[1280px] h-[2400px] origin-top-left" style={{ transform: 'scale(0.328)', transformOrigin: 'top left' }} title="Live Preview" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Bottom Action Bar ═══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur border-t border-white/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobilePreview(true)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2">
          👁 Preview
        </button>
        <a href={data.website_url || data.preview_url} target="_blank" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold text-center hover:bg-indigo-500 transition">
          View Live Site ↗
        </a>
      </div>

      {/* Spacer for bottom bar */}
      <div className="md:hidden h-16" />

      {/* ═══ Mobile Preview Overlay ═══ */}
      {mobilePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-sm font-bold text-white">Preview</h3>
            <button onClick={() => setMobilePreview(false)} className="text-white text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-auto p-4 pb-0">
            <iframe key={previewKey} src={`/preview/${data.slug}?t=${previewKey}`} className="w-full rounded-xl border border-white/10" style={{ minHeight: '600px', height: '100%' }} title="Preview" />
          </div>
        </div>
      )}

      {/* ═══ Mobile Menu ═══ */}
      {mobileMenu && <MobileMenu data={data} onLogout={handleLogout} onClose={() => setMobileMenu(false)}
        onSubdomainUpdate={s => { setData(p => p ? { ...p, slug: s } : p); refreshPreview(); setMobileMenu(false) }}
        onSiteTypeToggle={() => { updateFieldNow('site_mode', data.site_mode === 'individual' ? 'business' : 'individual'); setMobileMenu(false) }} />}

      {/* ═══ Photo Action Sheet (mobile) ═══ */}
      {actionSheet && (
        <PhotoActionSheet
          url={actionSheet.url}
          isHero={actionSheet.url === data.hero_image_url}
          canMoveLeft={actionSheet.index > 0}
          canMoveRight={actionSheet.index < (data.gallery_images || []).length - 1}
          onSetHero={() => handleSetHero(actionSheet.url)}
          onMoveLeft={() => handlePhotoReorder(actionSheet.index, actionSheet.index - 1)}
          onMoveRight={() => handlePhotoReorder(actionSheet.index, actionSheet.index + 1)}
          onCrop={() => setCropPhoto(actionSheet)}
          onRemove={() => handlePhotoRemove(actionSheet.url)}
          onClose={() => setActionSheet(null)}
        />
      )}

      {/* ═══ Photo Crop Modal ═══ */}
      {cropPhoto && (
        <PhotoCropModal imageUrl={cropPhoto.url} onSave={async (cropY) => {
          if (cropPhoto.url === data.hero_image_url) { await saveNow({ hero_crop: cropY }); setData(p => p ? { ...p, hero_crop: cropY } : p) }
          setCropPhoto(null)
        }} onClose={() => setCropPhoto(null)} />
      )}

      <footer className="py-6 px-4 border-t border-white/5 text-center mb-16 md:mb-0">
        <p className="text-gray-600 text-sm">Powered by <a href="https://autolocal.ai" className="text-indigo-400 hover:underline">AutoLocal.ai</a></p>
      </footer>
    </div>
  )
}
