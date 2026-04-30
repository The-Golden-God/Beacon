# Wireframe 12 — States Supplement

All loading states, error states, and global states documented in the error-states planning doc (02-error-states.md) that supplement the existing wireframe specs. Every state here must be implemented — no screen should ever show a blank, a raw error, or a dead end.

---

## RENEWAL CALENDAR — Additional States

### Loading State (first load or refresh)

- Calendar grid renders immediately with skeleton placeholders
- Skeleton: grey rounded rectangles where client cards will appear, CSS shimmer animation
- Calendar header (month/year, navigation arrows) visible immediately with real data
- No overlay spinner — skeleton only
- If data load exceeds 5 seconds: amber toast at bottom "Taking longer than usual... still loading."
- If data load exceeds 15 seconds: inline message replaces skeleton grid:
  "This is taking a while. Try refreshing the page." + [Refresh] button

### Error State — Calendar Fails to Load

Replaces calendar grid entirely:
```
  [Inline message, centered in content area]:

  Couldn't load your calendar.
  We hit a problem loading your client data. This is on us, not you.

  [Try Again]  (retries the fetch)
  "Refresh the page" (text link)
```

### Empty State — No Clients Match Current Filter

(Different from "no clients at all" — filters are applied but return 0 results)
```
  No clients match this filter.
  Try widening your date range or clearing the filter to see all clients.

  [Clear Filter] (button)
```

---

## LETTER GENERATOR — Additional States

### Empty State — No Client Selected (generator open, no client)

Shown in the right panel before any client is selected:
```
  [Centered in editor area, grey placeholder text]:

  Choose a client to get started.
  Select a client from your renewal calendar or client list.
  Their details will pre-fill the letter automatically.

  [Go to Renewal Calendar] (primary button → /dashboard)
  Go to Client List (text link → /clients)
```

Generate button: disabled, tooltip "Select a client to generate a letter"

### Empty State — Client Selected, Not Yet Generated

After client + scenario selected, before Generate is clicked:
```
  [Tiptap editor shows grey placeholder, non-editable]:

  "Your letter will appear here after you click Generate.
   It usually takes 5–15 seconds."
```

Subject line field: empty, placeholder "Subject line will appear after generation"

### Generating State — Active Stream

- Generate button: label changes to "Generating...", spinner icon, disabled
- Tiptap editor: read-only during stream
- Text streams in word-by-word (real token stream, not fake animation)
- Small label above editor: "Writing your letter..."
- If first token doesn't appear within 5 seconds: message below editor: "Still working... this can take up to 15 seconds."
- No cancel button in MVP

### Error State — Generation Timeout (>20 seconds, no completion)

Shown below the editor:
```
  Letter generation timed out.
  This took longer than expected. The draft below may be
  incomplete — review it carefully before sending.

  [Try Again]  [Write Manually]
```

- If partial content exists: shown in editor (editable)
- If no content: editor is empty and editable ("Write Manually" enables it)

### Error State — Claude API Down (Anthropic 5xx)

Shown in place of the generating state:
```
  Letter generation is temporarily unavailable.
  Our AI writing service is experiencing an issue.
  We're monitoring it automatically — it typically
  resolves within a few minutes.

  [Try Again in 5 Minutes] (disabled for 5 min, countdown shown)
  [Write Manually]
```

BullMQ retry queued automatically. If letter completes within 30 minutes, in-app toast (persists until dismissed, does not auto-dismiss):
"Your letter is ready — we finished generating it while you were away."
[View Letter →] (link → `/letters/[id]` for the completed draft letter — opens in letter view, read-only, with option to edit by re-opening in generator)
If agent has already navigated to /letters/new with a different letter in progress: the toast appears but does not disrupt the current session.

**BullMQ Completed Letter — Unreviewed State:**
When a letter is completed by BullMQ while the agent was away (async completion), it is flagged as "Unreviewed" in the E&O log until the agent opens it. The E&O log row shows an amber "Unreviewed" badge:
```
[Date/Time]  [Client]  [Scenario]  [Producer]  ⚠ Unreviewed  [View]
```
The badge clears when the agent opens the Letter View (`/letters/[id]`). This ensures no BullMQ-completed letter enters the E&O record without the agent's awareness — they must view it before it is marked as reviewed. The letter is NOT automatically sent; the agent must review and manually click Send.

### Error State — Rate Limit Hit (100 letters/hour per workspace)

