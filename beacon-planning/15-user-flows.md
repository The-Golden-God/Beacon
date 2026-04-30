# Beacon — User Flows

The step-by-step paths users take through Beacon for every key task. These are the flows that wireframes visualize. Every decision point, every branch, every edge case is mapped here.

---

## Flow 1: New Agent Signup → First Letter Sent

This is the most important flow. It must be completable in under 5 minutes. Every step that adds friction is a step that loses agents.

```
[Landing Page]
    ↓ Click "Start Free"
[Sign Up Page]
    → Enter email + password
    → Check "I agree to Terms of Service and Privacy Policy"
    → Click "Create Account"
    ↓
[Email Verification Pending]
    → "Check your inbox for a verification email"
    → Agent opens email → clicks "Confirm My Email Address"
    ↓
[Email Verified — Redirect to Onboarding Step 1]
```

**Onboarding (4 steps):**

```
[Step 1: Agency Info]
    → Enter: Agency name, Agent name, State, Phone, Email
    → Click "Continue"
    ↓
[Step 2: Communication Style]
    → Select tone: Formal | In Between | Conversational
    → Enter sign-off phrase (pre-filled: "Best,")
    → Click "Continue"
    ↓
[Step 3: Logo Upload — OPTIONAL]
    → Upload logo  →  Preview shown  →  Click "Continue"
    → OR click "Skip — I'll add this later"
    ↓
[Step 4: Import Clients or Skip]
    → Click "Import from CSV"  →  [CSV Import Flow — see Flow 3]
    → OR click "Go to Dashboard — I'll import later"
    ↓
[Dashboard / Renewal Calendar]
    → If no clients: shows empty state with "Import Clients" + "Add a Client Manually" CTAs
    → If clients imported: shows calendar with color-coded client cards
```

**First letter (from empty state):**

```
[Dashboard — Empty State]
    ↓ Click "Add a Client Manually"
[Add Client Form — /clients/new]
    → Enter: First name, Last name, Email, Policy type, Renewal date
    → Click "Save Client"
    ↓ Redirect to client detail page
    → Click "Generate Letter"
    ↓
[Letter Generator — pre-filled with client data]
    → Scenario auto-selected: Pre-Renewal Outreach (default)
    → Fields pre-filled from client record
    → Click "Generate"
    ↓ Letter streams into editor (5-15 seconds)
    → Agent reads letter
    → Agent edits (optional)
    → Click "Send" (if Gmail/Outlook connected) OR "Download PDF" OR "Copy to Clipboard"
    ↓ [If Send]
    → Toast: "Letter sent to [Client Name]. Logged to your E&O record."
    ↓
[First Letter Complete ✓]
```

**Branch: Agent tries to generate before onboarding signature is complete**
```
[Letter Generator]
    → Clicks "Generate"
    → Inline error: "Your letter signature is incomplete. Add your details in Settings → Agency Profile."
    → Link to /settings/agency
```

---

## Flow 2: Return Agent — Calendar → Generate → Send

The core daily workflow for an agent who has completed onboarding and has clients in the system.

```
[Login]
    → Enter email + password
    → Click "Log In"
    ↓
[Dashboard — Renewal Calendar]
    → Sees color-coded client cards
    → Red client (renewal within 30 days, no outreach): clicked
    ↓
[Client Panel slides in from right]
    → Shows: Client name, policy type, carrier, renewal date, premium
    → Shows: Letter history (none sent yet → red status)
    → Click "Generate Letter"
    ↓
[Letter Generator — /letters/new?clientId=[id]]
    → All fields pre-filled from client record
    → Scenario: Pre-Renewal Outreach (default — can change)
    → Review pre-filled fields — override any if needed
    → Click "Generate"
    ↓ Letter streams in (5-15 seconds)
    → Agent reads
    → Agent edits subject line (optional)
    → Agent edits letter body (optional) — auto-saves
    → Click "Send"
    ↓
[OAuth confirmation — if connected]
    → Letter sends from agent's Gmail/Outlook to client
    → Toast: "Letter sent to [Client Name] at [email]. Logged to your E&O record."
    ↓
[Letter Generator resets — ready for next client]
    → Client card on calendar updates to Green (letter sent)
```

**Branch: Gmail not connected**
```
[Letter Generator]
    → "Send" button is disabled
    → Tooltip: "Connect an email account to send letters"
    → Prompt below button: "Connect Gmail → " or "Connect Outlook →"
    ↓ [If agent clicks Connect Gmail]
    → Redirect to /settings/email
    → OAuth flow
    → Redirect back to /letters/new?clientId=[id] with success toast
```

