'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function getSteps(slug: string) {
  const target = slug ? `${slug}.autolocal.ai` : 'yourbusiness.autolocal.ai'
  return [
    {
      name: 'GoDaddy',
      logo: '🟢',
      steps: [
        'Log in to your GoDaddy account at godaddy.com',
        'Click "My Products" → find your domain → click "DNS"',
        `Delete any existing A record with Name "@" (if one exists)`,
        `Add a CNAME record: Type = "CNAME", Name = "@", Value = "${target}"`,
        `Add another CNAME record: Type = "CNAME", Name = "www", Value = "${target}"`,
        'Set TTL to "1 Hour" and click Save',
        'Wait 15-30 minutes for changes to take effect',
      ],
    },
    {
      name: 'Namecheap',
      logo: '🔴',
      steps: [
        'Log in at namecheap.com → go to "Domain List"',
        'Click "Manage" next to your domain',
        'Click the "Advanced DNS" tab',
        'Delete any existing A Record with Host "@"',
        `Add a new CNAME Record: Host = "@", Value = "${target}"`,
        `Add a new CNAME Record: Host = "www", Value = "${target}"`,
        'Click the green checkmark to save each one',
        'Changes usually take effect within 15 minutes',
      ],
    },
    {
      name: 'Squarespace / Google Domains',
      logo: '🔵',
      steps: [
        'Log in at domains.squarespace.com (Google Domains moved here)',
        'Click on your domain → go to "DNS" in the left sidebar',
        'Scroll to "Custom Records"',
        'Delete any A record with Host "@"',
        `Add a CNAME record: Host = @, Type = CNAME, Data = "${target}"`,
        `Add a CNAME record: Host = www, Type = CNAME, Data = "${target}"`,
        'Click "Save" — changes propagate within 30 minutes',
      ],
    },
    {
      name: 'Cloudflare',
      logo: '🟠',
      steps: [
        'Log in at dash.cloudflare.com',
        'Select your domain → click "DNS" in the sidebar',
        'Delete any existing A record for "@" or your root domain',
        `Add a CNAME record: Name = @, Content = "${target}"`,
        `Add a CNAME record: Name = www, Content = "${target}"`,
        'Set the orange cloud (Proxy) to ON for both records',
        'Click Save — Cloudflare updates are nearly instant',
      ],
    },
    {
      name: 'Other Provider',
      logo: '⚙️',
      steps: [
        'Log in to your domain registrar (wherever you bought the domain)',
        'Find "DNS Settings", "DNS Management", or "DNS Records"',
        'Delete any existing A record for your root domain (@)',
        `Add a CNAME record: Name/Host = "@", Value/Points to = "${target}"`,
        `Add a CNAME record: Name/Host = "www", Value/Points to = "${target}"`,
        'Save your changes — most providers take 15-60 minutes to propagate',
        'Stuck? Email brian@autolocal.ai with a screenshot — we\'ll help free',
      ],
    },
  ]
}

function SetupContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const PROVIDERS = getSteps(slug)
  const target = slug ? `${slug}.autolocal.ai` : 'yourbusiness.autolocal.ai'

  const [activeProvider, setActiveProvider] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const toggleStep = (key: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="https://autolocal.ai" className="text-xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AutoLocal</span>
            <span className="text-gray-500">.ai</span>
          </a>
          <a href="mailto:brian@autolocal.ai" className="text-sm text-gray-400 hover:text-white transition">
            Need help? Email us →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Connect Your Domain
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Point your domain to your AutoLocal site in about 5 minutes. 
            No technical experience needed.
          </p>
        </div>
      </section>

      {/* Quick Answer — What to point to */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> The Short Version
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Go to your domain registrar&apos;s DNS settings and add these two records:
            </p>
            <div className="bg-black/40 rounded-xl p-4 sm:p-6 font-mono text-sm space-y-3 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-gray-500 w-16 shrink-0">Type:</span>
                <span className="text-indigo-400 font-bold">CNAME</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <span className="text-gray-500 w-16 shrink-0">Name:</span>
                <span className="text-yellow-400">@</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <span className="text-gray-500 w-16 shrink-0">Value:</span>
                <span className="text-green-400 break-all">{target}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-gray-500 w-16 shrink-0">Type:</span>
                <span className="text-indigo-400 font-bold">CNAME</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <span className="text-gray-500 w-16 shrink-0">Name:</span>
                <span className="text-yellow-400">www</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <span className="text-gray-500 w-16 shrink-0">Value:</span>
                <span className="text-green-400 break-all">{target}</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              ⚠️ Delete any existing A records for @ first — they&apos;ll conflict with the CNAME. 
              Then email <a href={`mailto:brian@autolocal.ai?subject=Domain connected for ${slug || 'my site'}&body=Hi Brian, I just pointed my domain to ${target}. My domain is: `} className="text-indigo-400 hover:underline">brian@autolocal.ai</a> and we&apos;ll activate it.
            </p>
          </div>
        </div>
      </section>

      {/* Don't have a domain? */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <span className="text-3xl">🌐</span>
              <div>
                <p className="font-bold text-white text-lg mb-1">Don&apos;t have a domain yet?</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A .com domain costs about $10-15/year. Search for your business name and grab it — then come back here to connect it.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="https://www.cloudflare.com/products/registrar/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 transition group"
              >
                <span className="text-xl">🟠</span>
                <div>
                  <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition">Cloudflare</p>
                  <p className="text-gray-500 text-xs">At-cost pricing (~$10/yr)</p>
                </div>
              </a>
              <a
                href="https://www.namecheap.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 transition group"
              >
                <span className="text-xl">🔴</span>
                <div>
                  <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition">Namecheap</p>
                  <p className="text-gray-500 text-xs">Popular + easy (~$12/yr)</p>
                </div>
              </a>
              <a
                href="https://domains.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 transition group"
              >
                <span className="text-xl">🔵</span>
                <div>
                  <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition">Google Domains</p>
                  <p className="text-gray-500 text-xs">Simple + trusted (~$12/yr)</p>
                </div>
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">💡 Tip: Search for <strong className="text-gray-400">yourbusinessname.com</strong> — keep it short, easy to spell, and memorable.</p>
          </div>
        </div>
      </section>

      {/* Skip it — we'll do it for you */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-3xl">🤝</span>
            <div className="flex-1">
              <p className="font-bold text-white mb-1">Rather we just do it for you?</p>
              <p className="text-gray-400 text-sm">
                Email us your domain login credentials and we&apos;ll set everything up. Free — included with your site.
              </p>
            </div>
            <a
              href="mailto:brian@autolocal.ai?subject=Please connect my domain&body=Hi Brian,%0A%0AMy domain is: %0AMy registrar login: %0A%0AThanks!"
              className="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-500 transition shrink-0"
            >
              Email Us →
            </a>
          </div>
        </div>
      </section>

      {/* Provider-Specific Step-by-Step */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-2">Step-by-Step Guide</h2>
          <p className="text-gray-500 text-sm mb-6">Select your domain provider for specific instructions:</p>
          
          {/* Provider pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {PROVIDERS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setActiveProvider(i); setCompletedSteps(new Set()) }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeProvider === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                }`}
              >
                <span>{p.logo}</span>
                {p.name}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {PROVIDERS[activeProvider].steps.map((step, i) => {
              const key = `${activeProvider}-${i}`
              const done = completedSteps.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleStep(key)}
                  className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                    done
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                    done ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-sm leading-relaxed pt-1 ${done ? 'text-green-300 line-through opacity-70' : 'text-gray-300'}`}>
                    {step}
                  </p>
                </button>
              )
            })}
          </div>

          {/* After connecting */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold mb-3">After You Connect Your Domain</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-4">
              DNS changes typically take 5-30 minutes (up to 48 hours in rare cases). 
              Once propagated, email us and we&apos;ll activate your custom domain — you&apos;ll see your site at your own .com!
            </p>
            <a
              href={`mailto:brian@autolocal.ai?subject=Domain connected for ${slug || 'my site'}&body=Hi Brian, I just pointed my domain to ${target}. My domain is: `}
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition"
            >
              Let Us Know It&apos;s Connected →
            </a>
            <p className="text-gray-500 text-xs mt-4">
              Something not working? Email <a href="mailto:brian@autolocal.ai" className="text-indigo-400 hover:underline">brian@autolocal.ai</a> — we&apos;ll troubleshoot free.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} AutoLocal.ai · brian@autolocal.ai
        </p>
      </footer>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <SetupContent />
    </Suspense>
  )
}
