import { NextResponse } from 'next/server'
import { registerDomain, addDomainToProject } from '@/lib/vercel-domains'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/mailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// AutoLocal registers all domains as the registrant (customers lease them)
// Same model as Squarespace/Wix — we own, they use
const REGISTRANT = {
  firstName: 'Brian',
  lastName: 'Carrion',
  email: 'brian@autolocal.ai',
  phone: '+1.8329098936',
  address1: '1302 S Friendswood Dr Ste 100',
  city: 'Friendswood',
  state: 'TX',
  zip: '77546',
  country: 'US',
  companyName: 'AutoLocal AI LLC',
}

export async function POST(req: Request) {
  try {
    // Only callable from webhook — verify internal key
    const authHeader = req.headers.get('authorization') || ''
    const key = authHeader.replace('Bearer ', '')
    if (key !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain, siteId, expectedPrice, customerEmail } = await req.json()

    if (!domain || !siteId) {
      return NextResponse.json({ error: 'domain and siteId required' }, { status: 400 })
    }

    // 1. Register domain via Vercel
    const regResult = await registerDomain(domain, expectedPrice || 20, REGISTRANT)

    if (!regResult.success) {
      console.error(`Domain registration failed for ${domain}:`, regResult.error)
      return NextResponse.json({ error: regResult.error }, { status: 500 })
    }

    // 2. Add domain to Vercel project (auto-configures DNS + SSL)
    const vercelProjectId = process.env.VERCEL_PROJECT_ID || ''
    if (vercelProjectId) {
      await addDomainToProject(domain, vercelProjectId)
    }

    // 3. Update database
    await supabase
      .from('website_previews')
      .update({
        custom_domain: domain,
        domain_status: 'active',
        domain_provider: 'vercel',
        domain_registrar_id: regResult.orderId || null,
        domain_auto_renew: true,
        domain_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', siteId)

    // 4. Send confirmation email
    if (customerEmail) {
      try {
        await sendEmail(
          customerEmail,
          `🌐 Your domain ${domain} is live!`,
          `
            <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111;">Your domain is live! 🎉</h1>
              <p style="color: #555; line-height: 1.6;">
                <strong>${domain}</strong> is now connected to your website. Everything is set up — 
                SSL certificate, DNS, the works.
              </p>
              <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  ✅ Your site is live at <a href="https://${domain}" style="color: #15803d; font-weight: 600;">${domain}</a>
                </p>
              </div>
              <p style="color: #888; font-size: 13px;">
                Your domain renews automatically each year. You can manage it from your dashboard anytime.
              </p>
              <p style="color: #555; margin-top: 24px;">— Brian @ AutoLocal</p>
            </div>
          `,
        )
      } catch { /* fire and forget */ }
    }

    return NextResponse.json({ success: true, orderId: regResult.orderId })
  } catch (err) {
    console.error('Domain register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
