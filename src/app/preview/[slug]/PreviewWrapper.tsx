/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Component, type ErrorInfo, type ReactNode } from 'react'
import { type PreviewData, type TemplateName, categoryToTemplate } from '@/components/templates/types'
import BoldTemplate from '@/components/templates/BoldTemplate'
import ElegantTemplate from '@/components/templates/ElegantTemplate'
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate'
import ClutchTemplate from '@/components/templates/ClutchTemplate'
import ArtikaTemplate from '@/components/templates/ArtikaTemplate'
import BDETemplate from '@/components/templates/BDETemplate'

class TemplateErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Template Error]', error, info.componentStack)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <p className="text-red-600 font-bold mb-2">Template Error</p>
            <p className="text-gray-600 text-sm">{this.state.error?.message}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const TEMPLATE_MAP: Record<TemplateName, React.ComponentType<{ data: PreviewData }>> = {
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  professional: ProfessionalTemplate,
  clutch: ClutchTemplate,
  artika: ArtikaTemplate,
  bde: BDETemplate,
}

const TEMPLATE_OPTIONS: { key: TemplateName; label: string; icon: string }[] = [
  { key: 'bold', label: 'Bold', icon: '⚡' },
  { key: 'elegant', label: 'Elegant', icon: '✨' },
  { key: 'professional', label: 'Pro', icon: '🏢' },
  { key: 'bde', label: 'Dark', icon: '🖤' },
]

function resolveTemplate(data: PreviewData): TemplateName {
  const t = data.template?.toLowerCase()
  if (t && t in TEMPLATE_MAP) return t as TemplateName
  if (t === 'modern_clean' || t === 'modern-clean') return 'clutch'
  if (t === 'salon_spa' || t === 'salon-spa') return 'artika'
  return categoryToTemplate(data.category)
}

export default function PreviewWrapper({ data }: { data: PreviewData }) {
  const [bannerVisible, setBannerVisible] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>(() => resolveTemplate(data))
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [edits, setEdits] = useState({
    business_name: data.business_name || '',
    tagline: data.tagline || '',
    description: data.description || '',
    phone: data.phone || '',
    address: data.address || '',
  })

  // Delay banner appearance by 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setBannerVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveEdits = async () => {
    setSaving(true)
    try {
      await fetch(`/api/preview/${data.slug}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits),
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); setEditOpen(false) }, 1500)
    } catch { /* silent */ }
    setSaving(false)
  }

  // Apply edits to preview in real-time
  const liveData = {
    ...data,
    business_name: edits.business_name || data.business_name,
    tagline: edits.tagline || data.tagline,
    description: edits.description || data.description,
    phone: edits.phone || data.phone,
    address: edits.address || data.address,
  }

  // Filter out reviews below 4 stars
  const filteredData = {
    ...liveData,
    reviews: (data.reviews || []).filter(r => r.rating >= 4),
  }

  const Template = TEMPLATE_MAP[activeTemplate]

  return (
    <>
      {/* Preview Banner — slides in after 3 seconds */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          bannerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <p className="text-sm font-medium">
              ✨ This is a preview of your new website
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        product: 'website',
                        email: filteredData.email || '',
                        businessName: filteredData.business_name || '',
                      }),
                    })
                    const d = await res.json()
                    if (d.url) window.location.href = d.url
                  } catch {
                    window.location.href = `https://autolocal.ai/offer?business=${encodeURIComponent(filteredData.business_name || '')}&e=${encodeURIComponent(filteredData.email || '')}`
                  }
                }}
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-sm font-bold hover:bg-gray-100 transition whitespace-nowrap"
              >
                Get Started — $99
              </button>
              <button
                onClick={() => setBannerVisible(false)}
                className="text-white/70 hover:text-white transition text-xl leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Choose Your Style — directly below banner */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-gray-500 uppercase tracking-wide mr-2">Choose your style</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
              {TEMPLATE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setActiveTemplate(opt.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeTemplate === opt.key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Customize button */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <button
            onClick={() => setEditOpen(!editOpen)}
            className="w-full text-center text-xs text-indigo-600 py-1.5 font-medium hover:text-indigo-800 transition"
          >
            ✏️ {editOpen ? 'Close Editor' : 'Customize your text — click here'}
          </button>
        </div>
      </div>

      {/* Edit Panel — slides down below banner */}
      {editOpen && (
        <div className="fixed top-[145px] sm:top-[130px] left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                <input
                  type="text"
                  value={edits.business_name}
                  onChange={e => setEdits({ ...edits, business_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tagline</label>
                <input
                  type="text"
                  value={edits.tagline}
                  onChange={e => setEdits({ ...edits, tagline: e.target.value })}
                  placeholder="Your catchy headline"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={edits.description}
                onChange={e => setEdits({ ...edits, description: e.target.value })}
                rows={2}
                placeholder="Tell visitors about your business..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={edits.phone}
                  onChange={e => setEdits({ ...edits, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <input
                  type="text"
                  value={edits.address}
                  onChange={e => setEdits({ ...edits, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveEdits}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Close
              </button>
              {saved && <span className="text-green-600 text-xs font-medium">Changes saved — preview updated!</span>}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">📸 You can change the hero image, reorder photos, and crop images after purchase in your dashboard</p>
              {(!data.services || data.services.length === 0) && (
                <p className="text-xs text-gray-500">📋 No services listed yet — you can add services after purchase in your dashboard</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template content — no forced top padding, let the site breathe */}
      <TemplateErrorBoundary key={activeTemplate} fallback={<div>Error loading template</div>}>
        <Template data={filteredData} />
      </TemplateErrorBoundary>

      {/* Powered by AutoLocal — above sticky call bar on mobile */}
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-50">
        <a
          href="https://autolocal.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition"
        >
          ⚡ Powered by AutoLocal.ai
        </a>
      </div>
    </>
  )
}
