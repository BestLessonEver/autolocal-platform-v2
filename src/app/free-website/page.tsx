import { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Free Websites for Small Businesses by City | AutoLocal.ai',
  description: 'Free custom websites for small businesses across Mississippi, Alabama, Arkansas, West Virginia, and Louisiana. Built from your Google profile in 15 seconds.',
  keywords: 'free website small business, free website by city, local business website, cheap website design, AutoLocal',
  alternates: { canonical: 'https://autolocal.ai/free-website' },
}

export default function FreeWebsiteIndex() {
  const states = Array.from(new Set(allCities.map((c) => c.state))).sort()
  const byState = states.map((state) => ({
    state,
    abbr: allCities.find((c) => c.state === state)!.stateAbbr,
    cities: allCities.filter((c) => c.state === state).sort((a, b) => a.city.localeCompare(b.city)),
  }))

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
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

      <section className="pt-32 pb-12 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Free</span>{' '}
          Websites by City
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We&apos;re building free websites for small businesses across the South. Find your city below.
        </p>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {byState.map(({ state, abbr, cities: stateCities }) => (
            <div key={state}>
              <h2 className="text-2xl font-black mb-4 text-indigo-400">{state}</h2>
              <div className="flex flex-wrap gap-3">
                {stateCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/free-website/${c.slug}`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:border-indigo-500/30 transition"
                  >
                    {c.city}, {abbr}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5 text-center">
        <h2 className="text-3xl font-black mb-4">Don&apos;t See Your City?</h2>
        <p className="text-gray-400 mb-8">We serve businesses everywhere. Get your free website now.</p>
        <Link
          href="/#order"
          className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Get My Free Website →
        </Link>
      </section>

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
  )
}
