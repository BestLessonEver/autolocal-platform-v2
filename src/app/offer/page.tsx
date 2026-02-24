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
          <p className="text-sm text-gray-400">One-time. Includes 1 year hosting.</p>
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
          <p className="text-sm text-gray-400">Self-improving. A/B testing. SEO. Updates.</p>
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

  // Prepopulate from URL params (from preview page or audit)
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
          <h1 className="text-4xl font-black text-white mb-4">You&apos;re In!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Brian will personally reach out within the next few hours to get started on your new website. 
            Check your email for next steps.
          </p>
          <p className="text-gray-500 text-sm">
            Questions? Email brian@autolocal.ai or call (346) 341-0836
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-6">
            Limited Availability
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            A Website That Actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Brings You Customers
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Most web designers charge $5,000+ and take 6-8 weeks. We build yours in <strong className="text-white">24 hours</strong> for 
            a fraction of the cost. And if you don&apos;t love it, you don&apos;t pay.
          </p>
          <button
            onClick={scrollToOrder}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started — $499 →
          </button>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-4 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">
            Here&apos;s Everything You Get
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { title: 'Custom-Designed Website', desc: 'Built around YOUR brand, not a cookie-cutter template. Mobile-responsive, fast-loading, and designed to convert visitors into customers.', value: '$3,500' },
              { title: 'SEO Foundation', desc: 'Proper meta tags, schema markup, alt text, and page speed optimization so Google can actually find you.', value: '$1,200' },
              { title: 'Professional Copywriting', desc: 'We write every word on your site — headlines, service descriptions, about page, CTAs — all optimized to sell.', value: '$800' },
              { title: 'Google Business Integration', desc: 'Your reviews, hours, and map automatically pulled in. Social proof that builds trust instantly.', value: '$500' },
              { title: 'Contact Forms & Click-to-Call', desc: 'Every page makes it dead simple for customers to reach you. No friction, no confusion.', value: '$400' },
              { title: 'Hosting & Maintenance (1 Year)', desc: 'Fast, secure hosting included for a full year. We handle updates, backups, and security.', value: '$600' },
              { title: '3 Design Options', desc: 'Choose between Bold, Elegant, or Professional — see your business in all three before committing.', value: '$500' },
              { title: '48-Hour Revisions', desc: 'Not 100% happy? Tell us what to change. Unlimited revisions until you love it.', value: 'Priceless' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-indigo-500/50 transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className="text-indigo-400 font-bold text-sm whitespace-nowrap ml-4 line-through opacity-60">{item.value}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Value Stack */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm mb-2">Total Value</p>
            <p className="text-4xl font-black text-white mb-1 line-through opacity-50">$7,500+</p>
            <p className="text-gray-400 text-sm mb-4">Today&apos;s Price</p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">$499</p>
            <p className="text-gray-500 text-sm mb-6">One-time payment. No hidden fees. No contracts.</p>
            <button
              onClick={scrollToOrder}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </section>

      {/* Upgrade Option */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-black text-white">Upgrade: The Living Website</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl">
              Your website shouldn&apos;t be something you set and forget. With our Living Website upgrade, 
              your site <strong className="text-white">gets smarter every month</strong> — automatically testing headlines, 
              images, and layouts to find what converts best. Plus ongoing SEO optimization and fresh content.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Automatic A/B testing — your site improves itself',
                'Monthly SEO optimization based on real search data',
                'Fresh content updates to keep Google happy',
                'Performance monitoring & speed optimization',
                'Priority support — changes made within 24 hours',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">+$99/mo</span>
              <span className="text-gray-500">after your site launches</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-3xl font-black mb-4">The &quot;Love It or Leave It&quot; Guarantee</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-4">
            We&apos;ll keep revising until your website is <strong className="text-white">exactly</strong> what you want. 
            If after all revisions you&apos;re still not 100% satisfied, we&apos;ll refund every penny. 
            No questions asked. No hard feelings.
          </p>
          <p className="text-gray-500">
            We can do this because we&apos;re that confident in our work. And because happy clients 
            become long-term clients.
          </p>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 px-4 bg-white/[0.02]" id="order">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Let&apos;s Build Your Website</h2>
          <p className="text-gray-400 text-center mb-10">Fill this out and we&apos;ll have a preview ready within 24 hours</p>
          
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">What do you want on your new site? *</label>
              <textarea
                required
                rows={4}
                value={formData.changes}
                onChange={e => setFormData(f => ({ ...f, changes: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
                placeholder="Tell us about your business, what services you offer, any specific features you want (online booking, photo gallery, etc.), and anything else we should know..."
              />
            </div>

            <PackageSelector selected={formData.package} onChange={v => setFormData(f => ({ ...f, package: v }))} />

            <button
              type="submit"
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Build My Website →
            </button>

            <p className="text-center text-gray-500 text-sm">
              🛡️ 100% satisfaction guaranteed. Unlimited revisions until you love it.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
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
