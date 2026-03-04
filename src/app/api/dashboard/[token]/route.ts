/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Token = first 8 chars of preview ID + slug (simple but unique)
// In production, use a proper token column

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token

  // Token format: [first8ofUUID]-[slug]
  // e.g., "43ddc5cf-for-him-mens-salon-friendswood"
  const dashSplit = token.indexOf('-')
  if (dashSplit < 4) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const idPrefix = token.substring(0, 8)
  const slug = token.substring(9)

  const { data, error } = await supabase
    .from('website_previews')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.id.startsWith(idPrefix)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Count changes this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  let changesThisMonth = 0

  const { data: changes, error: changesError } = await supabase
    .from('change_requests')
    .select('id', { count: 'exact' })
    .eq('preview_slug', slug)
    .gte('created_at', monthStart)

  if (!changesError && changes) {
    changesThisMonth = changes.length
  }

  // Plan is stored on the preview record and updated by Stripe webhooks
  // (checkout.session.completed sets plan, customer.subscription.deleted downgrades)
  const plan = (data as any).plan || 'starter'
  const FREE_CHANGES_PER_MONTH = plan === 'living' ? 999 : 2
  const freeChangesRemaining = Math.max(0, FREE_CHANGES_PER_MONTH - changesThisMonth)

  return NextResponse.json({
    business_name: data.business_name,
    slug: data.slug,
    tagline: data.tagline,
    category: data.category,
    city: data.city,
    state: data.state,
    phone: data.phone,
    email: data.email,
    address: data.address,
    google_rating: data.google_rating,
    google_review_count: data.google_review_count,
    status: data.status,
    template: data.template,
    hero_image_url: data.hero_image_url,
    services: data.services,
    hours: data.hours,
    preview_url: `https://autolocal.ai/preview/${data.slug}`,
    view_count: data.view_count,
    created_at: data.created_at,
    plan,
    changes_this_month: changesThisMonth,
    free_changes_remaining: freeChangesRemaining,
    unlimited_changes: plan === 'living',
    logo_url: data.logo_url,
    brand_color_primary: data.brand_color_primary || '#1a1a2e',
    brand_color_secondary: data.brand_color_secondary || '#16213e',
    brand_color_accent: data.brand_color_accent || '#6366f1',
  })
}
