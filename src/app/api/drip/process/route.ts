import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDripEmail } from '@/lib/drip-emails'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all due emails
    const now = new Date().toISOString()
    const { data: due, error: fetchErr } = await supabase
      .from('drip_queue')
      .select('*')
      .eq('status', 'active')
      .lte('send_at', now)
      .order('send_at', { ascending: true })
      .limit(50) // Process in batches

    if (fetchErr) {
      console.error('Drip fetch error:', fetchErr)
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
    }

    if (!due || due.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const item of due) {
      // Double-check unsubscribe
      const { data: unsub } = await supabase
        .from('unsubscribes')
        .select('id')
        .eq('email', item.email)
        .limit(1)
        .single()

      if (unsub) {
        await supabase
          .from('drip_queue')
          .update({ status: 'cancelled', sent_at: now })
          .eq('id', item.id)
        // Cancel ALL remaining drips for this email
        await supabase
          .from('drip_queue')
          .update({ status: 'cancelled' })
          .eq('email', item.email)
          .eq('status', 'active')
        skipped++
        continue
      }

      // Check if they became a customer since enqueue
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('email', item.email)
        .limit(1)
        .single()

      if (client) {
        await supabase
          .from('drip_queue')
          .update({ status: 'converted' })
          .eq('email', item.email)
          .eq('status', 'active')
        skipped++
        continue
      }

      // Get email content
      const template = getDripEmail(item.stage, item.step, {
        email: item.email,
        contactName: item.contact_name,
        businessName: item.business_name,
        slug: item.slug,
      })

      if (!template) {
        await supabase
          .from('drip_queue')
          .update({ status: 'failed', sent_at: now })
          .eq('id', item.id)
        failed++
        continue
      }

      // Send the email
      try {
        const emailRes = await fetch('https://autolocal.ai/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({
            to: item.email,
            subject: template.subject,
            html: template.html,
          }),
        })

        if (emailRes.ok) {
          await supabase
            .from('drip_queue')
            .update({ status: 'sent', sent_at: now })
            .eq('id', item.id)
          sent++
        } else {
          const errBody = await emailRes.text()
          console.error(`Drip email failed for ${item.email}:`, errBody)
          await supabase
            .from('drip_queue')
            .update({ status: 'failed', sent_at: now })
            .eq('id', item.id)
          failed++
        }
      } catch (err) {
        console.error(`Drip send error for ${item.email}:`, err)
        failed++
      }
    }

    return NextResponse.json({ processed: due.length, sent, skipped, failed })
  } catch (err) {
    console.error('Drip process error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
