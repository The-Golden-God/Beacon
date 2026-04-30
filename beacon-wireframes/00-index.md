# Beacon — Wireframe Specs Index

All 41 screens. Priority order matches build sequence.

---

| File | Screens Covered | Priority |
|---|---|---|
| [01-renewal-calendar.md](01-renewal-calendar.md) | Dashboard (calendar + list + client panel) | 1 |
| [02-letter-generator.md](02-letter-generator.md) | Letter Generator, Letter View | 2 |
| [03-onboarding.md](03-onboarding.md) | Onboarding Steps 1–4 | 3 |
| [04-eo-log.md](04-eo-log.md) | E&O Log, Log Entry Detail | 4 |
| [05-client-management.md](05-client-management.md) | Client List, Add, Detail, Edit, CSV Import | 5 |
| [06-settings.md](06-settings.md) | Agency Profile, Style, Email, Billing, Notifications | 6 |
| [07-auth.md](07-auth.md) | Sign Up, Log In, Verify Email, Forgot/Reset Password, Invite Accept, 404/500 | 7 |
| [08-billing-upgrade.md](08-billing-upgrade.md) | Upgrade page, Billing settings | 8 |
| [09-team-queue.md](09-team-queue.md) | Team Management, Approval Queue | 9 |
| [10-landing-pricing.md](10-landing-pricing.md) | Landing page, Pricing page, Privacy Policy, Terms of Service | 10 |
| [11-templates.md](11-templates.md) | Templates list, Template Detail | 11 |
| [12-states-supplement.md](12-states-supplement.md) | All loading, error, and global states (supplement to all screens) | — |

---

## App Shell (Applies to All Authenticated Screens)

All authenticated pages share this outer shell. Define it once, reference it everywhere.

### Desktop Shell (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed, full height)                                    │
│  [Logo — Beacon wordmark, top 24px padding]                          │
│  [Trial badge — "X letters remaining" — shown only during free trial]│
│  ─────────────────────────────────────────────────────               │
│  NAV ITEMS (icon + label, 40px tall each, 12px side padding):        │
│    📅 Calendar        → /dashboard                                   │
│    👥 Clients         → /clients                                     │
│    📄 Letters         → /letters/new                                 │
│    🛡 Log             → /log                                         │
│    ⚙️  Settings        → /settings                                   │
│  ─────────────────────────────────────────────────────               │
│  ADMIN-ONLY items (Agency/Office tiers, Admin role only):            │
│    👤 Team            → /team                                        │
│    📥 Queue           → /queue  [badge: N pending if N > 0]          │
│  ─────────────────────────────────────────────────────               │
│  BOTTOM:                                                              │
│    [Agent avatar + name]  ↓ dropdown: Profile | Sign Out             │
├──────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT AREA (fluid, full remaining width)                       │
│  TOP BAR (48px, full width):                                          │
│    Left: Page title (H1, 20px)                                       │
│    Right: [Notification bell — Phase 2 placeholder] [Account menu]  │
│  ─────────────────────────────────────────────────────               │
│  PAGE CONTENT (below top bar, scrollable)                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile Shell (< 768px)

```
┌─────────────────────────────────┐
│ TOP BAR (48px):                 │
│  Left: Beacon logo (icon only)  │
│  Right: Account avatar          │
├─────────────────────────────────┤
│ PAGE CONTENT (scrollable)       │
│  (full screen height minus bars)│
├─────────────────────────────────┤
│ BOTTOM TAB BAR (56px fixed):    │
│  📅 | 👥 | 📄 | 🛡 | ⚙️         │
│  (Queue/Team not in bottom bar  │
│   — accessed via Settings link) │
└─────────────────────────────────┘
```

### Active nav state
- Selected item: filled icon, accent color background (e.g. slate-100 or brand blue-50), font-medium
- Unselected: outlined icon, default text color

### Trial badge
- Location: below logo, above nav items
- Style: amber pill, text "8 letters remaining" (updates live)
- On 0 remaining: red pill, text "0 letters remaining — Upgrade"
- Clicking badge → /upgrade
- Hidden once subscribed

### Account menu dropdown (top-right avatar)
- "Profile" → `/settings/agency`
- "Billing" → `/settings/billing`
- "Sign Out" → immediate logout, redirect to `/login` (no confirmation modal)

