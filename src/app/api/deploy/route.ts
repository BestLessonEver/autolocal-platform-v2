/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateStaticHtml } from '@/lib/static-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || ''

// Normalize hours keys (DB may have "Monday" or "mon")
function normalizeHours(h: Record<string, string> | null): Record<string, string> {
  if (!h) return {}
  const map: Record<string, string> = { monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu', friday: 'fri', saturday: 'sat', sunday: 'sun' }
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(h)) {
    result[map[k.toLowerCase()] || k.toLowerCase()] = v
  }
  return result
}

// Deploy static HTML to Vercel
async function deployToVercel(slug: string, html: string): Promise<{ url: string; projectId: string }> {
  const projectName = `autolocal-${slug}`
  const vercelJson = JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    headers: [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ]}]
  })

  const teamQuery = VERCEL_TEAM ? `?teamId=${VERCEL_TEAM}` : ''
  const res = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: [
        { file: 'index.html', data: html },
        { file: 'vercel.json', data: vercelJson },
      ],
      projectSettings: { framework: null },
      target: 'production',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Vercel deploy failed: ${res.status} ${err}`)
  }

  const deployment = await res.json()
  return { url: `https://${deployment.url}`, projectId: deployment.projectId || deployment.id }
}

// Add subdomain to Vercel project
async function addSubdomain(slug: string, projectId: string): Promise<string> {
  const subdomain = `${slug}.autolocal.ai`
  const teamQuery = VERCEL_TEAM ? `&teamId=${VERCEL_TEAM}` : ''
  
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains?${teamQuery}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: subdomain }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Subdomain add warning: ${res.status} ${err}`)
  }

  return subdomain
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (token !== (process.env.INTERNAL_API_KEY || 'internal')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // 1. Fetch site data
    const { data, error } = await supabase
      .from('website_previews')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
    }

    // 2. Prepare data — normalize hours, resolve email, filter reviews
    const siteData = {
      ...data,
      hours: normalizeHours(data.hours),
      email: data.contact_email || data.email,
      reviews: (data.reviews || []).filter((r: any) => r.rating >= 4),
    }

    // 3. Generate static HTML using the selected template
    const template = data.template || 'bold'
    const html = generateStaticHtml(siteData, template)

    // 4. Deploy to Vercel
    const { url, projectId } = await deployToVercel(slug, html)

    // 5. Add subdomain
    const subdomain = await addSubdomain(slug, projectId)

    // 6. Update DB
    await supabase
      .from('website_previews')
      .update({ website_current: `https://${subdomain}` })
      .eq('slug', slug)

    return NextResponse.json({ success: true, url, subdomain: `https://${subdomain}`, projectId })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
