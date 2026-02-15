'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PRICING_TIERS } from '@/lib/types'
import { Sparkles, Camera, FileImage, CalendarClock, Brain, Share2, Zap, Globe, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles, title: 'Social Media Posts', desc: 'AI-generated captions tailored to your brand voice, audience, and platform.', color: 'from-cyan-400 to-blue-500' },
  { icon: Camera, title: 'Photo → Post', desc: 'Upload a photo, get a perfectly crafted caption in seconds.', color: 'from-purple-400 to-pink-500' },
  { icon: FileImage, title: 'Flyer Builder', desc: 'Create professional promotional flyers with AI-powered design suggestions.', color: 'from-amber-400 to-orange-500' },
  { icon: CalendarClock, title: 'Auto-Scheduling', desc: 'Posts are scheduled at optimal times for maximum engagement.', color: 'from-green-400 to-emerald-500' },
  { icon: Brain, title: 'AI That Learns', desc: 'Rate posts to teach the AI your preferences. It gets smarter over time.', color: 'from-indigo-400 to-violet-500' },
  { icon: Share2, title: 'Multi-Platform', desc: 'Facebook, Instagram, Google Business, TikTok, YouTube, and more.', color: 'from-rose-400 to-red-500' },
]

const STEPS = [
  { num: '01', title: 'Tell Us About Your Business', desc: 'Answer a few quick questions about your brand, services, and style. Takes just 5 minutes.' },
  { num: '02', title: 'AI Creates Your Content', desc: 'Get 2 weeks of platform-optimized posts generated instantly — captions, hashtags, and scheduling included.' },
  { num: '03', title: 'Approve & Publish', desc: 'Review your posts, make any edits, and approve. We handle the rest across all your platforms.' },
]

export default function Home() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text"><Image src="/logo.png" alt="AutoLocal.ai" width={36} height={36} className="rounded-lg" />AutoLocal.ai</Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-400 hover:text-white transition text-sm">Features</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</a>
            <Link href="/custom" className="text-slate-400 hover:text-white transition text-sm">Custom Solutions</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-400 hover:text-white transition text-sm">Sign In</Link>
          <Link href="/onboarding" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl orb" />
        <div className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-indigo-500/8 blur-3xl orb" style={{ animationDelay: '-7s' }} />
        <div className="absolute bottom-10 left-[40%] w-64 h-64 rounded-full bg-purple-500/8 blur-3xl orb" style={{ animationDelay: '-14s' }} />

        <div className="relative z-10 text-center pt-20 pb-32 px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm text-cyan-300">
            <Zap className="w-4 h-4" /> Agentic AI Marketing Platform
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
            <span className="gradient-text">Agentic Marketing</span>
            <br />
            <span className="text-white">for your local business</span>
            <br />
            <span className="text-slate-400 text-3xl sm:text-4xl md:text-5xl">— set up in 5 minutes</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            AI-powered social media marketing that sounds like you, posts for you, and learns what works. Upload a photo, get a professional post. It&apos;s that simple.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/onboarding" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white animate-pulse hover:animate-none">
              Start Your Free Trial →
            </Link>
            <p className="text-slate-500 text-sm">7-day free trial · No credit card required</p>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 glass rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <span className="text-xs text-slate-500 ml-2">dashboard.autolocal.ai</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Pending', val: '8', color: 'text-amber-400' },
                { label: 'Approved', val: '12', color: 'text-green-400' },
                { label: 'Published', val: '24', color: 'text-cyan-400' },
                { label: 'Engagement', val: '↑ 34%', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="bg-navy-900/50 rounded-lg p-3 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {['Great turnout at today\'s open house! 🏡 Thank you to everyone...', 'Pro tip: The best time to book is early morning ☀️...'].map((t, i) => (
                <div key={i} className="bg-navy-900/30 rounded-lg p-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-green-400'}`} />
                  <span className="text-sm text-slate-300 truncate">{t}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto whitespace-nowrap ${i === 0 ? 'bg-amber-400/10 text-amber-400' : 'bg-green-400/10 text-green-400'}`}>{i === 0 ? 'pending' : 'approved'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* How It Works */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">Three simple steps to marketing on autopilot</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30" />
          {STEPS.map((s, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-8 text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-6 glow-cyan relative z-10">
                {s.num}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-slate-400 text-lg">Powerful tools that work together to grow your business</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="gradient-card glass-hover rounded-2xl p-7 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-lg mb-8">Start free for 7 days. Cancel anytime.</p>
          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-full px-2 py-1.5">
            <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${!annual ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white' : 'text-slate-400'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${annual ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white' : 'text-slate-400'}`}>Annual <span className="text-cyan-400 text-xs">Save 17%</span></button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.id} className={`gradient-card rounded-2xl p-8 transition-all duration-300 ${tier.popular ? 'scale-105 glow-cyan ring-1 ring-cyan-500/30' : ''}`}>
              {tier.popular && <div className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">⭐ Most Popular</div>}
              <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">${annual ? Math.round(tier.annual / 12) : tier.price}</span>
                <span className="text-slate-400">/month</span>
                {annual && <div className="text-xs text-cyan-400 mt-1">Billed ${tier.annual}/year</div>}
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className={`block text-center py-3 rounded-xl font-semibold transition ${tier.popular ? 'btn-gradient text-white' : 'border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white'}`}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Custom Solutions Banner */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-10 text-center">
          <Globe className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Looking for something more personalized?</h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">Custom websites, dashboards, and AI workflow automation built specifically for your business.</p>
          <Link href="/custom" className="inline-block border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 px-6 py-3 rounded-xl font-semibold transition">
            Explore Custom Solutions →
          </Link>
        </div>
      </section>

      <div className="section-divider" />

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to put your marketing on autopilot?</h2>
        <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">Join local businesses that save 10+ hours a week with AI-powered marketing.</p>
        <Link href="/onboarding" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white inline-block">
          Start Your Free Trial →
        </Link>
        <p className="text-slate-500 text-sm mt-4">7-day free trial · No credit card required</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="flex items-center gap-2 text-lg font-bold gradient-text"><Image src="/logo.png" alt="AutoLocal.ai" width={28} height={28} className="rounded-md" />AutoLocal.ai</span>
            <p className="text-sm text-slate-500 mt-3">Agentic marketing for local businesses.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-slate-300 transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-slate-300 transition">Pricing</a></li>
              <li><Link href="/custom" className="hover:text-slate-300 transition">Custom Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition">About</a></li>
              <li><a href="#" className="hover:text-slate-300 transition">Blog</a></li>
              <li><a href="mailto:brian@autolocal.ai" className="hover:text-slate-300 transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-300 transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800/50 text-center text-sm text-slate-600">
          © 2026 AutoLocal.ai — All rights reserved
        </div>
      </footer>
    </div>
  )
}
