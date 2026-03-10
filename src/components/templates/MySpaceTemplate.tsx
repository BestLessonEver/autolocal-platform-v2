/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

export default function MySpaceTemplate({ data }: TemplateProps) {
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const gallery = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const profilePhoto = gallery[0] || data.hero_image_url  // 2nd photo = profile pic
  const blurbPhotos = [data.hero_image_url, ...gallery.slice(1)].filter(Boolean) as string[]  // hero + rest (skip profile pic)
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
      `}} />

      {/* ═══ Top Header Bar ═══ */}
      <div style={{ background: '#003366', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '20px', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>mAIspace</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>a space for businesses</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#cde', fontSize: '10px' }}>Search Users:</span>
          <input type="text" style={{ padding: '2px 4px', fontSize: '10px', border: '1px solid #666', width: '140px' }} readOnly />
          <span style={{ background: '#789', color: '#fff', padding: '2px 8px', fontSize: '10px', border: '1px outset #aaa', cursor: 'pointer' }}>Search</span>
          <span style={{ color: '#9cc', fontSize: '10px', marginLeft: '12px' }}>Help</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>|</span>
          <span style={{ color: '#9cc', fontSize: '10px' }}>SignOut</span>
        </div>
      </div>

      {/* ═══ Nav Links Bar ═══ */}
      <div style={{ background: '#6699bb', padding: '3px 20px', display: 'flex', gap: '4px', fontSize: '10px', borderBottom: '1px solid #4a7a9a' }}>
        <span style={{ color: '#fff' }}>🏠</span>
        {['Home', 'Browse', 'Search', 'Messages', 'Blog', 'Bulletins', 'Forum', 'Music Charts', 'Favorites', 'Invite', 'Groups', 'About'].map(item => (
          <span key={item} style={{ color: '#fff', cursor: 'pointer', borderRight: '1px solid #88aabb', paddingRight: '6px' }}>{item}</span>
        ))}
      </div>

      {/* ═══ Main Content Area ═══ */}
      <div style={{ maxWidth: '960px', margin: '8px auto', background: '#fff', padding: '0' }}>
        {/* Profile Name + Edit */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{data.business_name}</h1>
          <div style={{ border: '1px solid #ccc', padding: '8px 24px', fontSize: '11px', color: '#666' }}>Edit Your Profile</div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex' }}>
          {/* ═══ Left Column ═══ */}
          <div style={{ width: '340px', flexShrink: 0, padding: '8px 12px', borderRight: '1px solid #eee' }}>
            {/* edit photo link */}
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>[edit photo]</div>

            {/* Profile Photo + Online Status */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '180px', flexShrink: 0 }}>
                <img
                  src={profilePhoto || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=240&fit=crop'}
                  alt=""
                  style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%` }}
                />
              </div>
              <div style={{ fontSize: '10px', paddingTop: '4px' }}>
                <div style={{ marginBottom: '4px', color: '#888' }}>[edit]</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#0a0', fontSize: '8px' }}>●</span>
                  <span style={{ fontWeight: 'bold', color: '#0a0' }}>ONLINE!</span>
                </div>
                {data.google_rating && (
                  <div style={{ marginTop: '6px', color: '#666' }}>
                    ⭐ {data.google_rating}/5 ({data.google_review_count || 0} reviews)
                  </div>
                )}
                {data.logo_url && (
                  <img src={data.logo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginTop: '8px' }} />
                )}
              </div>
            </div>

            {/* Mood */}
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>
              <strong>Mood:</strong> {data.google_rating && data.google_rating >= 4 ? 'Thriving! 🔥' : 'Open for business ✨'} [edit]
            </div>

            {/* View my links */}
            <div style={{ fontSize: '11px', marginBottom: '8px' }}>
              <strong>View my:</strong> <span className="ms-link">Blog</span> | <span className="ms-link">Bulletins</span> | <span className="ms-link">Forum Topics</span>
            </div>

            {/* Contacting Section */}
            <div className="ms-section">
              <div className="ms-sh">Contacting {data.business_name}</div>
              <table className="ms-contact-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td>🟢 <a href={data.cta_url || '#'}>Add to Friends</a></td>
                    <td>⭐ <a href="#">Add to Favorites</a></td>
                  </tr>
                  {(email || data.phone) && (
                    <tr>
                      {email && <td>💌 <a href={`mailto:${email}`}>Send Message</a></td>}
                      {data.phone && <td>📞 <a href={`tel:${data.phone}`}>{data.phone}</a></td>}
                    </tr>
                  )}
                  <tr>
                    <td>💬 Instant Message</td>
                    <td>🚫 Block User</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* URL Section */}
            <div style={{ border: '1px solid #ccc', padding: '6px 8px', marginBottom: '8px', fontSize: '11px' }}>
              <div><strong>mAIspace URL:</strong></div>
              <div style={{ color: '#36c', wordBreak: 'break-all' }}>maispace.com/{data.slug || 'profile'}</div>
              <div style={{ color: '#888', fontSize: '10px' }}>[edit]</div>
            </div>

            {/* Interests — Services as table */}
            {services.length > 0 && (
              <div className="ms-section">
                <div className="ms-sh-orange">{data.business_name}&apos;s Interests</div>
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
                <div style={{ padding: '4px 8px', fontSize: '10px', color: '#888' }}>[edit]</div>
              </div>
            )}

            {/* Links section */}
            <div className="ms-section">
              <div className="ms-sh-orange">{data.business_name}&apos;s Links</div>
              <div style={{ padding: '6px 8px', fontSize: '11px' }}>
                {data.website_current && <div>🌐 <span className="ms-link">{data.website_current}</span></div>}
                {data.address && <div style={{ marginTop: '4px' }}>📍 {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</div>}
                <div style={{ marginTop: '4px', color: '#888', fontSize: '10px' }}>[edit]</div>
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
          </div>

          {/* ═══ Right Column — Blurbs + Photos ═══ */}
          <div style={{ flex: 1, padding: '8px 12px', minWidth: 0 }}>
            {/* Blog Entries header */}
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              {data.business_name}&apos;s Latest Blog Entries [<span className="ms-link">View Blog</span>]
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '12px', fontStyle: 'italic' }}>
              There are no Blog Entries yet.
            </div>

            {/* Blurbs Section — About + Photos */}
            <div className="ms-section">
              <div className="ms-sh-orange">{data.business_name}&apos;s Blurbs</div>
              <div style={{ padding: '8px' }}>
                {/* About me */}
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>About me:</div>
                <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6', marginBottom: '12px' }}>
                  {data.description || `Welcome to ${data.business_name}! The best ${data.category || 'business'} in ${data.city || 'town'}.`}
                </div>

                {/* Photos scattered in the blurb — large, varied sizes like real MySpace */}
                {blurbPhotos.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {blurbPhotos.slice(0, 3).map((img, i) => (
                      <div key={i} style={{ maxWidth: i === 0 ? '100%' : i === 1 ? '60%' : '75%', alignSelf: i === 1 ? 'flex-start' : i === 2 ? 'center' : 'stretch' }}>
                        <img src={img} alt="" style={{ width: '100%', objectFit: 'cover', border: '1px solid #ccc', ...(i === 0 && img === data.hero_image_url ? { objectPosition: `center ${data.hero_crop ?? 50}%` } : {}) }} />
                      </div>
                    ))}
                    {blurbPhotos.length > 3 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {blurbPhotos.slice(3, 9).map((img, i) => (
                          <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #ccc' }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Who I'd like to meet */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {ind ? "Who I'd like to meet:" : 'Who we\'d like to meet:'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6' }}>
                    Anyone looking for the best {data.category || 'services'} in {data.city || 'town'}! Come visit us — you won&apos;t be disappointed. ✨
                  </div>
                </div>
              </div>
            </div>

            {/* Friends (Top 8) — small thumbnails */}
            <div className="ms-section">
              <div className="ms-sh">{data.business_name}&apos;s Friend Space (<span className="ms-link">{reviews.length || visitors} friends</span>)</div>
              <div style={{ padding: '8px' }}>
                {reviews.length > 0 ? (
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
                ) : (
                  <div style={{ fontSize: '10px', color: '#888' }}>Add friends to fill up your space!</div>
                )}
              </div>
            </div>

            {/* Comments (Reviews) */}
            {reviews.length > 0 && (
              <div className="ms-section">
                <div className="ms-sh">{data.business_name}&apos;s Comments</div>
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                    Displaying <strong>{reviews.length}</strong> of {reviews.length} comments
                  </div>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '50px', flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: `hsl(${(i * 73) % 360}, 40%, 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {r.author?.charAt(0) || '?'}
                        </div>
                        <div className="ms-link" style={{ fontSize: '9px', marginTop: '2px' }}>{r.author?.split(' ')[0]}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                          {r.date || 'Posted recently'} — {'⭐'.repeat(r.rating)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.5' }}>
                          &quot;{r.text}&quot;
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
        <div>©2025 mAIspace. All Rights Reserved.</div>
      </div>
    </div>
  )
}
