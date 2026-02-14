import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { STYLE_PRESETS, type StylePreset } from '@/lib/types'

export async function POST(request: Request) {
  const formData = await request.formData()
  const businessId = formData.get('businessId') as string
  const photoDescription = formData.get('photoDescription') as string || 'a business photo'
  
  const supabase = createServerSupabaseClient()
  
  // Get business info
  const { data: business } = await supabase.from('businesses').select('*').eq('id', businessId).single()
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const style = STYLE_PRESETS[business.style_preset as StylePreset]

  let caption = ''
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Write a social media caption for ${business.name} (${business.industry}).
Photo shows: ${photoDescription}
Brand voice: ${style.tone}
Include relevant emojis and 3-5 hashtags. 1-3 sentences max.`
          }],
        }),
      })
      const data = await res.json()
      caption = data.choices?.[0]?.message?.content || ''
    } catch (e) {
      console.error('OpenAI error:', e)
    }
  }

  if (!caption) {
    caption = `Another great moment at ${business.name}! ${style.emoji} We love sharing what we do with our amazing community. #${business.name?.replace(/\s/g, '')} #local #${business.industry?.replace(/\s/g, '').toLowerCase()}`
  }

  // Save as pending post
  const { data: post } = await supabase.from('posts').insert({
    business_id: businessId,
    caption,
    status: 'pending',
    content_type: 'photo',
    photo_upload: true,
    platforms: ['facebook', 'instagram'],
  }).select().single()

  return NextResponse.json({ post, caption })
}
