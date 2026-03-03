'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function RedirectToIntake() {
  const params = useSearchParams()
  const router = useRouter()
  const name = params.get('name') || ''
  const city = params.get('city') || ''
  const email = params.get('email') || ''

  useEffect(() => {
    // Generate a slug from the business name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'new-business'

    const finalSlug = city
      ? `${slug}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : slug

    router.replace(`/intake/${finalSlug}?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&email=${encodeURIComponent(email)}`)
  }, [name, city, email, router])

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
}

export default function IntakeNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <RedirectToIntake />
    </Suspense>
  )
}
