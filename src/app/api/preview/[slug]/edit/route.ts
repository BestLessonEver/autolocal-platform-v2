import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const body = await req.json()

    const updates: Record<string, unknown> = {}
    if (body.business_name !== undefined) updates.business_name = body.business_name
    if (body.tagline !== undefined) updates.tagline = body.tagline || null
    if (body.description !== undefined) updates.description = body.description || null
    if (body.phone !== undefined) updates.phone = body.phone || null
    if (body.address !== undefined) updates.address = body.address || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('website_previews')
      .update(updates)
      .eq('slug', slug)

    if (error) {
      console.error('Preview edit error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Preview edit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