### Workspace Switcher
At MVP, each agent belongs to exactly one workspace. The workspace switcher UI is not implemented in MVP. If a future release supports multi-workspace accounts (e.g., a broker who manages multiple agency workspaces), a workspace picker will appear in the sidebar below the logo. For now, the workspace name is shown as static text in the sidebar — no dropdown.

### Client Status Transition Rules

Status is computed server-side on each page load — it is never stored as a field. The computation logic:

| Priority | Condition | Status |
|---|---|---|
| 1 (highest) | At least one letter sent via Beacon for this client | **Contacted** (green) |
| 2 | Renewal date unknown or in the past by >7 days | **Inactive** (slate) |
| 3 | Renewal date within 30 days | **Urgent** (red) |
| 4 | Renewal date within 31–60 days | **Upcoming** (amber) |
| 5 (lowest) | Renewal date more than 60 days out | **Scheduled** (blue) |

Priority 1 takes precedence over all others — a client with a renewal in 5 days who has received a letter shows as Contacted, not Urgent. The intent is to show the agent where action is still needed.

"Sent" means logged in the E&O log with send status = Sent. Letters that were generated but not sent do not change status. Letters that were submitted for approval but not yet approved do not change status.

A client reverts from Contacted to Urgent/Upcoming/Scheduled if their renewal date rolls past and a new renewal date is entered — the "letter sent" window is tied to the renewal cycle, not the account lifetime.

### Do Not Contact (DNC) Flag

Clients can be marked "Do Not Contact" on their edit screen. DNC affects UI only — it does not prevent letter generation, but surfaces a warning. See wireframe 05 for DNC flag spec on the client record.

### Templates navigation
Templates (`/templates`) is **not in the primary nav**. It is accessed via:
1. "Browse Saved Templates" link in the Letter Generator left panel (below scenario picker) — see wireframe 02
2. Direct URL `/templates` (e.g. from a future email or bookmark)

Rationale: Templates is a secondary feature (starting point for letter generation) that lives within the letter workflow, not a top-level destination.

### Access control for admin-only pages
- `/team` and `/queue`: If a non-admin or non-Agency/Office-tier user navigates directly via URL → redirect to `/dashboard` with toast "You don't have access to that page."
- `/onboarding/*`: If an already-onboarded user navigates directly → redirect to `/dashboard`.
- **Any app route** (e.g. `/dashboard`, `/clients`, `/letters/new`): If agent is mid-onboarding (Steps 1 or 2 not complete) and navigates directly → redirect to their last incomplete onboarding step. Steps 1 and 2 are gates; the app is inaccessible until both are complete. Step 3 (logo) and Step 4 (import) can be skipped.

---

## Color Coding System (Renewal Status)

**Accessibility requirement (DOD):** Color is never the sole indicator. Every status must have both a color AND a text label. Colorblind users must be able to distinguish statuses without relying on color.

**Note on DOD vs. wireframe:** The DOD defines 4 statuses with amber covering 31–90 days as a single bucket. This wireframe intentionally expands to 5 statuses by splitting that range: amber (31–60 days, action needed soon) vs. blue (>60 days, not yet urgent). This gives agents a clearer priority signal without requiring interpretation of the renewal date. The blue "Scheduled" status replaces the need to read dates for clients who are well ahead of renewal.

| Status | Color | Text Label | Meaning |
|---|---|---|---|
| Urgent | red-500 / red-100 bg | "Urgent" | Renewal within 30 days, no outreach sent |
| Upcoming | amber-500 / amber-100 bg | "Upcoming" | Renewal within 31–60 days, no outreach sent |
| Contacted | green-500 / green-100 bg | "Contacted" | Outreach sent — letter logged in E&O |
| Scheduled | blue-500 / blue-100 bg | "Scheduled" | Renewal > 60 days out, no outreach yet |
| Inactive | slate-400 / slate-100 bg | "Inactive" | Renewal date unknown or past |

On client cards: status dot + text label displayed together (e.g. `● Urgent`).
On the calendar grid, full label shown on cards ≥ 60px wide; dot only on narrower cards (with aria-label on the dot element).
