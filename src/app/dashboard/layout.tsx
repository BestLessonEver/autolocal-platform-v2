'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { ClipboardList, Calendar, Camera, Settings, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Queue', icon: ClipboardList },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/upload', label: 'Upload', icon: Camera },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [bizName, setBizName] = useState('')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('businesses').select('name').eq('user_id', user.id).single()
      if (data) setBizName(data.name)
    }
    check()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Top bar */}
      <header className="glass border-x-0 border-t-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold gradient-text">AutoLocal.ai</Link>
            {bizName && <span className="hidden sm:inline text-sm text-slate-500">• {bizName}</span>}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-x-0 border-b-0 sm:hidden z-50">
        <div className="flex justify-around py-2">
          {NAV.map(n => {
            const active = pathname === n.href
            return (
              <Link key={n.href} href={n.href} className={`flex flex-col items-center py-1 px-3 text-xs transition ${active ? 'text-cyan-400' : 'text-slate-500'}`}>
                <n.icon className="w-5 h-5 mb-0.5" />
                {n.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop nav */}
      <nav className="hidden sm:flex fixed bottom-0 left-0 right-0 glass border-x-0 border-b-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-center gap-2 py-3">
          {NAV.map(n => {
            const active = pathname === n.href
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50'}`}>
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
