/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { internalAuthHeader } from '@/lib/internal-auth'
import { sendEmail } from '@/lib/mailer'

// ============================================================
// Config — fail fast on missing credentials
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_KEY) {
  console.warn('[generate-preview] SUPABASE_SERVICE_ROLE_KEY not set — using anon key (may have insufficient permissions)')
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY
if (!GOOGLE_PLACES_KEY) {
  console.error('[generate-preview] GOOGLE_PLACES_API_KEY not set — Google Places lookups will fail')
}

// ============================================================
// Welcome email for free preview
// ============================================================

async function sendPreviewEmail(to: string, contactName: string, businessName: string, slug: string) {
  const firstName = contactName?.split(' ')[0] || 'there'

  // Generate magic link for dashboard access
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: to,
    options: { redirectTo: 'https://autolocal.ai/auth/callback?next=/dashboard' },
  })
  const magicLinkUrl = data?.properties?.action_link || 'https://autolocal.ai/login'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:800;color:#ffffff;">⚡ AutoLocal.ai</span>
        </td></tr>
        <tr><td style="background-color:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px 32px;">
          <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 16px;">Hi ${firstName}, your website is ready! 🎉</h1>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 16px;">
            We just built a custom website for <strong style="color:#ffffff;">${businessName}</strong> using your real business info. It's live and ready to customize right now.
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin:0 0 28px;">
            <a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">Open My Dashboard →</a>
          </div>

          <!-- Promo box -->
          <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:12px;padding:16px 24px;margin:0 0 28px;text-align:center;">
            <p style="color:#ffffff;font-size:14px;font-weight:700;margin:0 0 4px;">🎉 Free Month of Hosting</p>
            <p style="color:#e0e7ff;font-size:13px;margin:0;">Activate from your dashboard — $0 today, just $9/mo after your free trial. Cancel anytime.</p>
          </div>

          <!-- How to make your site great -->
          <h2 style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 12px;">🛠️ How to Make Your Site Stand Out</h2>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="color:#6366f1;font-weight:700;font-size:14px;">📸 Upload professional photos</span>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;">This is the #1 thing that makes a site look great. Phone photos work, but pro photos make you look like a premium business. Show your space, your team, your work.</p>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="color:#6366f1;font-weight:700;font-size:14px;">✏️ Customize your text</span>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;">Click any text on your dashboard to edit it. Update your headline, description, and services to match your voice.</p>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="color:#6366f1;font-weight:700;font-size:14px;">🎨 Try different templates</span>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;">Your dashboard has 8 templates — modern, bold, artsy, even retro. Switch anytime and see a live preview instantly.</p>
            </td></tr>
            <tr><td style="padding:8px 0;">
              <span style="color:#6366f1;font-weight:700;font-size:14px;">🕐 Add your hours & contact info</span>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;">Make sure customers can find you. Add your business hours, phone number, and email so they can reach out.</p>
            </td></tr>
          </table>

          <!-- How to log in -->
          <h2 style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px;">🔑 How to Log In</h2>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 6px;">
            <strong style="color:#d4d4d8;">Option 1:</strong> Click the button above — it signs you in automatically.
          </p>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 6px;">
            <strong style="color:#d4d4d8;">Option 2:</strong> Go to <a href="https://autolocal.ai/login" style="color:#6366f1;">autolocal.ai/login</a> and enter this email. We'll send you a sign-in link (no password needed).
          </p>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
            <strong style="color:#d4d4d8;">Your preview:</strong> <a href="https://autolocal.ai/preview/${slug}" style="color:#6366f1;">autolocal.ai/preview/${slug}</a>
          </p>

          <p style="color:#52525b;font-size:13px;margin:0;">
            Questions? Just reply to this email — a real person reads every one.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="color:#3f3f46;font-size:12px;margin:0;">Brian @ AutoLocal.ai · Custom websites for local businesses</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await sendEmail(to, `Your ${businessName} website is ready! 🎉`, html)
}

