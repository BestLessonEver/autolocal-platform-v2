import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { internalAuthHeader } from '@/lib/internal-auth'

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

  // Notify Brian via email
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': internalAuthHeader(),
      },
      body: JSON.stringify({
        to: 'brian@autolocal.ai',
        subject: `📝 Change Request — ${preview.business_name}`,
        html: `
<div style="font-family:sans-serif;padding:20px;">
  <h2>📝 Change Request</h2>
  <p><strong>Business:</strong> ${preview.business_name}</p>
  <p><strong>Type:</strong> ${type || 'general'}</p>
  <p><strong>Priority:</strong> ${priority || 'normal'}</p>
  <hr style="border:1px solid #eee;margin:16px 0;">
  <p>${message.trim().replace(/\n/g, '<br>')}</p>
  <p><a href="https://autolocal.ai/admin/clients">View in Admin →</a></p>
</div>`,
      }),
    })
  } catch (emailErr) {
    console.error('Change request notification email failed:', emailErr)
  }

  return NextResponse.json({ success: true, message: 'Change request submitted! We\'ll get back to you within 24 hours.' })
}
