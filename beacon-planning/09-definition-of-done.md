# Beacon — Definition of Done (MVP Launch Checklist)

Every item on this list must be checked before Beacon accepts its first paying customer. No exceptions.

---

## Functional Requirements

### Authentication & Accounts
- [ ] Agent can sign up with email and password
- [ ] Email verification is required before any platform access is granted
- [ ] Unverified accounts cannot generate letters, import clients, or access any paid feature
- [ ] Agent can log in with verified credentials
- [ ] Session persists for 7 days (remember me) or expires after 24 hours of inactivity
- [ ] Password reset flow works: request → email → reset link → new password set
- [ ] Invalid/expired reset links return a clear error, not a crash
- [ ] Agent can delete their account
- [ ] Account deletion permanently removes all data within 30 days (logged and verifiable)
- [ ] Data export: agent can export their full client list as CSV and their full letter history from account settings — available before and after cancellation, until account deletion
- [ ] Two accounts cannot be created with the same email address

### Agency Setup & Onboarding
- [ ] New agent is guided through agency setup (name, agent name, state, phone, email)
- [ ] NPN (National Producer Number) field available in agency profile — optional but recommended; displayed in E&O log PDF exports
- [ ] Communication style can be set (tone: formal/conversational/in between, sign-off phrase)
- [ ] Logo can be uploaded (optional, appears on PDF letters)
- [ ] Agency setup can be completed in under 2 minutes
- [ ] All settings can be changed after initial setup
- [ ] Agent can skip client import and go directly to letter generation

### Client Management
- [ ] Agent can import clients via CSV upload
- [ ] CSV field mapping is shown clearly (which column maps to which field)
- [ ] Required fields: first name, last name, email OR phone, policy type, renewal date
- [ ] Optional fields: carrier, current premium, secondary policy types, notes
- [ ] Partial import succeeds: valid rows import, invalid rows shown in error report
- [ ] Malformed CSV (not a .csv file, corrupted) shows a clear error message
- [ ] Maximum import: 1,000 clients per import at MVP
- [ ] Agent can add clients manually (one at a time form)
- [ ] Agent can edit any client record
- [ ] Agent can delete a client record (with confirmation dialog)
- [ ] Client search works by name and email
- [ ] Client list is sortable by renewal date, last contact date, policy type

### Renewal Calendar
- [ ] All imported clients appear on the renewal calendar
- [ ] Calendar correctly color-codes clients using the 5-status system (color is never the sole indicator — each status has both color and text label):
  - Red (Urgent): renewal within 30 days, no outreach sent
  - Amber (Upcoming): renewal within 31–60 days, no outreach sent
  - Blue (Scheduled): renewal more than 60 days out, no outreach sent yet
  - Green (Contacted): at least one letter sent via Beacon
  - Slate (Inactive): renewal date unknown or past
- [ ] Clicking a client opens their panel correctly
- [ ] Calendar can be toggled between calendar view and list view
- [ ] Calendar can be filtered by date range
- [ ] Calendar loads within 2 seconds for up to 500 clients

### Letter Generation
- [ ] Pre-Renewal Outreach scenario generates correctly for all valid inputs
- [ ] Rate Increase Explanation scenario generates correctly for all valid inputs
- [ ] New Client Welcome scenario generates correctly for all valid inputs
- [ ] All letter inputs pre-fill from the client record (name, policy type, renewal date, carrier, premium)
- [ ] Agent can override any pre-filled field before generating
- [ ] Letter streams in real time (first token appears within 3 seconds)
- [ ] Streaming is visible and smooth (word by word, not chunks)
- [ ] Letter is complete within 15 seconds for all scenarios
- [ ] Letter contains client's first name in the first sentence (always)
- [ ] Letter respects scenario-specific word count limits: Pre-Renewal Outreach under 250 words, Rate Increase Explanation under 220 words, New Client Welcome under 200 words
- [ ] Letter contains no insurance jargon that fails the "16-year-old" test
- [ ] E&O disclaimer footer appears on every letter, non-editable, non-removable
- [ ] Agent name, agency name, phone, and email appear in letter signature
- [ ] Letter can be edited in the Tiptap rich text editor
- [ ] Edits are saved automatically
- [ ] Subject line is auto-generated and editable
- [ ] Edited letter can be saved as a template
- [ ] Template is available for all future letters of the same scenario
- [ ] Original AI draft and final sent version are stored separately

### Email Send Integration
- [ ] Agent can connect Gmail account via Google OAuth
- [ ] Agent can connect Outlook account via Microsoft OAuth (Microsoft Graph)
- [ ] OAuth connection persists (token stored securely, refreshes automatically)
- [ ] Agent can disconnect and reconnect either email account
- [ ] Send button sends the letter from the agent's connected email address to the client's email
- [ ] Client receives the email from the agent's personal email address (not a Beacon address)
- [ ] Subject line used in the email matches what the agent approved
- [ ] Send confirmation toast appears after successful send
- [ ] Sent letter is logged in E&O log within 5 seconds of send
- [ ] If client has no email address, send button is disabled with a clear message
- [ ] Download as PDF is always available regardless of email connection status
- [ ] Copy to clipboard is always available regardless of email connection status

