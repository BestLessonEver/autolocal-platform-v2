/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ThankYouContent() {
  const params = useSearchParams()
  const product = params.get('product') || 'website'
  const slug = params.get('slug') || ''

  const isWebsite = product === 'website'
  const isHosting = product === 'hosting' || product === 'living'

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-4xl font-black text-white mb-4">
          {isWebsite ? 'Welcome to AutoLocal!' : 'You\'re All Set!'}
        </h1>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          {isWebsite
            ? 'Your payment is confirmed. We\'re already working on your custom website — you\'ll hear from us within 24 hours with your finished site.'
            : isHosting
              ? 'Your subscription is active. Your website is live and we\'re taking care of everything.'
              : 'Payment confirmed. We\'ll process your request right away.'}
        </p>

        {isWebsite && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left space-y-3">
            <h3 className="font-bold text-white text-sm">What happens next:</h3>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <p className="text-gray-400 text-sm">We finalize your custom website design</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-600 mt-0.5">○</span>
              <p className="text-gray-400 text-sm">You&apos;ll get an email with your dashboard link to review, customize colors, and upload your logo</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-600 mt-0.5">○</span>
              <p className="text-gray-400 text-sm">Request any changes — 3 revision rounds to get it exactly right</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-600 mt-0.5">○</span>
              <p className="text-gray-400 text-sm">We help you connect your domain and go live</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {slug && (
            <a
              href={`/preview/${slug}`}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition"
            >
              View Your Preview
            </a>
          )}
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:text-white hover:border-white/20 transition"
          >
            Back to Home
          </a>
        </div>

        <p className="text-gray-600 text-sm mt-10">
          Questions? Email <a href="mailto:support@autolocal.ai" className="text-indigo-400 hover:underline">support@autolocal.ai</a>
        </p>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <ThankYouContent />
    </Suspense>
  )
}
