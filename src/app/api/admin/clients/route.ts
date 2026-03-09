import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_KEY = process.env.ADMIN_API_KEY
const ADMIN_EMAILS = [
  'brian@autolocal.ai',
  'whoisbc@me.com',
  'bestlessoninfo@gmail.com',
]

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Check API key header
  if (ADMIN_KEY && req.headers.get('x-admin-key') === ADMIN_KEY) return true
  // Check Supabase session cookie
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return req.cookies.get(name)?.value }, set() {}, remove() {} } }
  )
  const { data: { user } } = await sb.auth.getUser()
  return !!user && ADMIN_EMAILS.includes(user.email || '')
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
