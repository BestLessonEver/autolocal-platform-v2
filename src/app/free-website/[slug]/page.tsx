import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import cities from '@/data/cities.json'

interface CityData {
  city: string
  state: string
  stateAbbr: string
  pop: number
  nearby: string[]
  slug: string
}

const allCities: CityData[] = cities as CityData[]

// Pre-generate all city pages at build time
export function generateStaticParams() {
  return allCities.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const city = allCities.find((c) => c.slug === params.slug)
  if (!city) return {}
  
  return {
    title: `Free Website for Small Businesses in ${city.city}, ${city.stateAbbr} | AutoLocal.ai`,
    description: `Get a free custom website for your ${city.city}, ${city.state} business. We pull your Google reviews, photos & hours automatically. Just $9/mo hosting. No coding, no templates — we build it for you.`,
    keywords: `free website ${city.city}, website for small business ${city.city} ${city.stateAbbr}, web design ${city.city}, cheap website ${city.city}, ${city.city} ${city.state} website`,
    openGraph: {
      title: `Free Website for Businesses in ${city.city}, ${city.stateAbbr}`,
      description: `Custom website built from your Google profile. Free for ${city.city} businesses. Just $9/mo hosting.`,
      url: `https://autolocal.ai/free-website/${city.slug}`,
    },
    alternates: {
      canonical: `https://autolocal.ai/free-website/${city.slug}`,
    },
  }
}

// Industries common in small towns
const industries = [
  { name: 'Barbershops', emoji: '💈', desc: 'Show off your cuts and client reviews' },
  { name: 'Restaurants', emoji: '🍽️', desc: 'Menu, hours, and 5-star reviews front and center' },
  { name: 'Auto Repair', emoji: '🔧', desc: 'Let your reputation speak for itself online' },
  { name: 'Salons & Spas', emoji: '💇', desc: 'Beautiful site to match your beautiful work' },
  { name: 'Contractors', emoji: '🏠', desc: 'Your project photos and reviews, professionally displayed' },
  { name: 'Churches', emoji: '⛪', desc: 'Service times, events, and community info' },
  { name: 'Dentists & Clinics', emoji: '🦷', desc: 'Build trust before they walk through the door' },
  { name: 'Boutiques & Retail', emoji: '🛍️', desc: 'Your storefront, online. Open 24/7' },
]

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = allCities.find((c) => c.slug === params.slug)
  if (!city) notFound()

  // Find nearby city pages that exist
  const nearbyCities = city.nearby
    .map((name) => allCities.find((c) => c.city === name))
    .filter(Boolean) as CityData[]

  // Find other cities in same state
  const stateCities = allCities
    .filter((c) => c.stateAbbr === city.stateAbbr && c.slug !== city.slug)
    .slice(0, 8)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Free Website for ${city.city} Businesses`,
    description: `Free custom website design for small businesses in ${city.city}, ${city.state}. Built from your Google Business Profile.`,
    url: `https://autolocal.ai/free-website/${city.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'AutoLocal.ai',
      url: 'https://autolocal.ai',
    },
    areaServed: {
      '@type': 'City',
      name: city.city,
      containedInPlace: {
        '@type': 'State',
        name: city.state,
      },
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
            <Link
              href="/#order"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition"
            >
              Get Started Free
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <p className="text-indigo-400 font-medium mb-4 text-sm uppercase tracking-wide">
              {city.city}, {city.stateAbbr}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Free</span>{' '}
              Website for Your {city.city} Business
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-light mb-4">
              We pull your Google reviews, photos &amp; hours — and build your website for free.
            </p>
            <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
              Hundreds of businesses in {city.city}, {city.state} still don&apos;t have a website.
              If that&apos;s you, we&apos;ll build one for free. Just type your business name and see it in 15 seconds.
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

        {/* How it works */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">
              How {city.city} Businesses Get a Free Website
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Type Your Business Name', desc: `We search Google for your ${city.city} business and pull your reviews, photos, hours, and contact info.` },
                { num: '2', title: 'See Your Custom Website', desc: 'Choose from multiple professional designs. Your real reviews and photos are already on it.' },
                { num: '3', title: 'Go Live for $9/mo', desc: 'Love it? We host it, maintain it, and keep it updated. Cancel anytime. No contracts.' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-4">
              Perfect for Every {city.city} Business
            </h2>
            <p className="text-gray-500 text-center mb-10">
              If you&apos;re on Google, we can build your site. Here&apos;s who we help most:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {industries.map((ind) => (
                <div
                  key={ind.name}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-indigo-500/20 transition"
                >
                  <span className="text-2xl mb-2 block">{ind.emoji}</span>
                  <h3 className="font-bold text-white text-sm mb-1">{ind.name}</h3>
                  <p className="text-gray-500 text-xs">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why free */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-6">Why Is It Free?</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We use AI to build websites 10x faster than a traditional agency. No designers, no back-and-forth,
              no weeks of waiting. Your Google profile already has everything we need — reviews, photos, hours, location.
            </p>
            <p className="text-gray-400 leading-relaxed">
              You only pay $9/month for hosting. That covers servers, SSL, and support.
              We make money when you stay — so we&apos;re incentivized to build something you actually love.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10">
              What {city.city} Businesses Usually Pay
            </h2>
            <div className="space-y-4">
              {[
                { label: `Local web designer in ${city.city}`, price: '$2,000 – $5,000+', time: '4-8 weeks', you: 'Lots of meetings' },
                { label: 'Wix or Squarespace', price: '$200/year', time: 'Days of your time', you: 'You build it yourself' },
                { label: 'AutoLocal.ai', price: 'FREE ($9/mo hosting)', time: '15 seconds', you: 'We do everything', highlight: true },
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
                    <p className="text-xs text-gray-500">{opt.you}</p>
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
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
              Free
            </p>
            <h2 className="text-3xl font-black mb-4">
              Your {city.city} Business Deserves a Website
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

        {/* Nearby Cities */}
        {nearbyCities.length > 0 && (
          <section className="py-12 px-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-center mb-6 text-gray-400">
                Also Serving Near {city.city}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {nearbyCities.map((nc) => (
                  <Link
                    key={nc.slug}
                    href={`/free-website/${nc.slug}`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-indigo-500/30 transition"
                  >
                    {nc.city}, {nc.stateAbbr}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* More Cities in State */}
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-400">
              Free Websites for More {city.state} Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {stateCities.map((sc) => (
                <Link
                  key={sc.slug}
                  href={`/free-website/${sc.slug}`}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-indigo-500/30 transition"
                >
                  {sc.city}, {sc.stateAbbr}
                </Link>
              ))}
            </div>
          </div>
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
