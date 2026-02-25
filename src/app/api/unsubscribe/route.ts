import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/unsubscribe?email=xxx — shows confirmation page
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || ''

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Unsubscribe</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:60px auto;padding:20px;text-align:center;color:#333">
  <h1 style="font-size:24px">Unsubscribe</h1>
  <p style="color:#666;margin-bottom:24px">We're sorry to see you go. Enter your email below to unsubscribe from all future emails.</p>
  <form method="POST" action="/api/unsubscribe">
    <input type="email" name="email" value="${email.replace(/"/g, '&quot;')}" required
      placeholder="your@email.com"
      style="width:100%;padding:12px 16px;font-size:16px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;box-sizing:border-box" />
    <button type="submit"
      style="width:100%;padding:12px;font-size:16px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">
      Unsubscribe
    </button>
  </form>
  <p style="margin-top:24px;font-size:13px;color:#999">AutoLocal.ai · Friendswood, TX</p>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

// POST /api/unsubscribe — processes the unsubscribe
export async function POST(req: NextRequest) {
  let email = ''

  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData()
    email = (formData.get('email') as string) || ''
  } else {
    try {
      const body = await req.json()
      email = body.email || ''
    } catch {
      // ignore
    }
  }

  email = email.trim().toLowerCase()

  if (!email) {
    return new NextResponse('Email required', { status: 400 })
  }

  // Mark any outbound emails to this address as unsubscribed
  await supabase
    .from('outbound_emails')
    .update({ status: 'unsubscribed' })
    .eq('to_email', email)

  // Also insert into a dedicated list (upsert to avoid dupes)
  // Using outbound_emails table with a special record
  await supabase
    .from('outbound_emails')
    .upsert(
      {
        to_email: email,
        status: 'unsubscribed',
        subject: '__UNSUBSCRIBE__',
        from_email: 'system@autolocal.ai',
        business_name: 'UNSUBSCRIBE_REQUEST',
        template: 'unsubscribe',
      },
      { onConflict: 'to_email,subject' }
    )

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Unsubscribed</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:60px auto;padding:20px;text-align:center;color:#333">
  <h1 style="font-size:24px">✅ You've been unsubscribed</h1>
  <p style="color:#666">You won't receive any more emails from us.</p>
  <p style="color:#999;font-size:14px;margin-top:24px">If this was a mistake, email <a href="mailto:brian@autolocal.ai" style="color:#4f46e5">brian@autolocal.ai</a></p>
  <p style="margin-top:24px;font-size:13px;color:#999">AutoLocal.ai · Friendswood, TX</p>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
