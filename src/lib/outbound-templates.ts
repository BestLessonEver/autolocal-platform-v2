/**
 * AutoLocal.ai — Outbound Email Templates
 *
 * Loads the right cold email template based on business category,
 * fills variables, generates personalized "what we'd fix" sections,
 * and produces HTML + plain text versions.
 */

import { type AuditResult } from './audit-engine'
import { type SalesApproach } from './approach-selector'

// ============================================================
// Template Variables
// ============================================================

export interface TemplateVars {
  business_name: string
  owner_name: string
  city: string
  score: string
  worst_area: string
  competitor_name: string
  report_url: string
  unsubscribe_url: string
}

// ============================================================
// Subject Lines by Category
// ============================================================

const SUBJECT_LINES: Record<string, string[]> = {
  salon: [
    '{{business_name}} — idea to fill your empty chairs',
    'Your transformations deserve more eyeballs',
    '{{owner_name}}, quick thought about {{business_name}}',
  ],
  dentist: [
    'Quick question about {{business_name}}',
    '{{owner_name}}, your competitors are getting 3x more new patients',
    '{{business_name}} — idea to fill your schedule',
  ],
  restaurant: [
    '{{business_name}} — idea to fill more tables',
    '{{owner_name}}, quick thought about {{business_name}}',
    'How {{city}} foodies find restaurants in 2026',
  ],
  fitness: [
    '{{business_name}} — idea to get more members',
    '{{owner_name}}, quick question about {{business_name}}',
    'Noticed something about {{business_name}}',
  ],
  default: [
    'Quick question about {{business_name}}',
    '{{owner_name}}, noticed something about {{business_name}}',
    'Idea for {{business_name}} — 2 min read',
  ],
}

// ============================================================
// Plain Text Templates by Category
// ============================================================

const PLAIN_TEMPLATES: Record<string, string> = {
  salon: `Hey {{owner_name}},

I was checking out {{business_name}} — your work is incredible. But I know the grind: you're amazing at transformations, not so excited about posting them consistently or asking every client for a Google review.

I ran a quick digital audit on {{business_name}} and you scored {{score}}/100. The biggest gap is your {{worst_area}}, and {{competitor_name}} is pulling ahead in that area.

I put together a free report showing exactly what's happening and what I'd fix first:
{{report_url}}

Takes 2 minutes to look at. If you want to chat about it, I'm around.

Best,
Brian Carrion
AutoLocal.ai
(346) 341-0836
brian@autolocal.ai

---
You're receiving this because your business is publicly listed and we thought this analysis might be useful.
If you'd rather not hear from us: {{unsubscribe_url}}`,

  dentist: `Hey {{owner_name}},

I was looking at dental practices in {{city}} and noticed something about {{business_name}} — you're losing patients to {{competitor_name}} because of a few fixable digital gaps.

I ran a quick audit and {{business_name}} scored {{score}}/100. Your biggest gap: {{worst_area}}.

Here's the full breakdown (free, no strings):
{{report_url}}

When someone searches "dentist near me" in {{city}}, small differences in your online presence determine who gets the call. Right now, those differences are working against you.

Happy to walk through it if you're curious — takes 15 minutes.

Best,
Brian Carrion
AutoLocal.ai
(346) 341-0836
brian@autolocal.ai

---
You're receiving this because your business is publicly listed and we thought this analysis might be useful.
If you'd rather not hear from us: {{unsubscribe_url}}`,

  restaurant: `Hey {{owner_name}},

I was looking at restaurants in {{city}} and came across {{business_name}}. Love the concept — but I noticed a few things online that might be costing you covers.

Quick audit: {{business_name}} scored {{score}}/100. Biggest gap is {{worst_area}}, and {{competitor_name}} is doing better there right now.

Full report (free):
{{report_url}}

In 2026, 87% of diners check a restaurant online before visiting. The details matter more than most owners realize.

Worth 15 minutes if you want to chat about it?

Best,
Brian Carrion
AutoLocal.ai
(346) 341-0836
brian@autolocal.ai

---
You're receiving this because your business is publicly listed and we thought this analysis might be useful.
If you'd rather not hear from us: {{unsubscribe_url}}`,

  default: `Hey {{owner_name}},

I came across {{business_name}} and love what you're doing in {{city}}.

I ran a quick digital audit and noticed some gaps that might be costing you customers. Your score: {{score}}/100. Biggest area to improve: {{worst_area}}.

{{competitor_name}} is ahead in that area right now — but the gap is totally closeable.

Here's your full report (free, no strings):
{{report_url}}

I help local businesses like yours get more customers through AI-powered marketing — showing up higher on Google, getting more reviews automatically, and keeping social media active without you lifting a finger.

Worth a 15-min call this week?

Best,
Brian Carrion
AutoLocal.ai
(346) 341-0836
brian@autolocal.ai

---
You're receiving this because your business is publicly listed and we thought this analysis might be useful.
If you'd rather not hear from us: {{unsubscribe_url}}`,
}

