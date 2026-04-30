# Wireframe 01 — Renewal Calendar (Dashboard)

Routes: `/dashboard` (calendar view), `/dashboard?view=list` (list view)
Client panel is a slide-over, not a separate route.

---

## Screen: Renewal Calendar — Default (Calendar View)

### Layout

```
APP SHELL (sidebar + top bar — see 00-index.md)

CONTENT AREA:
┌─────────────────────────────────────────────────────────────┐
│ TOOLBAR (48px, sticky below top bar)                         │
│  Left:  [← Prev Month]  [Month Year label]  [Next Month →]  │
│          e.g. "May 2026"                                     │
│  Right: [Date Range Picker ▼]  [Producer ▼]  [Search 🔍]   │
│          (Producer dropdown admin-only)                      │
│          [Calendar | List] toggle (icon buttons, right end) │
└─────────────────────────────────────────────────────────────┘

CALENDAR GRID:
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ Sun    │ Mon    │ Tue    │ Wed    │ Thu    │ Fri    │ Sat    │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ [day#] │ [day#] │ [day#] │ [day#] │ [day#] │ [day#] │ [day#] │
│ [card] │ [card] │        │ [card] │        │        │        │
│ [card] │        │        │        │        │        │        │
├────────┼────────┼── ... ─┴────────┴────────┴────────┴────────┤
│  ...   (5–6 rows of weeks for the month)                      │
└───────────────────────────────────────────────────────────────┘
```

### Calendar Grid — Cell Spec

Each day cell:
- **Header:** Day number (small, grey, top-left of cell)
- **Today:** Day number circle highlighted (brand color)
- **Client cards:** Stacked vertically, max 3 visible. If more: "+N more" link that expands inline.
- **Cell min-height:** 96px desktop, auto mobile
- **Empty days:** Just the day number, no content

### Client Card (inside calendar cell)

```
┌─────────────────────────────────┐
│ ● Urgent                        │
│ [Client Name]          [Pill]   │
│ [Policy type] · [Carrier]       │
└─────────────────────────────────┘
```

- **Status indicator:** Color dot + text label (e.g. `● Urgent`, `● Contacted`). Color alone is never the sole indicator — accessibility requirement (DOD). See full status label table in 00-index.md.
- **Pill:** Renewal date formatted as "May 15" — only shown if date is the key info
- **Producer attribution badge (Admin view, "All Producers" selected):** Small agent initials or avatar badge in the bottom-right corner of the card, e.g. `JS` for Jake Smith. On hover: tooltip "[Producer Name]'s client". Not shown when producer filter is set to a specific agent (redundant in that case).
- **Click action:** Opens Client Panel slide-over (does not navigate away)
- **Card width:** Full cell width
- **Card height:** ~52px
- **Hover:** Subtle shadow, cursor pointer

**Collision warning on client cards:**
If a letter was already sent to this client within the last 24 hours, the client card shows an amber warning pill: `⚠ Sent today`. Clicking "Generate Letter" for that client triggers a modal:
```
"A letter was already sent to [Client Name] today ([time] ago).
Are you sure you want to generate another letter?"
[Cancel]  [Generate Anyway]
```
This is a warning only — it does not block generation.

### Toolbar Controls

**Date Range Picker:**
- Default: Current month + 60 days ahead
- Options: This month | Next 30 days | Next 60 days | Next 90 days | Custom range
- Changing range re-renders the calendar to show the selected window

**Producer Dropdown (Admin only):**
- Default: "All Producers"
- Options: each agent name in workspace
- Filters client cards to show only that agent's clients

**Search:**
- Inline search input, expands on click (or always visible on desktop)
- Searches client first + last name, live filter
- Matching clients highlighted; non-matching faded

**View Toggle:**
- Calendar icon | List icon, side by side
- Selected view button: filled/active state
- Clicking List → `/dashboard?view=list`

---

## Screen: Renewal Calendar — Empty State (No Clients)

