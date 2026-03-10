import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Custom Website for Local Businesses — Just $9/mo Hosting | AutoLocal.ai",
  description: "Free custom website for your local business — built from your Google reviews, photos & hours in 15 seconds. No coding, no templates. We build the whole thing. Just $9/mo hosting. Cancel anytime.",
  keywords: "free website, free website for small business, cheap website, affordable website design, local business website, small business web design, website for local business, free custom website, get a website fast, cheap web design, small business website cost, web design near me",
  metadataBase: new URL("https://autolocal.ai"),
  alternates: {
    canonical: "https://autolocal.ai",
  },
  openGraph: {
    title: "Free Custom Website for Local Businesses | AutoLocal.ai",
    description: "Free professional website for your business. Custom design with your real Google reviews. Just $9/mo hosting.",
    url: "https://autolocal.ai",
    siteName: "AutoLocal.ai",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Custom Website for Local Businesses | AutoLocal.ai",
    description: "Free professional website for your business. Custom design with your real Google reviews. Just $9/mo hosting.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Ads tag */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17996760129" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-17996760129');`,
          }}
        />
        {/* Organization + Service structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AutoLocal.ai",
              alternateName: "AutoLocal",
              description: "AutoLocal.ai builds free custom websites for local businesses using their Google Business Profile. We pull reviews, photos, hours, and contact info automatically and generate a professional website in 15 seconds. Hosting is just $9/month. No coding, no templates, no drag-and-drop — we build the entire site for you.",
              url: "https://autolocal.ai",
              telephone: "+12813937551",
              email: "brian@autolocal.ai",
              founder: {
                "@type": "Person",
                name: "Brian Carrion",
                url: "https://www.tiktok.com/@whoisbc",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Friendswood",
                addressRegion: "TX",
                addressCountry: "US",
              },
              areaServed: {
                "@type": "Country",
                name: "United States",
              },
              sameAs: [
                "https://www.tiktok.com/@whoisbc",
              ],
              priceRange: "Free - $9/mo",
              serviceType: ["Web Design", "Website Development", "AI Website Builder", "Local Business Marketing", "SEO"],
              knowsAbout: ["small business websites", "AI web design", "Google Business Profile", "local SEO", "website builder"],
              offers: {
                "@type": "Offer",
                name: "Free Custom Website",
                price: "0",
                priceCurrency: "USD",
                description: "Free custom-designed, mobile-fast website built from your Google Business Profile. Just $9/mo hosting with first month free. Cancel anytime.",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        {/* FAQ structured data for AI engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How is the website really free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AutoLocal.ai uses AI-powered design tools that build sites 10x faster than a traditional agency. You only pay $9/month for hosting — that covers servers, SSL, and support. The website design and build is completely free.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What do I need to provide to get a free website?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Just your business name. AutoLocal pulls everything else from Google — your reviews, photos, hours, and contact information. Your website is generated automatically in about 15 seconds.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I see my website before I pay?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Enter your business name on autolocal.ai and see a live custom preview in 15 seconds. It's completely free with no credit card required. You only pay if you want to keep it live.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much does hosting cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Hosting is $9 per month — cheaper than any website builder. SSL, speed optimization, and uptime are all included. First month is free. Cancel anytime with no contracts.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What if I already have a website?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AutoLocal builds the new site separately. Once you approve it, they help point your domain to the new site with zero downtime.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does AutoLocal.ai work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AutoLocal.ai works in three steps: 1) Type your business name and AutoLocal finds your Google Business Profile, pulling your reviews, photos, hours, and contact info. 2) Choose from multiple professional designs — your real content is already on the site. 3) Go live for $9/month hosting. AutoLocal handles everything — hosting, SSL, maintenance, and updates.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What types of businesses does AutoLocal.ai work for?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AutoLocal.ai works for any local business with a Google Business Profile — barbershops, restaurants, salons, auto repair shops, contractors, dentists, churches, gyms, cleaning services, landscapers, plumbers, real estate agents, pet groomers, bakeries, tattoo shops, and more.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is AutoLocal.ai better than Wix or Squarespace?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AutoLocal.ai is different. With Wix or Squarespace, you build the website yourself using templates and drag-and-drop tools, paying $200+/year. With AutoLocal, we build the entire website for you automatically from your Google profile. It's free to build and just $9/month for hosting. You don't do any work.",
                  },
                },
              ],
            }),
          }}
        />
        {/* HowTo structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to Get a Free Website with AutoLocal.ai",
              description: "Get a free custom website for your local business in 3 simple steps using AutoLocal.ai.",
              totalTime: "PT15S",
              step: [
                {
                  "@type": "HowToStep",
                  position: 1,
                  name: "Type Your Business Name",
                  text: "Go to autolocal.ai and type your business name. AutoLocal searches Google and pulls your reviews, photos, hours, and contact info automatically.",
                },
                {
                  "@type": "HowToStep",
                  position: 2,
                  name: "Preview Your Custom Website",
                  text: "See your business on a professional website with multiple design options. Your real Google reviews and photos are already displayed.",
                },
                {
                  "@type": "HowToStep",
                  position: 3,
                  name: "Go Live",
                  text: "Love your site? Go live for just $9/month hosting. AutoLocal handles hosting, SSL, maintenance, and updates. Cancel anytime.",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-navy-950`}>{children}</body>
    </html>
  );
}
