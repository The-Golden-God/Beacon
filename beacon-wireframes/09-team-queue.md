# Wireframe 09 — Team Management & Approval Queue

Routes: `/team`, `/team/invite`, `/queue`
These screens are only accessible to Admin role users on Agency or Office tier.

---

## Screen: Team (`/team`)

### Access Control

- Solo tier: link not visible in nav at all
- Agency/Office tier, Producer role: link not visible
- Agency/Office tier, Admin role: visible and accessible

### Layout

```
APP SHELL
Top bar title: "Team"
Top bar right: [Invite Agent] (primary button)

┌──────────────────────────────────────────────────────────────┐
│ TABLE:                                                       │
│  [Name ▲▼]  [Email]  [Role]  [Status]  [Joined]  [Actions] │
│  ────────────────────────────────────────────────────────── │
│  [rows — active agents]                                      │
│  ────────────────────────────────────────────────────────── │
│  PENDING INVITATIONS (section heading if any pending):       │
│  [Email]  Invited  [Date Invited]  [Resend] [Cancel]        │
└──────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Content |
|---|---|
| Name | Agent full name |
| Email | Agent email |
| Role | Inline dropdown: Producer | Admin (changeable by Admin) |
| Status | "Active" (green) or "Invited" (amber — pending acceptance) |
| Joined | Date joined workspace |
| Actions | "Remove" (text link) — shows confirmation modal |

### Role Dropdown (inline, per row)

- Admin can change any agent's role (including themselves — with warning)
- Changing own role to Producer: modal "Are you sure? You'll lose admin access and won't be able to change it back without another admin."
- Change saves immediately on select (no separate save button)
- Toast: "[Agent Name]'s role updated to Producer."

### Remove Agent — Confirmation Modal

```
"Remove [Agent Name]?"
"They'll lose access to Beacon immediately. Their letters and E&O log entries
will be retained in your workspace."
[Cancel]  [Remove Agent] (red button)
```

On remove: row removed from table, toast "Agent removed."

### Pending Invitations Section

Shown only if there are pending (unaccepted) invitations.

Each pending row:
- Email address (grey — not a full agent yet)
- "Invited" status badge (amber)
- Date invited
- [Resend] — resends invitation email, toast "Invitation resent."
- [Cancel] — cancels invitation, row removed, toast "Invitation cancelled."

### Empty State (no team members other than owner)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [Illustration: people silhouettes]                   │
│                                                         │
│        It's just you right now.                        │
│   Invite agents to collaborate in your workspace.      │
│                                                         │
│   [Invite Your First Agent] (primary button)           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen: Invite Agent (`/team/invite`)

Can be a modal overlay OR a dedicated page — recommend modal for speed.

### Layout (as modal)

```
MODAL (max-width 440px, centered):
  ┌────────────────────────────────────────────┐
  │ [✕]  Invite an Agent                       │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Email *                                    │
  │ [________________________________]         │
  │                                            │
  │ Role *                                     │
  │ [○] Producer                               │
  │     "Can generate and send letters"        │
  │ [○] Admin                                  │
  │     "Can invite agents, manage team,       │
  │      and access approval queue"            │
  │                                            │
  │ [Send Invitation] (primary, full width)    │
  │ [Cancel] (text link)                       │
  └────────────────────────────────────────────┘
```

**Validation:**
- Email: required, valid format
- Email already in workspace: "This agent is already on your team."
- Email already has a pending invitation: "An invitation is already pending for this email. [Resend?]"

**On success:** Modal closes, toast "Invitation sent to [email].", pending row appears in team table.

**Tier limit reached (e.g. Agency = 5 agents max):**
Invite button disabled with tooltip: "You've reached the 5-agent limit for the Agency plan. Upgrade to Office for up to 15 agents."

---

### Bulk Invite (Office Tier Only)

Office tier supports up to 15 agents. Inviting them one at a time is impractical for a new Office account onboarding an entire agency team. A bulk invite option is shown on the Team screen for Office tier admins.

**Trigger:** "Invite Multiple Agents" text link below the standard "Invite Agent" button (Office tier only).

**Bulk Invite modal:**
```
MODAL (max-width 560px):
  ┌──────────────────────────────────────────────┐
  │ [✕]  Invite Multiple Agents                  │
  ├──────────────────────────────────────────────┤
  │                                              │
  │ Enter one email per line, or paste a         │
  │ comma-separated list.                        │
  │                                              │
  │ [Textarea — multiline email input]           │
  │  e.g.                                        │
  │  sarah@agency.com                            │
  │  jake@agency.com                             │
  │  mike@agency.com                             │
  │                                              │
  │ Role for all invitees:                       │
  │ [○] Producer  [○] Admin                      │
  │ "You can change individual roles after."     │
  │                                              │
  │ [Send N Invitations] (primary, updates live) │
  │ [Cancel] (text link)                         │
  └──────────────────────────────────────────────┘
