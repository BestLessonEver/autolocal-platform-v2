import Link from 'next/link'
import Image from 'next/image'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800/50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold gradient-text">
            <Image src="/logo.png" alt="AutoLocal.ai" width={28} height={28} className="rounded-md" />
            AutoLocal.ai
          </Link>
          <p className="text-sm text-slate-500 mt-3">AI-powered marketing audits and done-for-you fixes for local businesses.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Services</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="/#services" className="hover:text-slate-300 transition">Website Audit</a></li>
            <li><a href="/#services" className="hover:text-slate-300 transition">Review Management</a></li>
            <li><a href="/#services" className="hover:text-slate-300 transition">Social Media</a></li>
            <li><a href="/#services" className="hover:text-slate-300 transition">SEO</a></li>
            <li><a href="/#pricing" className="hover:text-slate-300 transition">New Websites</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-slate-300 transition">About</Link></li>
            <li><Link href="/blog" className="hover:text-slate-300 transition">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-slate-300 transition">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Service Areas</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/houston-tx" className="hover:text-slate-300 transition">Houston TX</Link></li>
            <li><Link href="/friendswood-tx" className="hover:text-slate-300 transition">Friendswood TX</Link></li>
            <li><Link href="/clear-lake-tx" className="hover:text-slate-300 transition">Clear Lake TX</Link></li>
            <li><Link href="/savannah-ga" className="hover:text-slate-300 transition">Savannah GA</Link></li>
            <li><Link href="/chattanooga-tn" className="hover:text-slate-300 transition">Chattanooga TN</Link></li>
            <li><Link href="/houston-tx" className="text-cyan-400 hover:text-cyan-300 transition">All Areas →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-slate-300 transition">Privacy</a></li>
            <li><a href="#" className="hover:text-slate-300 transition">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800/50 text-center text-sm text-slate-600">
        © 2026 AutoLocal.ai — All rights reserved
      </div>
    </footer>
  )
}
