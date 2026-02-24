import OpenAI from 'openai'

export interface WebsiteMockup {
  businessName: string
  industry: string
  heroHeadline: string
  heroSubtext: string
  services: string[]
  brandColors: { primary: string; secondary: string; accent: string }
  ctaText: string
  testimonialPlaceholder: string
  aboutText: string
  phone?: string
  address?: string
}

const INDUSTRY_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  dental: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1e40af' },
  dentist: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1e40af' },
  restaurant: { primary: '#dc2626', secondary: '#fef2f2', accent: '#b91c1c' },
  salon: { primary: '#7c3aed', secondary: '#ede9fe', accent: '#6d28d9' },
  fitness: { primary: '#059669', secondary: '#d1fae5', accent: '#047857' },
  gym: { primary: '#059669', secondary: '#d1fae5', accent: '#047857' },
  veterinarian: { primary: '#0891b2', secondary: '#cffafe', accent: '#0e7490' },
  pet: { primary: '#0891b2', secondary: '#cffafe', accent: '#0e7490' },
  auto: { primary: '#d97706', secondary: '#fef3c7', accent: '#b45309' },
  hvac: { primary: '#0284c7', secondary: '#e0f2fe', accent: '#0369a1' },
  plumber: { primary: '#0284c7', secondary: '#e0f2fe', accent: '#0369a1' },
  chiropractor: { primary: '#16a34a', secondary: '#dcfce7', accent: '#15803d' },
  default: { primary: '#2563eb', secondary: '#eff6ff', accent: '#1d4ed8' },
}

function getColorsForIndustry(industry: string): { primary: string; secondary: string; accent: string } {
  const key = Object.keys(INDUSTRY_COLORS).find(k => industry.toLowerCase().includes(k))
  return INDUSTRY_COLORS[key || 'default']
}

export async function generateMockup(params: {
  businessName: string
  industry: string
  website?: string
  services?: string[]
  location?: string
  phone?: string
  address?: string
}): Promise<WebsiteMockup> {
  const colors = getColorsForIndustry(params.industry)

  if (!process.env.OPENAI_API_KEY) {
    return {
      businessName: params.businessName,
      industry: params.industry,
      heroHeadline: `Welcome to ${params.businessName}`,
      heroSubtext: `Your trusted ${params.industry} in ${params.location || 'your area'}. Quality service, guaranteed satisfaction.`,
      services: params.services || ['Service 1', 'Service 2', 'Service 3'],
      brandColors: colors,
      ctaText: 'Schedule Now',
      testimonialPlaceholder: `"${params.businessName} is amazing! They truly care about their customers and deliver exceptional results every time." — A Happy Customer`,
      aboutText: `${params.businessName} has been proudly serving ${params.location || 'the community'} with dedication and expertise. Our team is committed to delivering the highest quality ${params.industry} services.`,
      phone: params.phone,
      address: params.address,
    }
  }

  try {
    const openai = new OpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a website copywriter. Generate compelling website copy for a local business. Return JSON only.',
        },
        {
          role: 'user',
          content: `Generate website copy for:
Business: ${params.businessName}
Industry: ${params.industry}
Location: ${params.location || 'N/A'}
Services: ${params.services?.join(', ') || 'N/A'}

Return JSON with:
- heroHeadline: compelling headline (max 10 words, no quotes)
- heroSubtext: subtitle (1-2 sentences)
- services: array of 6 service names they likely offer
- ctaText: call-to-action button text (3-4 words)
- testimonialPlaceholder: a realistic-sounding testimonial with a first name
- aboutText: 2-3 sentence about section`,
        },
      ],
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')

    return {
      businessName: params.businessName,
      industry: params.industry,
      heroHeadline: data.heroHeadline || `Welcome to ${params.businessName}`,
      heroSubtext: data.heroSubtext || `Trusted ${params.industry} services in ${params.location || 'your area'}.`,
      services: data.services || params.services || ['Service 1', 'Service 2', 'Service 3'],
      brandColors: colors,
      ctaText: data.ctaText || 'Get Started',
      testimonialPlaceholder: data.testimonialPlaceholder || `"Great experience with ${params.businessName}!" — Happy Customer`,
      aboutText: data.aboutText || `${params.businessName} proudly serves ${params.location || 'the community'}.`,
      phone: params.phone,
      address: params.address,
    }
  } catch (e) {
    console.error('Mockup generation error:', e)
    return {
      businessName: params.businessName,
      industry: params.industry,
      heroHeadline: `Welcome to ${params.businessName}`,
      heroSubtext: `Trusted ${params.industry} services in ${params.location || 'your area'}.`,
      services: params.services || ['Service 1', 'Service 2', 'Service 3'],
      brandColors: colors,
      ctaText: 'Schedule Now',
      testimonialPlaceholder: `"${params.businessName} exceeded my expectations!" — Sarah M.`,
      aboutText: `${params.businessName} has been serving ${params.location || 'the community'} with excellence.`,
      phone: params.phone,
      address: params.address,
    }
  }
}
