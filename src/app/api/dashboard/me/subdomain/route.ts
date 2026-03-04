/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { internalAuthHeader } from '@/lib/internal-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || ''

async function getAuthEmail() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || null
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

export async function PATCH(req: Request) {
  try {
    const email = await getAuthEmail()
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subdomain } = await req.json()
    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })
    }

    const newSlug = slugify(subdomain)
    if (!newSlug || newSlug.length < 3) {
      return NextResponse.json({ error: 'Subdomain must be at least 3 characters' }, { status: 400 })
    }

    // Get current site
    const { data: site, error: findErr } = await supabaseAdmin
      .from('website_previews')
      .select('id, slug, website_current')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findErr || !site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 })
    }

    if (newSlug === site.slug) {
      return NextResponse.json({ error: 'That\'s already your subdomain' }, { status: 400 })
    }

    // Check if new slug is taken
    const { data: existing } = await supabaseAdmin
      .from('website_previews')
      .select('id')
      .eq('slug', newSlug)
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'That subdomain is already taken' }, { status: 409 })
    }

    const oldSubdomain = `${site.slug}.autolocal.ai`
    const newSubdomain = `${newSlug}.autolocal.ai`

    // If site is deployed on Vercel, update the domain
    if (site.website_current) {
      const teamQuery = VERCEL_TEAM ? `&teamId=${VERCEL_TEAM}` : ''
      
      // Find the Vercel project
      const projectName = `autolocal-${site.slug}`
      
      // Add new subdomain
      const addRes = await fetch(`https://api.vercel.com/v10/projects/${projectName}/domains?${teamQuery}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSubdomain }),
      })

      if (!addRes.ok) {
        const err = await addRes.json()
        // If project not found by name, try by current domain
        if (addRes.status === 404) {
          console.error('Vercel project not found:', projectName)
        } else {
          console.error('Failed to add new subdomain:', err)
        }
      }

      // Remove old subdomain (non-fatal)
      await fetch(`https://api.vercel.com/v9/projects/${projectName}/domains/${oldSubdomain}?${teamQuery}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
      }).catch(err => console.error('Subdomain old-project cleanup failed:', err))
    }

    // Update DB
    const { error: updateErr } = await supabaseAdmin
      .from('website_previews')
      .update({
        slug: newSlug,
        website_current: site.website_current ? `https://${newSubdomain}` : null,
      })
      .eq('id', site.id)

    if (updateErr) {
      console.error('Slug update error:', updateErr)
      return NextResponse.json({ error: 'Failed to update subdomain' }, { status: 500 })
    }

    // Trigger redeploy with new slug so the site keeps all settings
    if (site.website_current) {
      fetch(`https://autolocal.ai/api/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': internalAuthHeader(),
        },
        body: JSON.stringify({ slug: newSlug }),
      }).catch(err => console.error('Redeploy after subdomain change failed:', err))
    }

    return NextResponse.json({
      success: true,
      slug: newSlug,
      subdomain: newSubdomain,
      url: `https://${newSubdomain}`,
    })
  } catch (err) {
    console.error('Subdomain update error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
