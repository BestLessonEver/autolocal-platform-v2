'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, CheckCircle2 } from 'lucide-react'

const AUDIT_AREAS = [
  { emoji: '🌐', title: 'Website Analysis', desc: 'Load speed, mobile experience, SSL, SEO basics, broken pages. We find every issue costing you customers.' },
  { emoji: '⭐', title: 'Google Reviews', desc: 'Review count, rating, response rate vs. your competitors. We show you exactly how many customers you\'re losing.' },
  { emoji: '📱', title: 'Social Media', desc: 'Posting frequency, engagement, platform presence. We identify what\'s dead and what\'s working.' },
  { emoji: '🏆', title: 'Competitor Intel', desc: 'We scan your top 5 local competitors and show you where they\'re beating you — and where you can win.' },
]

const STEPS = [
  { num: '01', title: 'Tell us your business name', desc: 'That\'s it. We handle the rest.' },
  { num: '02', title: 'We scan everything', desc: 'Website, Google, social media, competitors within 5 miles. Takes 24 hours.' },
  { num: '03', title: 'Get your report card', desc: 'A brutally specific audit with your score, competitor comparison, and revenue impact estimate.' },
  { num: '04', title: 'We fix it', desc: 'Pick a package. We handle everything — website rebuilds, review management, social media, SEO. Flat rate, no contracts.' },
]

const PACKAGES = [
  {
    name: 'Social Media Revive',
    price: 499,
    tagline: 'We take over your social media for 30 days',
    features: ['AI-generated posts', '5x/week posting', 'Platform optimization', 'Hashtag strategy', 'Engagement monitoring'],
  },
  {
    name: 'Full Digital Cleanup',
    price: 999,
    tagline: 'Social media + reviews + website fixes',
    popular: true,
    features: ['Everything in Social Revive', 'Google review response strategy', 'Website speed optimization', 'Mobile fixes & SEO basics', 'Local listing cleanup'],
  },
  {
    name: 'Growth Engine',
    price: 1999,
    tagline: 'The full transformation',
    features: ['Everything in Digital Cleanup', 'Competitor monitoring', 'Monthly reporting', 'Content calendar', 'Ongoing optimization', 'Converts to $199/mo after first month'],
  },
  {
    name: 'New Website + SEO',
    price: 3499,
    tagline: 'Modern website built to convert',
    features: ['Custom designed, mobile-first', 'SEO-optimized & fast-loading', 'Google Business integration', 'Contact forms', 'Booking integration'],
  },
]

const REPORT_FINDINGS = [
  '❌ Website loads in 6.2s (should be under 3s)',
  '❌ No Google review responses in 90+ days',
  '❌ Last social media post was 47 days ago',
  '⚠️ 2 competitors rank higher for your top keyword',
]

const CITIES = ['Houston', 'Friendswood', 'Clear Lake', 'Savannah', 'Chattanooga', 'Tulsa', 'League City', 'Pearland', 'Webster', 'Austin', 'San Antonio', 'Nashville']

