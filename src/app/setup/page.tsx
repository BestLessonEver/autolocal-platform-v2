'use client'

import { useState } from 'react'

const PROVIDERS = [
  {
    name: 'GoDaddy',
    logo: '🟢',
    steps: [
      'Log in to your GoDaddy account at godaddy.com',
      'Click "My Products" → find your domain → click "DNS"',
      'Under "Records", find the row with Type "A" and Name "@"',
      'Click the pencil icon to edit it',
      'Change the "Value" to the IP address we provided in your welcome email',
      'Set TTL to "1 Hour" and click Save',
      'Add a CNAME record: Name = "www", Value = your AutoLocal subdomain (e.g. yourbusiness.autolocal.ai)',
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
      'Find the "A Record" with Host "@" — click edit',
      'Change the Value to the IP address from your welcome email',
      'Add a new CNAME Record: Host = "www", Value = your AutoLocal subdomain',
      'Click the green checkmark to save',
      'Changes usually take effect within 15 minutes',
    ],
  },
  {
    name: 'Google Domains / Squarespace',
    logo: '🔵',
    steps: [
      'Log in at domains.squarespace.com (Google Domains moved here)',
      'Click on your domain → go to "DNS" in the left sidebar',
      'Scroll to "Custom Records"',
      'Add an A record: Host = @, Type = A, Data = your IP from the welcome email',
      'Add a CNAME record: Host = www, Type = CNAME, Data = your AutoLocal subdomain',
      'Click "Save" — changes propagate within 30 minutes',
    ],
  },
  {
    name: 'Cloudflare',
    logo: '🟠',
    steps: [
      'Log in at dash.cloudflare.com',
      'Select your domain → click "DNS" in the sidebar',
      'Find or add an A record: Name = @, Content = your IP from the welcome email',
      'Add a CNAME record: Name = www, Content = your AutoLocal subdomain',
      'Make sure the orange cloud (Proxy) is ON for both records',
      'Click Save — Cloudflare updates are nearly instant',
    ],
  },
  {
    name: 'Other Provider',
    logo: '⚙️',
    steps: [
      'Log in to wherever you purchased your domain (your domain registrar)',
      'Look for "DNS Settings", "DNS Management", or "Name Server" settings',
      'Find or create an A record pointing @ (or your root domain) to the IP in your welcome email',
      'Find or create a CNAME record pointing "www" to your AutoLocal subdomain',
      'Save your changes — most providers take 15-60 minutes to propagate',
      'If you get stuck, email us at brian@autolocal.ai with a screenshot and we\'ll walk you through it',
    ],
  },
]

export default function SetupPage() {
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
            Follow these simple steps to point your domain to your new AutoLocal website. 
            Takes about 5 minutes — no technical experience needed.
          </p>
        </div>
      </section>

      {/* Don't have a domain? */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <span className="text-3xl">🌐</span>
              <div>
                <p className="font-bold text-white text-lg mb-1">Don&apos;t have a domain yet?</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A .com domain costs about $10-15/year. Search for your business name and grab it — then come back here to connect it to your site.
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

      {/* Provider Selector + Steps */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6">Step-by-Step Guide</h2>
          
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
              DNS changes can take anywhere from 5 minutes to 48 hours to fully propagate (usually under 30 minutes). 
              Once it&apos;s live, you&apos;ll see your beautiful new website at your domain. 
            </p>
            <p className="text-gray-400 text-sm">
              Something not working? Email <a href="mailto:brian@autolocal.ai" className="text-indigo-400 hover:underline">brian@autolocal.ai</a> and 
              we&apos;ll troubleshoot it for you — free.
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
