'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text">
          <Image src="/logo.png" alt="AutoLocal.ai" width={36} height={36} className="rounded-lg" />
          AutoLocal.ai
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-slate-400 hover:text-white transition text-sm">Features</a>
          <a href="/#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</a>
          <Link href="/houston-tx" className="text-slate-400 hover:text-white transition text-sm">Areas We Serve</Link>
          <Link href="/blog" className="text-slate-400 hover:text-white transition text-sm">Blog</Link>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" className="text-slate-400 hover:text-white transition text-sm">Sign In</Link>
        <Link href="/onboarding" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white">Start Free Trial</Link>
      </div>
      {/* Mobile */}
      <button onClick={() => setOpen(!open)} className="md:hidden text-white">
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 glass p-6 md:hidden flex flex-col gap-4">
          <a href="/#features" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Features</a>
          <a href="/#pricing" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Pricing</a>
          <Link href="/houston-tx" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Areas We Serve</Link>
          <Link href="/blog" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/login" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/onboarding" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white text-center" onClick={() => setOpen(false)}>Start Free Trial</Link>
        </div>
      )}
    </nav>
  )
}
