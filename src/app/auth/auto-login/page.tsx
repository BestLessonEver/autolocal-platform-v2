'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function AutoLoginContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const tokenHash = params.get('token')
    const next = params.get('next') || '/dashboard'

    if (!tokenHash) {
      router.replace(next)
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
      .then(({ error }) => {
        if (error) {
          console.error('Auto-login failed:', error)
          setStatus('Redirecting...')
        }
        // Small delay to ensure cookie is set
        setTimeout(() => router.replace(next), 300)
      })
      .catch(() => {
        router.replace(next)
      })
  }, [params, router])

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">{status}</p>
      </div>
    </div>
  )
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <AutoLoginContent />
    </Suspense>
  )
}
