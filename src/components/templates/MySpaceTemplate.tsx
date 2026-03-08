/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

export default function MySpaceTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const galleryImages = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const hours = data.hours ?? {}
  const ind = data.site_mode === 'individual'
  const accent = data.brand_color_accent || '#ff00ff'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

  return (
    <div className="min-h-screen text-gray-200" style={{ background: '#000', fontFamily: 'Verdana, Arial, sans-serif', fontSize: '11px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-link { color: #5599ff; text-decoration: underline; cursor: pointer; }
        .ms-link:hover { color: #ff66cc; }
        .ms-header { background: linear-gradient(180deg, #003366 0%, #001a33 100%); color: white; padding: 8px 12px; font-weight: bold; font-size: 13px; border-bottom: 2px solid ${accent}; }
        .ms-section { background: #1a1a2e; border: 1px solid #333; margin-bottom: 8px; }
        .ms-section-header { background: #0d0d1a; color: ${accent}; padding: 4px 8px; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; }
        .ms-online { color: #00ff00; font-size: 10px; }
        .ms-player { background: #111; border: 1px solid #444; padding: 6px 10px; display: flex; align-items: center; gap: 8px; }
        .ms-glitter { background: linear-gradient(90deg, transparent, ${accent}44, transparent); height: 2px; margin: 8px 0; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .ms-blink { animation: blink 1.5s infinite; }
        .ms-comment { background: #111; border: 1px solid #2a2a2a; padding: 8px; margin-bottom: 6px; }
      `}} />

      {/* Nav Bar */}
      <div style={{ background: '#003', borderBottom: `2px solid ${accent}`, padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>MySpace</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
          <span className="ms-link">Home</span>
          <span className="ms-link">Browse</span>
          <span className="ms-link">Search</span>
          <span className="ms-link">Mail</span>
          <span className="ms-link">Blog</span>
        </div>
      </div>

      {/* Music Player */}
      <div className="ms-player">
        <span style={{ color: '#888', fontSize: '10px' }}>▶</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#ccc', fontSize: '10px' }}>♫ Now Playing</div>
          <div style={{ color: accent, fontSize: '11px', fontWeight: 'bold' }}>{data.business_name} — Theme Song</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', color: '#666', fontSize: '12px' }}>
          <span>⏮</span><span>⏸</span><span>⏭</span>
        </div>
        <div style={{ width: '80px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '35%', height: '100%', background: accent }} />
        </div>
      </div>

      {/* Profile Header */}
      <div className="ms-header">
        {data.business_name}
        <span className="ms-online ms-blink" style={{ marginLeft: '8px' }}>● Online Now!</span>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'flex', maxWidth: '960px', margin: '0 auto', gap: '0' }}>
        {/* Left Column */}
        <div style={{ width: '240px', flexShrink: 0, padding: '8px' }}>
          {/* Profile Photo */}
          <div className="ms-section">
            <div style={{ padding: '4px' }}>
              <img
                src={data.hero_image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop'}
                alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%`, border: `2px solid ${accent}` }}
              />
            </div>
            <div style={{ padding: '6px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>&quot;{data.tagline || data.business_name}&quot;</div>
              {data.logo_url && (
                <img src={data.logo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '6px auto', display: 'block', objectFit: 'cover' }} />
              )}
              <div style={{ color: '#999', fontSize: '10px', marginTop: '4px' }}>
                {ind ? 'Female' : 'Business'} / {data.city || 'Somewhere'}, {data.state || 'US'}
              </div>
              <div style={{ color: '#666', fontSize: '9px', marginTop: '2px' }}>
                Last Login: Today
              </div>
            </div>
          </div>

          {/* Mood */}
          <div className="ms-section">
            <div className="ms-section-header">Mood</div>
            <div style={{ padding: '6px', color: '#ccc' }}>
              {data.google_rating ? `Feeling ⭐ ${data.google_rating}/5` : 'Feeling great! 😊'}
            </div>
          </div>

          {/* Contact Table */}
          <div className="ms-section">
            <div className="ms-section-header">Contacting {ind ? 'Me' : 'Us'}</div>
            <div style={{ padding: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {data.phone && (
                    <tr>
                      <td style={{ padding: '4px', borderBottom: '1px solid #222' }}>
                        <a href={`tel:${data.phone}`} className="ms-link" style={{ fontSize: '11px' }}>📞 {ind ? 'Call Me' : 'Call Us'}</a>
                      </td>
                    </tr>
                  )}
                  {(data.contact_email || data.email) && (
                    <tr>
                      <td style={{ padding: '4px', borderBottom: '1px solid #222' }}>
                        <a href={`mailto:${data.contact_email || data.email}`} className="ms-link" style={{ fontSize: '11px' }}>✉️ Send Message</a>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '4px' }}>
                      <a href={data.cta_url || '#'} className="ms-link" style={{ fontSize: '11px', color: accent }}>⭐ Add to Friends</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* View My */}
          <div style={{ padding: '6px', color: '#888', fontSize: '10px', textAlign: 'center' }}>
            View My: <span className="ms-link">Pics</span> | <span className="ms-link">Videos</span> | <span className="ms-link">Blog</span>
          </div>

          {/* URL Info */}
          {data.website_current && (
            <div style={{ padding: '4px 6px', color: '#666', fontSize: '9px', wordBreak: 'break-all' }}>
              🔗 {data.website_current}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, padding: '8px', minWidth: 0 }}>
          {/* About Me */}
          {data.description && (
            <div className="ms-section">
              <div className="ms-section-header">About {ind ? 'Me' : 'Us'}</div>
              <div style={{ padding: '8px', color: '#ccc', lineHeight: '1.6' }}>
                {data.description}
              </div>
            </div>
          )}

          <div className="ms-glitter" />

          {/* Who I'd Like to Meet */}
          <div className="ms-section">
            <div className="ms-section-header">{ind ? 'Who I&apos;d Like to Meet' : 'Our Ideal Customers'}</div>
            <div style={{ padding: '8px', color: '#ccc', lineHeight: '1.6' }}>
              Anyone looking for the best {data.category || 'services'} in {data.city || 'town'}!
              {data.address && <div style={{ marginTop: '4px', color: '#888' }}>📍 {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</div>}
            </div>
          </div>

          {/* Interests (Services) */}
          {services.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">{ind ? 'My Services' : 'Our Services'}</div>
              <div style={{ padding: '8px' }}>
                {services.map((s, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <span style={{ color: accent, fontWeight: 'bold' }}>{s.name}</span>
                    {s.price && <span style={{ color: '#888', marginLeft: '8px' }}>{s.price}</span>}
                    {s.description && <div style={{ color: '#999', fontSize: '10px', marginTop: '2px' }}>{s.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ms-glitter" />

          {/* Top 8 Friends (Gallery) */}
          {galleryImages.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">{data.business_name}&apos;s Top {Math.min(galleryImages.length, 8)} Friends</div>
              <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {galleryImages.slice(0, 8).map((img, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: `1px solid ${accent}` }} />
                    <div style={{ color: '#5599ff', fontSize: '9px', marginTop: '2px' }}>Friend #{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hours */}
          {Object.keys(hours).length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">Hours</div>
              <div style={{ padding: '8px' }}>
                {daysOrder.map(day => hours[day] ? (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #1a1a1a' }}>
                    <span style={{ color: '#999' }}>{dayLabels[day]}</span>
                    <span style={{ color: '#ccc' }}>{hours[day]}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          <div className="ms-glitter" />

          {/* Comments (Reviews) */}
          {reviews.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">
                {data.business_name}&apos;s Comments ({reviews.length})
              </div>
              <div style={{ padding: '8px' }}>
                {reviews.map((r, i) => (
                  <div key={i} className="ms-comment">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="ms-link" style={{ fontWeight: 'bold' }}>{r.author}</span>
                      <span style={{ color: '#666', fontSize: '9px' }}>{r.date || 'Posted recently'}</span>
                    </div>
                    <div style={{ color: '#ccc' }}>&quot;{r.text}&quot;</div>
                    <div style={{ color: '#888', fontSize: '9px', marginTop: '4px' }}>{'⭐'.repeat(r.rating)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Rating */}
          {data.google_rating && (
            <div style={{ textAlign: 'center', padding: '8px', color: '#888', fontSize: '10px' }}>
              ★ {data.google_rating} stars{data.google_review_count >= 20 ? ` · ${data.google_review_count} reviews on Google` : ' on Google'}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Visitor Counter */}
      <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #222' }}>
        <div style={{ color: '#666', fontSize: '9px', marginBottom: '4px' }}>
          ☆ Thank you for visiting! ☆
        </div>
        <div style={{ display: 'inline-block', background: '#111', border: '1px solid #333', padding: '2px 8px', fontSize: '10px', color: '#0f0', fontFamily: 'monospace' }}>
          Visitors: {data.google_review_count ? data.google_review_count * 47 : 1337}
        </div>
        <div style={{ color: '#444', fontSize: '8px', marginTop: '8px' }}>
          Powered by AutoLocal.ai
        </div>
      </div>

      <StickyContactBar data={data} />
    </div>
  )
}
