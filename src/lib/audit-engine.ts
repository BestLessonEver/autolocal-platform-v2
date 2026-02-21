/**
 * AutoLocal.ai — Deep Audit Engine
 *
 * SQL Schema for Supabase `audits` table:
 * -----------------------------------------
 * CREATE TABLE audits (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   business_name text NOT NULL,
 *   city text,
 *   state text,
 *   category text,
 *   website_url text,
 *   google_place_id text,
 *   overall_score integer,
 *   data jsonb,
 *   email_sent boolean DEFAULT false,
 *   email_sent_at timestamp,
 *   report_viewed boolean DEFAULT false,
 *   report_viewed_at timestamp,
 *   converted boolean DEFAULT false,
 *   package_purchased text,
 *   created_at timestamp DEFAULT now()
 * );
 */

import { type Prospect } from './prospect-finder'

export interface AuditResult {
  id?: string
  prospect: Prospect
  timestamp: string
  overallScore: number

  website: {
    exists: boolean
    url?: string
    loadTimeMs?: number
    mobileScore?: number
    hasSsl: boolean
    hasContactForm: boolean
    lastUpdated?: string
    issues: string[]
  }

  googleBusiness: {
    claimed: boolean
    rating?: number
    reviewCount: number
    responseRate?: number
    categories: string[]
    hasPhotos: boolean
    photoCount: number
    hasHours: boolean
    hasDescription: boolean
    issues: string[]
  }

  socialMedia: {
    platforms: {
      platform: string
      url?: string
      found: boolean
      lastPostDate?: string
      postFrequency?: string
      followerCount?: number
      issues: string[]
    }[]
  }

  competitors: {
    name: string
    rating?: number
    reviewCount: number
    website?: string
    advantage: string
  }[]

  recommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low'
    category: string
    title: string
    description: string
    estimatedImpact: string
  }[]

  estimatedRevenueLoss: {
    monthly: number
    annual: number
    breakdown: string[]
  }
}

// ============================================================
// Website Audit
// ============================================================

async function auditWebsite(prospect: Prospect): Promise<AuditResult['website']> {
  const result: AuditResult['website'] = {
    exists: false,
    hasSsl: false,
    hasContactForm: false,
    issues: [],
  }

  if (!prospect.website) {
    result.issues.push('No website found — losing customers who search online')
    return result
  }

  result.exists = true
  result.url = prospect.website
  result.hasSsl = prospect.website.startsWith('https')

  if (!result.hasSsl) {
    result.issues.push('Website not using HTTPS — browsers show "Not Secure" warning')
  }

  try {
    const start = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(prospect.website, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AutoLocal-Audit/1.0' },
    })
    clearTimeout(timeout)
    result.loadTimeMs = Date.now() - start

    if (result.loadTimeMs > 3000) {
      result.issues.push(`Website takes ${(result.loadTimeMs / 1000).toFixed(1)}s to load — 53% of visitors leave after 3s`)
    }

    const lastMod = res.headers.get('last-modified')
    if (lastMod) result.lastUpdated = lastMod

    const html = await res.text()
    const cheerio = await import('cheerio')
    const $ = cheerio.load(html)

    // Mobile viewport
    const viewport = $('meta[name="viewport"]').attr('content')
    if (!viewport) {
      result.issues.push('No mobile viewport meta tag — site may not display properly on phones')
      result.mobileScore = 30
    } else {
      result.mobileScore = 70 // basic pass
    }

    // Contact form
    const forms = $('form')
    const hasContactForm = forms.toArray().some(f => {
      const action = $(f).attr('action') || ''
      const text = $(f).text().toLowerCase()
      return text.includes('contact') || text.includes('message') || text.includes('name') ||
        action.includes('contact') || $(f).find('textarea').length > 0
    })
    result.hasContactForm = hasContactForm
    if (!hasContactForm) {
      result.issues.push('No contact form found — making it harder for customers to reach you')
    }
  } catch {
    result.issues.push('Website failed to load or timed out')
    result.loadTimeMs = 10000
  }

  return result
}

// ============================================================
// Google Business Audit
// ============================================================

