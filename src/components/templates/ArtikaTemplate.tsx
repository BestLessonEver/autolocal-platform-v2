/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

const HERO_IMAGES: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=900&fit=crop',
  dental: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&h=900&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=900&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&h=900&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&h=900&fit=crop',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop',
}

/* ── CSS-only fade-up animation ──────────────────────────────── */
const fadeUpStyle = `
@keyframes artika-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.artika-fade-up {
  animation: artika-fade-up 0.8s ease-out both;
}
.artika-fade-up-d1 { animation-delay: 0.1s; }
.artika-fade-up-d2 { animation-delay: 0.25s; }
.artika-fade-up-d3 { animation-delay: 0.4s; }
`

export default function ArtikaTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const galleryImages = data.gallery_images ?? []
  const hours = data.hours ?? {}

  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % reviews.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [reviews.length])

  const heroImg = data.hero_image_url || HERO_IMAGES[data.category] || HERO_IMAGES.general
  const accent = data.brand_color_accent || '#b8860b'
  const ctaText = getCtaButtonText(data)

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  }

  const hasGallery = galleryImages.length > 0
  const hasReviews = reviews.length > 0
  const hasHours = Object.keys(hours).length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6', color: '#3a3a3a' }}>
      <style dangerouslySetInnerHTML={{ __html: fadeUpStyle }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-center">
        {/* Background: hero image with cream overlay */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${data.hero_crop ?? 50}%` }} />
          {/* Stronger overlay on mobile for text readability */}
          <div className="absolute inset-0 sm:hidden" style={{ background: 'rgba(250,249,246,0.7)' }} />
          <div className="absolute inset-0 hidden sm:block" style={{ background: 'linear-gradient(to right, rgba(250,249,246,0.6) 0%, rgba(250,249,246,0.35) 50%, rgba(250,249,246,0.1) 100%)' }} />
        </div>

        <div className="relative z-10 px-6 max-w-3xl mx-auto artika-fade-up" style={{ textShadow: '0 2px 12px rgba(250,249,246,0.9), 0 0 40px rgba(250,249,246,0.5)' }}>
          {data.logo_url && (
            <img src={data.logo_url} alt="" className="h-16 w-16 mx-auto mb-8 rounded-full object-cover" />
          )}
          <h1 className="font-serif font-extralight text-5xl sm:text-7xl lg:text-8xl tracking-tight mb-4" style={{ color: '#2a2a2a' }}>
            {data.business_name}
          </h1>
          {data.tagline && (
            <p className="text-xl sm:text-2xl font-light tracking-wide mb-3 artika-fade-up artika-fade-up-d1" style={{ color: '#6b6b6b' }}>
              {data.tagline}
            </p>
          )}
          {data.google_rating && (data.google_review_count ?? 0) >= 20 && (
            <p className="text-base tracking-widest uppercase mb-8 artika-fade-up artika-fade-up-d2" style={{ color: accent }}>
              ★ {data.google_rating} · {data.google_review_count} reviews
            </p>
          )}
          {data.google_rating && (data.google_review_count ?? 0) < 20 && (
            <p className="text-base tracking-widest uppercase mb-8 artika-fade-up artika-fade-up-d2" style={{ color: accent }}>
              ★ {data.google_rating} on Google
            </p>
          )}
          <a
            href={data.cta_url || '#contact'}
            className="inline-block px-10 py-4 rounded-full text-white text-base font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:scale-105 artika-fade-up artika-fade-up-d3"
            style={{ backgroundColor: accent }}
          >
            {ctaText}
          </a>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center artika-fade-up">
          {/* Decorative line */}
          <div className="w-12 h-px mx-auto mb-10" style={{ backgroundColor: accent }} />
          <p className="font-light text-xl sm:text-2xl leading-relaxed" style={{ color: '#5a5a5a' }}>
            {data.description || `Welcome to ${data.business_name}${data.city ? ` in ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}. We are dedicated to providing an exceptional experience in a warm, welcoming environment.`}
          </p>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      {services.length > 0 && (
        <section id="services" className="py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-sm font-light tracking-[0.35em] uppercase mb-16" style={{ color: accent }}>
              Services
            </p>
            <div className="space-y-0">
              {services.map((s, i) => (
                <div key={i} className="flex items-baseline gap-3 py-4 border-b" style={{ borderColor: '#e8e5df' }}>
                  <span className="font-serif text-xl sm:text-2xl font-light whitespace-nowrap" style={{ color: '#2a2a2a' }}>
                    {s.name}
                  </span>
                  <span className="flex-1 border-b border-dotted" style={{ borderColor: '#d4d0c8', minWidth: '2rem' }} />
                  {s.price && (
                    <span className="text-sm font-light whitespace-nowrap" style={{ color: '#6b6b6b' }}>
                      {s.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {services.some(s => s.description) && (
              <div className="mt-12 space-y-4">
                {services.filter(s => s.description).map((s, i) => (
                  <p key={i} className="text-sm font-light" style={{ color: '#8a8a8a' }}>
                    <span className="font-normal" style={{ color: '#5a5a5a' }}>{s.name}:</span> {s.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────────── */}
      {hasGallery && (
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-sm font-light tracking-[0.35em] uppercase mb-16" style={{ color: accent }}>
              Gallery
            </p>
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[200px] md:auto-rows-[260px]"
            >
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-sm ${
                    i === 0 ? 'row-span-2' : i === 3 ? 'col-span-2' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ──────────────────────────────────────────── */}
      {hasReviews && (
        <section id="reviews" className="py-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="font-serif font-light italic text-3xl sm:text-4xl lg:text-5xl leading-relaxed transition-opacity duration-500"
              style={{ color: '#3a3a3a' }}
            >
              &ldquo;{reviews[reviewIdx].text}&rdquo;
            </p>
            <p className="mt-8 text-sm tracking-[0.3em] uppercase font-light" style={{ color: '#8a8a8a' }}>
              — {reviews[reviewIdx].author}
            </p>
            {reviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewIdx(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i === reviewIdx ? accent : '#d4d0c8',
                      transform: i === reviewIdx ? 'scale(1.5)' : 'scale(1)',
                    }}
                    aria-label={`Show review ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Hours ────────────────────────────────────────────── */}
      {hasHours && (
        <section className="py-24 px-6">
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm font-light tracking-[0.35em] uppercase mb-12" style={{ color: accent }}>
              Hours
            </p>
            <div className="space-y-3">
              {daysOrder.map(day => hours[day] ? (
                <div key={day} className="flex justify-between text-base font-light">
                  <span style={{ color: '#5a5a5a' }}>{dayLabels[day]}</span>
                  <span style={{ color: '#8a8a8a' }}>{data.hours[day]}</span>
                </div>
              ) : null)}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ──────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm font-light tracking-[0.35em] uppercase mb-12" style={{ color: accent }}>
            Contact
          </p>
          <div className="space-y-4 text-base font-light" style={{ color: '#5a5a5a' }}>
            {data.address && (
              <p>{data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</p>
            )}
            {data.phone && (
              <p>
                <a href={`tel:${data.phone}`} className="hover:underline" style={{ color: accent }}>
                  {data.phone}
                </a>
              </p>
            )}
            {data.email && (
              <p>
                <a href={`mailto:${data.email}`} className="hover:underline" style={{ color: accent }}>
                  {data.email}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-16 px-6 text-center">
        <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: '#d4d0c8' }} />
        <p className="font-serif font-extralight text-xl mb-2" style={{ color: '#2a2a2a' }}>
          {data.business_name}
        </p>
        <p className="text-xs tracking-widest uppercase mt-8" style={{ color: '#b0ada6' }}>
        </p>
      </footer>

    </div>
  )
}
