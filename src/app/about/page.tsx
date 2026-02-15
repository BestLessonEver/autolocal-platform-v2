import { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'About — AutoLocal.ai',
  description: "We're on a mission to bring enterprise-grade AI to local businesses. Learn about our story and team.",
}

const VALUES = [
  { value: 'Done-For-You', desc: "We don't hand you software and wish you luck. We do the work." },
  { value: 'Local-First', desc: 'Every strategy is tailored to your specific market and community.' },
  { value: 'Results-Driven', desc: 'We measure success by your growth — more customers, more revenue, less stress.' },
]

const TEAM = [
  { name: 'Coming Soon', role: 'Founder & CEO' },
  { name: 'Coming Soon', role: 'Head of AI' },
  { name: 'Coming Soon', role: 'Head of Marketing' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <MarketingNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">AI Shouldn&apos;t Be Just for Big Companies</h1>
            <p className="text-lg text-slate-400 leading-relaxed">We started AutoLocal.ai because we saw local businesses drowning in marketing tasks while enterprise companies automated everything. That didn&apos;t seem fair.</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed mb-4">Local businesses are the backbone of every community. The restaurant where you celebrate birthdays. The salon that knows your name. The contractor who shows up on time.</p>
            <p className="text-slate-400 leading-relaxed mb-4">These businesses deserve the same powerful AI tools that Fortune 500 companies use — without the Fortune 500 budget or a dedicated IT team.</p>
            <p className="text-slate-400 leading-relaxed">That&apos;s why we exist. We package enterprise-grade AI into done-for-you services that any local business can afford and benefit from. No technical knowledge required.</p>
          </div>
          <div className="space-y-6">
            {VALUES.map(v => (
              <div key={v.value} className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{v.value}</h3>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-12">Our Team</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">We&apos;re a small team of AI engineers, marketers, and local business advocates. We&apos;ve built AI systems for companies of all sizes — and now we&apos;re focused entirely on helping local businesses thrive.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map(t => (
              <div key={t.role} className="glass rounded-2xl p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Join Us?</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8">Let&apos;s talk about how AI can transform your local business.</p>
        <Link href="/contact" className="inline-block btn-gradient px-8 py-4 rounded-xl font-semibold text-white">Get in Touch</Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
