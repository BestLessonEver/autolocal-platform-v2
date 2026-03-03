/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const INDUSTRY_STOCK: Record<string, string[]> = {
  restaurant: ['🍽️ Menu photos', '🏪 Storefront / exterior', '👨‍🍳 Kitchen or staff', '🪑 Interior / dining area', '🍕 Signature dishes'],
  salon: ['💇 Styling in action', '🏪 Storefront', '💺 Interior / stations', '✨ Before & after', '🧴 Products you use'],
  fitness: ['🏋️ Training in action', '🏪 Facility exterior', '🏃 Equipment / space', '👥 Group classes', '🏆 Results / transformations'],
  contractor: ['🔨 Completed projects', '🏗️ Work in progress', '🛻 Your truck / equipment', '👷 Your team', '📋 Before & after'],
  default: ['🏪 Your storefront or workspace', '👥 Your team or you at work', '✨ Your best work / products', '📸 Happy customers (with permission)', '🎨 Anything that shows your vibe'],
}

export default function IntakePage() {
  const { slug } = useParams()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    tagline: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    website: '',
    facebook: '',
    instagram: '',
    hours: Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '17:00', closed: false }])) as Record<string, { open: string; close: string; closed: boolean }>,
    services: [{ name: '', description: '', price: '' }],
  })

  const [photos, setPhotos] = useState<{ file: File; preview: string; label: string }[]>([])
  const [logo, setLogo] = useState<{ file: File; preview: string } | null>(null)

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo({ file, preview: URL.createObjectURL(file) })
  }

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newPhotos = Array.from(files).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      label: '',
    }))
    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  const addService = () => {
    setForm(f => ({ ...f, services: [...f.services, { name: '', description: '', price: '' }] }))
  }

  const updateService = (idx: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      services: f.services.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }))
  }

  const removeService = (idx: number) => {
    setForm(f => ({ ...f, services: f.services.filter((_, i) => i !== idx) }))
  }

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      hours: { ...f.hours, [day]: { ...f.hours[day], closed: !f.hours[day].closed } },
    }))
  }

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setForm(f => ({
      ...f,
      hours: { ...f.hours, [day]: { ...f.hours[day], [field]: value } },
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setUploading(true)

    try {
      // Upload logo
      let logoUrl = ''
      if (logo) {
        const fd = new FormData()
        fd.append('file', logo.file)
        fd.append('slug', slug as string)
        fd.append('type', 'logo')
        const res = await fetch('/api/intake/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) logoUrl = data.url
      }

      // Upload photos
      const photoUrls: string[] = []
      for (const photo of photos) {
        const fd = new FormData()
        fd.append('file', photo.file)
        fd.append('slug', slug as string)
        fd.append('type', 'photo')
        const res = await fetch('/api/intake/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) photoUrls.push(data.url)
      }

      setUploading(false)

      // Submit form data
      const hours: Record<string, string> = {}
      for (const [day, h] of Object.entries(form.hours)) {
        hours[day] = h.closed ? 'Closed' : `${h.open} - ${h.close}`
      }

      await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          ...form,
          hours,
          services: form.services.filter(s => s.name.trim()),
          logoUrl,
          photoUrls,
        }),
      })

      setSubmitted(true)
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const photoTips = INDUSTRY_STOCK[form.category] || INDUSTRY_STOCK.default

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-white mb-4">You&apos;re all set!</h1>
          <p className="text-gray-400 text-lg mb-8">
            We have everything we need to build your website. You&apos;ll receive an email within 24 hours with a live preview of your site.
          </p>
          <a href="/" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition">
            Back to AutoLocal.ai
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />
            <span className="gradient-text">AutoLocal.ai</span>
          </Link>
          <span className="text-xs text-gray-500">Step {step} of 4</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-indigo-600' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black mb-2">Tell us about your business</h1>
              <p className="text-gray-400">We&apos;ll use this to build your custom website.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name *</label>
                <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="e.g. Joe's Pizza" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">What type of business? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Restaurant', 'Salon', 'Fitness', 'Contractor', 'Retail', 'Professional Services', 'Auto', 'Health & Wellness', 'Other'].map(type => (
                    <button key={type} type="button" onClick={() => update('category', type.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))}
                      className={`p-3 rounded-xl border text-sm text-left transition ${form.category === type.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') ? 'bg-indigo-600/20 border-indigo-500/40 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/10'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tagline <span className="text-gray-600">(optional)</span></label>
                <input type="text" value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="e.g. The best pizza in town since 1985" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Describe your business <span className="text-gray-600">(2-3 sentences)</span></label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="What do you do? What makes you special? Who are your customers?" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition resize-none" />
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!form.businessName.trim() || !form.category}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Contact & Hours */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black mb-2">Contact & Hours</h1>
              <p className="text-gray-400">How can customers reach you?</p>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Address</label>
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">City</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Houston" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">State</label>
                  <input type="text" value={form.state} onChange={e => update('state', e.target.value)} placeholder="TX" maxLength={2} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Website <span className="text-gray-600">(if any)</span></label>
                  <input type="url" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram <span className="text-gray-600">(optional)</span></label>
                  <input type="text" value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@yourbusiness" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Business Hours</label>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-3">
                      <button type="button" onClick={() => toggleDay(day)}
                        className={`w-24 text-left text-sm font-medium transition ${form.hours[day].closed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                        {day.slice(0, 3)}
                      </button>
                      {form.hours[day].closed ? (
                        <span className="text-gray-600 text-sm">Closed</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="time" value={form.hours[day].open} onChange={e => updateHours(day, 'open', e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 outline-none" />
                          <span className="text-gray-500">to</span>
                          <input type="time" value={form.hours[day].close} onChange={e => updateHours(day, 'close', e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 outline-none" />
                        </div>
                      )}
                      <button type="button" onClick={() => toggleDay(day)} className="text-xs text-gray-500 hover:text-gray-300 transition ml-auto">
                        {form.hours[day].closed ? 'Open' : 'Close'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold transition hover:text-white">
                ← Back
              </button>
              <button onClick={() => setStep(3)} disabled={!form.phone.trim() || !form.email.trim()}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black mb-2">Your Services</h1>
              <p className="text-gray-400">What do you offer? Add as many as you like.</p>
            </div>

            <div className="space-y-3">
              {form.services.map((s, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Service {i + 1}</span>
                    {form.services.length > 1 && (
                      <button onClick={() => removeService(i)} className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
                    )}
                  </div>
                  <input type="text" value={s.name} onChange={e => updateService(i, 'name', e.target.value)} placeholder="Service name (e.g. Haircut, Oil Change, Personal Training)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input type="text" value={s.description} onChange={e => updateService(i, 'description', e.target.value)} placeholder="Brief description (optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                    </div>
                    <input type="text" value={s.price} onChange={e => updateService(i, 'price', e.target.value)} placeholder="Price" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition" />
                  </div>
                </div>
              ))}

              <button onClick={addService} className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition text-sm font-medium">
                + Add Another Service
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold transition hover:text-white">
                ← Back
              </button>
              <button onClick={() => setStep(4)}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99]">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Photos & Logo */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black mb-2">Photos & Logo</h1>
              <p className="text-gray-400">Great photos make a great website. Upload what you have — we&apos;ll make it look amazing.</p>
            </div>

            {/* Logo */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Your Logo</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo.preview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl text-gray-600">📷</span>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition cursor-pointer">
                    📤 {logo ? 'Replace' : 'Upload Logo'}
                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, or SVG. No logo yet? We&apos;ll work with what you have.</p>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Business Photos</h3>
              <p className="text-xs text-gray-500 mb-3">Upload 3-10 photos. These will be used throughout your website.</p>

              {/* Photo tips */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-indigo-400 mb-2">📸 Photo ideas for your site:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {photoTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden bg-white/5 aspect-square">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition cursor-pointer">
                📤 {photos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                <input type="file" accept="image/*" multiple onChange={handlePhotosSelect} className="hidden" />
              </label>
              <p className="text-xs text-gray-600 mt-1">{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold transition hover:text-white">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
                {submitting ? (uploading ? 'Uploading photos...' : 'Submitting...') : 'Submit & Build My Site 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
