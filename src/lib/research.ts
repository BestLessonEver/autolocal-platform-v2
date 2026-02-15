import * as cheerio from 'cheerio';

export interface ResearchResult {
  businessName: string;
  website?: {
    title: string;
    description: string;
    logoUrl?: string;
    colors: string[];
    socialLinks: string[];
    services: string[];
    content: string;
  };
  socialProfiles: {
    platform: string;
    url: string;
    found: boolean;
  }[];
  scrapedAt: string;
}

const SOCIAL_PLATFORMS = [
  { platform: 'facebook', pattern: 'facebook.com' },
  { platform: 'instagram', pattern: 'instagram.com' },
  { platform: 'twitter', pattern: 'twitter.com' },
  { platform: 'x', pattern: 'x.com' },
  { platform: 'linkedin', pattern: 'linkedin.com' },
  { platform: 'youtube', pattern: 'youtube.com' },
  { platform: 'tiktok', pattern: 'tiktok.com' },
  { platform: 'yelp', pattern: 'yelp.com' },
  { platform: 'nextdoor', pattern: 'nextdoor.com' },
];

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

async function scrapeWebsite(url: string): Promise<ResearchResult['website'] | undefined> {
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const res = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AutoLocal/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return undefined;

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') || '';

    let logoUrl: string | undefined;
    const logoSelectors = [
      'img[alt*="logo" i]', 'img[class*="logo" i]', 'img[src*="logo" i]',
      'header img', 'link[rel="apple-touch-icon"]',
    ];
    for (const sel of logoSelectors) {
      const el = $(sel).first();
      const src = el.attr('src') || el.attr('href');
      if (src) { logoUrl = resolveUrl(src, normalizedUrl); break; }
    }
    if (!logoUrl) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) logoUrl = resolveUrl(ogImage, normalizedUrl);
    }

    const colors: string[] = [];
    const colorRegex = /#([0-9a-fA-F]{3,8})\b/g;
    const genericColors = new Set(['#fff', '#ffffff', '#000', '#000000', '#333', '#333333', '#666', '#666666', '#999', '#ccc', '#eee', '#f5f5f5', '#fafafa']);

    $('style').each((_, el) => {
      const css = $(el).html() || '';
      let match;
      while ((match = colorRegex.exec(css)) !== null) {
        const hex = `#${match[1]}`.toLowerCase();
        if ((match[1].length === 3 || match[1].length === 6) && !genericColors.has(hex)) {
          colors.push(hex);
        }
      }
    });
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      let match;
      const re = /#([0-9a-fA-F]{3,8})\b/g;
      while ((match = re.exec(style)) !== null) {
        const hex = `#${match[1]}`.toLowerCase();
        if ((match[1].length === 3 || match[1].length === 6) && !genericColors.has(hex)) {
          colors.push(hex);
        }
      }
    });
    const themeColor = $('meta[name="theme-color"]').attr('content');
    if (themeColor) colors.push(themeColor);
    const uniqueColors = Array.from(new Set(colors)).slice(0, 8);

    const socialLinks: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      for (const { pattern } of SOCIAL_PLATFORMS) {
        if (href.includes(pattern)) {
          socialLinks.push(href);
          break;
        }
      }
    });
    const uniqueSocialLinks = Array.from(new Set(socialLinks));

    const services: string[] = [];
    const serviceKeywords = /service|offer|what we do|our programs|our classes/i;
    $('h1, h2, h3, h4').each((_, el) => {
      const heading = $(el).text();
      if (serviceKeywords.test(heading)) {
        $(el).nextAll('ul, ol').first().find('li').each((_, li) => {
          const text = $(li).text().trim();
          if (text && text.length < 200) services.push(text);
        });
        $(el).nextAll('p').slice(0, 3).each((_, p) => {
          const text = $(p).text().trim();
          if (text && text.length < 200) services.push(text);
        });
      }
    });

    $('script, style, nav, footer, header, iframe, noscript').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    return {
      title,
      description,
      logoUrl,
      colors: uniqueColors,
      socialLinks: uniqueSocialLinks,
      services: services.slice(0, 20),
      content,
    };
  } catch {
    return undefined;
  }
}

function buildSocialProfiles(businessName: string, foundLinks: string[]): ResearchResult['socialProfiles'] {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const profiles: ResearchResult['socialProfiles'] = [];

  for (const { platform, pattern } of SOCIAL_PLATFORMS) {
    const found = foundLinks.find(l => l.includes(pattern));
    profiles.push({
      platform,
      url: found || `https://${pattern}/${slug}`,
      found: !!found,
    });
  }

  return profiles;
}

export async function researchBusiness(params: {
  businessName: string;
  website?: string;
  location?: string;
  businessType?: string;
}): Promise<ResearchResult> {
  let websiteData: ResearchResult['website'] | undefined;
  let foundSocialLinks: string[] = [];

  if (params.website) {
    websiteData = await scrapeWebsite(params.website);
    if (websiteData) {
      foundSocialLinks = websiteData.socialLinks;
    }
  }

  const socialProfiles = buildSocialProfiles(params.businessName, foundSocialLinks);

  return {
    businessName: params.businessName,
    website: websiteData,
    socialProfiles,
    scrapedAt: new Date().toISOString(),
  };
}
