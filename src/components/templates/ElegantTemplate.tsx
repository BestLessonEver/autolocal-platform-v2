/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1633681122611-255d24065fce?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop',
]

export default function ElegantTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)

  useEffect(() => {
    if (!data.reviews || data.reviews.length <= 1) return
    const interval = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % data.reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [data.reviews])

  const primary = data.brand_color_primary
  const accent = data.brand_color_accent
  const gallery = data.gallery_images.length > 0 ? data.gallery_images : GALLERY_FALLBACKS
  const heroImg = data.hero_image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop'
  const ctaText = getCtaButtonText(data)

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Sticky Header — Refined, light */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-stone-200" />}
            <span className="font-bold text-xl tracking-wide" style={{ color: primary }}>{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-stone-500 tracking-wide">
            <a href="#services" className="hover:text-stone-800 transition">Services</a>
            <a href="#gallery" className="hover:text-stone-800 transition">Gallery</a>
            <a href="#testimonials" className="hover:text-stone-800 transition">Testimonials</a>
            <a href="#contact" className="hover:text-stone-800 transition">Contact</a>
          </nav>
          <a
            href={data.cta_url || '#contact'}
            className="px-7 py-2.5 rounded-full text-white text-sm font-medium tracking-wide shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: primary }}
          >
            {ctaText}
          </a>
        </div>
      </header>

      {/* Hero — Elegant overlay with centered text */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${data.hero_crop ?? 50}%` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${primary}99, ${primary}55)` }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-20">
          <div className="w-20 h-[1px] bg-white/40 mx-auto mb-8" />
          <p className="text-sm tracking-[0.4em] uppercase text-white/70 mb-6 font-sans">Welcome to</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {data.business_name}
          </h1>
          {data.tagline && (
            <p className="text-xl sm:text-2xl text-white/85 mb-10 italic leading-relaxed">{data.tagline}</p>
          )}
          {data.google_rating && (
            <div className="flex items-center justify-center gap-3 mb-10">
              <StarRating rating={Math.round(data.google_rating)} />
              <span className="text-white/90 font-medium text-sm font-sans">{data.google_rating} stars{(data.google_review_count || 0) >= 20 ? ` · ${data.google_review_count} reviews` : ""}</span>
            </div>
          )}
          <a
            href={data.cta_url || '#contact'}
            className="inline-flex px-10 py-4 rounded-full bg-white text-lg font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
            style={{ color: primary }}
          >
            {ctaText}
          </a>
          <div className="w-20 h-[1px] bg-white/40 mx-auto mt-10" />
        </div>
      </section>

      {/* Services — Warm, refined cards */}
      {data.services.length > 0 && (
        <section id="services" className="py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold" style={{ color: accent }}>What We Offer</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Our Services</h2>
              <div className="w-16 h-[2px] mx-auto mt-6" style={{ backgroundColor: accent }} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-10 shadow-sm hover:shadow-lg transition-all duration-300 text-center border border-stone-100">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: `${primary}10` }}>
                    <span className="text-2xl" style={{ color: primary }}>✦</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: primary }}>{s.name}</h3>
                  <p className="text-stone-500 leading-relaxed mb-4 font-sans text-sm">{s.description}</p>
                  {s.price && <p className="font-bold text-lg" style={{ color: accent }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery — Elegant grid */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold" style={{ color: accent }}>Our Work</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Gallery</h2>
              <div className="w-16 h-[2px] mx-auto mt-6" style={{ backgroundColor: accent }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.slice(0, 6).map((img, i) => (
                <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? 'row-span-2' : ''}`}>
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    style={{ minHeight: i === 0 ? '400px' : '200px' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold" style={{ color: accent }}>Our Story</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8" style={{ color: primary }}>About {data.business_name}</h2>
            <div className="w-16 h-[2px] mx-auto mb-10" style={{ backgroundColor: accent }} />
            <p className="text-stone-600 text-lg leading-relaxed">
              {data.description || `Welcome to ${data.business_name} — proudly serving ${data.city || 'the community'}${data.state ? `, ${data.state}` : ''}. We are dedicated to providing an exceptional experience with attention to detail and personalized care.`}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {data.reviews.length > 0 && (
        <section id="testimonials" className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold" style={{ color: accent }}>Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Client Love</h2>
              <div className="w-16 h-[2px] mx-auto mt-6" style={{ backgroundColor: accent }} />
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {data.reviews.slice(0, 3).map((r, i) => (
                <div key={i} className="bg-stone-50 rounded-2xl p-10 text-center border border-stone-100">
                  <div className="flex justify-center mb-5">
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-stone-700 italic leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
                  <div className="w-8 h-[1px] bg-stone-300 mx-auto mb-4" />
                  <p className="font-bold" style={{ color: primary }}>{r.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Hours */}
      <section id="contact" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold" style={{ color: accent }}>Visit Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Book Your Appointment</h2>
            <div className="w-16 h-[2px] mx-auto mt-6" style={{ backgroundColor: accent }} />
          </div>
          <div className="grid md:grid-cols-2 gap-20 max-w-4xl mx-auto">
            <div className="space-y-8">
              {data.address && (
                <div>
                  <p className="font-bold mb-1 text-sm tracking-wide uppercase font-sans" style={{ color: primary }}>Location</p>
                  <p className="text-stone-600">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
                </div>
              )}
              {data.phone && (
                <div>
                  <p className="font-bold mb-1 text-sm tracking-wide uppercase font-sans" style={{ color: primary }}>Phone</p>
                  <a href={`tel:${data.phone}`} className="text-stone-600 hover:underline">{data.phone}</a>
                </div>
              )}
              {data.email && (
                <div>
                  <p className="font-bold mb-1 text-sm tracking-wide uppercase font-sans" style={{ color: primary }}>Email</p>
                  <a href={`mailto:${data.email}`} className="text-stone-600 hover:underline">{data.email}</a>
                </div>
              )}
              <a
                href={data.cta_url || '#'}
                className="inline-flex mt-4 px-8 py-3 rounded-full text-white font-medium shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: primary }}
              >
                {ctaText}
              </a>
            </div>
            {Object.keys(data.hours || {}).length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-8" style={{ color: primary }}>Hours</h3>
                <div className="space-y-3">
                  {daysOrder.map(day => data.hours?.[day] ? (
                    <div key={day} className="flex justify-between py-3 border-b border-stone-200">
                      <span className="font-medium font-sans text-sm">{dayLabels[day]}</span>
                      <span className="text-stone-500 font-sans text-sm">{data.hours?.[day]}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 text-white text-center" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-3xl font-bold mb-3">{data.business_name}</p>
          {data.address && <p className="text-white/60 text-sm">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>}
          {data.phone && <p className="text-white/60 text-sm mt-1">{data.phone}</p>}
          <p className="text-white/30 text-xs mt-10 font-sans">© {new Date().getFullYear()} {data.business_name}. All rights reserved.</p>
        </div>
      </footer>
    <StickyContactBar data={data} />
      </div>
  )
}
