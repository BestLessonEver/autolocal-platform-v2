/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { internalAuthHeader } from '@/lib/internal-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/** Validate token and return the preview row, or null */
async function resolveToken(token: string) {
  const dashSplit = token.indexOf('-')
  if (dashSplit < 4) return null

  const idPrefix = token.substring(0, 8)
  const slug = token.substring(9)

  const { data, error } = await supabase
    .from('website_previews')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.id.startsWith(idPrefix)) return null
  return data
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const data = await resolveToken(params.token)
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Count changes this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  let changesThisMonth = 0

  const { data: changes, error: changesError } = await supabase
    .from('change_requests')
    .select('id', { count: 'exact' })
    .eq('preview_slug', data.slug)
    .gte('created_at', monthStart)

  if (!changesError && changes) {
    changesThisMonth = changes.length
  }

  const plan = (data as any).plan || 'starter'
  const FREE_CHANGES_PER_MONTH = plan === 'living' ? 999 : 2
  const freeChangesRemaining = Math.max(0, FREE_CHANGES_PER_MONTH - changesThisMonth)

  return NextResponse.json({
    business_name: data.business_name,
    slug: data.slug,
    tagline: data.tagline,
    description: data.description || null,
    category: data.category,
    city: data.city,
    state: data.state,
    phone: data.phone,
    email: data.email,
    contact_email: data.contact_email || data.email || null,
    address: data.address,
    google_rating: data.google_rating,
    google_review_count: data.google_review_count,
    status: data.status,
    template: data.template,
    site_mode: data.site_mode || 'business',
    hero_image_url: data.hero_image_url,
    hero_crop: data.hero_crop ?? 50,
    gallery_images: data.gallery_images || [],
    services: data.services,
    hours: data.hours,
    preview_url: `https://autolocal.ai/preview/${data.slug}`,
    subdomain: `${data.slug}.autolocal.ai`,
    view_count: data.view_count,
    created_at: data.created_at,
    plan,
    hosting_status: (data as any).hosting_status || 'preview',
    custom_domain: (data as any).custom_domain || null,
    changes_this_month: changesThisMonth,
    free_changes_remaining: freeChangesRemaining,
    unlimited_changes: plan === 'living',
    logo_url: data.logo_url,
    brand_color_primary: data.brand_color_primary || '#1a1a2e',
    brand_color_secondary: data.brand_color_secondary || '#16213e',
    brand_color_accent: data.brand_color_accent || '#6366f1',
    website_current: data.website_current || null,
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: { token: string } }
) {
  const data = await resolveToken(params.token)
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()

  // Build update object — only include provided fields
  const updates: Record<string, unknown> = {}
  const allowedFields: Record<string, string> = {
    business_name: 'business_name',
    tagline: 'tagline',
    description: 'description',
    phone: 'phone',
    display_email: 'contact_email',
    address: 'address',
    city: 'city',
    state: 'state',
    template: 'template',
    site_mode: 'site_mode',
    hero_crop: 'hero_crop',
    hero_image_url: 'hero_image_url',
  }

  for (const [bodyKey, dbKey] of Object.entries(allowedFields)) {
    if (body[bodyKey] !== undefined) {
      updates[dbKey] = body[bodyKey]
    }
  }

  // Complex fields
  if (body.services !== undefined) updates.services = body.services
  if (body.hours !== undefined) updates.hours = body.hours

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error: updateErr } = await supabase
    .from('website_previews')
    .update(updates)
    .eq('id', data.id)

  if (updateErr) {
    console.error('Dashboard PATCH error:', updateErr)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  // Auto-redeploy if the site is live
  if (data.website_current && data.slug) {
    try {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': internalAuthHeader(),
        },
        body: JSON.stringify({ slug: data.slug }),
      }).catch(err => console.error('Auto-redeploy failed:', err))
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({ success: true })
}
