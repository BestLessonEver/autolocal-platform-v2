'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { STYLE_PRESETS, INDUSTRIES, PLATFORMS, PRICING_TIERS, type StylePreset } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

const STEPS = ['Account', 'Business', 'Brand', 'Voice', 'Services', 'Schedule', 'Connect', 'Preview', 'Plan', 'Welcome']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bizName, setBizName] = useState('')
  const [industry, setIndustry] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [brandColors, setBrandColors] = useState(['#7c3aed', '#0ea5e9'])
  const [brandDesc, setBrandDesc] = useState('')
  const [stylePreset, setStylePreset] = useState<StylePreset>('warm_personal')
  const [voiceDesc, setVoiceDesc] = useState('')
  const [services, setServices] = useState('')
  const [differentiator, setDifferentiator] = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [postFreq, setPostFreq] = useState(5)
  const [prefDays, setPrefDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('growth')
  const [samplePosts, setSamplePosts] = useState<string[]>([])
  const [generatingPosts, setGeneratingPosts] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  // Steps 1-8 are skippable (not 0=Account, not 9=Welcome)
  const isSkippable = step >= 1 && step <= 8

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    next()
  }

  const generateSamplePosts = async () => {
    setGeneratingPosts(true)
    try {
      const res = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizName, industry, stylePreset, services, voiceDesc, targetCustomer, count: 3, isSample: true }),
      })
      const data = await res.json()
      setSamplePosts(data.posts || ['Great sample post about your business! 🌟', 'Another engaging post for your audience! 💪', 'Check out what we have in store for you! ✨'])
    } catch {
      setSamplePosts([
        `Welcome to ${bizName}! We're passionate about serving our community with the best ${industry.toLowerCase()} services. 🌟`,
        `Did you know? ${differentiator || 'We go above and beyond for every client'}. That's the ${bizName} difference! 💪`,
        `Looking for ${services.split(',')[0]?.trim() || 'quality service'}? We've got you covered. Book today! ✨`,
      ])
    }
    setGeneratingPosts(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: biz } = await supabase.from('businesses').insert({
      user_id: user.id,
      name: bizName,
      industry,
      address,
      phone,
      website_url: website,
      brand_colors: brandColors,
      style_preset: stylePreset,
      brand_description: brandDesc,
      services: services.split(',').map(s => s.trim()).filter(Boolean),
      differentiator,
      target_customer: targetCustomer,
      posting_frequency: postFreq,
      preferred_days: prefDays,
    }).select().single()

    if (biz) {
      await supabase.from('brand_profiles').insert({ business_id: biz.id, voice_description: voiceDesc })
      await supabase.from('subscriptions').insert({ business_id: biz.id, plan: selectedPlan === 'growth' ? 'trial' : selectedPlan })

      // Generate initial posts in background
      fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: biz.id, bizName, industry, stylePreset, services, voiceDesc, targetCustomer, brandDescription: brandDesc, count: 14 }),
      })

      // Fire research pipeline in background
      if (website || bizName) {
        fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: biz.id, businessName: bizName, website, location: address, businessType: industry }),
        })
      }
    }

    router.push('/dashboard')
  }

  const toggleDay = (day: string) => {
    setPrefDays(d => d.includes(day) ? d.filter(dd => dd !== day) : [...d, day])
  }

  const inputClass = "w-full px-4 py-3 rounded-xl dark-input"
  const selectClass = "w-full px-4 py-3 rounded-xl dark-input"

  const renderStep = () => {
    switch (step) {
      case 0: // Account
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
              <p className="text-slate-400 mt-2">Start your 7-day free trial</p>
            </div>
            <button onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` } }) }} className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 hover:border-cyan-500/40 transition text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div><div className="relative flex justify-center text-sm"><span className="bg-navy-900 px-4 text-slate-500">or</span></div></div>
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleSignup} disabled={loading || !email || !password} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        )

      case 1: // Business Basics
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Tell Us About Your Business</h2>
              <p className="text-slate-400 mt-2">We&apos;ll use this to create perfect content for you</p>
            </div>
            <input placeholder="Business name *" value={bizName} onChange={e => setBizName(e.target.value)} className={inputClass} required />
            <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectClass}>
              <option value="">Select your industry *</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <input placeholder="Address / service area" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} />
            <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
            <input placeholder="Website URL (optional)" value={website} onChange={e => setWebsite(e.target.value)} className={inputClass} />
          </div>
        )

      case 2: // Brand Identity
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Brand Identity</h2>
              <p className="text-slate-400 mt-2">Your colors and logo help us match your brand</p>
            </div>
            {/* Amber warning */}
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">You can skip this for now, but we can&apos;t generate content until your brand identity is set up.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Brand Colors</label>
              <div className="flex gap-4 items-center">
                {brandColors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="color" value={c} onChange={e => { const nc = [...brandColors]; nc[i] = e.target.value; setBrandColors(nc) }} className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent" />
                    <span className="text-sm text-slate-500">{c}</span>
                  </div>
                ))}
                <button onClick={() => setBrandColors([...brandColors, '#10b981'])} className="text-cyan-400 text-sm font-medium">+ Add</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Logo (optional)</label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-cyan-500/40 transition cursor-pointer">
                <p className="text-slate-500">Click or drag to upload your logo</p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG, or SVG</p>
              </div>
            </div>
            <textarea placeholder="Describe your brand in a few words (optional)" value={brandDesc} onChange={e => setBrandDesc(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
        )

      case 3: // Voice & Style
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Pick Your Style</h2>
              <p className="text-slate-400 mt-2">This sets the tone for all your content</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(STYLE_PRESETS) as [StylePreset, typeof STYLE_PRESETS[StylePreset]][]).map(([key, preset]) => (
                <button key={key} onClick={() => setStylePreset(key)} className={`p-4 rounded-xl text-left transition ${stylePreset === key ? 'glass border-cyan-500/50 ring-1 ring-cyan-500/30' : 'glass glass-hover'}`}>
                  <div className="text-2xl mb-1">{preset.emoji}</div>
                  <div className="font-semibold text-white">{preset.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
            <textarea placeholder="Any additional notes about your brand voice? (optional)" value={voiceDesc} onChange={e => setVoiceDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          </div>
        )

      case 4: // Services
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Your Services</h2>
              <p className="text-slate-400 mt-2">What do you offer? This helps us create relevant posts</p>
            </div>
            <textarea placeholder="List your main services (comma separated)" value={services} onChange={e => setServices(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
            <textarea placeholder="What makes you different from competitors? (optional)" value={differentiator} onChange={e => setDifferentiator(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            <textarea placeholder="Who are your ideal customers?" value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          </div>
        )

      case 5: // Posting Preferences
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Posting Schedule</h2>
              <p className="text-slate-400 mt-2">How often should we post for you?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Posts per week: <span className="text-cyan-400 font-bold">{postFreq}</span></label>
              <input type="range" min={3} max={7} value={postFreq} onChange={e => setPostFreq(Number(e.target.value))} className="w-full accent-cyan-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>3x/week</span><span>Daily</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Preferred days</label>
              <div className="flex gap-2 flex-wrap">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button key={day} onClick={() => toggleDay(day)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${prefDays.includes(day) ? 'btn-gradient text-white' : 'glass text-slate-400 hover:text-white'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 6: // Connect Accounts
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Connect Your Accounts</h2>
              <p className="text-slate-400 mt-2">You can always do this later from settings</p>
            </div>
            <div className="space-y-3">
              {PLATFORMS.map(p => (
                <button key={p.id} className="w-full flex items-center justify-between p-4 rounded-xl glass glass-hover transition">
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-medium text-white">{p.label}</span>
                  </span>
                  <span className="text-sm text-cyan-400 font-medium">Connect →</span>
                </button>
              ))}
            </div>
            <button onClick={next} className="w-full text-slate-500 text-sm hover:text-slate-300 transition">Skip for now →</button>
          </div>
        )

      case 7: // Sample Preview
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Preview Your Posts ✨</h2>
              <p className="text-slate-400 mt-2">Here&apos;s what your content will look like</p>
            </div>
            {samplePosts.length === 0 && !generatingPosts && (
              <button onClick={generateSamplePosts} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl">
                Generate Sample Posts ✨
              </button>
            )}
            {generatingPosts && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-400">Creating your sample posts...</p>
              </div>
            )}
            {samplePosts.map((post, i) => (
              <div key={i} className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{bizName?.[0] || 'A'}</div>
                  <div>
                    <div className="font-semibold text-white text-sm">{bizName || 'Your Business'}</div>
                    <div className="text-xs text-slate-500">Just now</div>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{post}</p>
              </div>
            ))}
          </div>
        )

      case 8: // Plan Selection
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <p className="text-slate-400 mt-2">Start with a 7-day free trial • No credit card needed</p>
            </div>
            <div className="space-y-4">
              {PRICING_TIERS.map(tier => (
                <button key={tier.id} onClick={() => setSelectedPlan(tier.id)} className={`w-full p-5 rounded-xl text-left transition ${selectedPlan === tier.id ? 'glass border-cyan-500/50 ring-1 ring-cyan-500/30' : 'glass glass-hover'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-lg">{tier.name} {tier.popular && <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full ml-2">Popular</span>}</span>
                    <span className="text-2xl font-bold text-white">${tier.price}<span className="text-sm font-normal text-slate-400">/mo</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-xs text-slate-400 bg-navy-800/50 px-2 py-1 rounded-full">✓ {f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 9: // Welcome
        return (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-white">Welcome to AutoLocal!</h2>
            <p className="text-slate-400 max-w-md mx-auto">Your first 14 posts are being generated right now. Head to your dashboard to review and approve them!</p>
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
              <span className="text-sm">Generating your content...</span>
            </div>
            <button onClick={handleComplete} disabled={loading} className="btn-gradient text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-50">
              {loading ? 'Setting up...' : 'Go to Dashboard →'}
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Header */}
      <div className="glass border-x-0 border-t-0 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2 text-xl font-bold gradient-text"><Image src="/logo.png" alt="AutoLocal.ai" width={32} height={32} className="rounded-lg" />AutoLocal.ai</span>
          <span className="text-sm text-slate-500">{step + 1} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-navy-800 h-1">
        <div className="h-1 transition-all duration-500 bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl glass rounded-2xl p-8">
          {renderStep()}

          {/* Navigation */}
          {step !== 9 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50">
              <button onClick={prev} disabled={step === 0} className="text-slate-500 hover:text-slate-300 disabled:invisible transition">← Back</button>
              <div className="flex items-center gap-4">
                {isSkippable && (
                  <button onClick={next} className="text-slate-500 hover:text-slate-300 text-sm transition">Skip this step</button>
                )}
                {step < 6 && (
                  <button onClick={next} disabled={step === 1 && (!bizName || !industry)} className="btn-gradient text-white font-semibold px-6 py-2 rounded-xl disabled:opacity-50">
                    Continue →
                  </button>
                )}
                {step === 7 && (
                  <button onClick={next} className="btn-gradient text-white font-semibold px-6 py-2 rounded-xl">
                    {samplePosts.length > 0 ? 'Love it! Continue →' : 'Continue →'}
                  </button>
                )}
                {step === 8 && (
                  <button onClick={next} className="btn-gradient text-white font-semibold px-6 py-2 rounded-xl">
                    Start Free Trial →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
