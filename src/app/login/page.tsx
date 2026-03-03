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
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-3xl font-bold gradient-text">
            <Image src="/logo.png" alt="AutoLocal.ai" width={44} height={44} className="rounded-xl" />
            AutoLocal.ai
          </Link>
          <p className="text-slate-400 mt-2">Client Dashboard</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✉️</div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-slate-400">
                We sent a magic link to <span className="text-cyan-400 font-medium">{email}</span>
              </p>
              <p className="text-slate-500 text-sm">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition mt-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white text-center mb-2">Sign in to your dashboard</h2>
              <p className="text-slate-400 text-center text-sm mb-6">
                Enter the email associated with your website and we&apos;ll send you a magic link.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl dark-input text-white placeholder-slate-500"
                    required
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-6">
                No password needed — just click the link in your email.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don&apos;t have a website yet?{' '}
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            Get one for $99
          </Link>
        </p>
      </div>
    </div>
  )
}
