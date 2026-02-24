import { createClient } from '@supabase/supabase-js'
import { type AuditResult } from './audit-engine'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORY_DEFAULTS: Record<string, {
  colors: { primary: string; secondary: string; accent: string }
  cta_text: string
  tagline: string
  template: string
  hero_image: string
}> = {
  salon: {
    colors: { primary: '#BE185D', secondary: '#9D174D', accent: '#D97706' },
    cta_text: 'Book Your Appointment',
    tagline: 'Where beauty meets expertise',
    template: 'salon-spa',
    hero_image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  },
  dental: {
    colors: { primary: '#1D4ED8', secondary: '#1E40AF', accent: '#0EA5E9' },
    cta_text: 'Schedule Your Visit',
    tagline: 'Your smile is our priority',
    template: 'professional',
    hero_image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop',
  },
  restaurant: {
    colors: { primary: '#991B1B', secondary: '#7F1D1D', accent: '#D97706' },
    cta_text: 'Make a Reservation',
    tagline: 'A dining experience like no other',
    template: 'modern-clean',
    hero_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  },
  fitness: {
    colors: { primary: '#EA580C', secondary: '#C2410C', accent: '#000000' },
    cta_text: 'Start Your Free Trial',
    tagline: 'Transform your body, transform your life',
    template: 'modern-clean',
    hero_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  },
  contractor: {
    colors: { primary: '#92400E', secondary: '#78350F', accent: '#059669' },
    cta_text: 'Get a Free Estimate',
    tagline: 'Quality craftsmanship you can trust',
    template: 'professional',
    hero_image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  },
  general: {
    colors: { primary: '#2563EB', secondary: '#1E40AF', accent: '#F59E0B' },
    cta_text: 'Contact Us',
    tagline: 'Professional service you can count on',
    template: 'modern-clean',
    hero_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
  },
}

// Map audit categories to our preview categories
function mapCategory(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('salon') || lower.includes('spa') || lower.includes('hair') || lower.includes('beauty')) return 'salon'
  if (lower.includes('dent')) return 'dental'
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe') || lower.includes('bar')) return 'restaurant'
  if (lower.includes('gym') || lower.includes('fit') || lower.includes('crossfit') || lower.includes('yoga')) return 'fitness'
  if (lower.includes('contractor') || lower.includes('plumb') || lower.includes('hvac') || lower.includes('roof') || lower.includes('electric') || lower.includes('repair')) return 'contractor'
  return 'general'
}