### E&O Documentation Log
- [ ] Every generated letter is logged (regardless of whether it was sent)
- [ ] Every sent letter is logged with delivery status
- [ ] Log entries are immutable — no user can edit or delete a log entry
- [ ] Each log entry shows: date/time, client name, scenario type, final letter content, send status, recipient email
- [ ] Log is searchable by client name, date range, and scenario type
- [ ] Log is exportable as a PDF
- [ ] PDF export covers ALL entries matching the current filter, not just the entries loaded in the visible table (load-more pagination does not truncate exports)
- [ ] PDF export is formatted cleanly and legibly (suitable for E&O audit)
- [ ] Admin E&O audit trail: every PDF export and every log entry view by an admin is recorded with timestamp and admin name — visible to workspace owner only

### Billing & Subscriptions
- [ ] Free trial allows exactly 10 letter generations (not sends — generations)
- [ ] Free trial counter is shown clearly throughout the app
- [ ] At 0 free letters remaining, the Generate button is disabled with an upgrade prompt
- [ ] Stripe checkout works for Solo ($149/month), Agency ($299/month), Office ($499/month)
- [ ] Successful payment immediately unlocks unlimited letter generation
- [ ] Subscription auto-renews monthly
- [ ] Agent can access Stripe customer portal to update payment method, view invoices, or cancel
- [ ] Cancellation takes effect at end of billing period
- [ ] After cancellation, agent retains full access until billing period ends
- [ ] After billing period ends, account is downgraded to free tier (10 letter limit re-applies)
- [ ] Stripe webhook processes payment events correctly (payment success, failure, cancellation)
- [ ] Failed payment triggers email notification and in-app banner
- [ ] 3-day grace period after failed payment before access is restricted

### Multi-Agent Features (Agency and Office tiers)
- [ ] Agency owner can invite additional agents by email
- [ ] Invited agents receive email and can accept invitation
- [ ] Agency owner can set role for each agent (producer, admin)
- [ ] Admin can see renewal calendar for all producers in their agency
- [ ] Admin can filter renewal calendar by producer
- [ ] Office tier: approval queue works (producer generates → admin reviews → admin approves → sends)
- [ ] Each agent's letters appear in the shared E&O log
- [ ] Team letter history is visible per client (any agent can see letters sent by any other agent)

---

## Performance Requirements

- [ ] Letter generation: first token appears within 3 seconds (P95)
- [ ] Letter generation: full letter complete within 15 seconds (P95)
- [ ] Renewal calendar: loads within 2 seconds for up to 500 clients
- [ ] Client list: loads within 1 second for up to 1,000 clients
- [ ] CSV import: 500 clients imported in under 30 seconds
- [ ] All non-AI API endpoints respond within 300ms (P95)
- [ ] Site loads under 3 seconds on mobile (3G equivalent)
- [ ] Site loads under 1.5 seconds on desktop (broadband)
- [ ] No memory leaks that degrade performance over a 2-hour session
- [ ] Load test run: 50 concurrent simulated users — all non-AI endpoints respond within 300ms, error rate does not exceed 0.1%
- [ ] Load test run: 10 simultaneous letter generation requests succeed without timeout, degradation, or rate limit collision

---

## Security Requirements

- [ ] RLS verified: agent cannot access another agency's data
  - Test: create two accounts, attempt to access account A's data with account B's session token → must return 401 or empty result, never data
- [ ] All API endpoints require valid authentication (test each with no token and with expired token)
- [ ] Rate limiting enforced: letter generation limited to 100/hour per workspace
- [ ] Rate limiting enforced: login attempts limited to 5/15min per email + per IP
- [ ] Session expiry works: expired sessions are redirected to login
- [ ] Stripe webhook signature verification is active (test with invalid signature → must reject)
- [ ] All user input is validated with Zod schemas on the server (test with malformed inputs)
- [ ] No SQL injection path (Drizzle ORM used for all queries — parameterized by default)
- [ ] XSS: AI-generated content is sanitized before rendering (never raw innerHTML from AI output)
- [ ] Security headers active on all pages: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff
- [ ] Cloudflare is active in front of production domain
- [ ] All secrets are in environment variables — git history contains no committed secrets
- [ ] HTTPS enforced everywhere — HTTP requests redirect to HTTPS
- [ ] OAuth tokens stored encrypted in database — never in plain text

---

## Accessibility & Browser Compatibility Requirements

