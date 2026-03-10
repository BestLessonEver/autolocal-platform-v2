import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AutoLocal.ai <brian@autolocal.ai>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[mailer] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('[mailer] Sent to', to, '— id:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('[mailer] Error sending to', to, ':', err)
    return { success: false, error: String(err) }
  }
}
