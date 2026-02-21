export interface TargetCity {
  city: string
  state: string
  slug: string
  population: number
  medianIncome: number
  priority: 'high' | 'medium' | 'low'
  industries: string[]
  notes: string
}

export const TARGET_CITIES: TargetCity[] = [
  // === HIGH PRIORITY — Oil/gas towns, affluent suburbs, fast growth ===
  { city: 'Midland', state: 'TX', slug: 'midland-tx', population: 146000, medianIncome: 82000, priority: 'high', industries: ['oil & gas', 'auto repair', 'hvac', 'dental', 'restaurants'], notes: 'Oil money, huge service demand, low digital adoption' },
  { city: 'Odessa', state: 'TX', slug: 'odessa-tx', population: 127000, medianIncome: 68000, priority: 'high', industries: ['oil & gas', 'auto repair', 'restaurants', 'fitness'], notes: 'Permian Basin boom town, businesses too busy to market' },
  { city: 'McKinney', state: 'TX', slug: 'mckinney-tx', population: 210000, medianIncome: 98000, priority: 'high', industries: ['dental', 'med spa', 'fitness', 'restaurants', 'salon'], notes: 'Explosive growth, affluent families, businesses scrambling to keep up' },
  { city: 'Gilbert', state: 'AZ', slug: 'gilbert-az', population: 280000, medianIncome: 96000, priority: 'high', industries: ['dental', 'chiropractor', 'fitness', 'restaurants', 'salon'], notes: 'Wealthy Phoenix suburb, high competition but low digital sophistication' },
  { city: 'Round Rock', state: 'TX', slug: 'round-rock-tx', population: 137000, medianIncome: 88000, priority: 'high', industries: ['dental', 'fitness', 'restaurants', 'pet services', 'salon'], notes: 'Fast-growing Austin suburb but businesses are still local-minded' },
  { city: 'Murfreesboro', state: 'TN', slug: 'murfreesboro-tn', population: 165000, medianIncome: 64000, priority: 'high', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'hvac'], notes: 'Nashville spillover growth, tons of new businesses' },
  { city: 'Cape Coral', state: 'FL', slug: 'cape-coral-fl', population: 215000, medianIncome: 62000, priority: 'high', industries: ['hvac', 'plumber', 'restaurants', 'dental', 'pool service'], notes: 'Massive FL growth, retiree + young family mix, service businesses booming' },
  { city: 'Bakersfield', state: 'CA', slug: 'bakersfield-ca', population: 410000, medianIncome: 65000, priority: 'high', industries: ['oil & gas', 'agriculture', 'auto repair', 'restaurants', 'hvac'], notes: 'Oil/ag economy, not a tech hub, big city with small-town marketing' },
  { city: 'Boise', state: 'ID', slug: 'boise-id', population: 240000, medianIncome: 68000, priority: 'high', industries: ['restaurants', 'fitness', 'dental', 'veterinarian', 'outdoor recreation'], notes: 'Explosive growth from CA migration, businesses struggling with demand' },
  { city: 'Huntsville', state: 'AL', slug: 'huntsville-al', population: 220000, medianIncome: 62000, priority: 'high', industries: ['defense', 'restaurants', 'dental', 'fitness', 'auto repair'], notes: 'Fastest growing city in AL, defense money, local biz behind digitally' },
  { city: 'Sioux Falls', state: 'SD', slug: 'sioux-falls-sd', population: 200000, medianIncome: 65000, priority: 'high', industries: ['restaurants', 'dental', 'hvac', 'auto repair', 'veterinarian'], notes: 'Booming Midwest economy, low unemployment, businesses cant find marketing help' },
  { city: 'Greenville', state: 'SC', slug: 'greenville-sc', population: 74000, medianIncome: 58000, priority: 'high', industries: ['restaurants', 'dental', 'fitness', 'salon', 'auto repair'], notes: 'Revitalized downtown, manufacturing + service economy, underserved digitally' },
  { city: 'Fayetteville', state: 'AR', slug: 'fayetteville-ar', population: 100000, medianIncome: 52000, priority: 'high', industries: ['restaurants', 'fitness', 'dental', 'veterinarian', 'salon'], notes: 'Walmart HQ region wealth, university town, fast growth' },

  // === MEDIUM PRIORITY — Solid markets, good size ===
  { city: 'Lafayette', state: 'LA', slug: 'lafayette-la', population: 126000, medianIncome: 50000, priority: 'medium', industries: ['oil & gas', 'restaurants', 'auto repair', 'dental', 'hvac'], notes: 'Cajun country oil town, strong local business culture' },
  { city: 'Tuscaloosa', state: 'AL', slug: 'tuscaloosa-al', population: 105000, medianIncome: 44000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'salon'], notes: 'University town, steady economy, local businesses dominate' },
  { city: 'Baton Rouge', state: 'LA', slug: 'baton-rouge-la', population: 225000, medianIncome: 48000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'hvac', 'plumber'], notes: 'State capital, petrochemical industry, big local biz market' },
  { city: 'Lubbock', state: 'TX', slug: 'lubbock-tx', population: 265000, medianIncome: 52000, priority: 'medium', industries: ['agriculture', 'restaurants', 'dental', 'auto repair', 'hvac'], notes: 'Cotton country, university town, isolated market' },
  { city: 'Savannah', state: 'GA', slug: 'savannah-ga', population: 150000, medianIncome: 48000, priority: 'medium', industries: ['restaurants', 'tourism', 'salon', 'dental', 'fitness'], notes: 'Tourism-driven, lots of small businesses, charming but not digital' },
  { city: 'Chattanooga', state: 'TN', slug: 'chattanooga-tn', population: 185000, medianIncome: 52000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'outdoor recreation'], notes: 'Growing mid-size city, affordable, good gigabit internet but biz dont use it' },
  { city: 'Shreveport', state: 'LA', slug: 'shreveport-la', population: 185000, medianIncome: 40000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'hvac', 'plumber'], notes: 'Underserved market, low competition for marketing services' },
  { city: 'Tulsa', state: 'OK', slug: 'tulsa-ok', population: 413000, medianIncome: 50000, priority: 'medium', industries: ['oil & gas', 'restaurants', 'auto repair', 'dental', 'hvac'], notes: 'Oil capital, big market, lots of legacy businesses needing updates' },
  { city: 'Little Rock', state: 'AR', slug: 'little-rock-ar', population: 205000, medianIncome: 50000, priority: 'medium', industries: ['restaurants', 'dental', 'auto repair', 'hvac', 'fitness'], notes: 'State capital, diverse economy, businesses need digital help' },
  { city: 'Amarillo', state: 'TX', slug: 'amarillo-tx', population: 200000, medianIncome: 55000, priority: 'medium', industries: ['agriculture', 'restaurants', 'auto repair', 'dental', 'hvac'], notes: 'Panhandle hub, isolated, captive market' },
  { city: 'Waco', state: 'TX', slug: 'waco-tx', population: 145000, medianIncome: 46000, priority: 'medium', industries: ['restaurants', 'tourism', 'dental', 'auto repair', 'salon'], notes: 'Magnolia effect brought tourism, local businesses riding the wave' },
  { city: 'Mobile', state: 'AL', slug: 'mobile-al', population: 190000, medianIncome: 42000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'hvac', 'plumber'], notes: 'Port city, aerospace growth, underserved digitally' },
  { city: 'Spokane', state: 'WA', slug: 'spokane-wa', population: 230000, medianIncome: 52000, priority: 'medium', industries: ['restaurants', 'dental', 'auto repair', 'fitness', 'veterinarian'], notes: 'Eastern WA, not Seattle culture, practical businesses' },
  { city: 'Fort Wayne', state: 'IN', slug: 'fort-wayne-in', population: 265000, medianIncome: 50000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'hvac', 'plumber'], notes: 'Manufacturing town going through renaissance, affordable' },
  { city: 'Lexington', state: 'KY', slug: 'lexington-ky', population: 325000, medianIncome: 58000, priority: 'medium', industries: ['restaurants', 'dental', 'veterinarian', 'fitness', 'salon'], notes: 'Horse country wealth, university town, solid local economy' },
  { city: 'Knoxville', state: 'TN', slug: 'knoxville-tn', population: 195000, medianIncome: 48000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'hvac'], notes: 'University town, gateway to Smokies, growing steadily' },
  { city: 'Columbia', state: 'SC', slug: 'columbia-sc', population: 137000, medianIncome: 48000, priority: 'medium', industries: ['restaurants', 'dental', 'auto repair', 'fitness', 'salon'], notes: 'State capital, university, military base — steady demand' },

  // === MORE MEDIUM — Good fits ===
  { city: 'Pensacola', state: 'FL', slug: 'pensacola-fl', population: 55000, medianIncome: 52000, priority: 'medium', industries: ['restaurants', 'tourism', 'hvac', 'plumber', 'dental'], notes: 'Military town + beach tourism, lots of service businesses' },
  { city: 'Tyler', state: 'TX', slug: 'tyler-tx', population: 108000, medianIncome: 50000, priority: 'medium', industries: ['healthcare', 'restaurants', 'dental', 'auto repair', 'salon'], notes: 'East TX hub, medical center, oil money spillover' },
  { city: 'Clarksville', state: 'TN', slug: 'clarksville-tn', population: 170000, medianIncome: 55000, priority: 'medium', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'hvac'], notes: 'Fort Campbell military, young families, explosive growth' },
  { city: 'Beaumont', state: 'TX', slug: 'beaumont-tx', population: 115000, medianIncome: 46000, priority: 'medium', industries: ['oil & gas', 'restaurants', 'auto repair', 'hvac', 'plumber'], notes: 'Refinery town, solid blue-collar income, low digital adoption' },
  { city: 'Broken Arrow', state: 'OK', slug: 'broken-arrow-ok', population: 115000, medianIncome: 72000, priority: 'medium', industries: ['dental', 'restaurants', 'fitness', 'salon', 'veterinarian'], notes: 'Affluent Tulsa suburb, family-oriented, growing fast' },
  { city: 'Meridian', state: 'ID', slug: 'meridian-id', population: 130000, medianIncome: 78000, priority: 'medium', industries: ['dental', 'restaurants', 'fitness', 'veterinarian', 'salon'], notes: 'Boise suburb, one of fastest growing cities in US' },
  { city: 'Frisco', state: 'TX', slug: 'frisco-tx', population: 225000, medianIncome: 130000, priority: 'high', industries: ['dental', 'med spa', 'fitness', 'restaurants', 'salon'], notes: 'Extremely affluent DFW suburb, massive growth, businesses spending' },
  { city: 'Sugar Land', state: 'TX', slug: 'sugar-land-tx', population: 115000, medianIncome: 115000, priority: 'high', industries: ['dental', 'med spa', 'restaurants', 'fitness', 'salon'], notes: 'Wealthy Houston suburb, diverse, high spending power' },
  { city: 'Pearland', state: 'TX', slug: 'pearland-tx', population: 130000, medianIncome: 100000, priority: 'high', industries: ['dental', 'restaurants', 'fitness', 'salon', 'pet services'], notes: 'Houston suburb, Brians backyard, knows the market' },
  { city: 'League City', state: 'TX', slug: 'league-city-tx', population: 115000, medianIncome: 105000, priority: 'high', industries: ['dental', 'restaurants', 'fitness', 'salon', 'veterinarian'], notes: 'Brians home turf, affluent NASA corridor families' },
  { city: 'Flower Mound', state: 'TX', slug: 'flower-mound-tx', population: 80000, medianIncome: 135000, priority: 'medium', industries: ['dental', 'med spa', 'fitness', 'restaurants', 'salon'], notes: 'Ultra-affluent DFW suburb, families with money' },
  { city: 'Conway', state: 'AR', slug: 'conway-ar', population: 68000, medianIncome: 50000, priority: 'low', industries: ['restaurants', 'dental', 'auto repair', 'fitness', 'salon'], notes: 'College town near Little Rock, affordable, growing' },
  { city: 'Owensboro', state: 'KY', slug: 'owensboro-ky', population: 61000, medianIncome: 48000, priority: 'low', industries: ['restaurants', 'auto repair', 'dental', 'hvac', 'plumber'], notes: 'Small but isolated market, zero digital marketing competition' },
  { city: 'Lake Charles', state: 'LA', slug: 'lake-charles-la', population: 85000, medianIncome: 48000, priority: 'medium', industries: ['oil & gas', 'restaurants', 'auto repair', 'hvac', 'dental'], notes: 'LNG boom town, lots of money flowing in, businesses cant keep up' },
  { city: 'Panama City', state: 'FL', slug: 'panama-city-fl', population: 37000, medianIncome: 48000, priority: 'low', industries: ['restaurants', 'tourism', 'hvac', 'plumber', 'auto repair'], notes: 'Beach town + military, seasonal businesses need year-round marketing' },
  { city: 'Dothan', state: 'AL', slug: 'dothan-al', population: 72000, medianIncome: 44000, priority: 'low', industries: ['restaurants', 'dental', 'auto repair', 'hvac', 'veterinarian'], notes: 'Tri-state hub (AL/GA/FL), isolated, captive market' },
  { city: 'Temple', state: 'TX', slug: 'temple-tx', population: 85000, medianIncome: 55000, priority: 'low', industries: ['healthcare', 'restaurants', 'dental', 'auto repair', 'fitness'], notes: 'VA hospital town, steady economy, growing' },
  { city: 'Lufkin', state: 'TX', slug: 'lufkin-tx', population: 36000, medianIncome: 42000, priority: 'low', industries: ['forestry', 'restaurants', 'auto repair', 'dental', 'hvac'], notes: 'Deep East TX, timber industry, totally underserved' },
  { city: 'Jonesboro', state: 'AR', slug: 'jonesboro-ar', population: 80000, medianIncome: 46000, priority: 'low', industries: ['restaurants', 'dental', 'auto repair', 'fitness', 'hvac'], notes: 'NE Arkansas hub, university town, isolated market' },
  { city: 'Elizabethtown', state: 'KY', slug: 'elizabethtown-ky', population: 33000, medianIncome: 48000, priority: 'low', industries: ['restaurants', 'auto repair', 'dental', 'fitness', 'hvac'], notes: 'Fort Knox area, military families, growing' },
]

export const DEFAULT_CATEGORIES = [
  'dentist', 'restaurant', 'salon', 'fitness', 'pet services',
  'auto repair', 'hvac', 'plumber', 'chiropractor', 'veterinarian'
]

export function getCitiesByPriority(priority: TargetCity['priority']): TargetCity[] {
  return TARGET_CITIES.filter(c => c.priority === priority)
}

export function getCityBySlug(slug: string): TargetCity | undefined {
  return TARGET_CITIES.find(c => c.slug === slug)
}
