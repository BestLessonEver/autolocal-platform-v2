import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
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
          category: category || 'business',
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
          status: 'intake_complete',
        })
        .eq('id', existing.id)
    } else {
      // Create new preview record
      await supabase.from('website_previews').insert({
        slug: finalSlug,
        business_name: businessName,
        tagline: tagline || null,
        description: description || null,
        category: category || 'business',
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
        status: 'intake_complete',
        brand_color_primary: '#0f172a',
        brand_color_secondary: '#1e293b',
        brand_color_accent: '#3b82f6',
        view_count: 0,
      })
    }

    // Notify Brian via internal email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://autolocal.ai'}/api/send-email`, {
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
      })
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, slug: finalSlug })
  } catch (err) {
    console.error('Intake submit error:', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
