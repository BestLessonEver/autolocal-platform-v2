/**
 * AutoLocal.ai — Outbound Email Engine
 *
 * Orchestrates: prospect finding → audit → approach selection → email personalization → send via Resend
 *
 * SQL Schema for Supabase `outbound_emails` table:
 * -------------------------------------------------
 * CREATE TABLE outbound_emails (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   audit_id uuid REFERENCES audits(id),
 *   business_name text NOT NULL,
 *   recipient_email text NOT NULL,
 *   subject text,
 *   approach_type text,
 *   status text DEFAULT 'pending',  -- pending, sent, failed, bounced
 *   sent_at timestamp,
 *   opened_at timestamp,
 *   clicked_at timestamp,
 *   report_viewed_at timestamp,
 *   converted boolean DEFAULT false,
 *   follow_up_day integer,          -- null for initial, 3 or 7 for follow-ups
 *   parent_email_id uuid,           -- null for initial, references parent for follow-ups
 *   scheduled_for timestamp,
 *   error_message text,
 *   created_at timestamp DEFAULT now()
 * );
 *
 * CREATE INDEX idx_outbound_status ON outbound_emails(status);
 * CREATE INDEX idx_outbound_scheduled ON outbound_emails(scheduled_for) WHERE status = 'pending';
 */

import { createClient } from '@supabase/supabase-js'
import { findProspects } from './prospect-finder'
import { runAudit, type AuditResult } from './audit-engine'
import { selectApproach, type SalesApproach } from './approach-selector'
import { buildOutboundEmail } from './outbound-templates'

// ============================================================
// Config
// ============================================================

const RATE_LIMIT_PER_HOUR = 10
const RESEND_API_URL = 'https://api.resend.com/emails'

function getResendApiKey(): string {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    const secrets = JSON.parse(fs.readFileSync(
      process.env.RESEND_SECRETS_PATH || '/Users/ble/.openclaw/workspace/.secrets/resend.json',
      'utf-8'
    ))
    return secrets.resend_api_key
  } catch {
    throw new Error('RESEND_API_KEY not found in env or secrets file')
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

// ============================================================
// Rate Limiter (in-memory, resets on restart)
// ============================================================

const sendLog: number[] = []

function checkRateLimit(): boolean {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  // Prune old entries
  while (sendLog.length > 0 && sendLog[0] < oneHourAgo) sendLog.shift()
  return sendLog.length < RATE_LIMIT_PER_HOUR
}

function recordSend(): void {
  sendLog.push(Date.now())
}

// ============================================================
// Core: Send via Resend API
// ============================================================

interface ResendResponse {
  id?: string
  error?: { message: string; statusCode: number }
}

async function sendViaResend(email: {
  to: string
  from: string
  subject: string
  text: string
  html: string
}): Promise<ResendResponse> {
  const apiKey = getResendApiKey()

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { error: { message: data.message || 'Unknown error', statusCode: res.status } }
  }
  return { id: data.id }
}

// ============================================================
// Store Audit in Supabase
// ============================================================

async function storeAudit(audit: AuditResult): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('audits')
    .insert({
      business_name: audit.prospect.businessName,
      city: audit.prospect.city,
      state: audit.prospect.state,
      category: audit.prospect.category,
      website_url: audit.prospect.website,
      google_place_id: audit.prospect.placeId,
      overall_score: audit.overallScore,
      data: audit,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to store audit: ${error.message}`)
  return data.id
}

// ============================================================
// Store Outbound Email Record
// ============================================================

async function storeOutboundEmail(record: {
  auditId: string
  businessName: string
  recipientEmail: string
  subject: string
  approachType: string
  status: string
  sentAt?: string
  errorMessage?: string
  followUpDay?: number
  parentEmailId?: string
  scheduledFor?: string
}): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('outbound_emails')
    .insert({
      audit_id: record.auditId,
      business_name: record.businessName,
      recipient_email: record.recipientEmail,
      subject: record.subject,
      approach_type: record.approachType,
      status: record.status,
      sent_at: record.sentAt,
      error_message: record.errorMessage,
      follow_up_day: record.followUpDay,
      parent_email_id: record.parentEmailId,
      scheduled_for: record.scheduledFor,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to store outbound email: ${error.message}`)
  return data.id
}

// ============================================================
// Send Audit Email
// ============================================================

export interface SendResult {
  success: boolean
  emailId?: string
  resendId?: string
  error?: string
  audit: AuditResult
  approach: SalesApproach
}

