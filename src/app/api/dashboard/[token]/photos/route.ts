/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { internalAuthHeader } from '@/lib/internal-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function resolveToken(token: string) {
  const dashSplit = token.indexOf('-')
  if (dashSplit < 4) return null
  const idPrefix = token.substring(0, 8)
  const slug = token.substring(9)
  const { data, error } = await supabase
    .from('website_previews')
    .select('id, slug, hero_image_url, gallery_images, website_current')
    .eq('slug', slug)
    .single()
  if (error || !data || !data.id.startsWith(idPrefix)) return null
  return data
}

function triggerRedeploy(slug: string | null, websiteCurrent: string | null) {
  if (!slug || !websiteCurrent) return
  try {
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': internalAuthHeader(),
      },
      body: JSON.stringify({ slug }),
    }).catch(err => console.error('Photo redeploy failed:', err))
  } catch { /* non-fatal */ }
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const preview = await resolveToken(params.token)
  if (!preview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    hero_image_url: preview.hero_image_url,
    gallery_images: preview.gallery_images || [],
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const preview = await resolveToken(params.token)
  if (!preview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('photo') as File
  const target = formData.get('target') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const path = `${preview.id}/photos/${timestamp}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('client-assets')
    .getPublicUrl(path)

  if (target === 'hero') {
    await supabase
      .from('website_previews')
      .update({ hero_image_url: publicUrl })
      .eq('id', preview.id)
  } else {
    const gallery = preview.gallery_images || []
    gallery.push(publicUrl)
    await supabase
      .from('website_previews')
      .update({ gallery_images: gallery })
      .eq('id', preview.id)
  }

  triggerRedeploy(preview.slug, preview.website_current)
  return NextResponse.json({ url: publicUrl, target })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const preview = await resolveToken(params.token)
  if (!preview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  if (body.action === 'set_hero' && body.url) {
    await supabase
      .from('website_previews')
      .update({ hero_image_url: body.url })
      .eq('id', preview.id)
    triggerRedeploy(preview.slug, preview.website_current)
    return NextResponse.json({ success: true })
  }

  if (body.action === 'reorder' && Array.isArray(body.gallery_images)) {
    await supabase
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
    await supabase
      .from('website_previews')
      .update(updates)
      .eq('id', preview.id)
    triggerRedeploy(preview.slug, preview.website_current)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
