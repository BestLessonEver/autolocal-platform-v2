'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STYLE_PRESETS, PLATFORMS, type StylePreset } from '@/lib/types'

export default function SettingsPage() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [business, setBusiness] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(data)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    await supabase.from('businesses').update({
      name: business.name,
      industry: business.industry,
      style_preset: business.style_preset,
      posting_frequency: business.posting_frequency,
      preferred_days: business.preferred_days,
    }).eq('id', business.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!business) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="pb-20 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ Settings</h1>

      <div className="space-y-8">
        {/* Business Info */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Business Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Business Name</label>
              <input value={business.name || ''} onChange={e => setBusiness({ ...business, name: e.target.value })} className="w-full px-4 py-3 rounded-xl dark-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Industry</label>
              <input value={business.industry || ''} onChange={e => setBusiness({ ...business, industry: e.target.value })} className="w-full px-4 py-3 rounded-xl dark-input" />
            </div>
          </div>
        </section>

        {/* Style Preset */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Brand Style</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.entries(STYLE_PRESETS) as [StylePreset, typeof STYLE_PRESETS[StylePreset]][]).map(([key, preset]) => (
              <button key={key} onClick={() => setBusiness({ ...business, style_preset: key })} className={`p-3 rounded-xl text-left transition text-sm ${business.style_preset === key ? 'glass border-cyan-500/50 ring-1 ring-cyan-500/30' : 'glass glass-hover'}`}>
                <span className="text-xl">{preset.emoji}</span>
                <div className="font-medium text-white mt-1">{preset.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Connected Accounts */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Connected Accounts</h2>
          <div className="space-y-3">
            {PLATFORMS.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl glass">
                <span className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-medium text-white">{p.label}</span>
                </span>
                <button className="text-sm text-cyan-400 font-medium hover:underline">Connect</button>
              </div>
            ))}
          </div>
        </section>

        {/* Subscription */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
          <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <div>
              <div className="font-semibold text-cyan-400">7-Day Free Trial</div>
              <div className="text-sm text-slate-400">Full access to all features</div>
            </div>
            <button className="px-4 py-2 btn-gradient text-white text-sm rounded-lg font-medium">Upgrade</button>
          </div>
        </section>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
