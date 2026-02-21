import { type AuditResult } from './audit-engine'

export function generateAuditEmail(audit: AuditResult, reportUrl: string): {
  subject: string
  html: string
  text: string
} {
  const { prospect, overallScore, website, googleBusiness, socialMedia, recommendations, estimatedRevenueLoss } = audit

  // Pick the top 3-4 most shocking findings
  const shockingFindings: string[] = []
  if (!website.exists) shockingFindings.push('You don\'t have a website — 46% of Google searches are local, and you\'re invisible to all of them.')
  if (googleBusiness.reviewCount < 20) shockingFindings.push(`You have only ${googleBusiness.reviewCount} Google reviews. Your top competitors have 100+.`)
  if (googleBusiness.rating !== undefined && googleBusiness.rating < 4.0) shockingFindings.push(`Your ${googleBusiness.rating}-star rating is below the 4.0 cutoff where most customers start filtering.`)
  if (website.exists && (website.loadTimeMs ?? 0) > 3000) shockingFindings.push(`Your website takes ${((website.loadTimeMs ?? 0) / 1000).toFixed(1)} seconds to load. 53% of visitors leave after 3 seconds.`)
  if (!website.hasSsl && website.exists) shockingFindings.push('Your website shows a "Not Secure" warning in Chrome — that\'s an instant trust killer.')
  const noSocial = socialMedia.platforms.filter(p => !p.found).length
  if (noSocial >= 3) shockingFindings.push(`You're missing from ${noSocial} major social platforms where your customers spend 2+ hours daily.`)
  if (estimatedRevenueLoss.monthly > 0) shockingFindings.push(`We estimate you're losing approximately $${estimatedRevenueLoss.monthly.toLocaleString()}/month to these gaps.`)

  const topFindings = shockingFindings.slice(0, 4)
  const criticalRecs = recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3)

  const subject = `${prospect.businessName}: Your free marketing audit is ready (Score: ${overallScore}/100)`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e27; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; margin-bottom: 32px; }
    .score-badge { display: inline-block; width: 100px; height: 100px; line-height: 100px; border-radius: 50%; font-size: 36px; font-weight: 800; color: white; background: ${overallScore >= 70 ? '#22c55e' : overallScore >= 40 ? '#eab308' : '#ef4444'}; margin: 16px 0; }
    .finding { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; font-size: 15px; }
    .rec { background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
    .rec-title { font-weight: 600; color: #38bdf8; margin-bottom: 4px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .revenue-box { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .revenue-amount { font-size: 32px; font-weight: 800; color: #ef4444; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0; }
    .footer { text-align: center; color: #64748b; font-size: 13px; margin-top: 32px; }
    a { color: #38bdf8; }
    h1 { color: white; font-size: 24px; margin: 0; }
    h2 { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Free Marketing Audit</h1>
      <p style="color: #94a3b8; margin: 4px 0 16px;">${prospect.businessName} · ${prospect.city}, ${prospect.state}</p>
      <div class="score-badge">${overallScore}</div>
      <p style="color: #94a3b8;">out of 100</p>
    </div>

    <h2>⚠️ What We Found</h2>
    ${topFindings.map(f => `<div class="finding">${f}</div>`).join('\n    ')}

    ${estimatedRevenueLoss.monthly > 500 ? `
    <div class="revenue-box">
      <p style="color: #94a3b8; margin: 0 0 8px; font-size: 14px;">Estimated Monthly Revenue Loss</p>
      <div class="revenue-amount">$${estimatedRevenueLoss.monthly.toLocaleString()}</div>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 13px;">That's $${estimatedRevenueLoss.annual.toLocaleString()}/year walking out the door</p>
    </div>
    ` : ''}

    ${criticalRecs.length > 0 ? `
    <h2>🎯 Top Recommendations</h2>
    ${criticalRecs.map(r => `<div class="rec"><div class="rec-title">${r.title}</div><div>${r.estimatedImpact}</div></div>`).join('\n    ')}
    ` : ''}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${reportUrl}" class="cta-btn">View Full Report →</a>
    </div>

    <hr class="divider">

    <div style="text-align: center;">
      <p style="font-size: 18px; font-weight: 600; color: white;">Want us to fix this?</p>
      <p style="color: #94a3b8;">Flat rates. No contracts. No BS.</p>
      <p style="color: #94a3b8; font-size: 14px;">Starting at $500/month</p>
    </div>

    <div class="footer">
      <p><strong>AutoLocal.ai</strong> — Agentic Marketing for Local Businesses</p>
      <p><a href="{unsubscribe_url}">Unsubscribe</a> · This audit was generated automatically</p>
    </div>
  </div>
</body>
</html>`

  const text = `YOUR FREE MARKETING AUDIT
${prospect.businessName} · ${prospect.city}, ${prospect.state}

OVERALL SCORE: ${overallScore}/100

WHAT WE FOUND:
${topFindings.map(f => `• ${f}`).join('\n')}

${estimatedRevenueLoss.monthly > 500 ? `ESTIMATED MONTHLY REVENUE LOSS: $${estimatedRevenueLoss.monthly.toLocaleString()}\nThat's $${estimatedRevenueLoss.annual.toLocaleString()}/year.\n` : ''}
${criticalRecs.length > 0 ? `TOP RECOMMENDATIONS:\n${criticalRecs.map(r => `• ${r.title} — ${r.estimatedImpact}`).join('\n')}\n` : ''}
VIEW FULL REPORT: ${reportUrl}

---
Want us to fix this? Flat rates. No contracts. No BS.
Starting at $500/month.

AutoLocal.ai — Agentic Marketing for Local Businesses
Unsubscribe: {unsubscribe_url}`

  return { subject, html, text }
}
