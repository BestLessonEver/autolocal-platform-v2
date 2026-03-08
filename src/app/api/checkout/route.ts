import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICES = {
  hosting: 'price_1T6ksA6rjk1X08jT7oK5ebY3',   // $9/mo recurring
  change:  'price_1T6ksB6rjk1X08jTZBgOJ20p',    // $7 one-time
  rush:    'price_1T6ksB6rjk1X08jTk506zhin',     // $29 one-time
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product, email, businessName, contactName, phone, businessType, slug } = body

    if (!product) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const metadata = {
      product,
      business_name: businessName || '',
      contact_name: contactName || '',
      email: email || '',
      phone: phone || '',
      business_type: businessType || '',
      slug: slug || '',
    }

    let sessionParams: Stripe.Checkout.SessionCreateParams

    if (product === 'hosting') {
      // $9/mo hosting subscription — first month FREE (30-day trial)
      sessionParams = {
        mode: 'subscription',
        line_items: [
          { price: PRICES.hosting, quantity: 1 },
        ],
        success_url: `https://autolocal.ai/thank-you?session_id={CHECKOUT_SESSION_ID}&product=hosting&business=${encodeURIComponent(businessName || '')}&slug=${encodeURIComponent(slug || '')}`,
        cancel_url: slug
          ? `https://autolocal.ai/my-site/${encodeURIComponent(slug)}`
          : `https://autolocal.ai`,
        customer_email: email || undefined,
        metadata,
        subscription_data: {
          trial_period_days: 30,
          metadata,
          description: `AutoLocal.ai - ${businessName || 'Website'} Hosting`,
        },
        payment_method_collection: 'always',
      }
    } else if (product === 'change' || product === 'rush') {
      // One-time payments
      const priceId = PRICES[product as keyof typeof PRICES]
      if (!priceId) {
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
      }
      sessionParams = {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `https://autolocal.ai/thank-you?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
        cancel_url: `https://autolocal.ai/dashboard`,
        customer_email: email || undefined,
        metadata,
        payment_intent_data: {
          metadata,
          statement_descriptor: 'AUTOLOCAL.AI',
        },
      }
    } else {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
