/* eslint-disable @typescript-eslint/no-explicit-any */
// Static HTML generators for deployed client sites
// Each template mirrors its React counterpart in src/components/templates/

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
  hero_crop?: number
  site_mode?: string
  gallery_images: string[]
  services: { name: string; description?: string; price?: string }[]
  hours: Record<string, string>
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  contact_email?: string | null
  website_current: string | null
  reviews: { author: string; rating: number; text: string; date?: string }[]
  google_rating: number | null
  google_review_count: number
  cta_text: string | null
  cta_url: string | null
  template: string
}

function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function starsSvg(rating: number, fillColor = '#facc15', emptyColor = '#374151'): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="${i < rating ? fillColor : emptyColor}" style="display:inline-block"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
  ).join('')
}

const DAYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

const HERO_IMAGES: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
}

function getHeroImg(d: SiteData): string {
  return d.hero_image_url || HERO_IMAGES[d.category] || HERO_IMAGES.general
}

function getCtaText(d: SiteData): string {
  if (d.cta_url && d.cta_url.startsWith('tel:')) return 'Call Now'
  return d.cta_text || 'Get Started'
}

function getEmail(d: SiteData): string {
  return d.contact_email || d.email || ''
}

/** Gallery images with hero image filtered out to avoid duplication */
function getGallery(d: SiteData): string[] {
  if (!d.gallery_images || d.gallery_images.length === 0) return []
  return d.gallery_images.filter(img => img !== d.hero_image_url)
}


function lightenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount)
  const b = Math.min(255, (num & 0x0000FF) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

function isIndividual(d: SiteData): boolean {
  return d.site_mode === 'individual'
}

function showReviewCount(d: SiteData): boolean {
  return (d.google_review_count ?? 0) >= 20
}

function hoursHtml(d: SiteData, labelClass: string, valueClass: string, rowClass: string): string {
  const entries = DAYS_ORDER.filter(day => d.hours[day]).map(day =>
    `<div class="${rowClass}"><span class="${labelClass}">${DAY_LABELS[day]}</span><span class="${valueClass}">${esc(d.hours[day])}</span></div>`
  )
  return entries.length > 0 ? entries.join('') : ''
}

function stickyContactBar(d: SiteData): string {
  const hasPhone = !!d.phone
  const bookingUrl = d.cta_url && !d.cta_url.startsWith('tel:') ? d.cta_url : null
  const phoneSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>`
  let buttons = ''
  if (hasPhone) {
    buttons += `<a href="tel:${esc(d.phone)}" class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white" style="background:${d.brand_color_primary}">${phoneSvg} Call Now</a>`
  }
  if (bookingUrl) {
    buttons += `<a href="${esc(bookingUrl)}" class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white" style="background:${d.brand_color_accent || d.brand_color_primary}">Book Now</a>`
  } else if (!hasPhone) {
    buttons += `<a href="#contact" class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white" style="background:${d.brand_color_accent || d.brand_color_primary}">Contact Us</a>`
  }
  return `<div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:hidden"><div class="flex gap-2 p-3 max-w-lg mx-auto">${buttons}</div></div>`
}

function reviewCarouselScript(reviewCount: number): string {
  if (reviewCount <= 1) return ''
  return `<script>
(function(){
  var idx=0,total=${reviewCount},texts=document.querySelectorAll('[data-review-text]'),authors=document.querySelectorAll('[data-review-author]'),dots=document.querySelectorAll('[data-review-dot]'),stars=document.querySelectorAll('[data-review-stars]'),dates=document.querySelectorAll('[data-review-date]');
  function show(i){idx=i;texts.forEach(function(el){el.style.display='none'});authors.forEach(function(el){el.style.display='none'});if(stars.length)stars.forEach(function(el){el.style.display='none'});if(dates.length)dates.forEach(function(el){el.style.display='none'});
  if(texts[i])texts[i].style.display='';if(authors[i])authors[i].style.display='';if(stars[i])stars[i].style.display='flex';if(dates[i])dates[i].style.display='';
  dots.forEach(function(el,j){el.className=j===i?el.getAttribute('data-active-class'):el.getAttribute('data-inactive-class')});}
  dots.forEach(function(el,j){el.addEventListener('click',function(){show(j)})});
  setInterval(function(){show((idx+1)%total)},5000);
  show(0);
})();
</script>`
}

