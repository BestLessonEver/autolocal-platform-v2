import { DEFAULT_CATEGORIES } from '@/data/target-cities'

export interface Prospect {
  id: string
  businessName: string
  category: string
  address: string
  city: string
  state: string
  phone?: string
  website?: string
  googleMapsUrl?: string
  googleRating?: number
  googleReviewCount?: number
  placeId?: string
  needsHelpScore?: number // 0-100, higher = more likely to need help
}

interface FindProspectsParams {
  city: string
  state: string
  categories?: string[]
  limit?: number
}

/**
 * Score a prospect on how much they likely need marketing help.
 * Higher score = more likely to convert.
 */
function scoreProspectNeed(p: Prospect): number {
  let score = 50 // baseline
  if (!p.website) score += 25
  if (p.googleReviewCount !== undefined && p.googleReviewCount < 10) score += 15
  else if (p.googleReviewCount !== undefined && p.googleReviewCount < 50) score += 8
  if (p.googleRating !== undefined && p.googleRating < 4.0) score += 10
  if (p.googleRating !== undefined && p.googleRating >= 4.5 && (p.googleReviewCount ?? 0) > 100) score -= 20
  return Math.max(0, Math.min(100, score))
}

/**
 * Find business prospects in a target city.
 * Uses Google Places API when available, falls back to mock data.
 */
export async function findProspects(params: FindProspectsParams): Promise<Prospect[]> {
  const { city, state, categories = DEFAULT_CATEGORIES, limit = 20 } = params
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  let prospects: Prospect[]

  if (apiKey) {
    prospects = await findWithGooglePlaces({ city, state, categories, limit }, apiKey)
  } else {
    prospects = generateMockProspects({ city, state, categories, limit })
  }

  // Score and sort by need
  prospects = prospects.map(p => ({ ...p, needsHelpScore: scoreProspectNeed(p) }))
  prospects.sort((a, b) => (b.needsHelpScore ?? 0) - (a.needsHelpScore ?? 0))

  return prospects.slice(0, limit)
}

async function findWithGooglePlaces(
  params: FindProspectsParams,
  apiKey: string
): Promise<Prospect[]> {
  const { city, state, categories = DEFAULT_CATEGORIES, limit = 20 } = params
  const allProspects: Prospect[] = []

  for (const category of categories) {
    if (allProspects.length >= limit) break

    const query = `${category} in ${city}, ${state}`
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`

    try {
      const res = await fetch(url)
      const data = await res.json()

      if (data.results) {
        for (const place of data.results) {
          if (allProspects.length >= limit) break
          allProspects.push({
            id: place.place_id || crypto.randomUUID(),
            businessName: place.name,
            category,
            address: place.formatted_address || '',
            city,
            state,
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            googleRating: place.rating,
            googleReviewCount: place.user_ratings_total,
            placeId: place.place_id,
          })
        }
      }
    } catch (err) {
      console.error(`Failed to fetch places for "${query}":`, err)
    }
  }

  return allProspects
}

function generateMockProspects(params: FindProspectsParams): Prospect[] {
  const { city, state, categories = DEFAULT_CATEGORIES, limit = 20 } = params
  const mockNames: Record<string, string[]> = {
    dentist: ['Bright Smile Dental', 'Family Dental Care', 'Downtown Dentistry', 'Gentle Touch Dental'],
    restaurant: ['The Local Kitchen', 'Main Street Grill', 'Mama\'s Home Cooking', 'The Rustic Table'],
    salon: ['Glamour Hair Studio', 'The Style Bar', 'Luxe Beauty Salon', 'Fresh Cuts & Color'],
    fitness: ['Iron Works Gym', 'FitLife Studio', 'CrossFit Downtown', 'Pure Strength Fitness'],
    'pet services': ['Happy Paws Pet Spa', 'Bark & Bath', 'Paws & Claws Grooming', 'The Dog House'],
    'auto repair': ['Precision Auto Care', 'Mike\'s Auto Shop', 'AllStar Automotive', 'Quick Fix Garage'],
    hvac: ['Cool Comfort HVAC', 'AirPro Heating & Cooling', 'Climate Masters', 'Reliable Air Services'],
    plumber: ['FlowRight Plumbing', 'Ace Plumbing Co', 'Drip Stop Plumbing', 'Pipeline Pros'],
    chiropractor: ['Align Chiropractic', 'Back to Health Chiro', 'Spine & Wellness Center', 'Peak Performance Chiro'],
    veterinarian: ['Caring Paws Vet Clinic', 'Valley Animal Hospital', 'Hometown Veterinary', 'Four Legs Vet Care'],
  }

  const prospects: Prospect[] = []

  for (const category of categories) {
    if (prospects.length >= limit) break
    const names = mockNames[category] || [`${category} Business 1`, `${category} Business 2`]

    for (const name of names) {
      if (prospects.length >= limit) break
      const hasWebsite = Math.random() > 0.4
      const reviewCount = Math.floor(Math.random() * 200)
      const rating = Number((3.0 + Math.random() * 2).toFixed(1))

      prospects.push({
        id: crypto.randomUUID(),
        businessName: name,
        category,
        address: `${Math.floor(Math.random() * 9000) + 100} Main St, ${city}, ${state}`,
        city,
        state,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        website: hasWebsite ? `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
        googleMapsUrl: `https://www.google.com/maps/place/${encodeURIComponent(name + ' ' + city)}`,
        googleRating: rating,
        googleReviewCount: reviewCount,
        placeId: `mock_${crypto.randomUUID().slice(0, 8)}`,
      })
    }
  }

  return prospects
}
