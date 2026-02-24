import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePreview } from '@/lib/preview-generator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key')
  return key === process.env.OUTBOUND_API_KEY
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { auditResult, additionalData } = body

    if (!auditResult?.prospect?.businessName) {
      return NextResponse.json({ error: 'Missing auditResult with prospect.businessName' }, { status: 400 })
    }

    const result = await generatePreview(auditResult, additionalData)

    return NextResponse.json({
      success: true,
      preview: result,
    })
  } catch (err: any) {
    console.error('Preview generation failed:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate preview' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Number(req.nextUrl.searchParams.get('limit')) || 20

  const { data, error } = await supabase
    .from('website_previews')
    .select('id, slug, business_name, category, city, state, status, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ previews: data })
}
