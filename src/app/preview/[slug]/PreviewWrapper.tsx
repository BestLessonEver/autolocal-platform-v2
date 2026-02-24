'use client'

import { useState } from 'react'
import { type PreviewData } from '@/components/templates/types'
import ModernCleanTemplate from '@/components/templates/ModernCleanTemplate'
import SalonSpaTemplate from '@/components/templates/SalonSpaTemplate'
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate'

function getTemplate(data: PreviewData) {
  switch (data.category) {
    case 'salon': return <SalonSpaTemplate data={data} />
    case 'dental':
    case 'contractor': return <ProfessionalTemplate data={data} />
    default: return <ModernCleanTemplate data={data} />
  }
}

export default function PreviewWrapper({ data }: { data: PreviewData }) {
  const [bannerVisible, setBannerVisible] = useState(true)

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

      {/* Add top padding when banner is visible */}
      <div className={bannerVisible ? 'pt-[52px]' : ''}>
        {getTemplate(data)}
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
