/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const STEPS = [
  'Finding your business on Google...',
  'Pulling your reviews and photos...',
  'Designing your custom layout...',
  'Adding your hours and contact info...',
  'Polishing the final design...',
]

const BUSINESS_TYPES = [
  'Salon / Spa', 'Dental / Medical', 'Restaurant / Cafe', 'Fitness / Gym',
  'Contractor / Home Services', 'Retail / Boutique', 'Auto / Mechanic', 'Other',
]

export default function HomePage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [contactName, setContactName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<{ placeId: string; name: string; address: string; rating: number | null; reviewCount: number }[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching] = useState(false)

  // Order form
  const [orderForm, setOrderForm] = useState({
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    package: 'starter',
  })
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim()) return
    if (!email.trim()) { setError('Email is required'); return }
    setSearching(true)
    setError('')
    setShowResults(false)

    // Capture lead IMMEDIATELY — fire and forget
    fetch('/api/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        name: contactName.trim() || undefined,
        businessName: businessName.trim(),
        city: city.trim() || undefined,
        source: 'landing_page_search',
      }),
    }).catch(err => console.error("Background request failed:", err))

    try {
      const res = await fetch('/api/search-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.results?.length > 0) {
        setSearchResults(data.results)
        setShowResults(true)
      } else {
        // No results — go straight to intake
        router.push(`/intake/new?name=${encodeURIComponent(businessName.trim())}&city=${encodeURIComponent(city.trim())}`)
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setSearching(false)
  }

  const handleSelectBusiness = async (placeId: string) => {
    setShowResults(false)
    setLoading(true)
    setLoadingStep(0)

    // Update lead stage
    fetch('/api/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        name: contactName.trim() || undefined,
        businessName: businessName.trim(),
        city: city.trim() || undefined,
        source: 'selected_google_business',
      }),
    }).catch(err => console.error("Background request failed:", err))

    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          placeId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.')
        setLoading(false)
        return
      }
      await new Promise(r => setTimeout(r, 1500))
      // Auto-login in background (for future dashboard access), then go straight to preview
      if (data.autoLoginToken) {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        // Fire and forget — don't block navigation
        sb.auth.verifyOtp({ token_hash: data.autoLoginToken, type: 'magiclink' }).catch(() => {})
      }
      // Preview URL already has ?token= for instant access (no auth needed)
      router.push(data.previewUrl)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handleNewBusiness = () => {
    setShowResults(false)
    router.push(`/intake/new?name=${encodeURIComponent(businessName.trim())}&city=${encodeURIComponent(city.trim())}&email=${encodeURIComponent(email.trim())}&contact=${encodeURIComponent(contactName.trim())}`)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutLoading(true)
    try {
      const product = 'website'
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          email: orderForm.email || email,
          businessName: businessName || 'New Client',
          contactName: orderForm.contactName || '',
          phone: orderForm.phone || '',
          businessType: orderForm.businessType || '',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setCheckoutLoading(false)
      }
    } catch {
      alert('Connection error. Please try again.')
      setCheckoutLoading(false)
    }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Loading state
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
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${
                i < loadingStep ? 'opacity-40' : i === loadingStep ? 'opacity-100' : 'opacity-0'
              }`}>
                {i < loadingStep ? (
                  <span className="text-green-400 text-lg">✓</span>
                ) : i === loadingStep ? (
                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="w-4 h-4" />
                )}
                <span className={`text-sm ${i <= loadingStep ? 'text-gray-300' : 'text-gray-600'}`}>{step}</span>
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

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AutoLocal.ai</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-gray-400 hover:text-white transition">Client Login</a>
            <a href="#order" onClick={(e) => { e.preventDefault(); scrollTo('order') }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — $99 is the headline
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.95] mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Free</span>
            {' '}Custom Website
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-300 font-light mb-2">
            Get found on web search and ChatGPT
          </p>
          <p className="text-lg text-gray-500 mb-10">
            See a live preview with your real Google reviews, photos &amp; hours — in 15 seconds. Just pay hosting.
          </p>

          {/* Preview Generator */}
          <form onSubmit={handlePreview} className="max-w-xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Enter your business name..."
                required
                autoFocus
                className="w-full px-6 py-5 rounded-2xl bg-white/[0.07] border border-white/10 text-white text-lg placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition pr-14"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
              />
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Your name"
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email — we'll send your preview link"
              required
              className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={searching}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group disabled:opacity-70"
            >
              <span className="relative z-10">{searching ? 'Searching...' : 'See My Website — Free Preview ✨'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Search Results */}
          {showResults && (
            <div className="max-w-xl mx-auto mt-8 bg-gradient-to-b from-indigo-600/10 to-purple-600/5 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl shadow-indigo-500/10 animate-in">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🏢</span>
                <h3 className="text-xl font-black text-white">Claim Your Business</h3>
              </div>
              <p className="text-sm text-gray-400 text-center mb-5">Select your business to generate a free preview instantly</p>
              <div className="space-y-2">
                {searchResults.map((r) => (
                  <button
                    key={r.placeId}
                    onClick={() => handleSelectBusiness(r.placeId)}
                    className="w-full text-left p-4 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:border-indigo-500/60 hover:bg-indigo-600/15 transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold group-hover:text-indigo-400 transition">{r.name}</p>
                        <p className="text-gray-500 text-sm">{r.address}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {r.rating && (
                          <div className="text-right">
                            <span className="text-yellow-400 font-bold">★ {r.rating}</span>
                            {r.reviewCount > 0 && <p className="text-gray-600 text-xs">{r.reviewCount} reviews</p>}
                          </div>
                        )}
                        <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition text-lg">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={handleNewBusiness}
                  className="w-full p-3.5 rounded-xl border border-dashed border-white/10 text-gray-400 hover:text-white hover:border-indigo-500/30 hover:bg-white/[0.03] transition text-center text-sm font-medium"
                >
                  🆕 I&apos;m a new business / My business isn&apos;t listed →
                </button>
              </div>
            </div>
          )}

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
            <span>🛡️ Money-back guarantee</span>
            <span>⚡ Ready in 15 seconds</span>
            <span>🌟 Powered by Google</span>
            <span>🔒 Secure checkout via Stripe</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICE COMPARISON
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">Stop Overpaying for a Website</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Agencies charge thousands. DIY builders charge monthly and you do all the work. We build it for you.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* AutoLocal — FIRST */}
            <div className="bg-gradient-to-b from-indigo-600/10 to-purple-600/10 border-2 border-indigo-500/40 rounded-2xl p-6 text-center relative md:order-first">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">BEST VALUE</div>
              <p className="text-sm text-indigo-400 uppercase tracking-wide mb-2">AutoLocal</p>
              <p className="text-5xl font-black text-white mb-2">Free</p>
              <p className="text-xs text-gray-400 mb-6">Just $9/mo hosting</p>
              <ul className="text-left space-y-2.5 text-sm text-gray-200">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom design for YOUR brand</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> See it before you pay anything</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 1 revision round included</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Hosting just $9/mo · cancel anytime</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cancel anytime guarantee</li>
              </ul>
              <button
                onClick={() => scrollTo('order')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:brightness-110 transition"
              >
                Get Started Free →
              </button>
            </div>

            {/* Local Agency */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Local Agency</p>
              <p className="text-4xl font-black text-gray-300 mb-2">$3,000<span className="text-lg text-gray-500">+</span></p>
              <p className="text-xs text-gray-500 mb-6">2-8 weeks delivery</p>
              <ul className="text-left space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Custom design</li>
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Professional quality</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> Weeks of waiting</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> Extra for revisions</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> Can&apos;t preview first</li>
              </ul>
            </div>

            {/* Wix / Squarespace */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Wix / Squarespace</p>
              <p className="text-4xl font-black text-gray-300 mb-2">$200<span className="text-lg text-gray-500">/yr</span></p>
              <p className="text-xs text-gray-500 mb-6">You build it yourself</p>
              <ul className="text-left space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Hosting included</li>
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Templates available</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> You do all the work</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> Generic looking</li>
                <li className="flex items-center gap-2"><span className="text-red-400/70">✗</span> No real customization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16">Three Steps. That&apos;s It.</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Type Your Business Name', desc: 'We pull your reviews, photos, hours, and contact info from Google automatically.', tag: '15 seconds' },
              { num: '2', title: 'Preview Your Custom Site', desc: 'See your business on a professional website. Switch between 4 unique designs.', tag: 'Instant preview' },
              { num: '3', title: 'Love It? Go Live.', desc: 'We connect your domain and handle everything. Just $9/mo hosting. Cancel anytime.', tag: 'Zero risk' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-indigo-500/20">{step.num}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                <span className="inline-block bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-indigo-400 font-medium">{step.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHAT YOU GET
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">Everything Included — Free</h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">What agencies charge $5,000+ for. Yours for $0 upfront.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎨', title: 'Custom Design', desc: 'Built around YOUR brand — your colors, photos, and style' },
              { icon: '📱', title: 'Mobile-Perfect', desc: 'Looks incredible on every phone, tablet, and desktop' },
              { icon: '⭐', title: 'Google Reviews', desc: 'Your best reviews displayed automatically' },
              { icon: '📞', title: 'Click-to-Call', desc: 'One tap to call or book. On every page.' },
              { icon: '🔍', title: 'SEO Built In', desc: 'Meta tags, schema markup, and speed optimization' },
              { icon: '✏️', title: '3 Revision Rounds', desc: 'We refine until you love it. 2 free changes/mo after launch.' },
              { icon: '🎯', title: '4 Design Options', desc: 'Bold, Elegant, Pro, or Dark — pick your favorite' },
              { icon: '🔒', title: 'SSL & Security', desc: 'Secure HTTPS included. Visitors are protected.' },
              { icon: '🛡️', title: 'Money-Back Guarantee', desc: 'Not happy after revisions? Full refund. Period.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/20 transition">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5" id="pricing">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-12">Simple Pricing</h2>
          <div className="bg-gradient-to-b from-indigo-600/10 to-purple-600/10 border-2 border-indigo-500/40 rounded-2xl p-8 text-center relative max-w-md mx-auto">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">FREE TO START</div>
            <p className="text-sm text-indigo-400 uppercase tracking-wide mb-2">Custom Website + Hosting</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">$0</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">First month free · Then $9/mo</p>
            <p className="text-xs text-gray-600 mb-8">Cancel anytime · No contracts</p>
            <ul className="space-y-3 mb-8 text-left">
              {[
                'Custom design for your brand',
                'Your real Google reviews & photos',
                '10 unique template styles',
                'SEO + ChatGPT structured data',
                'SSL, mobile-optimized, fast',
                'Dashboard to edit anytime',
                'Domain connection help (free)',
                'First month completely free',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => scrollTo('order')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:brightness-110 transition shadow-lg shadow-indigo-500/25"
            >
              Get My Free Website →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">What Business Owners Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'I was paying $150/month for a site that looked like 2015. AutoLocal replaced it in a day and it actually brings in calls now.', name: 'Sarah M.', biz: 'Salon Owner, Pearland TX' },
              { quote: 'Three design options, picked my favorite, two revisions and it was perfect. My patients comment on how nice the site looks.', name: 'Dr. Kevin R.', biz: 'Dental Practice, League City TX' },
              { quote: 'Skeptical about 24 hours. They sent me the preview the next morning. My wife said "just buy it" on the spot.', name: 'Marcus T.', biz: 'Home Contractor, Friendswood TX' },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
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

      {/* ══════════════════════════════════════════════
          GUARANTEE
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-5xl mb-6 block">🛡️</span>
          <h2 className="text-3xl font-black mb-4">Zero Risk. Cancel Anytime.</h2>
          <p className="text-gray-400 leading-relaxed">
            Your website is built for free. If you love it, hosting is just $9/mo. 
            If you don&apos;t? Cancel anytime — no contracts, no cancellation fees, no questions asked.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ORDER FORM
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5 bg-white/[0.02]" id="order">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Get Your Free Custom Website</h2>
          <p className="text-gray-400 text-center mb-10">$0 to build. Just $9/mo hosting. Cancel anytime.</p>
          
          <form onSubmit={handlePreview} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name *</label>
                <input
                  required
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Joe's Barbershop"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Houston, TX"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                  placeholder="joe@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Joe Smith"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {searching ? 'Searching...' : 'Build My Free Website ✨'}
            </button>

            <div className="text-center space-y-1">
              <p className="text-gray-500 text-sm">🛡️ 100% free. No credit card required.</p>
              <p className="text-gray-600 text-xs">See your custom site in 15 seconds</p>
            </div>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Questions? Answers.</h2>
          <div className="space-y-4">
            {[
              { q: 'How is the website really free?', a: 'We use AI-powered design tools that let us build sites 10x faster than a traditional agency. You only pay $9/mo for hosting — that covers servers, SSL, and support. We make money when you stay, so we\'re incentivized to build you something great.' },
              { q: 'What do I need to provide?', a: 'Just your business name. We pull everything else from Google — reviews, photos, hours, contact info.' },
              { q: 'Can I see it before I pay?', a: 'Yes! Enter your business name above and see a live custom preview in 15 seconds. Totally free.' },
              { q: 'How does hosting work?', a: 'Hosting is $9/month — cheaper than any website builder. SSL, speed, uptime all included. Cancel anytime. We help connect your domain for free.' },
              { q: 'What if I want changes?', a: 'You get a full dashboard to edit your site anytime — text, photos, template, colors. Need a custom change? Just $7.' },
              { q: 'I already have a website.', a: 'We build the new site separately. Once you approve it, we help point your domain to it. Zero downtime.' },
              { q: 'What if I don\'t have a domain?', a: 'We recommend Namecheap (~$9/year). We have a step-by-step guide at autolocal.ai/setup, or we\'ll do it for you free.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition">
                  <span className="font-bold text-white text-sm pr-4">{item.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">Free</p>
          <h2 className="text-3xl font-black mb-4">Your Custom Website Is Waiting</h2>
          <p className="text-gray-400 mb-8 text-lg">15 seconds to see it. $0 to build it. Just $9/mo to keep it live.</p>
          <button
            onClick={() => scrollTo('order')}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get My Free Website
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} AutoLocal.ai</p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="mailto:support@autolocal.ai" className="hover:text-gray-400 transition">support@autolocal.ai</a>
            <a href="/setup" className="hover:text-gray-400 transition">Domain Setup</a>
            <a href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-400 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
