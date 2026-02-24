/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

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

const HERO_IMAGES: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  dental: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
}

export default function ProfessionalTemplate({ data }: TemplateProps) {
  const primary = data.brand_color_primary
  const accent = data.brand_color_accent
  const heroImg = data.hero_image_url || HERO_IMAGES[data.category] || HERO_IMAGES.general
  const ctaText = getCtaButtonText(data)

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  const stats = [
    { value: data.google_review_count ? `${data.google_review_count}+` : '500+', label: 'Happy Clients' },
    { value: data.google_rating ? `${data.google_rating}★` : '5★', label: 'Google Rating' },
    { value: '10+', label: 'Years Experience' },
    { value: '100%', label: 'Satisfaction' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sticky Header — Professional colored bar */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-8 w-8 rounded object-cover" />}
            <span className="font-bold text-lg text-white">{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#why-us" className="hover:text-white transition">Why Us</a>
            <a href="#reviews" className="hover:text-white transition">Reviews</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="hidden sm:flex items-center gap-2 text-white text-sm font-semibold">
                📞 {data.phone}
              </a>
            )}
            <a
              href={data.cta_url || '#contact'}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: accent, color: '#fff' }}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </header>

      {/* Hero — Image background on mobile, split on desktop */}
      <section className="relative overflow-hidden bg-gray-50">
        {/* Mobile hero image */}
        <div className="lg:hidden relative h-[300px] sm:h-[400px]">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 lg:min-h-[600px]">
            <div className="flex items-center px-4 sm:px-8 lg:px-16 py-10 lg:py-24">
              <div className="max-w-lg">
                {data.google_rating && data.google_rating >= 4.0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <StarRating rating={Math.round(data.google_rating)} />
                    <span className="text-sm font-semibold text-gray-600">{data.google_rating} stars · {data.google_review_count} reviews</span>
                  </div>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: primary }}>
                  {data.business_name}
                </h1>
                {data.tagline && (
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">{data.tagline}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <a
                    href={data.cta_url || '#contact'}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    style={{ backgroundColor: primary }}
                  >
                    {ctaText}
                  </a>
                  {data.phone && (
                    <a
                      href={`tel:${data.phone}`}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 text-lg font-semibold transition-all hover:bg-gray-50"
                      style={{ borderColor: primary, color: primary }}
                    >
                      📞 Call Now
                    </a>
                  )}
                </div>
                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🛡️', label: 'Licensed & Insured' },
                    { icon: '⭐', label: '5-Star Rated' },
                    { icon: '🏆', label: 'Award Winning' },
                    { icon: '✅', label: 'Satisfaction Guaranteed' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-lg">{b.icon}</span>
                      <span className="font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <img src={heroImg} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 text-white" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{s.value}</p>
                <p className="text-white/70 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {data.services.length > 0 && (
        <section id="services" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>Our Services</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Professional solutions tailored to your needs.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border-t-4" style={{ borderColor: primary }}>
                  <h3 className="text-xl font-bold mb-3" style={{ color: primary }}>{s.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{s.description}</p>
                  {s.price && <p className="font-bold text-lg" style={{ color: accent }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Us */}
      <section id="why-us" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>Why Choose {data.business_name}?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎯', title: 'Expert Team', desc: 'Experienced professionals dedicated to quality results.' },
              { icon: '⏰', title: 'On Time, Every Time', desc: 'We respect your schedule and deliver as promised.' },
              { icon: '💰', title: 'Fair Pricing', desc: 'Transparent pricing with no hidden fees or surprises.' },
              { icon: '🤝', title: 'Customer First', desc: `${data.google_review_count || 'Many'}+ happy customers and counting.` },
            ].map((item, i) => (
              <div key={i} className="text-center bg-white rounded-xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {data.reviews.length > 0 && (
        <section id="reviews" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>What Our Clients Say</h2>
              {data.google_rating && (
                <div className="flex items-center justify-center gap-3">
                  <StarRating rating={Math.round(data.google_rating)} />
                  <span className="font-semibold">{data.google_rating} average from {data.google_review_count} reviews</span>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.reviews.slice(0, 6).map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primary }}>
                      {r.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{r.author}</p>
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: primary }}>{ctaText}</h2>
              <p className="text-gray-600 mb-8">Fill out the form and we&apos;ll get back to you within 24 hours.</p>
              <form onSubmit={e => e.preventDefault()} className="space-y-5">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition" style={{ '--tw-ring-color': primary } as React.CSSProperties} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition" />
                </div>
                <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition resize-none" />
                <button type="submit" className="w-full py-4 rounded-lg text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: primary }}>
                  Send Message
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: primary }}>Contact Information</h3>
                <div className="space-y-4">
                  {data.address && (
                    <p className="flex items-start gap-3"><span>📍</span><span>{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</span></p>
                  )}
                  {data.phone && (
                    <p className="flex items-start gap-3"><span>📞</span><a href={`tel:${data.phone}`} className="hover:underline">{data.phone}</a></p>
                  )}
                  {data.email && (
                    <p className="flex items-start gap-3"><span>✉️</span><a href={`mailto:${data.email}`} className="hover:underline">{data.email}</a></p>
                  )}
                </div>
              </div>

              {Object.keys(data.hours).length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: primary }}>Business Hours</h3>
                  <div className="space-y-2">
                    {daysOrder.map(day => data.hours[day] ? (
                      <div key={day} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">{dayLabels[day]}</span>
                        <span className="text-gray-600">{data.hours[day]}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <p className="font-bold text-xl mb-2">{data.business_name}</p>
              <p className="text-white/70 text-sm">{data.description?.slice(0, 120) || `Proudly serving ${data.city || 'the community'}.`}</p>
            </div>
            <div>
              {data.address && <p className="text-white/70 text-sm">{data.address}</p>}
              {data.phone && <p className="text-white/70 text-sm mt-1">{data.phone}</p>}
              {data.email && <p className="text-white/70 text-sm mt-1">{data.email}</p>}
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <a href={data.cta_url || '#contact'} className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: accent }}>
                {ctaText}
              </a>
            </div>
          </div>
          <p className="text-white/30 text-xs text-center mt-10">© {new Date().getFullYear()} {data.business_name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
