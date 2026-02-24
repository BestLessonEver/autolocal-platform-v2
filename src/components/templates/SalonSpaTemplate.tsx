'use client'

import { useState } from 'react'
import { type TemplateProps } from './types'

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
  'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop',
]

export default function SalonSpaTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const primary = data.brand_color_primary
  const accent = data.brand_color_accent
  const gallery = data.gallery_images.length > 0 ? data.gallery_images : GALLERY_FALLBACKS
  const heroImg = data.hero_image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <span className="font-bold text-xl tracking-wide" style={{ color: primary }}>{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:opacity-70 transition">Services</a>
            <a href="#gallery" className="hover:opacity-70 transition">Gallery</a>
            <a href="#testimonials" className="hover:opacity-70 transition">Testimonials</a>
            <a href="#contact" className="hover:opacity-70 transition">Contact</a>
          </nav>
          <a href={data.cta_url || '#contact'} className="px-6 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:scale-105" style={{ backgroundColor: primary }}>
            {data.cta_text}
          </a>
        </div>
      </header>

      {/* Hero — Elegant with overlay */}
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${primary}CC, ${primary}88)` }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="text-sm tracking-[0.3em] uppercase text-white/80 mb-4">Welcome to</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {data.business_name}
          </h1>
          {data.tagline && (
            <p className="text-xl sm:text-2xl text-white/90 mb-8 italic">{data.tagline}</p>
          )}
          {data.google_rating && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <StarRating rating={Math.round(data.google_rating)} />
              <span className="text-white font-semibold">{data.google_rating} · {data.google_review_count} reviews</span>
            </div>
          )}
          <a href={data.cta_url || '#contact'} className="inline-flex px-10 py-4 rounded-full bg-white text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105" style={{ color: primary }}>
            {data.cta_text}
          </a>
        </div>
      </section>

      {/* Services — Elegant cards */}
      {data.services.length > 0 && (
        <section id="services" className="py-24" style={{ backgroundColor: `${primary}08` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>What We Offer</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Our Services</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center border" style={{ borderColor: `${primary}15` }}>
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-5" style={{ backgroundColor: `${primary}20`, color: primary }}>
                    ✦
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: primary }}>{s.name}</h3>
                  <p className="text-gray-600 mb-3">{s.description}</p>
                  {s.price && <p className="font-semibold text-lg" style={{ color: accent }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery — Masonry-style grid */}
      <section id="gallery" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>Our Work</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.slice(0, 6).map((img, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl ${i === 0 ? 'row-span-2 col-span-1' : ''}`}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" style={{ minHeight: i === 0 ? '400px' : '200px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {data.reviews.length > 0 && (
        <section id="testimonials" className="py-24" style={{ backgroundColor: `${primary}08` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Client Love</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {data.reviews.slice(0, 3).map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border text-center" style={{ borderColor: `${primary}15` }}>
                  <div className="flex justify-center mb-4">
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-gray-700 italic mb-4 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <p className="font-semibold" style={{ color: primary }}>{r.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Hours */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>Visit Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primary }}>Book Your Appointment</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <div className="space-y-6">
              {data.address && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: primary }}>Location</p>
                  <p className="text-gray-600">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
                </div>
              )}
              {data.phone && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: primary }}>Phone</p>
                  <a href={`tel:${data.phone}`} className="text-gray-600 hover:underline">{data.phone}</a>
                </div>
              )}
              {data.email && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: primary }}>Email</p>
                  <a href={`mailto:${data.email}`} className="text-gray-600 hover:underline">{data.email}</a>
                </div>
              )}
              <a href={data.cta_url || '#'} className="inline-flex mt-4 px-8 py-3 rounded-full text-white font-semibold shadow-lg transition-all hover:scale-105" style={{ backgroundColor: primary }}>
                {data.cta_text}
              </a>
            </div>
            {Object.keys(data.hours).length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-6" style={{ color: primary }}>Hours</h3>
                <div className="space-y-3">
                  {daysOrder.map(day => data.hours[day] ? (
                    <div key={day} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">{dayLabels[day]}</span>
                      <span className="text-gray-600">{data.hours[day]}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white text-center" style={{ backgroundColor: primary }}>
        <p className="text-2xl font-bold mb-2">{data.business_name}</p>
        {data.address && <p className="text-white/70 text-sm">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>}
        {data.phone && <p className="text-white/70 text-sm mt-1">{data.phone}</p>}
        <p className="text-white/40 text-xs mt-8">© {new Date().getFullYear()} {data.business_name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
