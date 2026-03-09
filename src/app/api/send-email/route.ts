import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import dns from 'dns'
import { validateInternalAuth } from '@/lib/internal-auth'

// Force IPv4 DNS resolution — Railway can't reach Gmail SMTP over IPv6
dns.setDefaultResultOrder('ipv4first')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'brian@autolocal.ai',
    pass: process.env.SMTP_PASS,
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

    const info = await transporter.sendMail({
      from: `"AutoLocal.ai" <brian@autolocal.ai>`,
      to,
      subject,
      html,
    })

    console.log('[send-email] Sent to', to, '— messageId:', info.messageId)
    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error('[send-email] Error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
