import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_KEY = process.env.ADMIN_API_KEY
const ADMIN_EMAILS = [
  'brian@autolocal.ai',
  'whoisbc@me.com',
  'bestlessoninfo@gmail.com',
]

async function isAuthorized(req: NextRequest): Promise<boolean> {
  if (ADMIN_KEY && req.headers.get('x-admin-key') === ADMIN_KEY) return true
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return req.cookies.get(name)?.value }, set() {}, remove() {} } }
  )
  const { data: { user } } = await sb.auth.getUser()
  return !!user && ADMIN_EMAILS.includes(user.email || '')
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('website_previews')
    .select('id, slug, business_name, city, state, phone, email, category, google_rating, google_review_count, status, template, created_at, view_count, hosting_status, cancel_date, trial_end, stripe_customer_id')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, email } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('website_previews')
    .update({ email })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Delete associated storage files
  const { data: preview } = await supabase
    .from('website_previews')
    .select('slug')
    .eq('id', id)
    .single()

  if (preview?.slug) {
    // Clean up logo and photos from storage
    const { data: files } = await supabase.storage.from('logos').list(preview.slug)
    if (files?.length) {
      await supabase.storage.from('logos').remove(files.map(f => `${preview.slug}/${f.name}`))
    }
  }

  // Delete drip entries
  await supabase.from('drip_queue').delete().eq('preview_id', id)

  // Delete change requests
  await supabase.from('change_requests').delete().eq('preview_id', id)

  // Delete the preview
  const { error } = await supabase
    .from('website_previews')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
