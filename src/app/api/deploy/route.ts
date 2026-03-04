/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || '' // optional

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateStarsSvg(rating: number): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="${i < rating ? '#facc15' : '#374151'}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
  ).join('')
}

interface SiteData {
  slug: string
  business_name: string
  tagline: string | null
  description: string | null
  category: string
  brand_color_primary: string
  brand_color_accent: string
  logo_url: string | null
  hero_image_url: string | null
  hero_crop: number | null
  gallery_images: string[]
  services: { name: string; description: string; price?: string }[]
  hours: Record<string, string> | null
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website_current: string | null
  reviews: { author: string; rating: number; text: string }[]
  google_rating: number | null
  google_review_count: number
  cta_text: string
  cta_url: string | null
  template: string
}

function generateStaticHtml(data: SiteData): string {
  const name = escapeHtml(data.business_name)
  const tagline = data.tagline ? escapeHtml(data.tagline) : ''
  const description = data.description ? escapeHtml(data.description) : `Welcome to ${name}. We're committed to delivering exceptional quality and service.`
  const ctaUrl = data.cta_url || '#contact'
  const ctaText = data.cta_url?.startsWith('tel:') ? 'Call Now' : (data.cta_text || 'Get Started')
  const heroImg = data.hero_image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop'
  const heroCrop = data.hero_crop ?? 50
  const services = data.services || []
  const reviews = (data.reviews || []).filter(r => r.rating >= 4)

  // Normalize hours keys (DB may have "Monday" or "mon")
  const dayMap: Record<string, string> = { monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu', friday: 'fri', saturday: 'sat', sunday: 'sun' }
  const rawHours = data.hours || {}
  const normalizedHours: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawHours)) {
    normalizedHours[dayMap[k.toLowerCase()] || k.toLowerCase()] = v as string
  }
  const gallery = data.gallery_images || []
  const hours = data.hours || {}
  const showReviewCount = (data.google_review_count ?? 0) >= 20
  const primary = data.brand_color_primary || '#1a1a2e'
  const accent = data.brand_color_accent || '#6366f1'
  const year = new Date().getFullYear()
  const isIndividual = (data as any).site_mode === 'individual'
  const aboutLabel = isIndividual ? 'About Me' : 'About Us'
  const servicesLabel = isIndividual ? 'My Services' : 'Our Services'
  const offerLabel = isIndividual ? 'What I Offer' : 'What We Offer'
  const galleryLabel = isIndividual ? 'See My Work' : 'See Our Work'
  const reviewsLabel = isIndividual ? 'What My Customers Say' : 'What Our Customers Say'
  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}${data.city ? ` | ${escapeHtml(data.city)}` : ''}</title>
  <meta name="description" content="${tagline || description}">
  <meta property="og:title" content="${name}">
  <meta property="og:description" content="${tagline || description}">
  ${data.hero_image_url ? `<meta property="og:image" content="${data.hero_image_url}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#e5e7eb;background:#09090b;-webkit-font-smoothing:antialiased}
    a{color:inherit;text-decoration:none}img{max-width:100%;display:block}
    .hero{position:relative;min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
    .hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center ${heroCrop}%}
    .hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.6),rgba(0,0,0,0.8))}
    .hero-content{position:relative;z-index:2;padding:2rem;max-width:800px}
    .hero h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:1rem}
    .hero .tagline{font-size:1.25rem;color:rgba(255,255,255,0.8);margin-bottom:0.5rem}
    .hero .rating{display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-bottom:2rem}
    .hero .rating svg{width:20px;height:20px}.hero .rating span{color:rgba(255,255,255,0.7);font-size:0.875rem}
    .btn-primary{display:inline-block;padding:1rem 2.5rem;background:${accent};color:#fff;font-weight:700;border-radius:0.75rem;font-size:1.125rem;transition:transform 0.2s,box-shadow 0.2s}
    .btn-primary:hover{transform:scale(1.03);box-shadow:0 10px 40px rgba(0,0,0,0.3)}
    .btn-outline{display:inline-block;padding:1rem 2.5rem;border:2px solid rgba(255,255,255,0.3);color:#fff;font-weight:700;border-radius:0.75rem;font-size:1.125rem;transition:all 0.2s;margin-left:1rem}
    .btn-outline:hover{border-color:#fff;background:rgba(255,255,255,0.1)}
    .section{padding:5rem 1.5rem;max-width:1200px;margin:0 auto}
    .section-title{font-size:2rem;font-weight:900;color:#fff;text-align:center;margin-bottom:3rem}
    .section-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};text-align:center;margin-bottom:0.75rem}
    .services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .service-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:1rem;padding:1.5rem;transition:border-color 0.2s}
    .service-card:hover{border-color:${accent}40}.service-card h3{font-weight:700;color:#fff;margin-bottom:0.5rem}
    .service-card p{font-size:0.875rem;color:#9ca3af;line-height:1.6}.service-card .price{color:${accent};font-weight:700;margin-top:0.5rem}
    .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
    .gallery-grid img{width:100%;height:250px;object-fit:cover;border-radius:0.75rem;transition:transform 0.3s}
    .gallery-grid img:hover{transform:scale(1.02)}
    .reviews-container{max-width:700px;margin:0 auto;text-align:center;min-height:200px}
    .review-text{font-size:1.25rem;font-style:italic;color:#d1d5db;line-height:1.7;margin-bottom:1.5rem}
    .review-author{font-weight:700;color:#fff}
    .review-dots{display:flex;justify-content:center;gap:0.5rem;margin-top:1.5rem}
    .review-dot{width:8px;height:8px;border-radius:50%;background:#374151;border:none;cursor:pointer;transition:all 0.2s}
    .review-dot.active{background:${accent};transform:scale(1.4)}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;max-width:900px;margin:0 auto}
    @media(max-width:768px){.contact-grid{grid-template-columns:1fr}}
    .hours-row{display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.875rem}
    .hours-row .day{font-weight:600;color:#fff}.hours-row .time{color:#9ca3af}
    .contact-info{display:flex;flex-direction:column;gap:1.5rem}
    .contact-item{display:flex;align-items:flex-start;gap:0.75rem;font-size:0.9rem}
    .contact-item .icon{font-size:1.25rem;margin-top:2px}.contact-item .label{font-weight:600;color:#fff}
    .contact-item .value{color:#9ca3af}.contact-item a{color:${accent}}.contact-item a:hover{text-decoration:underline}
    .footer{text-align:center;padding:3rem 1.5rem;border-top:1px solid rgba(255,255,255,0.06);color:#4b5563;font-size:0.75rem}
    .sticky-bar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:40;background:rgba(255,255,255,0.97);border-top:1px solid #e5e7eb;padding:0.75rem}
    .sticky-bar .btns{display:flex;gap:0.5rem;max-width:480px;margin:0 auto}
    .sticky-bar a{flex:1;display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.875rem;border-radius:0.75rem;font-weight:700;font-size:0.875rem;color:#fff;text-align:center}
    .sticky-bar .call-btn{background:${primary}}.sticky-bar .book-btn{background:${accent}}
    @media(max-width:640px){.sticky-bar{display:block}}
  </style>
</head>
<body>
  <section class="hero">
    <div class="hero-bg"><img src="${heroImg}" alt="" loading="eager"></div>
    <div class="hero-content">
      ${data.google_rating ? `<div class="rating">${generateStarsSvg(Math.round(data.google_rating))}<span>${data.google_rating} stars on Google${showReviewCount ? ` · ${data.google_review_count} reviews` : ''}</span></div>` : ''}
      <h1>${name}</h1>
      ${tagline ? `<p class="tagline">${tagline}</p>` : ''}
      <div style="margin-top:2rem">
        <a href="${ctaUrl}" class="btn-primary">${escapeHtml(ctaText)}</a>
        ${services.length > 0 ? `<a href="#services" class="btn-outline">View Services →</a>` : ''}
      </div>
    </div>
  </section>
  <section class="section">
    <p class="section-label>${aboutLabel}</p>
    <h2 class="section-title">${name}</h2>
    <p style="max-width:700px;margin:0 auto;text-align:center;color:#9ca3af;line-height:1.8;font-size:1.1rem">${description}</p>
  </section>
  ${services.length > 0 ? `<section class="section" id="services"><p class="section-label>${offerLabel}</p><h2 class="section-title>${servicesLabel}</h2><div class="services-grid">${services.map(s => `<div class="service-card"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description || '')}</p>${s.price ? `<p class="price">${escapeHtml(s.price)}</p>` : ''}</div>`).join('')}</div></section>` : ''}
  ${gallery.length > 0 ? `<section class="section"><p class="section-label">Gallery</p><h2 class="section-title>${galleryLabel}</h2><div class="gallery-grid">${gallery.map((img, i) => `<img src="${img}" alt="${name} photo ${i + 1}" loading="lazy">`).join('')}</div></section>` : ''}
  ${reviews.length > 0 ? `<section class="section" id="reviews"><p class="section-label">Testimonials</p><h2 class="section-title>${reviewsLabel}</h2><div class="reviews-container"><div id="review-text" class="review-text">"${escapeHtml(reviews[0].text)}"</div><div style="display:flex;align-items:center;justify-content:center;gap:0.5rem">${generateStarsSvg(reviews[0].rating)}</div><p id="review-author" class="review-author" style="margin-top:0.75rem">— ${escapeHtml(reviews[0].author)}</p>${reviews.length > 1 ? `<div class="review-dots">${reviews.map((_, i) => `<button class="review-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Review ${i + 1}"></button>`).join('')}</div>` : ''}</div></section>` : ''}
  <section class="section" id="contact">
    <p class="section-label">Get In Touch</p>
    <h2 class="section-title">Hours & Contact</h2>
    <div class="contact-grid">
      ${Object.keys(normalizedHours).length > 0 ? `<div><h3 style="font-weight:700;color:#fff;margin-bottom:1rem">Business Hours</h3><div>${daysOrder.filter(d => normalizedHours[d]).map(d => `<div class="hours-row"><span class="day">${dayLabels[d]}</span><span class="time">${normalizedHours[d]}</span></div>`).join('')}</div></div>` : '<div></div>'}
      <div class="contact-info">
        <h3 style="font-weight:700;color:#fff;margin-bottom:0.5rem">Contact Info</h3>
        ${data.address ? `<div class="contact-item"><span class="icon">📍</span><div><p class="label">Address</p><p class="value">${escapeHtml(data.address)}${data.city ? `, ${escapeHtml(data.city)}` : ''}${data.state ? `, ${escapeHtml(data.state)}` : ''}</p></div></div>` : ''}
        ${data.phone ? `<div class="contact-item"><span class="icon">📞</span><div><p class="label">Phone</p><a href="tel:${data.phone}">${escapeHtml(data.phone)}</a></div></div>` : ''}
        ${(data as any).contact_email || data.email ? `<div class="contact-item"><span class="icon">✉️</span><div><p class="label">Email</p><a href="mailto:${(data as any).contact_email || data.email}">${escapeHtml((data as any).contact_email || data.email)}</a></div></div>` : ''}
      </div>
    </div>
  </section>
  <footer class="footer">
    <p style="font-weight:800;color:#fff;font-size:1.125rem;margin-bottom:0.25rem">${name}</p>
    ${data.phone ? `<p>${escapeHtml(data.phone)}</p>` : ''}
    ${data.address ? `<p style="margin-top:0.25rem">${escapeHtml(data.address)}${data.city ? `, ${escapeHtml(data.city)}` : ''}${data.state ? `, ${escapeHtml(data.state)}` : ''}</p>` : ''}
    <p style="margin-top:2rem">© ${year} ${name}</p>
  </footer>
  ${data.phone ? `<div class="sticky-bar"><div class="btns"><a href="tel:${data.phone}" class="call-btn">📞 Call Now</a>${data.cta_url && !data.cta_url.startsWith('tel:') ? `<a href="${data.cta_url}" class="book-btn">📅 Book Now</a>` : ''}</div></div>` : ''}
  ${reviews.length > 1 ? `<script>(function(){var r=${JSON.stringify(reviews.map(r => ({ text: r.text, author: r.author, rating: r.rating })))};var i=0;var d=document.querySelectorAll('.review-dot');var t=document.getElementById('review-text');var a=document.getElementById('review-author');function s(n){i=n;t.textContent='"'+r[i].text+'"';a.textContent='— '+r[i].author;d.forEach(function(x,j){x.classList.toggle('active',j===i)})}d.forEach(function(x){x.addEventListener('click',function(){s(parseInt(this.dataset.idx))})});setInterval(function(){s((i+1)%r.length)},7000)})();</script>` : ''}
</body>
</html>`
}

// Deploy to Vercel via API (no CLI needed)
async function deployToVercel(slug: string, html: string): Promise<{ url: string; projectId: string }> {
  const projectName = `autolocal-${slug}`
  
  const vercelJson = JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    headers: [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ]}]
  })

  // Create deployment via Vercel API
  const teamQuery = VERCEL_TEAM ? `?teamId=${VERCEL_TEAM}` : ''
  const res = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: [
        { file: 'index.html', data: html },
        { file: 'vercel.json', data: vercelJson },
      ],
      projectSettings: {
        framework: null,
      },
      target: 'production',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Vercel deploy failed: ${res.status} ${err}`)
  }

  const deployment = await res.json()
  return { 
    url: `https://${deployment.url}`,
    projectId: deployment.projectId || deployment.id,
  }
}

// Add subdomain to Vercel project
async function addSubdomain(slug: string, projectId: string): Promise<string> {
  const subdomain = `${slug}.autolocal.ai`
  const teamQuery = VERCEL_TEAM ? `&teamId=${VERCEL_TEAM}` : ''
  
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains?${teamQuery}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: subdomain }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Subdomain add warning: ${res.status} ${err}`)
    // Non-fatal — site still works on .vercel.app
  }

  return subdomain
}

export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (token !== (process.env.INTERNAL_API_KEY || 'internal')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // 1. Fetch site data from Supabase
    const { data, error } = await supabase
      .from('website_previews')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
    }

    // 2. Generate static HTML
    const html = generateStaticHtml(data as SiteData)

    // 3. Deploy to Vercel
    const { url, projectId } = await deployToVercel(slug, html)

    // 4. Add subdomain
    const subdomain = await addSubdomain(slug, projectId)

    // 5. Update DB with deployed URL
    await supabase
      .from('website_previews')
      .update({ 
        website_current: `https://${subdomain}`,
      })
      .eq('slug', slug)

    return NextResponse.json({ 
      success: true, 
      url,
      subdomain: `https://${subdomain}`,
      projectId,
    })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
