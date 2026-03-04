/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

/* ── CSS-only fade-in on scroll ── */
const fadeInStyle = `
@keyframes clutchFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.clutch-fade {
  opacity: 0;
  animation: clutchFadeUp 0.6s ease-out forwards;
  animation-play-state: paused;
}
.clutch-fade.is-visible {
  animation-play-state: running;
}
`

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('is-visible') },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollFade()
  return <div ref={ref} className={`clutch-fade ${className}`}>{children}</div>
}

function StarRating({ rating, color = '#f97316' }: { rating: number; color?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-5 h-5" fill={i <= rating ? color : '#d1d5db'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const SERVICE_ICONS = ['🔧', '⚡', '🛠️', '🏗️', '✅', '🔩', '📐', '🧰', '💡', '🏠']
const DAYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export default function ClutchTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const reviews = data.reviews ?? []
  const services = data.services ?? []
  const galleryImages = data.gallery_images ?? []
  const hours = data.hours ?? {}

  const ctaText = getCtaButtonText(data)

  const HERO_IMAGES: Record<string, string> = {
    salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
    fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
    contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
    general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
  }
  const heroImg = data.hero_image_url || HERO_IMAGES[data.category] || HERO_IMAGES.general

  // Auto-rotate reviews every 6 seconds
  useEffect(() => {
    if (reviews.length <= 1) return
    const id = setInterval(() => setReviewIdx(p => (p + 1) % reviews.length), 6000)
    return () => clearInterval(id)
  }, [reviews.length])

  // Compute years in business (fallback: hide if not derivable)
  const yearsInBusiness: number | null = null // No founding_year in PreviewData — omit or show generic

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: fadeInStyle }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {data.logo_url && <img src={data.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
            <span className="font-black text-xl text-white tracking-tight">{data.business_name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            {services.length > 0 && <a href="#services" className="hover:text-white transition">Services</a>}
            <a href="#about" className="hover:text-white transition">About</a>
            {reviews.length > 0 && <a href="#reviews" className="hover:text-white transition">Reviews</a>}
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <a
            href={data.cta_url || '#contact'}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:brightness-110"
            style={{ backgroundColor: '#f97316' }}
          >
            {ctaText}
          </a>
        </div>
      </header>

      {/* ── Hero with background image ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${data.hero_crop ?? 50}%` }} />
          <div className="absolute inset-0 bg-[#0f172a]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
            {data.business_name}
          </h1>
          {data.tagline && (
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">{data.tagline}</p>
          )}
          <a
            href={data.cta_url || '#contact'}
            className="inline-flex items-center justify-center px-12 py-5 rounded-lg text-white text-lg font-bold shadow-2xl transition-all hover:brightness-110 hover:scale-105"
            style={{ backgroundColor: '#f97316' }}
          >
            {ctaText}
          </a>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-[#1e293b] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-300">
          {data.google_rating && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(data.google_rating)} />
              <span className="font-semibold text-white">{data.google_rating}</span>
              {(data.google_review_count ?? 0) >= 20 && (
                <span className="text-gray-400">({data.google_review_count} reviews)</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <span className="font-semibold">Locally Owned</span>
          </div>
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 hover:text-white transition">
              <span className="text-lg">📞</span>
              <span className="font-semibold">{data.phone}</span>
            </a>
          )}
          {data.city && (
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>Serving {data.city}{data.state ? `, ${data.state}` : ''}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Services ── */}
      {services.length > 0 && (
        <section id="services" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-14">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">What We Do</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a]">{data.site_mode === 'individual' ? 'My Services' : 'Our Services'}</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {services.map((s, i) => (
                <FadeIn key={i}>
                  <div className="border border-gray-200 rounded-xl p-6 pl-8 border-l-4 border-l-[#f97316] hover:shadow-lg transition-shadow bg-white">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl mt-0.5">{SERVICE_ICONS[i % SERVICE_ICONS.length]}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#0f172a] mb-1">{s.name}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-2">{s.description}</p>
                        {s.price && <p className="font-bold text-[#f97316]">{s.price}</p>}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About / Story ── */}
      <section id="about" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">{data.site_mode === 'individual' ? 'My Story' : 'Our Story'}</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a] mb-6">
                About {data.business_name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {data.description || `Welcome to ${data.business_name} — proudly serving ${data.city || 'the community'}${data.state ? `, ${data.state}` : ''}. We're committed to delivering exceptional quality and service that keeps our customers coming back.`}
              </p>
            </FadeIn>
            <FadeIn>
              {galleryImages[0] ? (
                <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
                  <img src={galleryImages[0]} alt={`${data.business_name}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl aspect-[4/3] bg-[#0f172a] flex items-center justify-center">
                  <span className="text-6xl opacity-30">🏢</span>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <section id="reviews" className="py-20 bg-[#0f172a] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-14">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">Testimonials</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{data.site_mode === 'individual' ? 'What My Customers Say' : 'What Our Customers Say'}</h2>
            </FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 sm:p-14 min-h-[260px] flex flex-col items-center justify-center">
                <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8 font-light">
                  &ldquo;{reviews[reviewIdx]?.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <StarRating rating={reviews[reviewIdx]?.rating ?? 5} />
                </div>
                <p className="font-bold text-white mt-3">{reviews[reviewIdx]?.author}</p>
              </div>
              {reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewIdx(i)}
                      className={`h-2.5 rounded-full transition-all ${i === reviewIdx ? 'w-8 bg-[#f97316]' : 'w-2.5 bg-gray-600 hover:bg-gray-500'}`}
                      aria-label={`Show review ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Hours + Contact ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">Get In Touch</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a]">Hours &amp; Contact</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Hours */}
            {Object.keys(hours).length > 0 && (
              <FadeIn>
                <h3 className="text-xl font-bold text-[#0f172a] mb-6">Business Hours</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {DAYS_ORDER.map(day => hours[day] ? (
                    <div key={day} className="flex justify-between px-5 py-3 even:bg-[#f8fafc] border-b border-gray-100 last:border-0">
                      <span className="font-semibold text-[#0f172a]">{DAY_LABELS[day]}</span>
                      <span className="text-gray-600">{hours[day]}</span>
                    </div>
                  ) : null)}
                </div>
              </FadeIn>
            )}
            {/* Contact + Map placeholder */}
            <FadeIn>
              <h3 className="text-xl font-bold text-[#0f172a] mb-6">Contact Info</h3>
              <div className="space-y-5">
                {data.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📍</span>
                    <div>
                      <p className="font-semibold text-[#0f172a]">Address</p>
                      <p className="text-gray-600">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
                    </div>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📞</span>
                    <div>
                      <p className="font-semibold text-[#0f172a]">Phone</p>
                      <a href={`tel:${data.phone}`} className="text-[#f97316] font-semibold hover:underline">{data.phone}</a>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">✉️</span>
                    <div>
                      <p className="font-semibold text-[#0f172a]">Email</p>
                      <a href={`mailto:${data.email}`} className="text-[#f97316] font-semibold hover:underline">{data.email}</a>
                    </div>
                  </div>
                )}
              </div>
              {/* Map placeholder */}
              <div className="mt-6 rounded-xl bg-[#f8fafc] border border-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400 text-sm">📍 Map — {data.city || data.address || data.business_name}</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0f172a] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white font-black text-xl mb-2">{data.business_name}</p>
          {data.phone && <p className="text-sm">{data.phone}</p>}
          {data.address && <p className="text-sm mt-1">{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>}
          <p className="text-xs mt-8 text-gray-600">© {new Date().getFullYear()} {data.business_name} · Powered by <span className="text-[#f97316]">AutoLocal.ai</span></p>
        </div>
      </footer>

      <StickyContactBar data={data} />
    </div>
  )
}
