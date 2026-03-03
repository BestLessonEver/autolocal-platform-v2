/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import PreviewWrapper from './PreviewWrapper'

// Force dynamic rendering — previews are created on the fly
export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('website_previews')
    .select('business_name, tagline, description, city, state')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Preview Not Found' }

  return {
    title: `${data.business_name} | Website Preview`,
    description: data.tagline || data.description || `Preview website for ${data.business_name}`,
    openGraph: {
      title: data.business_name,
      description: data.tagline || `See what ${data.business_name}'s new website could look like`,
    },
  }
}

export default async function PreviewPage({ params }: Props) {
  const { data, error } = await supabase
    .from('website_previews')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!data || error) {
    notFound()
  }

  // Track view (fire and forget)
  // Fire and forget view tracking
  void supabase.rpc('increment_preview_views', { preview_slug: params.slug })

  return <PreviewWrapper data={data} />
}