Replaces calendar grid entirely when workspace has 0 clients.

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│           [Illustration: calendar with no events]        │
│                                                           │
│             Your renewal calendar is empty.              │
│      Add your clients to start tracking renewals.        │
│                                                           │
│   [Import from CSV]          [Add a Client Manually]     │
│   (primary button)           (secondary button)          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

- No calendar grid is shown — just illustration + copy + CTAs
- Import from CSV → `/clients/import`
- Add a Client Manually → `/clients/new`

---

## Screen: Renewal Calendar — List View (`/dashboard?view=list`)

Same toolbar as calendar view. Grid replaced with a sortable table.

### Table layout

```
┌────────────────────────────────────────────────────────────────┐
│ TOOLBAR (identical to calendar view, List icon active)         │
├────────────────────────────────────────────────────────────────┤
│ [Status ▲▼] [Client Name ▲▼] [Policy ▲▼] [Carrier ▲▼]        │
│ [Renewal Date ▲▼] [Last Outreach ▲▼] [Actions]                │
├────────────────────────────────────────────────────────────────┤
│ ● [Name]  [Policy]  [Carrier]  [Renewal Date]  [Last Outreach] │
│   Generate Letter (inline link)                                │
├────────────────────────────────────────────────────────────────┤
│  ... rows ...                                                  │
└────────────────────────────────────────────────────────────────┘
```

**Columns:**
- Status (color dot + text label, e.g. `● Urgent` — see 00-index.md for full label table)
- Client Name (link → `/clients/[id]`)
- Policy Type
- Carrier
- Renewal Date (formatted: May 15, 2026)
- Last Outreach (date of last sent letter, or "—" if none)
- Actions: "Generate Letter" (text link), "..." overflow → View Client | Edit Client

**Default sort:** Renewal date ascending (soonest first)
**Row click:** Opens client panel slide-over (same as calendar view)

---

## Component: Client Panel (Slide-Over)

Triggered by clicking any client card (calendar) or row (list view). Slides in from the right. Does not navigate away from the calendar.

```
┌──────────────────────────────────────────────────────────┐
│  OVERLAY: semi-transparent backdrop (click to close)     │
│                                                          │
│              ┌────────────────────────────┐             │
│              │ [✕ Close]                  │             │
│              │                            │             │
│              │ [Status pill]              │             │
│              │ [Client Full Name]  (H2)   │             │
│              │ ─────────────────────────  │             │
│              │ POLICY INFO:               │             │
│              │  Type:    [value]          │             │
│              │  Carrier: [value]          │             │
│              │  Premium: $[value]/yr      │             │
│              │  Renewal: [Date]           │             │
│              │ ─────────────────────────  │             │
│              │ CONTACT:                   │             │
│              │  Email:  [value or "—"]    │             │
│              │  Phone:  [value or "—"]    │             │
│              │ ─────────────────────────  │             │
│              │ LETTER HISTORY:            │             │
│              │  [Date] Pre-Renewal ✓ Sent │             │
│              │  [Date] Welcome    — Saved │             │
│              │  "No letters sent yet"     │             │
│              │   (if empty)               │             │
│              │ ─────────────────────────  │             │
│              │ [Generate Letter] (primary)│             │
│              │ [Edit Client]  [View Full] │             │
│              └────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

**Panel width:** 400px desktop, full screen on mobile
**Slide animation:** Slides in from right (transform translateX)
**Close:** ✕ button OR click outside the panel OR browser back button (back closes the panel without navigating away from the calendar — implemented via history.pushState when panel opens so back reverts it)
**Generate Letter** → `/letters/new?clientId=[id]`
**Edit Client** → `/clients/[id]/edit`
**View Full Record** → `/clients/[id]`

### Client Panel — Letter History rows

Each row:
- Date (MMM D)
- Scenario name (truncated)
- Status badge: "Sent" (green) | "Saved" (grey) | "Awaiting Approval" (amber)

Empty state: "No letters yet. Generate your first letter for this client."
