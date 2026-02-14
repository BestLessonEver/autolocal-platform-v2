'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UploadPage() {
  const [businessId, setBusinessId] = useState('')
  const [description, setDescription] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
      if (data) setBusinessId(data.id)
    }
    load()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleGenerate = async () => {
    if (!businessId) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('businessId', businessId)
      formData.append('photoDescription', description || 'a business photo')
      const res = await fetch('/api/photo-to-post', { method: 'POST', body: formData })
      const data = await res.json()
      setCaption(data.caption || 'Generated caption will appear here')
    } catch {
      setCaption('Great photo! Share the story behind this moment with your community. 📸 #localbusiness')
    }
    setLoading(false)
  }

  return (
    <div className="pb-20 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📸 Photo → Post</h1>
      <p className="text-gray-600 mb-8">Upload a photo and we&apos;ll generate the perfect caption in your brand voice.</p>

      <div className="space-y-6">
        {/* Upload area */}
        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${preview ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-400'}`}>
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
            ) : (
              <>
                <div className="text-5xl mb-3">📸</div>
                <p className="font-medium text-gray-900">Click or drag to upload a photo</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 10MB</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Description */}
        <textarea placeholder="Describe what's in the photo (optional — helps AI write a better caption)" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-400 outline-none resize-none" />

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={!preview || loading} className="w-full bg-brand-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating caption...
            </span>
          ) : '✨ Generate Caption'}
        </button>

        {/* Result */}
        {caption && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Generated Caption</h3>
            <p className="text-gray-800 leading-relaxed">{caption}</p>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition">✅ Approve & Schedule</button>
              <button onClick={() => setCaption('')} className="px-4 py-2 bg-gray-50 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition">🔄 Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
