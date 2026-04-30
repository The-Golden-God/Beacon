# Wireframe 08 — Billing & Upgrade

Routes: `/upgrade`
(Billing settings at `/settings/billing` are in wireframe 06.)

---

## Screen: Upgrade (`/upgrade`)

Shown when:
- Free trial exhausted (Generate button disabled, banner shows)
- Agent navigates from Billing settings
- Downgraded/cancelled account reactivating

### Layout

```
APP SHELL (sidebar + top bar)
Top bar title: "Choose a Plan"
Top bar right: [← Back] (text link — goes back to previous page)

CONTENT (centered, max-width 900px):

  HEADING: "Unlock unlimited letters"
  SUBTEXT: "Cancel anytime. No long-term contracts."

  ─────────────────────────────────────────────────────
  PLAN CARDS (3 cards, horizontal on desktop, stacked on mobile):

  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
  │   SOLO           │ │  AGENCY  ★ POPULAR│ │   OFFICE         │
  │   $149/month     │ │  $299/month       │ │   $499/month     │
  │                  │ │                  │ │                  │
  │  1 agent         │ │  2–5 agents       │ │  6–15 agents     │
  │  Unlimited ltrs  │ │  Unlimited ltrs   │ │  Unlimited ltrs  │
  │  E&O log         │ │  E&O log          │ │  E&O log         │
  │  Gmail + Outlook │ │  Gmail + Outlook  │ │  Gmail + Outlook │
  │  PDF export      │ │  PDF export       │ │  PDF export      │
  │                  │ │  Team history     │ │  Team history    │
  │                  │ │  Producer reports │ │  Shared templates│
  │                  │ │                  │ │  Bulk generation │
  │                  │ │                  │ │  Approval queue  │
  │                  │ │                  │ │  Priority support│
  │                  │ │                  │ │                  │
  │ [Subscribe]      │ │ [Subscribe]       │ │ [Subscribe]      │
  │ (primary btn)    │ │ (primary btn)     │ │ (primary btn)    │
  └──────────────────┘ └──────────────────┘ └──────────────────┘

  ─────────────────────────────────────────────────────
  FOOTER COPY (small, centered):
    ✓ Cancel anytime   ✓ No contracts   ✓ Secure payment via Stripe
  ─────────────────────────────────────────────────────
```

### Plan Card — Visual States

**Current plan** (if agent already has a plan):
- Card border: 2px brand color
- "Your current plan" badge at top of card
- Subscribe button replaced with "Current Plan" (disabled, grey)

**Recommended / Most Popular:**
- "AGENCY" card: "★ Most Popular" badge in top-right corner of card
- Slightly elevated shadow

**Free trial agent upgrading:**
- All 3 Subscribe buttons are active
- No "current plan" badge on any card

### Subscribe Button Action

1. Click [Subscribe $X/month] → redirect to Stripe Checkout (external)
2. Agent enters card details on Stripe
3. On success → redirect to `/dashboard`
4. Success toast: "You're subscribed. Unlimited letters unlocked."
5. Trial counter disappears from nav
6. Generate button re-activates everywhere

### Stripe Payment Failure

Agent returns from Stripe without completing purchase:
- Returns to `/upgrade` (Stripe redirects back on cancel)
- Amber banner at top: "Your payment wasn't completed. Select a plan to try again."

---

## Trial Exhaustion Banner (shown across all authenticated screens)

When free trial letters hit 0:

```
BANNER (full width, amber, sticky top below top bar):
  ⚠ You've used all 10 free letters. Upgrade to keep writing.
  [Upgrade Now →] (link → /upgrade)   [✕ dismiss] (per-session only)
```

- Letter Generator: Generate button disabled, same banner shown inline at top of left panel
- Banner appears on every page until subscribed
- Dismissing hides for the current session only (reappears on next login)
