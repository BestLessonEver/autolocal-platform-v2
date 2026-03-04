import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { internalAuthHeader } from '@/lib/internal-auth'

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

async function sendWelcomeEmail(to: string, contactName: string, businessName: string, hasGoogleData: boolean = false) {
  const firstName = contactName?.split(' ')[0] || 'there'

  // Use Supabase's built-in magic link generation
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: to,
    options: {
      redirectTo: 'https://autolocal.ai/auth/callback?next=/dashboard',
    },
  })

  const magicLinkUrl = data?.properties?.action_link || 'https://autolocal.ai/login'

  // Send via Gmail SMTP through our API or directly
  try {
    const res = await fetch('https://autolocal.ai/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': internalAuthHeader(),
      },
      body: JSON.stringify({
        to,
        subject: `Your ${businessName} website is on its way! 🚀`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:800;color:#ffffff;">⚡ AutoLocal.ai</span>
        </td></tr>
        <tr><td style="background-color:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;">
          <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 16px;">Hi ${firstName}, welcome aboard!</h1>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 8px;">
            We've received your order for a custom website for <strong style="color:#ffffff;">${businessName}</strong>.
          </p>
          ${hasGoogleData ? `
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
            We already pulled your business info from Google and started building. Here's what happens next:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:0 0 12px;"><span style="color:#6366f1;font-weight:700;">1.</span> <span style="color:#d4d4d8;">Your custom website is ready!</span></td></tr>
            <tr><td style="padding:0 0 12px;"><span style="color:#6366f1;font-weight:700;">2.</span> <span style="color:#d4d4d8;">Log in with the button below</span></td></tr>
            <tr><td><span style="color:#6366f1;font-weight:700;">3.</span> <span style="color:#d4d4d8;">Preview your site and make changes in your dashboard</span></td></tr>
          </table>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your dashboard is ready — you can access it anytime:
          </p>
          <a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">Go to My Dashboard →</a>
          ` : `
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
            To build the best possible website, we need a few details from you. It takes about 5 minutes:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:0 0 12px;"><span style="color:#6366f1;font-weight:700;">1.</span> <span style="color:#d4d4d8;">Fill out your business details (5 min)</span></td></tr>
            <tr><td style="padding:0 0 12px;"><span style="color:#6366f1;font-weight:700;">2.</span> <span style="color:#d4d4d8;">Upload your photos and logo</span></td></tr>
            <tr><td><span style="color:#6366f1;font-weight:700;">3.</span> <span style="color:#d4d4d8;">Preview your site and make changes in your dashboard</span></td></tr>
          </table>
          <a href="https://autolocal.ai/intake/${slugify(businessName)}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">Complete Your Details →</a>
          `}
          <p style="color:#52525b;font-size:13px;margin:24px 0 0;">
            You can also sign in anytime at <a href="https://autolocal.ai/login" style="color:#6366f1;">autolocal.ai/login</a> using this email address.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="color:#3f3f46;font-size:12px;margin:0;">Questions? Reply to this email or reach us at brian@autolocal.ai</p>
          <p style="color:#27272a;font-size:11px;margin:12px 0 0;">AutoLocal.ai · Custom websites for local businesses</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    })
    if (!res.ok) console.error('Welcome email failed:', await res.text())
  } catch (err) {
    console.error('Welcome email error:', err)
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const email = metadata.email || session.customer_email || ''
  const businessName = metadata.business_name || ''
  const contactName = metadata.contact_name || ''
  const phone = metadata.phone || ''
  const businessType = metadata.business_type || ''
  const product = metadata.product || 'website'
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null

  if (!email || !businessName) {
    console.error('Missing email or business name in checkout metadata:', metadata)
    return
  }

  const slug = slugify(businessName)

  // Check if preview already exists for this business
  const { data: existing } = await supabase
    .from('website_previews')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .single()

  if (existing) {
    // Link existing preview to customer email
    await supabase
      .from('website_previews')
      .update({
        email,
        status: 'paid',
        plan: product === 'living' ? 'living' : 'starter',
      })
      .eq('id', existing.id)
  } else {
    // Create new preview record — site will be built manually or via pipeline
    await supabase.from('website_previews').insert({
      slug,
      business_name: businessName,
      email,
      category: businessType || 'business',
      status: 'paid',
      plan: product === 'living' ? 'living' : 'starter',
      template: 'bold',
      brand_color_primary: '#0f172a',
      brand_color_secondary: '#1e293b',
      brand_color_accent: '#3b82f6',
      services: [],
      view_count: 0,
    })
  }

  // Create/update client record
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .limit(1)
    .single()

  if (!existingClient) {
    const { error: clientErr } = await supabase.from('clients').insert({
      business_name: businessName,
      email,
      phone: phone || null,
      status: 'paid',
      stripe_customer_id: stripeCustomerId,
    })
    if (clientErr) {
      console.error('Client insert error (non-fatal):', clientErr.message)
    }
  }

  // Send welcome email — check if we have Google data
  const hasGoogleData = existing !== null && existing !== undefined
  await sendWelcomeEmail(email, contactName, businessName, hasGoogleData)

  // Auto-deploy to Vercel with {slug}.autolocal.ai subdomain
  const deploySlug = slug
  if (deploySlug) {
    fetch(`https://autolocal.ai/api/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': internalAuthHeader(),
      },
      body: JSON.stringify({ slug: deploySlug }),
    }).then(r => r.json()).then(r => {
      console.log(`🚀 Auto-deploy result for ${deploySlug}:`, r)
    }).catch(err => {
      console.error(`Deploy error for ${deploySlug}:`, err)
    })
  }

  // Cancel any active drip campaigns for this email (they converted!)
  supabase
    .from('drip_queue')
    .update({ status: 'converted' })
    .eq('email', email.toLowerCase())
    .eq('status', 'active')
    .then(() => {})

  console.log(`✅ Checkout complete: ${businessName} (${email}) — ${product}`)
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
      await handleCheckoutComplete(session)
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
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
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

    case 'customer.subscription.deleted': {
      // Handle subscription cancellation — downgrade to starter
      const subscription = event.data.object as Stripe.Subscription
      const email = subscription.metadata?.email
      if (email) {
        await supabase
          .from('website_previews')
          .update({ plan: 'starter' })
          .eq('email', email)
        console.log(`⚠️ Subscription cancelled: ${email}`)
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
