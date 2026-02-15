import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { blogPosts } from '@/data/blog'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) return {}
  return {
    title: `${post.title} — AutoLocal.ai`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-navy-950">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-cyan-400 hover:underline">← Back to Blog</Link>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{post.tag}</span>
          <span className="text-xs text-slate-600">{post.date}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">{post.title}</h1>

        <div
          className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_strong]:text-white [&_em]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-slate-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 glass rounded-2xl p-6">
          <p className="text-white font-semibold mb-2">Ready to see how AI can work for your business?</p>
          <p className="text-sm text-slate-400">AutoLocal.ai helps local businesses implement practical AI solutions that drive real results. <Link href="/contact" className="text-cyan-400 hover:underline">Let&apos;s talk about what&apos;s possible →</Link></p>
        </div>
      </article>

      <MarketingFooter />
    </div>
  )
}
