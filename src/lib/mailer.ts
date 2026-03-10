import nodemailer from 'nodemailer'
import dns from 'dns'

// Force IPv4 DNS resolution — Railway can't reach Gmail SMTP over IPv6
dns.setDefaultResultOrder('ipv4first')

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'brian@autolocal.ai',
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const info = await getTransporter().sendMail({
      from: `"AutoLocal.ai" <brian@autolocal.ai>`,
      to,
      subject,
      html,
    })
    console.log('[mailer] Sent to', to, '— messageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mailer] Error sending to', to, ':', err)
    return { success: false, error: String(err) }
  }
}