// ═══════════════════════════════════════════════════════
// BOLD TEMPLATE
// ═══════════════════════════════════════════════════════
function boldTemplate(d: SiteData): string {
  const p = d.brand_color_primary
  const a = d.brand_color_accent
  const heroImg = getHeroImg(d)
  const ind = isIndividual(d)
  const ctaText = d.phone ? (ind ? 'Call Me' : 'Call Us') : getCtaText(d)
  const email = getEmail(d)
  const year = new Date().getFullYear()

  return `
<div class="min-h-screen bg-white text-gray-900">
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-3">
        ${d.logo_url ? `<img src="${esc(d.logo_url)}" alt="" class="h-9 w-9 rounded-lg object-cover">` : ''}
        <span class="font-black text-xl text-white tracking-tight">${esc(d.business_name)}</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
        <a href="#services" class="hover:text-white transition">Services</a>
        <a href="#about" class="hover:text-white transition">About</a>
        <a href="#reviews" class="hover:text-white transition">Reviews</a>
        <a href="#contact" class="hover:text-white transition">Contact</a>
      </nav>
      <a href="${esc(d.cta_url || '#contact')}" class="px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style="background:${p}">${esc(ctaText)}</a>
    </div>
  </header>

  <!-- Hero -->
  <section class="relative min-h-[85vh] flex items-end">
    <div class="absolute inset-0">
      <img src="${esc(heroImg)}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
    </div>
    <div class="relative w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-3xl">
          ${d.google_rating ? `<div class="flex items-center gap-3 mb-6">${starsSvg(Math.round(d.google_rating))}<span class="text-white/90 font-semibold text-sm">${d.google_rating} stars${showReviewCount(d) ? ` · ${d.google_review_count} reviews on Google` : ' on Google'}</span></div>` : ''}
          <h1 class="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6">${esc(d.business_name)}</h1>
          ${d.tagline ? `<p class="text-xl sm:text-2xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light">${esc(d.tagline)}</p>` : ''}
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="${esc(d.cta_url || '#contact')}" class="inline-flex items-center justify-center px-10 py-5 rounded-lg text-white text-lg font-bold shadow-2xl transition-all transform hover:scale-105 tracking-wide" style="background:${p}">${esc(ctaText)}</a>
            <a href="#services" class="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white/30 text-white text-lg font-bold hover:bg-white/10 transition backdrop-blur">View Services →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-20">
        <p class="text-sm font-bold tracking-[0.3em] uppercase mb-4" style="color:${a}">What ${ind ? 'I' : 'We'} Do</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">${ind ? 'My Services' : 'Our Services'}</h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${d.services.map((s, i) => `
        <div class="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-white/20">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black mb-6" style="background:${p}40">${String(i + 1).padStart(2, '0')}</div>
          <h3 class="text-xl font-bold mb-3">${esc(s.name)}</h3>
          <p class="text-gray-400 leading-relaxed mb-4">${esc(s.description)}</p>
          ${s.price ? `<p class="font-bold text-lg" style="color:${a}">${esc(s.price)}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- About -->
  <section id="about" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p class="text-sm font-bold tracking-[0.3em] uppercase mb-4" style="color:${a}">${ind ? 'About Me' : 'About Us'}</p>
          <h2 class="text-4xl sm:text-5xl font-black tracking-tight mb-8" style="color:${p}">${esc(d.business_name)}</h2>
          <p class="text-gray-600 text-lg leading-relaxed mb-8">${esc(d.description || `Welcome to ${d.business_name} — proudly serving ${d.city || 'the community'}${d.state ? `, ${d.state}` : ''}.`)}</p>
          ${d.google_rating && d.google_rating >= 4.0 ? `
          <div class="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl">
            <div class="text-5xl font-black" style="color:${p}">${d.google_rating}</div>
            <div><div class="flex mb-1">${starsSvg(Math.round(d.google_rating))}</div><p class="text-gray-500 text-sm font-medium">${showReviewCount(d) ? `${d.google_review_count} verified reviews` : 'Verified on Google'}</p></div>
          </div>` : ''}
        </div>
        <div class="relative">
          <div class="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
            <img src="${esc(getGallery(d)[0] || heroImg)}" alt="" class="w-full h-full object-cover" ${!getGallery(d)[0] ? `style="object-position:center ${d.hero_crop ?? 50}%"` : ''}>
          </div>
          <div class="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl" style="background:${p};opacity:0.15"></div>
          <div class="absolute -top-6 -right-6 w-24 h-24 rounded-full" style="background:${a};opacity:0.2"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Reviews -->
  ${d.reviews.length > 0 ? `
  <section id="reviews" class="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <p class="text-sm font-bold tracking-[0.3em] uppercase mb-4" style="color:${a}">Testimonials</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">What People Say</h2>
      </div>
      <div class="max-w-4xl mx-auto">
        <div class="bg-white/5 border border-white/10 rounded-3xl p-10 sm:p-14 text-center">
          ${d.reviews.map((r, i) => `
          <div data-review-stars style="${i > 0 ? 'display:none' : 'display:flex'};justify-content:center;margin-bottom:1.5rem">${starsSvg(r.rating)}</div>
          <p data-review-text class="text-2xl sm:text-3xl text-gray-200 leading-relaxed mb-8 font-light" ${i > 0 ? 'style="display:none"' : ''}>&ldquo;${esc(r.text)}&rdquo;</p>
          <p data-review-author class="font-bold text-lg text-white" ${i > 0 ? 'style="display:none"' : ''}>${esc(r.author)}</p>
          `).join('')}
        </div>
        ${d.reviews.length > 1 ? `<div class="flex justify-center gap-3 mt-8">${d.reviews.map((_, i) => `<button data-review-dot data-active-class="w-8 h-3 rounded-full transition-all" data-inactive-class="w-3 h-3 rounded-full bg-gray-600 transition-all" class="${i === 0 ? 'w-8 h-3 rounded-full transition-all' : 'w-3 h-3 rounded-full bg-gray-600 transition-all'}" ${i === 0 ? `style="background:${p}"` : ''}></button>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact -->
  <section id="contact" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <p class="text-sm font-bold tracking-[0.3em] uppercase mb-4" style="color:${a}">Get In Touch</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight" style="color:${p}">Contact Us</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
        <div class="space-y-8">
          ${d.address ? `<div class="flex items-start gap-4"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style="background:${p}">📍</div><div><p class="font-bold text-lg mb-1">Address</p><p class="text-gray-600">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p></div></div>` : ''}
          ${d.phone ? `<div class="flex items-start gap-4"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style="background:${p}">📞</div><div><p class="font-bold text-lg mb-1">Phone</p><a href="tel:${esc(d.phone)}" class="text-gray-600 hover:underline">${esc(d.phone)}</a></div></div>` : ''}
          ${email ? `<div class="flex items-start gap-4"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 text-lg" style="background:${p}">✉️</div><div><p class="font-bold text-lg mb-1">Email</p><a href="mailto:${esc(email)}" class="text-gray-600 hover:underline">${esc(email)}</a></div></div>` : ''}
        </div>
        ${Object.keys(d.hours).length > 0 ? `
        <div>
          <h3 class="text-xl font-bold mb-6">Business Hours</h3>
          <div class="space-y-3">${hoursHtml(d, 'font-semibold', 'text-gray-600', 'flex justify-between py-3 border-b border-gray-100')}</div>
        </div>` : ''}
      </div>
    </div>
  </section>

  <!-- CTA Banner -->
  <section class="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h2 class="text-4xl sm:text-6xl font-black tracking-tight mb-6">Ready to Get Started?</h2>
      <p class="text-xl text-gray-400 mb-10 max-w-xl mx-auto">Contact us today and experience the difference.</p>
      <a href="${esc(d.cta_url || '#contact')}" class="inline-flex px-12 py-5 rounded-lg text-white font-bold text-lg shadow-2xl transition-all transform hover:scale-105" style="background:${p}">${esc(ctaText)}</a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-black text-gray-500 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p class="text-white font-black text-2xl mb-3">${esc(d.business_name)}</p>
      ${d.address ? `<p class="text-sm">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p>` : ''}
      ${d.phone ? `<p class="text-sm mt-1">${esc(d.phone)}</p>` : ''}
      <p class="text-xs mt-10 text-gray-700">© ${year} ${esc(d.business_name)}. All rights reserved. · Powered by AutoLocal.ai</p>
    </div>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// ELEGANT TEMPLATE
// ═══════════════════════════════════════════════════════
function elegantTemplate(d: SiteData): string {
  const p = d.brand_color_primary
  const a = d.brand_color_accent
  const heroImg = getHeroImg(d)
  const ctaText = getCtaText(d)
  const email = getEmail(d)
  const ind = isIndividual(d)
  const gallery = getGallery(d)
  const year = new Date().getFullYear()

  return `
<div class="min-h-screen bg-stone-50 text-gray-800" style="font-family:'Georgia','Times New Roman',serif">
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
      <div class="flex items-center gap-3">
        ${d.logo_url ? `<img src="${esc(d.logo_url)}" alt="" class="h-10 w-10 rounded-full object-cover ring-2 ring-stone-200">` : ''}
        <span class="font-bold text-xl tracking-wide" style="color:${p}">${esc(d.business_name)}</span>
      </div>
      <nav class="hidden md:flex items-center gap-10 text-sm font-medium text-stone-500 tracking-wide" style="font-family:sans-serif">
        <a href="#services" class="hover:text-stone-800 transition">Services</a>
        <a href="#gallery" class="hover:text-stone-800 transition">Gallery</a>
        <a href="#testimonials" class="hover:text-stone-800 transition">Testimonials</a>
        <a href="#contact" class="hover:text-stone-800 transition">Contact</a>
      </nav>
      <a href="${esc(d.cta_url || '#contact')}" class="px-7 py-2.5 rounded-full text-white text-sm font-medium tracking-wide shadow-lg transition-all hover:scale-105" style="background:${p}">${esc(ctaText)}</a>
    </div>
  </header>

  <!-- Hero -->
  <section class="relative min-h-[80vh] flex items-center justify-center text-center">
    <div class="absolute inset-0">
      <img src="${esc(heroImg)}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
      <div class="absolute inset-0" style="background:linear-gradient(180deg,${p}99,${p}55)"></div>
    </div>
    <div class="relative max-w-3xl mx-auto px-4 py-20">
      <div class="w-20 h-[1px] bg-white/40 mx-auto mb-8"></div>
      <p class="text-sm tracking-[0.4em] uppercase text-white/70 mb-6" style="font-family:sans-serif">Welcome to</p>
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">${esc(d.business_name)}</h1>
      ${d.tagline ? `<p class="text-xl sm:text-2xl text-white/85 mb-10 italic leading-relaxed">${esc(d.tagline)}</p>` : ''}
      ${d.google_rating ? `<div class="flex items-center justify-center gap-3 mb-10">${starsSvg(Math.round(d.google_rating))}<span class="text-white/90 font-medium text-sm" style="font-family:sans-serif">${d.google_rating} stars${showReviewCount(d) ? ` · ${d.google_review_count} reviews` : ''}</span></div>` : ''}
      <a href="${esc(d.cta_url || '#contact')}" class="inline-flex px-10 py-4 rounded-full bg-white text-lg font-semibold shadow-2xl transition-all hover:scale-105" style="color:${p}">${esc(ctaText)}</a>
      <div class="w-20 h-[1px] bg-white/40 mx-auto mt-10"></div>
    </div>
  </section>

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-28">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-20">
        <p class="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style="color:${a};font-family:sans-serif">${ind ? 'What I Offer' : 'What We Offer'}</p>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color:${p}">${ind ? 'My Services' : 'Our Services'}</h2>
        <div class="w-16 h-[2px] mx-auto mt-6" style="background:${a}"></div>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        ${d.services.map(s => `
        <div class="bg-white rounded-2xl p-10 shadow-sm hover:shadow-lg transition-all text-center border border-stone-100">
          <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style="background:${p}10"><span class="text-2xl" style="color:${p}">✦</span></div>
          <h3 class="text-xl font-bold mb-3" style="color:${p}">${esc(s.name)}</h3>
          <p class="text-stone-500 leading-relaxed mb-4 text-sm" style="font-family:sans-serif">${esc(s.description)}</p>
          ${s.price ? `<p class="font-bold text-lg" style="color:${a}">${esc(s.price)}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Gallery -->
  ${gallery.length > 0 ? `
  <section id="gallery" class="py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-20">
        <p class="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style="color:${a};font-family:sans-serif">${ind ? 'My Work' : 'Our Work'}</p>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color:${p}">Gallery</h2>
        <div class="w-16 h-[2px] mx-auto mt-6" style="background:${a}"></div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        ${gallery.slice(0, 6).map((img, i) => `<div class="overflow-hidden rounded-xl ${i === 0 ? 'row-span-2' : ''}"><img src="${esc(img)}" alt="" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" style="min-height:${i === 0 ? '400px' : '200px'}"></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- About -->
  <section class="py-28">
    <div class="max-w-3xl mx-auto px-4 text-center">
      <p class="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style="color:${a};font-family:sans-serif">${ind ? 'My Story' : 'Our Story'}</p>
      <h2 class="text-3xl sm:text-4xl font-bold mb-8" style="color:${p}">About ${esc(d.business_name)}</h2>
      <div class="w-16 h-[2px] mx-auto mb-10" style="background:${a}"></div>
      <p class="text-stone-600 text-lg leading-relaxed">${esc(d.description || `Welcome to ${d.business_name} — proudly serving ${d.city || 'the community'}${d.state ? `, ${d.state}` : ''}.`)}</p>
    </div>
  </section>

  <!-- Testimonials -->
  ${d.reviews.length > 0 ? `
  <section id="testimonials" class="py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-20">
        <p class="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style="color:${a};font-family:sans-serif">Testimonials</p>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color:${p}">Client Love</h2>
        <div class="w-16 h-[2px] mx-auto mt-6" style="background:${a}"></div>
      </div>
      <div class="grid md:grid-cols-3 gap-10">
        ${d.reviews.slice(0, 3).map(r => `
        <div class="bg-stone-50 rounded-2xl p-10 text-center border border-stone-100">
          <div class="flex justify-center mb-5">${starsSvg(r.rating, '#facc15', '#d1d5db')}</div>
          <p class="text-stone-700 italic leading-relaxed mb-6">&ldquo;${esc(r.text)}&rdquo;</p>
          <div class="w-8 h-[1px] bg-stone-300 mx-auto mb-4"></div>
          <p class="font-bold" style="color:${p}">${esc(r.author)}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact -->
  <section id="contact" class="py-28">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-20">
        <p class="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style="color:${a};font-family:sans-serif">Visit Us</p>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color:${p}">Book Your Appointment</h2>
        <div class="w-16 h-[2px] mx-auto mt-6" style="background:${a}"></div>
      </div>
      <div class="grid md:grid-cols-2 gap-20 max-w-4xl mx-auto">
        <div class="space-y-8">
          ${d.address ? `<div><p class="font-bold mb-1 text-sm tracking-wide uppercase" style="color:${p};font-family:sans-serif">Location</p><p class="text-stone-600">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p></div>` : ''}
          ${d.phone ? `<div><p class="font-bold mb-1 text-sm tracking-wide uppercase" style="color:${p};font-family:sans-serif">Phone</p><a href="tel:${esc(d.phone)}" class="text-stone-600 hover:underline">${esc(d.phone)}</a></div>` : ''}
          ${email ? `<div><p class="font-bold mb-1 text-sm tracking-wide uppercase" style="color:${p};font-family:sans-serif">Email</p><a href="mailto:${esc(email)}" class="text-stone-600 hover:underline">${esc(email)}</a></div>` : ''}
          <a href="${esc(d.cta_url || '#')}" class="inline-flex mt-4 px-8 py-3 rounded-full text-white font-medium shadow-lg transition-all hover:scale-105" style="background:${p}">${esc(ctaText)}</a>
        </div>
        ${Object.keys(d.hours).length > 0 ? `
        <div>
          <h3 class="font-bold text-xl mb-8" style="color:${p}">Hours</h3>
          <div class="space-y-3">${hoursHtml(d, 'font-medium text-sm', 'text-stone-500 text-sm', 'flex justify-between py-3 border-b border-stone-200')}</div>
        </div>` : ''}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-16 text-white text-center" style="background:${p}">
    <div class="max-w-7xl mx-auto px-4">
      <p class="text-3xl font-bold mb-3">${esc(d.business_name)}</p>
      ${d.address ? `<p class="text-white/60 text-sm">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p>` : ''}
      ${d.phone ? `<p class="text-white/60 text-sm mt-1">${esc(d.phone)}</p>` : ''}
      <p class="text-white/30 text-xs mt-10" style="font-family:sans-serif">© ${year} ${esc(d.business_name)} · Powered by AutoLocal.ai</p>
    </div>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// PROFESSIONAL TEMPLATE
// ═══════════════════════════════════════════════════════
function professionalTemplate(d: SiteData): string {
  const p = d.brand_color_primary
  const a = d.brand_color_accent
  const heroImg = getHeroImg(d)
  const ctaText = getCtaText(d)
  const email = getEmail(d)
  const ind = isIndividual(d)
  const year = new Date().getFullYear()

  return `
<div class="min-h-screen bg-white text-gray-900">
  <!-- Header -->
  <header class="sticky top-0 z-40 shadow-md" style="background:${p}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-3">
        ${d.logo_url ? `<img src="${esc(d.logo_url)}" alt="" class="h-8 w-8 rounded object-cover">` : ''}
        <span class="font-bold text-lg text-white">${esc(d.business_name)}</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
        <a href="#services" class="hover:text-white transition">Services</a>
        <a href="#why-us" class="hover:text-white transition">Why Us</a>
        <a href="#reviews" class="hover:text-white transition">Reviews</a>
        <a href="#contact" class="hover:text-white transition">Contact</a>
      </nav>
      <div class="flex items-center gap-4">
        ${d.phone ? `<a href="tel:${esc(d.phone)}" class="hidden sm:flex items-center gap-2 text-white text-sm font-semibold">📞 ${esc(d.phone)}</a>` : ''}
        <a href="${esc(d.cta_url || '#contact')}" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition-all hover:scale-105" style="background:${a}">${esc(ctaText)}</a>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <section class="relative overflow-hidden" style="background:linear-gradient(135deg, ${p}08 0%, ${p}15 50%, ${a}10 100%)">
    <div class="lg:hidden relative h-[300px] sm:h-[400px]">
      <img src="${esc(heroImg)}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
    </div>
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 lg:min-h-[600px]">
        <div class="flex items-center px-4 sm:px-8 lg:px-16 py-10 lg:py-24">
          <div class="max-w-lg">
            ${d.google_rating && d.google_rating >= 4.0 ? `<div class="flex items-center gap-2 mb-6">${starsSvg(Math.round(d.google_rating), '#facc15', '#d1d5db')}<span class="text-sm font-semibold text-gray-600">${d.google_rating} stars${showReviewCount(d) ? ` · ${d.google_review_count} reviews` : ''}</span></div>` : ''}
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style="color:${p}">${esc(d.business_name)}</h1>
            ${d.tagline ? `<p class="text-xl text-gray-600 mb-8 leading-relaxed">${esc(d.tagline)}</p>` : ''}
            <div class="flex flex-col sm:flex-row gap-4 mb-10">
              <a href="${esc(d.cta_url || '#contact')}" class="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white text-lg font-semibold shadow-xl transition-all hover:scale-105" style="background:${p}">${esc(ctaText)}</a>
              ${d.phone && !(d.cta_url || '').startsWith('tel:') ? `<a href="tel:${esc(d.phone)}" class="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 text-lg font-semibold transition-all hover:bg-gray-50" style="border-color:${p};color:${p}">📞 Call Now</a>` : ''}
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-lg">🛡️</span><span class="font-medium">Licensed &amp; Insured</span></div>
              <div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-lg">⭐</span><span class="font-medium">5-Star Rated</span></div>
              <div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-lg">🏆</span><span class="font-medium">Award Winning</span></div>
              <div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-lg">✅</span><span class="font-medium">Satisfaction Guaranteed</span></div>
            </div>
          </div>
        </div>
        <div class="hidden lg:block relative">
          <img src="${esc(heroImg)}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
          <div class="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-transparent"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="py-12 text-white" style="background:${p}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div><p class="text-3xl sm:text-4xl font-bold mb-1">${d.google_review_count ? `${d.google_review_count}+` : '500+'}</p><p class="text-white/70 text-sm font-medium">Happy Clients</p></div>
        <div><p class="text-3xl sm:text-4xl font-bold mb-1">${d.google_rating ? `${d.google_rating}★` : '5★'}</p><p class="text-white/70 text-sm font-medium">Google Rating</p></div>
        <div><p class="text-3xl sm:text-4xl font-bold mb-1">10+</p><p class="text-white/70 text-sm font-medium">Years Experience</p></div>
        <div><p class="text-3xl sm:text-4xl font-bold mb-1">100%</p><p class="text-white/70 text-sm font-medium">Satisfaction</p></div>
      </div>
    </div>
  </section>

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4" style="color:${p}">${ind ? 'My Services' : 'Our Services'}</h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">Professional solutions tailored to your needs.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        ${d.services.map(s => `
        <div class="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border-t-4" style="border-color:${p}">
          <h3 class="text-xl font-bold mb-3" style="color:${p}">${esc(s.name)}</h3>
          <p class="text-gray-600 mb-4 leading-relaxed">${esc(s.description)}</p>
          ${s.price ? `<p class="font-bold text-lg" style="color:${a}">${esc(s.price)}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Reviews -->
  ${d.reviews.length > 0 ? `
  <section id="reviews" class="py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4" style="color:${p}">${ind ? 'What My Clients Say' : 'What Our Clients Say'}</h2>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${d.reviews.slice(0, 6).map(r => `
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background:${p}">${esc(r.author.charAt(0))}</div>
            <div><p class="font-semibold">${esc(r.author)}</p><div class="flex gap-0.5">${starsSvg(r.rating, '#facc15', '#d1d5db')}</div></div>
          </div>
          <p class="text-gray-600 leading-relaxed">&ldquo;${esc(r.text)}&rdquo;</p>
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact -->
  <section id="contact" class="py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16">
        <div>
          <h2 class="text-3xl font-bold mb-8" style="color:${p}">Contact Information</h2>
          <div class="space-y-4">
            ${d.address ? `<p class="flex items-start gap-3"><span>📍</span><span>${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</span></p>` : ''}
            ${d.phone ? `<p class="flex items-start gap-3"><span>📞</span><a href="tel:${esc(d.phone)}" class="hover:underline">${esc(d.phone)}</a></p>` : ''}
            ${email ? `<p class="flex items-start gap-3"><span>✉️</span><a href="mailto:${esc(email)}" class="hover:underline">${esc(email)}</a></p>` : ''}
          </div>
          ${Object.keys(d.hours).length > 0 ? `
          <h3 class="text-xl font-bold mt-8 mb-4" style="color:${p}">Business Hours</h3>
          <div class="space-y-2">${hoursHtml(d, 'font-medium', 'text-gray-600', 'flex justify-between py-2 border-b border-gray-200')}</div>` : ''}
        </div>
        <div></div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 text-white" style="background:${p}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p class="font-bold text-xl mb-2">${esc(d.business_name)}</p>
      ${d.address ? `<p class="text-white/70 text-sm">${esc(d.address)}</p>` : ''}
      ${d.phone ? `<p class="text-white/70 text-sm mt-1">${esc(d.phone)}</p>` : ''}
      <p class="text-white/30 text-xs mt-10">© ${year} ${esc(d.business_name)} · Powered by AutoLocal.ai</p>
    </div>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// CLUTCH TEMPLATE
// ═══════════════════════════════════════════════════════
function clutchTemplate(d: SiteData): string {
  const ctaText = getCtaText(d)
  const email = getEmail(d)
  const ind = isIndividual(d)
  const year = new Date().getFullYear()
  const SERVICE_ICONS = ['🔧', '⚡', '🛠️', '🏗️', '✅', '🔩', '📐', '🧰', '💡', '🏠']

  return `
<div class="min-h-screen bg-white text-gray-900">
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-3">
        ${d.logo_url ? `<img src="${esc(d.logo_url)}" alt="" class="h-9 w-9 rounded-lg object-cover">` : ''}
        <span class="font-black text-xl text-white tracking-tight">${esc(d.business_name)}</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
        ${d.services.length > 0 ? '<a href="#services" class="hover:text-white transition">Services</a>' : ''}
        <a href="#about" class="hover:text-white transition">About</a>
        ${d.reviews.length > 0 ? '<a href="#reviews" class="hover:text-white transition">Reviews</a>' : ''}
        <a href="#contact" class="hover:text-white transition">Contact</a>
      </nav>
      <a href="${esc(d.cta_url || '#contact')}" class="px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg" style="background:#f97316">${esc(ctaText)}</a>
    </div>
  </header>

  <!-- Hero -->
  <section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0">
      <img src="${esc(getHeroImg(d))}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
      <div class="absolute inset-0 bg-[#0f172a]/80"></div>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32">
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">${esc(d.business_name)}</h1>
      ${d.tagline ? `<p class="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">${esc(d.tagline)}</p>` : ''}
      <a href="${esc(d.cta_url || '#contact')}" class="inline-flex items-center justify-center px-12 py-5 rounded-lg text-white text-lg font-bold shadow-2xl transition-all hover:scale-105" style="background:#f97316">${esc(ctaText)}</a>
    </div>
  </section>

  <!-- Trust Bar -->
  <section class="bg-[#1e293b] border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-300">
      ${d.google_rating ? `<div class="flex items-center gap-2">${starsSvg(Math.round(d.google_rating), '#f97316', '#d1d5db')}<span class="font-semibold text-white">${d.google_rating}</span>${showReviewCount(d) ? `<span class="text-gray-400">(${d.google_review_count} reviews)</span>` : ''}</div>` : ''}
      <div class="flex items-center gap-2"><span class="text-lg">🏠</span><span class="font-semibold">Locally Owned</span></div>
      ${d.phone ? `<a href="tel:${esc(d.phone)}" class="flex items-center gap-2 hover:text-white transition"><span class="text-lg">📞</span><span class="font-semibold">${esc(d.phone)}</span></a>` : ''}
      ${d.city ? `<div class="flex items-center gap-2"><span class="text-lg">📍</span><span>Serving ${esc(d.city)}${d.state ? `, ${esc(d.state)}` : ''}</span></div>` : ''}
    </div>
  </section>

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <p class="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">What ${ind ? 'I' : 'We'} Do</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a]">${ind ? 'My Services' : 'Our Services'}</h2>
      </div>
      <div class="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
        ${d.services.map((s, i) => `
        <div class="border border-gray-200 rounded-xl p-6 pl-8 border-l-4 border-l-[#f97316] hover:shadow-lg transition-shadow bg-white">
          <div class="flex items-start gap-4">
            <span class="text-2xl mt-0.5">${SERVICE_ICONS[i % SERVICE_ICONS.length]}</span>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-[#0f172a] mb-1">${esc(s.name)}</h3>
              <p class="text-gray-600 leading-relaxed text-sm mb-2">${esc(s.description)}</p>
              ${s.price ? `<p class="font-bold text-[#f97316]">${esc(s.price)}</p>` : ''}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- About -->
  <section id="about" class="py-20 bg-[#f8fafc]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p class="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">${ind ? 'My Story' : 'Our Story'}</p>
          <h2 class="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a] mb-6">About ${esc(d.business_name)}</h2>
          <p class="text-gray-600 text-lg leading-relaxed">${esc(d.description || `Welcome to ${d.business_name} — proudly serving ${d.city || 'the community'}${d.state ? `, ${d.state}` : ''}.`)}</p>
        </div>
        <div>
          ${getGallery(d)[0] ? `<div class="rounded-2xl overflow-hidden aspect-[4/3] shadow-xl"><img src="${esc(getGallery(d)[0])}" alt="" class="w-full h-full object-cover"></div>` : `<div class="rounded-2xl aspect-[4/3] bg-[#0f172a] flex items-center justify-center"><span class="text-6xl opacity-30">🏢</span></div>`}
        </div>
      </div>
    </div>
  </section>

  <!-- Reviews -->
  ${d.reviews.length > 0 ? `
  <section id="reviews" class="py-20 bg-[#0f172a] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <p class="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">Testimonials</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">${ind ? 'What My Customers Say' : 'What Our Customers Say'}</h2>
      </div>
      <div class="max-w-3xl mx-auto text-center">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-10 sm:p-14 min-h-[260px] flex flex-col items-center justify-center">
          ${d.reviews.map((r, i) => `<p data-review-text class="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8 font-light" ${i > 0 ? 'style="display:none"' : ''}>&ldquo;${esc(r.text)}&rdquo;</p>
          <div data-review-stars class="flex items-center gap-3" style="${i > 0 ? 'display:none' : 'display:flex'}">${starsSvg(r.rating, '#f97316', '#d1d5db')}</div>
          <p data-review-author class="font-bold text-white mt-3" ${i > 0 ? 'style="display:none"' : ''}>${esc(r.author)}</p>`).join('')}
        </div>
        ${d.reviews.length > 1 ? `<div class="flex justify-center gap-2 mt-6">${d.reviews.map((_, i) => `<button data-review-dot data-active-class="h-2.5 w-8 rounded-full bg-[#f97316] transition-all" data-inactive-class="h-2.5 w-2.5 rounded-full bg-gray-600 transition-all" class="${i === 0 ? 'h-2.5 w-8 rounded-full bg-[#f97316] transition-all' : 'h-2.5 w-2.5 rounded-full bg-gray-600 transition-all'}"></button>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact -->
  <section id="contact" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <p class="text-sm font-bold tracking-[0.2em] uppercase text-[#f97316] mb-3">Get In Touch</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight text-[#0f172a]">Hours &amp; Contact</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        ${Object.keys(d.hours).length > 0 ? `
        <div>
          <h3 class="text-xl font-bold text-[#0f172a] mb-6">Business Hours</h3>
          <div class="border border-gray-200 rounded-xl overflow-hidden">${DAYS_ORDER.filter(day => d.hours[day]).map(day => `<div class="flex justify-between px-5 py-3 even:bg-[#f8fafc] border-b border-gray-100 last:border-0"><span class="font-semibold text-[#0f172a]">${DAY_LABELS[day]}</span><span class="text-gray-600">${esc(d.hours[day])}</span></div>`).join('')}</div>
        </div>` : ''}
        <div>
          <h3 class="text-xl font-bold text-[#0f172a] mb-6">Contact Info</h3>
          <div class="space-y-5">
            ${d.address ? `<div class="flex items-start gap-3"><span class="text-xl mt-0.5">📍</span><div><p class="font-semibold text-[#0f172a]">Address</p><p class="text-gray-600">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p></div></div>` : ''}
            ${d.phone ? `<div class="flex items-start gap-3"><span class="text-xl mt-0.5">📞</span><div><p class="font-semibold text-[#0f172a]">Phone</p><a href="tel:${esc(d.phone)}" class="text-[#f97316] font-semibold hover:underline">${esc(d.phone)}</a></div></div>` : ''}
            ${email ? `<div class="flex items-start gap-3"><span class="text-xl mt-0.5">✉️</span><div><p class="font-semibold text-[#0f172a]">Email</p><a href="mailto:${esc(email)}" class="text-[#f97316] font-semibold hover:underline">${esc(email)}</a></div></div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-[#0f172a] text-gray-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p class="text-white font-black text-xl mb-2">${esc(d.business_name)}</p>
      ${d.phone ? `<p class="text-sm">${esc(d.phone)}</p>` : ''}
      ${d.address ? `<p class="text-sm mt-1">${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p>` : ''}
      <p class="text-xs mt-8 text-gray-600">© ${year} ${esc(d.business_name)} · Powered by <span class="text-[#f97316]">AutoLocal.ai</span></p>
    </div>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// ARTIKA TEMPLATE
// ═══════════════════════════════════════════════════════
function artikaTemplate(d: SiteData): string {
  const accent = d.brand_color_accent || '#b8860b'
  const ctaText = getCtaText(d)
  const email = getEmail(d)
  const heroImg = getHeroImg(d)
  const gallery = getGallery(d)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const year = new Date().getFullYear()

  return `
<div class="min-h-screen" style="background:#faf9f6;color:#3a3a3a;font-family:'Georgia','Times New Roman',serif">
  <style>
    @keyframes artika-fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .artika-fade-up{animation:artika-fade-up 0.8s ease-out both}
    .artika-fade-up-d1{animation-delay:0.1s}
    .artika-fade-up-d2{animation-delay:0.25s}
    .artika-fade-up-d3{animation-delay:0.4s}
  </style>

  <!-- Hero -->
  <section class="relative min-h-screen flex items-center justify-center text-center">
    <div class="absolute inset-0">
      <img src="${esc(heroImg)}" alt="" class="w-full h-full object-cover" style="object-position:center ${d.hero_crop ?? 50}%">
      <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(250,249,246,0.92) 0%, rgba(250,249,246,0.7) 50%, rgba(250,249,246,0.3) 100%)"></div>
    </div>
    <div class="relative z-10 px-6 max-w-3xl mx-auto artika-fade-up">
      ${d.logo_url ? `<img src="${esc(d.logo_url)}" alt="" class="h-16 w-16 mx-auto mb-8 rounded-full object-cover">` : ''}
      <h1 class="font-extralight text-5xl sm:text-7xl lg:text-8xl tracking-tight mb-4" style="color:#2a2a2a">${esc(d.business_name)}</h1>
      ${d.tagline ? `<p class="text-xl sm:text-2xl font-light tracking-wide mb-3 artika-fade-up artika-fade-up-d1" style="color:#6b6b6b">${esc(d.tagline)}</p>` : ''}
      ${d.google_rating ? `<p class="text-sm tracking-widest uppercase mb-8 artika-fade-up artika-fade-up-d2" style="color:${accent}">★ ${d.google_rating}${showReviewCount(d) ? ` · ${d.google_review_count} reviews` : ' on Google'}</p>` : ''}
      <a href="${esc(d.cta_url || '#contact')}" class="inline-block px-10 py-4 rounded-full text-white text-base font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:scale-105 artika-fade-up artika-fade-up-d3" style="background:${accent}">${esc(ctaText)}</a>
    </div>
  </section>

  <!-- Intro -->
  <section class="py-24 px-6">
    <div class="max-w-2xl mx-auto text-center">
      <div class="w-12 h-px mx-auto mb-10" style="background:${accent}"></div>
      <p class="font-light text-xl sm:text-2xl leading-relaxed" style="color:#5a5a5a">${esc(d.description || `Welcome to ${d.business_name}${d.city ? ` in ${d.city}` : ''}${d.state ? `, ${d.state}` : ''}.`)}</p>
    </div>
  </section>

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-24 px-6">
    <div class="max-w-2xl mx-auto">
      <p class="text-center text-sm font-light tracking-[0.35em] uppercase mb-16" style="color:${accent}">Services</p>
      <div>
        ${d.services.map(s => `
        <div class="flex items-baseline gap-3 py-4 border-b" style="border-color:#e8e5df">
          <span class="text-xl sm:text-2xl font-light whitespace-nowrap" style="color:#2a2a2a">${esc(s.name)}</span>
          <span class="flex-1 border-b border-dotted" style="border-color:#d4d0c8;min-width:2rem"></span>
          ${s.price ? `<span class="text-sm font-light whitespace-nowrap" style="color:#6b6b6b">${esc(s.price)}</span>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Gallery -->
  ${gallery.length > 0 ? `
  <section class="py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <p class="text-center text-sm font-light tracking-[0.35em] uppercase mb-16" style="color:${accent}">Gallery</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3" style="grid-auto-rows:200px">
        ${gallery.map((img, i) => `<div class="overflow-hidden rounded-sm ${i === 0 ? 'row-span-2' : i === 3 ? 'col-span-2' : ''}"><img src="${esc(img)}" alt="" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Reviews -->
  ${d.reviews.length > 0 ? `
  <section id="reviews" class="py-28 px-6">
    <div class="max-w-3xl mx-auto text-center">
      ${d.reviews.map((r, i) => `<p data-review-text class="font-light italic text-3xl sm:text-4xl lg:text-5xl leading-relaxed" style="color:#3a3a3a${i > 0 ? ';display:none' : ''}">&ldquo;${esc(r.text)}&rdquo;</p>
      <p data-review-author class="mt-8 text-sm tracking-[0.3em] uppercase font-light" style="color:#8a8a8a${i > 0 ? ';display:none' : ''}">— ${esc(r.author)}</p>`).join('')}
      ${d.reviews.length > 1 ? `<div class="flex justify-center gap-2 mt-10">${d.reviews.map((_, i) => `<button data-review-dot data-active-class="w-2 h-2 rounded-full transition-all" data-inactive-class="w-1.5 h-1.5 rounded-full transition-all" class="${i === 0 ? 'w-2 h-2 rounded-full' : 'w-1.5 h-1.5 rounded-full'}" style="background:${i === 0 ? accent : '#d4d0c8'};transform:${i === 0 ? 'scale(1.5)' : 'scale(1)'}"></button>`).join('')}</div>` : ''}
    </div>
  </section>` : ''}

  <!-- Hours -->
  ${Object.keys(d.hours).length > 0 ? `
  <section class="py-24 px-6">
    <div class="max-w-md mx-auto text-center">
      <p class="text-sm font-light tracking-[0.35em] uppercase mb-12" style="color:${accent}">Hours</p>
      <div class="space-y-3">
        ${DAYS_ORDER.filter(day => d.hours[day]).map(day => `<div class="flex justify-between text-sm font-light"><span style="color:#5a5a5a">${DAY_LABELS[day]}</span><span style="color:#8a8a8a">${esc(d.hours[day])}</span></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-md mx-auto text-center">
      <p class="text-sm font-light tracking-[0.35em] uppercase mb-12" style="color:${accent}">Contact</p>
      <div class="space-y-4 text-sm font-light" style="color:#5a5a5a">
        ${d.address ? `<p>${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p>` : ''}
        ${d.phone ? `<p><a href="tel:${esc(d.phone)}" class="hover:underline" style="color:${accent}">${esc(d.phone)}</a></p>` : ''}
        ${email ? `<p><a href="mailto:${esc(email)}" class="hover:underline" style="color:${accent}">${esc(email)}</a></p>` : ''}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-16 px-6 text-center">
    <div class="w-8 h-px mx-auto mb-8" style="background:#d4d0c8"></div>
    <p class="font-extralight text-xl mb-2" style="color:#2a2a2a">${esc(d.business_name)}</p>
    <p class="text-sm tracking-widest uppercase mt-8" style="color:#b0ada6">© ${year} ${esc(d.business_name)} · Powered by AutoLocal.ai</p>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// BDE (DARK) TEMPLATE
// ═══════════════════════════════════════════════════════
function bdeTemplate(d: SiteData): string {
  const accent = d.brand_color_accent || '#6366f1'
  const ind = isIndividual(d)
  const ctaText = d.phone ? (ind ? 'Call Me' : 'Call Us') : getCtaText(d)
  const ctaHref = d.phone ? `tel:${esc(d.phone)}` : esc(d.cta_url || '#contact')
  const email = getEmail(d)
  const year = new Date().getFullYear()
  const gallery = getGallery(d)
  const accentLight = lightenHex(accent, 60)

  const stats: { value: string; label: string }[] = []
  if (d.google_rating) stats.push({ value: `${d.google_rating}★`, label: 'Google Rating' })
  if (d.google_review_count >= 20) stats.push({ value: `${d.google_review_count}+`, label: 'Reviews' })
  if (d.phone) stats.push({ value: d.phone, label: 'Call Us' })

  return `
<div class="min-h-screen bg-[#09090b] text-white">
${d.logo_url ? `<div class="absolute top-0 left-0 z-20 p-6"><img src="${esc(d.logo_url)}" alt="" class="h-12 w-12 rounded-xl object-cover" /></div>` : ''}

  <!-- Hero -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    ${d.hero_image_url ? `<img src="${esc(d.hero_image_url)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" style="object-position:center ${d.hero_crop ?? 50}%">` : ''}
    <div class="absolute inset-0 bg-gradient-to-b from-[#09090b]/30 via-[#09090b]/20 to-[#09090b]/90"></div>
    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center">
      <h1 class="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6" style="text-shadow:0 4px 20px rgba(0,0,0,0.6)">${esc(d.business_name)}</h1>
      ${d.tagline ? `<p class="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 font-normal leading-relaxed" style="text-shadow:0 2px 10px rgba(0,0,0,0.5)">${esc(d.tagline)}</p>` : ''}
      <a href="${ctaHref}" class="inline-flex items-center justify-center px-10 py-5 rounded-xl text-white text-lg font-bold shadow-lg transition-all hover:scale-105" style="background:linear-gradient(135deg,${accent},${accentLight});box-shadow:0 10px 40px -10px ${accent}40">${esc(ctaText)}</a>
    </div>
  </section>

  <!-- Stats -->
  ${stats.length > 0 ? `
  <section class="bg-[#111113] border-y border-white/5">
    <div class="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center divide-x divide-white/10">
      ${stats.map(s => `<div class="px-8 py-2 text-center"><div class="text-2xl sm:text-3xl font-black" style="background:linear-gradient(135deg,${accent},${accentLight});-webkit-background-clip:text;-webkit-text-fill-color:transparent">${esc(s.value)}</div><div class="text-xs uppercase tracking-widest text-gray-500 mt-1">${esc(s.label)}</div></div>`).join('')}
    </div>
  </section>` : ''}

  <!-- About -->
  ${d.description ? `
  <section id="about" class="py-24">
    <div class="max-w-2xl mx-auto px-6">
      <div class="h-1 w-20 rounded-full mb-8" style="background:linear-gradient(135deg,${accent},${accentLight})"></div>
      <p class="text-lg text-gray-300 leading-relaxed">${esc(d.description)}</p>
    </div>
  </section>` : ''}

  <!-- Services -->
  ${d.services.length > 0 ? `
  <section id="services" class="py-24">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-4xl sm:text-5xl font-black tracking-tight mb-16 text-center">Services</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        ${d.services.map(s => `
        <div class="group border border-white/10 rounded-2xl p-8 hover:border-white/25 transition-all bg-white/[0.02]">
          <h3 class="text-xl font-bold text-white mb-3">${esc(s.name)}</h3>
          ${s.description ? `<p class="text-gray-500 leading-relaxed mb-4">${esc(s.description)}</p>` : ''}
          ${s.price ? `<span class="text-lg font-bold" style="background:linear-gradient(135deg,${accent},${accentLight});-webkit-background-clip:text;-webkit-text-fill-color:transparent">${esc(s.price)}</span>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Gallery -->
  ${gallery.length > 0 ? `
  <section class="py-24">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-4xl sm:text-5xl font-black tracking-tight mb-16 text-center">Gallery</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${gallery.map(img => `<div class="overflow-hidden rounded-xl aspect-[4/3]"><img src="${esc(img)}" alt="" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Reviews -->
  ${d.reviews.length > 0 ? `
  <section id="reviews" class="py-24">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <div class="text-8xl font-black leading-none mb-4" style="background:linear-gradient(135deg,${accent},${accentLight});-webkit-background-clip:text;-webkit-text-fill-color:transparent">&ldquo;</div>
      ${d.reviews.map((r, i) => `<p data-review-text class="text-2xl sm:text-3xl text-white leading-relaxed font-normal mb-8" ${i > 0 ? 'style="display:none"' : ''}>${esc(r.text)}</p>
      <p data-review-author class="text-gray-500 text-sm" ${i > 0 ? 'style="display:none"' : ''}>— ${esc(r.author)}${r.date ? `, ${esc(r.date)}` : ''}</p>`).join('')}
      ${d.reviews.length > 1 ? `<div class="flex justify-center gap-2 mt-8">${d.reviews.map((_, i) => `<button data-review-dot data-active-class="h-1.5 w-8 rounded-full transition-all" data-inactive-class="h-1.5 w-3 rounded-full bg-gray-700 transition-all" class="${i === 0 ? 'h-1.5 w-8 rounded-full' : 'h-1.5 w-3 rounded-full bg-gray-700'}" ${i === 0 ? `style="background:linear-gradient(135deg,${accent},${accentLight})"` : ''}></button>`).join('')}</div>` : ''}
    </div>
  </section>` : ''}

  <!-- Contact -->
  ${(Object.keys(d.hours).length > 0 || d.phone || email || d.address) ? `
  <section id="contact" class="py-24 border-t border-white/5">
    <div class="max-w-5xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-16">
        ${Object.keys(d.hours).length > 0 ? `
        <div>
          <h3 class="text-2xl font-black mb-8">Hours</h3>
          <div class="space-y-3">
            ${DAYS_ORDER.filter(day => d.hours[day]).map(day => `<div class="flex justify-between py-2 border-b border-white/5 text-gray-400"><span>${DAY_LABELS[day]}</span><span>${esc(d.hours[day])}</span></div>`).join('')}
          </div>
        </div>` : ''}
        <div>
          <h3 class="text-2xl font-black mb-8">Contact</h3>
          <div class="space-y-4 text-gray-400">
            ${d.phone ? `<p><span class="text-gray-600 text-sm block mb-1">Phone</span><a href="tel:${esc(d.phone)}" class="text-lg font-bold" style="background:linear-gradient(135deg,${accent},${accentLight});-webkit-background-clip:text;-webkit-text-fill-color:transparent">${esc(d.phone)}</a></p>` : ''}
            ${email ? `<p><span class="text-gray-600 text-sm block mb-1">Email</span><a href="mailto:${esc(email)}" class="hover:text-white transition">${esc(email)}</a></p>` : ''}
            ${d.address ? `<p><span class="text-gray-600 text-sm block mb-1">Address</span>${esc(d.address)}${d.city ? `, ${esc(d.city)}` : ''}${d.state ? `, ${esc(d.state)}` : ''}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>` : ''}

  <!-- Footer -->
  <footer class="py-12 border-t border-white/5 text-center">
    <p class="text-white font-black text-lg">${esc(d.business_name)}</p>
    <p class="text-gray-600 text-xs mt-3">© ${year} ${esc(d.business_name)} · Powered by AutoLocal.ai</p>
  </footer>
  ${stickyContactBar(d)}
</div>`
}

// ═══════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════
const TEMPLATE_MAP: Record<string, (d: SiteData) => string> = {
  modern: bdeTemplate,
  bold: boldTemplate,
  elegant: elegantTemplate,
  professional: professionalTemplate,
  clutch: clutchTemplate,
  artika: artikaTemplate,
  bde: bdeTemplate,
}

export function generateStaticHtml(data: any, template: string): string {
  const renderFn = TEMPLATE_MAP[template] || TEMPLATE_MAP.bold
  const body = renderFn(data as SiteData)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(data.business_name)} — ${esc(data.city || '')}${data.state ? `, ${esc(data.state)}` : ''}</title>
<meta name="description" content="${esc(data.description || data.tagline || `${data.business_name} — serving ${data.city || 'the community'}`)}">
${data.logo_url ? `<link rel="icon" href="${esc(data.logo_url)}" type="image/png">` : `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">`}
<script src="https://cdn.tailwindcss.com"></script>
<style>*{scroll-behavior:smooth}body{margin:0}</style>
</head>
<body>
${body}
${reviewCarouselScript(data.reviews?.length || 0)}
</body>
</html>`
}
