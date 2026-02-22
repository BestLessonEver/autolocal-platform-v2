'use client'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const PACKAGES = [
  {
    id: 'social_revive',
    name: 'Social Media Revive',
    price: 499,
    tagline: 'We take over your social media for 30 days',
    features: ['AI-generated posts in your brand voice', '5x/week posting across your platforms', 'Platform & profile optimization', 'Hashtag strategy', 'Engagement monitoring', '30-day content calendar'],
  },
  {
    id: 'digital_cleanup',
    name: 'Full Digital Cleanup',
    price: 999,
    tagline: 'Social media + reviews + website fixes',
    popular: true,
    features: ['Everything in Social Revive', 'Google review response strategy', 'Website speed optimization', 'Mobile experience fixes', 'SEO basics & meta tags', 'Local listing cleanup (Google, Yelp, etc.)'],
  },
  {
    id: 'growth_engine',
    name: 'Growth Engine',
    price: 1999,
    tagline: 'The full transformation',
    features: ['Everything in Digital Cleanup', 'Competitor monitoring dashboard', 'Monthly performance reporting', 'Full content calendar & strategy', 'Ongoing optimization', 'Converts to $199/mo after first month'],
  },
  {
    id: 'new_website',
    name: 'New Website + SEO',
    price: 3499,
    tagline: 'Modern website built to convert',
    features: ['Custom designed, mobile-first', 'SEO-optimized & lightning fast', 'Google Business integration', 'Contact forms & booking', 'SSL & analytics included', 'Delivered in 3-5 days'],
  },
]

const FAQS = [
  { q: 'How fast do you deliver?', a: 'Most fixes within 24 hours. Social content starts immediately. Website builds take 3-5 days. Traditional agencies quote 2-4 weeks — we move in hours.' },
  { q: 'Do I need to give you my passwords?', a: 'No. We use secure platform connections (like Buffer) to manage your social accounts. You stay in control and can revoke access anytime.' },
  { q: 'What if I\'m not happy?', a: 'Full refund within 7 days, no questions asked. We\'re confident you\'ll love the results, but we want you to feel zero risk.' },
  { q: 'Do you lock me into a contract?', a: 'No contracts. Ever. Each package is a flat one-time fee. The Growth Engine converts to an optional $199/mo after the first month — cancel anytime.' },
  { q: 'How do you create content for my specific business?', a: 'We deeply research your business, competitors, reviews, and market before creating a single post. Every piece of content is specific to YOUR business, not generic templates.' },
  { q: 'Can I approve posts before they go live?', a: 'Absolutely. We send you content for approval before anything is published. You have final say on everything.' },
]

export default function PackagesPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text">
          <Image src="/logo.png" alt="AutoLocal.ai" width={36} height={36} className="rounded-lg" />
          AutoLocal.ai
        </Link>
        <Link href="/#audit-form" className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold text-white">Get Your Free Audit</Link>
      </nav>

      {/* Hero */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Choose Your Fix</h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto">Flat rates. No contracts. No BS. Most fixes delivered in 24 hours.</p>
        <p className="text-cyan-400 font-semibold mt-2">Traditional agencies quote 2-4 weeks. We deliver tomorrow.</p>
      </section>

      {/* Packages */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map(pkg => (
            <div key={pkg.id} className={`gradient-card rounded-2xl p-6 transition-all duration-300 ${pkg.popular ? 'scale-105 glow-cyan ring-1 ring-cyan-500/30' : ''}`}>
              {pkg.popular && (
                <div className="text-xs font-bold text-cyan-400 mb-3">⭐ MOST POPULAR</div>
              )}
              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{pkg.tagline}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold gradient-text">${pkg.price.toLocaleString()}</span>
                <span className="text-slate-500 text-sm ml-1">one-time</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/client/demo?package=${pkg.id}`} className={`block text-center py-3 rounded-xl font-semibold transition ${pkg.popular ? 'btn-gradient text-white' : 'border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white'}`}>
                Get Started — ${pkg.price.toLocaleString()}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <h3 className="text-white font-semibold">{faq.q}</h3>
              <p className="text-slate-400 text-sm mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-16 px-4 border-t border-slate-800">
        <p className="text-slate-400 mb-4">Not sure which package? Get your free audit first.</p>
        <Link href="/#audit-form" className="btn-gradient px-8 py-3.5 rounded-xl font-semibold text-white text-lg inline-block">Get Your Free Audit →</Link>
      </section>
    </div>
  )
}
