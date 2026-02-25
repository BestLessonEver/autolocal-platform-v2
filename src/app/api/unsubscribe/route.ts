import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/unsubscribe?email=foo@bar.com — shows confirmation page
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || ''

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe | AutoLocal</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0a0f; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { max-width: 440px; text-align: center; padding: 40px 24px; }
  h1 { font-size: 24px; margin-bottom: 12px; }
  p { color: #999; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  input[type=email] { padding: 12px 16px; border-radius: 8px; border: 1px solid #333; background: #1a1a2e; color: #fff; font-size: 15px; }
  button { padding: 14px; border-radius: 8px; border: none; background: #dc2626; color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; }
  button:hover { background: #b91c1c; }
  .subtle { font-size: 13px; color: #666; margin-top: 16px; }
</style></head><body>
<div class="card">
  <h1>Unsubscribe</h1>
  <p>We're sorry to see you go. Enter your email below and you won't hear from us again.</p>
  <form method="POST" action="/api/unsubscribe">
    <input type="email" name="email" value="${email}" placeholder="your@email.com" required />
    <button type="submit">Unsubscribe Me</button>
  </form>
  <p class="subtle">This will permanently remove you from all AutoLocal emails.</p>
</div>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

// POST /api/unsubscribe — processes the unsubscribe
export async function POST(req: NextRequest) {
  let email = ''

  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData()
    email = (formData.get('email') as string || '').trim().toLowerCase()
  } else {
    const body = await req.json().catch(() => ({}))
    email = (body.email || '').trim().toLowerCase()
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Store unsubscribe — upsert so duplicates don't error
  await supabase
    .from('outbound_emails')
    .update({ status: 'unsubscribed' })
    .eq('to_email', email)

  // Also try to insert into a dedicated unsubscribes list
  // This will fail silently if table doesn't exist yet — that's fine
  try {
    await supabase
      .from('unsubscribes')
      .upsert({ email, unsubscribed_at: new Date().toISOString() }, { onConflict: 'email' })
  } catch { /* table may not exist yet */ }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed | AutoLocal</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0a0f; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { max-width: 440px; text-align: center; padding: 40px 24px; }
  h1 { font-size: 24px; margin-bottom: 12px; }
  p { color: #999; font-size: 15px; line-height: 1.6; }
  .check { font-size: 48px; margin-bottom: 16px; }
</style></head><body>
<div class="card">
  <div class="check">✅</div>
  <h1>You've Been Unsubscribed</h1>
  <p><strong style="color:#fff">${email}</strong> has been removed from all future emails. You won't hear from us again.</p>
  <p style="margin-top: 24px; font-size: 13px; color: #666;">If this was a mistake, email brian@autolocal.ai and we'll re-add you.</p>
</div>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
