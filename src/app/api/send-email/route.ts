import { NextResponse } from 'next/server'
import { validateInternalAuth } from '@/lib/internal-auth'
import { sendEmail } from '@/lib/mailer'

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

    const result = await sendEmail(to, subject, html)

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (err) {
    console.error('[send-email] Error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
