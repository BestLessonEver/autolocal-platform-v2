'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import type { Post } from '@/lib/types'

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
      if (!biz) return
      const { data } = await supabase.from('posts').select('*').eq('business_id', biz.id).order('scheduled_at')
      setPosts(data || [])
    }
    load()
  }, [])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDay = startOfMonth(currentMonth).getDay()
  const selectedPosts = selectedDay ? posts.filter(p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), selectedDay)) : []

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 Content Calendar</h1>
      
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-gray-500 hover:text-gray-700 px-3 py-1">←</button>
          <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-gray-500 hover:text-gray-700 px-3 py-1">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const dayPosts = posts.filter(p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day))
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            return (
              <button key={day.toISOString()} onClick={() => setSelectedDay(day)} className={`p-2 rounded-lg text-sm text-center transition min-h-[60px] ${isSelected ? 'bg-brand-50 ring-2 ring-brand-500' : 'hover:bg-gray-50'}`}>
                <div className={`font-medium ${isSelected ? 'text-brand-600' : 'text-gray-900'}`}>{format(day, 'd')}</div>
                {dayPosts.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {dayPosts.slice(0, 3).map((p, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${p.status === 'approved' ? 'bg-green-500' : p.status === 'published' ? 'bg-brand-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{format(selectedDay, 'EEEE, MMMM d')}</h3>
          {selectedPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${post.status === 'pending' ? 'bg-amber-100 text-amber-700' : post.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{post.status}</span>
                  <p className="text-sm text-gray-800">{post.caption}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
