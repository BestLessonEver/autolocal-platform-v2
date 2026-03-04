import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find their Stripe customer ID from the clients table
    const { data: client } = await supabase
      .from('clients')
      .select('id, stripe_customer_id')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Find or create Stripe customer
    let customerId = client?.stripe_customer_id || null

    if (!customerId) {
      // Search Stripe by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 })
      if (customers.data.length) {
        customerId = customers.data[0].id
      } else {
        // Create a new Stripe customer for existing users (pre-subscription era)
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { source: 'billing_portal_upgrade' },
        })
        customerId = newCustomer.id
      }

      // Save customer ID for future lookups
      if (client) {
        await supabase
          .from('clients')
          .update({ stripe_customer_id: customerId })
          .eq('id', client.id)
          .catch(() => {})
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://autolocal.ai/dashboard',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: 'Failed to create billing portal' }, { status: 500 })
  }
}
