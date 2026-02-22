import { type AuditResult } from '@/lib/audit-engine'
import { type Prospect } from '@/lib/prospect-finder'
import { runAudit } from '@/lib/audit-engine'

// Generate a mock audit for demo/testing
async function getMockAudit(): Promise<AuditResult> {
  const mockProspect: Prospect = {
    id: 'demo',
    businessName: 'Bright Smile Dental',
    category: 'dentist',
    address: '1234 Main St, Midland, TX',
    city: 'Midland',
    state: 'TX',
    phone: '(432) 555-0123',
    website: 'https://www.brightsmile-example.com',
    googleRating: 3.8,
    googleReviewCount: 23,
  }
  return runAudit(mockProspect)
}

async function getAudit(id: string): Promise<AuditResult | null> {
  // Try Supabase first
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data } = await supabase
        .from('audits')
        .select('data')
        .eq('id', id)
        .single()

      if (data?.data) {
        // Mark as viewed
        await supabase
          .from('audits')
          .update({ report_viewed: true, report_viewed_at: new Date().toISOString() })
          .eq('id', id)
        return data.data as AuditResult
      }
    } catch {
      // Fall through to mock
    }
  }

  // Fallback: return mock for demo
  return getMockAudit()
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400">out of 100</span>
      </div>
    </div>
  )
}

function CategoryBar({ label, score, icon }: { label: string; score: number; icon: string }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-300">{icon} {label}</span>
        <span className="text-sm font-bold text-white">{score}/100</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%`, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function IssueList({ issues }: { issues: string[] }) {
  if (issues.length === 0) return <p className="text-green-400 text-sm">✓ No issues found</p>
  return (
    <ul className="space-y-2">
      {issues.map((issue, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="text-red-400 mt-0.5 shrink-0">✕</span>
          <span className="text-slate-300">{issue}</span>
        </li>
      ))}
    </ul>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[priority] || styles.low}`}>
      {priority.toUpperCase()}
    </span>
  )
}

const packages = [
  { name: 'Social Revive', price: 499, slug: 'social-revive', desc: 'Get your social media active and professional', features: ['3 posts/week across 2 platforms', 'Profile optimization', 'Content calendar'] },
  { name: 'Digital Cleanup', price: 999, slug: 'digital-cleanup', desc: 'Fix your entire online presence', features: ['Everything in Social Revive', 'Google Business optimization', 'Review generation system', 'Monthly reporting'] },
  { name: 'Growth Engine', price: 1999, slug: 'growth-engine', desc: 'Full marketing machine on autopilot', features: ['Everything in Digital Cleanup', '5 posts/week across 3 platforms', 'Email marketing setup', 'Competitor monitoring', 'Local SEO optimization'] },
  { name: 'New Website', price: 3499, slug: 'new-website', desc: 'Modern, fast, mobile-first website', features: ['Custom design', 'Mobile optimized', 'SEO-ready', 'Contact forms', 'Google Analytics', 'SSL included'] },
]

