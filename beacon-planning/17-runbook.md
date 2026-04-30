# Beacon — Operational Runbook

Day-to-day operations reference for running the Beacon platform. Covers the most common operational situations: database issues, deployment rollbacks, third-party failures, and customer emergencies.

Referenced in Risk Analysis doc O1 (Operator Availability). All procedures here are executable by the solo founder without specialized ops knowledge.

---

## Quick Reference — Dashboards and Consoles

| System | URL | Credentials |
|---|---|---|
| Railway (backend/worker) | railway.app | bleakjoystudios@gmail.com |
| Netlify (frontend) | app.netlify.com | bleakjoystudios@gmail.com |
| Neon (database) | console.neon.tech | bleakjoystudios@gmail.com |
| Upstash (Redis) | console.upstash.com | bleakjoystudios@gmail.com |
| Sentry (errors) | sentry.io | bleakjoystudios@gmail.com |
| UptimeRobot | uptimerobot.com | bleakjoystudios@gmail.com |
| Anthropic Console | console.anthropic.com | bleakjoystudios@gmail.com |
| Stripe Dashboard | dashboard.stripe.com | bleakjoystudios@gmail.com |
| Google Cloud Console | console.cloud.google.com | bleakjoystudios@gmail.com |
| Azure Portal | portal.azure.com | bleakjoystudios@gmail.com |
| Cloudflare | dash.cloudflare.com | bleakjoystudios@gmail.com |
| Resend | resend.com/login | bleakjoystudios@gmail.com |

*All credentials stored in your password manager. Never store credentials in this document.*

---

## Runbook 1: Site Is Down

**Symptoms:** UptimeRobot alert, agent reports "Beacon won't load," 5xx errors on landing page.

### Step 1: Identify which layer is down

