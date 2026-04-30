# Wireframe 04 — E&O Documentation Log

Routes: `/log`, `/log/[id]`

---

## Screen: E&O Log (`/log`)

### Layout

```
APP SHELL
Top bar title: "E&O Log"
Top bar right: [Export PDF] (primary button)

┌─────────────────────────────────────────────────────────┐
│ FILTER BAR (sticky, below top bar):                     │
│  [Search by client name...]  [Date Range ▼]             │
│  [Scenario ▼]  [Status ▼]  [Producer ▼ — admin only]   │
│                                              [Clear all]│
├─────────────────────────────────────────────────────────┤
│ RESULTS SUMMARY:                                        │
│  "Showing 47 entries"  (updates as filters change)      │
├─────────────────────────────────────────────────────────┤
│ TABLE:                                                  │
│  [Date/Time ▲▼] [Client ▲▼] [Scenario ▲▼]             │
│  [Producer ▲▼ — admin only] [Status ▲▼] [Actions]      │
│  ───────────────────────────────────────────────────── │
│  [row] [row] [row] ...                                  │
│  ───────────────────────────────────────────────────── │
│  [Load More] (button — loads next 50 entries)            │
└─────────────────────────────────────────────────────────┘
```

### Filter Bar Controls

**Search:** Live filter by client first/last name.

**Date Range Dropdown:**
- Options: Today | This week | This month | Last 30 days | Last 90 days | Custom range
- Default: All time (no filter)

**Scenario Dropdown:**
- Options: All Scenarios | Pre-Renewal Outreach | Rate Increase Explanation | New Client Welcome

**Status Dropdown:**
- Options: All | Sent | Not Sent | Awaiting Approval (Office tier only — letters submitted to approval queue but not yet approved or sent)

**Producer Dropdown (Admin role on Agency/Office tiers only):**
- Options: All Producers | [each agent name]

**Clear All:** Text link, resets all filters to defaults.

### Pagination

- Default: first 50 entries loaded (sorted newest first)
- "Load More" button at bottom loads next 50 entries, appended to the table
- "Load More" hidden when all entries are visible
- "Showing 47 of 47 entries" summary updates to show loaded vs. total
- No numbered pages — table grows in place

### Table — Column Specs

| Column | Content | Sortable |
|---|---|---|
| Date/Time | "Apr 27, 2026 · 2:14 PM" | Yes — default sort DESC (newest first) |
| Client | Full name, links to `/clients/[id]` | Yes |
| Scenario | "Pre-Renewal Outreach" / "Rate Increase" / "New Client Welcome" | Yes |
| Producer | Agent name who generated the letter (Admin view only) | Yes |
| Status | "Sent ✓" (green badge) OR "Not Sent —" (grey badge) | Yes |
| Actions | "View" text link → `/log/[id]` | No |

### Table Row Hover
- Row background: slate-50
- Cursor: pointer (clicking row → same as View link)

### Empty State (no log entries)

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│         [Illustration: shield with checkmark]        │
│                                                       │
│           Your E&O log is empty.                     │
│   Letters you generate and send will appear here.    │
│                                                       │
│         [Generate Your First Letter]                  │
│         (button → /letters/new)                       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Empty State (filters applied, no results)

```
No entries match your filters.
[Clear filters]  (text link)
```

---

### Export PDF Button

**States:**
- Default: "Export PDF" (primary)
- Loading: "Generating PDF..." (spinner, disabled)
- Error: "Export failed — Retry" (red)

**Behavior:**
- Exports ALL entries matching the current filter — not just the entries loaded in the visible table (pagination does not truncate exports)
- If no filters: exports all entries (full log)
- If filters applied: exports all filtered results regardless of how many are loaded on screen; button label updates to "Export filtered view (47 entries)"
- Downloads as: `beacon-eo-log-[YYYY-MM-DD].pdf`
- Success toast: "PDF exported successfully."

**Admin audit trail for exports (Office tier, Admin role):**
Every PDF export action is recorded in the Admin E&O Audit Trail: timestamp, exporting admin's name, filter criteria active at time of export (e.g. "Date: Last 90 days | Producer: Jake Smith"). Visible to workspace owner at `/log/audit`.

---

## Screen: Log Entry Detail (`/log/[id]`)

### Layout

```
APP SHELL
Top bar: [← Back to Log]  "E&O Log Entry"

┌─────────────────────────────────────────────────────────┐
│ META SECTION (grey background, full width, compact):    │
│  Generated: Apr 27, 2026 at 2:14 PM                    │
│  Client: [Name] (link → /clients/[id])                 │
│  Scenario: Pre-Renewal Outreach                        │
│  Producer: [Agent Name]                                │
│  Status: Sent ✓ to [email@example.com] at [time]       │
│      OR: Not Sent                                      │
│  Log ID: beacon-log-[uuid] (small, grey — for E&O ref) │
├─────────────────────────────────────────────────────────┤
│ TOGGLE (if AI draft ≠ sent version):                   │
│  [AI Draft] | [Sent Version]  (pill toggle)            │
│  (hidden if no edits were made before sending)         │
├─────────────────────────────────────────────────────────┤
│ SUBJECT: [subject line text]                           │
├─────────────────────────────────────────────────────────┤
│ LETTER BODY (read-only):                               │
│  [Full formatted letter text]                          │
│                                                        │
│  [E&O Disclaimer — locked, greyed]                    │
│  [Agent Signature — locked, greyed]                   │
├─────────────────────────────────────────────────────────┤
│ ACTIONS (bottom):                                      │
│  [Download PDF]  [Copy to Clipboard]                   │
└─────────────────────────────────────────────────────────┘
```

### Detail Notes

- Entire letter is read-only (E&O integrity — no editing after log)
- "AI Draft" vs "Sent Version" toggle: shows which version was sent. If no edits made, toggle is hidden and only one version shown.
- Log ID is a tamper-evident identifier for E&O reference — shown small at bottom of meta section
- No delete action on log entries (E&O records are immutable for 7 years)
