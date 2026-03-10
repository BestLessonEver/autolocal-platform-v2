/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

export default function MySpaceTemplate({ data }: TemplateProps) {
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const gallery = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const profilePhoto = gallery[0] || data.hero_image_url
  const blurbPhotos = [data.hero_image_url, ...gallery.slice(1)].filter(Boolean) as string[]
  const hours = data.hours ?? {}
  const ind = data.site_mode === 'individual'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
  const visitors = data.google_review_count ? data.google_review_count * 47 : 1337
  const email = data.contact_email || data.email

  return (
    <div className="min-h-screen" style={{ background: '#b2c9d6', fontFamily: 'Verdana, Arial, sans-serif', fontSize: '11px', color: '#000' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-link { color: #36c; text-decoration: underline; cursor: pointer; font-size: 11px; }
        .ms-link:hover { color: #14a; }
        .ms-section { background: #fff; border: 1px solid #b5c7de; margin-bottom: 8px; }
        .ms-sh { background: #5a8ab5; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 11px; }
        .ms-sh-orange { background: #f4a300; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 11px; }
        .ms-interests td { padding: 3px 8px; border-bottom: 1px solid #eee; font-size: 11px; vertical-align: top; }
        .ms-interests td:first-child { font-weight: bold; color: #5a8ab5; width: 90px; }
        .ms-contact-table td { padding: 3px 6px; font-size: 11px; }
        .ms-contact-table a { color: #36c; text-decoration: none; }
        @media (max-width: 639px) {
          .ms-desktop-cols { flex-direction: column !important; }
          .ms-left-col { width: 100% !important; border-right: none !important; border-bottom: 1px solid #eee; }
          .ms-right-col { width: 100% !important; }
          .ms-profile-row { flex-direction: column !important; align-items: center !important; text-align: center; }
          .ms-profile-row > div:first-child { width: 200px !important; }
          .ms-profile-img { height: 220px !important; border-radius: 6px; }
          .ms-nav-links { display: none !important; }
          .ms-header-search { display: none !important; }
          .ms-header { justify-content: center !important; }
        }
      `}} />

      {/* ═══ Top Header Bar ═══ */}
      <div className="ms-header" style={{ background: '#003366', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '20px', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>mAIspace</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>a space for businesses</span>
        </div>
        <div className="ms-header-search" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#cde', fontSize: '10px' }}>Search Users:</span>
          <input type="text" style={{ padding: '2px 4px', fontSize: '10px', border: '1px solid #666', width: '140px' }} readOnly />
          <span style={{ background: '#789', color: '#fff', padding: '2px 8px', fontSize: '10px', border: '1px outset #aaa', cursor: 'pointer' }}>Search</span>
          <span style={{ color: '#9cc', fontSize: '10px', marginLeft: '12px' }}>Help</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>|</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>SignOut</span>
        </div>
      </div>

      {/* ═══ Nav Links Bar ═══ */}
      <div className="ms-nav-links" style={{ background: '#6699bb', padding: '3px 20px', display: 'flex', gap: '4px', fontSize: '10px', borderBottom: '1px solid #4a7a9a' }}>
        <span style={{ color: '#fff' }}>🏠</span>
        {['Home', 'Browse', 'Search', 'Messages', 'Blog', 'Bulletins', 'Forum', 'Music Charts', 'Favorites', 'Invite', 'Groups', 'About'].map(item => (
          <span key={item} style={{ color: '#fff', cursor: 'pointer', borderRight: '1px solid #88aabb', paddingRight: '6px' }}>{item}</span>
        ))}
      </div>

      {/* ═══ Main Content Area ═══ */}
      <div style={{ maxWidth: '960px', margin: '8px auto', background: '#fff', padding: '0' }}>
        {/* Profile Name */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{data.business_name}</h1>
        </div>

        {/* Two Column Layout — stacks on mobile */}
        <div className="ms-desktop-cols" style={{ display: 'flex' }}>
          {/* ═══ Left Column ═══ */}
          <div className="ms-left-col" style={{ width: '340px', flexShrink: 0, padding: '8px 12px', borderRight: '1px solid #eee' }}>

            {/* Profile Photo + Online Status */}
            <div className="ms-profile-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '180px', flexShrink: 0 }}>
                <img
                  className="ms-profile-img"
                  src={profilePhoto || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=240&fit=crop'}
                  alt=""
                  style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%` }}
                />
              </div>
              <div style={{ fontSize: '10px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ color: '#0a0', fontSize: '8px' }}>●</span>
                  <span style={{ fontWeight: 'bold', color: '#0a0' }}>ONLINE!</span>
                </div>
                {data.google_rating && (
                  <div style={{ color: '#666', marginBottom: '4px' }}>
                    ⭐ {data.google_rating}/5 ({data.google_review_count || 0} reviews)
                  </div>
                )}
                {data.logo_url && (
                  <img src={data.logo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginTop: '4px' }} />
                )}
                {/* Mood — visible on mobile next to photo */}
                <div style={{ marginTop: '6px' }}>
                  <strong>Mood:</strong> {data.google_rating && data.google_rating >= 4 ? '🔥 Thriving!' : '✨ Open'}
                </div>
              </div>
            </div>

            {/* Contacting Section */}
            <div className="ms-section">
              <div className="ms-sh">Contacting {ind ? 'Me' : data.business_name}</div>
              <div style={{ padding: '6px 8px' }}>
                {data.phone && (
                  <div style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                    <a href={`tel:${data.phone}`} className="ms-link">📞 {data.phone}</a>
                  </div>
                )}
                {email && (
                  <div style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                    <a href={`mailto:${email}`} className="ms-link">✉️ Send Message</a>
                  </div>
                )}
                {data.address && (
                  <div style={{ padding: '4px 0', borderBottom: '1px solid #eee', fontSize: '11px' }}>
                    📍 {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}
                  </div>
                )}
                <div style={{ padding: '4px 0' }}>
                  <span className="ms-link" style={{ color: '#003471', fontWeight: 'bold' }}>⭐ Add to Friends</span>
                </div>
              </div>
            </div>

            {/* Hours */}
            {Object.keys(hours).length > 0 && (
              <div className="ms-section">
                <div className="ms-sh">Hours</div>
                <div style={{ padding: '6px 8px' }}>
                  {daysOrder.map(day => hours[day] ? (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                      <span style={{ fontWeight: 'bold', color: '#5a8ab5' }}>{dayLabels[day]}</span>
                      <span>{hours[day]}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Services as Interests */}
            {services.length > 0 && (
              <div className="ms-section">
                <div className="ms-sh-orange">{ind ? 'My' : 'Our'} Interests</div>
                <table className="ms-interests" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {services.map((s, i) => (
                      <tr key={i}>
                        <td>{s.name}</td>
                        <td>{s.description || s.price || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ═══ Right Column — Blurbs + Photos ═══ */}
          <div className="ms-right-col" style={{ flex: 1, padding: '8px 12px', minWidth: 0 }}>

            {/* Blurbs Section — About + Photos */}
            <div className="ms-section">
              <div className="ms-sh-orange">{data.business_name}&apos;s Blurbs</div>
              <div style={{ padding: '8px' }}>
                {/* About me */}
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>About {ind ? 'me' : 'us'}:</div>
                <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6', marginBottom: '12px' }}>
                  {data.description || `Welcome to ${data.business_name}! The best ${data.category || 'business'} in ${data.city || 'town'}.`}
                </div>

                {/* Photos */}
                {blurbPhotos.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Hero photo full width */}
                    {blurbPhotos[0] && (
                      <img
                        src={blurbPhotos[0]}
                        alt=""
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'cover',
                          border: '1px solid #ccc',
                          ...(blurbPhotos[0] === data.hero_image_url ? { objectPosition: `center ${data.hero_crop ?? 50}%` } : {}),
                        }}
                      />
                    )}
                    {/* Grid for remaining */}
                    {blurbPhotos.length > 1 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        {blurbPhotos.slice(1, 7).map((img, i) => (
                          <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #ccc' }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Who I'd like to meet */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {ind ? "Who I'd like to meet:" : "Who we'd like to meet:"}
                  </div>
                  <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6' }}>
                    Anyone looking for the best {data.category || 'services'} in {data.city || 'town'}! Come visit {ind ? 'me' : 'us'} — you won&apos;t be disappointed. ✨
                  </div>
                </div>
              </div>
            </div>

            {/* Friends (Top 8) */}
            {reviews.length > 0 && (
              <div className="ms-section">
                <div className="ms-sh">{data.business_name}&apos;s Friend Space (<span className="ms-link">{reviews.length} friends</span>)</div>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {reviews.slice(0, 8).map((r, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ width: '100%', aspectRatio: '1', background: `hsl(${(i * 47) % 360}, 40%, 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', borderRadius: '2px' }}>
                          {r.author?.charAt(0) || '?'}
                        </div>
                        <div className="ms-link" style={{ fontSize: '9px', marginTop: '2px' }}>{r.author?.split(' ')[0] || `Friend ${i+1}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comments (Reviews) — limited to 4 on display */}
            {reviews.length > 0 && (
              <div className="ms-section">
                <div className="ms-sh">{data.business_name}&apos;s Comments</div>
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                    Displaying <strong>{Math.min(reviews.length, 4)}</strong> of {reviews.length} comments
                  </div>
                  {reviews.slice(0, 4).map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '50px', flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: `hsl(${(i * 73) % 360}, 40%, 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {r.author?.charAt(0) || '?'}
                        </div>
                        <div className="ms-link" style={{ fontSize: '9px', marginTop: '2px' }}>{r.author?.split(' ')[0]}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                          {'⭐'.repeat(r.rating)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.5', wordBreak: 'break-word' }}>
                          &quot;{r.text.length > 200 ? r.text.slice(0, 200) + '...' : r.text}&quot;
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <div style={{ textAlign: 'center', padding: '12px', fontSize: '9px', color: '#667' }}>
        <div>©{new Date().getFullYear()} mAIspace. All Rights Reserved.</div>
        <div style={{ marginTop: '4px' }}>
          <span style={{ color: '#5a8ab5' }}>Visitors: {visitors.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