- [ ] All interactive elements (buttons, links, form fields, dropdowns) are keyboard-navigable without a mouse
- [ ] All form inputs have associated labels — placeholder text alone is not a label
- [ ] Focus states are visible on all interactive elements — no `outline: none` without a visible alternative
- [ ] All images and icons that convey meaning have alt text or aria-label attributes
- [ ] Color is not the sole means of conveying information — renewal calendar color-coding has a secondary indicator (text label or icon) for colorblind users
- [ ] Text contrast meets WCAG 2.1 AA minimum: 4.5:1 for normal text, 3:1 for large text
- [ ] Tiptap letter editor is keyboard-accessible (type, select, format text without requiring a mouse)
- [ ] Core flows work with screen reader (VoiceOver on macOS, NVDA on Windows): login, letter generation, send
- [ ] No functionality is mouse-only — every action has a keyboard equivalent
- [ ] Browser compatibility confirmed on latest stable version of:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (macOS)
  - [ ] Safari (iOS — mobile)
  - [ ] Edge
- [ ] All core screens are usable at 375px viewport width (iPhone SE — smallest common phone)
- [ ] No horizontal scroll on any core screen at 375px
- [ ] Touch targets are at least 44×44px on mobile (buttons, links, interactive elements)

---

## Legal Requirements

- [ ] Privacy Policy is published at beacon.get-monolith.com/privacy
- [ ] Terms of Service is published at beacon.get-monolith.com/terms
- [ ] Privacy Policy and Terms of Service links appear in the footer on every page
- [ ] Signup flow includes: "By creating an account, you agree to our Terms of Service and Privacy Policy" with links — agent must proceed past this (implicit acceptance)
- [ ] E&O disclaimer footer is present on every generated letter
- [ ] E&O disclaimer footer cannot be removed or edited by any user
- [ ] Agent's name, agency name, and contact information are required in letter signature
- [ ] Letter signature fields must be completed before letter generation is permitted

---

## Monitoring & Observability Requirements

- [ ] Sentry is active and receiving errors in production
- [ ] Test error sent to Sentry and confirmed received before launch
- [ ] UptimeRobot is pinging production URL every 5 minutes
- [ ] UptimeRobot is configured to send SMS + email alert if site goes down
- [ ] Railway CPU and memory alerts configured (alert if >80% for 5 minutes)
- [ ] Claude API failure rate is monitored (alert if >3 consecutive failures)
- [ ] Stripe webhook failures are logged and alerted
- [ ] All alert notifications go to bleakjoystudios@gmail.com (and forwarded from legal@get-monolith.com if needed)

---

## Deployment & Operations Requirements

- [ ] Production deployment is fully automated from main branch push
- [ ] CI pipeline runs before every deploy: TypeScript check → tests → smoke test → deploy
- [ ] If CI fails, deploy is blocked automatically
- [ ] Database migrations run automatically on deploy (Drizzle Kit)
- [ ] Rollback procedure is documented and tested (deploy previous version in under 5 minutes)
- [ ] Renovate Bot is configured and has opened its first PR
- [ ] Google OAuth app (Gmail send) has passed Google's publishing review — this process takes 2-6 weeks; it must be initiated in Month 1 of development, not the week before launch
- [ ] Microsoft Azure app (Outlook send) is registered and approved for `mail.send` scope — initiate in Month 1 of development alongside Google OAuth registration; Azure approval is typically faster than Google's 2-6 week review but still requires lead time
- [ ] All environment variables are documented (names and purpose — not values) in a README
- [ ] Neon point-in-time recovery has been tested (restore to a point in time successfully)

---

## Beta Testing Requirements (Before Soft Launch)

- [ ] At least 5 beta agents have completed the full workflow:
  - Signed up → set up agency → imported clients → generated a letter → sent it via Gmail or Outlook
- [ ] At least 3 of the 5 beta agents generated letters from each of the 3 scenarios
- [ ] All P0 bugs (app crashes, data loss, security issues) are resolved
- [ ] All P1 bugs (major feature not working, no workaround) are resolved
- [ ] Beta agents have been asked: "Would you pay $149/month for this?" and majority said yes
- [ ] At least 1 beta agent has submitted a CSV import successfully
- [ ] At least 1 beta agent has exported the E&O log as PDF
- [ ] At least 1 beta agent has upgraded from free trial to paid (even at $1 for testing)
- [ ] At least 10 sample letters reviewed by a licensed P&C agent (not the developer) before launch — minimum 3 per scenario — confirmed against the letter quality checklist in the Letter Content Guide
- [ ] At least 1 reviewed letter confirmed to pass the E&O test: no coverage promises, no legal advice, disclaimer present and correct, first name in first sentence
- [ ] All three letter scenarios reviewed by the founder personally — every generated letter sounds like a real agent wrote it

---

## Definition of "Ready to Launch"

Beacon is ready to soft launch when:
1. Every functional requirement above is checked
2. Every security requirement is checked
3. Every legal requirement is checked
4. Every monitoring requirement is checked
5. Beta testing requirements are met
6. Zero P0 or P1 bugs outstanding
7. The founder has personally completed the full workflow from signup to letter sent in under 5 minutes

When all of the above is true, Beacon can accept its first paying customer.
