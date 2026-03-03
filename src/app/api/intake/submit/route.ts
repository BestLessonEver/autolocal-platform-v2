import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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
      instagram,
      hours,
      services,
      logoUrl,
      photoUrls,
    } = body

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const finalSlug = slug || slugify(businessName)

    // Check if preview already exists (from payment flow)
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
          category: category || 'business',
          phone: phone || null,
          email: email || null,
          address: address || null,
          city: city || null,
          state: state || null,
          website_current: website || null,
          hours: hours || null,
          services: services || [],
          logo_url: logoUrl || null,
          hero_image_url: photoUrls?.[0] || null,
          gallery_images: photoUrls || [],
          status: 'intake_complete',
        })
        .eq('id', existing.id)
    } else {
      // Create new preview from intake
      await supabase.from('website_previews').insert({
        slug: finalSlug,
        business_name: businessName,
        tagline: tagline || null,
        description: description || null,
        category: category || 'business',
        phone: phone || null,
        email: email || null,
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
        status: 'intake_complete',
        brand_color_primary: '#0f172a',
        brand_color_secondary: '#1e293b',
        brand_color_accent: '#3b82f6',
        reviews: [],
        view_count: 0,
      })
    }

    // Send notification to Brian
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
        },
        body: JSON.stringify({
          to: 'brian@autolocal.ai',
          subject: `🆕 New intake submission: ${businessName}`,
          html: `
            <h2>New Intake: ${businessName}</h2>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>City:</strong> ${city}, ${state}</p>
            <p><strong>Services:</strong> ${(services || []).map((s: any) => s.name).join(', ')}</p>
            <p><strong>Photos:</strong> ${(photoUrls || []).length}</p>
            <p><strong>Logo:</strong> ${logoUrl ? 'Yes' : 'No'}</p>
            <p><a href="https://autolocal.ai/admin/clients">View in Admin →</a></p>
          `,
        }),
      })
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, slug: finalSlug })
  } catch (err) {
    console.error('Intake submit error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