```

**Validation:**
- Each line/comma-separated value parsed as an email address
- Invalid emails: shown inline below the textarea with the offending addresses flagged: "These don't look like valid emails: [list]"
- Emails already in workspace or with pending invitations: flagged inline, excluded from send count
- Would exceed tier limit: "Sending [N] invitations would exceed your 15-agent Office plan limit. You have [X] slots remaining. Remove [Y] email(s) to continue."

**On success:** Modal closes, toast "Invitations sent to [N] agents.", all rows appear as pending in team table.

---

## Screen: Approval Queue (`/queue`)

Office tier only. Admin role only.
Nav item shows badge: "Queue (3)" when pending count > 0.

**Approval queue is always on for all Office tier workspaces in MVP.** There is no admin toggle to enable/disable it. Every letter generated by a Producer role on an Office tier account requires admin approval before sending — this applies to all three letter scenarios (Pre-Renewal Outreach, Rate Increase Explanation, New Client Welcome) without exception. There is no per-scenario or per-producer configuration. Admins can send letters directly (no approval required for their own letters).

### Layout

```
APP SHELL
Top bar title: "Approval Queue"

TABS: [Pending (3)] | [Recently Approved] | [Returned]
(Number badge only on Pending tab)

┌───────────────────────────────────────────────────────────────┐
│ PENDING TAB CONTENT:                                         │
│                                                              │
│ Each queue item (card layout, not table):                    │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Client Name] — [Scenario]     Submitted [time ago]      │ │
│ │ Producer: [Agent Name]                                   │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ "[First 2-3 lines of letter preview...]"                 │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ [Review Full Letter ▼] (expandable)  [Approve] [Return] │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [next card...]                                               │
└───────────────────────────────────────────────────────────────┘
```

### Queue Item — Expanded (after clicking "Review Full Letter")

```
┌──────────────────────────────────────────────────────────────┐
│ [Client Name] — [Scenario]     Submitted [timestamp]         │
│ Producer: [Agent Name]                                       │
│ ─────────────────────────────────────────────────────────── │
│ SUBJECT: [subject line]                                      │
│ ─────────────────────────────────────────────────────────── │
│ [Full letter text — read-only, formatted]                   │
│ [E&O disclaimer — greyed]                                   │
│ [Agent signature — greyed]                                  │
│ ─────────────────────────────────────────────────────────── │
│ ACTIONS:                                                     │
│   [Approve Letter] (green primary)                           │
│                                                              │
│   [Return for Revision] (secondary)                          │
│     → Expands note field:                                    │
│       "Note for [Agent Name]:" [textarea, required]          │
│       [Send Return Note] (primary)                           │
└──────────────────────────────────────────────────────────────┘
```

**On Approve:**
- Item moves to "Recently Approved" tab
- Toast: "Letter approved and returned to [Agent Name]."
- Producer receives in-app notification: "[Admin] approved your letter to [Client]."
- Producer's letter generator shows "Approved — Ready to Send" + Send button active

**On Return for Revision:**
- Requires non-empty note
- Item moves to "Returned" tab
- Toast: "Letter returned to [Agent Name] for revision."
- Producer receives in-app notification with admin's note

---

### Recently Approved Tab

Table view:
| Approved | Client | Scenario | Producer | Actions |
|---|---|---|---|---|
| [Timestamp] | [Name] | [Scenario] | [Name] | View |

---

### Returned Tab

Table view:
| Returned | Client | Scenario | Producer | Note | Actions |
|---|---|---|---|---|---|
| [Timestamp] | [Name] | [Scenario] | [Name] | [truncated note] | View |

---

### Approval Queue — Empty States

**Pending tab empty:**
```
┌────────────────────────────────────────────────┐
│                                                │
│   [Inbox/checkmark illustration]              │
│   No letters waiting for review.              │
│                                                │
└────────────────────────────────────────────────┘
```

**Recently Approved / Returned tabs empty:**
"No [approved/returned] letters yet."
