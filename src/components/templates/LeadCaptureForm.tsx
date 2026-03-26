'use client'

import { useState } from 'react'

interface LeadCaptureFormProps {
  slug: string
  accentColor: string
  primaryColor?: string
  ctaText?: string
  showInstrument?: boolean
  darkMode?: boolean
}

export default function LeadCaptureForm({
  slug,
  accentColor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  primaryColor: _primaryColor,
  ctaText = 'Book Your Free Trial',
  showInstrument = false,
  darkMode = true,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', instrument: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return

    setStatus('sending')
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', phone: '', instrument: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="text-4xl mb-4">🎉</div>
        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          You&apos;re In!
        </h3>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          We&apos;ll reach out shortly to schedule your free lesson.
        </p>
      </div>
    )
  }

  const inputClasses = darkMode
    ? 'w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition'
    : 'w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Your Name *"
        required
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className={inputClasses}
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className={inputClasses}
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className={inputClasses}
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
      </div>
      {showInstrument && (
        <select
          value={form.instrument}
          onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))}
          className={inputClasses}
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        >
          <option value="">Which instrument?</option>
          <option value="Guitar">Guitar</option>
          <option value="Piano">Piano</option>
          <option value="Drums">Drums</option>
          <option value="Voice">Voice</option>
          <option value="Bass">Bass</option>
          <option value="Ukulele">Ukulele</option>
          <option value="Not Sure">Not Sure Yet</option>
        </select>
      )}
      <textarea
        rows={3}
        placeholder="Anything else we should know?"
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className={`${inputClasses} resize-none`}
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        style={{ backgroundColor: accentColor }}
      >
        {status === 'sending' ? 'Sending...' : ctaText}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">
          Something went wrong. Please call us directly or try again.
        </p>
      )}
    </form>
  )
}
