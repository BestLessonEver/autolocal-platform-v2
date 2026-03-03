import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: preview } = await supabase
    .from('website_previews')
    .select('id, plan')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!preview) return NextResponse.json({ error: 'No website found' }, { status: 404 })

  const body = await request.json()
  const { type, message, priority } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const plan = preview.plan || 'starter'
  const unlimited = plan === 'living'

  // Count changes this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('change_requests')
    .select('*', { count: 'exact', head: true })
    .eq('preview_id', preview.id)
    .gte('created_at', monthStart)

  const used = count || 0
  const freeRemaining = unlimited ? Infinity : Math.max(0, 2 - used)

  // Calculate cost
  let cost = 0
  if (!unlimited && freeRemaining <= 0) cost += 19 // $19 per extra change
  if (priority === 'urgent' && !unlimited) cost += 29 // $29 rush fee

  const { error } = await supabase.from('change_requests').insert({
    preview_id: preview.id,
    type: type || 'other',
    message: message.trim(),
    priority: priority || 'normal',
    cost,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    cost,
    changes_this_month: used + 1,
    free_changes_remaining: unlimited ? Infinity : Math.max(0, 2 - used - 1),
  })
}
