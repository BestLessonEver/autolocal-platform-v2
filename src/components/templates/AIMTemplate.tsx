/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { type TemplateProps, getCtaButtonText } from './types'

export default function AIMTemplate({ data }: TemplateProps) {
  const [reviewIdx, setReviewIdx] = useState(0)
  const services = data.services ?? []
  const reviews = data.reviews ?? []
  const galleryImages = (data.gallery_images ?? []).filter(img => img !== data.hero_image_url)
  const hours = data.hours ?? {}
  const ind = data.site_mode === 'individual'
  const accent = data.brand_color_accent || '#ffcc00'

  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => setReviewIdx(prev => (prev + 1) % reviews.length), 6000)
    return () => clearInterval(interval)
  }, [reviews.length])

  const warningLevel = data.google_rating ? Math.round((data.google_rating / 5) * 100) : 0

  return (
    <div className="min-h-screen" style={{ background: '#d4d0c8', fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', color: '#000' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .aim-titlebar { background: linear-gradient(180deg, #0058a8 0%, #003c7a 100%); color: white; padding: 3px 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: bold; }
        .aim-titlebar-btns { display: flex; gap: 2px; }
        .aim-titlebar-btn { width: 16px; height: 14px; background: #c0c0c0; border: 1px outset #dfdfdf; display: flex; align-items: center; justify-content: center; font-size: 9px; cursor: pointer; color: #000; }
        .aim-window { background: #ece9d8; border: 2px outset #dfdfdf; box-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
        .aim-buddy-group { margin-bottom: 2px; }
        .aim-buddy-header { background: #d4d0c8; padding: 2px 4px; font-weight: bold; font-size: 11px; cursor: pointer; border-bottom: 1px solid #bbb; }
        .aim-buddy { padding: 2px 4px 2px 20px; font-size: 11px; display: flex; align-items: center; gap: 4px; }
        .aim-buddy:hover { background: #316ac5; color: white; }
        .aim-online { color: #00aa00; font-size: 8px; }
        .aim-away { color: #cc8800; font-size: 8px; }
        .aim-chat-msg { padding: 4px 8px; line-height: 1.5; }
        .aim-chat-user { font-weight: bold; }
        .aim-toolbar { background: #ece9d8; border-top: 1px solid #bbb; padding: 4px; display: flex; gap: 6px; align-items: center; }
        .aim-toolbar-btn { width: 22px; height: 20px; border: 1px outset #dfdfdf; background: #ece9d8; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; }
        .aim-input { width: 100%; border: 2px inset #888; padding: 4px; font-family: Tahoma, Arial, sans-serif; font-size: 12px; background: white; resize: none; }
        @keyframes aim-door { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .aim-door-anim { animation: aim-door 0.3s ease-out; }
      `}} />

      <div style={{ display: 'flex', maxWidth: '900px', margin: '0 auto', padding: '20px', gap: '12px', minHeight: '100vh' }}>
        {/* Buddy List */}
        <div className="aim-window" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="aim-titlebar">
            <span>{ind ? 'My' : 'Our'} Buddy List</span>
            <div className="aim-titlebar-btns">
              <div className="aim-titlebar-btn">_</div>
              <div className="aim-titlebar-btn">□</div>
              <div className="aim-titlebar-btn">✕</div>
            </div>
          </div>

          {/* Running Man / Logo */}
          <div style={{ textAlign: 'center', padding: '8px', background: '#fff', borderBottom: '1px solid #bbb' }}>
            {data.logo_url ? (
              <img src={data.logo_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: '36px' }}>🏃</div>
            )}
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{data.business_name}</div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
            {/* Services Group */}
            {services.length > 0 && (
              <div className="aim-buddy-group">
                <div className="aim-buddy-header">📂 Services ({services.length})</div>
                {services.map((s, i) => (
                  <div key={i} className="aim-buddy">
                    <span className="aim-online">●</span>
                    <span>{s.name}</span>
                    {s.price && <span style={{ color: '#888', fontSize: '9px', marginLeft: 'auto' }}>{s.price}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Hours Group */}
            {Object.keys(hours).length > 0 && (
              <div className="aim-buddy-group">
                <div className="aim-buddy-header">📂 Hours</div>
                {daysOrder.map(day => hours[day] ? (
                  <div key={day} className="aim-buddy">
                    <span className={hours[day].toLowerCase() === 'closed' ? 'aim-away' : 'aim-online'}>●</span>
                    <span>{dayLabels[day]}: {hours[day]}</span>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Contact Group */}
            <div className="aim-buddy-group">
              <div className="aim-buddy-header">📂 Contact</div>
              {data.phone && (
                <div className="aim-buddy">
                  <span className="aim-online">●</span>
                  <a href={`tel:${data.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{data.phone}</a>
                </div>
              )}
              {(data.contact_email || data.email) && (
                <div className="aim-buddy">
                  <span className="aim-online">●</span>
                  <a href={`mailto:${data.contact_email || data.email}`} style={{ color: 'inherit', textDecoration: 'none', fontSize: '10px' }}>{data.contact_email || data.email}</a>
                </div>
              )}
              {data.address && (
                <div className="aim-buddy">
                  <span className="aim-online">●</span>
                  <span style={{ fontSize: '10px' }}>{data.address}</span>
                </div>
              )}
            </div>

            {/* Gallery as Buddy Icons */}
            {galleryImages.length > 0 && (
              <div className="aim-buddy-group">
                <div className="aim-buddy-header">📂 Photos ({galleryImages.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', padding: '4px' }}>
                  {galleryImages.slice(0, 9).map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Ad */}
          <div style={{ background: '#ffffcc', border: '1px solid #cc9', padding: '6px', textAlign: 'center', fontSize: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#663300' }}>📢 {data.tagline || `Visit ${data.business_name}!`}</div>
            {data.phone && (
              <a href={`tel:${data.phone}`} style={{ color: '#0066cc', fontWeight: 'bold', fontSize: '11px' }}>
                {ind ? 'Call Me' : 'Call Us'}: {data.phone}
              </a>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="aim-window aim-door-anim" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="aim-titlebar">
            <span>💬 Instant Message with {data.business_name}</span>
            <div className="aim-titlebar-btns">
              <div className="aim-titlebar-btn">_</div>
              <div className="aim-titlebar-btn">□</div>
              <div className="aim-titlebar-btn">✕</div>
            </div>
          </div>

          {/* Warning Level Bar */}
          {data.google_rating && (
            <div style={{ background: '#ece9d8', padding: '2px 8px', borderBottom: '1px solid #bbb', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
              <span>Warning Level:</span>
              <div style={{ flex: 1, maxWidth: '120px', height: '10px', background: '#fff', border: '1px inset #888' }}>
                <div style={{ width: `${warningLevel}%`, height: '100%', background: warningLevel > 80 ? '#00aa00' : warningLevel > 60 ? '#ccaa00' : '#cc0000' }} />
              </div>
              <span style={{ fontWeight: 'bold' }}>{warningLevel}%</span>
              <span style={{ color: '#888' }}>({data.google_rating}★ on Google)</span>
            </div>
          )}

          {/* Hero Image */}
          {data.hero_image_url && (
            <div style={{ padding: '8px', background: '#fff', borderBottom: '1px solid #bbb' }}>
              <img
                src={data.hero_image_url}
                alt=""
                style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', objectPosition: `center ${data.hero_crop ?? 50}%`, border: '1px solid #ccc' }}
              />
            </div>
          )}

          {/* Chat Area */}
          <div style={{ flex: 1, background: '#fff', overflow: 'auto', padding: '4px' }}>
            {/* Welcome Message */}
            <div className="aim-chat-msg">
              <span className="aim-chat-user" style={{ color: '#0000cc' }}>{data.business_name}:</span>{' '}
              <span>🚪 {data.business_name} has entered the chat</span>
            </div>

            {/* Description */}
            {data.description && (
              <div className="aim-chat-msg">
                <span className="aim-chat-user" style={{ color: '#0000cc' }}>{data.business_name}:</span>{' '}
                <span>{data.description}</span>
              </div>
            )}

            {/* Location */}
            {data.city && (
              <div className="aim-chat-msg">
                <span className="aim-chat-user" style={{ color: '#0000cc' }}>{data.business_name}:</span>{' '}
                <span>📍 {ind ? "I'm" : "We're"} located in {data.city}{data.state ? `, ${data.state}` : ''}</span>
              </div>
            )}

            {/* Services as chat */}
            {services.length > 0 && (
              <>
                <div className="aim-chat-msg">
                  <span className="aim-chat-user" style={{ color: '#cc0000' }}>You:</span>{' '}
                  <span>What services do you offer?</span>
                </div>
                <div className="aim-chat-msg">
                  <span className="aim-chat-user" style={{ color: '#0000cc' }}>{data.business_name}:</span>{' '}
                  <span>{ind ? 'I offer' : 'We offer'}: {services.map(s => s.name).join(', ')}</span>
                </div>
              </>
            )}

            {/* Reviews as Chat */}
            {reviews.length > 0 && (
              <>
                <div className="aim-chat-msg" style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
                  <span style={{ color: '#888', fontSize: '10px' }}>— What people are saying —</span>
                </div>
                {reviews.slice(0, 3).map((r, i) => (
                  <div key={i} className="aim-chat-msg">
                    <span className="aim-chat-user" style={{ color: '#006600' }}>{r.author}:</span>{' '}
                    <span>&quot;{r.text.length > 120 ? r.text.slice(0, 120) + '...' : r.text}&quot; {'⭐'.repeat(r.rating)}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Toolbar */}
          <div className="aim-toolbar">
            <div className="aim-toolbar-btn" title="Font">A</div>
            <div className="aim-toolbar-btn" title="Color">🎨</div>
            <div className="aim-toolbar-btn" title="Smiley">😊</div>
            <div className="aim-toolbar-btn" title="Link">🔗</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: '9px', color: '#888' }}>
              {data.google_review_count >= 20 ? `${data.google_review_count} reviews` : ''}
            </div>
          </div>

          {/* Input Area */}
          <div style={{ padding: '4px', background: '#ece9d8', borderTop: '1px solid #bbb' }}>
            <textarea className="aim-input" rows={2} placeholder={`Send a message to ${data.business_name}...`} readOnly />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
              <a
                href={data.phone ? `tel:${data.phone}` : (data.cta_url || '#')}
                style={{ padding: '3px 16px', background: '#ece9d8', border: '2px outset #dfdfdf', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', color: '#000' }}
              >
                {data.phone ? (ind ? 'Call Me' : 'Call Us') : 'Send'}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#ece9d8', padding: '2px 6px', borderTop: '1px solid #bbb', fontSize: '9px', color: '#888', textAlign: 'center' }}>
          </div>
        </div>
      </div>

    </div>
  )
}
