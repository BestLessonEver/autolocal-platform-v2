import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Drip schedule: delays in minutes from the trigger event
const DRIP_SCHEDULE = [
  { step: 1, delay_minutes: 30 },       // 30 min after
  { step: 2, delay_minutes: 1440 },     // 1 day
  { step: 3, delay_minutes: 2880 },     // 2 days
  { step: 4, delay_minutes: 10080 },    // 7 days
  { step: 5, delay_minutes: 43200 },    // 30 days
]

export type DripStage = 'searched' | 'previewed' | 'abandoned_checkout' | 'intake_started'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, stage, slug, businessName, contactName } = await req.json()

    if (!email || !stage) {
      return NextResponse.json({ error: 'Missing email or stage' }, { status: 400 })
    }

    // Check if already unsubscribed
    const { data: unsub } = await supabase
      .from('unsubscribes')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1)
      .single()

    if (unsub) {
      return NextResponse.json({ skipped: true, reason: 'unsubscribed' })
    }

    // Check if they already purchased (don't drip paying customers)
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1)
      .single()

    if (client) {
      return NextResponse.json({ skipped: true, reason: 'already_customer' })
    }

    // Check if already in drip for this stage (or a later stage)
    const stageOrder: Record<string, number> = {
      searched: 1,
      previewed: 2,
      abandoned_checkout: 3,
      intake_started: 2,
    }

    const { data: existing } = await supabase
      .from('drip_queue')
      .select('id, stage, status')
      .eq('email', email.toLowerCase())
      .in('status', ['active', 'paused'])

    // If they're already in a later or same stage, update the stage but don't duplicate
    if (existing && existing.length > 0) {
      const currentMax = Math.max(...existing.map(e => stageOrder[e.stage] || 0))
      if (stageOrder[stage] <= currentMax) {
        return NextResponse.json({ skipped: true, reason: 'already_in_funnel' })
      }
      // Cancel old drips, start new stage
      await supabase
        .from('drip_queue')
        .update({ status: 'cancelled' })
        .eq('email', email.toLowerCase())
        .eq('status', 'active')
    }

    // Enqueue all drip steps
    const now = new Date()
    const rows = DRIP_SCHEDULE.map(s => ({
      email: email.toLowerCase(),
      stage,
      step: s.step,
      slug: slug || null,
      business_name: businessName || null,
      contact_name: contactName || null,
      status: 'active',
      send_at: new Date(now.getTime() + s.delay_minutes * 60000).toISOString(),
    }))

    const { error } = await supabase.from('drip_queue').insert(rows)
    if (error) {
      console.error('Drip enqueue error:', error)
      return NextResponse.json({ error: 'Failed to enqueue' }, { status: 500 })
    }

    return NextResponse.json({ success: true, queued: rows.length, stage })
  } catch (err) {
    console.error('Drip enqueue error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
