import { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/data/blog'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Blog — AutoLocal.ai',
  description: 'Insights on AI, marketing, and growth strategies for local businesses.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <MarketingNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Blog</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Insights, strategies, and guides on using AI to grow your local business.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{p.tag}</span>
                <span className="text-xs text-slate-600">{p.date}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition leading-snug">{p.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{p.excerpt}</p>
              <div className="mt-4 text-sm text-cyan-400 font-medium">Read more →</div>
            </Link>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
