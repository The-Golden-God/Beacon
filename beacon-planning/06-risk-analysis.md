# Beacon — Risk Analysis

## Risk Rating System

**Likelihood:** Low (unlikely in 3 years) / Medium (possible in 1-2 years) / High (likely within 12 months)
**Impact:** Low (recoverable, minor setback) / Medium (significant but survivable) / High (threatens the business)
**Priority:** Likelihood × Impact

---

## Market Risks

### M1 — Zywave Builds a Competing AI Letter Generator
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

Zywave has $200M+ raised, 7,000+ agency customers, and existing relationships with IIABA. If they build an AI letter writer that actually works and price it aggressively, they have distribution that would be very difficult to compete with.

**Why it's medium and not high likelihood:** Zywave is a legacy software company. Their current AI features have been panned by users. Their development cycles are slow. Building good AI requires a different culture than they have. They're also enterprise-focused, not solo-agent-focused.

**Mitigation:**
- Move fast — first mover advantage in this specific niche matters
- Build the moat that's hardest to copy: agent voice learning (requires time and data) and E&O log (agents won't switch once their documentation history lives in Beacon)
- Price below what Zywave can compete at for their cost structure ($149-499/month vs. their $2,400+ minimum)
- Pursue agency network partnerships aggressively — once a network endorses Beacon, Zywave can't easily dislodge us

---

### M2 — AMS Vendor Adds Native Letter Generation
**Likelihood:** Low | **Impact:** Very High | **Priority:** HIGH

If EZLynx, HawkSoft, or Applied Epic adds AI letter generation natively — built into the system agents already use daily — Beacon faces an existential threat. Agents don't want another tab open.

**Why it's low likelihood:** AMS vendors are infrastructure companies that have never competed on content or communication quality. Their AI track record is poor. They move in 3-5 year development cycles. The technical lift of building what Beacon builds is non-trivial.

