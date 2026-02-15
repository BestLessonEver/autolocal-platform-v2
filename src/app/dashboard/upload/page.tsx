'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload } from 'lucide-react'

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
      <h1 className="text-2xl font-bold text-white mb-6">📸 Photo → Post</h1>
      <p className="text-slate-400 mb-8">Upload a photo and we&apos;ll generate the perfect caption in your brand voice.</p>

      <div className="space-y-6">
        {/* Upload area */}
        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${preview ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-700 hover:border-cyan-500/40'}`}>
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="font-medium text-white">Click or drag to upload a photo</p>
                <p className="text-sm text-slate-500 mt-1">JPG, PNG up to 10MB</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Description */}
        <textarea placeholder="Describe what's in the photo (optional — helps AI write a better caption)" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl dark-input resize-none" />

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={!preview || loading} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating caption...
            </span>
          ) : '✨ Generate Caption'}
        </button>

        {/* Result */}
        {caption && (
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Generated Caption</h3>
            <p className="text-slate-300 leading-relaxed">{caption}</p>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-green-500/10 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition">✅ Approve & Schedule</button>
              <button onClick={() => setCaption('')} className="px-4 py-2 bg-slate-500/10 text-slate-400 text-sm rounded-lg hover:bg-slate-500/20 transition">🔄 Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