function createSlug(businessName: string, city?: string): string {
  const base = `${businessName}${city ? `-${city}` : ''}`
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function extractReviews(audit: AuditResult): { author: string; rating: number; text: string; date: string }[] {
  // If audit has competitor data with reviews, generate plausible reviews from rating
  const rating = audit.googleBusiness.rating || 4.5
  const sampleReviews = [
    { text: `Absolutely wonderful experience! ${audit.prospect.businessName} exceeded all my expectations. Will definitely be coming back.`, rating: 5 },
    { text: `Great service and friendly staff. They really know what they're doing. Highly recommend to anyone in the area.`, rating: 5 },
    { text: `Very professional and thorough. Fair pricing and they took the time to explain everything. Top notch!`, rating: 5 },
    { text: `Good experience overall. The team was helpful and the results were solid. Would recommend.`, rating: 4 },
    { text: `Reliable and trustworthy. They've been our go-to for years. Always consistent quality.`, rating: 5 },
    { text: `Impressed with the attention to detail. They went above and beyond what we expected.`, rating: 5 },
  ]

  const names = ['Sarah M.', 'James T.', 'Maria G.', 'David L.', 'Ashley R.', 'Michael B.']
  const count = Math.min(6, Math.max(3, audit.googleBusiness.reviewCount > 0 ? 6 : 3))

  return sampleReviews.slice(0, count).map((r, i) => ({
    author: names[i],
    rating: r.rating,
    text: r.text,
    date: new Date(Date.now() - (i + 1) * 30 * 86400000).toISOString().split('T')[0],
  }))
}

function generateDescription(businessName: string, category: string, city?: string, state?: string): string {
  const location = city ? `${city}${state ? `, ${state}` : ''}` : 'the community'
  const descriptions: Record<string, string> = {
    salon: `${businessName} is ${location}'s premier destination for beauty and self-care. Our talented team delivers stunning results in a welcoming, relaxing atmosphere.`,
    dental: `At ${businessName}, we combine advanced dental technology with compassionate care. Serving families in ${location} with comprehensive dental services.`,
    restaurant: `${businessName} brings exceptional cuisine to ${location}. From fresh, locally-sourced ingredients to our warm hospitality, every visit is a memorable dining experience.`,
    fitness: `${businessName} is ${location}'s home for fitness transformation. Expert trainers, state-of-the-art equipment, and a supportive community to help you reach your goals.`,
    contractor: `${businessName} has been delivering quality craftsmanship to ${location} for years. Licensed, insured, and committed to exceeding expectations on every project.`,
    general: `${businessName} proudly serves ${location} with dedication to quality and customer satisfaction. We're committed to delivering exceptional results every time.`,
  }
  return descriptions[category] || descriptions.general
}

interface AdditionalData {
  tagline?: string
  description?: string
  services?: { name: string; description: string; price?: string }[]
  hours?: Record<string, string>
  brand_colors?: { primary?: string; secondary?: string; accent?: string }
  logo_url?: string
  hero_image_url?: string
  gallery_images?: string[]
  email?: string
}

export async function generatePreview(
  audit: AuditResult,
  additional?: AdditionalData
): Promise<{ url: string; slug: string; id: string }> {
  const category = mapCategory(audit.prospect.category)
  const defaults = CATEGORY_DEFAULTS[category]
  const slug = createSlug(audit.prospect.businessName, audit.prospect.city)

  const previewData = {
    slug,
    business_name: audit.prospect.businessName,
    tagline: additional?.tagline || defaults.tagline,
    description: additional?.description || generateDescription(audit.prospect.businessName, category, audit.prospect.city, audit.prospect.state),
    category,
    brand_color_primary: additional?.brand_colors?.primary || defaults.colors.primary,
    brand_color_secondary: additional?.brand_colors?.secondary || defaults.colors.secondary,
    brand_color_accent: additional?.brand_colors?.accent || defaults.colors.accent,
    logo_url: additional?.logo_url || null,
    hero_image_url: additional?.hero_image_url || defaults.hero_image,
    gallery_images: additional?.gallery_images || [],
    services: additional?.services || generateDefaultServices(category),
    hours: additional?.hours || generateDefaultHours(),
    address: audit.prospect.address || null,
    city: audit.prospect.city || null,
    state: audit.prospect.state || null,
    phone: audit.prospect.phone || null,
    email: additional?.email || null,
    website_current: audit.prospect.website || null,
    reviews: extractReviews(audit),
    google_rating: audit.googleBusiness.rating || null,
    google_review_count: audit.googleBusiness.reviewCount || 0,
    cta_text: defaults.cta_text,
    cta_url: `https://autolocal.ai/packages?ref=${slug}`,
    template: defaults.template,
    audit_id: audit.id || null,
    status: 'published',
  }

  // Upsert (update if slug exists)
  const { data, error } = await supabase
    .from('website_previews')
    .upsert(previewData, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create preview: ${error.message}`)

  return {
    url: `https://autolocal.ai/preview/${slug}`,
    slug,
    id: data.id,
  }
}

function generateDefaultServices(category: string): { name: string; description: string; price?: string }[] {
  const services: Record<string, { name: string; description: string; price?: string }[]> = {
    salon: [
      { name: 'Haircut & Style', description: 'Expert cut and blow-dry tailored to your look.', price: 'From $45' },
      { name: 'Color & Highlights', description: 'Full color, balayage, or highlights by certified colorists.', price: 'From $85' },
      { name: 'Facial Treatment', description: 'Rejuvenating facial customized for your skin type.', price: 'From $65' },
      { name: 'Manicure & Pedicure', description: 'Relax with a luxurious mani-pedi combo.', price: 'From $55' },
      { name: 'Bridal Packages', description: 'Complete hair and makeup for your special day.', price: 'From $250' },
      { name: 'Waxing Services', description: 'Smooth, long-lasting results with gentle waxing.', price: 'From $25' },
    ],
    dental: [
      { name: 'General Dentistry', description: 'Cleanings, exams, and preventive care for the whole family.' },
      { name: 'Cosmetic Dentistry', description: 'Veneers, whitening, and smile makeovers.' },
      { name: 'Dental Implants', description: 'Permanent, natural-looking tooth replacement solutions.' },
      { name: 'Orthodontics', description: 'Invisalign and traditional braces for straighter smiles.' },
      { name: 'Emergency Care', description: 'Same-day emergency dental appointments available.' },
      { name: 'Pediatric Dentistry', description: 'Gentle, kid-friendly dental care in a fun environment.' },
    ],
    restaurant: [
      { name: 'Appetizers', description: 'Handcrafted starters featuring seasonal ingredients.' },
      { name: 'Entrées', description: 'Chef-curated dishes made with locally-sourced ingredients.' },
      { name: 'Private Dining', description: 'Exclusive space for events, parties, and celebrations.' },
      { name: 'Catering', description: 'Full-service catering for any occasion.' },
      { name: 'Happy Hour', description: 'Daily specials on drinks and small plates.' },
      { name: 'Weekend Brunch', description: 'Signature brunch served every Saturday and Sunday.' },
    ],
    fitness: [
      { name: 'Personal Training', description: 'One-on-one coaching tailored to your goals.', price: 'From $60/session' },
      { name: 'Group Classes', description: 'High-energy group workouts for all fitness levels.', price: 'Included' },
      { name: 'Nutrition Coaching', description: 'Custom meal plans and accountability support.', price: 'From $99/mo' },
      { name: 'Gym Membership', description: 'Full access to equipment, classes, and amenities.', price: 'From $49/mo' },
      { name: 'Yoga & Pilates', description: 'Mind-body classes for flexibility and strength.' },
      { name: 'Sports Performance', description: 'Athletic training for competitive athletes.' },
    ],
    contractor: [
      { name: 'Kitchen Remodeling', description: 'Complete kitchen renovations from design to installation.' },
      { name: 'Bathroom Renovation', description: 'Modern bathroom upgrades that add value to your home.' },
      { name: 'Roofing', description: 'Expert roof repair and replacement with quality materials.' },
      { name: 'Painting', description: 'Interior and exterior painting with premium finishes.' },
      { name: 'Flooring', description: 'Hardwood, tile, and luxury vinyl installation.' },
      { name: 'General Repairs', description: 'Handyman services for any project, big or small.' },
    ],
    general: [
      { name: 'Consultation', description: 'Free initial consultation to understand your needs.' },
      { name: 'Standard Service', description: 'Our core offering, delivered with excellence.' },
      { name: 'Premium Package', description: 'Enhanced service with priority support.' },
      { name: 'Maintenance Plan', description: 'Ongoing support to keep everything running smoothly.' },
    ],
  }
  return services[category] || services.general
}

function generateDefaultHours(): Record<string, string> {
  return {
    mon: '9:00 AM - 6:00 PM',
    tue: '9:00 AM - 6:00 PM',
    wed: '9:00 AM - 6:00 PM',
    thu: '9:00 AM - 6:00 PM',
    fri: '9:00 AM - 6:00 PM',
    sat: '10:00 AM - 4:00 PM',
    sun: 'Closed',
  }
}