// ============================================================
// Rate limiter (in-memory, per-IP, resets on restart)
// ============================================================

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_MAX = 10 // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter(t => t > now - RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(ip, recent)
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  return false
}

// ============================================================
// Input sanitization
// ============================================================

function sanitizeInput(str: string): string {
  return str
    .replace(/[<>"'`;\\]/g, '')
    .trim()
    .slice(0, 200)
}

// Human-readable labels for Google Place types
const TYPE_LABELS: Record<string, string> = {
  hair_care: 'Hair Care', beauty_salon: 'Beauty Salon', barber_shop: 'Barber Shop', spa: 'Spa & Wellness',
  gym: 'Fitness Center', fitness_center: 'Fitness Center', yoga_studio: 'Yoga Studio',
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar & Grill', bakery: 'Bakery',
  plumber: 'Plumbing', electrician: 'Electrical', roofing_contractor: 'Roofing',
  car_repair: 'Auto Repair', car_dealer: 'Auto Dealer',
  dentist: 'Dental Practice', doctor: 'Medical Practice', veterinary_care: 'Veterinary Care',
  real_estate_agency: 'Real Estate', insurance_agency: 'Insurance', accounting: 'Accounting',
  lawyer: 'Law Firm', school: 'Education', music_school: 'Music Education',
  store: 'Retail', clothing_store: 'Fashion', pet_store: 'Pet Care',
  florist: 'Floral Design', photographer: 'Photography', moving_company: 'Moving Services',
}

function generateTagline(name: string, category: string, types: string[], city: string): string {
  // Try to get a human-readable type
  let typeLabel = ''
  for (const t of types) {
    if (TYPE_LABELS[t]) { typeLabel = TYPE_LABELS[t]; break }
  }

  if (typeLabel) {
    const taglines = [
      `Quality ${typeLabel} in ${city}`,
      `${city}'s choice for ${typeLabel.toLowerCase()}`,
      `Professional ${typeLabel.toLowerCase()} serving ${city}`,
    ]
    return taglines[Math.floor(Math.random() * taglines.length)]
  }

  // Category-based fallbacks
  const catTaglines: Record<string, string[]> = {
    salon: [`Premium beauty services in ${city}`, `Look your best in ${city}`],
    fitness: [`Get fit in ${city}`, `${city}'s fitness destination`],
    restaurant: [`Great food, great vibes in ${city}`, `A ${city} favorite`],
    contractor: [`Reliable service in ${city}`, `${city}'s trusted professionals`],
    general: [`Proudly serving ${city}`, `Your neighborhood business in ${city}`],
  }
  const options = catTaglines[category] || catTaglines.general
  return options[Math.floor(Math.random() * options.length)]
}

function generateDescription(name: string, category: string, city: string): string {
  return `Welcome to ${name} — proudly serving ${city} and the surrounding area. We're committed to delivering exceptional quality and service.`
}

const TYPE_MAP: Record<string, string> = {
  hair_care: 'salon', beauty_salon: 'salon', barber_shop: 'salon', spa: 'salon',
  dentist: 'dental', doctor: 'dental',
  restaurant: 'restaurant', cafe: 'restaurant', bakery: 'restaurant', bar: 'restaurant',
  gym: 'fitness', fitness_center: 'fitness', yoga_studio: 'fitness',
  plumber: 'contractor', electrician: 'contractor', roofing_contractor: 'contractor',
  general_contractor: 'contractor', painter: 'contractor',
  store: 'general', clothing_store: 'general',
  school: 'general', music_school: 'general', university: 'general',
}

const COLORS: Record<string, [string, string, string]> = {
  salon: ['#1a1a2e', '#16213e', '#c8a97e'],
  dental: ['#1a365d', '#2a4365', '#38b2ac'],
  restaurant: ['#1a1a2e', '#2d1b0e', '#c05621'],
  fitness: ['#1a1a2e', '#1a202c', '#e53e3e'],
  contractor: ['#1a365d', '#2c5282', '#dd6b20'],
  general: ['#1a1a2e', '#16213e', '#6366f1'],
}

const TEMPLATE_MAP: Record<string, string> = {
  salon: 'artika',
  dental: 'clutch',
  contractor: 'clutch',
  fitness: 'bde',
  restaurant: 'bde',
  general: 'bde',
}

const DEBUG = process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function log(...args: unknown[]) { if (DEBUG) console.log(...args) }

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // Fail fast if Google Places key is missing
    if (!GOOGLE_PLACES_KEY) {
      return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
    }

    const body = await req.json()
    const businessName = sanitizeInput(body.businessName || '')
    const city = sanitizeInput(body.city || '')
    const state = sanitizeInput(body.state || '')
    const email = sanitizeInput(body.email || '')
    const contactName = sanitizeInput(body.contactName || '')

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const searchCity = city || 'Friendswood'
    const searchState = state || 'TX'
    const placeId = sanitizeInput(body.placeId || '')

    // Step 1: Google Places lookup
    let place: any = null

    if (placeId) {
      // Direct lookup by place ID
      const placeRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,regularOpeningHours,nationalPhoneNumber,websiteUri,reviews,photos,types,editorialSummary',
        },
      })
      place = await placeRes.json()
    } else {
      const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.reviews,places.photos,places.types,places.editorialSummary',
        },
        body: JSON.stringify({ textQuery: `${businessName} ${searchCity} ${searchState}` }),
      })
      const placesData = await placesRes.json()
      place = placesData?.places?.[0]
    }

    if (!place) {
      return NextResponse.json({ error: 'Business not found on Google. Try a more specific name.' }, { status: 404 })
    }

    const name = place.displayName?.text || businessName
    const address = place.formattedAddress || ''
    const phone = place.nationalPhoneNumber || ''
    const website = place.websiteUri || ''
    const rating = place.rating || 0
    const reviewCount = place.userRatingCount || 0
    const summary = place.editorialSummary?.text || ''
    const types: string[] = place.types || []

    // Parse hours
    const hours: Record<string, string> = {}
    for (const desc of place.regularOpeningHours?.weekdayDescriptions || []) {
      const parts = desc.split(': ')
      if (parts.length === 2) {
        hours[parts[0].toLowerCase().slice(0, 3)] = parts[1]
          .replace(/\u202f/g, ' ')
          .replace(/\u2009/g, '')
          .replace(/\u2013/g, '-')
      }
    }

    // Parse reviews
    const reviews = (place.reviews || []).slice(0, 5).map((r: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      let author = r.authorAttribution?.displayName || 'Anonymous'
      const parts = author.split(' ')
      if (parts.length >= 2) author = `${parts[0]} ${parts[parts.length - 1][0]}.`
      return {
        author,
        rating: r.rating || 5,
        text: (r.text?.text || '').slice(0, 200),
      }
    })

    // Photos — grab all available (Google returns up to 10)
    const photoUrls = (place.photos || []).slice(0, 10).map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const pname = p.name || ''
      return pname ? `https://places.googleapis.com/v1/${pname}/media?maxWidthPx=800&key=${GOOGLE_PLACES_KEY}` : ''
    }).filter(Boolean)

    // Detect category
    const VALID_CATEGORIES = new Set(['salon', 'dental', 'fitness', 'restaurant', 'contractor', 'general'])
    let category = 'general'
    for (const t of types) {
      if (TYPE_MAP[t]) { category = TYPE_MAP[t]; break }
    }
    // Safety: ensure category passes DB constraint
    if (!VALID_CATEGORIES.has(category)) category = 'general'

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const cityPart = address.includes(',')
      ? address.split(',')[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : ''
    const fullSlug = cityPart && !slug.includes(cityPart) ? `${slug}-${cityPart}` : slug

    // Colors + template
    const [primary, secondary, accent] = COLORS[category] || COLORS.general
    const template = TEMPLATE_MAP[category] || 'bde'
    const phoneClean = phone.replace(/[^0-9]/g, '')
    const cityName = address.includes(',') ? address.split(',')[1].trim() : searchCity

    const payload = {
      slug: fullSlug,
      business_name: name,
      tagline: summary || generateTagline(name, category, types, cityName),
      description: summary || generateDescription(name, category, cityName),
      category,
      brand_color_primary: primary,
      brand_color_secondary: secondary,
      brand_color_accent: accent,
      hero_image_url: photoUrls[0] || '',
      gallery_images: photoUrls,
      services: [],
      hours: Object.keys(hours).length > 0 ? hours : null,
      address: address.includes(',') ? address.split(',')[0] : address,
      city: cityName,
      state: searchState,
      phone,
      email: email || '',
      website_current: website,
      reviews,
      google_rating: rating,
      google_review_count: reviewCount,
      cta_text: 'Call Now',
      cta_url: phoneClean ? `tel:${phoneClean}` : '#contact',
      template,
      status: 'published',
    }

    // Upsert to Supabase
    log('[generate-preview] Inserting slug:', fullSlug, 'name:', name)
    const { error: insertError } = await supabase
      .from('website_previews')
      .insert(payload)

    if (insertError) {
      log('[generate-preview] Insert error:', insertError.code, insertError.message)
      if (insertError.code === '23505') {
        // Duplicate slug — update instead
        const { error: updateError } = await supabase
          .from('website_previews')
          .update(payload)
          .eq('slug', fullSlug)
        if (updateError) {
          console.error('[generate-preview] Update error:', updateError)
          return NextResponse.json({ error: 'Failed to save preview. Please try again.' }, { status: 500 })
        }
      } else {
        console.error('[generate-preview] Insert failed:', insertError)
        return NextResponse.json({ error: `Failed to create preview: ${insertError.message}` }, { status: 500 })
      }
    }

    // Save lead if email provided
    if (email) {
      await supabase
        .from('audit_requests')
        .insert({
          business_name: name,
          website: website,
          city: cityName,
          state: searchState,
          email,
        })
        .then(() => {})
    }

    // Send welcome email with magic link (fire and forget)
    if (email) {
      sendPreviewEmail(email, contactName || name, name, fullSlug).catch(err =>
        console.error('[generate-preview] Email send failed:', err)
      )

      // Enqueue drip campaign — nurture until they activate hosting
      fetch('https://autolocal.ai/api/drip/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': internalAuthHeader() },
        body: JSON.stringify({
          email,
          stage: 'previewed',
          slug: fullSlug,
          businessName: name,
          contactName: contactName || undefined,
        }),
      }).catch(err => console.error('[generate-preview] Drip enqueue failed:', err))
    }

    // Generate auto-login token so thank-you page can sign user in
    let autoLoginToken = ''
    if (email) {
      try {
        // Ensure user exists first
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find((u: any) => u.email === email)
        if (!existingUser) {
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
          })
        }

        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo: 'https://autolocal.ai/auth/callback?next=/dashboard' },
        })
        // Extract token_hash from the action_link
        const actionLink = linkData?.properties?.action_link || ''
        const tokenMatch = actionLink.match(/token_hash=([^&]+)/)
        if (tokenMatch) autoLoginToken = tokenMatch[1]
      } catch (err) {
        log('[generate-preview] Auto-login token generation failed:', err)
      }
    }

    // Build preview access token: {id-prefix-8}-{slug}
    let previewToken = ''
    try {
      const { data: row } = await supabase
        .from('website_previews')
        .select('id')
        .eq('slug', fullSlug)
        .single()
      if (row?.id) {
        previewToken = `${row.id.substring(0, 8)}-${fullSlug}`
      }
    } catch {}

    log('[generate-preview] Success! Preview URL:', `/preview/${fullSlug}`)
    return NextResponse.json({
      success: true,
      previewUrl: previewToken
        ? `/preview/${fullSlug}?token=${encodeURIComponent(previewToken)}`
        : `/preview/${fullSlug}`,
      autoLoginToken,
      slug: fullSlug,
      businessName: name,
      category,
      template,
      rating,
      reviewCount,
    })
  } catch (err) {
    console.error('[generate-preview] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
