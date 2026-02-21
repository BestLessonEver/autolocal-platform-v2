import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/audit-engine'
import { type Prospect } from '@/lib/prospect-finder'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessName, website, city, state, category } = body

    if (!businessName || !city || !state) {
      return NextResponse.json(
        { error: 'businessName, city, and state are required' },
        { status: 400 }
      )
    }

    // Build a prospect from the request
    const prospect: Prospect = {
      id: crypto.randomUUID(),
      businessName,
      category: category || 'general',
      address: `${city}, ${state}`,
      city,
      state,
      website: website || undefined,
    }

    // Run the audit
    const audit = await runAudit(prospect)
    const auditId = crypto.randomUUID()
    audit.id = auditId

    // Store in Supabase if available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        await supabase.from('audits').insert({
          id: auditId,
          business_name: businessName,
          city,
          state,
          category: category || 'general',
          website_url: website || null,
          google_place_id: prospect.placeId || null,
          overall_score: audit.overallScore,
          data: audit,
        })
      } catch (err) {
        console.error('Failed to store audit in Supabase:', err)
        // Continue — audit still works without storage
      }
    }

    const reportUrl = `/audit/${auditId}`

    return NextResponse.json({
      success: true,
      auditId,
      reportUrl,
      audit,
    })
  } catch (err) {
    console.error('Audit API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
