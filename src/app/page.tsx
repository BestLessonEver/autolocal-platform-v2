/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  'Finding your business on Google...',
  'Pulling your reviews and photos...',
  'Designing your custom layout...',
  'Adding your hours and contact info...',
  'Polishing the final design...',
]

export default function HomePage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim()) return
    setLoading(true)
    setError('')
    setLoadingStep(0)

    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim() || undefined,
          email: email.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.')
        setLoading(false)
        return
      }

      // Small delay so the last step feels complete
      await new Promise(r => setTimeout(r, 1500))
      router.push(data.previewUrl)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  // Loading state — full screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-white mb-6">Building Your Website</h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  i < loadingStep ? 'opacity-40' : i === loadingStep ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {i < loadingStep ? (
                  <span className="text-green-400 text-lg">✓</span>
                ) : i === loadingStep ? (
                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="w-4 h-4" />
                )}
                <span className={`text-sm ${i <= loadingStep ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-8">This usually takes about 15 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 via-transparent to-purple-600/5" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Free • No credit card • Ready in 15 seconds</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
            See Your Business on a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Beautiful Website
            </span>
            <br />
            Right Now
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Enter your business name. We&apos;ll build you a custom website preview in 15 seconds — 
            with your real Google reviews, photos, and hours.
          </p>

          {/* The Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Your business name"
                required
                autoFocus
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="City (optional)"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Build My Website — Free Preview ✨
            </button>

            <p className="text-gray-600 text-xs text-center">
              No credit card. No commitment. Just see what your business looks like.
            </p>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Enter Your Business Name', desc: 'That\'s literally it. We find everything else from Google.' },
              { num: '2', title: 'See Your Custom Website', desc: 'In 15 seconds, your business is live on a professional site with your real reviews, photos, and hours.' },
              { num: '3', title: 'Love It? It\'s Yours for $99', desc: 'Unlimited revisions until it\'s perfect. Don\'t love it? Don\'t pay. Simple.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-black mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">What You Get for $99</h2>
          <p className="text-gray-500 mb-12">What agencies charge $5,000+ for. Delivered in 24 hours.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              'Custom design built for YOUR brand',
              '3 styles to choose from',
              'Your real Google reviews displayed',
              'Mobile-fast and SEO optimized',
              'Click-to-call and contact forms',
              'Unlimited revisions until perfect',
              '1 year hosting + SSL included',
              'Money-back guarantee',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Built for Local Businesses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'I was paying $150/month for a website that looked like it was built in 2015. This replaced it in a day.', name: 'Sarah M.', biz: 'Salon Owner' },
              { quote: 'Three design options, picked my favorite, two revisions and it was perfect. My patients actually comment on it.', name: 'Dr. Kevin R.', biz: 'Dental Practice' },
              { quote: 'I was skeptical about the 24-hour thing. They sent me the preview the next morning. Wife made me upgrade on the spot.', name: 'Marcus T.', biz: 'Home Contractor' },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-gray-600 text-xs">{t.biz}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Ready to See Your New Website?</h2>
          <p className="text-gray-500 mb-8">Takes 15 seconds. Completely free.</p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setTimeout(() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement
                input?.focus()
              }, 500)
            }}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Build My Website — Free ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} AutoLocal.ai · brian@autolocal.ai · (281) 393-7551
        </p>
      </footer>
    </div>
  )
}