Shown in place of Generate button behavior:
```
  You've reached the hourly generation limit.
  Beacon allows up to 100 letter generations per hour.
  This limit resets in [countdown timer].

  If you need this limit raised, contact
  support@get-monolith.com.
```

Generate button: disabled. Countdown timer to reset. Auto-re-enables when timer hits 0.

### Error State — Generic Generation Failure

```
  Something went wrong.
  We hit an unexpected error while generating your letter.
  Our team has been notified automatically.

  [Try Again]  [Write Manually]
```

### Error State — Letter Auto-Save Failure

**First failure:**
Status indicator above action bar changes from "Saved ✓" to amber warning:
```
  [Amber status indicator]: "Changes not saved — check your connection"
  [Try Saving Now]  [Copy to Clipboard]
```

**After 3 consecutive save failures:**
Persistent amber banner above editor:
```
  ⚠ We're having trouble saving your edits.
    Copy your letter to clipboard now before refreshing.
  [Copy to Clipboard]  [Try Saving Now]
```

Sentry log: save failure count, elapsed time since last successful save, session token validity.

### Send Error States (additional, supplement to wireframe 02)

**OAuth Token Expired:**
Toast (red): "Your [Gmail / Outlook] connection has expired. Reconnect your email to continue sending."
[Reconnect Email] button in toast → OAuth flow → automatically retries send after reconnect.

**Gmail/Outlook API 5xx:**
Toast (red): "Your letter couldn't be sent due to a [Gmail / Outlook] error. Try again in a moment."
[Try Again] in toast.
Letter NOT logged as "sent" — remains in draft status.

**Send Rate Limit (>50 sends/hour):**
Toast (amber): "You've sent 50 letters in the last hour. To protect your email's deliverability, we've paused sending for [X] minutes. You can still download as PDF or copy to clipboard."
Send button: disabled for remainder of hour. Download PDF and Copy remain active.

**PDF Download Failure:**
Toast (red): "PDF download failed. Try again — if the issue continues, use Copy to Clipboard instead."

---

### Collision Warning State (Letter Generator)

Triggered when the agent opens the letter generator for a client who has already received a sent letter within the last 24 hours. Shown as an amber banner at the top of the right panel (above the editor), before generation:

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠ A letter was already sent to [Client Name] today              │
│    ([Scenario name] · sent [X hours] ago)                        │
│    Generating another letter within 24 hours is unusual.         │
│    [View the sent letter →]  [Continue anyway]                   │
└──────────────────────────────────────────────────────────────────┘
```

- The Generate button remains enabled — this is informational only, not a blocker
- "View the sent letter" links to `/letters/[id]` of the most recently sent letter for that client
- "Continue anyway" dismisses the banner (persists until dismissed or page navigation)
- Banner does not appear if the prior letter was generated but NOT sent (only triggers on sent letters)
- Banner does not appear during the generation itself — only in the initial pre-generation state

---

## AUTH — Additional States

### Login: Session Expired

When agent is redirected to `/login` with `?reason=session_expired`:

```
AMBER BANNER at top of login card (only shows when this query param is present):
  "Your session expired. Log in to continue."
```

Not shown on any other login visit.

### Login: 5 Failed Attempts (Rate Limit)

After 5 consecutive incorrect password attempts, inline error changes to:
```
  Too many failed attempts. Please wait 15 minutes
  before trying again, or reset your password.

  [Reset My Password] (link → /forgot-password)
```

Login button: disabled for 15 minutes with countdown. Subsequent attempts during lockout: same message, counter does not reset.

---

## BILLING — Global Persistent States

These states affect the entire app shell — they appear on every authenticated page until resolved.

### Payment Failed (Recurring Billing Failure)

Stripe webhook fires `invoice.payment_failed`.

**In-app banner (red, full width, sticky below top bar, every page):**
```
  ⚠ Your last payment failed.
    Update your payment method to keep your Beacon account active.
    You have a 3-day grace period — access available until [DATE].
  [Update Payment Method →] (opens Stripe Customer Portal)
```

Simultaneously: transactional email sent to agent's email (see doc 13).

### Grace Period Active

3 days after payment failure, if not resolved:

**In-app banner (amber, full width, sticky, every page):**
```
  ⚠ Your account is in a grace period.
    Update your payment method by [DATE at TIME] to avoid
    losing access.
  [Update Payment Method →]
