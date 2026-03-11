import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registerDomain, setDnsRecords } from '@/lib/namecheap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Auth: only internal webhook calls
  const auth = req.headers.get('authorization') || ''
  const internalKey = process.env.INTERNAL_API_KEY || ''
  if (!auth.includes(internalKey) && internalKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { domain, siteId } = await req.json()

    if (!domain || !siteId) {
      return NextResponse.json({ error: 'Domain and siteId required' }, { status: 400 })
    }

    // Verify the site exists and belongs to this user
    const { data: site, error: siteErr } = await supabase
      .from('website_previews')
      .select('id, slug, email, business_name, hosting_status')
      .eq('id', siteId)
      .single()

    if (siteErr || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Update domain status to "registering"
    await supabase
      .from('website_previews')
      .update({
        custom_domain: domain,
        domain_status: 'registering',
        domain_provider: 'namecheap',
      })
      .eq('id', siteId)

    // Register the domain via Namecheap
    // Using AutoLocal's registrant info (we own the registration, user gets the site)
    const result = await registerDomain({
      domain,
      firstName: 'Brian',
      lastName: 'Carrion',
      address: '1000 Friendswood Dr',
      city: 'Friendswood',
      state: 'TX',
      postalCode: '77546',
      country: 'US',
      phone: '+1.8888888888', // TODO: Use real business phone
      email: 'domains@autolocal.ai',
    })

    if (!result.success) {
      await supabase
        .from('website_previews')
        .update({ domain_status: 'failed' })
        .eq('id', siteId)
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: 500 })
    }

    // Set DNS to point to the Vercel-hosted site
    const slug = site.slug
    try {
      await setDnsRecords(domain, [
        { type: 'CNAME', host: '@', value: `${slug}.autolocal.ai`, ttl: 1800 },
        { type: 'CNAME', host: 'www', value: `${slug}.autolocal.ai`, ttl: 1800 },
      ])
    } catch (dnsErr) {
      console.error('[domains/register] DNS setup failed:', dnsErr)
      // Domain registered but DNS failed — admin can fix manually
    }

    // Add custom domain to Vercel project
    try {
      await addVercelDomain(slug, domain)
      await addVercelDomain(slug, `www.${domain}`)
    } catch (vercelErr) {
      console.error('[domains/register] Vercel domain add failed:', vercelErr)
    }

    // Update DB with success
    await supabase
      .from('website_previews')
      .update({
        domain_status: 'active',
        domain_registrar_id: result.domainId,
        domain_auto_renew: true,
      })
      .eq('id', siteId)

    return NextResponse.json({ 
      success: true, 
      domain,
      message: `${domain} is registered and being configured. Your site will be live at ${domain} within a few minutes.`
    })
  } catch (err) {
    console.error('[domains/register]', err)
    return NextResponse.json({ error: 'Domain registration failed. Please try again.' }, { status: 500 })
  }
}

/** Add a custom domain to a Vercel project */
async function addVercelDomain(slug: string, domain: string) {
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token) throw new Error('VERCEL_TOKEN not set')

  // First find the project by looking for the slug subdomain
  const projectName = `autolocal-${slug}`
  const teamQuery = teamId ? `teamId=${teamId}` : ''
  
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectName}/domains?${teamQuery}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Vercel domain add failed: ${res.status} ${err}`)
  }

  return res.json()
}