**Branch: Client has no email address**
```
[Letter Generator]
    → "Send" button is disabled
    → Message: "This client has no email on file. Edit Client → to add one."
    → "Download PDF" and "Copy to Clipboard" are active
```

---

## Flow 3: CSV Import

```
[/clients/import]
    → Click "Choose CSV File" → file picker opens
    → Agent selects .csv file
    ↓
[Validation — instant]
    → If not .csv: inline error "This file isn't a CSV."
    → If empty: inline error "This file has no clients."
    → If >1,000 rows: inline error "File exceeds 1,000 client limit. Split and re-upload."
    ↓ [Valid file]
[Column Mapping UI]
    → CSV headers shown as rows
    → Each row has a dropdown: [Map to Beacon field ▼]
    → Beacon auto-matches obvious columns (First Name → first_name, etc.) — shows "Auto-matched" tag
    → Required fields with no match: red badge "Required — not mapped"
    → "Import [N] Clients" button — disabled until all required fields are mapped
    ↓ [All required fields mapped]
    → Click "Import [N] Clients"
    ↓
[Import Progress]
    → Progress bar with percentage: "Importing 234 of 500 clients..."
    ↓ [Complete]
[Import Result]
    → Success banner: "[N] clients imported successfully."
    → If errors: amber section "M rows had errors — Download Error Report"
    → CTA: "View Your Renewal Calendar"
```

---

## Flow 4: Email OAuth Connection (Gmail)

```
[/settings/email]
    → Gmail section shows: "Not connected"
    → Click "Connect Gmail"
    ↓
[Google OAuth — external, Google's UI]
    → Agent selects Google account
    → Agent sees permission screen: "Beacon wants to send email on your behalf"
    → Scope: gmail.send only
    → Click "Allow"
    ↓
[Redirect back to Beacon — /settings/email]
    → Success toast: "Gmail connected — [email@gmail.com]"
    → Gmail section updates: "Connected as [email@gmail.com]" + Disconnect button
```

**Branch: Agent disconnects Gmail**
```
[/settings/email]
    → Click "Disconnect"
    → Confirmation modal: "Disconnect Gmail? You won't be able to send letters from Beacon until you reconnect."
    → Click "Yes, Disconnect"
    → Gmail section reverts to "Not connected"
    → Any open Letter Generator tabs: Send button becomes disabled
```

**Branch: Token expired (agent is in Letter Generator)**
```
[Letter Generator]
    → Clicks "Send"
    → Toast: "Your Gmail connection has expired. Reconnect to continue sending." + "Reconnect" button
    → Click "Reconnect" → OAuth flow → returns to Letter Generator
    → Send retried automatically
```

---

## Flow 5: Free Trial → Upgrade to Paid

```
[Any screen — trial exhausted]
    → Generate button is disabled
    → Banner: "You've used all 10 free letters. Upgrade to keep writing."
    → Click "Upgrade Now"
    ↓
[/upgrade — Plan Selection]
    → Three plan cards: Solo | Agency | Office
    → Agent selects plan
    → Click "Subscribe — $[amount]/month"
    ↓
[Stripe Checkout — external]
    → Agent enters card details
    → Click "Subscribe"
    ↓
[Redirect back to Beacon — /dashboard]
    → Success toast: "You're subscribed. Unlimited letters unlocked."
    → Trial counter disappears from nav
    → Generate button is active
```

**Branch: Stripe payment fails**
```
[Stripe Checkout]
    → Card declined
    → Stripe shows inline error: "Your card was declined."
    → Agent updates payment info and retries
    → OR closes Stripe → returns to /upgrade with banner: "Payment wasn't processed. Try again."
```

---

## Flow 6: Password Reset

```
[/login]
    → Click "Forgot password?"
    ↓
[/forgot-password]
    → Enter email address
    → Click "Send Reset Link"
    → "If an account exists for that email, a reset link is on its way."
    ↓ [Agent receives email]
    → Click "Reset My Password"
    ↓
[/reset-password?token=[token]]
    → Enter new password
    → Confirm new password
    → Click "Set New Password"
    ↓
[Redirect to /login]
    → Success banner: "Password updated. Log in with your new password."
```

**Branch: Link expired**
```
[/reset-password?token=[expired_token]]
    → Full-page message: "This link has expired."
    → CTA: "Request a New Reset Link" → /forgot-password
```

---

