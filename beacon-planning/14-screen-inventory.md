# Beacon — Screen Inventory & Sitemap

Every screen in the MVP. Every route. Every navigation element. This is the complete map of the product.

---

## Navigation Structure

### Primary Navigation (authenticated, all tiers)
Visible as a sidebar on desktop, bottom tab bar on mobile.

| Label | Route | Icon | Notes |
|---|---|---|---|
| Calendar | /dashboard | Calendar icon | Default landing after login |
| Clients | /clients | People icon | Client list |
| Letters | /letters | Document icon | Letter generator entry point |
| Log | /log | Shield icon | E&O documentation log |
| Settings | /settings | Gear icon | Agency profile, email, billing |

### Secondary Navigation (top right, all tiers)
- Notification bell (in-app toasts history — Phase 2, not MVP)
- Account menu: [Agent name + avatar dropdown] → Profile, Billing, Sign Out
- Trial counter badge (if on free trial): "X letters remaining"

### Admin-Only Navigation Items (Agency + Office tiers)
Appear below primary nav items for agents with Admin role:
- Team | /team | Users icon | Agent management
- Queue | /queue | Inbox icon | Approval queue (Office tier only)

---

## Screen Inventory

### Group 1: Public / Unauthenticated

| Screen | Route | Purpose |
|---|---|---|
| Landing page | / | Marketing, signup entry point |
| Pricing page | /pricing | Pricing tiers, feature comparison |
| Privacy Policy | /privacy | Legal — required before launch |
| Terms of Service | /terms | Legal — required before launch |
| Sign Up | /signup | Create new account |
| Log In | /login | Return to existing account |
| Email Verification Pending | /verify-email | "Check your inbox" screen after signup |
| Email Verification Success | /verify-email/confirmed | Confirmed — redirect to onboarding |
| Email Verification Error | /verify-email/error | Link expired, invalid, or already used |
| Forgot Password | /forgot-password | Enter email to receive reset link |
| Reset Password | /reset-password | Set new password (arrived via email link) |
| Invitation Accept | /invite/[token] | Invited agent accepts team invitation |
| 404 | /404 | Page not found |
| 500 | /500 | Server error |
| Maintenance | /maintenance | Planned downtime page |

---

### Group 2: Onboarding (authenticated, first-time only)

| Screen | Route | Purpose |
|---|---|---|
| Onboarding — Step 1: Agency Info | /onboarding/agency | Agency name, agent name, state, phone, email |
| Onboarding — Step 2: Communication Style | /onboarding/style | Tone (formal/in between/conversational), sign-off phrase |
| Onboarding — Step 3: Logo (optional) | /onboarding/logo | Upload agency logo for PDF letters |
| Onboarding — Step 4: Import or Skip | /onboarding/clients | Import CSV or skip to dashboard |

**Onboarding rules:**
- Steps 1 and 2 are required before any other feature is accessible
- Step 3 (logo) has a prominent "Skip" option — shown as secondary action
- Step 4 offers import or "Go to Dashboard" — never blocked
- Progress indicator shows step X of 4 throughout
- After onboarding completes → redirect to /dashboard

---

### Group 3: Dashboard / Renewal Calendar

| Screen | Route | Purpose |
|---|---|---|
| Renewal Calendar (default) | /dashboard | Calendar view, color-coded client cards |
| Renewal Calendar (list view) | /dashboard?view=list | Same data, table layout |
| Client Panel (slide-out) | /dashboard → opens panel | Click any client card → panel slides in from right |

**Client panel contents (slide-out, not a full page):**
- Client name, policy type, carrier, renewal date, current premium
- Color-coded renewal status badge
- "Letters Sent" history list (date, scenario, sent/not sent)
- CTA: "Generate Letter" | "Edit Client" | "View Full Record"
- Does not navigate away from the calendar — panel closes when user clicks outside

**Dashboard controls:**
- Toggle: Calendar view | List view (top right)
- Filter: Date range picker (default: current month + 60 days)
- Filter: Producer dropdown (Agency/Office tiers — admin only)
- Search: Live search by client name (within current filter)

---

### Group 4: Client Management

| Screen | Route | Purpose |
|---|---|---|
| Client List | /clients | All clients, sortable, searchable |
| Add Client (manual) | /clients/new | Single-client form |
| Client Detail | /clients/[id] | Full record: all fields + letter history |
| Edit Client | /clients/[id]/edit | Edit any field on the client record |
| CSV Import | /clients/import | Upload + column mapping + result |
| Duplicate Client Resolution | /clients/import (Stage 3b) | Inline resolution when import detects existing clients |

**Client List controls:**
- Search bar (name, email)
- Sort: Renewal date | Last contact date | Policy type | Name
- Filter: Policy type dropdown | Renewal status dropdown
- "Add Client" button (top right)
- "Import from CSV" button (top right, secondary)
- "Export CSV" button (top right, tertiary/text link) — exports all current clients as CSV

