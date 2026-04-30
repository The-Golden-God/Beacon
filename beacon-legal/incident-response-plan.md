# Beacon — Incident Response Plan (IRP)
**Version 1.0 | Effective: April 27, 2026**
**Owner:** Scott Figeroa d/b/a Monolith
**Referenced in:** WISP Section 8, Risk Analysis doc T8

*This plan is activated whenever a confirmed or suspected security incident involving the Beacon platform or customer data is identified. It defines how Beacon detects, contains, investigates, notifies, and recovers from security incidents.*

---

## 1. Incident Classification

| Severity | Definition | Examples | Response Time |
|---|---|---|---|
| **P0 — Critical** | Confirmed unauthorized access to NPI; data exfiltration; active exploit in production | Database breach, OAuth token theft at scale, ransomware | Immediate (within 1 hour) |
| **P1 — High** | Suspected unauthorized access; vulnerability with confirmed exploit path; significant data integrity issue | Suspected account takeover, unpatched RCE vulnerability discovered, E&O log tampering | Within 4 hours |
| **P2 — Medium** | Security misconfiguration without confirmed exploitation; anomalous access patterns requiring investigation | Exposed admin endpoint (no confirmed access), unusual login patterns, failed brute-force attempt above threshold | Within 24 hours |

**Incidents that are not security incidents** (handle via normal ops):
- Payment processing failures
- Claude API downtime
- UI bugs
- Normal user errors

---

## 2. Incident Response Team

At MVP, all roles are held by the same person:

| Role | Responsibility | Contact |
|---|---|---|
| Incident Commander | Declares incident severity, coordinates response, makes external notification decisions | Scott Figeroa — bleakjoystudios@gmail.com |
| Technical Lead | Investigates, contains, and remediates the technical issue | Scott Figeroa |
| Customer Communications | Drafts and sends customer notifications | Scott Figeroa — legal@get-monolith.com |

As the team grows, these roles will be assigned to separate individuals.

---

## 3. Detection

Incidents may be detected through:

- **Sentry:** Real-time error monitoring — unusual error patterns, auth failures at scale
- **UptimeRobot:** Service unavailability (may indicate active attack or compromise)
- **Railway alerts:** Abnormal CPU/memory usage (may indicate crypto mining, data exfiltration)
- **Stripe webhooks:** Unusual billing events that could indicate account takeover
- **Customer reports:** An agent reports suspicious activity, unexpected access, or data they shouldn't have seen
- **External researchers:** Vulnerability disclosure email to legal@get-monolith.com
- **Log review:** Anomalous query patterns in the database or API logs

---

## 4. Response Procedures

### Phase 1: Initial Assessment (0–1 hour for P0, 0–4 hours for P1)

1. **Do not ignore.** Any alert or report that could indicate a security incident must be treated as P1 or higher until assessed.
2. **Document immediately.** Open an incident log (internal document or secure note) with: date/time discovered, how it was discovered, what is known, what is unknown.
3. **Classify severity** (P0, P1, P2) using the criteria in Section 1.
4. **Do not attempt to "fix and forget."** Do not apply patches or changes until containment and evidence preservation are complete.

### Phase 2: Containment

**For P0 incidents (active breach or confirmed unauthorized access):**

1. **Isolate immediately:**
   - If database is compromised: rotate all database credentials via Neon dashboard immediately
   - If OAuth tokens are compromised: revoke all Google/Microsoft OAuth tokens via their respective developer consoles
   - If application is actively exploited: enable maintenance mode (`MAINTENANCE_MODE=true` Railway env var) to take the platform offline

2. **Preserve evidence before making changes:**
   - Export Railway application logs for the affected time window before deploying changes
   - Export Neon query logs if available
   - Screenshot any anomalous monitoring data

3. **Rotate credentials:**
   - All Railway environment variables with potential exposure
   - All affected OAuth tokens
   - Database master password
   - Anthropic API key (if any indication of exposure)

4. **Reset affected accounts:** Force logout all active sessions (invalidate all session tokens in the database).

**For P1/P2 incidents:**
- Assess whether immediate isolation is necessary or whether investigation can proceed with platform live
- If in doubt: take the platform offline (user disruption is preferable to extended exposure)

### Phase 3: Investigation

1. Determine the full scope: which data was accessed, by whom, for how long
2. Identify the attack vector: how did the incident occur?
3. Identify all affected customers: which workspaces had NPI exposed?
4. Determine whether the incident involved NPI (triggers GLBA notification requirements)
5. Document findings in incident log: timeline, root cause, scope

**Key investigation questions:**
- Was any NPI accessed, exfiltrated, or modified?
- Were any E&O log records accessed or tampered with?
- Were any OAuth tokens used to send unauthorized emails?
- How many customer workspaces were potentially affected?
- Was the incident opportunistic or targeted?

### Phase 4: Notification

**When GLBA notification is required:**
Any security incident involving unauthorized access to customer NPI triggers notification obligations.

