import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getPreviewForUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const { data: preview } = await supabase
    .from('website_previews')
    .select('id, slug, website_current, hero_image_url, gallery_images')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return preview
}

// Fire-and-forget redeploy if site is live
function triggerRedeploy(slug: string | null, websiteCurrent: string | null) {
  if (!slug || !websiteCurrent) return
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
    },
    body: JSON.stringify({ slug }),
  }).catch(err => console.error('Photo redeploy failed:', err))
}

// GET — return current photos
export async function GET() {
  const preview = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({
    hero_image_url: preview.hero_image_url,
    gallery_images: preview.gallery_images || [],
  })
}

// POST — upload new photo
export async function POST(request: NextRequest) {
  const preview = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('photo') as File
  const target = formData.get('target') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const path = `${preview.id}/photos/${timestamp}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await adminSupabase.storage
    .from('client-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = adminSupabase.storage
    .from('client-assets')
    .getPublicUrl(path)

  if (target === 'hero') {
    await adminSupabase
      .from('website_previews')
      .update({ hero_image_url: publicUrl })
      .eq('id', preview.id)
  } else {
    const gallery = preview.gallery_images || []
    gallery.push(publicUrl)
    await adminSupabase
      .from('website_previews')
      .update({ gallery_images: gallery })
      .eq('id', preview.id)
  }

  triggerRedeploy(preview.slug, preview.website_current)
  return NextResponse.json({ url: publicUrl, target })
}

// PATCH — reorder gallery, set hero, or remove photo
export async function PATCH(request: NextRequest) {
  const preview = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.action === 'set_hero' && body.url) {
    await adminSupabase
      .from('website_previews')
      .update({ hero_image_url: body.url })
      .eq('id', preview.id)
    triggerRedeploy(preview.slug, preview.website_current)
    return NextResponse.json({ success: true })
  }

  if (body.action === 'reorder' && Array.isArray(body.gallery_images)) {
    await adminSupabase
      .from('website_previews')
      .update({ gallery_images: body.gallery_images })
      .eq('id', preview.id)
    triggerRedeploy(preview.slug, preview.website_current)
    return NextResponse.json({ success: true })
  }

  if (body.action === 'remove' && body.url) {
    const gallery = (preview.gallery_images || []).filter((u: string) => u !== body.url)
    const updates: Record<string, unknown> = { gallery_images: gallery }
    if (preview.hero_image_url === body.url) {
      updates.hero_image_url = gallery[0] || null
    }
    await adminSupabase
      .from('website_previews')
      .update(updates)
      .eq('id', preview.id)
    triggerRedeploy(preview.slug, preview.website_current)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
