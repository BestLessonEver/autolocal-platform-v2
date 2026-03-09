import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sites, error } = await supabase
    .from('website_previews')
    .select('id, slug, business_name, city, state, template, hosting_status, hero_image_url, created_at')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error || !sites || sites.length === 0) {
    return NextResponse.json({ error: 'No websites found' }, { status: 404 })
  }

  return NextResponse.json(sites)
}
