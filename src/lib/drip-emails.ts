// Drip email templates by stage and step
// Each returns { subject, html }

const BRAND = {
  bg: '#0a0a0f',
  card: '#13131a',
  border: '#1e1e2e',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  text: '#e2e8f0',
  muted: '#94a3b8',
}

function wrap(content: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <span style="font-size:24px;font-weight:800;color:${BRAND.text};">Auto<span style="color:${BRAND.primary};">Local</span>.ai</span>
  </div>
  <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;padding:32px;">
    ${content}
  </div>
  <div style="text-align:center;margin-top:24px;">
    <a href="https://autolocal.ai/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:${BRAND.muted};font-size:12px;text-decoration:underline;">Unsubscribe</a>
  </div>
</div>
</body>
</html>`
}

function button(text: string, url: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${BRAND.primary},#8b5cf6);color:#fff;font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;">${text}</a>
  </div>`
}

type TemplateParams = {
  email: string
  contactName?: string
  businessName?: string
  slug?: string
}

type DripTemplate = {
  subject: string
  html: string
}

// ============================================================
// SEARCHED — gave email, searched, never picked a business
// ============================================================
const searched: Record<number, (p: TemplateParams) => DripTemplate> = {
  1: (p) => ({
    subject: `We can help you find the perfect website, ${p.contactName || 'there'}`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'} 👋</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">We noticed you were looking for a website for your business. We'd love to help!</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Get a free custom website — built in minutes, not weeks. Go live with hosting for $0 today (first month free), then just $9/mo.</p>
      ${button('Search for Your Business →', 'https://autolocal.ai?utm_source=drip&utm_campaign=searched_1')}
      <p style="color:${BRAND.muted};font-size:13px;text-align:center;">No commitment — see a free preview before you pay.</p>
    `, p.email),
  }),
  2: (p) => ({
    subject: `Your competitors already have websites — do you?`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">97% of customers search online before visiting a local business. Without a website, you're invisible to them.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">AutoLocal builds your site in minutes using your real business info — reviews, photos, hours, and more.</p>
      ${button('See What We Can Build →', 'https://autolocal.ai?utm_source=drip&utm_campaign=searched_2')}
    `, p.email),
  }),
  3: (p) => ({
    subject: `Quick question, ${p.contactName || 'friend'}`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hey ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Was there something that held you back? We're always improving and would love to know.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Either way, your free preview is still available whenever you're ready. No pressure.</p>
      ${button('Try Again →', 'https://autolocal.ai?utm_source=drip&utm_campaign=searched_3')}
      <p style="color:${BRAND.muted};font-size:13px;text-align:center;">Just reply to this email if you have questions — a real human reads these.</p>
    `, p.email),
  }),
  4: (p) => ({
    subject: `Your business deserves to be found online`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">It's been a week since you checked out AutoLocal. A lot of businesses like yours have launched their sites since then.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">We're still here when you're ready. Free website, $9/mo hosting (first month free). No contracts.</p>
      ${button('Build Your Site →', 'https://autolocal.ai?utm_source=drip&utm_campaign=searched_4')}
    `, p.email),
  }),
  5: (p) => ({
    subject: `Still thinking about a website?`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">It's been a month — just checking in. We've made a lot of improvements since you last visited.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">If you're still looking for a simple, affordable website, we'd love another chance to impress you.</p>
      ${button('Take Another Look →', 'https://autolocal.ai?utm_source=drip&utm_campaign=searched_5')}
      <p style="color:${BRAND.muted};font-size:13px;text-align:center;">This is our last email — we won't bother you again unless you come back.</p>
    `, p.email),
  }),
}

// ============================================================
// PREVIEWED — saw their site preview, never went to checkout
// ============================================================
const previewed: Record<number, (p: TemplateParams) => DripTemplate> = {
  1: (p) => ({
    subject: `Your free website for ${p.businessName || 'your business'} is ready to customize`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'} 👋</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Your free website for <strong style="color:${BRAND.text};">${p.businessName || 'your business'}</strong> is live and looking great!</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Log in to your dashboard to change templates, edit text, swap photos, and pick your brand colors — all free.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">When you're ready to go live, activate hosting — <strong style="color:${BRAND.primaryLight};">your first month is free</strong>, then just $9/mo.</p>
      ${button('Go to My Dashboard →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=previewed_1`)}
    `, p.email),
  }),
  2: (p) => ({
    subject: `${p.businessName || 'Your business'} looks amazing — ready to go live?`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Your custom website for <strong style="color:${BRAND.text};">${p.businessName || 'your business'}</strong> is still waiting for you.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Compare what you'd pay elsewhere:</p>
      <ul style="color:${BRAND.muted};line-height:1.8;padding-left:20px;">
        <li>Wix: $16-33/mo ($192-396/yr)</li>
        <li>Squarespace: $16-33/mo ($192-396/yr)</li>
        <li><strong style="color:${BRAND.primaryLight};">AutoLocal: FREE to build + $9/mo hosting (1st month free)</strong></li>
      </ul>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Your site is already built with your real Google reviews, photos, and hours. Just activate hosting to go live.</p>
      ${button('Activate Hosting — $0 Today →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=previewed_2`)}
    `, p.email),
  }),
  3: (p) => ({
    subject: `Real talk: your business needs a website`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hey ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">We get it — committing to a website feels like a big step. But here's the thing: yours is already built. And it's <strong style="color:${BRAND.text};">completely free</strong> to customize.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">When you're ready to go live, it's $0 today and just $9/mo after your free trial. No contracts. Cancel anytime.</p>
      ${button('See Your Site Again →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=previewed_3`)}
      <p style="color:${BRAND.muted};font-size:13px;text-align:center;">Reply to this email anytime — we're real people who want to help.</p>
    `, p.email),
  }),
  4: (p) => ({
    subject: `Your free site for ${p.businessName || 'your business'} is still live`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Just wanted you to know — your website is still there, looking great. We haven't taken it down.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">When you're ready to go live, it takes about 60 seconds. First month is on us.</p>
      ${button('View My Site →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=previewed_4`)}
    `, p.email),
  }),
  5: (p) => ({
    subject: `Last nudge about your website, ${p.contactName || 'friend'}`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">This is our last email about your website. It's still live and free to edit — and your first month of hosting is free when you're ready.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">$0 today. $9/mo after. No contracts. Your site is already built — just say go.</p>
      ${button('Go Live →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=previewed_5`)}
    `, p.email),
  }),
}

// ============================================================
// ABANDONED_CHECKOUT — got to Stripe, didn't finish
// ============================================================
const abandoned_checkout: Record<number, (p: TemplateParams) => DripTemplate> = {
  1: (p) => ({
    subject: `You were so close! Your site for ${p.businessName || 'your business'} is ready`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Looks like you started checking out but didn't finish. No worries — your site for <strong style="color:${BRAND.text};">${p.businessName || 'your business'}</strong> is still ready to go.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Pick up right where you left off:</p>
      ${button('Complete Your Purchase →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=checkout_1`)}
      <p style="color:${BRAND.muted};font-size:13px;text-align:center;">Having trouble? Just reply — we'll help.</p>
    `, p.email),
  }),
  2: (p) => ({
    subject: `Still want your website, ${p.contactName || 'friend'}?`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hey ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Just a friendly reminder — your custom website is built and waiting. You were literally one click away!</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 8px;">Here's what you get:</p>
      <ul style="color:${BRAND.muted};line-height:1.8;padding-left:20px;">
        <li>Custom website built from your real business data</li>
        <li>Mobile-friendly, fast, professional</li>
        <li>Your own subdomain (yourname.autolocal.ai)</li>
        <li>Dashboard to edit anytime</li>
      </ul>
      ${button('Finish Checkout →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=checkout_2`)}
    `, p.email),
  }),
  3: (p) => ({
    subject: `Was something wrong? We want to fix it`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">You got all the way to checkout — was there something that stopped you? We'd genuinely love to know so we can improve.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">If it was a tech issue, pricing concern, or just bad timing, reply to this email and we'll make it right.</p>
      ${button('Try Again →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=checkout_3`)}
    `, p.email),
  }),
  4: (p) => ({
    subject: `Your website for ${p.businessName || 'your business'} is still here`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">It's been a week. Your custom site preview is still live and ready to launch whenever you are.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Free to build. $9/mo hosting (first month free). No contracts. Cancel anytime.</p>
      ${button('Launch Your Site →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=checkout_4`)}
    `, p.email),
  }),
  5: (p) => ({
    subject: `Final reminder: your site is ready to go live`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">This is our last email. Your site for <strong style="color:${BRAND.text};">${p.businessName || 'your business'}</strong> is still ready — we haven't touched it.</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Whenever you're ready, it takes 60 seconds to go live. We'll be here.</p>
      ${button('Go Live →', `https://autolocal.ai/preview/${p.slug || ''}?utm_source=drip&utm_campaign=checkout_5`)}
    `, p.email),
  }),
}

// ============================================================
// INTAKE_STARTED — began intake form, didn't finish
// ============================================================
const intake_started: Record<number, (p: TemplateParams) => DripTemplate> = {
  1: (p) => ({
    subject: `Finish setting up ${p.businessName || 'your business'} — you're almost there!`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'} 👋</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">You started setting up your business profile but didn't finish. No worries — your progress is saved!</p>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Pick up right where you left off:</p>
      ${button('Continue Setup →', `https://autolocal.ai/intake/${p.slug || ''}?utm_source=drip&utm_campaign=intake_1`)}
    `, p.email),
  }),
  2: (p) => ({
    subject: `Your website is half-built — let's finish it`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hey ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">You've already done the hardest part — starting. Just a few more details and we'll have your site ready to preview.</p>
      ${button('Finish Your Profile →', `https://autolocal.ai/intake/${p.slug || ''}?utm_source=drip&utm_campaign=intake_2`)}
    `, p.email),
  }),
  3: (p) => ({
    subject: `Need help finishing your site setup?`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">Having trouble with the setup form? Just reply to this email with your business details and we'll set it up for you — no extra charge.</p>
      ${button('Or Finish It Yourself →', `https://autolocal.ai/intake/${p.slug || ''}?utm_source=drip&utm_campaign=intake_3`)}
    `, p.email),
  }),
  4: (p) => ({
    subject: `Your site setup for ${p.businessName || 'your business'} is waiting`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">It's been a week — we saved your progress so you can pick up right where you left off.</p>
      ${button('Continue →', `https://autolocal.ai/intake/${p.slug || ''}?utm_source=drip&utm_campaign=intake_4`)}
    `, p.email),
  }),
  5: (p) => ({
    subject: `Last call: finish your website setup`,
    html: wrap(`
      <h1 style="color:${BRAND.text};font-size:22px;margin:0 0 16px;">Hi ${p.contactName || 'there'},</h1>
      <p style="color:${BRAND.muted};line-height:1.6;margin:0 0 16px;">This is our last reminder about your website setup. Your progress is still saved — come back anytime.</p>
      ${button('Finish Setup →', `https://autolocal.ai/intake/${p.slug || ''}?utm_source=drip&utm_campaign=intake_5`)}
    `, p.email),
  }),
}

const TEMPLATES: Record<string, Record<number, (p: TemplateParams) => DripTemplate>> = {
  searched,
  previewed,
  abandoned_checkout,
  intake_started,
}

export function getDripEmail(stage: string, step: number, params: TemplateParams): DripTemplate | null {
  const stageTemplates = TEMPLATES[stage]
  if (!stageTemplates) return null
  const fn = stageTemplates[step]
  if (!fn) return null
  return fn(params)
}
