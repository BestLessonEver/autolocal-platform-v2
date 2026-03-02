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
  { key: 'clutch', label: 'Classic', icon: '🔧' },
  { key: 'artika', label: 'Elegant', icon: '✨' },
  { key: 'bde', label: 'Bold', icon: '⚡' },
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

  // Delay banner appearance by 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setBannerVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

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
              <a
                href="https://autolocal.ai/offer"
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-sm font-bold hover:bg-gray-100 transition whitespace-nowrap"
              >
                Get Started — $499
              </a>
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
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-2">Choose your style</span>
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
      </div>

      {/* Template content — no forced top padding, let the site breathe */}
      <TemplateErrorBoundary key={activeTemplate} fallback={<div>Error loading template</div>}>
        <Template data={data} />
      </TemplateErrorBoundary>

      {/* Powered by AutoLocal */}
      <div className="fixed bottom-4 right-4 z-50">
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
