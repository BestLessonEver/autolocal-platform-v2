/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function verifyToken(token: string): { idPrefix: string; slug: string } | null {
  const dashSplit = token.indexOf('-')
  if (dashSplit < 4) return null
  return { idPrefix: token.substring(0, 8), slug: token.substring(9) }
}

// Update brand colors
export async function PATCH(
  req: Request,
  { params }: { params: { token: string } }
) {
  const parsed = verifyToken(params.token)
  if (!parsed) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data: preview } = await supabase
    .from('website_previews')
    .select('id')
    .eq('slug', parsed.slug)
    .single()

  if (!preview || !preview.id.startsWith(parsed.idPrefix)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const updates: Record<string, any> = {}

  if (body.brand_color_primary) updates.brand_color_primary = body.brand_color_primary
  if (body.brand_color_secondary) updates.brand_color_secondary = body.brand_color_secondary
  if (body.brand_color_accent) updates.brand_color_accent = body.brand_color_accent

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  const { error } = await supabase
    .from('website_previews')
    .update(updates)
    .eq('slug', parsed.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Brand colors updated!' })
}

// Upload logo
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const parsed = verifyToken(params.token)
  if (!parsed) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data: preview } = await supabase
    .from('website_previews')
    .select('id')
    .eq('slug', parsed.slug)
    .single()

  if (!preview || !preview.id.startsWith(parsed.idPrefix)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('logo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, WebP, or SVG.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const filePath = `logos/${parsed.slug}.${ext}`

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    // Bucket might not exist — try to create it
    if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
      await supabase.storage.createBucket('client-assets', { public: true })
      const { error: retryError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, buffer, { contentType: file.type, upsert: true })
      if (retryError) {
        return NextResponse.json({ error: 'Upload failed: ' + retryError.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('client-assets')
    .getPublicUrl(filePath)

  const logoUrl = urlData.publicUrl

  // Update preview record
  await supabase
    .from('website_previews')
    .update({ logo_url: logoUrl })
    .eq('slug', parsed.slug)

  return NextResponse.json({ success: true, logo_url: logoUrl })
}
