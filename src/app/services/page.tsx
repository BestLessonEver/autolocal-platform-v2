import { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'AI Services for Local Businesses | AutoLocal.ai',
  description: 'Three pillars of AI-powered growth: Marketing, Analytics, and Business Optimization. Everything your local business needs to compete and win.',
}

const PILLARS = [
  {
    id: 'marketing',
    icon: '📢',
    gradient: 'from-cyan-400 to-blue-500',
    title: 'AI Marketing',
    tagline: 'Your always-on marketing team',
    desc: "Stop juggling social accounts, chasing reviews, and manually following up with leads. Our AI handles it all — creating content, managing ads, monitoring your reputation, and nurturing every lead automatically.",
    services: [
      { name: 'Social Content Automation', desc: 'Platform-specific posts created, scheduled, and published across Facebook, Instagram, LinkedIn, and Google.' },
      { name: 'Ads Management & Optimization', desc: 'Google Ads and social media campaigns managed by AI with continuous optimization.' },
      { name: 'Review Monitoring & Response', desc: 'Every review gets a thoughtful response within hours. Professional handling that protects your reputation.' },
      { name: 'Automated Lead Follow-Up', desc: 'AI responds instantly via email or text, qualifies the lead, and books the appointment — even at 2am.' },
    ],
  },
  {
    id: 'analytics',
    icon: '📊',
    gradient: 'from-purple-400 to-indigo-500',
    title: 'Business Analytics Dashboard',
    tagline: 'See everything. Miss nothing.',
    desc: "Most local businesses are flying blind. We give you a real-time command center that shows exactly what's working, what's not, and where your next customer is coming from.",
    services: [
      { name: 'Real-Time Business Metrics', desc: 'Revenue, bookings, walk-ins, online orders — all your key numbers in one live dashboard.' },
      { name: 'Customer Behavior Insights', desc: 'Understand who your best customers are, when they buy, and how to get more like them.' },
      { name: 'Marketing Performance Tracking', desc: 'See exactly which marketing channels drive results. Track ROI on every dollar.' },
      { name: 'Revenue & Growth Analytics', desc: 'Trend analysis, seasonal forecasting, and growth projections to plan ahead.' },
    ],
  },
  {
    id: 'optimization',
    icon: '⚡',
    gradient: 'from-emerald-400 to-cyan-500',
    title: 'Business Optimization',
    tagline: 'Work smarter, not harder',
    desc: "AI doesn't just market your business — it makes it run better. We find the bottlenecks, automate the repetitive stuff, and free you up to focus on what moves the needle.",
    services: [
      { name: 'AI Workflow Automation', desc: 'Appointment confirmations, follow-up emails, inventory alerts, staff scheduling — automated.' },
      { name: 'Operational Efficiency Analysis', desc: 'AI finds time and money leaks. Most businesses save 10-20 hours per week in month one.' },
      { name: 'Process Improvement', desc: 'Redesigned workflows that eliminate friction and improve customer experience.' },
      { name: 'Smart Scheduling & Routing', desc: 'AI-optimized scheduling that reduces gaps, minimizes no-shows, and maximizes efficiency.' },
    ],
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-indigo-500/10" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
            Three Pillars of Growth
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            One Platform.<br />
            <span className="gradient-text">Everything You Need.</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Marketing, analytics, and operations — connected by AI into one system that compounds results. No enterprise complexity. Just growth.
          </p>
        </div>
      </section>

      {/* Pillars */}
      {PILLARS.map((p, i) => (
        <section key={p.id} id={p.id} className={`scroll-mt-20 ${i % 2 === 0 ? 'bg-navy-950/50' : ''} border-t border-slate-800/50`}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-1">
                <div className="text-5xl mb-4">{p.icon}</div>
                <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>{p.title}</h2>
                <p className="text-cyan-400/70 font-medium mb-6">{p.tagline}</p>
                <p className="text-slate-400 leading-relaxed text-lg mb-8">{p.desc}</p>
                <Link href="/custom" className={`inline-block bg-gradient-to-r ${p.gradient} text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition shadow-lg`}>
                  Get Started
                </Link>
              </div>
              <div className="flex-1 space-y-6">
                {p.services.map(s => (
                  <div key={s.name} className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Not Sure Where to Start?</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">Book a free consultation. We&apos;ll look at your business, your goals, and build a custom plan — no pressure, no commitment.</p>
              <Link href="/custom" className="inline-block btn-gradient px-10 py-4 rounded-xl font-semibold text-lg text-white">
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
