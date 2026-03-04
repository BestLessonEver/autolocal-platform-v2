/**
 * Internal API authentication helper.
 * Requires INTERNAL_API_KEY env var — no fallback.
 * Rejects all requests if the key is not configured.
 */
export function validateInternalAuth(req: Request): { ok: true } | { ok: false; status: number; message: string } {
  const key = process.env.INTERNAL_API_KEY
  if (!key) {
    console.error('[auth] INTERNAL_API_KEY is not set — rejecting request')
    return { ok: false, status: 503, message: 'Internal API not configured' }
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token !== key) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  return { ok: true }
}

/**
 * Returns the Bearer token header for internal API calls.
 * Throws if INTERNAL_API_KEY is not set (fail loud, not silent).
 */
export function internalAuthHeader(): string {
  const key = process.env.INTERNAL_API_KEY
  if (!key) {
    throw new Error('INTERNAL_API_KEY is not set — cannot make internal API call')
  }
  return `Bearer ${key}`
}
