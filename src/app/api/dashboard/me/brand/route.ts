import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getPreviewForUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { supabase, preview: null }

  const { data: preview } = await supabase
    .from('website_previews')
    .select('id, slug')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { supabase, preview }
}

// POST — logo upload
export async function POST(request: NextRequest) {
  const { supabase, preview } = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('logo') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${preview.id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('client-assets')
    .getPublicUrl(path)

  await supabase
    .from('website_previews')
    .update({ logo_url: publicUrl })
    .eq('id', preview.id)

  return NextResponse.json({ logo_url: publicUrl })
}

// PATCH — update colors
export async function PATCH(request: NextRequest) {
  const { supabase, preview } = await getPreviewForUser()
  if (!preview) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, string> = {}
  if (body.brand_color_primary) updates.brand_color_primary = body.brand_color_primary
  if (body.brand_color_secondary) updates.brand_color_secondary = body.brand_color_secondary
  if (body.brand_color_accent) updates.brand_color_accent = body.brand_color_accent

  const { error } = await supabase
    .from('website_previews')
    .update(updates)
    .eq('id', preview.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
