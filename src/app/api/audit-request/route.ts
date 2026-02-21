// audit_requests table
// id uuid primary key default gen_random_uuid()
// business_name text not null
// website text
// city text not null
// state text not null
// email text not null
// status text default 'pending' (pending, processing, sent)
// created_at timestamp default now()

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessName, website, city, state, email } = body

    // Validate required fields
    if (!businessName || !city || !state || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: businessName, city, state, email' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from('audit_requests').insert({
      business_name: businessName,
      website: website || null,
      city,
      state,
      email,
      status: 'pending',
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to submit audit request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "We'll email your report within 24 hours",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    )
  }
}
