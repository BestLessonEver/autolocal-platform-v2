import { type AuditResult } from './audit-engine'

export type ApproachType = 'website' | 'reviews' | 'social' | 'competitor'

export interface SalesApproach {
  type: ApproachType
  headline: string
  hook: string
  painPoints: string[]
  solution: string
  package: string
  packagePrice: string
  urgency: string
}

export function selectApproach(audit: AuditResult): SalesApproach {
  const { prospect, website, googleBusiness, socialMedia, competitors } = audit

  // Score each category 0-100
  const websiteScore = !website.exists ? 0 : (
    (website.hasSsl ? 20 : 0) +
    ((website.loadTimeMs ?? 8000) < 3000 ? 30 : (website.loadTimeMs ?? 8000) < 5000 ? 15 : 0) +
    ((website.mobileScore ?? 0) > 60 ? 25 : (website.mobileScore ?? 0) > 30 ? 10 : 0) +
    (website.hasContactForm ? 15 : 0) +
    (website.issues.length < 3 ? 10 : 0)
  )

  const reviewScore = (
    (googleBusiness.reviewCount > 100 ? 30 : googleBusiness.reviewCount > 50 ? 20 : googleBusiness.reviewCount > 20 ? 10 : 0) +
    ((googleBusiness.rating ?? 0) >= 4.5 ? 30 : (googleBusiness.rating ?? 0) >= 4.0 ? 20 : (googleBusiness.rating ?? 0) >= 3.5 ? 10 : 0) +
    ((googleBusiness.responseRate ?? 0) > 50 ? 20 : (googleBusiness.responseRate ?? 0) > 20 ? 10 : 0) +
    (googleBusiness.hasDescription ? 10 : 0) +
    (googleBusiness.hasPhotos ? 10 : 0)
  )

  const activePlatforms = socialMedia.platforms.filter(p => p.found).length
  const socialScore = (
    (activePlatforms >= 4 ? 30 : activePlatforms >= 2 ? 15 : 0) +
    (socialMedia.platforms.some(p => p.postFrequency && !p.postFrequency.includes('inactive')) ? 40 : 0) +
    (socialMedia.platforms.some(p => (p.followerCount ?? 0) > 500) ? 30 : 0)
  )

  const topCompetitor = competitors[0]
  const competitorScore = (
    (googleBusiness.reviewCount >= (topCompetitor?.reviewCount ?? 0) * 0.5 ? 30 : 0) +
    ((googleBusiness.rating ?? 0) >= (topCompetitor?.rating ?? 0) - 0.3 ? 30 : 0) +
    (website.exists ? 20 : 0) +
    (activePlatforms >= 2 ? 20 : 0)
  )

  const scores: { type: ApproachType; score: number }[] = [
    { type: 'website', score: websiteScore },
    { type: 'reviews', score: reviewScore },
    { type: 'social', score: socialScore },
    { type: 'competitor', score: competitorScore },
  ]

  const weakest = scores.sort((a, b) => a.score - b.score)[0]

  switch (weakest.type) {
    case 'website':
      return {
        type: 'website',
        headline: `${prospect.businessName}: Your website is costing you customers`,
        hook: !website.exists
          ? `${prospect.businessName} doesn't have a website. 46% of all Google searches are local — and you're invisible to every single one.`
          : `Your website takes ${((website.loadTimeMs ?? 8000) / 1000).toFixed(1)} seconds to load. 53% of mobile visitors leave after 3 seconds. That's potential customers walking straight to your competitor.`,
        painPoints: [
          ...(website.exists ? [] : ['No website — invisible to 46% of local searches']),
          ...((website.loadTimeMs ?? 0) > 3000 ? [`${((website.loadTimeMs ?? 0) / 1000).toFixed(1)}s load time (should be under 3s)`] : []),
          ...(!website.hasSsl && website.exists ? ['"Not Secure" warning in Chrome — instant trust killer'] : []),
          ...(!website.hasContactForm && website.exists ? ['No contact form — making it hard for customers to reach you'] : []),
          ...(website.issues.slice(0, 2)),
        ].slice(0, 4),
        solution: website.exists
          ? 'We\'ll optimize your website for speed, mobile, and SEO — or build you a brand new one that actually converts.'
          : 'We\'ll build you a modern, fast, mobile-first website in 3-5 days. SEO-optimized and designed to convert visitors into customers.',
        package: website.exists ? 'digital_cleanup' : 'new_website',
        packagePrice: website.exists ? '$999' : '$3,499',
        urgency: `Every day your ${!website.exists ? 'business goes without a website' : `site loads in ${((website.loadTimeMs ?? 8000) / 1000).toFixed(1)} seconds`}, you lose potential customers to competitors who show up faster.`,
      }

    case 'reviews':
      return {
        type: 'reviews',
        headline: topCompetitor
          ? `${prospect.businessName}: ${topCompetitor.name} has ${Math.round((topCompetitor.reviewCount) / Math.max(googleBusiness.reviewCount, 1))}x more reviews than you`
          : `${prospect.businessName}: Your Google reviews need serious help`,
        hook: topCompetitor
          ? `You have ${googleBusiness.reviewCount} Google reviews at ${googleBusiness.rating ?? 'N/A'} stars. ${topCompetitor.name} has ${topCompetitor.reviewCount} reviews at ${topCompetitor.rating} stars. When someone searches "${prospect.category ?? 'your service'} near me," who do you think they call?`
          : `With only ${googleBusiness.reviewCount} Google reviews, you're nearly invisible in local search. Businesses with 100+ reviews get 3x more clicks.`,
        painPoints: [
          `Only ${googleBusiness.reviewCount} reviews (competitors average ${topCompetitor?.reviewCount ?? '100+'}`,
          ...((googleBusiness.rating ?? 5) < 4.0 ? [`${googleBusiness.rating}-star rating is below the 4.0 threshold where customers start filtering`] : []),
          ...((googleBusiness.responseRate ?? 0) < 30 ? [`Only ${googleBusiness.responseRate ?? 0}% of reviews have owner responses — customers notice`] : []),
          ...(!googleBusiness.hasPhotos ? ['No photos on Google Business listing'] : []),
          ...(!googleBusiness.hasDescription ? ['Missing business description on Google'] : []),
        ].slice(0, 4),
        solution: 'We\'ll implement a review generation system, respond to every existing review, and optimize your Google Business listing to outrank competitors.',
        package: 'digital_cleanup',
        packagePrice: '$999',
        urgency: `${topCompetitor ? `${topCompetitor.name} gains new reviews every month.` : 'Your competitors are gaining reviews every month.'} The gap is growing. Every week you wait, it gets harder to catch up.`,
      }

    case 'social':
      const deadPlatforms = socialMedia.platforms.filter(p => !p.found || p.postFrequency?.includes('inactive'))
      const lastPost = socialMedia.platforms.find(p => p.lastPostDate)?.lastPostDate
      return {
        type: 'social',
        headline: lastPost
          ? `${prospect.businessName}: Your social media has been dead since ${new Date(lastPost).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          : `${prospect.businessName}: You're missing from ${deadPlatforms.length} social platforms`,
        hook: lastPost
          ? `Your last social media post was ${new Date(lastPost).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. That's ${Math.round((Date.now() - new Date(lastPost).getTime()) / (1000 * 60 * 60 * 24 * 30))} months of silence. Meanwhile, your competitors are posting multiple times per week and staying top of mind with YOUR potential customers.`
          : `${prospect.businessName} is missing from ${deadPlatforms.length} major social platforms where your customers spend 2+ hours daily. Your competitors? They're there, posting regularly, building the relationships you're missing.`,
        painPoints: [
          ...(lastPost ? [`No posts since ${new Date(lastPost).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`] : ['No active social media presence']),
          `Missing from ${deadPlatforms.length} platforms`,
          ...(topCompetitor ? [`Competitor posts ${topCompetitor.advantage || 'regularly'}`] : []),
          'Zero social discovery from customers under 40',
        ].slice(0, 4),
        solution: 'We\'ll take over your social media and post 5x/week starting tomorrow. AI-generated content in your brand voice, scheduled across all your platforms.',
        package: 'social_revive',
        packagePrice: '$499',
        urgency: `It's been ${lastPost ? Math.round((Date.now() - new Date(lastPost).getTime()) / (1000 * 60 * 60 * 24 * 30)) + ' months' : 'too long'} since your last post. Your audience has forgotten you. Every day of silence is a day your competitors build the relationships you're missing.`,
      }

    case 'competitor':
    default:
      const losses = [
        ...(googleBusiness.reviewCount < (topCompetitor?.reviewCount ?? 0) ? ['reviews'] : []),
        ...(!website.exists || (website.loadTimeMs ?? 0) > 5000 ? ['website'] : []),
        ...(activePlatforms < 2 ? ['social media'] : []),
      ]
      return {
        type: 'competitor',
        headline: topCompetitor
          ? `${prospect.businessName}: ${topCompetitor.name} is beating you in ${losses.length} out of 4 categories`
          : `${prospect.businessName}: Your competitors are pulling ahead`,
        hook: topCompetitor
          ? `We compared ${prospect.businessName} against ${topCompetitor.name} and ${competitors.length - 1} other competitors in ${prospect.city}. They're beating you in ${losses.join(', ')}. Here's the specific gap — and how to close it.`
          : `Your competitors in ${prospect.city} are outpacing you in ${losses.join(', ')}. The gap is growing every month.`,
        painPoints: [
          ...(topCompetitor ? [`${topCompetitor.name}: ${topCompetitor.reviewCount} reviews at ${topCompetitor.rating} stars vs your ${googleBusiness.reviewCount} at ${googleBusiness.rating}`] : []),
          ...losses.map(l => `Falling behind on ${l}`),
          `Losing an estimated $${audit.estimatedRevenueLoss.monthly.toLocaleString()}/month`,
        ].slice(0, 4),
        solution: 'We\'ll close the gap across your entire digital presence — website, reviews, social, and SEO. The full transformation.',
        package: 'growth_engine',
        packagePrice: '$1,999',
        urgency: `${topCompetitor ? `${topCompetitor.name} isn't slowing down.` : 'Your competitors aren\'t slowing down.'} Every week you wait, they pull further ahead. The cost of inaction compounds.`,
      }
  }
}