// ============================================================
// "What We'd Fix" Section Generator
// ============================================================

function generateFixSection(audit: AuditResult, approach: SalesApproach): string {
  const fixes: string[] = []

  // Lead with the approach's pain points
  for (const point of approach.painPoints.slice(0, 3)) {
    fixes.push(`• ${point}`)
  }

  // Add top recommendations
  const criticalRecs = audit.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
  for (const rec of criticalRecs.slice(0, 2)) {
    if (!fixes.some(f => f.toLowerCase().includes(rec.category.toLowerCase()))) {
      fixes.push(`• ${rec.title}: ${rec.estimatedImpact}`)
    }
  }

  return fixes.slice(0, 4).join('\n')
}

function generateFixSectionHtml(audit: AuditResult, approach: SalesApproach): string {
  const fixes: string[] = []

  for (const point of approach.painPoints.slice(0, 3)) {
    fixes.push(`<li style="margin-bottom:8px;color:#374151;">${escapeHtml(point)}</li>`)
  }

  const criticalRecs = audit.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
  for (const rec of criticalRecs.slice(0, 2)) {
    if (!fixes.some(f => f.toLowerCase().includes(rec.category.toLowerCase()))) {
      fixes.push(`<li style="margin-bottom:8px;color:#374151;"><strong>${escapeHtml(rec.title)}</strong> — ${escapeHtml(rec.estimatedImpact)}</li>`)
    }
  }

  return fixes.slice(0, 4).join('\n')
}

// ============================================================
// Worst Area Identifier
// ============================================================

export function identifyWorstArea(audit: AuditResult): string {
  const areas: { name: string; issues: number }[] = [
    { name: 'website', issues: audit.website.issues.length + (!audit.website.exists ? 5 : 0) },
    { name: 'Google reviews', issues: audit.googleBusiness.issues.length + (audit.googleBusiness.reviewCount < 20 ? 3 : 0) },
    { name: 'social media', issues: audit.socialMedia.platforms.filter(p => !p.found).length },
  ]
  areas.sort((a, b) => b.issues - a.issues)
  return areas[0].name
}

// ============================================================
// Template Filling
// ============================================================

function fillTemplate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{\{business_name\}\}/g, vars.business_name)
    .replace(/\{\{owner_name\}\}/g, vars.owner_name)
    .replace(/\{\{city\}\}/g, vars.city)
    .replace(/\{\{score\}\}/g, vars.score)
    .replace(/\{\{worst_area\}\}/g, vars.worst_area)
    .replace(/\{\{competitor_name\}\}/g, vars.competitor_name)
    .replace(/\{\{report_url\}\}/g, vars.report_url)
    .replace(/\{\{unsubscribe_url\}\}/g, vars.unsubscribe_url)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ============================================================
// HTML Email Generator
// ============================================================

