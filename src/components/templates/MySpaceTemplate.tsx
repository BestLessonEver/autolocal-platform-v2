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
  const accent = data.brand_color_accent || '#3b5998'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

  // Classic MySpace blue palette
  const blue = '#003471'
  const blueDark = '#00254d'
  const blueLight = '#5b8fb9'
  const blueLink = '#003471'
  const orangeHeader = '#f08c00'

  return (
    <div className="min-h-screen" style={{ background: '#c4cde0', fontFamily: 'Verdana, Arial, sans-serif', fontSize: '11px', color: '#000' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-link { color: ${blueLink}; text-decoration: underline; cursor: pointer; }
        .ms-link:hover { color: #0066cc; }
        .ms-section { background: #fff; border: 1px solid #b5c7de; margin-bottom: 8px; }
        .ms-section-header { background: ${blue}; color: #fff; padding: 5px 8px; font-weight: bold; font-size: 11px; border-bottom: 1px solid ${blueDark}; }
        .ms-section-header-orange { background: #f6a400; color: #fff; padding: 5px 8px; font-weight: bold; font-size: 11px; border-bottom: 1px solid ${orangeHeader}; }
        .ms-online { color: #00b300; font-size: 10px; }
        .ms-comment { background: #f5f5f5; border: 1px solid #ddd; padding: 8px; margin-bottom: 6px; }
      `}} />

      {/* Top Nav Bar — classic blue */}
      <div style={{ background: `linear-gradient(180deg, ${blue} 0%, ${blueDark} 100%)`, padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #002244' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '16px', letterSpacing: '-0.5px' }}>yourspace.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input type="text" placeholder="Search" style={{ padding: '2px 6px', fontSize: '10px', border: '1px solid #999', borderRadius: '2px', width: '140px' }} readOnly />
          <span style={{ background: '#999', color: '#fff', padding: '2px 8px', fontSize: '10px', borderRadius: '2px', cursor: 'pointer' }}>Search</span>
        </div>
      </div>

      {/* Secondary Nav */}
      <div style={{ background: blue, padding: '3px 16px', display: 'flex', gap: '16px', fontSize: '10px', borderBottom: '1px solid #002244' }}>
        {['Home', 'Mail (2) ▾', 'Profile ▾', 'Friends ▾', 'Music', 'Video', 'More ▾'].map(item => (
          <span key={item} style={{ color: '#fff', cursor: 'pointer' }}>{item}</span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#aaccee', cursor: 'pointer', fontSize: '10px' }}>My Account</span>
        <span style={{ color: '#aaccee', cursor: 'pointer', fontSize: '10px' }}>Sign Out</span>
      </div>

      {/* Profile Header */}
      <div style={{ background: '#fff', padding: '8px 16px', maxWidth: '960px', margin: '0 auto', borderBottom: '1px solid #ccc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#000' }}>Hello, {ind ? data.business_name.split(' ')[0] : data.business_name}!</h1>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              My URL: <span style={{ fontWeight: 'bold' }}>yourspace.com/{data.slug || data.business_name?.toLowerCase().replace(/\s+/g, '')}</span> [<span className="ms-link">Edit Profile</span>]
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'flex', maxWidth: '960px', margin: '0 auto', gap: '0', background: '#fff' }}>
        {/* Left Column */}
        <div style={{ width: '240px', flexShrink: 0, padding: '8px', borderRight: '1px solid #ddd' }}>
          {/* Profile Photo */}
          <div style={{ marginBottom: '8px' }}>
            <img
              src={data.hero_image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop'}
              alt=""
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%`, border: '1px solid #999' }}
            />
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <div style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>&quot;{data.tagline || data.business_name}&quot;</div>
              {data.logo_url && (
                <img src={data.logo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '6px auto', display: 'block', objectFit: 'cover' }} />
              )}
              <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                {ind ? 'Profile' : 'Business'} · {data.city || 'Somewhere'}, {data.state || 'US'}
              </div>
            </div>
          </div>

          {/* Profile Views & Last Login */}
          <div style={{ fontSize: '10px', color: '#333', padding: '4px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', marginBottom: '8px' }}>
            <div><strong>Profile Views:</strong> {data.google_review_count ? data.google_review_count * 47 : 1337}</div>
            <div><strong>Last Login:</strong> Today</div>
          </div>

          {/* Links */}
          <div style={{ fontSize: '10px', marginBottom: '8px', lineHeight: '1.8' }}>
            <div><span className="ms-link">Photos:</span> Edit | Upload</div>
            <div><span className="ms-link">Videos:</span> Edit | Upload</div>
            <div className="ms-link">Manage Blog</div>
            <div className="ms-link">Manage Reviews</div>
          </div>

          {/* Contact Table */}
          <div className="ms-section">
            <div className="ms-section-header">Contacting {ind ? 'Me' : 'Us'}</div>
            <div style={{ padding: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {data.phone && (
                    <tr>
                      <td style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                        <a href={`tel:${data.phone}`} className="ms-link" style={{ fontSize: '11px' }}>📞 {ind ? 'Call Me' : 'Call Us'}</a>
                      </td>
                    </tr>
                  )}
                  {(data.contact_email || data.email) && (
                    <tr>
                      <td style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                        <a href={`mailto:${data.contact_email || data.email}`} className="ms-link" style={{ fontSize: '11px' }}>✉️ Send Message</a>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '4px 0' }}>
                      <a href={data.cta_url || '#'} className="ms-link" style={{ fontSize: '11px', color: blue, fontWeight: 'bold' }}>⭐ Add to Friends</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts box */}
          <div className="ms-section">
            <div className="ms-section-header-orange">Alerts</div>
            <div style={{ padding: '6px', fontSize: '10px' }}>
              {data.google_rating && <div>⭐ Rated {data.google_rating}/5 on Google{data.google_review_count ? ` (${data.google_review_count} reviews)` : ''}</div>}
              <div className="ms-online" style={{ marginTop: '4px' }}>● Online Now!</div>
            </div>
          </div>

          {/* URL Info */}
          {data.website_current && (
            <div style={{ padding: '4px 0', color: '#666', fontSize: '9px', wordBreak: 'break-all' }}>
              🔗 {data.website_current}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, padding: '8px', minWidth: 0, background: '#fff' }}>
          {/* About Me */}
          {data.description && (
            <div className="ms-section">
              <div className="ms-section-header">About {ind ? 'Me' : 'Us'}</div>
              <div style={{ padding: '8px', color: '#333', lineHeight: '1.6' }}>
                {data.description}
              </div>
            </div>
          )}

          {/* Who I'd Like to Meet */}
          <div className="ms-section">
            <div className="ms-section-header">{ind ? "Who I'd Like to Meet" : 'Our Ideal Customers'}</div>
            <div style={{ padding: '8px', color: '#333', lineHeight: '1.6' }}>
              Anyone looking for the best {data.category || 'services'} in {data.city || 'town'}!
              {data.address && <div style={{ marginTop: '4px', color: '#666' }}>📍 {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</div>}
            </div>
          </div>

          {/* Interests (Services) */}
          {services.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">{ind ? 'My Services' : 'Our Services'}</div>
              <div style={{ padding: '8px' }}>
                {services.map((s, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <span style={{ color: blue, fontWeight: 'bold' }}>{s.name}</span>
                    {s.price && <span style={{ color: '#666', marginLeft: '8px' }}>{s.price}</span>}
                    {s.description && <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>{s.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 8 Friends (Gallery) */}
          {galleryImages.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-header">{data.business_name}&apos;s Top {Math.min(galleryImages.length, 8)} Friends</div>
              <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {galleryImages.slice(0, 8).map((img, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: '1px solid #ccc' }} />
                    <div className="ms-link" style={{ fontSize: '9px', marginTop: '2px' }}>Friend #{i + 1}</div>
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
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>{dayLabels[day]}</span>
                    <span style={{ color: '#333' }}>{hours[day]}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

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
                      <span style={{ color: '#999', fontSize: '9px' }}>{r.date || 'Posted recently'}</span>
                    </div>
                    <div style={{ color: '#333' }}>&quot;{r.text}&quot;</div>
                    <div style={{ color: '#f90', fontSize: '9px', marginTop: '4px' }}>{'⭐'.repeat(r.rating)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Rating */}
          {data.google_rating && (
            <div style={{ textAlign: 'center', padding: '8px', color: '#666', fontSize: '10px' }}>
              ★ {data.google_rating} stars{data.google_review_count >= 20 ? ` · ${data.google_review_count} reviews on Google` : ' on Google'}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: blue, textAlign: 'center', padding: '12px', borderTop: '2px solid #002244' }}>
        <div style={{ color: '#aaccee', fontSize: '9px', marginBottom: '4px' }}>
          ☆ Thank you for visiting! ☆
        </div>
        <div style={{ display: 'inline-block', background: '#fff', border: '1px solid #999', padding: '2px 8px', fontSize: '10px', color: '#333' }}>
          Visitors: {data.google_review_count ? data.google_review_count * 47 : 1337}
        </div>
        <div style={{ color: '#5b8fb9', fontSize: '8px', marginTop: '8px' }}>
          Powered by AutoLocal.ai
        </div>
      </div>

      <StickyContactBar data={data} />
    </div>
  )
}
