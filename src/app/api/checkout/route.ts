import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICES: Record<string, { id: string; mode: 'payment' | 'subscription' }> = {
  website:  { id: 'price_1T77nc6rjk1X08jT1bA3K1VW', mode: 'payment' }, // $1 TEST — swap back to price_1T6ks96rjk1X08jTmlFFzV5k for launch
  hosting:  { id: 'price_1T6ksA6rjk1X08jT7oK5ebY3', mode: 'subscription' },
  living:   { id: 'price_1T6ksA6rjk1X08jTHqC2DjC6', mode: 'subscription' },
  change:   { id: 'price_1T6ksB6rjk1X08jTZBgOJ20p', mode: 'payment' },
  rush:     { id: 'price_1T6ksB6rjk1X08jTk506zhin', mode: 'payment' },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product, email, businessName, contactName, phone, businessType, slug } = body

    if (!product || !PRICES[product]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const price = PRICES[product]

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: price.id, quantity: 1 },
    ]

    const metadata = {
      product,
      business_name: businessName || '',
      contact_name: contactName || '',
      email: email || '',
      phone: phone || '',
      business_type: businessType || '',
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: price.mode,
      line_items: lineItems,
      success_url: `https://autolocal.ai/thank-you?session_id={CHECKOUT_SESSION_ID}&product=${product}&business=${encodeURIComponent(businessName || '')}&slug=${encodeURIComponent(slug || '')}`,
      cancel_url: `https://autolocal.ai/offer${businessName ? `?business=${encodeURIComponent(businessName)}` : ''}`,
      customer_email: email || undefined,
      metadata,
      payment_intent_data: price.mode === 'payment' ? {
        metadata,
        statement_descriptor: 'AUTOLOCAL.AI',
        statement_descriptor_suffix: 'WEBSITE',
      } : undefined,
      subscription_data: price.mode === 'subscription' ? {
        metadata,
        description: `AutoLocal.ai - ${businessName || 'Website'}`,
      } : undefined,
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