**Customer notification (72-hour target):**
- Notify affected customers by email within 72 hours of confirming the incident
- Use the registered email address for each affected workspace
- Notification content must include:
  - Nature of the incident (what happened)
  - Data affected (what NPI was potentially accessed)
  - Time period of potential exposure
  - Steps Beacon has taken to address the incident
  - Steps customers should take (if any — e.g., update passwords)
  - Contact for questions: legal@get-monolith.com

**Draft customer notification template:**

> Subject: Important security notice regarding your Beacon account
>
> Hi [First Name],
>
> I'm writing to notify you of a security incident that may have affected your Beacon account.
>
> **What happened:** [Brief factual description of the incident]
>
> **What data was potentially affected:** [Specific data types — e.g., client names and email addresses stored in your Beacon account]
>
> **When:** [Date range of potential exposure]
>
> **What we've done:** [Actions taken to contain and remediate]
>
> **What you should do:** [Any recommended actions — e.g., "No action required" or "Please update your password"]
>
> We take the security of your clients' information seriously and I'm sorry this happened. If you have any questions, contact me directly at legal@get-monolith.com.
>
> — Scott Figeroa, Beacon

**Regulatory notification:**
If the incident involves NPI of customers in states with specific breach notification laws (California, New York, etc.), consult with legal counsel on state-specific notification requirements. At MVP scale, Scott will personally assess notification obligations for each incident.

**No breach confirmed (false alarm):** Document the investigation conclusion, update the incident log with "no breach confirmed," and no external notification is required.

### Phase 5: Remediation

1. Deploy the fix that closes the vulnerability or access vector
2. Verify the fix is effective (test the attack vector is no longer exploitable)
3. Run the security test matrix from the DOD against the affected area
4. Deploy to production only after verification
5. Monitor for 48 hours post-remediation for recurrence

### Phase 6: Post-Incident Review

Completed within 14 days of incident resolution for all P0 and P1 incidents.

**Post-mortem document includes:**
- Timeline: detection → containment → resolution
- Root cause analysis (5 Whys or similar)
- What went well in the response
- What could have been caught earlier (detection gap)
- What could have been contained faster (response gap)
- Action items: specific changes to code, infrastructure, or procedures, each with an owner and due date
- WISP updates required (if any)

The post-mortem document is retained with incident records for a minimum of 5 years.

---

## 5. Specific Incident Playbooks

### Playbook A: Suspected Database Compromise

**Indicators:** Unusual query patterns in Neon logs; data appearing in places it shouldn't; Sentry errors consistent with data exfiltration attempts.

1. Immediately rotate Neon database password
2. Export current Neon query logs (before password rotation clears session)
3. Audit Railway environment — check for any committed secrets in recent deploys
4. Review all RLS policies — test that workspace isolation is intact
5. Scan for any new database users or roles not created by Beacon
6. Force-logout all active sessions
7. Assess scope of potential exposure via query logs

### Playbook B: Compromised Agent Account (Account Takeover)

**Indicators:** Agent reports unexpected login, letters they didn't generate, E&O log entries for letters they didn't write.

1. Immediately invalidate all sessions for the affected workspace
2. Force password reset for the affected account
3. Review E&O log for the workspace: identify all letters generated in the suspected period
4. If unauthorized letters were sent: contact the agent with the full list; they must notify affected clients
5. Assess whether the takeover could affect other workspaces (shared credentials, etc.)
6. Review login history for source IP — check for credential stuffing patterns

### Playbook C: OAuth Token Misuse

**Indicators:** Agent reports emails being sent from their account that they didn't authorize; unusual Gmail/Outlook activity.

1. Immediately revoke all Google OAuth tokens for the affected agent via the Google Cloud Console
2. Immediately revoke all Microsoft OAuth tokens via the Azure portal
3. Notify affected agent to review their Gmail/Outlook "Sent" folder for unauthorized activity
4. Review Beacon E&O log: verify send log matches what the agent authorized
5. Assess whether the token exposure was isolated to one account or systemic
6. Audit token storage in database: confirm tokens are still encrypted at rest

### Playbook D: Anthropic API Key Exposed

**Indicators:** Unexpected Claude API usage in Anthropic console; API key found in logs, public repo, or other exposed surface.

1. Immediately rotate the Anthropic API key via the Anthropic console
2. Deploy the new key to Railway environment variables
3. Assess how the key was exposed: check git history, log files, error messages
4. Confirm no customer NPI was transmitted to an unintended endpoint
5. Review Anthropic usage logs for the suspected exposure window

---

## 6. Contact Directory

| Purpose | Contact |
|---|---|
| Primary incident contact | bleakjoystudios@gmail.com |
| Legal / customer notifications | legal@get-monolith.com |
| Customer support | support@get-monolith.com |
| Neon (database support) | support.neon.tech |
| Railway (hosting support) | railway.app/help |
| Anthropic (API key issues) | anthropic.com/contact |
| Stripe (payment security) | stripe.com/contact |
| Google (OAuth/Gmail API) | console.cloud.google.com |
| Microsoft (Azure/Outlook) | portal.azure.com |

---

*IRP approved by: Scott Figeroa, April 27, 2026*
*Next review due: April 2027 or after any P0/P1 incident*
