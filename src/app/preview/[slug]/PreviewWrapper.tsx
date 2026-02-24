/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type PreviewData, type TemplateName, categoryToTemplate } from '@/components/templates/types'
import BoldTemplate from '@/components/templates/BoldTemplate'
import ElegantTemplate from '@/components/templates/ElegantTemplate'
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate'

const TEMPLATE_MAP: Record<TemplateName, React.ComponentType<{ data: PreviewData }>> = {
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  professional: ProfessionalTemplate,
}

const TEMPLATE_OPTIONS: { key: TemplateName; label: string; icon: string }[] = [
  { key: 'bold', label: 'Bold', icon: '⚡' },
  { key: 'elegant', label: 'Elegant', icon: '✨' },
  { key: 'professional', label: 'Professional', icon: '🏢' },
]

function resolveTemplate(data: PreviewData): TemplateName {
  // Check data.template first
  const t = data.template?.toLowerCase()
  if (t === 'bold' || t === 'elegant' || t === 'professional') return t
  // Legacy: map old template names
  if (t === 'modern_clean' || t === 'modern-clean') return 'bold'
  if (t === 'salon_spa' || t === 'salon-spa') return 'elegant'
  // Fall back to category mapping
  return categoryToTemplate(data.category)
}

export default function PreviewWrapper({ data }: { data: PreviewData }) {
  const [bannerVisible, setBannerVisible] = useState(true)
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>(() => resolveTemplate(data))

  const Template = TEMPLATE_MAP[activeTemplate]

  return (
    <>
      {/* Preview Banner */}
      {bannerVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm sm:text-base font-medium">
              ✨ This is a preview of your new website —{' '}
              <span className="hidden sm:inline">Ready to make it real?</span>
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://autolocal.ai/packages"
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-sm font-bold hover:bg-gray-100 transition whitespace-nowrap"
              >
                Get Started for $499
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
      )}

      {/* Template Selector — Floating pill */}
      <div className={`fixed z-50 left-1/2 -translate-x-1/2 ${bannerVisible ? 'top-[60px]' : 'top-3'}`}>
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-gray-200 p-1">
          {TEMPLATE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setActiveTemplate(opt.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTemplate === opt.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add top padding when banner is visible */}
      <div className={bannerVisible ? 'pt-[52px]' : ''}>
        <Template data={data} />
      </div>

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
