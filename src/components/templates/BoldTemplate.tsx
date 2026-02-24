/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const HERO_IMAGES: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  dental: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
}

export default function BoldTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const heroImg = data.hero_image_url || HERO_IMAGES[data.category] || HERO_IMAGES.general
  const primary = data.brand_color_primary
  const accent = data.brand_color_accent
  const ctaText = getCtaButtonText(data)

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sticky Header — Dark, bold */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
            <span className="font-black text-xl text-white tracking-tight">{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#reviews" className="hover:text-white transition">Reviews</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <a
            href={data.cta_url || '#contact'}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ backgroundColor: primary }}
          >
            {ctaText}
          </a>
        </div>
      </header>

      {/* Hero — Full-bleed, high contrast */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              {data.google_rating && (
                <div className="flex items-center gap-3 mb-6">
                  <StarRating rating={Math.round(data.google_rating)} />
                  <span className="text-white/90 font-semibold text-sm">{data.google_rating} · {data.google_review_count} reviews on Google</span>
                </div>
              )}
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6">
                {data.business_name}
              </h1>
              {data.tagline && (
                <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light">{data.tagline}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={data.cta_url || '#contact'}
                  className="inline-flex items-center justify-center px-10 py-5 rounded-lg text-white text-lg font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 tracking-wide"
                  style={{ backgroundColor: primary }}
                >
                  {ctaText}
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white/30 text-white text-lg font-bold hover:bg-white/10 transition backdrop-blur"
                >
                  View Services →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services — Dark section */}
      {data.services.length > 0 && (
        <section id="services" className="py-24 bg-gray-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>What We Do</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Our Services</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.services.map((s, i) => (
                <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-white/20">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black mb-6"
                    style={{ backgroundColor: `${primary}40` }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.name}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{s.description}</p>
                  {s.price && <p className="font-bold text-lg" style={{ color: accent }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About — Split layout */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>About Us</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-8" style={{ color: primary }}>
                {data.business_name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {data.description || `Welcome to ${data.business_name} — proudly serving ${data.city || 'the community'}${data.state ? `, ${data.state}` : ''}. We're committed to delivering exceptional quality and service that keeps our customers coming back.`}
              </p>
              {data.google_rating && data.google_rating >= 4.0 && (
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl">
                  <div className="text-5xl font-black" style={{ color: primary }}>{data.google_rating}</div>
                  <div>
                    <div className="flex mb-1"><StarRating rating={Math.round(data.google_rating)} /></div>
                    <p className="text-gray-500 text-sm font-medium">{data.google_review_count} verified reviews</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                {data.gallery_images[0] ? (
                  <img src={data.gallery_images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src={heroImg} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl" style={{ backgroundColor: primary, opacity: 0.15 }} />
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ backgroundColor: accent, opacity: 0.2 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews — Bold dark bg */}
      {data.reviews.length > 0 && (
        <section id="reviews" className="py-24 bg-gray-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>Testimonials</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">What People Say</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 sm:p-14 text-center">
                <div className="flex justify-center mb-6">
                  <StarRating rating={data.reviews[reviewIdx].rating} />
                </div>
                <p className="text-2xl sm:text-3xl text-gray-200 leading-relaxed mb-8 font-light">
                  &ldquo;{data.reviews[reviewIdx].text}&rdquo;
                </p>
                <p className="font-bold text-lg text-white">{data.reviews[reviewIdx].author}</p>
                {data.reviews[reviewIdx].date && (
                  <p className="text-gray-500 text-sm mt-2">{data.reviews[reviewIdx].date}</p>
                )}
              </div>
              {data.reviews.length > 1 && (
                <div className="flex justify-center gap-3 mt-8">
                  {data.reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewIdx(i)}
                      className={`w-3 h-3 rounded-full transition-all ${i === reviewIdx ? 'w-8' : 'bg-gray-600'}`}
                      style={i === reviewIdx ? { backgroundColor: primary } : {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Hours */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>Get In Touch</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: primary }}>Contact Us</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div className="space-y-8">
              {data.address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style={{ backgroundColor: primary }}>📍</div>
                  <div>
                    <p className="font-bold text-lg mb-1">Address</p>
                    <p className="text-gray-600">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
                  </div>
                </div>
              )}
              {data.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style={{ backgroundColor: primary }}>📞</div>
                  <div>
                    <p className="font-bold text-lg mb-1">Phone</p>
                    <a href={`tel:${data.phone}`} className="text-gray-600 hover:underline">{data.phone}</a>
                  </div>
                </div>
              )}
              {data.email && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style={{ backgroundColor: primary }}>✉️</div>
                  <div>
                    <p className="font-bold text-lg mb-1">Email</p>
                    <a href={`mailto:${data.email}`} className="text-gray-600 hover:underline">{data.email}</a>
                  </div>
                </div>
              )}
            </div>

            {Object.keys(data.hours).length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-6">Business Hours</h3>
                <div className="space-y-3">
                  {daysOrder.map(day => data.hours[day] ? (
                    <div key={day} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold">{dayLabels[day]}</span>
                      <span className="text-gray-600">{data.hours[day]}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner — Bold, dark */}
      <section className="py-24 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">Contact us today and experience the difference.</p>
          <a
            href={data.cta_url || '#contact'}
            className="inline-flex px-12 py-5 rounded-lg text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            style={{ backgroundColor: primary }}
          >
            {ctaText}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white font-black text-2xl mb-3">{data.business_name}</p>
          {data.address && <p className="text-sm">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>}
          {data.phone && <p className="text-sm mt-1">{data.phone}</p>}
          <p className="text-xs mt-10 text-gray-700">© {new Date().getFullYear()} {data.business_name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
