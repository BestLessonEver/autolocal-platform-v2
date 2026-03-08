import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service role client for storage operations (bypasses RLS)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getPreviewForUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { preview: null }

  const { data: preview } = await adminSupabase
    .from('website_previews')
    .select('id, slug')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { preview }
}

// POST — logo upload
export async function POST(request: NextRequest) {
  const { preview } = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('logo') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `logos/${preview.slug}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload with service role (bypasses storage RLS)
  const { error: uploadError } = await adminSupabase.storage
    .from('client-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    // Try creating bucket if it doesn't exist
    if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
      await adminSupabase.storage.createBucket('client-assets', { public: true })
      const { error: retryError } = await adminSupabase.storage
        .from('client-assets')
        .upload(path, buffer, { contentType: file.type, upsert: true })
      if (retryError) {
        console.error('Logo upload retry failed:', retryError)
        return NextResponse.json({ error: 'Upload failed: ' + retryError.message }, { status: 500 })
      }
    } else {
      console.error('Logo upload failed:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }
  }

  const { data: { publicUrl } } = adminSupabase.storage
    .from('client-assets')
    .getPublicUrl(path)

  await adminSupabase
    .from('website_previews')
    .update({ logo_url: publicUrl })
    .eq('id', preview.id)

  return NextResponse.json({ logo_url: publicUrl })
}

// PATCH — update colors
export async function PATCH(request: NextRequest) {
  const { preview } = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, string> = {}
  if (body.brand_color_primary) updates.brand_color_primary = body.brand_color_primary
  if (body.brand_color_secondary) updates.brand_color_secondary = body.brand_color_secondary
  if (body.brand_color_accent) updates.brand_color_accent = body.brand_color_accent

  const { error } = await adminSupabase
    .from('website_previews')
    .update(updates)
    .eq('id', preview.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