1. Open [beacon.get-monolith.com](https://beacon.get-monolith.com) in an incognito window
2. Check: does the **frontend** load (landing page appears) but app features fail? → Backend issue
3. Check: does even the **landing page** fail to load? → Frontend (Netlify) or Cloudflare issue
4. Check Railway → Deployments: is the most recent backend deployment status "Success"?
5. Check Netlify → Deployments: is the most recent frontend deployment status "Published"?

### Step 2: Backend down

1. Railway → Beacon backend service → **Logs** tab: look for crash output or error messages
2. Common causes: unhandled exception at startup, environment variable missing, migration failed
3. If recent deployment: rollback (see Runbook 2)
4. If env var issue: Railway → Service → Variables → verify all required vars are present
5. If migration failed: check Railway logs for Drizzle Kit output; fix migration and redeploy

### Step 3: Frontend down (Netlify)

1. Netlify → beacon site → **Deploys** tab: check most recent build log
2. If build failed: check build output for TypeScript or build errors; fix and push
3. If build succeeded but site shows error: check Netlify → **Functions** if any edge functions are involved

### Step 4: Cloudflare issue

1. Cloudflare → beacon.get-monolith.com → **Analytics & Logs**: look for 5xx spike or WAF blocks
2. If WAF is incorrectly blocking traffic: review WAF rules, temporarily disable the problematic rule
3. If Cloudflare itself has an outage: check cloudflarestatus.com — this is outside your control; communicate via status page

### Step 5: Database down

1. Neon console → Project → **Branches** → main: check if the compute is "Active" or "Idle"
2. If idle: Neon auto-starts on first connection; Railway's backend health check should wake it
3. If Neon console shows errors: check [status.neon.tech](https://status.neon.tech)
4. Contact Neon support if outage persists > 15 minutes: support.neon.tech

### Communication during outage

If the outage exceeds 15 minutes and active paying customers may be affected:
1. Enable maintenance mode: Railway → backend → Variables → set `MAINTENANCE_MODE=true` → Deploy
2. Post a status update if you have a status page (optional at MVP)
3. Send a brief email to affected agents if outage exceeds 1 hour (use Resend manually if app email is down)

---

## Runbook 2: Rollback a Deployment

**When to use:** A deployment introduced a critical bug, broke a feature, or caused an outage. You want to quickly revert to the last known-good version.

**Target:** Under 5 minutes from decision to rollback complete.

### Backend rollback (Railway)

1. Railway → Beacon backend service → **Deployments** tab
2. Find the last successful deployment before the broken one
3. Click the "..." menu on that deployment → **Redeploy**
4. Railway redeploys from that exact image — no code change required
5. Watch the deployment logs: confirm service starts successfully
6. Test: open [beacon.get-monolith.com](https://beacon.get-monolith.com) and verify the issue is resolved

**Important:** If the broken deployment included a database migration, rolling back the code does NOT roll back the migration. See Runbook 3 for database restore procedures. In most cases, forward-fix the migration rather than restoring the database.

### Frontend rollback (Netlify)

1. Netlify → beacon site → **Deploys** tab
2. Find the last successful deploy
3. Click it → **Publish deploy** button → Netlify instantly serves that version
4. Verify at [beacon.get-monolith.com](https://beacon.get-monolith.com)

### Rollback decision criteria

| Situation | Action |
|---|---|
| 5xx errors on letter generation | Rollback backend if error is in new deploy |
| CSS/layout broken | Rollback frontend |
| Auth broken (login 500s) | Rollback backend immediately |
| Stripe webhooks failing | Investigate before rollback — may be a config issue |
| E&O log entries not appearing | Investigate — could be migration issue, not code |

---

## Runbook 3: Database Restore (Point-in-Time Recovery)

**When to use:** Data was accidentally deleted, corrupted, or a migration caused data loss.

**Neon provides point-in-time recovery.** The restore window depends on your Neon plan.

### How to restore

1. Neon console → Project → **Branches**
2. On the main branch: click **Restore** (or "Branch from point in time")
3. Select the target restore time: choose a timestamp before the incident
4. Neon creates a new branch from that point — this is non-destructive (your main branch is unchanged)
5. **Verify data on the restored branch first** before pointing production at it:
   - Connect to the restored branch using a temporary connection string
   - Check that the specific data you need to recover is present
6. Once verified: swap the connection string in Railway to point to the restored branch
7. Run any migrations needed to bring the restored branch up to current schema version
8. **After confirming production is healthy on the restored branch:** promote it to main or delete the old main branch

**Critical:** Always verify the restored data before swapping production. A blind restore can overwrite good data with bad.

### If restoring for E&O log integrity

If E&O log records may have been tampered with or deleted:
1. Restore to a point before the suspected tampering
2. Export the E&O log from the restored branch as PDF (evidence preservation)
3. Cross-reference with any agent-reported discrepancies
4. Consult the Incident Response Plan — this may constitute a P1 security incident

---

## Runbook 4: Stripe Issue Resolution

### Scenario A: Stripe webhooks failing

**Symptoms:** Payments going through in Stripe but accounts not unlocking in Beacon; downgrade not processing after cancellation.

1. Stripe Dashboard → **Developers** → **Webhooks** → select your webhook endpoint
2. Check **Recent Deliveries**: look for failed events (red)
3. Click a failed event → view the error response from Beacon's server
4. Common causes:
   - Webhook signature verification failing: check `STRIPE_WEBHOOK_SECRET` in Railway env vars
   - Beacon server returning 5xx: check Railway logs for the handler
5. Once fix is deployed, in Stripe Webhooks → click the failed event → **Resend** to retry it

### Scenario B: Agent's payment is failing but their card is valid

1. Stripe Dashboard → **Customers** → search for the agent's email
2. Check the subscription status and payment history
3. Look at the most recent **Invoice**: is there a specific failure reason?
4. Common reasons: card expired, bank declined, insufficient funds
5. Email the agent: "I can see your payment didn't go through — [reason if shareable]. Here's how to update your card: [Stripe customer portal link]"
6. If the issue is on Stripe's side (rare): contact Stripe support

### Scenario C: Agent was double-charged

1. Stripe Dashboard → find the agent's invoice → **Refund** the extra charge
2. Email the agent confirming the refund
3. Document in your records
4. Investigate: did a Stripe webhook fire twice? Check Railway logs for duplicate webhook processing

### Scenario D: Agent cancels but keeps being charged

1. Stripe Dashboard → **Customers** → **Subscriptions** → verify subscription status is "Cancelled"
2. If subscription is still "Active" despite agent cancelling: investigate why the cancel webhook didn't process
3. Cancel the subscription manually in Stripe if needed
4. Issue a refund for any charge after the intended cancellation date
5. Email the agent confirming the resolution

---

## Runbook 5: Claude API Down or Degraded

**Symptoms:** Letter generation fails; agents see "Letter generation is temporarily unavailable" errors; Sentry showing Anthropic 5xx errors.

1. Check [status.anthropic.com](https://status.anthropic.com) — is there an active incident?
2. If yes: there's nothing to do technically. The BullMQ retry logic handles retries automatically. Monitor the status page and communicate to agents if the outage is extended.
3. If no Anthropic incident is showing: check your Anthropic console for API key issues — has the key been rate-limited or suspended?
4. Check Railway logs: what specific error is Anthropic returning?
5. If your API key is hitting rate limits: contact Anthropic to raise the limit
6. If your API key has been suspended: contact Anthropic support immediately — this would be blocking all letter generation

**Agent communication if outage exceeds 30 minutes:**
> "Letter generation is temporarily unavailable due to an issue with our AI provider. We expect this to be resolved shortly. Letters are queued and will generate automatically when service is restored. Thank you for your patience."

---

## Runbook 6: Gmail OAuth Review Blocked or Revoked

**Symptoms:** Agents cannot connect Gmail; existing Gmail connections fail; "app not authorized" errors.

This runbook covers the most critical time-sensitive infrastructure risk at launch: Google OAuth app review.

### Before launch: OAuth review status

1. Google Cloud Console → APIs & Services → **OAuth consent screen** → check verification status
2. Status options: "In production" (approved) | "Testing" (limited to test users only) | "Needs verification" (blocked for general use)
3. The app MUST be in "In production" status before launch. See DOD item: "Google OAuth app (Gmail send) has passed Google's publishing review."
4. If review is delayed: escalate within Google Console; use the "Request expedited review" option if available

### During production: Token refresh failing

1. Sentry → filter by "oauth" or "gmail" errors → check the specific error
2. Common causes: token expired (auto-refresh should handle), app revoked by Google (rare), scope changed
3. If tokens are systemically failing: check Google Cloud Console for any policy violations or quota issues
4. If Google has revoked the app: this is a P1 incident — follow the Incident Response Plan

### Agents disconnecting and reconnecting

Normal user flow. No action needed. If an agent reports they disconnected accidentally and can't reconnect: guide them to Settings → Email → Connect Gmail.

---

## Runbook 7: Data Export for a Departing Customer

**When to use:** An agent requests their data before account deletion, or after deletion during the 30-day window.

1. Agent contacts support@get-monolith.com requesting their data
2. Verify identity: confirm by replying to the email on file for the account
3. Prepare the export:
   - **Client list:** Query the database for all client records belonging to the workspace; export as CSV
   - **Letter history:** Export E&O log as full PDF (including letter text) for the workspace
   - **Agency profile data:** Export as a simple summary document
4. Send the export via email within 5 business days (30-day legal deadline)
5. Log the export request in your records (date, email, what was exported)

**If account has already been deleted (within 30-day window):**
1. Connect to the database (through Railway's network or a temporary Neon connection)
2. Query the workspace by email — data should still be present if within 30 days
3. Follow the same export steps above

**If more than 30 days have passed (E&O log only):**
1. E&O log entries are anonymized but retained for 7 years
2. Provide the anonymized E&O communication records via PDF
3. Client PII (names, contact info) is no longer available after 30-day deletion window

---

## Runbook 8: Handling an Agent Report of Suspicious Activity

**When to use:** An agent says letters were sent they didn't write, clients they didn't import appeared, or their account was accessed by someone else.

1. **Take it seriously immediately.** Do not wait for confirmation — treat as P1.
2. Force-logout all sessions for the reported account: update the `sessions` table to invalidate all active sessions for that workspace
3. Send the agent a password reset email (force reset — do not wait for them to request it)
4. Review the E&O log for the workspace: identify all entries in the last 7 days — send this list to the agent for confirmation of which ones they authorized
5. If unauthorized letters were sent: the agent is responsible for notifying their clients directly (as their professional obligation); offer to provide the letter text for each unauthorized send
6. Escalate to the Incident Response Plan (P1 level)
7. Document everything

---

## Monthly Operations Checklist

Run through this list once per month:

- [ ] Review Sentry: any recurring error patterns that need fixing?
- [ ] Review Railway metrics: any CPU/memory trends trending upward?
- [ ] Review Stripe dashboard: any unusual churn patterns, failed payments, or refund requests?
- [ ] Review Anthropic usage: API costs matching projections?
- [ ] Check Renovate Bot PRs: any pending dependency updates (especially security patches)?
- [ ] Check Google Cloud Console: OAuth consent screen status still "In production"?
- [ ] Check Azure Portal: app registration still active and in good standing?
- [ ] Test point-in-time recovery: do a spot-check restore to verify Neon PITR is working
- [ ] Check Cloudflare: any WAF rule changes needed based on recent traffic?
- [ ] Review UptimeRobot: any false positives in uptime data? Alerts still configured?
- [ ] Review this runbook: any procedures need updating based on the last month's issues?
