import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const searchCity = city || 'Friendswood'
    const searchState = state || 'TX'

    // Step 1: Google Places lookup
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
    const place = placesData?.places?.[0]

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

    // Photos
    const photoUrls = (place.photos || []).slice(0, 4).map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
      tagline: summary || `Your trusted ${category} in ${cityName}`,
      description: summary || '',
      category,
      brand_color_primary: primary,
      brand_color_secondary: secondary,
      brand_color_accent: accent,
      hero_image_url: photoUrls[0] || '',
      gallery_images: photoUrls.slice(0, 3),
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
    console.log('[generate-preview] Inserting slug:', fullSlug, 'name:', name)
    const { error: insertError } = await supabase
      .from('website_previews')
      .insert(payload)

    if (insertError) {
      console.log('[generate-preview] Insert error:', insertError.code, insertError.message)
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

    console.log('[generate-preview] Success! Preview URL:', `/preview/${fullSlug}`)
    return NextResponse.json({
      success: true,
      previewUrl: `/preview/${fullSlug}`,
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
