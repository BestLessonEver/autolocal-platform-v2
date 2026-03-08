/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

const TYPE_COLORS: Record<string, { bg: string; light: string; name: string }> = {
  salon: { bg: '#ee99ac', light: '#fff0f3', name: 'Fairy' },
  dental: { bg: '#a8a878', light: '#f5f5eb', name: 'Normal' },
  fitness: { bg: '#c03028', light: '#fff0ef', name: 'Fighting' },
  restaurant: { bg: '#f08030', light: '#fff5ee', name: 'Fire' },
  contractor: { bg: '#b8a038', light: '#faf5e0', name: 'Rock' },
  general: { bg: '#6890f0', light: '#eef3ff', name: 'Water' },
}

export default function PokemonTemplate({ data }: TemplateProps) {
  const [hovering, setHovering] = useState(false)
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const galleryImages = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const hours = data.hours ?? {}
  const ind = data.site_mode === 'individual'

  const typeInfo = TYPE_COLORS[data.category] || TYPE_COLORS.general
  const accent = data.brand_color_accent || typeInfo.bg
  const hp = data.google_rating ? Math.round(data.google_rating * 20) : 80
  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes holo-shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .poke-card {
          max-width: 420px;
          width: 100%;
          border-radius: 16px;
          padding: 12px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s;
        }
        .poke-card:hover { transform: scale(1.02); }
        .poke-holo {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            125deg,
            rgba(255,0,0,0.08) 0%,
            rgba(255,165,0,0.08) 15%,
            rgba(255,255,0,0.08) 30%,
            rgba(0,128,0,0.08) 45%,
            rgba(0,0,255,0.08) 60%,
            rgba(75,0,130,0.08) 75%,
            rgba(238,130,238,0.08) 100%
          );
          background-size: 400% 400%;
          animation: holo-shine 4s ease infinite;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 16px;
          z-index: 2;
        }
        .poke-card:hover .poke-holo { opacity: 1; }
        .poke-energy { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; margin-right: 2px; border: 1px solid rgba(0,0,0,0.2); }
        .poke-attack { padding: 8px 0; border-bottom: 1px solid #ddd; display: flex; align-items: center; gap: 8px; }
        .poke-attack:last-child { border-bottom: none; }
      `}} />

      {/* Main Card */}
      <div
        className="poke-card"
        style={{ background: `linear-gradient(145deg, #f5f5dc 0%, ${typeInfo.light} 30%, #fffde8 100%)`, border: `6px solid ${accent}`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)` }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="poke-holo" />

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 8px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '9px', color: '#888' }}>Stage 1 — Evolves from {data.city || 'local'} startup</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{data.business_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>HP </span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#cc0000' }}>{hp}</span>
            <div style={{ display: 'inline-flex', marginLeft: '4px' }}>
              <span className="poke-energy" style={{ background: accent, width: '14px', height: '14px', fontSize: '8px' }}>{typeInfo.name[0]}</span>
            </div>
          </div>
        </div>

        {/* Image Frame */}
        <div style={{ border: `3px solid ${accent}`, borderRadius: '8px', overflow: 'hidden', margin: '0 4px', position: 'relative', zIndex: 1 }}>
          <img
            src={data.hero_image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop'}
            alt=""
            style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%`, display: 'block' }}
          />
          {data.logo_url && (
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              <img src={data.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Type & Info Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', fontSize: '10px', color: '#666', position: 'relative', zIndex: 1 }}>
          <span>{typeInfo.name} Type · {data.city || 'Local'}{data.state ? `, ${data.state}` : ''}</span>
          <span>No. 001 · {ind ? 'Solo' : 'Business'}</span>
        </div>

        {/* Attacks (Services) */}
        <div style={{ padding: '4px 8px', position: 'relative', zIndex: 1 }}>
          {services.slice(0, 4).map((s, i) => (
            <div key={i} className="poke-attack">
              <div style={{ display: 'flex', gap: '1px' }}>
                {Array.from({ length: Math.min(i + 1, 3) }).map((_, j) => (
                  <span key={j} className="poke-energy" style={{ background: accent }}>{typeInfo.name[0]}</span>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{s.name}</div>
                {s.description && <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>{s.description}</div>}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                {s.price || `${(i + 1) * 30}`}
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="poke-attack">
              <span className="poke-energy" style={{ background: accent }}>{typeInfo.name[0]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Tackle</div>
                <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>A basic but effective approach</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>40</div>
            </div>
          )}
        </div>

        {/* Weakness / Resistance / Retreat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #ccc', padding: '8px', fontSize: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px' }}>weakness</div>
            <div>🔥 ×2</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px' }}>resistance</div>
            <div>🛡️ -30</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px' }}>retreat cost</div>
            <div>
              <span className="poke-energy" style={{ background: '#aaa', width: '14px', height: '14px' }}>⚪</span>
            </div>
          </div>
        </div>

        {/* Pokédex Entry (Description) */}
        <div style={{ padding: '8px', fontSize: '10px', fontStyle: 'italic', color: '#555', borderTop: '1px solid #ccc', lineHeight: '1.5', position: 'relative', zIndex: 1 }}>
          {data.description || `${data.business_name} is known throughout ${data.city || 'the region'} for providing exceptional ${data.category || 'services'}. Trainers come from far and wide.`}
        </div>

        {/* Card Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 2px', fontSize: '8px', color: '#999', position: 'relative', zIndex: 1 }}>
          <span>Illus. AutoLocal.ai</span>
          <span>©{new Date().getFullYear()} {data.business_name}</span>
          <span>001/001 ★</span>
        </div>
      </div>

      {/* CTA Button Below Card */}
      <a
        href={data.phone ? `tel:${data.phone}` : (data.cta_url || '#')}
        style={{
          display: 'inline-block',
          marginTop: '24px',
          padding: '14px 40px',
          background: accent,
          color: '#fff',
          borderRadius: '50px',
          fontWeight: 'bold',
          fontSize: '16px',
          textDecoration: 'none',
          boxShadow: `0 4px 20px ${accent}66`,
          transition: 'all 0.2s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {data.phone ? (ind ? '📱 Call Me' : '📱 Call Us') : getCtaButtonText(data)}
      </a>

      {/* Reviews as Trainer Tips */}
      {reviews.length > 0 && (
        <div style={{ maxWidth: '420px', width: '100%', marginTop: '24px' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>⚡ Trainer Reviews</div>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>{r.author}</span>
                <span style={{ color: '#ffd700', fontSize: '11px' }}>{'★'.repeat(r.rating)}</span>
              </div>
              <div style={{ color: '#ccc', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>&quot;{r.text}&quot;</div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery as Additional Cards */}
      {galleryImages.length > 0 && (
        <div style={{ maxWidth: '420px', width: '100%', marginTop: '24px' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>🃏 Card Collection</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {galleryImages.map((img, i) => (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #ffd700', aspectRatio: '3/4' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours */}
      {Object.keys(hours).length > 0 && (
        <div style={{ maxWidth: '420px', width: '100%', marginTop: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>🕐 Gym Hours</div>
          {daysOrder.map(day => hours[day] ? (
            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ccc', fontSize: '12px' }}>
              <span>{dayLabels[day]}</span>
              <span>{hours[day]}</span>
            </div>
          ) : null)}
        </div>
      )}

      {/* Contact */}
      <div style={{ maxWidth: '420px', width: '100%', marginTop: '16px', textAlign: 'center', padding: '16px', color: '#888', fontSize: '11px' }}>
        {data.address && <div>📍 {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</div>}
        {data.phone && <div style={{ marginTop: '4px' }}>📞 {data.phone}</div>}
        {(data.contact_email || data.email) && <div style={{ marginTop: '4px' }}>✉️ {data.contact_email || data.email}</div>}
        <div style={{ marginTop: '12px', color: '#555', fontSize: '9px' }}>Powered by AutoLocal.ai</div>
      </div>

      <StickyContactBar data={data} />
    </div>
  )
}
