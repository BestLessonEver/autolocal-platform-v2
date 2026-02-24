#!/usr/bin/env npx tsx
/**
 * AutoLocal.ai — Outbound Campaign CLI
 *
 * Usage:
 *   npx tsx scripts/run-outbound.ts --city "Friendswood" --state "TX" --limit 5
 *   npx tsx scripts/run-outbound.ts --city "Midland" --state "TX" --categories "dentist,salon" --limit 10
 *   npx tsx scripts/run-outbound.ts --city "Gilbert" --state "AZ" --limit 3 --send
 *
 * By default runs in dry-run mode (no emails sent). Pass --send to actually send.
 */

import { runOutboundCampaign } from '../src/lib/outbound-engine'

function parseArgs(): { city: string; state: string; categories?: string[]; limit: number; dryRun: boolean } {
  const args = process.argv.slice(2)
  let city = '', state = '', categories: string[] | undefined, limit = 10, dryRun = true

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--city': city = args[++i]; break
      case '--state': state = args[++i]; break
      case '--categories': categories = args[++i].split(',').map(s => s.trim()); break
      case '--limit': limit = parseInt(args[++i], 10); break
      case '--send': dryRun = false; break
      case '--help':
        console.log(`
AutoLocal.ai Outbound Campaign CLI

Usage:
  npx tsx scripts/run-outbound.ts --city "Friendswood" --state "TX" --limit 5

Options:
  --city <name>          Target city (required)
  --state <code>         State code (required)
  --categories <list>    Comma-separated categories (e.g. "dentist,salon")
  --limit <n>            Max prospects to process (default: 10)
  --send                 Actually send emails (default: dry run)
  --help                 Show this help
`)
        process.exit(0)
    }
  }

  if (!city || !state) {
    console.error('Error: --city and --state are required. Use --help for usage.')
    process.exit(1)
  }

  return { city, state, categories, limit, dryRun }
}

async function main() {
  const { city, state, categories, limit, dryRun } = parseArgs()

  if (dryRun) {
    console.log('🔒 DRY RUN MODE — no emails will be sent. Pass --send to send for real.\n')
  } else {
    console.log('⚠️  LIVE MODE — emails will actually be sent!\n')
  }

  const result = await runOutboundCampaign(city, state, categories, limit, dryRun)

  // Summary table
  console.log('\n' + '='.repeat(60))
  console.log('CAMPAIGN SUMMARY')
  console.log('='.repeat(60))
  console.log(`City:        ${result.city}, ${result.state}`)
  console.log(`Categories:  ${result.categories.length ? result.categories.join(', ') : 'all'}`)
  console.log(`Prospects:   ${result.prospectsFound}`)
  console.log(`Audits:      ${result.auditsRun}`)
  console.log(`Emails sent: ${result.emailsSent}`)
  console.log(`Failed:      ${result.emailsFailed}`)
  console.log('='.repeat(60))

  // Detail per result
  for (const r of result.results) {
    const status = r.success ? '✅' : '❌'
    console.log(`${status} ${r.audit.prospect.businessName} — Score: ${r.audit.overallScore} — Approach: ${r.approach.type}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
