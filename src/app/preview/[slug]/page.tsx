/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import PreviewWrapper from './PreviewWrapper'

// Force dynamic rendering — previews are created on the fly
export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'whoisbc@me.com,bestlessoninfo@gmail.com').split(',').map(e => e.trim().toLowerCase())

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('website_previews')
    .select('business_name, tagline, description, hosting_status')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Preview Not Found' }

  return {
    title: `${data.business_name} | Website Preview`,
    description: data.tagline || data.description || `Preview website for ${data.business_name}`,
    robots: data.hosting_status === 'active' ? 'index, follow' : 'noindex, nofollow',
  }
}

export default async function PreviewPage({ params, searchParams }: Props & { searchParams: { token?: string } }) {
  const { data, error } = await supabase
    .from('website_previews')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!data || error) {
    notFound()
  }

  // If hosting is active (deployed), the preview is public
  if (data.hosting_status === 'active') {
    void supabase.rpc('increment_preview_views', { preview_slug: params.slug })
    return <PreviewWrapper data={data} />
  }

  // For non-active sites, require authentication — owner, admin, or valid token
  let authorized = false

  // Check token access (from /my-site/[token] dashboard)
  const token = searchParams?.token
  if (token) {
    const dashIdx = token.indexOf('-')
    if (dashIdx >= 4) {
      const idPrefix = token.substring(0, 8)
      const tokenSlug = token.substring(9)
      if (tokenSlug === params.slug && data.id?.startsWith(idPrefix)) {
        authorized = true
      }
    }
  }

  // Check cookie auth
  if (!authorized) {
    try {
      const authSupabase = createServerSupabaseClient()
      const { data: { user } } = await authSupabase.auth.getUser()

      if (user?.email) {
        const userEmail = user.email.toLowerCase()
        if (ADMIN_EMAILS.includes(userEmail)) {
          authorized = true
        } else if (data.email?.toLowerCase() === userEmail || data.contact_email?.toLowerCase() === userEmail) {
          authorized = true
        }
      }
    } catch {
      // No valid session
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <span className="text-6xl block mb-6">🔒</span>
          <h1 className="text-2xl font-black text-white mb-3">Private Preview</h1>
          <p className="text-gray-400 mb-6">
            This website preview is private. Please log in with the email associated with this business to view it.
          </p>
          <a
            href={`/login?redirect=/preview/${params.slug}`}
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:brightness-110 transition"
          >
            Log In to View →
          </a>
          <p className="text-gray-600 text-xs mt-8">Powered by AutoLocal.ai</p>
        </div>
      </div>
    )
  }

  void supabase.rpc('increment_preview_views', { preview_slug: params.slug })
  return <PreviewWrapper data={data} />
}
