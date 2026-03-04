import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Look up their site by email
  const { data: site, error } = await supabase
    .from('website_previews')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: 'No website found for this email' }, { status: 404 })
  }

  // Get change request stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: changesThisMonth } = await supabase
    .from('change_requests')
    .select('*', { count: 'exact', head: true })
    .eq('preview_id', site.id)
    .gte('created_at', monthStart)

  const plan = site.plan || 'starter'
  const unlimited = plan === 'living'
  const used = changesThisMonth || 0
  const freeRemaining = unlimited ? Infinity : Math.max(0, 2 - used)

  return NextResponse.json({
    business_name: site.business_name,
    slug: site.slug,
    tagline: site.tagline,
    category: site.category,
    city: site.city,
    state: site.state,
    phone: site.phone,
    email: site.contact_email || site.email,
    address: site.address,
    google_rating: site.google_rating,
    google_review_count: site.google_review_count || 0,
    status: site.status,
    template: site.template,
    hero_image_url: site.hero_image_url,
    services: site.services || [],
    hours: site.hours,
    preview_url: `https://autolocal.ai/preview/${site.slug}`,
    website_url: site.website_current || `https://autolocal.ai/preview/${site.slug}`,
    view_count: site.view_count || 0,
    created_at: site.created_at,
    plan,
    changes_this_month: used,
    free_changes_remaining: freeRemaining,
    unlimited_changes: unlimited,
    logo_url: site.logo_url,
    brand_color_primary: site.brand_color_primary || '#0f172a',
    brand_color_secondary: site.brand_color_secondary || '#1e293b',
    brand_color_accent: site.brand_color_accent || '#3b82f6',
    preview_id: site.id,
    gallery_images: site.gallery_images || [],
    hero_crop: site.hero_crop ?? 50,
    site_mode: site.site_mode || 'business',
  })
}