export default function Home() {
  const [form, setForm] = useState({ businessName: '', website: '', cityState: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const [city, state] = form.cityState.split(',').map(s => s.trim())
      const res = await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: form.businessName, website: form.website, city, state: state || '', email: form.email }),
      })
      if (res.ok) setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Image src="/logo.png" alt="AutoLocal.ai" width={36} height={36} className="rounded-lg" />
            AutoLocal.ai
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition text-sm">How It Works</a>
            <a href="#services" className="text-slate-400 hover:text-white transition text-sm">Services</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#audit-form" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white">Get Your Free Audit</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl orb" />
        <div className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-indigo-500/8 blur-3xl orb" style={{ animationDelay: '-7s' }} />
        <div className="absolute bottom-10 left-[40%] w-64 h-64 rounded-full bg-purple-500/8 blur-3xl orb" style={{ animationDelay: '-14s' }} />

        <div className="relative z-10 text-center pt-20 pb-32 px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm text-cyan-300">
            <Zap className="w-4 h-4" /> AI-Powered Marketing Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
            <span className="text-white">We </span>
            <span className="gradient-text">find what&apos;s broken</span>
            <br />
            <span className="text-white">in your marketing — and fix it.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Free audit of your website, Google reviews, social media, and competitors. Specific numbers. Actionable fixes. No fluff.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a href="#audit-form" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white">
              Get Your Free Audit →
            </a>
            <Link href="/audit/demo" className="border border-slate-600 hover:border-cyan-500/50 px-8 py-4 rounded-xl text-lg font-semibold text-slate-300 hover:text-white transition">
              See a sample report →
            </Link>
          </div>
          <p className="text-slate-500 text-sm">✓ Free · ✓ No credit card · ✓ Results in 24 hours</p>
        </div>
      </section>

      <div className="section-divider" />

      {/* What We Audit */}
      <section id="services" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We Audit</h2>
          <p className="text-slate-400 text-lg">A complete scan of your digital presence — no stone unturned</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {AUDIT_AREAS.map((a, i) => (
            <div key={i} className="gradient-card glass-hover rounded-2xl p-7 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-4xl mb-4">{a.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{a.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">From audit to action in four simple steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30" />
          {STEPS.map((s, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-8 text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-6 glow-cyan relative z-10">
                {s.num}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Report Preview */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See What You&apos;ll Get</h2>
          <p className="text-slate-400 text-lg">A brutally honest look at your marketing — with real numbers</p>
        </div>
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-amber-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
            <span className="text-xs text-slate-500 ml-2">autolocal.ai/audit/sample</span>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm text-slate-400 mb-1">Overall Score</div>
            <div className="text-5xl font-bold text-amber-400">34<span className="text-2xl text-slate-500">/100</span></div>
          </div>

          <div className="space-y-4 mb-8">
            {[
              { label: 'Website', score: 45, color: 'bg-amber-400' },
              { label: 'Google Reviews', score: 28, color: 'bg-red-400' },
              { label: 'Social Media', score: 15, color: 'bg-red-400' },
              { label: 'vs. Competitors', score: 52, color: 'bg-amber-400' },
            ].map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{c.label}</span>
                  <span className="text-slate-400">{c.score}/100</span>
                </div>
                <div className="h-2 bg-navy-900/50 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-lg font-semibold text-amber-400 text-center mb-4">
              You&apos;re losing an estimated $2,400/month in potential revenue
            </p>
            <ul className="space-y-2">
              {REPORT_FINDINGS.map((f, i) => (
                <li key={i} className="text-sm text-slate-300">{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-slate-400 mb-4">This is a real audit. Yours will be even more specific.</p>
          <a href="#audit-form" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white inline-block">
            Get Your Free Audit →
          </a>
        </div>
      </section>

      <div className="section-divider" />

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Fix-It Packages</h2>
          <p className="text-slate-400 text-lg">Flat rate. No contracts. We handle everything.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <div key={pkg.name} className={`gradient-card rounded-2xl p-7 transition-all duration-300 ${pkg.popular ? 'scale-105 glow-cyan ring-1 ring-cyan-500/30' : ''}`}>
              {pkg.popular && <div className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">⭐ Most Popular</div>}
              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
              <div className="mt-3 mb-4">
                <span className="text-4xl font-bold text-white">${pkg.price.toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">{pkg.tagline}</p>
              <ul className="space-y-2 mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <a href="#audit-form" className={`block text-center py-3 rounded-xl font-semibold transition ${pkg.popular ? 'btn-gradient text-white' : 'border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white'}`}>
                Get Your Free Audit
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 mt-8">Not sure what you need? Get your free audit first — we&apos;ll recommend the right package.</p>
      </section>

      <div className="section-divider" />

      {/* Social Proof */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <p className="text-slate-400 text-lg mb-6">Trusted by local businesses across 25+ cities</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {CITIES.map(c => (
            <span key={c} className="text-slate-600 text-sm">{c}</span>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Audit Form */}
      <section id="audit-form" className="py-24 px-6 max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Get Your Free Marketing Audit</h2>
          <p className="text-slate-400 text-center mb-8">We&apos;ll email your full report within 24 hours</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">We&apos;re on it!</h3>
              <p className="text-slate-400">Check your inbox within 24 hours for your full marketing audit.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Business name *"
                  required
                  value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                  className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
              <div>
                <input
                  type="url"
                  placeholder="Website URL (optional)"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City, State *"
                  required
                  value={form.cityState}
                  onChange={e => setForm(f => ({ ...f, cityState: e.target.value }))}
                  className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your email *"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gradient py-4 rounded-xl text-lg font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Run My Free Audit →'}
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="section-divider" />

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 max-w-3xl mx-auto">
          Every day without a marketing audit is a day you&apos;re losing customers to competitors who showed up.
        </h2>
        <a href="#audit-form" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white inline-block mt-6">
          Get Your Free Audit →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold gradient-text">
              <Image src="/logo.png" alt="AutoLocal.ai" width={28} height={28} className="rounded-md" />
              AutoLocal.ai
            </Link>
            <p className="text-sm text-slate-500 mt-3">AI-powered marketing audits and done-for-you fixes for local businesses.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#services" className="hover:text-slate-300 transition">Website Audit</a></li>
              <li><a href="#services" className="hover:text-slate-300 transition">Review Management</a></li>
              <li><a href="#services" className="hover:text-slate-300 transition">Social Media</a></li>
              <li><a href="#services" className="hover:text-slate-300 transition">SEO</a></li>
              <li><a href="#pricing" className="hover:text-slate-300 transition">New Websites</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-slate-300 transition">About</Link></li>
              <li><Link href="/blog" className="hover:text-slate-300 transition">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-slate-300 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Service Areas</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/houston-tx" className="hover:text-slate-300 transition">Houston TX</Link></li>
              <li><Link href="/friendswood-tx" className="hover:text-slate-300 transition">Friendswood TX</Link></li>
              <li><Link href="/clear-lake-tx" className="hover:text-slate-300 transition">Clear Lake TX</Link></li>
              <li><Link href="/savannah-ga" className="hover:text-slate-300 transition">Savannah GA</Link></li>
              <li><Link href="/chattanooga-tn" className="hover:text-slate-300 transition">Chattanooga TN</Link></li>
              <li><Link href="/houston-tx" className="text-cyan-400 hover:text-cyan-300 transition">All Areas →</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-300 transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800/50 text-center text-sm text-slate-600">
          © 2026 AutoLocal.ai — All rights reserved
        </div>
      </footer>
    </div>
  )
}
