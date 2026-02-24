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

const HERO_IMAGES: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  dental: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
}

export default function ModernCleanTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const heroImg = data.hero_image_url || HERO_IMAGES[data.category] || HERO_IMAGES.general
  const primary = data.brand_color_primary
  const accent = data.brand_color_accent

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <span className="font-bold text-lg" style={{ color: primary }}>{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-gray-900 transition">Services</a>
            <a href="#about" className="hover:text-gray-900 transition">About</a>
            <a href="#reviews" className="hover:text-gray-900 transition">Reviews</a>
            <a href="#contact" className="hover:text-gray-900 transition">Contact</a>
          </nav>
          <a href={data.cta_url || '#contact'} className="px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{ backgroundColor: primary }}>
            {data.cta_text}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {data.business_name}
            </h1>
            {data.tagline && (
              <p className="text-xl sm:text-2xl text-gray-200 mb-6">{data.tagline}</p>
            )}
            {data.google_rating && (
              <div className="flex items-center gap-3 mb-8">
                <StarRating rating={Math.round(data.google_rating)} />
                <span className="text-white font-semibold">{data.google_rating}</span>
                <span className="text-gray-300">({data.google_review_count} reviews)</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={data.cta_url || '#contact'} className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105" style={{ backgroundColor: primary }}>
                {data.cta_text}
              </a>
              <a href="#services" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/20 backdrop-blur text-white text-lg font-semibold hover:bg-white/30 transition">
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {data.services.length > 0 && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>Our Services</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need, all in one place.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-5" style={{ backgroundColor: accent }}>
                    {s.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                  <p className="text-gray-600 mb-3">{s.description}</p>
                  {s.price && <p className="font-semibold text-lg" style={{ color: primary }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: primary }}>About {data.business_name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {data.description || `Welcome to ${data.business_name} — proudly serving ${data.city || 'the community'}${data.state ? `, ${data.state}` : ''}. We're committed to delivering exceptional quality and service that keeps our customers coming back.`}
              </p>
              {data.google_rating && data.google_rating >= 4.0 && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: primary }}>{data.google_rating}★</div>
                  <div>
                    <p className="font-semibold">Highly Rated on Google</p>
                    <p className="text-gray-500 text-sm">{data.google_review_count} verified reviews</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
              {data.gallery_images[0] ? (
                <img src={data.gallery_images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <img src={heroImg} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {data.reviews.length > 0 && (
        <section id="reviews" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>What Our Customers Say</h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <StarRating rating={data.reviews[reviewIdx].rating} />
                <p className="text-xl text-gray-700 mt-6 mb-6 italic leading-relaxed">
                  &ldquo;{data.reviews[reviewIdx].text}&rdquo;
                </p>
                <p className="font-semibold text-gray-900">{data.reviews[reviewIdx].author}</p>
                {data.reviews[reviewIdx].date && (
                  <p className="text-gray-400 text-sm mt-1">{data.reviews[reviewIdx].date}</p>
                )}
              </div>
              {data.reviews.length > 1 && (
                <div className="flex justify-center gap-3 mt-8">
                  {data.reviews.map((_, i) => (
                    <button key={i} onClick={() => setReviewIdx(i)} className={`w-3 h-3 rounded-full transition ${i === reviewIdx ? 'scale-125' : 'bg-gray-300'}`} style={i === reviewIdx ? { backgroundColor: primary } : {}} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Hours */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primary }}>Get In Touch</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {data.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: primary }}>📍</div>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
                  </div>
                </div>
              )}
              {data.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: primary }}>📞</div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href={`tel:${data.phone}`} className="text-gray-600 hover:underline">{data.phone}</a>
                  </div>
                </div>
              )}
              {data.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: primary }}>✉️</div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href={`mailto:${data.email}`} className="text-gray-600 hover:underline">{data.email}</a>
                  </div>
                </div>
              )}
              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center text-gray-500 mt-8">
                <p>📍 Google Maps embed</p>
              </div>
            </div>

            {/* Hours */}
            {Object.keys(data.hours).length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-6">Business Hours</h3>
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

      {/* CTA Banner */}
      <section className="py-20 text-white" style={{ backgroundColor: primary }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8">Contact us today and see the difference.</p>
          <a href={data.cta_url || '#contact'} className="inline-flex px-10 py-4 rounded-full bg-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105" style={{ color: primary }}>
            {data.cta_text}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white font-bold text-lg mb-2">{data.business_name}</p>
          {data.address && <p className="text-sm">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>}
          {data.phone && <p className="text-sm mt-1">{data.phone}</p>}
          <p className="text-xs mt-8 text-gray-600">© {new Date().getFullYear()} {data.business_name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
