import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createPortalSession(email: string, returnUrl: string) {
  // Find Stripe customer ID from website_previews (single source of truth)
  const { data: preview } = await adminSupabase
    .from('website_previews')
    .select('stripe_customer_id')
    .eq('email', email)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let customerId = preview?.stripe_customer_id || null

  if (!customerId) {
    // Search Stripe by email
    const customers = await stripe.customers.list({ email, limit: 1 })
    if (customers.data.length) {
      customerId = customers.data[0].id
    } else {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: { source: 'billing_portal' },
      })
      customerId = newCustomer.id
    }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

// POST — auth-based dashboard
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = await createPortalSession(user.email, 'https://autolocal.ai/dashboard')
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: 'Failed to create billing portal' }, { status: 500 })
  }
}

// GET — token-based dashboard (query param ?email=...)
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    // Verify this email actually has a site
    const { data: site } = await adminSupabase
      .from('website_previews')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single()

    if (!site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 })
    }

    const url = await createPortalSession(email, 'https://autolocal.ai')
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: 'Failed to create billing portal' }, { status: 500 })
  }
}
