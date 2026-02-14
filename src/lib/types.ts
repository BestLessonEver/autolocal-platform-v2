export interface Business {
  id: string
  user_id: string
  name: string
  industry: string | null
  address: string | null
  phone: string | null
  website_url: string | null
  logo_url: string | null
  brand_colors: string[]
  style_preset: StylePreset
  brand_description: string | null
  services: string[]
  differentiator: string | null
  target_customer: string | null
  posting_frequency: number
  preferred_days: string[]
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  business_id: string
  caption: string
  image_url: string | null
  scheduled_at: string | null
  published_at: string | null
  status: 'pending' | 'approved' | 'published' | 'rejected'
  content_type: string
  platforms: string[]
  rating: number | null
  rating_feedback: string | null
  photo_upload: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  business_id: string
  plan: 'trial' | 'starter' | 'growth' | 'pro'
  status: 'active' | 'cancelled' | 'expired'
  trial_ends_at: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export type StylePreset = 
  | 'warm_personal'
  | 'bold_energetic' 
  | 'clean_professional'
  | 'fun_playful'
  | 'luxe_aspirational'
  | 'down_to_earth'

export const STYLE_PRESETS: Record<StylePreset, { label: string; emoji: string; description: string; tone: string }> = {
  warm_personal: { label: 'Warm & Personal', emoji: '🌿', description: 'Friendly, heartfelt, community-focused', tone: 'warm, friendly, and community-oriented' },
  bold_energetic: { label: 'Bold & Energetic', emoji: '⚡', description: 'High energy, motivational, action-oriented', tone: 'energetic, motivational, and action-driven' },
  clean_professional: { label: 'Clean & Professional', emoji: '🏥', description: 'Trustworthy, informative, polished', tone: 'professional, trustworthy, and polished' },
  fun_playful: { label: 'Fun & Playful', emoji: '🎉', description: 'Lighthearted, casual, emoji-friendly', tone: 'fun, lighthearted, and casual with lots of emojis' },
  luxe_aspirational: { label: 'Luxe & Aspirational', emoji: '✨', description: 'Elegant, refined, exclusive', tone: 'elegant, refined, and aspirational' },
  down_to_earth: { label: 'Down to Earth', emoji: '🛠️', description: 'Honest, practical, relatable', tone: 'honest, practical, and down-to-earth' },
}

export const INDUSTRIES = [
  'Health & Wellness',
  'Beauty & Personal Care', 
  'Pet Services',
  'Education & Enrichment',
  'Fitness',
  'Home Services',
  'Professional Services',
  'Other',
]

export const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '🔵' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'google', label: 'Google Business', icon: '🔴' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
  { id: 'nextdoor', label: 'Nextdoor', icon: '🏘️' },
]

export const PRICING_TIERS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 49,
    annual: 490,
    features: ['2 platforms', '12 posts/month', '24 regenerations', '12 image generations', '3 style presets'],
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: 99,
    annual: 990,
    popular: true,
    features: ['All 7 platforms', '30 posts/month', '60 regenerations', '30 image generations', 'All style presets'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 199,
    annual: 1990,
    features: ['All 7 platforms', '30 posts/month', '100 regenerations', '50 image generations', 'All style presets', '10 video edits/mo'],
  },
]
