/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

/* ── Fade-in on scroll hook ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}` }
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const fade = useFadeIn()
  return <div ref={fade.ref} className={`${fade.className} ${className}`}>{children}</div>
}

/* ── Gradient helpers ── */
function gradientStyle(accent: string) {
  return { backgroundImage: `linear-gradient(135deg, ${accent}, #a855f7)` }
}
function gradientTextStyle(accent: string) {
  return {
    backgroundImage: `linear-gradient(135deg, ${accent}, #a855f7)`,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text' as const,
  }
}

export default function BDETemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)

  useEffect(() => {
    if (!data.reviews || data.reviews.length <= 1) return
    const interval = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % data.reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [data.reviews])

  const accent = data.brand_color_accent || '#6366f1'
  const ctaText = getCtaButtonText(data)
  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  const stats: { value: string; label: string }[] = []
  if (data.google_rating) stats.push({ value: `${data.google_rating}★`, label: 'Google Rating' })
  if (data.google_review_count >= 20) stats.push({ value: `${data.google_review_count}+`, label: 'Reviews' })
  if (data.phone) stats.push({ value: data.phone, label: 'Call Us' })

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans">

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {data.hero_image_url && (
          <img
            src={data.hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/60 via-transparent to-[#09090b]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeIn>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
              {data.business_name}
            </h1>
          </FadeIn>
          {data.tagline && (
            <FadeIn>
              <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
                {data.tagline}
              </p>
            </FadeIn>
          )}
          <FadeIn>
            <a
              href={data.cta_url || '#contact'}
              className="inline-flex items-center justify-center px-10 py-5 rounded-xl text-white text-lg font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{
                ...gradientStyle(accent),
                boxShadow: `0 10px 40px -10px ${accent}40`,
              }}
            >
              {ctaText}
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ════════ STATS STRIP ════════ */}
      {stats.length > 0 && (
        <section className="bg-[#111113] border-y border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center divide-x divide-white/10">
            {stats.map((s, i) => (
              <div key={i} className="px-8 py-2 text-center">
                <div className="text-2xl sm:text-3xl font-black" style={gradientTextStyle(accent)}>{s.value}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════ ABOUT ════════ */}
      {data.description && (
        <section id="about" className="py-24">
          <div className="max-w-2xl mx-auto px-6">
            <FadeIn>
              <div className="h-1 w-20 rounded-full mb-8" style={gradientStyle(accent)} />
              <p className="text-lg text-gray-300 leading-relaxed">
                {data.description}
              </p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ════════ SERVICES ════════ */}
      {data.services.length > 0 && (
        <section id="services" className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-16 text-center">Services</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.services.map((s, i) => (
                <FadeIn key={i}>
                  <div className="group border border-white/10 rounded-2xl p-8 hover:border-white/25 transition-all duration-300 bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white mb-3">{s.name}</h3>
                    {s.description && <p className="text-gray-500 leading-relaxed mb-4">{s.description}</p>}
                    {s.price && (
                      <span className="text-lg font-bold" style={gradientTextStyle(accent)}>{s.price}</span>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ GALLERY ════════ */}
      {data.gallery_images.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-16 text-center">Gallery</h2>
            </FadeIn>
            {/* Mobile: horizontal scroll, Desktop: grid */}
            <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible snap-x snap-mandatory">
              {data.gallery_images.map((img, i) => (
                <FadeIn key={i} className="flex-shrink-0 w-[80vw] sm:w-auto snap-center">
                  <div className="overflow-hidden rounded-xl aspect-[4/3]">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ REVIEWS ════════ */}
      {data.reviews.length > 0 && (
        <section id="reviews" className="py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <FadeIn>
              <div className="text-8xl font-black leading-none mb-4" style={gradientTextStyle(accent)}>&ldquo;</div>
              <p className="text-2xl sm:text-3xl text-white leading-relaxed font-normal mb-8">
                {data.reviews[reviewIdx]?.text}
              </p>
              <p className="text-gray-500 text-sm">
                — {data.reviews[reviewIdx]?.author}
                {data.reviews[reviewIdx]?.date && `, ${data.reviews[reviewIdx].date}`}
              </p>
              {data.reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {data.reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIdx ? 'w-8' : 'w-3 bg-gray-700'}`}
                      style={i === reviewIdx ? gradientStyle(accent) : {}}
                    />
                  ))}
                </div>
              )}
            </FadeIn>
          </div>
        </section>
      )}

      {/* ════════ HOURS + CONTACT ════════ */}
      {(Object.keys(data.hours || {}).length > 0 || data.phone || data.email || data.address) && (
        <section id="contact" className="py-24 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn>
              <div className="grid md:grid-cols-2 gap-16">
                {/* Hours */}
                {Object.keys(data.hours || {}).length > 0 && (
                  <div>
                    <h3 className="text-2xl font-black mb-8">Hours</h3>
                    <div className="space-y-3">
                      {daysOrder.map(day => data.hours?.[day] ? (
                        <div key={day} className="flex justify-between py-2 border-b border-white/5 text-gray-400">
                          <span>{dayLabels[day]}</span>
                          <span>{data.hours[day]}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div>
                  <h3 className="text-2xl font-black mb-8">Contact</h3>
                  <div className="space-y-4 text-gray-400">
                    {data.phone && (
                      <p>
                        <span className="text-gray-600 text-sm block mb-1">Phone</span>
                        <a href={`tel:${data.phone}`} className="text-lg font-bold" style={gradientTextStyle(accent)}>
                          {data.phone}
                        </a>
                      </p>
                    )}
                    {data.email && (
                      <p>
                        <span className="text-gray-600 text-sm block mb-1">Email</span>
                        <a href={`mailto:${data.email}`} className="hover:text-white transition">{data.email}</a>
                      </p>
                    )}
                    {data.address && (
                      <p>
                        <span className="text-gray-600 text-sm block mb-1">Address</span>
                        {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ════════ FOOTER ════════ */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-white font-black text-lg">{data.business_name}</p>
        <p className="text-gray-600 text-xs mt-3">Powered by AutoLocal.ai</p>
      </footer>

      <StickyContactBar data={data} />
    </div>
  )
}
