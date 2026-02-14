'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Queue', icon: '📋' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: '📅' },
  { href: '/dashboard/upload', label: 'Upload', icon: '📸' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-gradient">AutoLocal.ai</Link>
            {bizName && <span className="hidden sm:inline text-sm text-gray-500">• {bizName}</span>}
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 sm:hidden z-50">
        <div className="flex justify-around py-2">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center py-1 px-3 text-xs ${pathname === n.href ? 'text-brand-500' : 'text-gray-500'}`}>
              <span className="text-xl mb-0.5">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop nav */}
      <nav className="hidden sm:flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="max-w-7xl mx-auto flex justify-center gap-2 py-3">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${pathname === n.href ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-100'}`}>
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
