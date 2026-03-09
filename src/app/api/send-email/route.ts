import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateInternalAuth } from '@/lib/internal-auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const auth = validateInternalAuth(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing to, subject, or html' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'AutoLocal.ai <brian@autolocal.ai>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[send-email] Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[send-email] Sent to', to, '— id:', data?.id)
    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('[send-email] Error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
