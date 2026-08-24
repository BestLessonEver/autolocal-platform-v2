import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BLE_SITE_SLUG = 'best-lesson-ever-friendswood'
const BLE_DISCORD_WEBHOOK_URL = process.env.BLE_DISCORD_WEBHOOK_URL

function safeText(value: unknown, maxLength = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/@/g, '@\u200b')
    .trim()
    .slice(0, maxLength)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = safeText(body.name, 150)
    const email = safeText(body.email, 254)
    const phone = safeText(body.phone, 40)
    const message = safeText(body.message, 1000)
    const slug = safeText(body.slug, 100)
    const instrument = safeText(body.instrument, 100)

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and site are required' }, { status: 400 })
    }

    if (slug === BLE_SITE_SLUG) {
      const digits = phone.replace(/\D/g, '')
      const junkEmail = /^(test|example)@example\.com$/i.test(email)
      const junkPhone = ['0000000000', '1111111111', '1234567890'].includes(digits)
      if ((!email && !phone) || junkEmail || junkPhone) {
        return NextResponse.json({ success: true, filtered: true })
      }
    }

    // Look up the site to get business name and webhook URL
    const { data: site } = await supabase
      .from('website_previews')
      .select('business_name, email, phone')
      .eq('slug', slug)
      .single()

    const businessName = site?.business_name || slug
    const webhookUrl = slug === BLE_SITE_SLUG ? BLE_DISCORD_WEBHOOK_URL : undefined
    const requestIp = safeText(
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'Unavailable',
      100
    )
    const userAgent = safeText(req.headers.get('user-agent') || 'Unavailable', 300)

    // Store the lead in Supabase (table might not exist yet — non-fatal)
    try {
      await supabase.from('site_leads').insert({
        slug,
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        instrument: instrument || null,
        created_at: new Date().toISOString(),
      })
    } catch (insertErr) {
      console.error('Lead insert error (non-fatal):', insertErr)
    }

    // Send to Discord webhook if configured
    if (webhookUrl) {
      const fields = [
        { name: '👤 Name', value: name, inline: true },
      ]
      if (email) fields.push({ name: '📧 Email', value: email, inline: true })
      if (phone) fields.push({ name: '📞 Phone', value: phone, inline: true })
      if (instrument) fields.push({ name: '🎸 Instrument', value: instrument, inline: true })
      if (message) fields.push({ name: '💬 Message', value: message, inline: false })
      fields.push({ name: '🌐 Request IP', value: requestIp, inline: true })
      fields.push({ name: '🧭 User Agent', value: userAgent, inline: false })

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🎵 New Lead from ${businessName}`,
            color: 0x22c55e,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: `Source: ${slug}` },
          }],
        }),
      }).then(response => {
        if (!response.ok) console.error('Webhook send failed:', response.status)
      }).catch(err => console.error('Webhook send error:', err))
    }

    // Also send notification email to site owner if configured
    if (site?.email) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: site.email,
          subject: `New lead: ${name} — ${businessName}`,
          html: `
            <h2>New lead from your website!</h2>
            <p><strong>Name:</strong> ${name}</p>
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${instrument ? `<p><strong>Instrument:</strong> ${instrument}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          `,
        }),
      }).catch(err => console.error('Lead notification email failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead submit error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
