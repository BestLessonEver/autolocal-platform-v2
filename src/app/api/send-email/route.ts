import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { validateInternalAuth } from '@/lib/internal-auth'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'brian@autolocal.ai',
    pass: process.env.SMTP_PASS, // Google App Password
  },
})

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

    await transporter.sendMail({
      from: `"AutoLocal.ai" <brian@autolocal.ai>`,
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
