import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { internalAuthHeader } from '@/lib/internal-auth'
import { sendEmail } from '@/lib/mailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function sendActivationEmail(to: string, contactName: string, businessName: string, slug: string) {
  const firstName = contactName?.split(' ')[0] || 'there'
  const siteUrl = `https://autolocal.ai/preview/${slug}`

  // Generate magic link for secure dashboard access
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: to,
    options: { redirectTo: 'https://autolocal.ai/auth/callback?next=/dashboard' },
  })
  const dashboardUrl = data?.properties?.action_link || 'https://autolocal.ai/login'

  try {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:800;color:#111827;">⚡ AutoLocal.ai</span>
        </td></tr>
        <tr><td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:40px 32px;">
          <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 16px;">🎉 ${firstName}, your site is LIVE!</h1>
          <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your <strong style="color:#111827;">${businessName}</strong> website is now live and hosted by AutoLocal.ai. Your free month starts today!
          </p>

          <!-- Dashboard CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;" role="presentation">
            <tr><td align="center">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr><td align="center" bgcolor="#6366f1" style="background-color:#6366f1;border-radius:12px;">
                  <a href="${dashboardUrl}" style="display:inline-block;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;border:1px solid #6366f1;">Sign In to My Dashboard →</a>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Domain setup section -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;" role="presentation">
            <tr><td bgcolor="#eef2ff" style="background-color:#eef2ff;border-radius:16px;padding:28px 32px;border:2px solid #c7d2fe;">
              <span style="color:#312e81;font-size:20px;font-weight:800;display:block;margin:0 0 12px;">🌐 Connect Your Own Domain</span>
              <span style="color:#3730a3;font-size:15px;line-height:1.6;display:block;margin:0 0 20px;">Want your site on <b style="color:#312e81;">yourbusiness.com</b>? We made a step-by-step guide that walks you through it — takes about 5 minutes, no technical experience needed.</span>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr><td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5;border-radius:10px;">
                  <a href="https://autolocal.ai/setup" style="display:inline-block;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;border:1px solid #4f46e5;">Connect My Domain →</a>
                </td></tr>
              </table>
              <span style="color:#6b7280;font-size:13px;display:block;margin:16px 0 0;">Don't have a domain? No worries — the guide helps with that too. Or reply to this email and we'll help.</span>
            </td></tr>
          </table>

          <!-- What's included -->
          <h2 style="color:#111827;font-size:16px;font-weight:700;margin:0 0 12px;">✅ What's Included</h2>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;" role="presentation">
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ Custom-designed website</td></tr>
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ Mobile-optimized & fast</td></tr>
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ Free custom domain setup</td></tr>
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ SEO built in</td></tr>
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ Dashboard to edit anytime</td></tr>
            <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">✓ Real human support</td></tr>
          </table>

          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 8px;">
            Your site: <a href="${siteUrl}" style="color:#6366f1;font-weight:600;">${siteUrl}</a>
          </p>

          <p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">
            Questions? Just reply to this email — a real person reads every one.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Brian @ AutoLocal.ai · Custom websites for local businesses</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    await sendEmail(to, `🎉 ${businessName} is live — connect your domain!`, html)
  } catch (err) {
    console.error('Activation email error:', err)
  }
}

