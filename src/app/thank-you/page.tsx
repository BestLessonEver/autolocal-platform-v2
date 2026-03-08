/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Image from 'next/image'

function ThankYouContent() {
  const params = useSearchParams()
  const product = params.get('product') || 'website'
  const slug = params.get('slug') || ''
  const businessName = params.get('business') || 'your business'
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const isWebsite = product === 'website' || product === 'living'
  const previewUrl = slug ? `https://autolocal.ai/preview/${slug}` : null

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti animation */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${12 + Math.random() * 16}px`,
                opacity: 0.8,
              }}
            >
              {['🎉', '🎊', '⭐', '✨', '🚀'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Logo */}
      <a href="/" className="flex items-center gap-2 mb-12">
        <Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />
        <span className="text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AutoLocal.ai</span>
      </a>

      <div className="max-w-lg text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
          You&apos;re In!
        </h1>
        <p className="text-xl text-gray-300 mb-2 leading-relaxed">
          Your custom website for <strong className="text-white">{decodeURIComponent(businessName)}</strong> is confirmed.
        </p>
        <p className="text-gray-500 mb-8">Check your email for your dashboard login link.</p>

        {/* Preview Card */}
        {previewUrl && (
          <a href={previewUrl} target="_blank" className="block bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-8 hover:border-indigo-500/30 transition group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shrink-0">
                🌐
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-bold group-hover:text-indigo-400 transition">View Your Website Preview</p>
                <p className="text-gray-500 text-sm">See your site live — customize text, colors, and more</p>
              </div>
              <span className="text-gray-600 group-hover:text-indigo-400 transition text-xl">→</span>
            </div>
          </a>
        )}

        {/* Next Steps */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-white text-sm mb-4">What happens next</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Your custom website is ready!</p>
                <p className="text-gray-500 text-xs">Built with your real Google reviews, photos &amp; hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-indigo-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Check your email for your dashboard link</p>
                <p className="text-gray-500 text-xs">We sent a magic link — one click to log in and edit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-gray-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Love it? Go live — first month free</p>
                <p className="text-gray-500 text-xs">Activate hosting from your dashboard. $0 today, $9/mo after.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition"
          >
            Go to My Dashboard →
          </a>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:text-white hover:border-white/20 transition"
            >
              View My Site
            </a>
          )}
        </div>

        <p className="text-gray-600 text-sm mt-10">
          Questions? Email <a href="mailto:brian@autolocal.ai" className="text-indigo-400 hover:underline">brian@autolocal.ai</a>
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
