/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { runOutboundCampaign, getRecentOutbound } from '@/lib/outbound-engine'

function authorize(req: NextRequest): boolean {
  const key = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('api_key')
  const expected = process.env.OUTBOUND_API_KEY
  if (!expected) return false
  return key === expected
}

/**
 * POST /api/outbound — Trigger an outbound campaign
 * Body: { city, state, categories?, limit?, dryRun? }
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { city, state, categories, limit = 10, dryRun = true } = body

    if (!city || !state) {
      return NextResponse.json({ error: 'city and state are required' }, { status: 400 })
    }

    const result = await runOutboundCampaign(city, state, categories, limit, dryRun)

    return NextResponse.json({
      success: true,
      campaign: {
        city: result.city,
        state: result.state,
        prospectsFound: result.prospectsFound,
        auditsRun: result.auditsRun,
        emailsSent: result.emailsSent,
        emailsFailed: result.emailsFailed,
      },
    })
  } catch (err: any) {
    console.error('Outbound campaign error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/outbound — List recent outbound activity
 * Query: ?limit=50
 */
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 50
    const emails = await getRecentOutbound(limit)
    return NextResponse.json({ success: true, count: emails.length, emails })
  } catch (err: any) {
    console.error('Outbound list error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
