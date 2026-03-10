import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'
const ADMIN_EMAILS = [
  'brian@autolocal.ai',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if admin — redirect to admin dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && ADMIN_EMAILS.includes(user.email) && next === '/dashboard') {
        return NextResponse.redirect(`${SITE_URL}/admin/clients`)
      }
      return NextResponse.redirect(`${SITE_URL}${next}`)
    }
  }

  return NextResponse.redirect(`${SITE_URL}/login?error=auth_failed`)
}
