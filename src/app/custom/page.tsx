'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, BarChart3, Bot } from 'lucide-react'

const SERVICES = [
  { icon: Globe, title: 'Custom Website', desc: 'A conversion-optimized site built for your brand, SEO-ready, mobile-first, designed to turn visitors into customers.', color: 'from-cyan-400 to-blue-500' },
  { icon: BarChart3, title: 'Business Dashboard', desc: 'Real-time metrics, customer insights, and operational data unified in one beautiful, actionable interface.', color: 'from-purple-400 to-pink-500' },
  { icon: Bot, title: 'AI Workflow Automation', desc: 'Automate repetitive tasks, streamline operations, and free up your time to focus on what matters.', color: 'from-amber-400 to-orange-500' },
]

export default function CustomSolutions() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text"><Image src="/logo.png" alt="AutoLocal.ai" width={36} height={36} className="rounded-lg" />AutoLocal.ai</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-slate-400 hover:text-white transition text-sm">Features</Link>
            <Link href="/#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</Link>
            <Link href="/custom" className="text-white transition text-sm font-semibold">Custom Solutions</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-400 hover:text-white transition text-sm">Sign In</Link>
          <Link href="/onboarding" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative hero-gradient text-center pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <div className="absolute top-10 left-[20%] w-64 h-64 rounded-full bg-purple-500/10 blur-3xl orb" />
        <div className="absolute top-20 right-[10%] w-80 h-80 rounded-full bg-cyan-500/8 blur-3xl orb" style={{ animationDelay: '-10s' }} />
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-bold gradient-text leading-tight mb-6">
          Custom Solutions for Growing Businesses
        </h1>
        <p className="relative z-10 text-xl text-slate-400 max-w-2xl mx-auto">
          Not every business fits in a box. We build custom websites, dashboards, and AI-powered workflows tailored to your operations.
        </p>
      </section>

      <div className="section-divider" />

      {/* Services */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div key={i} className="gradient-card glass-hover rounded-2xl p-8 text-center transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-5`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Let&apos;s Build Something Together</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Schedule a free consultation to discuss your needs. No pressure, no commitments.</p>
        <a href="mailto:brian@autolocal.ai" className="btn-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white inline-block">
          Schedule a Free Consultation
        </a>
        <p className="mt-6">
          <Link href="/#pricing" className="text-slate-400 hover:text-cyan-400 transition text-sm">
            Or go back to self-service plans →
          </Link>
        </p>
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
              <li><Link href="/#features" className="hover:text-slate-300 transition">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-slate-300 transition">Pricing</Link></li>
              <li><Link href="/custom" className="hover:text-slate-300 transition">Custom Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition">About</a></li>
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