export async function sendAuditEmail(
  audit: AuditResult,
  approach: SalesApproach,
  recipientEmail: string,
  ownerName?: string,
  dryRun = false
): Promise<SendResult> {
  // Build the email
  const email = buildOutboundEmail(audit, approach, recipientEmail, ownerName)

  // Store audit if not already stored
  if (!audit.id) {
    try {
      audit.id = await storeAudit(audit)
    } catch (err) {
      console.warn('Could not store audit in Supabase:', err)
      audit.id = `local-${Date.now()}`
    }
  }

  // Update report URL with real audit ID
  email.text = email.text.replace(/\/audit\/preview/g, `/audit/${audit.id}`)
  email.html = email.html.replace(/\/audit\/preview/g, `/audit/${audit.id}`)

  if (dryRun) {
    console.log(`[DRY RUN] Would send to ${recipientEmail}: "${email.subject}"`)
    return { success: true, audit, approach }
  }

  // Rate limit check
  if (!checkRateLimit()) {
    const msg = `Rate limit reached (${RATE_LIMIT_PER_HOUR}/hour). Try again later.`
    await storeOutboundEmail({
      auditId: audit.id,
      businessName: audit.prospect.businessName,
      recipientEmail,
      subject: email.subject,
      approachType: approach.type,
      status: 'pending',
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }).catch(() => {})
    return { success: false, error: msg, audit, approach }
  }

  // Send
  const result = await sendViaResend(email)

  if (result.error) {
    await storeOutboundEmail({
      auditId: audit.id,
      businessName: audit.prospect.businessName,
      recipientEmail,
      subject: email.subject,
      approachType: approach.type,
      status: 'failed',
      errorMessage: result.error.message,
    }).catch(() => {})
    return { success: false, error: result.error.message, audit, approach }
  }

  recordSend()

  // Store success
  const emailId = await storeOutboundEmail({
    auditId: audit.id,
    businessName: audit.prospect.businessName,
    recipientEmail,
    subject: email.subject,
    approachType: approach.type,
    status: 'sent',
    sentAt: new Date().toISOString(),
  }).catch(() => undefined)

  // Schedule follow-ups
  if (emailId) {
    await scheduleFollowUps(audit.id, recipientEmail, emailId).catch(() => {})
  }

  // Mark audit as email_sent
  try {
    const supabase = getSupabase()
    await supabase.from('audits').update({
      email_sent: true,
      email_sent_at: new Date().toISOString(),
    }).eq('id', audit.id)
  } catch {}

  return {
    success: true,
    emailId,
    resendId: result.id,
    audit,
    approach,
  }
}

// ============================================================
// Schedule Follow-Ups (Day 3, Day 7)
// ============================================================

export async function scheduleFollowUps(
  auditId: string,
  recipientEmail: string,
  parentEmailId: string
): Promise<void> {
  const supabase = getSupabase()
  const now = Date.now()

  const followUps = [
    { day: 3, scheduledFor: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString() },
    { day: 7, scheduledFor: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString() },
  ]

  for (const fu of followUps) {
    await supabase.from('outbound_emails').insert({
      audit_id: auditId,
      business_name: '', // Will be filled when sent
      recipient_email: recipientEmail,
      subject: '', // Will be filled when sent
      approach_type: 'follow_up',
      status: 'pending',
      follow_up_day: fu.day,
      parent_email_id: parentEmailId,
      scheduled_for: fu.scheduledFor,
    })
  }
}

// ============================================================
// Campaign Runner
// ============================================================

export interface CampaignResult {
  city: string
  state: string
  categories: string[]
  prospectsFound: number
  auditsRun: number
  emailsSent: number
  emailsFailed: number
  results: SendResult[]
}

export async function runOutboundCampaign(
  city: string,
  state: string,
  categories?: string[],
  limit = 10,
  dryRun = false
): Promise<CampaignResult> {
  console.log(`\n🚀 Starting outbound campaign: ${city}, ${state}`)
  console.log(`   Categories: ${categories?.join(', ') || 'all'}`)
  console.log(`   Limit: ${limit} | Dry run: ${dryRun}\n`)

  // 1. Find prospects
  const prospects = await findProspects({ city, state, categories, limit })
  console.log(`📋 Found ${prospects.length} prospects`)

  const campaignResult: CampaignResult = {
    city,
    state,
    categories: categories || [],
    prospectsFound: prospects.length,
    auditsRun: 0,
    emailsSent: 0,
    emailsFailed: 0,
    results: [],
  }

  // 2. For each prospect: audit → approach → email
  for (const prospect of prospects) {
    console.log(`\n--- ${prospect.businessName} (${prospect.category}) ---`)

    // Rate limit check before doing work
    if (!dryRun && !checkRateLimit()) {
      console.log('⏸️  Rate limit reached. Stopping campaign.')
      break
    }

    try {
      // Run audit
      console.log('  🔍 Running audit...')
      const audit = await runAudit(prospect)
      campaignResult.auditsRun++
      console.log(`  📊 Score: ${audit.overallScore}/100`)

      // Select approach
      const approach = selectApproach(audit)
      console.log(`  🎯 Approach: ${approach.type} — "${approach.headline}"`)

      // Generate a fake email for the prospect (in real usage, you'd have real emails)
      const recipientEmail = prospect.phone
        ? `contact@${prospect.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        : `info@${prospect.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

      // Send
      const result = await sendAuditEmail(audit, approach, recipientEmail, undefined, dryRun)
      campaignResult.results.push(result)

      if (result.success) {
        campaignResult.emailsSent++
        console.log(`  ✅ ${dryRun ? '[DRY RUN] ' : ''}Email sent to ${recipientEmail}`)
      } else {
        campaignResult.emailsFailed++
        console.log(`  ❌ Failed: ${result.error}`)
      }

      // Small delay between sends to be polite
      if (!dryRun) await sleep(2000)
    } catch (err) {
      console.error(`  ❌ Error processing ${prospect.businessName}:`, err)
      campaignResult.emailsFailed++
    }
  }

  console.log(`\n📈 Campaign complete:`)
  console.log(`   Prospects: ${campaignResult.prospectsFound}`)
  console.log(`   Audits: ${campaignResult.auditsRun}`)
  console.log(`   Sent: ${campaignResult.emailsSent}`)
  console.log(`   Failed: ${campaignResult.emailsFailed}\n`)

  return campaignResult
}

// ============================================================
// Get Recent Outbound Activity
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecentOutbound(limit = 50): Promise<any[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('outbound_emails')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch outbound emails: ${error.message}`)
  return data || []
}

// ============================================================
// Helpers
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
