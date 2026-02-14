import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { STYLE_PRESETS, type StylePreset } from '@/lib/types'
import { addDays } from 'date-fns'

const CONTENT_TYPES = ['promotional', 'educational', 'behind_the_scenes', 'social_proof', 'seasonal', 'engagement']

async function generateWithAI(prompt: string): Promise<string[]> {
  // Try OpenAI if key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      return text.split('\n---\n').map((p: string) => p.trim()).filter(Boolean)
    } catch (e) {
      console.error('OpenAI error:', e)
    }
  }

  // Fallback: generate template-based posts
  return []
}

function generateFallbackPosts(bizName: string, industry: string, preset: StylePreset, services: string, count: number): string[] {
  const style = STYLE_PRESETS[preset]
  const serviceList = services.split(',').map(s => s.trim()).filter(Boolean)
  const templates = [
    `Welcome to ${bizName}! We're proud to serve our community with exceptional ${industry.toLowerCase()} services. ${style.emoji}`,
    `Why choose ${bizName}? Because we believe every client deserves the best. Come see the difference! 💪`,
    `Did you know? ${serviceList[0] || 'Our services'} can make a huge difference in your day. Book with us today! ✨`,
    `Behind the scenes at ${bizName} — another great day doing what we love! ${style.emoji}`,
    `Thank you to all our amazing clients! Your support means the world to us. ❤️`,
    `Looking for ${serviceList[1] || 'quality service'} in your area? We've got you covered! Call us today. 📞`,
    `Pro tip from ${bizName}: consistency is key! Whether it's your first visit or your hundredth, we're here for you. 🌟`,
    `Happy Monday from the ${bizName} team! Let's make this week amazing. 💫`,
    `New week, new opportunities! ${bizName} is ready to help you achieve your goals. ${style.emoji}`,
    `What our clients are saying: "Best experience ever!" Thank you for the love! ⭐⭐⭐⭐⭐`,
    `Special offer this week at ${bizName}! Don't miss out — contact us for details. 🎉`,
    `The ${bizName} difference? It's all about the personal touch. We treat every client like family. 🤝`,
    `Thinking about trying ${serviceList[0] || 'something new'}? Here are 3 reasons to start today! 👇`,
    `Another successful day at ${bizName}! We love what we do and it shows. ${style.emoji}`,
  ]
  return templates.slice(0, count)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { businessId, bizName, industry, stylePreset, services, voiceDesc, targetCustomer, count = 14, isSample } = body

  const preset = (stylePreset || 'warm_personal') as StylePreset
  const style = STYLE_PRESETS[preset]

  const prompt = `You are a social media content creator for a local business.
Business: ${bizName}
Industry: ${industry}
Services: ${services}
Target customers: ${targetCustomer || 'local community'}
Brand voice: ${style.tone}. ${voiceDesc || ''}

Generate exactly ${count} unique social media posts. Each post should be 1-3 sentences with relevant emojis and hashtags.
Mix content types: promotional, educational, behind-the-scenes, social proof, seasonal, engagement.
Separate each post with "---" on its own line. Output ONLY the posts, nothing else.`

  let posts = await generateWithAI(prompt)
  if (posts.length < count) {
    posts = generateFallbackPosts(bizName || 'Our Business', industry || 'Services', preset, services || '', count)
  }

  // If not a sample, save to database
  if (!isSample && businessId) {
    const supabase = createServerSupabaseClient()
    const now = new Date()
    const postsToInsert = posts.slice(0, count).map((caption, i) => ({
      business_id: businessId,
      caption,
      status: 'pending' as const,
      content_type: CONTENT_TYPES[i % CONTENT_TYPES.length],
      platforms: ['facebook', 'instagram'],
      scheduled_at: addDays(now, Math.floor(i / 2) + 1).toISOString(),
    }))
    await supabase.from('posts').insert(postsToInsert)
  }

  return NextResponse.json({ posts: posts.slice(0, count) })
}