**Mitigation:**
- Build integration partnerships with AMS vendors instead of competing with them — become the AI layer that plugs INTO EZLynx, not a replacement for it
- If an AMS vendor wants to white-label Beacon, that's an acquisition conversation
- The Gmail/Outlook send integration is something AMS vendors are highly unlikely to build (it's outside their core competency)

---

### M3 — Insurance Hard Market Reverses, Retention Crisis Eases
**Likelihood:** Low | **Impact:** Low | **Priority:** LOW

If carrier rates stabilize or decrease, agents face less retention pressure. The urgency of Beacon's core value proposition softens slightly.

**Why impact is low:** Proactive client communication is good practice regardless of market conditions. Even in a soft market, agents who communicate proactively retain more clients. The value prop shifts emphasis but doesn't disappear. And historically, the insurance market cycles — another hard market will come.

**Mitigation:** None required. Build the product for all market conditions, not just hard markets.

---

### M4 — Well-Funded Startup Enters This Exact Niche
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

If a VC-backed startup identifies the same gap and raises $3-5M to attack it aggressively, they could outspend Beacon on sales and marketing.

**Mitigation:**
- Move fast — every month of delay is a month they could launch instead
- The moat (voice learning, E&O log data, agent community trust) is time-dependent — the longer Beacon is live, the harder it is to replicate
- Community trust in insurance is built slowly — agents in IIABA chapters trust people they've seen present, not companies that appeared on LinkedIn yesterday
- If a well-funded competitor appears, that validates the market. Consider it a signal to pursue fundraising.

---

## Technical Risks

### T1 — Claude API Outage During Business Hours
**Likelihood:** Low | **Impact:** High | **Priority:** MEDIUM

Anthropic's API goes down. Agents can't generate letters. This is the core feature being unavailable.

**Mitigation:**
- BullMQ retry queue: failed generations are queued and retried automatically when service resumes
- Graceful error state shown immediately (see error states doc) with "Try again" and "Write manually" options
- Sentry alert fires within 60 seconds of repeated failures
- Status page (can use a simple hosted status page linked in the footer) shows service health
- Historical data: Anthropic has maintained very high uptime for API customers. This risk is real but low probability.

---

### T2 — Gmail/Outlook OAuth Permissions Revoked or Changed
**Likelihood:** Low | **Impact:** High | **Priority:** MEDIUM

Google or Microsoft changes their OAuth policies, scopes required, or review requirements in a way that breaks the email send integration.

**Google-specific risk:** Google periodically reviews OAuth apps and can revoke apps that don't meet their publishing requirements. Beacon will need to go through Google's OAuth app review process, which requires demonstrating legitimate use.

**Mitigation:**
- Start Google OAuth app review process early (before launch) — it can take 2-6 weeks
- Comply fully with all OAuth policy requirements
- Always provide fallback: PDF download and copy-to-clipboard are available regardless of email connection status
- Monitor Google and Microsoft developer blogs for policy changes
- Maintain the OAuth scope as minimal as possible (only request `gmail.send` or `mail.send` — not read or manage)

---

### T3 — Email Deliverability Issues
**Likelihood:** Medium | **Impact:** Medium | **Priority:** MEDIUM

Letters sent from agents' own Gmail/Outlook accounts could be marked as spam if the content triggers spam filters, or if agents send too many at once (bulk send behavior).

**Why medium likelihood:** Agents are sending from their own established email accounts with their own sender reputation. These are personal letters to existing clients, not cold outreach. This is actually the ideal deliverability scenario — far better than sending from a shared platform domain.

**Mitigation:**
- Letters are always personalized (client name in first sentence) — this alone reduces spam scoring significantly
- Rate limit sends to prevent bulk-send patterns (no more than 50 sends per hour from a single connected account)
- Agent setup guide includes email best practices
- Monitor for bounce rate increases through Resend data (where we handle our own transactional emails)

---

### T4 — Neon Database Outage or Data Loss
**Likelihood:** Very Low | **Impact:** Very High | **Priority:** MEDIUM

The Neon database goes down or, in a worst case, data is corrupted or lost.

**Mitigation:**
- Neon provides point-in-time recovery up to 7 days (test this quarterly)
- Neon has 99.9% uptime SLA
- Critical data (E&O log, client records) — consider a daily export to Cloudflare R2 as a secondary backup once revenue justifies the engineering time
- RTO (Recovery Time Objective): <4 hours. RPO (Recovery Point Objective): <24 hours.

---

### T5 — Prompt Injection Attack
**Likelihood:** Low | **Impact:** Medium | **Priority:** LOW

An agent (or a malicious actor with access to an agent's account) inputs text designed to hijack the system prompt and generate harmful or unintended content.

**Mitigation:** Already architected — user input is always clearly delimited and passed as data, never interpolated into the system prompt. The system prompt is hardcoded in the application and never user-controlled. This is a structural protection, not a policy.

---

### T6 — AI Hallucination / Letter Accuracy Error
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

Beacon generates a letter with incorrect information — wrong renewal date, wrong carrier, wrong premium amount, or inaccurate coverage description — and the agent sends it without catching the error. The client acts on the misinformation. This creates an E&O exposure for the agent and a reputational crisis for Beacon.

**Why medium likelihood:** Claude is accurate but not infallible. The most likely source of errors is incorrect data in the client record (wrong renewal date in the AMS export, stale carrier information) that gets passed into the letter, not AI hallucination per se. But either path produces the same result.

**Mitigation:**
- Letter review is mandatory in the workflow — agent reads the letter in the editor before clicking Send; the UI does not auto-send
- All input fields are shown to the agent before generation so they can catch data errors at the source
- Terms of Service explicitly places review and approval responsibility on the agent
- Letters never make specific coverage promises — they reference coverage generally and invite the client to discuss
- E&O disclaimer footer (hardcoded) reminds the reader this letter is for informational purposes only
- Build a "report an error in this letter" mechanism in Phase 2 to capture accuracy issues at scale
- Monitor for agent edits that correct factual errors — this is a signal the AI produced bad data

---

### T7 — Google OAuth App Review Rejection or Delay
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

Google's OAuth publishing review process takes 2-6 weeks and can reject or delay the app. If the review is not started early in development, Gmail integration is unavailable at launch — removing a core feature from the MVP.

**Why medium likelihood:** Google's app review for `gmail.send` scope is real and non-trivial. The review requires a privacy policy URL, a clear data use explanation, a demo video of the OAuth flow, and sometimes a written response to reviewer questions. This has blocked or delayed many legitimate SaaS products.

**Mitigation:**
- Start Google OAuth app review in Month 1 of development — this is a DoD item and must be initiated weeks before launch
- Prepare in advance: privacy policy live at beacon.get-monolith.com/privacy, clear data use statement, screen-recorded demo of the Gmail connect flow
- Request only the minimum scope: `gmail.send` — never read, manage, or compose
- Microsoft Graph (Outlook) review is less onerous — provides a backup if Gmail is delayed at launch
- PDF download and copy-to-clipboard are always available regardless of OAuth status — this is the fallback that keeps the product functional

---

### T8 — Data Breach / PII Exposure
**Likelihood:** Very Low | **Impact:** Very High | **Priority:** HIGH

Beacon stores client PII: names, email addresses, phone numbers, policy types, and renewal dates. A breach of this data triggers GLBA notification requirements to affected agents and potentially their clients, possible FTC regulatory action, and irreparable damage to agent trust.

**Why very low likelihood:** The security architecture is strong — Neon with row-level security, AES-256 at rest, TLS 1.3 in transit, no direct database access from the frontend, all queries parameterized via Drizzle ORM, secrets in environment variables only. The attack surface is narrow.

**Mitigation:**
- Row-level security in Neon ensures a compromised API token cannot return another agency's data — the breach radius is limited to one account
- No client PII is ever sent to Sentry — anonymized user IDs only in error logs
- Minimal PII collected — no Social Security numbers, no policy numbers, no financial account data
- WISP (Written Information Security Program) in place per GLBA Safeguards Rule
- Incident response plan: isolate affected systems → assess scope → notify affected agencies within 72 hours (per DPA) → notify FTC if required under GLBA → public disclosure if warranted
- Neon point-in-time recovery tested quarterly — data integrity can be restored

---

## Regulatory Risks

### R1 — State Insurance Department Restricts AI-Generated Agent Communications
**Likelihood:** Very Low | **Impact:** High | **Priority:** LOW

A state insurance department issues guidance or rules that restrict agents from using AI to draft client communications.

**Why very low likelihood:** Regulators govern what is communicated (accuracy, non-misrepresentation), not how it's drafted. Agents have always used writing aids — templates, ghostwriters, assistants. The agent reviews and sends every Beacon letter, making them the professional author of the communication. This is no different than an agent using a Word template.

**Mitigation:**
- Legal positioning is already correct: Beacon is a drafting tool, the agent is the author
- The Terms of Service explicitly places responsibility on the agent for reviewing and approving all content
- Monitor NAIC bulletins and state department websites for relevant guidance
- If guidance emerges, adjust positioning immediately (not the technology — the language around it)

---

### R2 — GLBA Enforcement Action
**Likelihood:** Very Low | **Impact:** High | **Priority:** LOW

The FTC enforces GLBA Safeguards Rule requirements against Beacon.

**Why very low likelihood:** The FTC focuses enforcement on companies with large consumer data sets and poor security practices. Beacon is a small operator with strong security architecture, a Written Information Security Program, and a DPA. The risk is theoretical.

**Mitigation:** Already addressed — WISP written, security architecture implemented, DPA available, privacy policy published.

---

## Operational Risks

### O1 — Sole Operator Unavailability
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

Scott gets sick, has a family emergency, or is otherwise unavailable. There's no backup operator.

**Mitigation:**
- Infrastructure is designed to run without manual intervention (automated deploys, automated monitoring, Sentry alerts)
- Railway and Netlify handle hosting automatically — the app runs without anyone touching it
- Document runbook: written guide for any critical operational procedure (database restore, deploy rollback, Stripe issue resolution)
- Emergency contact: designate one trusted person who has access to accounts in case of extended emergency
- This risk is inherent to solo founding. Hiring or partnering is the long-term mitigation.

---

### O2 — Key Infrastructure Provider Changes Pricing or Shuts Down
**Likelihood:** Low | **Impact:** Medium | **Priority:** LOW

Railway, Netlify, or Neon dramatically changes pricing or ceases operations.

**Mitigation:**
- Application is containerized — can be moved to any cloud provider (AWS, GCP, Render, Fly.io) within a week
- Neon data can be exported (standard Postgres dump)
- Never rely on any single provider's proprietary features that can't be migrated

---

## Financial Risks

### F1 — Customer Acquisition Cost Too High to Scale
**Likelihood:** Medium | **Impact:** Medium | **Priority:** MEDIUM

The cost of acquiring each new customer (LinkedIn ads, content, conference attendance) exceeds the LTV payback period.

**Mitigation:**
- Primary GTM is community-based (IIABA forums, Insurance Journal, referrals) — very low CAC
- Referral program built in from day one
- Do not spend money on paid acquisition until organic channels are proven
- Track CAC by channel from day one

---

### F2 — Claude API Costs Exceed Projections at Scale
**Likelihood:** Low | **Impact:** Medium | **Priority:** LOW

If Beacon grows to thousands of customers generating tens of thousands of letters per month, Claude API costs could become significant.

**Current cost estimate:** Each letter generation uses approximately 1,000-2,000 input tokens (system prompt + client details) and generates approximately 300-500 output tokens. At Claude Sonnet pricing with prompt caching:
- Input (cached): ~$0.30/M tokens = $0.0003 per letter
- Input (uncached): ~$3.00/M tokens = $0.003 per letter
- Output: ~$15.00/M tokens = $0.0075 per letter
- Total per letter (approximate): $0.008-$0.01 per letter

At 85 accounts × 20 letters/month = 1,700 letters/month × $0.01 = **$17/month in Claude costs at Year 1 scale.** This is negligible.

Even at 2,000 accounts × 20 letters = 40,000 letters/month × $0.01 = **$400/month** — still negligible against the revenue.

**Mitigation:** Prompt caching is already built in (system prompt cached). Monitor cost per letter monthly. If costs ever approach 5% of revenue, optimize prompts and increase pricing at next tier transition.

---

### F3 — High Churn Preventing Compound Growth
**Likelihood:** Medium | **Impact:** High | **Priority:** HIGH

If monthly churn exceeds 10%, the compounding effect of growth is undermined. Adding 15 customers/month while losing 10 doesn't build a business.

**Mitigation:**
- Churn is directly tied to product quality and value delivery — the best churn mitigation is making Beacon indispensable
- Data lock-in: E&O log and client voice learning make switching costly
- Early warning system: flag accounts with declining letter generation (engagement drop predicts cancellation)
- Customer success outreach: for Agency and Office tier customers, a personal check-in at 30 and 90 days
- Exit survey on every cancellation — understand the reason and fix it

---

## Risk Summary Matrix

| Risk | Likelihood | Impact | Priority | Owner |
|---|---|---|---|---|
| M1 — Zywave builds competitor | Medium | High | HIGH | Product velocity |
| M2 — AMS adds native AI | Low | Very High | HIGH | Integration partnerships |
| M4 — Funded startup enters | Medium | High | HIGH | Move fast, build moat |
| T1 — Claude API outage | Low | High | MEDIUM | Error states, retry queue |
| T2 — OAuth permissions | Low | High | MEDIUM | Early app review |
| T3 — Deliverability | Medium | Medium | MEDIUM | Per-account rate limiting |
| T4 — Database outage | Very Low | Very High | MEDIUM | Neon SLA, backups |
| O1 — Sole operator down | Medium | High | HIGH | Runbook, automation |
| F3 — High churn | Medium | High | HIGH | Product quality, moat |
| R1 — Regulatory restriction | Very Low | High | LOW | Legal positioning |
| M3 — Market softens | Low | Low | LOW | None required |
| T5 — Prompt injection | Low | Medium | LOW | Already architected |
| T6 — AI hallucination / accuracy error | Medium | High | HIGH | Mandatory review UX, ToS responsibility |
| T7 — Google OAuth review delay/rejection | Medium | High | HIGH | Start Month 1, Outlook fallback |
| T8 — Data breach / PII exposure | Very Low | Very High | HIGH | RLS, encryption, WISP, incident plan |
| R2 — GLBA enforcement | Very Low | High | LOW | Already addressed |
| O2 — Provider pricing | Low | Medium | LOW | Containerization |
| F1 — CAC too high | Medium | Medium | MEDIUM | Community GTM |
| F2 — API costs spike | Low | Medium | LOW | Monitor, caching |
