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

const INDUSTRIES = [
  { icon: '💇', label: 'Salons' },
  { icon: '🦷', label: 'Dental' },
  { icon: '🍕', label: 'Restaurants' },
  { icon: '💪', label: 'Fitness' },
  { icon: '🔧', label: 'Contractors' },
  { icon: '🛍️', label: 'Retail' },
  { icon: '🧹', label: 'Cleaning' },
  { icon: '🐾', label: 'Pet Services' },
  { icon: '📸', label: 'Photography' },
  { icon: '🏠', label: 'Real Estate' },
  { icon: '⚖️', label: 'Law Firms' },
  { icon: '🚗', label: 'Auto Shops' },
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

      await new Promise(r => setTimeout(r, 1500))
      router.push(data.previewUrl)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }, 500)
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
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Price badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-8">
            <span className="text-green-400 font-black text-lg">$99</span>
            <span className="text-gray-400 text-sm">Custom website · Delivered in 24 hours</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
            Your Business Deserves a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Website That Wows
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
            Type your business name. See a live custom website — with your real Google reviews, photos, and hours — in 15 seconds.
          </p>

          <p className="text-base text-gray-500 mb-10">
            No credit card. No commitment. Just see it.
          </p>

          {/* The Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
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
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
            >
              <span className="relative z-10">See My Website — Free Preview ✨</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">🛡️ Money-back guarantee</span>
            <span className="flex items-center gap-1.5">⚡ Ready in 15 seconds</span>
            <span className="flex items-center gap-1.5">🌟 Powered by Google</span>
          </div>
        </div>
      </section>

      {/* ── Works for every industry ── */}
      <section className="py-6 px-4 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {INDUSTRIES.map((ind, i) => (
              <span key={i} className="flex items-center gap-1.5 text-gray-500 text-sm">
                <span>{ind.icon}</span>
                <span>{ind.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Price Comparison ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            Stop Overpaying for a Website
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Local agencies charge thousands. DIY builders charge monthly and you still do all the work. We deliver a custom site for $99.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Agency */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center opacity-60">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Local Agency</p>
              <p className="text-4xl font-black text-white mb-2">$3,000<span className="text-lg text-gray-500">+</span></p>
              <p className="text-xs text-gray-600 mb-6">2-8 weeks delivery</p>
              <ul className="text-left space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span>✓</span> Custom design</li>
                <li className="flex items-center gap-2"><span>✓</span> Professional quality</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> Weeks of back-and-forth</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> Extra for revisions</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> Extra for hosting</li>
              </ul>
            </div>

            {/* DIY */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center opacity-60">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Wix / Squarespace</p>
              <p className="text-4xl font-black text-white mb-2">$200<span className="text-lg text-gray-500">/yr</span></p>
              <p className="text-xs text-gray-600 mb-6">You build it yourself</p>
              <ul className="text-left space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span>✓</span> Hosting included</li>
                <li className="flex items-center gap-2"><span>✓</span> Templates available</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> You do all the work</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> Generic templates</li>
                <li className="flex items-center gap-2 text-red-400/60"><span>✗</span> No real customization</li>
              </ul>
            </div>

            {/* AutoLocal */}
            <div className="bg-gradient-to-b from-indigo-600/10 to-purple-600/10 border-2 border-indigo-500/40 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                BEST VALUE
              </div>
              <p className="text-sm text-indigo-400 uppercase tracking-wide mb-2">AutoLocal</p>
              <p className="text-4xl font-black text-white mb-2">$99</p>
              <p className="text-xs text-gray-400 mb-6">Delivered in 24 hours</p>
              <ul className="text-left space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom design — not a template</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> See it before you pay</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited revisions</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Hosting from $9/mo</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16">Three Steps. That&apos;s It.</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: '1',
                title: 'Type Your Business Name',
                desc: 'We find your business on Google and pull your reviews, photos, hours, and contact info automatically.',
                highlight: '15 seconds',
              },
              {
                num: '2',
                title: 'Preview Your Custom Website',
                desc: 'See your business on a professional, mobile-fast website. Switch between 4 unique designs. Share it with anyone.',
                highlight: 'Instant preview',
              },
              {
                num: '3',
                title: 'Love It? It\'s Yours for $99',
                desc: 'We connect your domain, go live, and you\'re done. 3 revision rounds to get it exactly right. Don\'t love it? Don\'t pay.',
                highlight: 'Risk-free',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                <span className="inline-block bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-indigo-400 font-medium">
                  {step.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">Everything Included for $99</h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">What agencies charge $5,000+ for. Delivered in 24 hours, not 6 weeks.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎨', title: 'Custom Design', desc: 'Built around YOUR brand — your colors, photos, and style' },
              { icon: '📱', title: 'Mobile-Perfect', desc: 'Looks incredible on every phone, tablet, and desktop' },
              { icon: '⭐', title: 'Google Reviews', desc: 'Your best reviews displayed automatically — real social proof' },
              { icon: '📞', title: 'Click-to-Call', desc: 'One tap to call or book. On every page.' },
              { icon: '🔍', title: 'SEO Built In', desc: 'Meta tags, schema markup, and speed optimization included' },
              { icon: '✏️', title: 'Unlimited Revisions', desc: 'We keep refining until you\'re 100% happy' },
              { icon: '🎯', title: '4 Design Options', desc: 'Bold, Elegant, Pro, or Dark — pick your favorite' },
              { icon: '🔒', title: 'SSL & Security', desc: 'Secure HTTPS included. Your visitors are protected.' },
              { icon: '🛡️', title: 'Money-Back Guarantee', desc: 'Don\'t love it after revisions? Full refund. Period.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/20 transition">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="mt-12 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Custom Website</p>
                <p className="text-4xl font-black text-white">$99</p>
                <p className="text-gray-500 text-xs">one-time</p>
              </div>
              <div className="text-3xl text-gray-600">+</div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Hosting</p>
                <p className="text-4xl font-black text-white">$9<span className="text-lg text-gray-500">/mo</span></p>
                <p className="text-gray-500 text-xs">cancel anytime</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Want your site to get <strong className="text-white">smarter every month</strong>? 
                Upgrade to the Living Website for <strong className="text-white">$49/mo</strong> — 
                A/B testing, SEO updates, and content refreshes. Hosting included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">What Business Owners Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'I was paying $150/month for a website that looked like 2015. AutoLocal replaced it in a day and it actually brings in calls now.', name: 'Sarah M.', biz: 'Salon Owner, Pearland TX' },
              { quote: 'Three design options, picked my favorite, two small revisions and it was perfect. My patients actually comment on how nice the site looks.', name: 'Dr. Kevin R.', biz: 'Dental Practice, League City TX' },
              { quote: 'Skeptical about 24 hours. They sent me the preview the next morning. My wife made me upgrade to the Living Website on the spot.', name: 'Marcus T.', biz: 'Home Contractor, Friendswood TX' },
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

      {/* ── Guarantee ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-5xl mb-6 block">🛡️</span>
          <h2 className="text-3xl font-black mb-4">Love It or Don&apos;t Pay</h2>
          <p className="text-gray-400 leading-relaxed">
            You get 3 rounds of revisions to get your website exactly right. 
            If after your revisions you&apos;re still not 100% satisfied, we refund every penny. 
            No questions asked. We can offer this because we haven&apos;t had to issue a refund yet.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Questions? We&apos;ve Got Answers.</h2>
          <div className="space-y-4">
            {[
              { q: 'How is this only $99?', a: 'We use AI-powered design tools that let us work 10x faster than a traditional agency. Same quality, fraction of the time and cost.' },
              { q: 'What do I need to provide?', a: 'Just your business name. We pull everything else from Google automatically — reviews, photos, hours, contact info. You can customize anything after.' },
              { q: 'Can I see it before I pay?', a: 'Yes! That\'s the whole point. You get a live preview of your custom website before spending a dime.' },
              { q: 'How does hosting work?', a: 'Hosting is $9/month — cheaper than any website builder. We handle everything: SSL, speed, uptime. Cancel anytime. We also help you connect your domain for free.' },
              { q: 'What if I want changes?', a: '3 rounds of revisions during the build process — colors, layout, photos, text, anything. After launch, you get 2 free changes per month. Need more? $19 each, or upgrade to Living Website ($49/mo) for unlimited changes.' },
              { q: 'I already have a website. Can you replace it?', a: 'Absolutely. We build the new site separately, and once you approve it, we help point your domain to it. Zero downtime.' },
              { q: 'What if I don\'t have a domain?', a: 'No problem. We recommend Namecheap (~$9/year) or we can register one for you. We have a step-by-step guide at autolocal.ai/setup.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition">
                  <span className="font-bold text-white text-sm pr-4">{item.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Your $99 Website Is Waiting
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            15 seconds to see it. 24 hours to own it. Zero risk.
          </p>
          <button
            onClick={scrollToForm}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Build My Website — Free Preview ✨
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AutoLocal.ai
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="mailto:brian@autolocal.ai" className="hover:text-gray-400 transition">brian@autolocal.ai</a>
            <a href="/setup" className="hover:text-gray-400 transition">Domain Setup Guide</a>
            <a href="/offer" className="hover:text-gray-400 transition">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