export default async function AuditReportPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id)
  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Audit Not Found</h1>
          <p className="text-slate-400">This audit report may have expired or doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const { prospect, website, googleBusiness, socialMedia, competitors, recommendations, estimatedRevenueLoss } = audit

  // Calculate category scores for the bars
  const websiteScore = !website.exists ? 0 : Math.round(
    (website.hasSsl ? 25 : 0) + (website.hasContactForm ? 25 : 0) +
    ((website.loadTimeMs ?? 5000) < 3000 ? 25 : 0) + ((website.mobileScore ?? 0) > 50 ? 25 : 0)
  )
  const googleScore = Math.min(100, Math.round(
    (googleBusiness.claimed ? 20 : 0) + Math.min(30, googleBusiness.reviewCount / 3) +
    ((googleBusiness.rating ?? 0) >= 4 ? 25 : (googleBusiness.rating ?? 0) >= 3.5 ? 15 : 0) +
    ((googleBusiness.responseRate ?? 0) > 30 ? 15 : 0) + (googleBusiness.hasPhotos ? 10 : 0)
  ))
  const socialScore = Math.min(100, socialMedia.platforms.filter(p => p.found).length * 25)
  const compScore = competitors.length > 0 ? Math.min(100, Math.max(0,
    50 + ((googleBusiness.reviewCount > (competitors[0]?.reviewCount ?? 0) * 0.5) ? 25 : -15) +
    (((googleBusiness.rating ?? 0) >= (competitors[0]?.rating ?? 4)) ? 15 : -10)
  )) : 50

  const dateStr = new Date(audit.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
          <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-2">Free Marketing Audit</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{prospect.businessName}</h1>
          <p className="text-slate-400 mb-8">{prospect.city}, {prospect.state} · {dateStr}</p>
          <ScoreGauge score={audit.overallScore} />
          <p className="text-slate-400 mt-4 text-sm">Overall Digital Presence Score</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8">
        {/* Score Breakdown */}
        <section className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-6">Score Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-x-8">
            <CategoryBar label="Website" score={websiteScore} icon="🌐" />
            <CategoryBar label="Google Business" score={googleScore} icon="📍" />
            <CategoryBar label="Social Media" score={socialScore} icon="📱" />
            <CategoryBar label="vs. Competitors" score={compScore} icon="⚔️" />
          </div>
        </section>

        {/* Revenue Impact */}
        {estimatedRevenueLoss.monthly > 0 && (
          <section className="relative rounded-2xl p-6 md:p-8 border border-red-500/30 bg-red-500/5">
            <h2 className="text-lg font-bold text-white mb-2">💸 Estimated Revenue Impact</h2>
            <p className="text-slate-400 text-sm mb-4">Based on industry averages and your audit findings</p>
            <div className="text-center py-4">
              <p className="text-5xl font-black text-red-400">${estimatedRevenueLoss.monthly.toLocaleString()}</p>
              <p className="text-slate-400 mt-1">estimated lost revenue per month</p>
              <p className="text-red-300/70 text-sm mt-1">That&apos;s ${estimatedRevenueLoss.annual.toLocaleString()}/year</p>
            </div>
            <ul className="space-y-2 mt-4">
              {estimatedRevenueLoss.breakdown.map((item, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Website Analysis */}
        <section className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-4">🌐 Website Analysis</h2>
          {!website.exists ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 font-semibold">No website found</p>
              <p className="text-slate-400 text-sm mt-1">This is the single biggest gap in your digital presence.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">URL</span>
                  <span className="text-cyan-400 truncate ml-4">{website.url}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Load Time</span>
                  <span className={(website.loadTimeMs ?? 0) > 3000 ? 'text-red-400' : 'text-green-400'}>
                    {((website.loadTimeMs ?? 0) / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">SSL/HTTPS</span>
                  <span className={website.hasSsl ? 'text-green-400' : 'text-red-400'}>
                    {website.hasSsl ? '✓ Secure' : '✕ Not Secure'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Contact Form</span>
                  <span className={website.hasContactForm ? 'text-green-400' : 'text-red-400'}>
                    {website.hasContactForm ? '✓ Found' : '✕ Not Found'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mobile Ready</span>
                  <span className={(website.mobileScore ?? 0) > 50 ? 'text-green-400' : 'text-yellow-400'}>
                    {(website.mobileScore ?? 0) > 50 ? '✓ Yes' : '⚠ Needs Work'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-2">Issues Found</p>
                <IssueList issues={website.issues} />
              </div>
            </div>
          )}
        </section>

        {/* Google Business */}
        <section className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-4">📍 Google Business Profile</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Claimed</span>
                <span className={googleBusiness.claimed ? 'text-green-400' : 'text-red-400'}>
                  {googleBusiness.claimed ? '✓ Yes' : '✕ No'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rating</span>
                <span className={(googleBusiness.rating ?? 0) >= 4.0 ? 'text-green-400' : 'text-yellow-400'}>
                  ⭐ {googleBusiness.rating?.toFixed(1) ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Reviews</span>
                <span className={googleBusiness.reviewCount >= 50 ? 'text-green-400' : 'text-red-400'}>
                  {googleBusiness.reviewCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Response Rate</span>
                <span className={(googleBusiness.responseRate ?? 0) > 50 ? 'text-green-400' : 'text-yellow-400'}>
                  {googleBusiness.responseRate ?? 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Photos</span>
                <span className="text-slate-300">{googleBusiness.photoCount}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Issues Found</p>
              <IssueList issues={googleBusiness.issues} />
            </div>
          </div>

          {/* Review comparison with competitors */}
          {competitors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm font-medium text-slate-400 mb-3">Your Reviews vs. Competitors</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-cyan-400 w-40 truncate font-medium">{prospect.businessName}</span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (googleBusiness.reviewCount / Math.max(...competitors.map(c => c.reviewCount), 1)) * 100)}%` }} />
                  </div>
                  <span className="text-sm text-white w-12 text-right">{googleBusiness.reviewCount}</span>
                </div>
                {competitors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-40 truncate">{c.name}</span>
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, (c.reviewCount / Math.max(...competitors.map(cc => cc.reviewCount), 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-slate-400 w-12 text-right">{c.reviewCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Social Media */}
        <section className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-4">📱 Social Media Presence</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialMedia.platforms.map((p, i) => (
              <div key={i} className={`rounded-xl p-4 border ${p.found ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white capitalize">{p.platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.found ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
                {p.found ? (
                  <div className="space-y-1 text-sm text-slate-400">
                    {p.followerCount !== undefined && <p>{p.followerCount.toLocaleString()} followers</p>}
                    {p.postFrequency && <p>Posting: {p.postFrequency}</p>}
                    {p.lastPostDate && <p>Last post: {p.lastPostDate}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-red-400/70">Missing opportunity</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Competitor Comparison */}
        {competitors.length > 0 && (
          <section className="glass rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-4">⚔️ Competitor Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-slate-400 font-medium">Business</th>
                    <th className="text-center py-3 text-slate-400 font-medium">Rating</th>
                    <th className="text-center py-3 text-slate-400 font-medium">Reviews</th>
                    <th className="text-center py-3 text-slate-400 font-medium">Website</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 bg-cyan-500/5">
                    <td className="py-3 text-cyan-400 font-semibold">{prospect.businessName} (You)</td>
                    <td className="py-3 text-center text-white">⭐ {googleBusiness.rating?.toFixed(1) ?? 'N/A'}</td>
                    <td className="py-3 text-center text-white">{googleBusiness.reviewCount}</td>
                    <td className="py-3 text-center">{website.exists ? <span className="text-green-400">✓</span> : <span className="text-red-400">✕</span>}</td>
                    <td className="py-3 text-slate-400">—</td>
                  </tr>
                  {competitors.map((c, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 text-white">{c.name}</td>
                      <td className="py-3 text-center text-white">⭐ {c.rating?.toFixed(1) ?? 'N/A'}</td>
                      <td className="py-3 text-center text-white">{c.reviewCount}</td>
                      <td className="py-3 text-center">{c.website ? <span className="text-green-400">✓</span> : <span className="text-red-400">✕</span>}</td>
                      <td className="py-3 text-slate-400 text-xs">{c.advantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-4">🎯 Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <PriorityBadge priority={rec.priority} />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">{rec.category}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{rec.title}</h3>
                <p className="text-slate-400 text-sm mb-2">{rec.description}</p>
                <p className="text-cyan-400 text-xs font-medium">💡 {rec.estimatedImpact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-indigo-600/20" />
          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Ready to fix this?</h2>
            <p className="text-slate-300 mb-8">Flat rates. No contracts. No BS. Just results.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <a
                  key={pkg.slug}
                  href={`/client/demo?package=${pkg.slug}`}
                  className="glass rounded-xl p-5 text-left hover:border-cyan-400/40 transition-all hover:-translate-y-1 block"
                >
                  <p className="text-white font-bold text-lg">{pkg.name}</p>
                  <p className="text-cyan-400 text-2xl font-black my-2">${pkg.price.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                  <p className="text-slate-400 text-xs mb-3">{pkg.desc}</p>
                  <ul className="space-y-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-start gap-1">
                        <span className="text-cyan-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm pt-8 pb-4">
          <p className="gradient-text font-bold text-lg mb-1">AutoLocal.ai</p>
          <p>Agentic Marketing for Local Businesses</p>
          <p className="mt-4 text-xs">This audit was generated automatically using public data. Results are estimates and may vary.</p>
        </footer>
      </div>
    </div>
  )
}
