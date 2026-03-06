import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICES = {
  website: 'price_1T6ks96rjk1X08jTmlFFzV5k',     // $99 one-time
  hosting: 'price_1T6ksA6rjk1X08jT7oK5ebY3',   // $9/mo recurring
  change:  'price_1T6ksB6rjk1X08jTZBgOJ20p',    // $7 one-time (was $19)
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
    }

    let sessionParams: Stripe.Checkout.SessionCreateParams

    if (product === 'website') {
      // Bundle: $99 one-time website + $9/mo hosting subscription
      // Using subscription mode with a one-time add-on
      sessionParams = {
        mode: 'subscription',
        line_items: [
          { price: PRICES.hosting, quantity: 1 },  // $9/mo recurring
        ],
        success_url: `https://autolocal.ai/thank-you?session_id={CHECKOUT_SESSION_ID}&product=${product}&business=${encodeURIComponent(businessName || '')}&slug=${encodeURIComponent(slug || '')}`,
        cancel_url: `https://autolocal.ai/offer${businessName ? `?business=${encodeURIComponent(businessName)}` : ''}`,
        customer_email: email || undefined,
        metadata,
        subscription_data: {
          metadata,
          description: `AutoLocal.ai - ${businessName || 'Website'} Hosting`,
        },
        // Add the one-time website fee as an invoice item
        invoice_creation: undefined,
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

    // For website purchases, we need to add the one-time setup fee
    // Stripe subscription checkout doesn't support mixed line items directly,
    // so we add it via subscription_data.add_invoice_items
    if (product === 'website') {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        metadata,
        description: `AutoLocal.ai - ${businessName || 'Website'} Hosting`,
      }
      // Stripe doesn't support add_invoice_items in checkout, so we use a different approach:
      // Add the website price as a one-time line item in the checkout
      // This works when mode=subscription — Stripe allows one-time prices alongside recurring
      sessionParams.line_items = [
        { price: PRICES.website, quantity: 1 },    // $99 one-time setup
        { price: PRICES.hosting, quantity: 1 },     // $9/mo recurring
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
