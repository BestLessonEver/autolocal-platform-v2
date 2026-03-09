// Generate a PDF review of all AutoLocal emails
// Usage: npx tsx scripts/generate-email-review.ts

import { writeFileSync } from 'fs'

const emails = [
  // === TRANSACTIONAL ===
  {
    category: 'TRANSACTIONAL EMAILS',
    name: 'Welcome Email',
    trigger: 'Immediately on free site generation',
    subject: 'Your {Business Name} website is ready! 🎉',
    body: [
      'Hi {firstName} 👋',
      '',
      'We just built a custom website for {Business Name} using your real Google reviews, photos, and business info.',
      '',
      'Here\'s what you can do next:',
      '1. Preview your custom website',
      '2. Edit text, photos, colors, and template from your dashboard',
      '3. Love it? Go live — your first month is FREE',
      '',
      '🎉 Free Month Promo',
      'Activate hosting from your dashboard — $0 today, just $9/mo after your free trial.',
      '',
      '[Go to My Dashboard →]',
      '',
      'Or preview your site directly: autolocal.ai/preview/{slug}',
    ],
  },
  {
    category: '',
    name: 'Hosting Activation Confirmation',
    trigger: 'On successful Stripe checkout (subscription created)',
    subject: 'Your {Business Name} website is on its way! 🚀',
    body: [
      'Confirmation that hosting is active.',
      'Site is being deployed to {subdomain}.autolocal.ai',
      'Dashboard link for future edits.',
    ],
  },
  {
    category: '',
    name: 'Cancellation Notice',
    trigger: 'On Stripe subscription deleted/cancelled',
    subject: 'Your {Business Name} hosting has been cancelled',
    body: [
      'Hosting cancelled confirmation.',
      'Site will be taken offline.',
      'Reactivation instructions.',
    ],
  },

  // === SEARCHED DRIP ===
  {
    category: 'DRIP: SEARCHED (gave email, never picked a business)',
    name: 'Searched #1',
    trigger: '30 minutes after search',
    subject: 'We can help you find the perfect website, {name}',
    body: [
      'Hi {name} 👋',
      'We noticed you were looking for a website for your business.',
      'Get a free custom website — built in minutes, not weeks.',
      'Go live with hosting for $0 today (first month free), then just $9/mo.',
      '',
      '[Search for Your Business →]',
      'No commitment — see a free preview before you pay.',
    ],
  },
  {
    category: '',
    name: 'Searched #2',
    trigger: '1 day after search',
    subject: 'Your competitors already have websites — do you?',
    body: [
      '97% of customers search online before visiting a local business.',
      'Without a website, you\'re invisible to them.',
      'AutoLocal builds your site in minutes using your real business info.',
      '',
      '[See What We Can Build →]',
    ],
  },
  {
    category: '',
    name: 'Searched #3',
    trigger: '2 days after search',
    subject: 'Quick question, {name}',
    body: [
      'Was there something that held you back?',
      'Your free preview is still available whenever you\'re ready. No pressure.',
      '',
      '[Try Again →]',
      'Just reply — a real human reads these.',
    ],
  },
  {
    category: '',
    name: 'Searched #4',
    trigger: '7 days after search',
    subject: 'Your business deserves to be found online',
    body: [
      'It\'s been a week. A lot of businesses have launched since then.',
      'Free website, $9/mo hosting (first month free). No contracts.',
      '',
      '[Build Your Site →]',
    ],
  },
  {
    category: '',
    name: 'Searched #5',
    trigger: '30 days after search',
    subject: 'Still thinking about a website?',
    body: [
      'It\'s been a month — just checking in.',
      'We\'ve made a lot of improvements since you last visited.',
      '',
      '[Take Another Look →]',
      'This is our last email — we won\'t bother you again unless you come back.',
    ],
  },

  // === PREVIEWED DRIP ===
  {
    category: 'DRIP: PREVIEWED (saw free site, hasn\'t activated hosting)',
    name: 'Previewed #1',
    trigger: '30 minutes after site generation',
    subject: 'Your free website for {Business Name} is ready to customize',
    body: [
      'Your free website for {Business Name} is live and looking great!',
      'Log in to your dashboard to change templates, edit text, swap photos, and pick your brand colors — all free.',
      'When you\'re ready to go live, activate hosting — your first month is free, then just $9/mo.',
      '',
      '[Go to My Dashboard →]',
    ],
  },
  {
    category: '',
    name: 'Previewed #2',
    trigger: '1 day after site generation',
    subject: '{Business Name} looks amazing — ready to go live?',
    body: [
      'Your custom website is still waiting for you.',
      '',
      'Compare what you\'d pay elsewhere:',
      '• Wix: $16-33/mo ($192-396/yr)',
      '• Squarespace: $16-33/mo ($192-396/yr)',
      '• AutoLocal: FREE to build + $9/mo hosting (1st month free)',
      '',
      'Your site is already built with your real Google reviews, photos, and hours.',
      '',
      '[Activate Hosting — $0 Today →]',
    ],
  },
  {
    category: '',
    name: 'Previewed #3',
    trigger: '2 days after site generation',
    subject: 'Real talk: your business needs a website',
    body: [
      'Yours is already built. And it\'s completely free to customize.',
      'When you\'re ready to go live, it\'s $0 today and just $9/mo after your free trial.',
      'No contracts. Cancel anytime.',
      '',
      '[See Your Site Again →]',
      'Reply to this email anytime — we\'re real people who want to help.',
    ],
  },
  {
    category: '',
    name: 'Previewed #4',
    trigger: '7 days after site generation',
    subject: 'Your free site for {Business Name} is still live',
    body: [
      'Your website is still there, looking great. We haven\'t taken it down.',
      'When you\'re ready to go live, it takes about 60 seconds. First month is on us.',
      '',
      '[View My Site →]',
    ],
  },
  {
    category: '',
    name: 'Previewed #5',
    trigger: '30 days after site generation',
    subject: 'Last nudge about your website, {name}',
    body: [
      'This is our last email. It\'s still live and free to edit.',
      'Your first month of hosting is free when you\'re ready.',
      '$0 today. $9/mo after. No contracts. Just say go.',
      '',
      '[Go Live →]',
    ],
  },

  // === ABANDONED CHECKOUT DRIP ===
  {
    category: 'DRIP: ABANDONED CHECKOUT (got to Stripe, didn\'t finish)',
    name: 'Abandoned #1',
    trigger: '30 minutes after abandoned checkout',
    subject: 'You were so close! Your site for {Business Name} is ready',
    body: [
      'Looks like you started checking out but didn\'t finish.',
      'Your site is still ready to go.',
      '',
      '[Complete Your Purchase →]',
      'Having trouble? Just reply — we\'ll help.',
    ],
  },
  {
    category: '',
    name: 'Abandoned #2',
    trigger: '1 day after abandoned checkout',
    subject: 'Still want your website, {name}?',
    body: [
      'You were literally one click away!',
      '• Custom website built from your real business data',
      '• Mobile-friendly, fast, professional',
      '• Your own subdomain (yourname.autolocal.ai)',
      '• Dashboard to edit anytime',
      '',
      '[Finish Checkout →]',
    ],
  },
  {
    category: '',
    name: 'Abandoned #3',
    trigger: '2 days after abandoned checkout',
    subject: 'Was something wrong? We want to fix it',
    body: [
      'You got all the way to checkout — was there something that stopped you?',
      'If it was a tech issue, pricing concern, or just bad timing, reply and we\'ll make it right.',
      '',
      '[Try Again →]',
    ],
  },
  {
    category: '',
    name: 'Abandoned #4',
    trigger: '7 days after abandoned checkout',
    subject: 'Your website for {Business Name} is still here',
    body: [
      'It\'s been a week. Your custom site preview is still live.',
      'Free to build. $9/mo hosting (first month free). No contracts. Cancel anytime.',
      '',
      '[Launch Your Site →]',
    ],
  },
  {
    category: '',
    name: 'Abandoned #5',
    trigger: '30 days after abandoned checkout',
    subject: 'Final reminder: your site is ready to go live',
    body: [
      'This is our last email. Your site is still ready — we haven\'t touched it.',
      'Whenever you\'re ready, it takes 60 seconds to go live.',
      '',
      '[Go Live →]',
    ],
  },

  // === INTAKE STARTED DRIP ===
  {
    category: 'DRIP: INTAKE STARTED (began form, didn\'t finish)',
    name: 'Intake #1',
    trigger: '30 minutes after form abandon',
    subject: 'Finish setting up {Business Name} — you\'re almost there!',
    body: [
      'You started setting up your business profile but didn\'t finish.',
      'Your progress is saved!',
      '',
      '[Continue Setup →]',
    ],
  },
  {
    category: '',
    name: 'Intake #2',
    trigger: '1 day after form abandon',
    subject: 'Your website is half-built — let\'s finish it',
    body: [
      'You\'ve already done the hardest part — starting.',
      'Just a few more details and we\'ll have your site ready to preview.',
      '',
      '[Finish Your Profile →]',
    ],
  },
  {
    category: '',
    name: 'Intake #3',
    trigger: '2 days after form abandon',
    subject: 'Need help finishing your site setup?',
    body: [
      'Having trouble with the setup form?',
      'Just reply with your business details and we\'ll set it up for you — no extra charge.',
      '',
      '[Or Finish It Yourself →]',
    ],
  },
  {
    category: '',
    name: 'Intake #4',
    trigger: '7 days after form abandon',
    subject: 'Your site setup for {Business Name} is waiting',
    body: [
      'It\'s been a week — we saved your progress.',
      '',
      '[Continue →]',
    ],
  },
  {
    category: '',
    name: 'Intake #5',
    trigger: '30 days after form abandon',
    subject: 'Last call: finish your website setup',
    body: [
      'This is our last reminder. Your progress is still saved.',
      '',
      '[Finish Setup →]',
    ],
  },
]

