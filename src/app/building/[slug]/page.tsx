'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const STEPS = [
  { icon: '📐', label: 'Setting up your layout', duration: 2000 },
  { icon: '🎨', label: 'Applying your brand colors', duration: 2500 },
  { icon: '📸', label: 'Optimizing your photos', duration: 3000 },
  { icon: '✍️', label: 'Writing your content', duration: 2500 },
  { icon: '⚡', label: 'Making it fast', duration: 2000 },
  { icon: '✅', label: 'Your website is ready!', duration: 1500 },
]

export default function BuildingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <BuildingContent />
    </Suspense>
  )
}

function BuildingContent() {
  const { slug } = useParams()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [currentStep, setCurrentStep] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const advance = (step: number) => {
      if (step < STEPS.length - 1) {
        timeout = setTimeout(() => {
          setCurrentStep(step + 1)
          advance(step + 1)
        }, STEPS[step].duration)
      } else {
        // Final step — wait a beat then redirect
        timeout = setTimeout(() => {
          setReady(true)
        }, 1500)
      }
    }

    advance(0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (ready) {
      // Token → go directly to token-based dashboard (no auth needed)
      // No token → fall back to preview page
      if (token) {
        window.location.href = `/my-site/${token}`
      } else {
        window.location.href = `/preview/${slug}`
      }
    }
  }, [ready, slug, token])

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-16">
        <Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AutoLocal.ai</span>
      </Link>

      {/* Website card mockup */}
      <div className="w-full max-w-md mb-12">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-white/[0.05] rounded-lg px-3 py-1.5 text-xs text-gray-500 text-center">
                your-business.com
              </div>
            </div>
          </div>
          {/* Skeleton content */}
          <div className="p-6 space-y-4">
            <div className="h-32 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-white/[0.06] rounded-full w-3/4 animate-pulse" />
              <div className="h-4 bg-white/[0.06] rounded-full w-1/2 animate-pulse" style={{ animationDelay: '150ms' }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-white/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="h-20 bg-white/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '450ms' }} />
              <div className="h-20 bg-white/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
              i < currentStep
                ? 'opacity-40'
                : i === currentStep
                  ? 'bg-white/[0.05] border border-indigo-500/30 scale-[1.02]'
                  : 'opacity-20'
            }`}
          >
            <span className="text-lg">{i < currentStep ? '✓' : step.icon}</span>
            <span className={`text-sm font-medium ${i === currentStep ? 'text-white' : i < currentStep ? 'text-gray-500' : 'text-gray-600'}`}>
              {step.label}
            </span>
            {i === currentStep && (
              <div className="ml-auto w-4 h-4 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mt-8">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