**Do Not Contact flag:**
- Client records include a "Do Not Contact" boolean flag (default: off)
- When flagged: client card in calendar shows a "DNC" badge; Generate Letter button on that client shows a warning modal: "This client is marked Do Not Contact. Are you sure you want to generate a letter for them?" with [Cancel] and [Continue Anyway] options
- DNC flag is set/cleared on the Edit Client screen
- DNC clients are not hidden from the calendar or list — they remain visible with the badge

**Client Detail page sections:**
- Contact info (name, email, phone)
- Policy info (type, carrier, premium, renewal date)
- Agent notes (free text field, editable inline)
- Letter history (all letters generated for this client — date, scenario, sent Y/N, view link)
- Actions: Edit | Delete | Generate Letter

---

### Group 5: Letter Generator

| Screen | Route | Purpose |
|---|---|---|
| Letter Generator | /letters/new | Generate a new letter |
| Letter Generator (from client) | /letters/new?clientId=[id] | Pre-filled from client record |
| Letter View (past letter) | /letters/[id] | View a previously generated letter |

**Letter Generator layout (two-panel):**
- **Left panel (30% width):** Client selector + scenario picker + input fields
  - Client: search/select or type manually
  - Scenario: Pre-Renewal Outreach | Rate Increase Explanation | New Client Welcome
  - Pre-filled fields: policy type, renewal date, carrier, current premium (all overridable)
  - Scenario-specific fields: rate increase amount (Rate Increase only)
  - "Generate" button at bottom of panel
- **Right panel (70% width):** Tiptap rich text editor
  - Subject line field (auto-generated, editable) above editor
  - Letter content (streams in, then editable)
  - Toolbar: Bold, Italic, Underline, bullet list (basic formatting only)
  - Status indicator: Generating... | Saved | Changes not saved
  - E&O disclaimer footer (locked, greyed out, non-editable)
  - Agent signature (locked, greyed out, non-editable)
- **Bottom action bar:** Send (if email connected) | Download PDF | Copy to Clipboard | Save as Template

**Mobile layout:** Panels stack vertically. Client/scenario panel collapses to a summary bar after generation begins, expanding the editor to full width.

---

### Group 6: E&O Documentation Log

| Screen | Route | Purpose |
|---|---|---|
| E&O Log | /log | Full log, all entries |
| Log Entry Detail | /log/[id] | Single log entry — full letter content, send status, timestamps |

**Log controls:**
- Search bar (client name)
- Filter: Date range picker
- Filter: Scenario type (All | Pre-Renewal | Rate Increase | New Client Welcome)
- Filter: Send status (All | Sent | Not sent)
- Filter: Producer (Agency/Office admin only)
- Export PDF button (top right)

**Log entry row shows:**
- Date/time generated
- Client name
- Scenario type
- Producer name (Agency/Office tiers)
- Send status (Sent ✓ | Not sent —)
- Recipient email (if sent)
- "View" link → Log Entry Detail

**Log Entry Detail shows:**
- All log row data (above)
- Full letter text (read-only, formatted)
- Subject line used
- AI draft vs. sent version (toggle view if they differ)

**Admin E&O Audit Trail (Office tier, Admin role only):**
- Accessible at `/log/audit` or as a tab within the E&O Log screen
- Shows: timestamp | action (Viewed Entry / Exported PDF) | admin name | filter criteria used (for exports)
- Read-only table, not exportable (audit trail of the audit trail creates infinite regress — admin-visible only)
- Workspace owner can see all admins' activity; admins can only see their own

---

### Group 7: Templates

| Screen | Route | Purpose |
|---|---|---|
| Templates | /templates | Saved templates by scenario |
| Template Detail / Edit | /templates/[id] | View, use, or delete a template |

**Templates layout:**
- Tabs: All | Pre-Renewal Outreach | Rate Increase | New Client Welcome
- Each template card: scenario badge, first 2 lines of letter text, date saved, "Use" button, delete icon
- "Use" button → opens Letter Generator with this template pre-loaded in the editor

---

### Group 8: Settings

| Screen | Route | Purpose |
|---|---|---|
| Settings (redirect) | /settings | Redirects to /settings/agency |
| Agency Profile | /settings/agency | Agency name, agent name, state, phone, email, logo |
| Communication Style | /settings/style | Tone preference, sign-off phrase |
| Email Connection | /settings/email | Connect/disconnect Gmail, connect/disconnect Outlook |
| Billing | /settings/billing | Current plan, usage, manage subscription button (→ Stripe portal) |
| Data Export | /settings/export | Export client CSV and letter history PDF |
| Notifications | /settings/notifications | Email notification preferences (Phase 2 — not MVP) |

**Settings navigation:** Left sidebar within the settings section shows all settings categories.

