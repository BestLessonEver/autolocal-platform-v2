import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fallback webhook config for sites without discord_webhook_url column yet
const WEBHOOK_OVERRIDES: Record<string, string> = {
  'best-lesson-ever-friendswood': 'https://discord.com/api/webhooks/1349395434543644762/7An1hMHA6yrY9WQ1s-LlTCvTmqcF_-Xs13dWb59fQzFmJ-D4L6gWMihkJ-L-OtERI6Wq',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, message, slug, instrument } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and site are required' }, { status: 400 })
    }

    // Look up the site to get business name and webhook URL
    const { data: site } = await supabase
      .from('website_previews')
      .select('business_name, email, phone')
      .eq('slug', slug)
      .single()

    const businessName = site?.business_name || slug
    const webhookUrl = WEBHOOK_OVERRIDES[slug] || (site as Record<string, unknown>)?.discord_webhook_url as string | undefined

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
