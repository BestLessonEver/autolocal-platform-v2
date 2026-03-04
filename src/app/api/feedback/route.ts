import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { type, message, slug, email } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Store in DB
    const { error } = await supabase.from('feedback').insert({
      type: type || 'feedback',
      message: message.trim(),
      slug: slug || null,
      email: email || null,
      status: 'new',
    })

    if (error) {
      // If table doesn't exist, just log and send email
      console.error('Feedback insert error (non-fatal):', error.message)
    }

    // Send notification email to Brian
    try {
      await fetch('https://autolocal.ai/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
        },
        body: JSON.stringify({
          to: 'brian@autolocal.ai',
          subject: `${type === 'bug' ? '🐛 Bug Report' : '💡 Feedback'} — ${slug || 'Unknown site'}`,
          html: `
<div style="font-family:sans-serif;padding:20px;">
  <h2>${type === 'bug' ? '🐛 Bug Report' : '💡 Feedback'}</h2>
  <p><strong>From:</strong> ${email || 'Unknown'}</p>
  <p><strong>Site:</strong> ${slug || 'N/A'}</p>
  <p><strong>Type:</strong> ${type}</p>
  <hr style="border:1px solid #eee;margin:16px 0;">
  <p>${message.trim().replace(/\n/g, '<br>')}</p>
</div>`,
        }),
      })
    } catch {
      // Email send is non-fatal
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Feedback error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
