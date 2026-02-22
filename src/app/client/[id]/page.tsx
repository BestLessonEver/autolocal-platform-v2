'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '🔵' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'google', label: 'Google Business', icon: '📍' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
]

const VOICE_OPTIONS = [
  { id: 'audit', label: 'Use what you found in the audit', desc: 'We\'ll match the tone from your existing content' },
  { id: 'warm', label: 'Warm & Friendly', desc: 'Conversational, heartfelt, community-focused' },
  { id: 'bold', label: 'Bold & Energetic', desc: 'High energy, motivational, action-driven' },
  { id: 'professional', label: 'Professional', desc: 'Trustworthy, polished, informative' },
  { id: 'casual', label: 'Fun & Casual', desc: 'Lighthearted, playful, emoji-friendly' },
  { id: 'earthy', label: 'Down to Earth', desc: 'Honest, practical, relatable' },
]

const PACKAGES: Record<string, { name: string; price: string; features: string[] }> = {
  social_revive: {
    name: 'Social Media Revive',
    price: '$499',
    features: ['AI-generated posts', '5x/week posting for 30 days', 'Platform optimization', 'Hashtag strategy', 'Engagement monitoring'],
  },
  digital_cleanup: {
    name: 'Full Digital Cleanup',
    price: '$999',
    features: ['Everything in Social Revive', 'Google review response strategy', 'Website speed optimization', 'Mobile fixes & SEO basics', 'Local listing cleanup'],
  },
  growth_engine: {
    name: 'Growth Engine',
    price: '$1,999',
    features: ['Everything in Digital Cleanup', 'Competitor monitoring', 'Monthly reporting', 'Content calendar', 'Ongoing optimization', 'Converts to $199/mo after first month'],
  },
  new_website: {
    name: 'New Website + SEO',
    price: '$3,499',
    features: ['Custom designed, mobile-first', 'SEO-optimized & fast-loading', 'Google Business integration', 'Contact forms & booking', 'SSL included'],
  },
}

