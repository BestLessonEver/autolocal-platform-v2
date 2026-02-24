/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { type PreviewData, getCtaButtonText } from './types'

interface Props {
  data: PreviewData
}

export default function StickyContactBar({ data }: Props) {
  const hasPhone = !!data.phone
  const bookingUrl = data.cta_url && !data.cta_url.startsWith('tel:') ? data.cta_url : null
  const ctaText = getCtaButtonText(data)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:hidden">
      <div className="flex gap-2 p-3 max-w-lg mx-auto">
        {hasPhone && (
          <a
            href={`tel:${data.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: data.brand_color_primary,
              color: '#fff',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call Now
          </a>
        )}
        {bookingUrl ? (
          <a
            href={bookingUrl}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: data.brand_color_accent || data.brand_color_primary,
              color: '#fff',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Book Now
          </a>
        ) : hasPhone ? null : (
          <a
            href="#contact"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: data.brand_color_accent || data.brand_color_primary,
              color: '#fff',
            }}
          >
            Contact Us
          </a>
        )}
      </div>
    </div>
  )
}
