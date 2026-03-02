import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICES: Record<string, { id: string; mode: 'payment' | 'subscription' }> = {
  website:  { id: 'price_1T6ZJQDUy51dXIls0gwIFnK1', mode: 'payment' },
  hosting:  { id: 'price_1T6ZJRDUy51dXIlsLecL1Gkt', mode: 'subscription' },
  living:   { id: 'price_1T6ZJRDUy51dXIlsfXqIRv8H', mode: 'subscription' },
  change:   { id: 'price_1T6ZJSDUy51dXIlsnmxQS6MX', mode: 'payment' },
  rush:     { id: 'price_1T6ZJSDUy51dXIlsC4uy5LH8', mode: 'payment' },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product, slug, email, businessName } = body

    if (!product || !PRICES[product]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const price = PRICES[product]
    
    // Build line items — for website purchase, bundle with hosting
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: price.id, quantity: 1 },
    ]

    // If buying website, also show hosting as a separate subscription
    // We'll handle this with two separate checkouts for simplicity
    // Website = one-time, then redirect to hosting subscription

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: price.mode,
      line_items: lineItems,
      success_url: `https://autolocal.ai/thank-you?session_id={CHECKOUT_SESSION_ID}&product=${product}&slug=${slug || ''}`,
      cancel_url: `https://autolocal.ai/offer${slug ? `?business=${encodeURIComponent(businessName || '')}` : ''}`,
      customer_email: email || undefined,
      metadata: {
        product,
        slug: slug || '',
        business_name: businessName || '',
      },
      payment_intent_data: price.mode === 'payment' ? {
        metadata: {
          product,
          slug: slug || '',
          business_name: businessName || '',
        },
      } : undefined,
      subscription_data: price.mode === 'subscription' ? {
        metadata: {
          product,
          slug: slug || '',
          business_name: businessName || '',
        },
      } : undefined,
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
