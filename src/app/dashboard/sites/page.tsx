/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Site {
  id: string
  slug: string
  business_name: string
  city: string | null
  state: string | null
  template: string
  hosting_status: string | null
  hero_image_url: string | null
  created_at: string
}

export default function SitePickerPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/dashboard/my-sites')
      if (!res.ok) {
        setError('No websites found.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (Array.isArray(data) && data.length === 1) {
        // Only one site — go straight to token dashboard
        const s = data[0]
        router.push(`/my-site/${s.id.substring(0, 8)}-${s.slug}`)
        return
      }
      setSites(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">← Create a website</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Image src="/logo.png" alt="AutoLocal.ai" width={40} height={40} className="rounded-xl" />
            <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AutoLocal.ai
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2">Your Websites</h1>
          <p className="text-gray-500">Choose a site to manage</p>
        </div>

        {/* Site Cards */}
        <div className="grid gap-4">
          {sites.map(site => (
            <a
              key={site.id}
              href={`/my-site/${site.id.substring(0, 8)}-${site.slug}`}
              className="group flex items-center gap-5 bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl p-5 transition-all hover:bg-white/[0.05]"
            >
              {/* Hero thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                {site.hero_image_url ? (
                  <img src={site.hero_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌐</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition truncate">
                  {site.business_name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{site.city}{site.state ? `, ${site.state}` : ''}</span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">{site.template}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  site.hosting_status === 'active' ? 'bg-green-500/20 text-green-400' :
                  site.hosting_status === 'pending_cancel' ? 'bg-orange-500/20 text-orange-400' :
                  site.hosting_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {site.hosting_status === 'active' ? '● Live' :
                   site.hosting_status === 'pending_cancel' ? '● Cancelling' :
                   site.hosting_status === 'cancelled' ? '○ Offline' :
                   '○ Preview'}
                </span>
              </div>

              {/* Arrow */}
              <span className="text-gray-600 group-hover:text-indigo-400 transition text-lg">→</span>
            </a>
          ))}
        </div>

        {/* Create new site */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            + Create another website
          </Link>
        </div>
      </div>
    </div>
  )
}
