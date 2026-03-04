import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthEmail() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || null
}

export async function PATCH(req: Request) {
  try {
    const email = await getAuthEmail()
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      business_name,
      tagline,
      description,
      phone,
      display_email,
      address,
      city,
      state,
      services,
      hours,
      hero_crop,
      template,
      site_mode,
    } = body

    // Find user's preview by email
    const { data: preview, error: findErr } = await supabaseAdmin
      .from('website_previews')
      .select('id, slug, website_current')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findErr || !preview) {
      return NextResponse.json({ error: 'No site found for this account' }, { status: 404 })
    }

    // Build update object — only include provided fields
    const updates: Record<string, unknown> = {}
    if (business_name !== undefined) updates.business_name = business_name
    if (tagline !== undefined) updates.tagline = tagline || null
    if (description !== undefined) updates.description = description || null
    if (phone !== undefined) updates.phone = phone || null
    if (address !== undefined) updates.address = address || null
    if (city !== undefined) updates.city = city || null
    if (state !== undefined) updates.state = state || null
    if (display_email !== undefined) updates.contact_email = display_email || null
    if (hero_crop !== undefined) updates.hero_crop = hero_crop
    if (template !== undefined) updates.template = template
    if (site_mode !== undefined) updates.site_mode = site_mode
    if (services !== undefined) updates.services = services
    if (hours !== undefined) updates.hours = hours

    const { error: updateErr } = await supabaseAdmin
      .from('website_previews')
      .update(updates)
      .eq('id', preview.id)

    if (updateErr) {
      console.error('Update error:', updateErr)
      return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 })
    }

    // Auto-redeploy if the site is live on Vercel
    if (preview.website_current && preview.slug) {
      fetch('https://autolocal.ai/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
        },
        body: JSON.stringify({ slug: preview.slug }),
      }).catch(err => console.error('Auto-redeploy failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Details PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