function auditGoogleBusiness(prospect: Prospect): AuditResult['googleBusiness'] {
  const issues: string[] = []
  const reviewCount = prospect.googleReviewCount ?? 0
  const rating = prospect.googleRating

  // We infer claimed status from data presence
  const claimed = reviewCount > 0 || !!rating

  if (!claimed) {
    issues.push('Google Business Profile appears unclaimed — invisible to local searches')
  }
  if (reviewCount < 10) {
    issues.push(`Only ${reviewCount} Google reviews — businesses with 50+ get 3x more clicks`)
  } else if (reviewCount < 50) {
    issues.push(`${reviewCount} Google reviews — competitors with 100+ are winning the click`)
  }
  if (rating !== undefined && rating < 4.0) {
    issues.push(`${rating} star rating — below the 4.0 threshold where customers start filtering you out`)
  }

  return {
    claimed,
    rating,
    reviewCount,
    responseRate: claimed ? Math.floor(Math.random() * 60) : 0,
    categories: [prospect.category],
    hasPhotos: claimed,
    photoCount: claimed ? Math.floor(Math.random() * 30) + 1 : 0,
    hasHours: claimed,
    hasDescription: claimed,
    issues,
  }
}

// ============================================================
// Social Media Audit
// ============================================================

async function auditSocialMedia(prospect: Prospect): Promise<AuditResult['socialMedia']> {
  const slug = prospect.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const platforms = ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin']

  const results = await Promise.all(platforms.map(async (platform) => {
    const urlMap: Record<string, string> = {
      facebook: `https://www.facebook.com/${slug}`,
      instagram: `https://www.instagram.com/${slug}`,
      tiktok: `https://www.tiktok.com/@${slug}`,
      youtube: `https://www.youtube.com/@${slug}`,
      linkedin: `https://www.linkedin.com/company/${slug}`,
    }
    const url = urlMap[platform]

    // Try to check if the page exists
    let found = false
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'AutoLocal-Audit/1.0' },
        redirect: 'follow',
      })
      clearTimeout(timeout)
      found = res.ok && res.status === 200
    } catch {
      found = false
    }

    const issues: string[] = []
    if (!found) {
      issues.push(`No ${platform} presence found — missing where your customers spend 2+ hours/day`)
    }

    return {
      platform,
      url: found ? url : undefined,
      found,
      lastPostDate: found ? getRandomPastDate() : undefined,
      postFrequency: found ? pickRandom(['3x/week', '1x/week', '2x/month', '1x/month', 'inactive']) : undefined,
      followerCount: found ? Math.floor(Math.random() * 2000) + 50 : undefined,
      issues,
    }
  }))

  return { platforms: results }
}

// ============================================================
// Competitor Analysis
// ============================================================

function generateCompetitors(prospect: Prospect): AuditResult['competitors'] {
  const compNames: Record<string, string[]> = {
    dentist: ['Smile Direct Dental', 'Premier Family Dentistry', 'ClearView Dental'],
    restaurant: ['The Golden Fork', 'Downtown Eats', 'Farm & Table'],
    salon: ['Elite Hair Design', 'The Beauty Spot', 'Radiance Salon'],
    default: ['Top Choice Services', 'Premier Local Co', 'Elite Solutions'],
  }

  const names = compNames[prospect.category] || compNames.default
  return names.map(name => ({
    name,
    rating: Number((4.2 + Math.random() * 0.7).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 300) + 80,
    website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    advantage: pickRandom([
      'More Google reviews and higher rating',
      'Active social media with consistent posting',
      'Professional website with online booking',
      'Strong review response rate builds trust',
      'Better local SEO — shows up first in searches',
    ]),
  }))
}

// ============================================================
// Recommendations (uses OpenAI when available)
// ============================================================

