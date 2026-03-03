'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const BUSINESS_TYPES = [
  'Salon / Spa', 'Dental / Medical', 'Restaurant / Cafe', 'Fitness / Gym',
  'Contractor / Home Services', 'Retail / Boutique', 'Professional Services', 'Other',
]

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
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">$99</p>
          <p className="text-sm text-gray-400">One-time. Yours forever. Hosting just $9/mo.</p>
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
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">$99 + $49/mo</p>
          <p className="text-sm text-gray-400">Gets smarter every month. A/B testing. SEO. Updates. Hosting included.</p>
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
    businessType: '',
    changes: '',
    package: 'starter',
  })
  const [submitted] = useState(false)
  const [spotsLeft] = useState(() => {
    // Consistent per-month: derive from current month so it doesn't change on refresh
    const now = new Date()
    const seed = now.getFullYear() * 12 + now.getMonth()
    return 3 + (seed % 3) // 3, 4, or 5
  })

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

  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutLoading(true)
    try {
      // Also save the audit request for our records
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
      }).catch(() => {}) // Don't block on this

      // Create Stripe checkout
      const product = formData.package === 'living' ? 'living' : 'website'
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          email: formData.email,
          businessName: formData.businessName,
          contactName: formData.contactName,
          phone: formData.phone,
          businessType: formData.businessType,
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
            Only {spotsLeft} spots left this month
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            A Website That Actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Brings You Customers
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            We build you a custom, mobile-fast website in <strong className="text-white">24 hours</strong> for 
            a fraction of what agencies charge.
          </p>
          {/* Risk reversal right at the top */}
          <p className="text-base text-gray-300 max-w-xl mx-auto mb-10">
            🛡️ <strong className="text-white">Love it or don&apos;t pay.</strong> 3 rounds of revisions to get it exactly right — love it or get a full refund.
          </p>
          <button
            onClick={scrollToOrder}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get My Custom Website — $99
          </button>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 px-4 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
          <div>
            <p className="text-2xl font-black text-white">24hr</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">3</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Custom Designs</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Money-Back</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">$0</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hidden Fees</p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">
            What other agencies charge $5,000+ for
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            We deliver the same quality — faster, and at a price that actually makes sense for a local business.
          </p>
          
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {[
              { title: 'Custom Design — Not a Template', desc: 'Built around YOUR brand. Your colors, your photos, your style. Mobile-responsive and designed to convert visitors into calls.', value: '$2,500' },
              { title: 'SEO Foundation', desc: 'Meta tags, page speed optimization, schema markup, and mobile performance — so Google actually surfaces your business.', value: '$750' },
              { title: 'Professional Copywriting', desc: 'We write every headline, service description, and call-to-action on your site — optimized to turn visitors into customers.', value: '$600' },
              { title: 'Google Reviews Integration', desc: 'Your best Google reviews displayed automatically. Real social proof that builds trust before they ever call you.', value: '$300' },
              { title: 'Click-to-Call & Contact Forms', desc: 'One tap to call. One tap to book. Every page makes it effortless for customers to reach you.', value: '$250' },
              { title: 'Hosting & Security', desc: 'Fast hosting, SSL certificate, and maintenance for just $9/mo. Cancel anytime — the site is yours.', value: '$350' },
              { title: '3 Custom Designs Built For Your Brand', desc: 'Choose between Bold, Elegant, or Professional — see your actual business in all three before you pick.', value: '$400' },
              { title: '3 Revision Rounds', desc: '3 rounds of revisions during the build to get it exactly right. After launch, 2 free changes per month included.', value: 'Included' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  {item.value !== 'Included' ? (
                    <span className="text-indigo-400/60 font-bold text-sm whitespace-nowrap ml-4 line-through">{item.value}</span>
                  ) : (
                    <span className="text-green-400 font-bold text-xs whitespace-nowrap ml-4 uppercase">Included</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Value Stack */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-1">Typical Agency Cost</p>
            <p className="text-3xl font-black text-white mb-2 line-through opacity-40">$5,150+</p>
            <p className="text-gray-400 text-sm mb-3">Your Price</p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">$99</p>
            <p className="text-gray-500 text-sm mb-6">One-time. Then just $9/mo hosting. No contracts. Cancel anytime.</p>
            <button
              onClick={scrollToOrder}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get My Custom Website →
            </button>
          </div>
        </div>
      </section>

      {/* The Living Website */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-black text-white">What if your website got better every month — without you touching it?</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl">
              The Living Website upgrade turns your site into a conversion machine that 
              <strong className="text-white"> optimizes itself</strong>. It tests different headlines, images, and layouts — 
              then keeps what works and throws out what doesn&apos;t. Every month, automatically.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Automatic A/B testing — headlines, images, and layouts that improve over time',
                'Monthly SEO updates based on real search data from your area',
                'Fresh content that keeps Google ranking you higher',
                'Speed and performance monitoring — slow sites lose customers',
                'Priority support — any change you need, done within 24 hours',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-white">+$49/mo</span>
              <span className="text-gray-500">after your site launches (hosting included)</span>
            </div>
            <p className="text-gray-600 text-sm">
              That&apos;s less than one lost customer per month. Cancel anytime — the $99 site is yours either way.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-3xl font-black mb-4">The &quot;Love It or Leave It&quot; Guarantee</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-4">
            You get 3 rounds of revisions to get your website <strong className="text-white">exactly</strong> right. 
            If after your revisions you&apos;re still not 100% satisfied, we&apos;ll refund every penny. 
            No questions asked. No hard feelings.
          </p>
          <p className="text-gray-500">
            We can offer this because we build every site to a standard we&apos;re proud of — 
            and we haven&apos;t had to issue a refund yet.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does the 24-hour turnaround work?',
                a: 'Once you submit your order, we immediately start building your site. Within 24 hours, you\'ll receive an email with a live preview link showing your business on three different designs. Pick your favorite, request changes, and we finalize it.',
              },
              {
                q: 'I already have a website. Can you replace it?',
                a: 'Absolutely. We build your new site separately, and once you approve it, we help you point your existing domain to the new site. Zero downtime. Your old site stays live until the new one is ready.',
              },
              {
                q: 'How does hosting work?',
                a: 'Hosting is $9/month — cheaper than almost any provider out there. Cancel anytime. We also provide a simple guide to connect your domain, or we\'ll do it for you. The site is yours — you can export and host it anywhere if you ever want to leave.',
              },
              {
                q: 'What if I need changes after the site launches?',
                a: '3 rounds of revisions during the build process — colors, layout, photos, anything. After launch, you get 2 free changes per month. Need more? $19 each, or upgrade to Living Website ($49/mo) for unlimited changes and priority support.',
              },
              {
                q: 'Why is this so much cheaper than other agencies?',
                a: 'We use AI-powered design tools that let us move 10x faster than a traditional agency. Less time = lower cost. The quality is the same — the process is just dramatically more efficient.',
              },
              {
                q: 'What do you need from me to get started?',
                a: 'Just your business name, website (if you have one), and any preferences. We pull your reviews, photos, and business info from Google automatically. The less work you have to do, the better.',
              },
            ].map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition">
                  <span className="font-bold text-white text-base pr-4">{item.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">What Business Owners Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'I was paying $150/month for a website that looked like it was built in 2015. AutoLocal replaced it in a day and it actually brings in calls now.',
                name: 'Sarah M.',
                biz: 'Salon Owner, Pearland TX',
              },
              {
                quote: 'Three design options to choose from, and they nailed it on the second revision. My patients actually comment on how nice the site looks.',
                name: 'Dr. Kevin R.',
                biz: 'Dental Practice, League City TX',
              },
              {
                quote: 'I was skeptical about the 24-hour thing. They sent me the preview the next morning. My wife made me upgrade to the Living Website on the spot.',
                name: 'Marcus T.',
                biz: 'Home Contractor, Friendswood TX',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.biz}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 px-4 bg-white/[0.02]" id="order">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Get Your Custom Website</h2>
          <p className="text-gray-400 text-center mb-10">Preview in your inbox within 24 hours</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Micro-commitment: business type */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">What type of business do you run? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, businessType: type }))}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.businessType === type
                        ? 'bg-indigo-600 text-white border border-indigo-500'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-gray-300 mb-2">Anything specific you want on your site? <span className="text-gray-600 font-normal">(optional)</span></label>
              <textarea
                rows={3}
                value={formData.changes}
                onChange={e => setFormData(f => ({ ...f, changes: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
                placeholder="Online booking, photo gallery, specific pages... or leave blank and we'll handle everything."
              />
            </div>

            <PackageSelector selected={formData.package} onChange={v => setFormData(f => ({ ...f, package: v }))} />

            <button
              type="submit"
              disabled={checkoutLoading}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirecting to checkout...' : 'Get My Custom Website →'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              🛡️ Love it or get a full refund. 3 revision rounds included. Love it or get a full refund..
            </p>
            <p className="text-center text-gray-600 text-xs">
              🔒 Secure payment powered by Stripe
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
