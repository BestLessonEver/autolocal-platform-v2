'use client'
import Link from 'next/link'
import { PRICING_TIERS } from '@/lib/types'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-95" />
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">AutoLocal.ai</h1>
          <div className="flex gap-4">
            <Link href="/login" className="text-white/80 hover:text-white transition px-4 py-2">Log in</Link>
            <Link href="/onboarding" className="bg-white text-brand-600 font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition">Start Free Trial</Link>
          </div>
        </nav>
        <div className="relative z-10 text-center py-24 px-6 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">Your Marketing Department,<br />In Your Pocket</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">AI-powered social media marketing for local businesses. Upload a photo, get a professional post. It&apos;s that simple.</p>
          <Link href="/onboarding" className="inline-block bg-white text-brand-600 font-bold text-lg px-8 py-4 rounded-full hover:bg-white/90 transition shadow-lg hover:shadow-xl">Start Your 7-Day Free Trial →</Link>
          <p className="text-white/60 mt-4 text-sm">No credit card required</p>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-16 text-gray-900">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: '📝', title: 'Tell Us About Your Business', desc: 'Answer a few questions about your brand, style, and services. Takes 5 minutes.' },
            { icon: '🤖', title: 'AI Creates Your Content', desc: 'Get 2 weeks of posts generated instantly — captions, hashtags, and scheduling included.' },
            { icon: '✅', title: 'Approve & Publish', desc: 'Review posts, make edits if you want, and approve. We handle the rest.' },
          ].map((f, i) => (
            <div key={i} className="text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h4>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">Simple Pricing</h3>
          <p className="text-center text-gray-600 mb-12">Start free for 7 days. Cancel anytime.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.id} className={`rounded-2xl p-8 ${tier.popular ? 'bg-brand-gradient text-white ring-4 ring-brand-300 scale-105' : 'bg-white border border-gray-200'}`}>
                {tier.popular && <div className="text-sm font-bold mb-2 text-white/80">⭐ MOST POPULAR</div>}
                <h4 className="text-2xl font-bold">{tier.name}</h4>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className={tier.popular ? 'text-white/70' : 'text-gray-500'}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className={`block text-center py-3 rounded-full font-semibold transition ${tier.popular ? 'bg-white text-brand-600 hover:bg-white/90' : 'bg-brand-gradient text-white hover:opacity-90'}`}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 AutoLocal.ai — All rights reserved</p>
      </footer>
    </div>
  )
}
