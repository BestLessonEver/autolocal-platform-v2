/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || ''

export async function POST(req: Request) {
  try {
    const { businessName, city, state } = await req.json()

    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 })
    }

    const searchCity = city || ''
    const searchState = state || ''
    const query = [businessName, searchCity, searchState].filter(Boolean).join(' ')

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
    })

    const data = await res.json()
    const places = (data?.places || []).map((p: any) => ({
      placeId: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      rating: p.rating || null,
      reviewCount: p.userRatingCount || 0,
      photoRef: p.photos?.[0]?.name || null,
    }))

    return NextResponse.json({ results: places })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
