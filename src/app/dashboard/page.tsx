'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'published' | 'rejected'>('all')
  const supabase = createClient()

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
    if (!biz) return
    let q = supabase.from('posts').select('*').eq('business_id', biz.id).order('scheduled_at', { ascending: true })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [filter])

  const updatePost = async (id: string, updates: Partial<Post>) => {
    await supabase.from('posts').update(updates).eq('id', id)
    loadPosts()
  }

  const handleApprove = (id: string) => updatePost(id, { status: 'approved' })
  const handleReject = (id: string) => updatePost(id, { status: 'rejected' })
  const handleSaveEdit = (id: string) => { updatePost(id, { caption: editCaption }); setEditingId(null) }
  const handleRate = (id: string, rating: number) => updatePost(id, { rating })

  const pendingCount = posts.filter(p => p.status === 'pending').length
  const approvedCount = posts.filter(p => p.status === 'approved').length

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="pb-20">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: pendingCount, color: 'text-amber-400', glow: 'shadow-amber-500/10' },
          { label: 'Approved', value: approvedCount, color: 'text-green-400', glow: 'shadow-green-500/10' },
          { label: 'Published', value: posts.filter(p => p.status === 'published').length, color: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
          { label: 'Total Posts', value: posts.length, color: 'text-white', glow: '' },
        ].map((s, i) => (
          <div key={i} className={`glass rounded-xl p-4 ${s.glow}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['all', 'pending', 'approved', 'published', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${filter === f ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {f} {f === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Post queue */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg font-medium text-white">No posts yet</p>
          <p className="text-sm">Posts will appear here once generated</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="glass glass-hover rounded-xl p-5 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                      post.status === 'approved' ? 'bg-green-400/10 text-green-400' :
                      post.status === 'published' ? 'bg-cyan-400/10 text-cyan-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-600">{post.content_type}</span>
                    {post.scheduled_at && (
                      <span className="text-xs text-slate-600">📅 {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>

                  {/* Caption */}
                  {editingId === post.id ? (
                    <div className="space-y-2">
                      <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg dark-input text-sm resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(post.id)} className="px-3 py-1 btn-gradient text-white text-sm rounded-lg">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-slate-500 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm leading-relaxed">{post.caption}</p>
                  )}

                  {/* Platforms */}
                  <div className="flex gap-1 mt-2">
                    {post.platforms?.map(p => (
                      <span key={p} className="text-xs bg-navy-800/50 text-slate-500 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/30">
                {post.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(post.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition">✅ Approve</button>
                    <button onClick={() => { setEditingId(post.id); setEditCaption(post.caption) }} className="flex items-center gap-1 px-3 py-1.5 bg-slate-500/10 text-slate-400 text-sm rounded-lg hover:bg-slate-500/20 transition">✏️ Edit</button>
                    <button onClick={() => handleReject(post.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition">❌ Reject</button>
                  </>
                )}
                {post.status === 'published' && !post.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 mr-2">Rate:</span>
                    {[
                      { val: 1, label: '👎' },
                      { val: 2, label: '😐' },
                      { val: 3, label: '👍' },
                      { val: 4, label: '⭐' },
                    ].map(r => (
                      <button key={r.val} onClick={() => handleRate(post.id, r.val)} className="text-lg hover:scale-125 transition">{r.label}</button>
                    ))}
                  </div>
                )}
                {post.rating && (
                  <span className="text-xs text-slate-500">Rated: {['', '👎', '😐', '👍', '⭐'][post.rating]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
