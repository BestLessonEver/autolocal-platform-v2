'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs — matching home page */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/logo.png" alt="AutoLocal.ai" width={40} height={40} className="rounded-xl" />
            <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AutoLocal.ai
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Client Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✉️</div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-gray-400">
                We sent a magic link to <span className="text-indigo-400 font-medium">{email}</span>
              </p>
              <p className="text-gray-600 text-sm">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition mt-4"
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white text-center mb-2">Sign in to your dashboard</h2>
              <p className="text-gray-500 text-center text-sm mb-6">
                Enter the email associated with your website and we&apos;ll send you a magic link.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    required
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-600 mt-6">
                No password needed — just click the link in your email.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have a website yet?{' '}
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition">
            Get one free →
          </Link>
        </p>
      </div>
    </div>
  )
}