async function handleDomainPurchase(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const domain = metadata.domain
  const siteId = metadata.siteId
  const email = metadata.email || session.customer_email || ''
  const businessName = metadata.business_name || ''
  const slug = metadata.slug || ''

  if (!domain || !siteId) {
    console.error('Missing domain or siteId in domain purchase metadata:', metadata)
    return
  }

  console.log(`🌐 Domain purchased: ${domain} for site ${siteId}`)

  // Update domain status to registering
  await supabase
    .from('website_previews')
    .update({
      custom_domain: domain,
      domain_status: 'registering',
      domain_provider: 'namecheap',
    })
    .eq('id', siteId)

  // Fire off async domain registration (don't block webhook response)
  fetch('https://autolocal.ai/api/domains/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': internalAuthHeader(),
    },
    body: JSON.stringify({ domain, siteId, email, slug }),
  }).then(async (res) => {
    const data = await res.json()
    if (data.success) {
      console.log(`✅ Domain registered: ${domain}`)
      // Send domain confirmation email
      sendEmail(
        email,
        `🌐 ${domain} is live!`,
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;color:#333">
          <h2 style="color:#6366f1">Your domain is live! 🎉</h2>
          <p>Great news — <strong>${domain}</strong> is now connected to your ${businessName} website.</p>
          <p>Your site is live at:</p>
          <p style="font-size:18px"><a href="https://${domain}" style="color:#6366f1;font-weight:bold">https://${domain}</a></p>
          <p style="color:#666;font-size:13px">DNS, SSL, and WHOIS privacy are all set up automatically. Your domain will auto-renew in 1 year.</p>
          <p style="margin-top:24px">— Brian @ AutoLocal.ai</p>
        </div>`,
      ).catch(() => {})
    } else {
      console.error(`❌ Domain registration failed for ${domain}:`, data.error)
      // Notify admin
      sendEmail(
        'brian@autolocal.ai',
        `⚠️ Domain registration failed: ${domain}`,
        `<p>Domain: ${domain}<br>Site ID: ${siteId}<br>Email: ${email}<br>Error: ${data.error || 'unknown'}</p>`,
      ).catch(() => {})
    }
  }).catch(err => {
    console.error(`Domain registration request failed for ${domain}:`, err)
  })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}

  // Domain purchase — separate flow
  if (metadata.product === 'domain' && metadata.domain) {
    await handleDomainPurchase(session)
    return
  }

  const email = metadata.email || session.customer_email || ''
  const businessName = metadata.business_name || ''
  const contactName = metadata.contact_name || ''
  const phone = metadata.phone || ''
  const slug = metadata.slug || slugify(businessName)
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null

  if (!email || !businessName) {
    console.error('Missing email or business name in checkout metadata:', metadata)
    return
  }

  // Update preview record — mark as hosting active
  const { data: existing } = await supabase
    .from('website_previews')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .single()

  // Get trial end date from subscription if available
  let trialEnd: string | null = null
  if (session.subscription) {
    try {
      const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
      const sub = await stripe.subscriptions.retrieve(subId)
      if (sub.trial_end) {
        trialEnd = new Date(sub.trial_end * 1000).toISOString()
      }
    } catch (err) {
      console.error('Failed to fetch subscription trial info:', err)
    }
  }

  if (existing) {
    const updateData: Record<string, unknown> = {
      email,
      hosting_status: 'active',
      stripe_customer_id: stripeCustomerId,
    }
    if (trialEnd) updateData.trial_end = trialEnd
    await supabase
      .from('website_previews')
      .update(updateData)
      .eq('id', existing.id)
  }

  // Update client record
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .limit(1)
    .single()

  if (existingClient) {
    await supabase.from('clients').update({
      status: 'active',
      stripe_customer_id: stripeCustomerId,
    }).eq('id', existingClient.id)
  } else {
    const { error: clientErr } = await supabase.from('clients').insert({
      business_name: businessName,
      email,
      phone: phone || null,
      status: 'active',
      stripe_customer_id: stripeCustomerId,
    })
    if (clientErr) {
      console.error('Client insert error (non-fatal):', clientErr.message)
    }
  }

  // Send activation email with domain setup instructions (fire-and-forget)
  sendActivationEmail(email, contactName, businessName, slug).catch(err =>
    console.error('Webhook activation email failed (non-fatal):', err)
  )

  // Auto-deploy — site goes LIVE only after hosting is activated
  if (slug) {
    try {
      fetch(`https://autolocal.ai/api/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': internalAuthHeader(),
        },
        body: JSON.stringify({ slug }),
      }).then(r => r.json()).then(r => {
        if (process.env.DEBUG) console.log(`🚀 Auto-deploy for ${slug}: ${r?.success ? 'ok' : 'failed'}`)
      }).catch(err => {
        console.error(`Deploy error for ${slug}:`, err)
      })
    } catch (err) {
      console.error('Deploy auth error (INTERNAL_API_KEY missing?):', err)
    }
  }

  // Cancel any active drip campaigns for this email (they converted!)
  supabase
    .from('drip_queue')
    .update({ status: 'converted' })
    .eq('email', email.toLowerCase())
    .eq('status', 'active')
    .then(() => {})

  if (process.env.DEBUG) console.log(`✅ Hosting activated: ${businessName} (${email})`)
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      try {
        await handleCheckoutComplete(session)
      } catch (err) {
        console.error('handleCheckoutComplete error:', err)
      }
      break
    }

    case 'checkout.session.expired': {
      const expiredSession = event.data.object as Stripe.Checkout.Session
      const expMeta = expiredSession.metadata || {}
      const expEmail = expMeta.email || expiredSession.customer_email
      if (expEmail) {
        // Enqueue abandoned checkout drip
        fetch('https://autolocal.ai/api/drip/enqueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': internalAuthHeader(),
          },
          body: JSON.stringify({
            email: expEmail,
            stage: 'abandoned_checkout',
            slug: expMeta.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || null,
            businessName: expMeta.business_name,
            contactName: expMeta.contact_name,
          }),
        }).catch(err => console.error('Drip enqueue failed:', err))
      }
      break
    }

    case 'customer.subscription.updated': {
      // Handle cancel_at_period_end — user cancelled but billing cycle still active
      const updatedSub = event.data.object as Stripe.Subscription
      const updCustomerId = typeof updatedSub.customer === 'string' ? updatedSub.customer : updatedSub.customer?.id
      if (!updCustomerId) break

      if (updatedSub.cancel_at_period_end) {
        const cancelDate = updatedSub.cancel_at ? new Date(updatedSub.cancel_at * 1000).toISOString() : null
        
        // Update status
        const { data: cancelledSites } = await supabase
          .from('website_previews')
          .update({ hosting_status: 'pending_cancel', cancel_date: cancelDate })
          .eq('stripe_customer_id', updCustomerId)
          .select('email, business_name, contact_name, slug')
        
        // Send win-back email (fire-and-forget)
        if (cancelledSites?.[0]) {
          const site = cancelledSites[0]
          const firstName = (site.contact_name || '').split(' ')[0] || 'there'
          const endDate = cancelDate ? new Date(cancelDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of your billing period'
          
          const winbackHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:800;color:#111827;">⚡ AutoLocal.ai</span>
        </td></tr>
        <tr><td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:40px 32px;">
          <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 16px;">We're sorry to see you go, ${firstName}</h1>
          <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
            We received your cancellation request for <strong style="color:#111827;">${site.business_name}</strong>. Your site will stay live until <strong style="color:#111827;">${endDate}</strong>.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Before you go — would you mind telling us why? We're a small team and your feedback genuinely helps us get better. Just reply to this email.
          </p>

          <!-- Feedback prompts -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;" role="presentation">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">💰 Was it the price?</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🎨 Not happy with the design?</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🔧 Missing a feature you needed?</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🤷 Just not using it?</td></tr>
          </table>

          <!-- Win-back offer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;" role="presentation">
            <tr><td align="center" bgcolor="#eef2ff" style="background-color:#eef2ff;border-radius:16px;padding:28px 32px;border:2px solid #c7d2fe;">
              <span style="color:#312e81;font-size:20px;font-weight:800;display:block;margin:0 0 8px;">🎁 Stay for 20% off</span>
              <span style="color:#3730a3;font-size:15px;line-height:1.5;display:block;margin:0 0 4px;">We'd love to keep you. Reply "SAVE" and we'll lock in <b style="color:#312e81;">$7.20/mo for a full year</b>.</span>
              <span style="color:#6b7280;font-size:13px;display:block;">That's less than the cost of a coffee for a professional website.</span>
            </td></tr>
          </table>

          <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
            If you change your mind before ${endDate}, just log back in and your site will be right where you left it. No data is lost.
          </p>

          <!-- Reactivate CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;" role="presentation">
            <tr><td align="center">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr><td align="center" bgcolor="#6366f1" style="background-color:#6366f1;border-radius:12px;">
                  <a href="https://autolocal.ai/login" style="display:inline-block;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;border:1px solid #6366f1;">Keep My Site →</a>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <p style="color:#9ca3af;font-size:13px;margin:0;">
            Either way, thanks for giving us a shot. — Brian
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Brian @ AutoLocal.ai · Custom websites for local businesses</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
          sendEmail(site.email, `Your ${site.business_name} cancellation — quick question`, winbackHtml).catch(err =>
            console.error('Win-back email failed:', err)
          )
        }
        
        if (process.env.DEBUG) console.log(`⏳ Pending cancel: ${updCustomerId}`)
      } else if (!updatedSub.cancel_at_period_end && updatedSub.status === 'active') {
        // User re-activated (un-cancelled)
        await supabase
          .from('website_previews')
          .update({ hosting_status: 'active', cancel_date: null })
          .eq('stripe_customer_id', updCustomerId)
        if (process.env.DEBUG) console.log(`✅ Re-activated: ${updCustomerId}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      // Handle subscription end — mark hosting as cancelled
      const subscription = event.data.object as Stripe.Subscription
      const delCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
      if (!delCustomerId) break

      {
        const { data: preview } = await supabase
          .from('website_previews')
          .select('business_name, slug, email')
          .eq('stripe_customer_id', delCustomerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        await supabase
          .from('website_previews')
          .update({ hosting_status: 'cancelled' })
          .eq('stripe_customer_id', delCustomerId)

        // Send cancellation confirmation email
        const bizName = preview?.business_name || 'your business'
        const slug = preview?.slug || ''
        const subEmail = preview?.email
        if (!subEmail) break
        try {
          const cancelHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;"><tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;">⚡ AutoLocal.ai</span></td></tr><tr><td style="background-color:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;"><h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 16px;">Hosting Cancelled</h1><p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 16px;">Your hosting for <strong style="color:#ffffff;">${bizName}</strong> has been cancelled. Your site will no longer be live at ${slug}.autolocal.ai.</p><p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">Your website design is saved — you can reactivate hosting anytime from your dashboard and it'll be back online instantly.</p><a href="https://autolocal.ai/login" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">Reactivate Hosting →</a><p style="color:#52525b;font-size:13px;margin:24px 0 0;">If this was a mistake, you can reactivate right away — no data is lost.</p></td></tr><tr><td align="center" style="padding-top:24px;"><p style="color:#3f3f46;font-size:12px;margin:0;">Questions? Reply to this email or reach us at brian@autolocal.ai</p></td></tr></table></td></tr></table></body></html>`
          await sendEmail(subEmail, `Your ${bizName} hosting has been cancelled`, cancelHtml)
        } catch (emailErr) {
          console.error('Cancellation email failed:', emailErr)
        }

        if (process.env.DEBUG) console.log(`⚠️ Hosting cancelled: ${delCustomerId}`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.error(`❌ Payment failed: ${invoice.customer_email}`)
      break
    }

    default:
      // Unhandled event types are normal — Stripe sends many we don't need
      break
  }

  return NextResponse.json({ received: true })
}
