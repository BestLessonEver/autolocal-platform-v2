import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import industries from '@/data/industries.json'

interface IndustryData {
  slug: string
  name: string
  emoji: string
  headline: string
  subhead: string
  description: string
  pain: string
  features: string[]
  searchTerms: string[]
}

const allIndustries: IndustryData[] = industries as IndustryData[]

export function generateStaticParams() {
  return allIndustries.map((i) => ({ slug: i.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const industry = allIndustries.find((i) => i.slug === params.slug)
  if (!industry) return {}

  return {
    title: `${industry.headline} | AutoLocal.ai`,
    description: `${industry.description.slice(0, 155)}...`,
    keywords: industry.searchTerms.join(', '),
    openGraph: {
      title: industry.headline,
      description: industry.subhead,
      url: `https://autolocal.ai/free-website-for/${industry.slug}`,
    },
    alternates: {
      canonical: `https://autolocal.ai/free-website-for/${industry.slug}`,
    },
  }
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const industry = allIndustries.find((i) => i.slug === params.slug)
  if (!industry) notFound()

  const otherIndustries = allIndustries.filter((i) => i.slug !== industry.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: industry.headline,
    description: industry.description,
    url: `https://autolocal.ai/free-website-for/${industry.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'AutoLocal.ai',
      url: 'https://autolocal.ai',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free custom website. Just $9/mo hosting.',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#09090b] text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AutoLocal.ai</span>
            </Link>
            <Link href="/#order" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition">
              Get Started Free
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <p className="text-6xl mb-6">{industry.emoji}</p>
            <h1 className="text-5xl sm:text-6xl font-black leading-[0.95] mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Free</span>{' '}
              {industry.headline.replace('Free ', '')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-light mb-4">
              {industry.subhead}
            </p>
            <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
              {industry.description}
            </p>
            <Link
              href="/#order"
              className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get My Free Website →
            </Link>
            <p className="text-gray-600 text-sm mt-4">No credit card. No catch. See your site in 15 seconds.</p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-6">
              Why {industry.name} Need a Website
            </h2>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
              <p className="text-gray-300 leading-relaxed text-lg">
                {industry.pain}
              </p>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10">
              What Your Website Includes
            </h2>
            <div className="space-y-4">
              {industry.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                >
                  <span className="text-green-400 text-xl shrink-0">✓</span>
                  <p className="text-gray-200">{feature}</p>
                </div>
              ))}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 rounded-xl">
                <span className="text-green-400 text-xl shrink-0">✓</span>
                <p className="text-gray-200 font-bold">All of this is FREE — just $9/mo hosting</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Type Your Business Name', desc: `We search Google for your ${industry.name.toLowerCase()} and pull your reviews, photos, and business info automatically.` },
                { num: '2', title: 'Preview Your Custom Site', desc: 'See your business on a professional website. Choose from multiple designs. Your real content is already on it.' },
                { num: '3', title: 'Go Live for $9/mo', desc: 'Love it? We host it, maintain it, and handle everything. Cancel anytime — no contracts, no hassle.' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10">
              Compare Your Options
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Hire a web designer', price: '$2,000 – $5,000+', time: '4-8 weeks', downside: 'Expensive, slow, lots of meetings' },
                { label: 'DIY with Wix or Squarespace', price: '$200/year', time: 'Days of your time', downside: 'You do all the work yourself' },
                { label: 'AutoLocal.ai', price: 'FREE ($9/mo hosting)', time: '15 seconds', downside: 'We do everything for you', highlight: true },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border ${
                    opt.highlight
                      ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-indigo-500/40'
                      : 'bg-white/[0.03] border-white/[0.06]'
                  }`}
                >
                  <div>
                    <p className={`font-bold text-sm ${opt.highlight ? 'text-indigo-400' : 'text-gray-300'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.downside}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${opt.highlight ? 'text-green-400' : 'text-gray-300'}`}>{opt.price}</p>
                    <p className="text-xs text-gray-500">{opt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent" />
          <div className="relative z-10 max-w-xl mx-auto text-center">
            <p className="text-5xl mb-4">{industry.emoji}</p>
            <h2 className="text-3xl font-black mb-4">
              Your {industry.name.replace(/s$/, '').replace(/ies$/, 'y')} Deserves a Website
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              15 seconds to see it. $0 to build it. Just $9/mo to keep it live.
            </p>
            <Link
              href="/#order"
              className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get My Free Website →
            </Link>
          </div>
        </section>

        {/* Other Industries */}
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-400">
              Free Websites for Other Industries
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {otherIndustries.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/free-website-for/${ind.slug}`}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-indigo-500/30 transition"
                >
                  {ind.emoji} {ind.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* City Pages Link */}
        <section className="py-12 px-4 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            Looking for your city?{' '}
            <Link href="/free-website" className="text-indigo-400 hover:underline">
              Browse free websites by location →
            </Link>
          </p>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/5 text-center">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 AutoLocal.ai</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-400 transition">Home</Link>
              <Link href="/privacy" className="hover:text-gray-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-400 transition">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
