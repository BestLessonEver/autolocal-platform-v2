import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoLocal.ai — Agentic Marketing for Local Businesses",
  description: "AI-powered social media marketing for local businesses. Auto-generate posts, manage approvals, and publish everywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-navy-950`}>{children}</body>
    </html>
  );
}
