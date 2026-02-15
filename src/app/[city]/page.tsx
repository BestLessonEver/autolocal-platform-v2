import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { areas, AreaData } from '@/data/areas'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

const RESERVED_ROUTES = ['login', 'dashboard', 'onboarding', 'custom', 'about', 'blog', 'contact', 'services', 'api', 'auth']

function getArea(slug: string): AreaData | undefined {
  if (RESERVED_ROUTES.includes(slug)) return undefined
  return areas.find(a => a.slug === slug)
}

export function generateStaticParams() {
  return areas.map(a => ({ city: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const area = getArea(city)
  if (!area) return {}
  return {
    title: `AI Marketing Services in ${area.city}, ${area.state} | AutoLocal.ai`,
    description: area.intro,
  }
}

const SERVICES = [
  { icon: '📢', title: 'Social Media Management', desc: 'AI-generated posts across all platforms, tailored to your brand and audience.' },
  { icon: '⭐', title: 'Review Management', desc: 'Automated responses to every review — professional, prompt, and personalized.' },
  { icon: '📧', title: 'Email Marketing', desc: 'Automated newsletters and campaigns that keep your customers engaged.' },
  { icon: '🎯', title: 'Lead Generation', desc: 'AI-powered lead capture and follow-up that works 24/7.' },
  { icon: '📊', title: 'Competitor Intelligence', desc: 'Track what your competitors are doing and stay one step ahead.' },
  { icon: '🌐', title: 'Local SEO', desc: 'Optimize your online presence to dominate local search results.' },
]

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const area = getArea(city)
  if (!area) notFound()

  const otherAreas = areas.filter(a => a.slug !== area.slug).slice(0, 8)
  const bodyParagraphs = area.body.split('\n\n')
  const landmarksList = area.landmarks.split(', ')
  const districtsList = area.businessDistricts.split(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `AutoLocal.ai — ${area.city}, ${area.state}`,
    description: area.intro,
    url: `https://autolocal.ai/${area.slug}`,
    areaServed: { '@type': 'City', name: area.city, addressRegion: area.state },
    provider: {
      '@type': 'Organization',
      name: 'AutoLocal.ai',
      url: 'https://autolocal.ai',
    },
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
              {area.city}, {area.state}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">{area.headline}</h1>
            <p className="text-lg text-slate-400 leading-relaxed">{area.intro}</p>
          </div>
        </div>
      </section>

      {/* Body Content */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl space-y-6">
          {bodyParagraphs.map((p, i) => (
            <p key={i} className="text-slate-400 leading-relaxed">{p}</p>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="border-t border-slate-800/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-white mb-4 text-center">AI Marketing Services for {area.city} Businesses</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">Everything your business needs to compete and win — powered by AI, priced for local businesses.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-7 transition-all duration-300">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landmarks & Districts */}
      <section className="border-t border-slate-800/50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-6">Landmarks in {area.city}</h2>
            <div className="flex flex-wrap gap-2">
              {landmarksList.map((l, i) => (
                <span key={i} className="text-sm px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-6">Business Districts</h2>
            <div className="flex flex-wrap gap-2">
              {districtsList.map((d, i) => (
                <span key={i} className="text-sm px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Grow Your {area.city} Business?</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">Book a free consultation and see how AI-powered marketing can transform your business.</p>
              <Link href="/custom" className="inline-block btn-gradient px-10 py-4 rounded-xl font-semibold text-lg text-white">
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Cities */}
      <section className="border-t border-slate-800/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-white mb-8 text-center">We Also Serve</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {otherAreas.map(a => (
              <Link key={a.slug} href={`/${a.slug}`} className="glass glass-hover rounded-xl p-4 text-center transition-all duration-300">
                <span className="text-sm font-semibold text-white">{a.city}</span>
                <span className="text-xs text-slate-500 block">{a.state}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