**Agency Profile page:**
- All fields editable inline
- Logo upload/replace/remove
- Save button (explicit save — not auto-save)
- "These details appear in your letter signature" helper text

**Email Connection page:**
- Gmail: "Connect Gmail" button → OAuth flow | OR "Connected as [email@gmail.com]" + Disconnect button
- Outlook: Same pattern
- Status indicator per connection: Connected (green) | Not connected (grey) | Token expired (red + Reconnect)
- Explanation copy: "Letters send from your email address — not from Beacon."

**Billing page:**
- Current plan: Solo | Agency | Office | Free trial (X letters remaining)
- Billing period: renews on [date]
- "Manage Subscription" button → Stripe Customer Portal (opens in new tab)
- For free trial: "Upgrade Now" button + trial letter counter
- For downgraded accounts: "Reactivate" button

---

### Group 9: Team Management (Agency + Office Tiers)

| Screen | Route | Purpose |
|---|---|---|
| Team | /team | All agents in the workspace |
| Invite Agent | /team/invite | Send invitation by email |

**Team page:**
- Table: Agent name | Email | Role (Admin/Producer) | Status (Active/Invited) | Actions
- "Invite Agent" button (top right)
- Role dropdown per agent (change role inline)
- Remove agent option (with confirmation)
- Pending invitations shown with "Resend" and "Cancel" options

**Invite Agent modal (or page):**
- Email field
- Role selector: Producer | Admin
- "Send Invitation" button
- Confirmation: "Invitation sent to [email]. They'll receive an email with instructions."

---

### Group 10: Approval Queue (Office Tier Only)

| Screen | Route | Purpose |
|---|---|---|
| Approval Queue | /queue | Pending letters from all producers |

**Queue layout:**
- Tab: Pending | Recently Approved | Returned
- Each queue item: Client name + scenario | Producer name | Generated timestamp | Preview (2-3 lines)
- Actions: "Review" → expands full letter | "Approve" button | "Return" button + notes field
- Empty state: "No letters waiting for review."
- Badge on nav item shows count of pending letters

---

### Group 11: Upgrade Flow

---

### Group 12: Read-Only Archive (Post-Cancellation)

| Screen | Route | Purpose |
|---|---|---|
| E&O Archive Access Request | (handled via email, not in-app) | Former agent requests read-only access to E&O log post-cancellation |

**Access mechanism:** After account deletion, the E&O log is retained for 7 years in anonymized form. The workspace owner (or former owner) may request a secure, time-limited read-only view by contacting legal@get-monolith.com. Beacon provides either:
- A secure time-limited login to a read-only version of the E&O log screen (no other features accessible), OR
- A full PDF export of the retained E&O records

This is an ops-assisted flow, not a self-service in-app screen at MVP.

---

### Group 13: Referral Program (Phase 2)

| Screen | Route | Purpose |
|---|---|---|
| Referral Dashboard | /referrals | Track referrals sent, credits earned, referral link |

**Referral Dashboard contents (Phase 2):**
- Unique referral link (copy to clipboard)
- Referrals sent: list of emails invited + status (signed up / not yet)
- Credits earned: how many referrals have converted to paid
- Referral reward details (TBD when program is designed)

**Not in MVP.** Referral tracking link is part of GTM but the in-app UI is Phase 2. The transactional emails (doc 13, emails 16a and 16b) are pre-written and ready for when the program launches.

---

| Screen | Route | Purpose |
|---|---|---|
| Upgrade | /upgrade | Plan selection → Stripe checkout |

**Upgrade page:**
- Three plan cards (Solo | Agency | Office) with features and prices
- Current plan highlighted
- CTA → Stripe checkout (external)
- Shown when: trial exhausted, downgraded account, or navigated to from billing

---

## Screen Count Summary

| Group | Screens |
|---|---|
| Public / Auth | 15 |
| Onboarding | 4 |
| Dashboard / Calendar | 1 (+ client panel) |
| Client Management | 6 (+ DNC flag, + duplicate resolution flow) |
| Letter Generator | 3 |
| E&O Log | 2 (+ admin audit trail sub-screen) |
| Templates | 2 |
| Settings | 6 (+ data export) |
| Team Management | 2 |
| Approval Queue | 1 |
| Upgrade | 1 |
| Read-Only Archive | ops-assisted, not in-app screen |
| Referral Program | Phase 2 — 1 screen |
| **MVP Total (Phase 4)** | **43 screens** |

**MVP wireframe priority (what to design first):**
1. Renewal Calendar (primary daily use)
2. Letter Generator (core value action)
3. Onboarding flow (first-run experience)
4. E&O Log (E&O value prop demonstration)
5. Client Management (supporting workflow)
6. Settings — Agency Profile + Email Connection (required for letter generation)
7. Auth screens (signup, login, verification)
8. Billing / Upgrade (conversion)
9. Team + Approval Queue (Agency/Office differentiation)
