import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, name, phone, businessName, city, source } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Store lead in outbound_emails as a tracking record
    // Use template_used to track funnel stage, approach for source
    const { error } = await supabase.from('outbound_emails').upsert({
      to_email: email.toLowerCase().trim(),
      from_email: 'brian@autolocal.ai',
      subject: `Lead: ${businessName || 'Unknown'} (${name || 'no name'})`,
      template_used: source || 'landing_page',
      approach: JSON.stringify({
        name: name || null,
        phone: phone || null,
        businessName: businessName || null,
        city: city || null,
        capturedAt: new Date().toISOString(),
      }),
      status: 'lead',
    }, {
      onConflict: 'to_email',
      ignoreDuplicates: true,
    })

    if (error) {
      // If upsert fails due to no unique constraint, just insert
      await supabase.from('outbound_emails').insert({
        to_email: email.toLowerCase().trim(),
        from_email: 'brian@autolocal.ai',
        subject: `Lead: ${businessName || 'Unknown'} (${name || 'no name'})`,
        template_used: source || 'landing_page',
        approach: JSON.stringify({
          name: name || null,
          phone: phone || null,
          businessName: businessName || null,
          city: city || null,
          capturedAt: new Date().toISOString(),
        }),
        status: 'lead',
      })
    }

    // Enqueue drip campaign (non-blocking)
    const dripStage = source === 'selected_google_business' ? 'previewed' : 'searched'
    fetch('https://autolocal.ai/api/drip/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        stage: dripStage,
        slug: businessName ? businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null,
        businessName,
        contactName: name,
      }),
    }).catch(err => console.error('Capture-lead fire-and-forget failed:', err))

    return NextResponse.json({ captured: true })
  } catch (err) {
    console.error('Lead capture error:', err)
    // Never block the user flow — return success even on error
    return NextResponse.json({ captured: false })
  }
}
