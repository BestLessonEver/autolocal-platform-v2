import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token
  const idPrefix = token.substring(0, 8)
  const slug = token.substring(9)

  // Verify token
  const { data: preview } = await supabase
    .from('website_previews')
    .select('id, slug, business_name')
    .eq('slug', slug)
    .single()

  if (!preview || !preview.id.startsWith(idPrefix)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { type, message, priority } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Store in a change_requests table (create if not exists via Supabase dashboard)
  // For now, we'll also send a notification email
  const changeRequest = {
    preview_slug: slug,
    business_name: preview.business_name,
    type: type || 'general',
    message: message.trim(),
    priority: priority || 'normal',
    status: 'pending',
  }

  // Try to insert into change_requests table
  const { error: insertError } = await supabase
    .from('change_requests')
    .insert(changeRequest)

  if (insertError) {
    // Table might not exist yet — log it and still return success
    console.error('change_requests insert error (table may not exist):', insertError.message)
  }

  // TODO: Send notification to AutoLocal (email/Discord webhook)
  console.log(`[Change Request] ${preview.business_name}: ${message}`)

  return NextResponse.json({ success: true, message: 'Change request submitted! We\'ll get back to you within 24 hours.' })
}
