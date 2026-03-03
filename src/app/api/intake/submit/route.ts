import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const VALID_CATEGORIES = ['salon', 'fitness', 'restaurant', 'contractor', 'general']

function mapCategory(cat: string): string {
  if (!cat) return 'general'
  const lower = cat.toLowerCase()
  if (VALID_CATEGORIES.includes(lower)) return lower
  if (lower.includes('hair') || lower.includes('barber') || lower.includes('spa') || lower.includes('beauty') || lower.includes('nail')) return 'salon'
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('train') || lower.includes('yoga') || lower.includes('exercise')) return 'fitness'
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('bar') || lower.includes('grill') || lower.includes('pizza') || lower.includes('sushi')) return 'restaurant'
  if (lower.includes('plumb') || lower.includes('electric') || lower.includes('roof') || lower.includes('hvac') || lower.includes('construct') || lower.includes('paint') || lower.includes('landscap') || lower.includes('auto') || lower.includes('mechanic')) return 'contractor'
  return 'general'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      slug,
      businessName,
      tagline,
      description,
      category,
      phone,
      email,
      address,
      city,
      state,
      website,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      instagram,
      hours,
      services,
      logoUrl,
      photoUrls,
    } = body

    if (!businessName || !email) {
      return NextResponse.json({ error: 'Business name and email required' }, { status: 400 })
    }

    const finalSlug = slug || slugify(`${businessName}-${city || ''}`)

    // Check if preview already exists (e.g. from payment webhook)
    const { data: existing } = await supabase
      .from('website_previews')
      .select('id')
      .eq('slug', finalSlug)
      .limit(1)
      .single()

    if (existing) {
      // Update existing record with intake data
      await supabase
        .from('website_previews')
        .update({
          business_name: businessName,
          tagline: tagline || null,
          description: description || null,
          category: mapCategory(category),
          phone: phone || null,
          email,
          address: address || null,
          city: city || null,
          state: state || null,
          website_current: website || null,
          hours: hours || null,
          services: services || [],
          logo_url: logoUrl || null,
          hero_image_url: photoUrls?.[0] || null,
          gallery_images: photoUrls || [],
          status: 'published',
        })
        .eq('id', existing.id)
    } else {
      // Create new preview record
      const { error: insertError } = await supabase.from('website_previews').insert({
        slug: finalSlug,
        business_name: businessName,
        tagline: tagline || null,
        description: description || null,
        category: mapCategory(category),
        phone: phone || null,
        email,
        address: address || null,
        city: city || null,
        state: state || null,
        website_current: website || null,
        hours: hours || null,
        services: services || [],
        logo_url: logoUrl || null,
        hero_image_url: photoUrls?.[0] || null,
        gallery_images: photoUrls || [],
        template: 'bold',
        status: 'published',
        brand_color_primary: '#0f172a',
        brand_color_secondary: '#1e293b',
        brand_color_accent: '#3b82f6',
        view_count: 0,
      })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create preview', detail: insertError.message }, { status: 500 })
      }
    }

    // Notify Brian via internal email (fire-and-forget, don't await)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
        },
        body: JSON.stringify({
          to: 'brian@autolocal.ai',
          subject: `🚀 New intake: ${businessName}`,
          html: `
            <h2>New client intake submitted</h2>
            <p><strong>Business:</strong> ${businessName}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>City:</strong> ${city || 'N/A'}, ${state || ''}</p>
            <p><strong>Photos uploaded:</strong> ${photoUrls?.length || 0}</p>
            <p><strong>Services:</strong> ${services?.length || 0}</p>
            <p><strong>Logo:</strong> ${logoUrl ? 'Yes' : 'No'}</p>
            <p><a href="https://autolocal.ai/admin/clients">View in Admin →</a></p>
          `,
        }),
      }).catch(() => { /* non-blocking */ })

    return NextResponse.json({ success: true, slug: finalSlug })
  } catch (err) {
    console.error('Intake submit error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { slug, logoUrl, photoUrls } = await req.json()
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (logoUrl) updates.logo_url = logoUrl
    if (photoUrls?.length) {
      updates.gallery_images = photoUrls
      updates.hero_image_url = photoUrls[0]
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('website_previews').update(updates).eq('slug', slug)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Intake PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