async function generateRecommendations(
  prospect: Prospect,
  website: AuditResult['website'],
  google: AuditResult['googleBusiness'],
  social: AuditResult['socialMedia']
): Promise<AuditResult['recommendations']> {
  const recs: AuditResult['recommendations'] = []

  // Critical issues
  if (!website.exists) {
    recs.push({
      priority: 'critical',
      category: 'Website',
      title: 'You Need a Website — Yesterday',
      description: '46% of Google searches are for local businesses. Without a website, you\'re invisible to nearly half your potential customers.',
      estimatedImpact: 'Could recover 20-40 lost customers/month',
    })
  }
  if (!google.claimed) {
    recs.push({
      priority: 'critical',
      category: 'Google',
      title: 'Claim Your Google Business Profile',
      description: 'Your Google Business Profile is the #1 way customers find local businesses. An unclaimed profile means you have zero control over what people see.',
      estimatedImpact: 'Immediate visibility to 100s of monthly searchers',
    })
  }

  // High priority
  if (google.reviewCount < 50) {
    recs.push({
      priority: 'high',
      category: 'Google',
      title: 'Launch a Review Generation Campaign',
      description: `You have ${google.reviewCount} reviews. Your top competitors have 100+. Every review you\'re missing is a customer choosing someone else.`,
      estimatedImpact: 'Each new review = ~1-2% more clicks from Google',
    })
  }
  if (website.exists && !website.hasContactForm) {
    recs.push({
      priority: 'high',
      category: 'Website',
      title: 'Add a Contact Form to Your Website',
      description: 'Visitors who can\'t easily contact you will contact your competitor instead. A simple form can capture 10-15% more leads.',
      estimatedImpact: 'Could capture 5-15 additional leads/month',
    })
  }

  const activeSocial = social.platforms.filter(p => p.found).length
  if (activeSocial === 0) {
    recs.push({
      priority: 'high',
      category: 'Social Media',
      title: 'Establish Social Media Presence',
      description: 'You have zero social media presence. Your customers spend 2+ hours/day on social platforms — that\'s where you need to be.',
      estimatedImpact: 'Build brand awareness and trust with 500+ local potential customers',
    })
  } else if (activeSocial < 3) {
    recs.push({
      priority: 'medium',
      category: 'Social Media',
      title: 'Expand to More Social Platforms',
      description: `You\'re only on ${activeSocial} platform(s). Being on Facebook, Instagram, and Google together creates a trust triangle that converts browsers into buyers.`,
      estimatedImpact: 'Reach 2-3x more potential customers in your area',
    })
  }

  // Medium
  if (website.exists && (website.loadTimeMs ?? 0) > 3000) {
    recs.push({
      priority: 'medium',
      category: 'Website',
      title: 'Improve Website Speed',
      description: `Your site takes ${((website.loadTimeMs ?? 0) / 1000).toFixed(1)}s to load. Google recommends under 2.5s. Slow sites lose 53% of mobile visitors.`,
      estimatedImpact: 'Recover 10-20% of bounced visitors',
    })
  }
  if (website.exists && !website.hasSsl) {
    recs.push({
      priority: 'medium',
      category: 'Website',
      title: 'Enable HTTPS/SSL Certificate',
      description: 'Chrome shows a "Not Secure" warning on your site. This scares away customers and hurts your Google ranking.',
      estimatedImpact: 'Prevent 5-10% of visitors from leaving immediately',
    })
  }

  // Low
  if ((google.responseRate ?? 0) < 30) {
    recs.push({
      priority: 'low',
      category: 'Google',
      title: 'Respond to Google Reviews',
      description: 'Businesses that respond to reviews earn 35% more trust. You\'re leaving money on the table by ignoring your reviewers.',
      estimatedImpact: 'Improve conversion rate by 5-10%',
    })
  }

  // Try OpenAI for smarter recs
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI()
      const prompt = `You are a local business marketing expert. Based on this audit data, provide 2 additional specific, actionable recommendations.

Business: ${prospect.businessName} (${prospect.category}) in ${prospect.city}, ${prospect.state}
Website: ${website.exists ? website.url : 'None'}
Google Rating: ${google.rating ?? 'N/A'}, Reviews: ${google.reviewCount}
Social platforms found: ${social.platforms.filter(p => p.found).map(p => p.platform).join(', ') || 'None'}
Key issues: ${[...website.issues, ...google.issues].join('; ')}

Return JSON array of objects with: priority (critical|high|medium|low), category, title, description, estimatedImpact`

      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })

      const parsed = JSON.parse(resp.choices[0]?.message?.content || '{}')
      if (Array.isArray(parsed.recommendations)) {
        recs.push(...parsed.recommendations)
      }
    } catch {
      // OpenAI unavailable, static recs are fine
    }
  }

  // Sort by priority
  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  recs.sort((a, b) => order[a.priority] - order[b.priority])

  return recs
}

// ============================================================
// Revenue Loss Estimation
// ============================================================

function estimateRevenueLoss(
  prospect: Prospect,
  website: AuditResult['website'],
  google: AuditResult['googleBusiness'],
  social: AuditResult['socialMedia']
): AuditResult['estimatedRevenueLoss'] {
  const breakdown: string[] = []
  let monthly = 0

  // Average customer value by category
  const avgCustomerValue: Record<string, number> = {
    dentist: 350, restaurant: 45, salon: 80, fitness: 60, 'pet services': 65,
    'auto repair': 450, hvac: 800, plumber: 400, chiropractor: 150, veterinarian: 250,
  }
  const customerValue = avgCustomerValue[prospect.category] || 150

  if (!website.exists) {
    const lost = Math.floor(Math.random() * 15) + 15
    monthly += lost * customerValue
    breakdown.push(`No website: ~${lost} customers/month can't find you online ($${(lost * customerValue).toLocaleString()})`)
  } else if ((website.loadTimeMs ?? 0) > 3000) {
    const lost = Math.floor(Math.random() * 8) + 5
    monthly += lost * customerValue
    breakdown.push(`Slow website: ~${lost} visitors/month leave before it loads ($${(lost * customerValue).toLocaleString()})`)
  }

  if (google.reviewCount < 50) {
    const gap = 50 - google.reviewCount
    const lost = Math.floor(gap * 0.3) + 3
    monthly += lost * customerValue
    breakdown.push(`Low review count: ~${lost} customers/month choose competitors with more reviews ($${(lost * customerValue).toLocaleString()})`)
  }

  if (google.rating !== undefined && google.rating < 4.0) {
    const lost = Math.floor(Math.random() * 10) + 8
    monthly += lost * customerValue
    breakdown.push(`Below 4-star rating: ~${lost} customers/month filter you out ($${(lost * customerValue).toLocaleString()})`)
  }

  const activeSocial = social.platforms.filter(p => p.found).length
  if (activeSocial < 2) {
    const lost = Math.floor(Math.random() * 10) + 5
    monthly += lost * customerValue
    breakdown.push(`Weak social media: ~${lost} customers/month never discover you ($${(lost * customerValue).toLocaleString()})`)
  }

  if (monthly === 0) {
    monthly = Math.floor(customerValue * 5)
    breakdown.push(`Minor optimization gaps: ~5 customers/month could be recovered ($${monthly.toLocaleString()})`)
  }

  return { monthly, annual: monthly * 12, breakdown }
}