## Flow 7: Team Invitation (Agency/Office Tier)

**Sent by agency owner / admin:**
```
[/team]
    → Click "Invite Agent"
    ↓
[Invite Agent modal or page]
    → Enter email address
    → Select role: Producer | Admin
    → Click "Send Invitation"
    → Confirmation: "Invitation sent to [email]."
    → Team page shows new entry with "Pending" status
    ↓ [Invited agent receives email]
```

**Accepted by invited agent:**
```
[Invitation email]
    → Click "Accept Invitation"
    ↓
[/invite/[token]]
    → If agent has no Beacon account:
        → Shows signup form (email pre-filled, cannot be changed)
        → Enter password + click "Create Account & Join [Agency Name]"
        → → Email verified automatically (invitation link = verified intent)
        → → Onboarding flow begins (Step 1: Agency Info pre-filled from agency)
    → If agent already has a Beacon account:
        → "You're already signed in as [email]. Click below to join [Agency Name]."
        → Click "Join [Agency Name]"
        → → Redirected to dashboard of the new workspace
```

**Branch: Invitation link expired**
```
[/invite/[expired_token]]
    → "This invitation has expired. Ask your agency owner to send a new one."
```

---

## Flow 8: E&O Log Export

```
[/log]
    → Apply filters if needed (date range, scenario type, producer)
    → Click "Export PDF"
    ↓
[Loading state]
    → Button shows "Generating PDF..."
    ↓ [PDF ready — typically 2-5 seconds]
    → Browser download dialog: beacon-eo-log-[date].pdf
    → Toast: "PDF exported successfully."
```

---

## Flow 9: Office Tier — Approval Queue

**Producer generates a letter that requires approval:**
```
[Letter Generator]
    → Agent generates letter (approval queue is enabled by admin)
    → After generation, "Send" button is replaced by "Submit for Approval"
    → Agent reviews/edits the letter
    → Click "Submit for Approval"
    → Toast: "Letter submitted for review. You'll be notified when it's approved."
    → Letter generator panel shows "Awaiting Approval" status
```

**Admin reviews and approves:**
```
[/queue — Approval Queue]
    → Queue badge on nav shows pending count
    → Admin clicks into pending letter
    → Reads full letter
    ↓
    Branch A: Approve
        → Click "Approve"
        → Letter status updates to "Approved"
        → Producer gets in-app notification: "[Admin] approved your letter to [Client]."
        → Producer's letter generator shows "Approved — Ready to Send" with Send button active
    Branch B: Return for Revision
        → Click "Return for Revision"
        → Text field appears: "Add a note for the producer"
        → Enter note + click "Return"
        → Producer gets in-app notification: "[Admin] returned your letter to [Client] for revision."
        → Producer sees admin note in the letter generator
        → Producer edits and resubmits
```

---

## Flow 10: Account Deletion

```
[/settings/agency — or account settings]
    → Scroll to bottom: "Delete Account" (danger zone, muted/hidden by default)
    → Click "Delete My Account"
    ↓
[Confirmation modal]
    → "Are you sure? This permanently deletes your account and all associated data within 30 days. Your E&O log is retained for 7 years per legal requirements."
    → Type "DELETE" to confirm
    → Click "Permanently Delete Account"
    ↓
[Logged out — redirected to /]
    → Email sent: "Your account deletion has been initiated. Your data will be fully removed within 30 days."
```

---

## Decision Points Summary

Key decisions that affect multiple flows — these need to be solved in wireframes, not improvised:

| Decision | Options | Recommendation |
|---|---|---|
| Onboarding: what if agent closes mid-flow? | Resume where left off | Save progress, redirect to where they left off on next login |
| Letter generator: single page or modal over calendar? | Full page | Full page /letters/new — panel from calendar is just a shortcut |
| Client panel: slide-over or modal? | Slide-over (doesn't leave calendar) | Slide-over preferred — agent stays oriented on the calendar |
| Mobile nav: sidebar or bottom bar? | Bottom tab bar | Bottom tabs on mobile — sidebar on desktop |
| Settings: separate pages or one page with sections? | Separate pages with sidebar nav | Separate pages — cleaner per-section URL, easier to link from errors |
| Trial counter: where does it live? | In the nav bar | Small badge/pill in the top nav — visible but not intrusive |
| Empty state (no clients): show calendar grid or not? | No grid | Just illustration + CTAs — grid with no data is confusing |
| Approval queue access: from nav or settings? | From nav (admin only) | Nav item visible to admin role only |
