# Wireframe 06 — Settings

Routes: `/settings` (redirects to `/settings/agency`), `/settings/agency`, `/settings/style`, `/settings/email`, `/settings/billing`, `/settings/notifications`

---

## Settings Shell

All settings pages share this layout.

```
APP SHELL (main nav sidebar still present)

CONTENT AREA:
┌──────────────────────────────────────────────────────────────────┐
│  SETTINGS SIDEBAR (200px, left):    │  SETTINGS CONTENT (fluid)  │
│                                     │                            │
│  [Agency Profile]   ← active item  │  [Page-specific content]  │
│  [Communication Style]              │                            │
│  [Email Connection]                 │                            │
│  [Billing]                          │                            │
│  [Notifications]                    │                            │
│   (Phase 2 — greyed out, "Coming")  │                            │
└──────────────────────────────────────────────────────────────────┘
```

Settings sidebar: same link style as main nav. Active item: bold, accent left border.
On mobile: settings sidebar becomes a horizontal tab strip at the top of the content area.

---

## Settings: Agency Profile (`/settings/agency`)

```
CONTENT HEADING: "Agency Profile"
SUBTEXT: "This information appears in your letter signature."

FORM:
─────────────────────────────────────
Agency Name *        [______________________]
Agent Name *         [______________________]
State *              [Dropdown ▼]
Phone                [______________________]
Work Email *         [______________________]
─────────────────────────────────────
LOGO
  Current logo: [image preview, 120px wide] OR "No logo uploaded"
  [Replace Logo] (secondary button)  [Remove] (text link, only if logo exists)
  Upload zone (same as onboarding — PNG/JPG/SVG, 2MB max)

─────────────────────────────────────
[Save Changes] (primary button)
[Discard Changes] (text link — only appears if unsaved changes exist)

─────────────────────────────────────
DANGER ZONE (collapsible, collapsed by default):
  ┌──────────────────────────────────────────────────┐
  │  Delete Account                                  │
  │  "Permanently delete your account and all data." │
  │  [Delete My Account] (red, secondary button)     │
  └──────────────────────────────────────────────────┘
```

**Save behavior:** Explicit save (not auto-save). "Save Changes" button only active if form is dirty.
**Success:** Toast "Agency profile updated." on save.

**Delete Account — confirmation modal:**
```
"Are you sure?"
"This permanently deletes your account and all associated data within 30 days.
Your E&O log is retained for 7 years per legal requirements."

Type "DELETE" to confirm: [____________]
[Cancel]  [Permanently Delete Account] (red — only active when "DELETE" typed)
```

**After deletion confirmed:**
- Session ended immediately
- Redirect to `/` (landing page)
- Landing page shows one-time banner (green): "Your account deletion has been initiated. Your data will be fully removed within 30 days."
- Transactional email sent to the agent's registered email confirming deletion initiated

---

## Settings: Communication Style (`/settings/style`)

```
CONTENT HEADING: "Communication Style"
SUBTEXT: "Beacon uses this to match your voice in every letter."

FORM:
─────────────────────────────────────
Your Communication Tone *

  [○] Formal
  [●] In Between (selected by default)
  [○] Conversational

─────────────────────────────────────
Sign-Off Phrase *

  [Best,          ] (text input, pre-filled)

─────────────────────────────────────
[Save Changes]
[Discard Changes] (appears if dirty)
```

Same explicit save behavior as Agency Profile.

---

## Settings: Email Connection (`/settings/email`)

```
CONTENT HEADING: "Email Connection"
SUBTEXT: "Letters send from your email address — not from Beacon."

─────────────────────────────────────
GMAIL SECTION:
  [Gmail logo]  Gmail

  STATE A — Not connected:
    Status: ○ Not connected (grey dot)
    [Connect Gmail] (primary button)

  STATE B — Connected:
    Status: ● Connected (green dot)
    "Connected as sarah@independentagency.com"
    [Disconnect] (secondary button, grey)

  STATE C — Token expired:
    Status: ⚠ Expired (red dot)
    "Your Gmail connection has expired."
    [Reconnect Gmail] (primary button)

─────────────────────────────────────
OUTLOOK SECTION:
  [Outlook logo]  Outlook
  [Same three states as Gmail, independent]

─────────────────────────────────────
INFO BOX (grey, below connections):
  ℹ "Letters send directly from your email account.
    Beacon only requests permission to send — it cannot
    read your inbox."
```

**Connect Gmail flow:**
1. Click "Connect Gmail" → redirect to Google OAuth
2. Google: select account → permission screen → Allow
3. Redirect back to `/settings/email` → success toast "Gmail connected — sarah@example.com"

**Disconnect confirmation modal:**
```
"Disconnect Gmail?"
"You won't be able to send letters from Beacon until you reconnect."
[Cancel]  [Yes, Disconnect]
```

---

## Settings: Billing (`/settings/billing`)

```
CONTENT HEADING: "Billing"

─────────────────────────────────────
CURRENT PLAN CARD:
  Plan: [Solo / Agency / Office / Free Trial]
  Price: $149/month
  Renews: June 1, 2026
  [Manage Subscription →] (opens Stripe Customer Portal in new tab)

─────────────────────────────────────
FREE TRIAL STATE (if on trial):
  Plan: Free Trial
  [Trial letter counter pill: "7 letters remaining"]
  [Upgrade Now →] (primary button → /upgrade)

─────────────────────────────────────
PAYMENT METHOD:
  Visa ending in 4242  [Update →] (link → Stripe portal)

─────────────────────────────────────
INVOICE HISTORY:
  [Date]  [Amount]  [Status]  [Download PDF]
  (pulled from Stripe — most recent 12 invoices)
  [View all invoices →] (link → Stripe portal)

─────────────────────────────────────
CANCEL / DOWNGRADE:
  "Need to cancel? Manage your subscription in the billing portal."
  [Manage Subscription →]
  (No in-app cancel flow — all subscription changes go through Stripe portal)

─────────────────────────────────────
DOWNGRADED / CANCELLED STATE:
  Plan: Free Tier (downgraded)  OR  Solo — Cancelled, active until [date]
  [Reactivate Subscription →] (primary button → /upgrade)
  "Your client list, E&O log, and templates are all still here."
```

---

## Settings: Notifications (`/settings/notifications`)

Phase 2 — not in MVP. Show as:

```
CONTENT HEADING: "Notifications"

  ┌──────────────────────────────────────────┐
  │                                          │
  │   [Bell illustration]                   │
  │                                          │
  │   Notification preferences              │
  │   are coming soon.                      │
  │                                          │
  └──────────────────────────────────────────┘
```