function generateHtmlEmail(
  plainBody: string,
  vars: TemplateVars,
  audit: AuditResult,
  approach: SalesApproach
): string {
  const scoreColor = audit.overallScore >= 70 ? '#16a34a' : audit.overallScore >= 40 ? '#d97706' : '#dc2626'
  const fixItems = generateFixSectionHtml(audit, approach)

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

<!-- Body -->
<tr><td style="padding:32px 32px 16px;">
  <p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 16px;">
    Hey ${escapeHtml(vars.owner_name)},
  </p>
  <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 20px;">
    ${escapeHtml(approach.hook)}
  </p>
</td></tr>

<!-- Score Card -->
<tr><td style="padding:0 32px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
  <tr><td style="padding:20px;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Your Digital Score</p>
    <p style="margin:0;font-size:48px;font-weight:700;color:${scoreColor};">${vars.score}<span style="font-size:20px;color:#9ca3af;">/100</span></p>
    <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">Biggest gap: <strong style="color:#111827;">${escapeHtml(vars.worst_area)}</strong></p>
  </td></tr>
  </table>
</td></tr>

<!-- What We'd Fix -->
<tr><td style="padding:0 32px 20px;">
  <p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 10px;">Here's what I'd fix first:</p>
  <ul style="margin:0;padding:0 0 0 20px;font-size:15px;line-height:1.7;">
    ${fixItems}
  </ul>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 32px 24px;text-align:center;">
  <a href="${escapeHtml(vars.report_url)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">See Your Full Report →</a>
  <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">Free. No sign-up required.</p>
</td></tr>

<!-- Sign-off -->
<tr><td style="padding:0 32px 32px;">
  <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
    Worth a 15-minute call this week? I can walk you through the full report and show you exactly how to close these gaps.
  </p>
  <p style="font-size:15px;color:#111827;margin:0;">
    Best,<br>
    <strong>Brian Carrion</strong><br>
    <span style="color:#6b7280;">AutoLocal.ai · (346) 341-0836</span><br>
    <a href="mailto:brian@autolocal.ai" style="color:#2563eb;text-decoration:none;">brian@autolocal.ai</a>
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;text-align:center;">
    You're receiving this because ${escapeHtml(vars.business_name)} is publicly listed and we thought this analysis might be useful.<br>
    <a href="${escapeHtml(vars.unsubscribe_url)}" style="color:#9ca3af;">Unsubscribe</a> · AutoLocal.ai · Houston, TX
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ============================================================
// Main Export: Build Email
// ============================================================

export interface OutboundEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

export function buildOutboundEmail(
  audit: AuditResult,
  approach: SalesApproach,
  recipientEmail: string,
  ownerName?: string
): OutboundEmail {
  const category = audit.prospect.category?.toLowerCase() || 'default'
  const templateKey = PLAIN_TEMPLATES[category] ? category : 'default'
  const subjectLines = SUBJECT_LINES[category] || SUBJECT_LINES.default

  const worstArea = identifyWorstArea(audit)
  const topCompetitor = audit.competitors[0]

  const vars: TemplateVars = {
    business_name: audit.prospect.businessName,
    owner_name: ownerName || 'there',
    city: audit.prospect.city,
    score: String(audit.overallScore),
    worst_area: worstArea,
    competitor_name: topCompetitor?.name || 'your top competitor',
    report_url: `https://autolocal.ai/audit/${audit.id || 'preview'}`,
    unsubscribe_url: `https://autolocal.ai/unsubscribe?email=${encodeURIComponent(recipientEmail)}`,
  }

  // Pick a random subject line and fill it
  const subjectTemplate = subjectLines[Math.floor(Math.random() * subjectLines.length)]
  const subject = fillTemplate(subjectTemplate, vars)

  // Build plain text with fix section injected
  let plainText = fillTemplate(PLAIN_TEMPLATES[templateKey], vars)
  const fixSection = generateFixSection(audit, approach)
  // Insert fix section before the report URL line
  plainText = plainText.replace(
    vars.report_url,
    `Here's what I'd fix first:\n${fixSection}\n\nFull report:\n${vars.report_url}`
  )

  const html = generateHtmlEmail(plainText, vars, audit, approach)

  return {
    to: recipientEmail,
    from: 'Brian Carrion <brian@autolocal.ai>',
    subject,
    text: plainText,
    html,
  }
}
