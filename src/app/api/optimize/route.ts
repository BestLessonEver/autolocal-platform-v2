/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// Auth: internal API key or admin
function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key')
  return key === process.env.ADMIN_API_KEY
}

interface OptimizationResult {
  slug: string
  business_name: string
  changes: string[]
  redeployed: boolean
  error?: string
}

// Refresh Google Places data for a site
async function refreshGoogleData(site: any): Promise<{ reviews: any[]; rating: number | null; reviewCount: number; photos: string[] } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || !site.google_place_id) return null

  try {
    // Use Places API (new) to get fresh data
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${site.google_place_id}?fields=reviews,rating,userRatingCount,photos`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount,photos',
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()

    const reviews = (data.reviews || []).slice(0, 10).map((r: any) => ({
      author: r.authorAttribution?.displayName || 'Customer',
      rating: r.rating || 5,
      text: r.text?.text || '',
      date: r.relativePublishTimeDescription || '',
    }))

    const photos = (data.photos || []).slice(0, 10).map((p: any) =>
      `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1200&key=${apiKey}`
    )

    return {
      reviews,
      rating: data.rating || null,
      reviewCount: data.userRatingCount || 0,
      photos,
    }
  } catch {
    return null
  }
}

// AI-optimize site copy based on reviews and current content
async function optimizeCopy(site: any): Promise<{ tagline?: string; description?: string; changes: string[] }> {
  const changes: string[] = []

  const reviewText = (site.reviews || [])
    .filter((r: any) => r.rating >= 4)
    .map((r: any) => r.text)
    .join('\n')
    .slice(0, 2000)

  if (!reviewText && !site.description) {
    return { changes: ['No reviews or description to optimize'] }
  }

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a local business website copywriter. Your job is to write compelling, authentic copy based on real customer reviews and business info. 
          
Rules:
- Keep it SHORT. Tagline: max 10 words. Description: max 2 sentences.
- Use language customers actually use in reviews (mirror their words)
- Include the city/area name for local SEO
- Sound human, not corporate
- Highlight what makes this business special based on reviews
- Return JSON only: { "tagline": "...", "description": "...", "reasoning": "..." }`
        },
        {
          role: 'user',
          content: `Business: ${site.business_name}
Category: ${site.category || 'Local Business'}
City: ${site.city || 'Unknown'}
Current tagline: ${site.tagline || 'None'}
Current description: ${site.description || 'None'}
Google rating: ${site.google_rating || 'N/A'} (${site.google_review_count || 0} reviews)

Recent positive reviews:
${reviewText || 'No reviews available'}

Generate an improved tagline and description. If the current ones are already great, return them unchanged and explain why in reasoning.`
        }
      ],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    const output: { tagline?: string; description?: string; changes: string[] } = { changes }

    if (result.tagline && result.tagline !== site.tagline) {
      output.tagline = result.tagline
      changes.push(`Tagline: "${site.tagline}" → "${result.tagline}"`)
    }

    if (result.description && result.description !== site.description) {
      output.description = result.description
      changes.push(`Description updated: "${result.description.slice(0, 60)}..."`)
    }

    if (changes.length === 0) {
      changes.push('Copy already optimized — no changes needed')
    }

    return output
  } catch (e: any) {
    changes.push(`AI optimization failed: ${e.message}`)
    return { changes }
  }
}

// Trigger a redeploy for the site
async function triggerRedeploy(siteId: string, baseUrl: string, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ siteId }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const dryRun = body.dryRun === true
  const slugFilter = body.slug // optional: optimize a single site

  // Get all active (deployed) sites
  let query = supabase
    .from('website_previews')
    .select('*')
    .eq('hosting_status', 'active')

  if (slugFilter) {
    query = query.eq('slug', slugFilter)
  }

  const { data: sites, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sites', detail: error.message }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ message: 'No active sites to optimize', results: [] })
  }

  const results: OptimizationResult[] = []
  const baseUrl = req.nextUrl.origin

  for (const site of sites) {
    const result: OptimizationResult = {
      slug: site.slug,
      business_name: site.business_name,
      changes: [],
      redeployed: false,
    }

    try {
      // 1. Refresh Google data
      const freshGoogle = await refreshGoogleData(site)
      if (freshGoogle) {
        const updates: any = {}
        
        if (freshGoogle.rating !== site.google_rating) {
          updates.google_rating = freshGoogle.rating
          result.changes.push(`Rating: ${site.google_rating} → ${freshGoogle.rating}`)
        }
        if (freshGoogle.reviewCount > (site.google_review_count || 0)) {
          updates.google_review_count = freshGoogle.reviewCount
          updates.reviews = freshGoogle.reviews
          result.changes.push(`Reviews: ${site.google_review_count || 0} → ${freshGoogle.reviewCount}`)
        }
        if (freshGoogle.photos.length > (site.gallery_images?.length || 0)) {
          updates.gallery_images = freshGoogle.photos
          result.changes.push(`Photos: ${site.gallery_images?.length || 0} → ${freshGoogle.photos.length}`)
        }

        if (Object.keys(updates).length > 0 && !dryRun) {
          await supabase.from('website_previews').update(updates).eq('id', site.id)
          // Merge for copy optimization
          Object.assign(site, updates)
        }
      }

      // 2. AI copy optimization
      const copyResult = await optimizeCopy(site)
      result.changes.push(...copyResult.changes)

      if (!dryRun && (copyResult.tagline || copyResult.description)) {
        const copyUpdates: any = {}
        if (copyResult.tagline) copyUpdates.tagline = copyResult.tagline
        if (copyResult.description) copyUpdates.description = copyResult.description
        copyUpdates.last_optimized_at = new Date().toISOString()

        await supabase.from('website_previews').update(copyUpdates).eq('id', site.id)
      }

      // 3. Redeploy if changes were made
      const hasRealChanges = result.changes.some(c => !c.includes('no changes') && !c.includes('already optimized'))
      if (!dryRun && hasRealChanges) {
        result.redeployed = await triggerRedeploy(site.id, baseUrl, process.env.ADMIN_API_KEY!)
        if (result.redeployed) {
          result.changes.push('✅ Site redeployed with improvements')
        } else {
          result.changes.push('⚠️ Redeploy failed — changes saved but not live yet')
        }
      }
    } catch (e: any) {
      result.error = e.message
      result.changes.push(`Error: ${e.message}`)
    }

    results.push(result)

    // Rate limit: wait between sites
    if (sites.length > 1) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  // Log the optimization run
  const summary = {
    timestamp: new Date().toISOString(),
    dryRun,
    sitesProcessed: results.length,
    sitesChanged: results.filter(r => r.changes.some(c => c.includes('→') || c.includes('updated'))).length,
    sitesRedeployed: results.filter(r => r.redeployed).length,
  }

  if (process.env.DEBUG) {
    console.log('[optimize]', JSON.stringify(summary))
  }

  return NextResponse.json({ summary, results })
}

export async function GET() {
  return NextResponse.json(
    { error: 'Use POST with x-api-key header', usage: 'POST /api/optimize { dryRun?: boolean, slug?: string }' },
    { status: 405 }
  )
}