export default function ClientOnboardPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    address: '',
    phone: '',
    website: '',
    contactName: '',
    contactEmail: '',
    selectedPlatforms: [] as string[],
    platformUrls: {} as Record<string, string>,
    postDirectly: true,
    brandVoice: 'audit',
    upcomingEvents: '',
    avoidTopics: '',
    selectedPackage: 'social_revive',
    specialRequests: '',
  })

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const togglePlatform = (id: string) => {
    setForm(f => ({
      ...f,
      selectedPlatforms: f.selectedPlatforms.includes(id)
        ? f.selectedPlatforms.filter(p => p !== id)
        : [...f.selectedPlatforms, id],
    }))
  }

  const setPlatformUrl = (id: string, url: string) => {
    setForm(f => ({ ...f, platformUrls: { ...f.platformUrls, [id]: url } }))
  }

  const next = () => setStep(s => Math.min(s + 1, 3))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let website = form.website.trim()
      if (website && !website.startsWith('http')) website = 'https://' + website

      const res = await fetch('/api/client/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: params.id !== 'demo' ? params.id : null,
          businessName: form.businessName,
          address: form.address,
          phone: form.phone,
          website,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          package: form.selectedPackage,
          socialPlatforms: form.selectedPlatforms.map(p => ({
            platform: p,
            url: form.platformUrls[p] || '',
            manageDirectly: form.postDirectly,
          })),
          brandVoice: form.brandVoice,
          upcomingEvents: form.upcomingEvents,
          avoidTopics: form.avoidTopics,
          specialRequests: form.specialRequests,
        }),
      })
      if (res.ok) setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const pkg = PACKAGES[form.selectedPackage] || PACKAGES.social_revive

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="gradient-card rounded-2xl p-10 max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">You&apos;re all set!</h1>
          <p className="text-slate-400 mb-8">Here&apos;s what happens next:</p>
          <div className="space-y-4 text-left">
            {[
              { icon: '🔍', title: 'Researching your market', desc: 'We\'re scanning your competitors and industry right now' },
              { icon: '📝', title: 'First content batch in 24 hours', desc: 'You\'ll receive posts for approval via email' },
              { icon: '🚀', title: 'We start posting', desc: 'Once you approve, we handle everything' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-start glass rounded-xl p-4">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{s.title}</div>
                  <div className="text-slate-400 text-sm">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-sm mt-8">Questions? Email <a href="mailto:brian@autolocal.ai" className="text-cyan-400 hover:underline">brian@autolocal.ai</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text">
            <Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />
            AutoLocal.ai
          </Link>
          <span className="text-sm text-slate-500">Step {step + 1} of 4</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-800 h-1">
        <div className="h-1 btn-gradient transition-all duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>

      <div className="max-w-xl mx-auto p-6 mt-8">
        {step === 0 && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome to AutoLocal.ai 🚀</h1>
            <p className="text-slate-400 mt-2">Let&apos;s get your marketing fixed. This takes about 3 minutes.</p>
          </div>
        )}

        <div className="gradient-card rounded-2xl p-8">
          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-2">Your Business</h2>
              <input placeholder="Business name *" value={form.businessName} onChange={e => set('businessName', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
              <input placeholder="Business address" value={form.address} onChange={e => set('address', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
              <input placeholder="Phone number" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
              <input type="text" placeholder="Website URL" value={form.website} onChange={e => set('website', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
              <input placeholder="Your name *" value={form.contactName} onChange={e => set('contactName', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
              <input type="email" placeholder="Your email *" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
            </div>
          )}

          {/* Step 2: Social Accounts */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-2">Your Social Accounts</h2>
              <p className="text-slate-400 text-sm">Which platforms do you want us to manage?</p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition ${form.selectedPlatforms.includes(p.id) ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-white text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
              {form.selectedPlatforms.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-slate-400 text-sm">Enter your profile URLs:</p>
                  {form.selectedPlatforms.map(id => {
                    const p = PLATFORMS.find(pl => pl.id === id)!
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <span className="text-lg">{p.icon}</span>
                        <input placeholder={`${p.label} profile URL`} value={form.platformUrls[id] || ''} onChange={e => setPlatformUrl(id, e.target.value)} className="flex-1 bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition" />
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="glass rounded-xl p-4 mt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-white text-sm font-medium">Post directly to my accounts</div>
                    <div className="text-slate-500 text-xs mt-1">{form.postDirectly ? 'We\'ll send you a link to connect your accounts' : 'We\'ll send you weekly content packs to post yourself'}</div>
                  </div>
                  <button onClick={() => set('postDirectly', !form.postDirectly)} className={`w-12 h-6 rounded-full transition ${form.postDirectly ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.postDirectly ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Brand & Preferences */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-2">Brand & Preferences</h2>
              <div>
                <p className="text-slate-400 text-sm mb-3">How should your content sound?</p>
                <div className="space-y-2">
                  {VOICE_OPTIONS.map(v => (
                    <button key={v.id} onClick={() => set('brandVoice', v.id)} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${form.brandVoice === v.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${form.brandVoice === v.id ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`} />
                      <div>
                        <div className="text-white text-sm font-medium">{v.label}</div>
                        <div className="text-slate-500 text-xs">{v.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Any upcoming promotions, events, or seasonal things?</label>
                <textarea placeholder="e.g. We have a grand opening in March, 20% off for new clients..." value={form.upcomingEvents} onChange={e => set('upcomingEvents', e.target.value)} rows={3} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition resize-none" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Any topics or language we should avoid?</label>
                <textarea placeholder="e.g. Don't mention competitors by name, avoid political topics..." value={form.avoidTopics} onChange={e => set('avoidTopics', e.target.value)} rows={2} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition resize-none" />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-2">Confirm & Launch</h2>
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">{pkg.name}</span>
                  <span className="text-2xl font-bold gradient-text">{pkg.price}</span>
                </div>
                <ul className="space-y-2">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-cyan-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-xl p-4 border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="text-cyan-400 font-semibold text-sm">Your first content batch will be ready within 24 hours</div>
                    <div className="text-slate-500 text-xs">Traditional agencies take 2-4 weeks. We move fast.</div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Any special requests or questions?</label>
                <textarea placeholder="Anything else we should know..." value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} rows={3} className="w-full bg-navy-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition resize-none" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            <button onClick={prev} disabled={step === 0} className="text-slate-500 hover:text-white disabled:invisible transition">← Back</button>
            {step < 3 ? (
              <button onClick={next} disabled={step === 0 && (!form.businessName || !form.contactEmail)} className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Let\'s Go →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