// Build HTML for PDF
let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 40px 50px; size: letter; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 28px; font-weight: 800; margin: 0 0 4px; color: #0f0f0f; }
  .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
  .category { font-size: 16px; font-weight: 700; color: #6366f1; margin: 28px 0 12px; padding: 8px 12px; background: #f0f0ff; border-radius: 8px; border-left: 4px solid #6366f1; page-break-after: avoid; }
  .email-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 16px 20px; margin-bottom: 14px; page-break-inside: avoid; }
  .email-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .email-name { font-weight: 700; font-size: 14px; color: #1a1a1a; }
  .email-trigger { font-size: 11px; color: #fff; background: #6366f1; padding: 3px 10px; border-radius: 20px; }
  .email-subject { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
  .email-body { font-size: 11.5px; color: #555; white-space: pre-line; }
  .email-body strong { color: #333; }
  .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 4px 14px; border-radius: 8px; font-weight: 600; font-size: 11px; margin: 4px 0; }
  .summary-table { width: 100%; border-collapse: collapse; margin: 16px 0 32px; font-size: 11px; }
  .summary-table th { background: #f5f5ff; padding: 8px 10px; text-align: left; border-bottom: 2px solid #6366f1; font-weight: 700; }
  .summary-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .summary-table tr:nth-child(even) td { background: #fafafa; }
</style>
</head>
<body>
<h1>⚡ AutoLocal.ai — Email System Review</h1>
<p class="subtitle">All transactional + drip emails · Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h2 style="margin-bottom: 8px;">📊 Overview</h2>
<table class="summary-table">
<tr><th>Stage</th><th>Emails</th><th>Schedule</th><th>Auto-Cancel</th></tr>
<tr><td>Transactional</td><td>3 (Welcome, Activation, Cancellation)</td><td>Immediate</td><td>N/A</td></tr>
<tr><td>Searched</td><td>5</td><td>30min → 1d → 2d → 7d → 30d</td><td>On site generation</td></tr>
<tr><td>Previewed</td><td>5</td><td>30min → 1d → 2d → 7d → 30d</td><td>On hosting activation</td></tr>
<tr><td>Abandoned Checkout</td><td>5</td><td>30min → 1d → 2d → 7d → 30d</td><td>On successful checkout</td></tr>
<tr><td>Intake Started</td><td>5</td><td>30min → 1d → 2d → 7d → 30d</td><td>On site generation</td></tr>
<tr><td><strong>Total</strong></td><td><strong>23 email templates</strong></td><td></td><td></td></tr>
</table>
`

let currentCategory = ''
for (const e of emails) {
  if (e.category && e.category !== currentCategory) {
    currentCategory = e.category
    html += `<div class="category">${currentCategory}</div>\n`
  }

  const bodyHtml = e.body
    .map(line => {
      if (line.startsWith('[') && line.endsWith(']')) return `<span class="cta">${line.slice(1, -1)}</span>`
      if (line.startsWith('•')) return `&nbsp;&nbsp;${line}`
      return line
    })
    .join('\n')

  html += `
<div class="email-card">
  <div class="email-header">
    <span class="email-name">${e.name}</span>
    <span class="email-trigger">⏰ ${e.trigger}</span>
  </div>
  <div class="email-subject">Subject: ${e.subject}</div>
  <div class="email-body">${bodyHtml}</div>
</div>
`
}

html += `</body></html>`

writeFileSync('/tmp/autolocal-email-review.html', html)
console.log('HTML written to /tmp/autolocal-email-review.html')
