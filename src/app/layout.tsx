import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Custom Website for Local Businesses — Just $9/mo Hosting | AutoLocal.ai",
  description: "Get a free professional, mobile-fast website for your local business. Custom design, real Google reviews, SEO built in. $0 to build — just $9/mo hosting. Serving Friendswood, League City, Pearland & Houston TX.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AutoLocal.ai",
              description: "Free custom websites for local businesses — designed and built with AI. Just $9/mo hosting.",
              url: "https://autolocal.ai",
              telephone: "+12813937551",
              email: "brian@autolocal.ai",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Friendswood",
                addressRegion: "TX",
                addressCountry: "US",
              },
              areaServed: [
                { "@type": "City", name: "Friendswood" },
                { "@type": "City", name: "League City" },
                { "@type": "City", name: "Pearland" },
                { "@type": "City", name: "Webster" },
                { "@type": "City", name: "Clear Lake" },
                { "@type": "City", name: "Houston" },
              ],
              priceRange: "Free - $99",
              serviceType: ["Web Design", "Website Development", "Local Business Marketing", "SEO"],
              offers: {
                "@type": "Offer",
                name: "Custom Local Business Website",
                price: "0",
                priceCurrency: "USD",
                description: "Free custom-designed, mobile-fast website. Just $9/mo hosting. Premium tier with 3 revision rounds available for $99.",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-navy-950`}>{children}</body>
    </html>
  );
}
