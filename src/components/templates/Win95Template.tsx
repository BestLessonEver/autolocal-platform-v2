/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'
import StickyContactBar from './StickyContactBar'

export default function Win95Template({ data }: TemplateProps) {
  const [startOpen, setStartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'gallery' | 'hours' | 'reviews'>('about')
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const galleryImages = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const hours = data.hours ?? {}
  const ind = data.site_mode === 'individual'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div className="min-h-screen relative" style={{ background: '#008080', fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif', fontSize: '11px', color: '#000', cursor: 'default' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .w95-window { background: #c0c0c0; border: 2px outset #dfdfdf; box-shadow: 2px 2px 0px #000; }
        .w95-titlebar { background: #000080; color: white; padding: 2px 4px; display: flex; align-items: center; justify-content: space-between; font-weight: bold; font-size: 11px; user-select: none; }
        .w95-titlebar-btn { width: 16px; height: 14px; background: #c0c0c0; border: 1px outset #dfdfdf; display: flex; align-items: center; justify-content: center; font-size: 8px; cursor: pointer; font-weight: bold; }
        .w95-titlebar-btn:active { border-style: inset; }
        .w95-menubar { background: #c0c0c0; padding: 1px 0; border-bottom: 1px solid #808080; }
        .w95-menubar span { padding: 1px 8px; font-size: 11px; cursor: pointer; }
        .w95-menubar span:hover { background: #000080; color: white; }
        .w95-inset { border: 2px inset #808080; background: #fff; }
        .w95-outset { border: 2px outset #dfdfdf; background: #c0c0c0; }
        .w95-btn { padding: 3px 16px; border: 2px outset #dfdfdf; background: #c0c0c0; font-family: inherit; font-size: 11px; cursor: pointer; }
        .w95-btn:active { border-style: inset; }
        .w95-tab { padding: 3px 12px; border: 2px outset #dfdfdf; border-bottom: none; background: #c0c0c0; cursor: pointer; font-size: 11px; margin-right: -1px; position: relative; }
        .w95-tab-active { background: #c0c0c0; z-index: 1; padding-bottom: 5px; font-weight: bold; }
        .w95-tab-inactive { background: #a0a0a0; top: 2px; }
        .w95-taskbar { position: fixed; bottom: 0; left: 0; right: 0; height: 28px; background: #c0c0c0; border-top: 2px outset #dfdfdf; display: flex; align-items: center; padding: 2px 4px; z-index: 50; }
        .w95-start { border: 2px outset #dfdfdf; background: #c0c0c0; padding: 2px 8px; display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 11px; cursor: pointer; height: 22px; }
        .w95-start:active { border-style: inset; }
        .w95-clock { border: 1px inset #808080; padding: 2px 8px; font-size: 11px; margin-left: auto; }
        .w95-start-menu { position: fixed; bottom: 28px; left: 4px; z-index: 51; background: #c0c0c0; border: 2px outset #dfdfdf; min-width: 180px; box-shadow: 2px 2px 0px #000; }
        .w95-start-item { padding: 6px 12px 6px 36px; cursor: pointer; font-size: 11px; display: flex; align-items: center; gap: 8px; }
        .w95-start-item:hover { background: #000080; color: white; }
        .w95-start-sidebar { position: absolute; left: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(180deg, #000080, #1084d0); writing-mode: vertical-rl; color: white; font-weight: bold; font-size: 18px; display: flex; align-items: center; justify-content: flex-end; padding-bottom: 8px; letter-spacing: 2px; }
        .w95-checkbox { width: 13px; height: 13px; border: 2px inset #808080; background: white; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; }
      `}} />

      {/* Desktop Icons */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'absolute', top: 0, left: 8 }}>
        {[
          { icon: '💻', label: 'My Computer' },
          { icon: '📁', label: 'My Documents' },
          { icon: '🌐', label: 'Internet' },
          { icon: '🗑️', label: 'Recycle Bin' },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center', width: '64px', cursor: 'pointer' }}>
            <div style={{ fontSize: '32px', textShadow: '1px 1px 0 #004040' }}>{item.icon}</div>
            <div style={{ color: 'white', fontSize: '11px', textShadow: '1px 1px 0 #000', marginTop: '2px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Main Window */}
      <div className="w95-window" style={{ maxWidth: '720px', margin: '24px auto', marginBottom: '48px' }}>
        <div className="w95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {data.logo_url && <img src={data.logo_url} alt="" style={{ width: '16px', height: '16px', objectFit: 'cover' }} />}
            <span>{data.business_name} — Properties</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <div className="w95-titlebar-btn">_</div>
            <div className="w95-titlebar-btn">□</div>
            <div className="w95-titlebar-btn">✕</div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="w95-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>

        {/* Hero Image */}
        {data.hero_image_url && (
          <div style={{ padding: '8px 8px 0 8px' }}>
            <div className="w95-inset" style={{ padding: '2px' }}>
              <img
                src={data.hero_image_url}
                alt=""
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%`, display: 'block' }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ padding: '8px 8px 0 8px', display: 'flex', alignItems: 'flex-end' }}>
          {[
            { id: 'about' as const, label: 'About' },
            { id: 'services' as const, label: 'Services' },
            { id: 'gallery' as const, label: 'Gallery' },
            { id: 'hours' as const, label: 'Hours' },
            { id: 'reviews' as const, label: 'Reviews' },
          ].map(tab => (
            <div
              key={tab.id}
              className={`w95-tab ${activeTab === tab.id ? 'w95-tab-active' : 'w95-tab-inactive'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ margin: '0 8px 8px 8px', border: '2px inset #808080', background: '#c0c0c0', padding: '12px', minHeight: '300px' }}>
          {activeTab === 'about' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                {data.logo_url && (
                  <img src={data.logo_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1px solid #808080' }} />
                )}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.business_name}</div>
                  {data.tagline && <div style={{ color: '#444', marginTop: '2px' }}>{data.tagline}</div>}
                  {data.google_rating && (
                    <div style={{ marginTop: '4px', color: '#000080' }}>
                      ★ {data.google_rating}/5{data.google_review_count >= 20 ? ` (${data.google_review_count} reviews)` : ''}
                    </div>
                  )}
                </div>
              </div>
              {data.description && (
                <div className="w95-inset" style={{ padding: '8px', lineHeight: '1.6' }}>
                  {data.description}
                </div>
              )}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📋 Contact Information:</div>
                <div className="w95-inset" style={{ padding: '8px' }}>
                  {data.phone && <div>📞 Phone: <a href={`tel:${data.phone}`} style={{ color: '#000080' }}>{data.phone}</a></div>}
                  {(data.contact_email || data.email) && <div>✉️ Email: <a href={`mailto:${data.contact_email || data.email}`} style={{ color: '#000080' }}>{data.contact_email || data.email}</a></div>}
                  {data.address && <div>📍 Address: {data.address}{data.city ? `, ${data.city}` : ''}{data.state ? `, ${data.state}` : ''}</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📋 Available Services:</div>
              {services.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '4px 0', borderBottom: '1px solid #a0a0a0' }}>
                  <div className="w95-checkbox">✓</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                    {s.price && <span style={{ color: '#000080', marginLeft: '8px' }}>{s.price}</span>}
                    {s.description && <div style={{ color: '#444', fontSize: '10px', marginTop: '2px' }}>{s.description}</div>}
                  </div>
                </div>
              ))}
              {services.length === 0 && <div style={{ color: '#888' }}>No services listed.</div>}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📁 C:\My Pictures\{data.business_name}</div>
              <div className="w95-inset" style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                {galleryImages.map((img, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ border: '1px solid #808080', padding: '2px', background: '#fff' }}>
                      <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ fontSize: '9px', color: '#444', marginTop: '2px' }}>photo_{i + 1}.jpg</div>
                  </div>
                ))}
                {galleryImages.length === 0 && <div style={{ color: '#888' }}>This folder is empty.</div>}
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🕐 Business Hours:</div>
              <div className="w95-inset" style={{ padding: '8px' }}>
                {daysOrder.map(day => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #ccc' }}>
                    <span style={{ fontWeight: hours[day] ? 'bold' : 'normal', color: hours[day] ? '#000' : '#888' }}>{dayLabels[day]}</span>
                    <span>{hours[day] || 'Closed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>💬 Customer Reviews{data.google_review_count ? ` (${data.google_review_count})` : ''}:</div>
              {reviews.map((r, i) => (
                <div key={i} className="w95-inset" style={{ padding: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', color: '#000080' }}>{r.author}</span>
                    <span style={{ color: '#888', fontSize: '9px' }}>{r.date}</span>
                  </div>
                  <div style={{ color: '#cc8800', fontSize: '10px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div style={{ marginTop: '4px' }}>&quot;{r.text}&quot;</div>
                </div>
              ))}
              {reviews.length === 0 && <div style={{ color: '#888' }}>No reviews found.</div>}
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          {data.phone && (
            <a href={`tel:${data.phone}`} className="w95-btn" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>
              📞 {ind ? 'Call Me' : 'Call Us'}
            </a>
          )}
          <button className="w95-btn">OK</button>
          <button className="w95-btn">Cancel</button>
        </div>
      </div>

      {/* Taskbar */}
      <div className="w95-taskbar">
        <div className="w95-start" onClick={() => setStartOpen(!startOpen)}>
          <span style={{ fontSize: '14px' }}>🪟</span>
          <span>Start</span>
        </div>
        <div style={{ flex: 1, display: 'flex', padding: '0 8px', gap: '4px' }}>
          <div className="w95-outset" style={{ padding: '2px 8px', fontSize: '11px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📋 {data.business_name}
          </div>
        </div>
        <div className="w95-clock">{timeStr}</div>
      </div>

      {/* Start Menu */}
      {startOpen && (
        <div className="w95-start-menu" onClick={() => setStartOpen(false)}>
          <div className="w95-start-sidebar">Windows95</div>
          <div style={{ paddingLeft: '24px' }}>
            <div className="w95-start-item" onClick={() => setActiveTab('about')}>📄 About</div>
            <div className="w95-start-item" onClick={() => setActiveTab('services')}>📋 Services</div>
            <div className="w95-start-item" onClick={() => setActiveTab('gallery')}>🖼️ Gallery</div>
            <div className="w95-start-item" onClick={() => setActiveTab('hours')}>🕐 Hours</div>
            <div className="w95-start-item" onClick={() => setActiveTab('reviews')}>💬 Reviews</div>
            <div style={{ borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '2px 0' }} />
            {data.phone && (
              <a href={`tel:${data.phone}`} className="w95-start-item" style={{ color: 'inherit', textDecoration: 'none' }}>
                📞 {ind ? 'Call Me' : 'Call Us'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: '40px', color: '#006666', fontSize: '9px' }}>
        Powered by AutoLocal.ai
      </div>

      <StickyContactBar data={data} />
    </div>
  )
}
