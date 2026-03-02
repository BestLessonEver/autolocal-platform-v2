import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Websites for Local Businesses — $99, Delivered in 24 Hours | AutoLocal.ai",
  description: "Get a professional, mobile-fast website for your local business in 24 hours. Custom design, real Google reviews, SEO built in. $99 one-time — love it or don't pay. Serving Friendswood, League City, Pearland & Houston TX.",
  keywords: "local business website, small business web design, website for local business, web design Friendswood TX, cheap website for small business, $99 website, custom website design, local business marketing",
  metadataBase: new URL("https://autolocal.ai"),
  alternates: {
    canonical: "https://autolocal.ai",
  },
  openGraph: {
    title: "Custom Websites for Local Businesses — $99 | AutoLocal.ai",
    description: "Professional website for your business in 24 hours. Custom design with your real Google reviews. Love it or don't pay.",
    url: "https://autolocal.ai",
    siteName: "AutoLocal.ai",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Websites for Local Businesses — $99 | AutoLocal.ai",
    description: "Professional website for your business in 24 hours. Custom design with your real Google reviews. Love it or don't pay.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AutoLocal.ai",
              description: "Custom websites for local businesses — designed, built, and delivered in 24 hours for $99.",
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
              priceRange: "$99",
              serviceType: ["Web Design", "Website Development", "Local Business Marketing", "SEO"],
              offers: {
                "@type": "Offer",
                name: "Custom Local Business Website",
                price: "499",
                priceCurrency: "USD",
                description: "Custom-designed, mobile-fast website delivered in 24 hours with unlimited revisions and a money-back guarantee.",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-navy-950`}>{children}</body>
    </html>
  );
}
