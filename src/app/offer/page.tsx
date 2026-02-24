/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PackageSelector({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-4">Choose Your Package</label>
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('starter')}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            selected === 'starter'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 hover:border-white/30'
          }`}
        >
          <p className="font-bold text-white text-lg mb-1">Custom Website</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">$499</p>
          <p className="text-sm text-gray-400">One-time. Yours forever. 1 year hosting included.</p>
        </button>
        <button
          type="button"
          onClick={() => onChange('living')}
          className={`p-5 rounded-xl border-2 text-left transition-all relative ${
            selected === 'living'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-white/10 hover:border-white/30'
          }`}
        >
          <span className="absolute -top-3 right-4 bg-amber-500 text-black text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</span>
          <p className="font-bold text-white text-lg mb-1">Living Website 🚀</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">$499 + $99/mo</p>
          <p className="text-sm text-gray-400">Gets smarter every month. A/B testing. SEO. Updates.</p>
        </button>
      </div>
    </div>
  )
}

function OfferContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    currentWebsite: '',
    changes: '',
    package: 'starter',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const biz = searchParams.get('business') || searchParams.get('b') || ''
    const name = searchParams.get('name') || searchParams.get('n') || ''
    const email = searchParams.get('email') || searchParams.get('e') || ''
    const phone = searchParams.get('phone') || searchParams.get('p') || ''
    const website = searchParams.get('website') || searchParams.get('w') || ''
    setFormData(f => ({
      ...f,
      businessName: biz || f.businessName,
      contactName: name || f.contactName,
      email: email || f.email,
      phone: phone || f.phone,
      currentWebsite: website || f.currentWebsite,
    }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          website: formData.currentWebsite,
          city: '',
          state: '',
          email: formData.email,
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
  }

  const scrollToOrder = () => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4">You&apos;re In.</h1>
          <p className="text-xl text-gray-300 mb-4">
            I&apos;ll personally reach out within the next few hours.
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Check your email — you&apos;ll see a preview of your new site before you even have to think about it.
          </p>
          <p className="text-gray-500 text-sm">
            brian@autolocal.ai · (346) 341-0836
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-8">
            Limited Availability
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-8">
            Your website is losing you customers.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Let&apos;s fix that.
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Here&apos;s the thing nobody tells you. That website you paid $3,000 for three years ago? 
            It&apos;s slow. It&apos;s not mobile-friendly. And Google buried it on page 4. 
            Meanwhile your competitor with the worse haircuts is ranking above you because 
            their site actually works.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            We build you a new one in <strong className="text-white">24 hours</strong>. 
            You pick from three custom designs. We handle everything. 
            And if you don&apos;t love it — you don&apos;t pay.
          </p>
          <button
            onClick={scrollToOrder}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get My New Website — $499
          </button>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 px-4 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
          <div>
            <p className="text-2xl font-black text-white">24hr</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Turnaround</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">3</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Design Options</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Money-Back Guarantee</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">$0</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hidden Fees</p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center">
            The math doesn&apos;t lie.
          </h2>
          <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
            <p>
              <strong className="text-white">75% of people</strong> judge your business by your website. Not your reviews. Not your years of experience. Your website.
            </p>
            <p>
              If it takes more than 3 seconds to load? <strong className="text-white">53% leave.</strong> Gone. They&apos;re at your competitor&apos;s site now — the one that loads in under a second.
            </p>
            <p>
              And here&apos;s the part that should make you uncomfortable: <strong className="text-white">your website is probably the first AND last impression</strong> most potential customers ever get of your business.
            </p>
            <p className="text-white text-xl font-bold">
              So. Is yours doing its job?
            </p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-4 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">
            Here&apos;s what $499 gets you.
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            (Spoiler: it&apos;s more than most agencies deliver for $5,000)
          </p>
          
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {[
              { title: 'Custom Design — Not a Template', desc: 'Built around YOUR brand. Your colors. Your photos. Your vibe. Mobile-first. Lightning fast.', value: '$3,500' },
              { title: 'SEO That Actually Works', desc: 'Meta tags, schema markup, alt text, page speed — the stuff that gets Google to notice you exist.', value: '$1,200' },
              { title: 'Words That Sell', desc: 'We write every headline, every service description, every CTA. Optimized to turn visitors into phone calls.', value: '$800' },
              { title: 'Google Reviews on Your Site', desc: 'Your best reviews, pulled in automatically. Social proof that does the selling for you.', value: '$500' },
              { title: 'Click-to-Call on Every Page', desc: 'One tap to call. One tap to book. Zero friction between "I need this" and "take my money."', value: '$400' },
              { title: '1 Year Hosting — On Us', desc: 'Fast, secure hosting included. We handle updates, backups, SSL, and the stuff you shouldn&apos;t have to think about.', value: '$600' },
              { title: '3 Designs to Choose From', desc: 'Bold. Elegant. Professional. See your business in all three. Pick your favorite. Or mix and match.', value: '$500' },
              { title: 'Unlimited Revisions', desc: 'Not a fan of the headline? Change it. Want the buttons bigger? Done. We don&apos;t stop until you love it.', value: 'Priceless' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <span className="text-indigo-400/60 font-bold text-sm whitespace-nowrap ml-4 line-through">{item.value}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Value Stack */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-1">Total Value</p>
            <p className="text-3xl font-black text-white mb-2 line-through opacity-40">$7,500+</p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">$499</p>
            <p className="text-gray-500 text-sm mb-6">One-time. No contracts. No surprises.</p>
            <button
              onClick={scrollToOrder}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              I Want This →
            </button>
          </div>
        </div>
      </section>

      {/* The Living Website */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-black text-white">Want it to get better every month?</h2>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed max-w-2xl text-lg">
              Most websites are frozen in time. Built once. Forgotten. Slowly dying.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed max-w-2xl">
              The Living Website is different. It watches what your visitors do and 
              <strong className="text-white"> optimizes itself</strong>. Better headlines. 
              Better images. Better conversion rates. Every single month. Without you lifting a finger.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Automatic A/B testing — headlines, images, layouts',
                'Monthly SEO updates based on real search data',
                'Fresh content that keeps Google coming back',
                'Speed monitoring — because slow sites lose customers',
                'Priority changes — anything you need, done in 24 hours',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-white">+$99/mo</span>
              <span className="text-gray-500">after your site launches</span>
            </div>
            <p className="text-gray-600 text-sm">Cancel anytime. The $499 site is yours either way.</p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-3xl font-black mb-6">Here&apos;s the deal.</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-4">
            We revise until you&apos;re happy. Not &quot;yeah it&apos;s fine&quot; happy. 
            <strong className="text-white"> &quot;Holy crap this is my website?&quot;</strong> happy.
          </p>
          <p className="text-xl text-gray-400 leading-relaxed mb-4">
            If we can&apos;t get there? Full refund. Every penny. We eat the cost.
          </p>
          <p className="text-gray-600">
            We can make this guarantee because we haven&apos;t had to use it yet.
          </p>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 px-4 bg-white/[0.02]" id="order">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Let&apos;s build it.</h2>
          <p className="text-gray-500 text-center mb-10">Preview in your inbox within 24 hours.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name *</label>
                <input
                  required
                  type="text"
                  value={formData.businessName}
                  onChange={e => setFormData(f => ({ ...f, businessName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  placeholder="Joe's Barbershop"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name *</label>
                <input
                  required
                  type="text"
                  value={formData.contactName}
                  onChange={e => setFormData(f => ({ ...f, contactName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  placeholder="Joe Smith"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  placeholder="joe@joesbarbershop.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Current Website (if any)</label>
              <input
                type="text"
                value={formData.currentWebsite}
                onChange={e => setFormData(f => ({ ...f, currentWebsite: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                placeholder="www.joesbarbershop.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">What do you want on your new site?</label>
              <textarea
                rows={4}
                value={formData.changes}
                onChange={e => setFormData(f => ({ ...f, changes: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
                placeholder="Online booking, photo gallery, specific pages... or just tell us about your business and we'll figure out the rest."
              />
            </div>

            <PackageSelector selected={formData.package} onChange={v => setFormData(f => ({ ...f, package: v }))} />

            <button
              type="submit"
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Build My Website →
            </button>

            <p className="text-center text-gray-600 text-sm">
              🛡️ Love it or get a full refund. Unlimited revisions until it&apos;s perfect.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} AutoLocal.ai · brian@autolocal.ai · (346) 341-0836
        </p>
      </footer>
    </div>
  )
}

export default function OfferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <OfferContent />
    </Suspense>
  )
}
