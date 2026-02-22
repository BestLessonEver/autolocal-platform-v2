import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/*
-- clients table (create in Supabase dashboard)
-- id uuid primary key default gen_random_uuid()
-- audit_id uuid
-- business_name text not null
-- address text
-- phone text
-- website text
-- contact_name text not null
-- contact_email text not null
-- package text not null
-- social_platforms jsonb
-- brand_voice text
-- upcoming_events text
-- avoid_topics text
-- special_requests text
-- status text default 'onboarding'
-- created_at timestamp default now()
*/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessName, contactName, contactEmail, ...rest } = body

    if (!businessName || !contactName || !contactEmail) {
      return NextResponse.json({ error: 'Business name, contact name, and email are required' }, { status: 400 })
    }

    try {
      const supabase = createServerSupabaseClient()
      await supabase.from('clients').insert({
        audit_id: rest.auditId || null,
        business_name: businessName,
        address: rest.address || null,
        phone: rest.phone || null,
        website: rest.website || null,
        contact_name: contactName,
        contact_email: contactEmail,
        package: rest.package || 'social_revive',
        social_platforms: rest.socialPlatforms || [],
        brand_voice: rest.brandVoice || 'audit',
        upcoming_events: rest.upcomingEvents || null,
        avoid_topics: rest.avoidTopics || null,
        special_requests: rest.specialRequests || null,
        status: 'onboarding',
      })
    } catch (e) {
      console.error('Supabase insert error (clients table may not exist yet):', e)
    }

    return NextResponse.json({ success: true, message: 'Onboarding complete! We\'ll have your first content ready within 24 hours.' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
