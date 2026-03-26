export interface PreviewData {
  id: string
  slug: string
  business_name: string
  tagline: string | null
  description: string | null
  category: string
  brand_color_primary: string
  brand_color_secondary: string
  brand_color_accent: string
  logo_url: string | null
  hero_image_url: string | null
  hero_crop?: number
  site_mode?: 'business' | 'individual'
  gallery_images: string[]
  services: { name: string; description: string; price?: string }[]
  hours: Record<string, string>
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  contact_email?: string | null
  website_current: string | null
  reviews: { author: string; rating: number; text: string; date: string }[]
  google_rating: number | null
  google_review_count: number
  cta_text: string
  cta_url: string | null
  template: string
  discord_webhook_url?: string | null
}

export interface TemplateProps {
  data: PreviewData
}

export type TemplateName = 'bold' | 'elegant' | 'professional' | 'clutch' | 'artika' | 'bde'

/** Get the correct CTA button text based on URL type */
export function getCtaButtonText(data: PreviewData): string {
  if (data.cta_url && data.cta_url.startsWith('tel:')) {
    return 'Call Now'
  }
  return data.cta_text || 'Get Started'
}

/** Map legacy category names to template names */
export function categoryToTemplate(category: string): TemplateName {
  switch (category) {
    case 'salon':
      return 'artika'
    case 'dental':
    case 'contractor':
      return 'clutch'
    case 'fitness':
      return 'bde'
    default:
      return 'bde'
  }
}
