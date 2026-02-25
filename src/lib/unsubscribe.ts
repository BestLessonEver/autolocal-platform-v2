import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Check if an email address has unsubscribed.
 * Call this before sending any outbound email.
 */
export async function isUnsubscribed(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('outbound_emails')
    .select('id')
    .eq('to_email', email.trim().toLowerCase())
    .eq('status', 'unsubscribed')
    .limit(1)

  return (data?.length ?? 0) > 0
}

/**
 * Get the unsubscribe URL for a given email.
 * Include this in every outbound email footer.
 */
export function getUnsubscribeUrl(email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://autolocal.ai'
  return `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`
}
