import nodemailer from 'nodemailer'
import dns from 'dns'

// Force IPv4 DNS resolution GLOBALLY — Railway can't reach Gmail SMTP over IPv6
// Must be called at module load time before any connections
dns.setDefaultResultOrder('ipv4first')

// Also patch dns.lookup to force family:4
const originalLookup = dns.lookup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(dns as any).lookup = function(hostname: string, optionsOrCb: any, cb?: any) {
  if (typeof optionsOrCb === 'function') {
    return originalLookup(hostname, { family: 4 }, optionsOrCb)
  }
  const opts = typeof optionsOrCb === 'object' ? { ...optionsOrCb, family: 4 } : { family: 4 }
  return originalLookup(hostname, opts, cb)
}

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
      connectionTimeout: 10000,
      socketTimeout: 15000,
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
