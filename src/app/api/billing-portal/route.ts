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
      .select('stripe_customer_id')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!client?.stripe_customer_id) {
      // Try to find by email in Stripe directly
      const customers = await stripe.customers.list({ email: user.email, limit: 1 })
      if (!customers.data.length) {
        return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: 'https://autolocal.ai/dashboard',
      })
      return NextResponse.json({ url: session.url })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: 'https://autolocal.ai/dashboard',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: 'Failed to create billing portal' }, { status: 500 })
  }
}