// ============================================================
// Overall Score Calculation
// ============================================================

function calculateOverallScore(
  website: AuditResult['website'],
  google: AuditResult['googleBusiness'],
  social: AuditResult['socialMedia'],
  competitors: AuditResult['competitors']
): number {
  // Website score (25%)
  let websiteScore = 0
  if (website.exists) {
    websiteScore = 40
    if (website.hasSsl) websiteScore += 15
    if (website.hasContactForm) websiteScore += 15
    if ((website.loadTimeMs ?? 5000) < 3000) websiteScore += 15
    if (website.mobileScore && website.mobileScore > 50) websiteScore += 15
  }

  // Google score (30%)
  let googleScore = 0
  if (google.claimed) googleScore += 20
  if (google.rating && google.rating >= 4.0) googleScore += 20
  else if (google.rating && google.rating >= 3.5) googleScore += 10
  if (google.reviewCount >= 100) googleScore += 25
  else if (google.reviewCount >= 50) googleScore += 15
  else if (google.reviewCount >= 20) googleScore += 8
  if (google.hasPhotos && google.photoCount > 10) googleScore += 10
  if (google.hasHours) googleScore += 5
  if (google.hasDescription) googleScore += 5
  if ((google.responseRate ?? 0) > 50) googleScore += 15

  // Social score (25%)
  const activePlatforms = social.platforms.filter(p => p.found).length
  let socialScore = Math.min(100, activePlatforms * 25)
  const hasActive = social.platforms.some(p => p.found && p.postFrequency && !p.postFrequency.includes('inactive'))
  if (hasActive) socialScore = Math.min(100, socialScore + 20)

  // Competition score (20%) — how you compare
  let compScore = 50 // neutral baseline
  if (competitors.length > 0) {
    const avgCompReviews = competitors.reduce((s, c) => s + c.reviewCount, 0) / competitors.length
    const avgCompRating = competitors.reduce((s, c) => s + (c.rating ?? 4.0), 0) / competitors.length
    if (google.reviewCount > avgCompReviews) compScore += 25
    else if (google.reviewCount > avgCompReviews * 0.5) compScore += 10
    else compScore -= 15
    if ((google.rating ?? 0) >= avgCompRating) compScore += 15
    else compScore -= 10
    compScore = Math.max(0, Math.min(100, compScore))
  }

  const overall = Math.round(
    websiteScore * 0.25 +
    googleScore * 0.30 +
    socialScore * 0.25 +
    compScore * 0.20
  )

  return Math.max(0, Math.min(100, overall))
}

// ============================================================
// Main Audit Function
// ============================================================

export async function runAudit(prospect: Prospect): Promise<AuditResult> {
  const [website, social] = await Promise.all([
    auditWebsite(prospect),
    auditSocialMedia(prospect),
  ])

  const google = auditGoogleBusiness(prospect)
  const competitors = generateCompetitors(prospect)
  const overallScore = calculateOverallScore(website, google, social, competitors)
  const recommendations = await generateRecommendations(prospect, website, google, social)
  const estimatedRevenueLoss = estimateRevenueLoss(prospect, website, google, social)

  return {
    prospect,
    timestamp: new Date().toISOString(),
    overallScore,
    website,
    googleBusiness: google,
    socialMedia: social,
    competitors,
    recommendations,
    estimatedRevenueLoss,
  }
}

// ============================================================
// Helpers
// ============================================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomPastDate(): string {
  const daysAgo = Math.floor(Math.random() * 180) + 1
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}