```

### Account Downgraded (Grace Period Ended)

After grace period with no payment update:

**Full-screen modal (cannot be dismissed — blocks all app interaction):**
```
  Heading: "Your subscription has ended"

  Your Beacon account has been downgraded to the free tier.
  You can still access your E&O log and client list, but
  letter generation is limited to 10 total.

  Upgrade to restore unlimited access.

  [Upgrade Now]
  "Contact Support" (text link)
```

Agent retains read access to all historical data. Generate button disabled with trial exhausted message.

### Subscription Cancelled (Active Until End of Period)

After agent cancels via Stripe portal:

Toast (green): "Your subscription has been cancelled. You'll keep full access until [END DATE]."

Billing settings page shows:
```
  Subscription: Cancelled — Active until [END DATE]
  [Reactivate Subscription] (secondary button → /upgrade)
```

No other changes to product UI until billing period ends.

---

## GLOBAL STATES (App-Wide)

### Network Offline

When browser `navigator.onLine` fires `offline` event:

**Persistent amber banner (top of all pages, below nav bar):**
```
  You appear to be offline. Some features may not work
  until your connection is restored.
```

- Appears automatically on connection loss
- Disappears automatically when connection restores
- No user action required

### Maintenance Mode

All routes redirect to `/maintenance` page (see wireframe 07).
Triggered by `MAINTENANCE_MODE=true` Railway env var → middleware intercept.
E&O log data never touched during maintenance.

---

## CLIENT MANAGEMENT — Additional States

### Client Save Failure (Add or Edit)

Inline error below form (red), form stays open with agent's edits intact:
```
  Changes couldn't be saved. Check your connection and try again.
  [Try Again]  "Discard Changes" (text link — reverts to last saved state)
```

### Client List — Load Failure

```
  Couldn't load your clients.
  We hit a problem fetching your client list.
  [Refresh Page]
```

---

## E&O LOG — Additional States

### Log — Loading State

Skeleton rows (grey placeholder bars) in the table while data fetches.
If over 10 seconds: "Taking longer than usual... still loading."

### Log — Export PDF Failure

Toast (red): "PDF export failed. Try again. If this keeps happening, contact support@get-monolith.com."

---

## TEAM — Additional States

### Invite Error — Email Already Has Account

Inline error below email field in invite modal:
```
  [email@domain.com] already has a Beacon account.
  Contact support@get-monolith.com if you need help.
```

### Invite Error — Tier Agent Limit Reached

Inline error below email field, or on hover of disabled Invite button:
```
  You've reached the [5 / 15]-agent limit for your
  [Agency / Office] plan. Upgrade to add more agents,
  or remove an existing agent first.
```

---

## APPROVAL QUEUE — Additional States

### Approval Queue — Load Failure

```
  Approval queue unavailable.
  We couldn't load the approval queue.
  Letters your producers submitted are safe. Try refreshing.
  [Refresh Page]
```

### Letter Returned for Revision — Producer View

In letter generator, admin note shown in amber box:
```
  ┌────────────────────────────────────────────────┐
  │ ⚠ Returned for revision by [Admin Name]       │
  │                                                │
  │ "[Admin's revision note text]"                 │
  │                                                │
  │ Edit the letter below and click Resubmit.      │
  └────────────────────────────────────────────────┘
```

[Resubmit] button appears after producer makes any edit to the letter.

---

## ONBOARDING — Additional States

### Logo Upload — File Too Large (>2MB)

Inline error below upload zone (before upload attempted):
```
  This image is too large. Maximum file size is 2MB.
  Please reduce the image size and try again.
```

### Logo Upload — Unsupported Format

Inline error:
```
  This file type isn't supported.
  Please upload a PNG, JPG, or SVG.
```

### Logo Upload — Upload Fails (Server Error)

Inline error (after attempted upload):
```
  Logo upload failed. Try again with a different image.
  Accepted formats: PNG, JPG, SVG. Maximum size: 2MB.
```

---

## TRIAL COUNTER — Detailed States (supplement to App Shell spec)

| Remaining | Location | Display | Style |
|---|---|---|---|
| 10–4 | Sidebar below logo | "X letters remaining" | Normal pill, grey |
| 3 | Sidebar | "3 free letters left — upgrade anytime" | Amber pill |
| 1 | Sidebar | "1 free letter left" | Amber pill, bold |
| 0 | Sidebar + banner | "0 letters remaining — Upgrade" | Red pill + upgrade banner |

At 0:
- Trial pill in sidebar: red, links to `/upgrade`
- Generate button: disabled with inline message "You've used all your free letters. [Upgrade Now →]"
- Full-width amber banner appears on every page (see wireframe 08)
