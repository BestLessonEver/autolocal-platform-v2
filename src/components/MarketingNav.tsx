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
          <a href="/#how-it-works" className="text-slate-400 hover:text-white transition text-sm">How It Works</a>
          <a href="/#services" className="text-slate-400 hover:text-white transition text-sm">Services</a>
          <a href="/#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</a>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <a href="/#audit-form" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white">Get Your Free Audit</a>
      </div>
      {/* Mobile */}
      <button onClick={() => setOpen(!open)} className="md:hidden text-white">
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 glass p-6 md:hidden flex flex-col gap-4">
          <a href="/#how-it-works" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>How It Works</a>
          <a href="/#services" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Services</a>
          <a href="/#pricing" className="text-slate-300 text-sm" onClick={() => setOpen(false)}>Pricing</a>
          <a href="/#audit-form" className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold text-white text-center" onClick={() => setOpen(false)}>Get Your Free Audit</a>
        </div>
      )}
    </nav>
  )
}
