# Wireframe 02 — Letter Generator

Routes: `/letters/new`, `/letters/new?clientId=[id]`, `/letters/[id]`

---

## Screen: Letter Generator (`/letters/new`)

### Desktop Layout (≥1024px) — Two-Panel

```
APP SHELL (sidebar + top bar)
Top bar title: "Letter Generator"

┌───────────────────────────────────────────────────────────────────┐
│  LEFT PANEL (30%, ~320px min, fixed)  │  RIGHT PANEL (70%, fluid) │
│                                       │                           │
│  CLIENT                               │  SUBJECT LINE             │
│  [Search / Select Client ▼]           │  [Subject line text input]│
│                                       │  ─────────────────────────│
│  SCENARIO                             │  LETTER EDITOR            │
│  [Select Scenario ▼]                  │  [Tiptap rich text area]  │
│                                       │   - Toolbar: B I U • ••   │
│  ─────────────────────────────────    │   - Letter content        │
│  LETTER DETAILS                       │   - [streams in here]     │
│  Policy Type: [input]                 │                           │
│  Renewal Date: [date picker]          │  ─────────────────────────│
│  Carrier:     [input]                 │  [E&O DISCLAIMER FOOTER]  │
│  Premium:     [$input]               │   (grey, locked, italics) │
│                                       │  ─────────────────────────│
│  [Rate Increase %] (Rate Inc. only)   │  [AGENT SIGNATURE BLOCK]  │
│                                       │   (grey, locked)          │
│  ─────────────────────────────────    │                           │
│  [Generate] (primary, full width)     │  STATUS BAR (above footer)│
│                                       │  "Saved ✓" | "Generating…"│
│                                       │  | "Unsaved changes"      │
│                                       │                           │
│                                       │  ─────────────────────────│
│                                       │  ACTION BAR (bottom, sticky)│
│                                       │  [Send ▾][Download PDF]   │
│                                       │  [Copy][Save as Template] │
└───────────────────────────────────────┴───────────────────────────┘
```

---

### Left Panel — Component Specs

#### Client Selector
- Type: Searchable combobox / dropdown
- Placeholder: "Search or select a client..."
- Behavior: Type to filter by name; shows dropdown list of matching clients
- Each dropdown item: "[First Last] — [Policy Type] — Renewal [Date]"
- If arrived via `?clientId=[id]`: brief skeleton state in left panel while client data fetches (<500ms typically) → fields pre-fill on load; "Change" link shown next to name to clear selection
- If no client selected: Letter Details fields are empty and unlocked for manual entry
- If client selected: Letter Details fields pre-filled from client record, still editable

**Changing client when a letter is already generated:**
- Agent clicks "Change" → confirmation dialog:
  "Change client? Your current letter will be cleared."
  [Cancel] [Change Client]
- If confirmed: client cleared, fields reset, editor cleared
- If cancelled: nothing changes

**Changing client before generation:** No confirmation needed — fields just reset silently.

#### Scenario Picker
- Type: Segmented control or radio button group (3 options)
- Options:
  - Pre-Renewal Outreach (default)
  - Rate Increase Explanation
  - New Client Welcome
- Selecting a scenario:
  - Updates which Letter Details fields are shown (each scenario has scenario-specific optional fields — see below)
  - Shows "Browse saved templates for [scenario]" link (see Templates Access below)
  - Clears any previously generated letter (with confirmation if letter exists: "Changing the scenario will clear your current letter. Continue?")

#### Templates Access (below Scenario Picker)

After a scenario is selected, show a small text link below the scenario picker:
```
  Browse saved [Scenario Name] templates →
```
- Clicking → navigates to `/templates` filtered to that scenario tab
- If no templates exist for the scenario: link still shown; /templates shows scenario-specific empty state
- This is the primary navigation path to `/templates` from within the app

#### Letter Details Fields

**Universal fields (all scenarios):**

| Field | Type | Required | Notes |
|---|---|---|---|
| Policy Type | Text input | Yes | e.g. "Home", "Auto", "Commercial" |
| Renewal Date | Date picker | Yes | |
| Carrier | Text input | No | e.g. "State Farm" — optional but improves letter specificity |
| Current Premium | Currency input ($) | No | Optional |

**Scenario-specific fields (appear below universal fields when that scenario is selected):**

*Pre-Renewal Outreach only:*
| Field | Type | Required | Notes |
|---|---|---|---|
| Years as Client | Number input | No | "We've worked together for X years." Pre-calculated from client creation date if available; agent can override. Label: "Years as client (optional)" |
| Recent Life Change | Text input | No | "New home, added a driver, recent claim..." Placeholder: "e.g. New home purchase, added teenage driver" |

*Rate Increase Explanation only:*
| Field | Type | Required | Notes |
|---|---|---|---|
| Rate Increase Amount | Number input (%) | **Yes** | e.g. "12" → "12%" — required for this scenario |
| Rate Increase Reason | Textarea (2 rows) | No | See nudge spec below |
| What have you found? | Segmented control / radio | **Yes** | Option A: "I have a quote to present" — Option B: "Staying with current carrier is right" — required before generation; drives which version of paragraph 3 is generated (see doc 12 for Option A/B spec) |

**Rate Increase Reason — visual nudge:**
Label row: `Rate Increase Reason` + amber info badge `💡 Strongly recommended`
Below field: small grey helper text: "The more specific, the better the letter. e.g. 'Auto liability losses in your state' or 'Reinsurance market hardening.'"
Placeholder in textarea: "e.g. Auto liability losses in your state"
No validation block — letter generates fine without it, but the nudge reinforces quality.

*New Client Welcome only:*
| Field | Type | Required | Notes |
|---|---|---|---|
| Policy Effective Date | Date picker | No | "Your coverage went into effect on [date]." |
| What They Insured | Text input | No | "Your new home at 123 Oak Street," "your family's vehicles." Placeholder: "e.g. 3-bedroom home on Oak Street" |

- All universal fields pre-filled when client is selected; all editable
- Scenario-specific fields: never pre-filled (agent enters manually)
- Fields with missing required data: amber left border highlight, placeholder text
- Optional fields with no value: left blank, no error state — AI generates without that detail

#### Left Panel Overflow

The left panel can be long when optional fields are visible. Rules:
- Generate button is **sticky at the bottom of the left panel** at all times (never scrolls out of view)
- Optional scenario-specific fields are grouped under a collapsible section: **"Optional Details ▾"** — collapsed by default, expanded by clicking the label
- Universal fields (Policy Type, Renewal Date, Carrier, Premium) are always visible without scrolling
- Left panel scrolls independently of the right panel on desktop

On mobile, the left panel is full-width and stacked above the editor. Optional Details section collapsed by default.

#### Generate Button
- Full width, sticky at the bottom of the left panel (never scrolls out of view)
- Label: "Generate Letter"
- States:
  - Default: active (all required fields filled)
  - Disabled: grey, tooltip "Fill in all required fields to generate"
  - Loading: shows spinner, label "Generating..." — button disabled during stream
- **If a letter already exists in the editor and agent clicks Generate:**
  - Confirmation: "Regenerate? This will replace your current letter."
  - If on free trial: confirmation reads "Regenerate? This will use 1 of your remaining free letters and replace your current letter." — [Cancel] [Regenerate]
  - [Cancel] [Regenerate] — if confirmed, streams new letter and overwrites editor
  - **E&O logging on regeneration:** The original generated letter is already logged in the E&O log at generation time (whether or not it was sent). Regeneration creates a new E&O log entry for the new letter. Both entries are retained — the log is immutable and accumulates all versions.
- On first generation (empty editor): no confirmation needed, generates immediately

**Generate button state when letter is "Returned for Revision" (Office tier, Producer):**
When an admin has returned the letter and the producer is in revision mode, the Generate button is **re-enabled** and labeled "Regenerate." The producer can generate a new letter from scratch if they prefer rather than editing the returned version. The amber "Returned for Revision" admin note box remains visible above the editor until the letter is resubmitted. Clicking Regenerate replaces the letter and clears the returned status — the admin note box is removed.

---

### Right Panel — Component Specs

#### Subject Line Field
- Single-line text input above the editor
- Label: "Subject"
- Auto-populated after generation (editable)
- Before generation: empty, placeholder "Subject line will appear after generation"

#### Tiptap Rich Text Editor
- Toolbar: Bold | Italic | Underline | Bullet list | Numbered list
- No font size, color, or image controls (keep it clean — this is a letter)
- Before generation: empty, placeholder "Your letter will appear here..."
- During generation: letter streams in word by word (typewriter effect)
- After generation: fully editable
- Auto-saves on pause (debounced 2 seconds after last keystroke)
- Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+U standard

#### E&O Disclaimer Footer (locked)
- Visually separated with top border
- Light grey background
- Italicized text (pre-defined legal disclaimer copy — from doc 12)
- "🔒 E&O disclaimer — cannot be edited" label above section
- Non-editable, non-selectable (pointer-events: none or contentEditable: false on this block)

#### Agent Signature Block (locked)
- Below disclaimer
- Shows: agent name, agency name, phone, email (from onboarding/settings)
- Same locked treatment as disclaimer
- "🔒 Signature — edit in Settings" label; clicking label → `/settings/agency`

#### Status Indicator
- Small text, right-aligned, above action bar
- States:
  - "Generating..." (with animated dots or spinner)
  - "Saved ✓" (green, after auto-save)
  - "Unsaved changes" (grey)
  - "Failed to save — Retry" (red, with retry link)

#### Action Bar (sticky bottom of right panel)

| Button | State rules | Action |
|---|---|---|
| Send | One email connected, client has email | Single button → send confirmation popover |
| Send ▾ | **Both** Gmail + Outlook connected, client has email | Dropdown: "Send via Gmail" \| "Send via Outlook" → selection triggers confirmation popover for that account |
| Send (disabled) | No email connected | Tooltip: "Connect an email account to send" + "Connect Gmail →" link |
| Send (disabled) | Client has no email | Tooltip: "This client has no email on file" + "Edit Client →" link |
| Send (disabled) | Gmail disconnected asynchronously (other tab) | Becomes disabled mid-session; tooltip: "Your Gmail connection was disconnected. Reconnect →" |
| **Submit for Approval** | **Office tier, Producer role, letter generated** | **Replaces Send button entirely. Click → toast "Letter submitted for review. You'll be notified when it's approved." → button changes to "Awaiting Approval" (disabled)** |
| **Awaiting Approval (disabled)** | **Office tier, Producer role, letter submitted but not yet approved** | **Greys out. Generate button also replaced with "Submitted — Awaiting Approval" status indicator (disabled). Agent cannot regenerate until admin acts.** |
| **Send (re-activated)** | **Office tier, Producer role, admin has approved the letter** | **Send button returns active. In-app toast (when agent next interacts): "[Admin Name] approved your letter to [Client]. It's ready to send."** |
| **Resubmit** | **Office tier, Producer role, letter returned for revision + agent has made at least one edit** | **Replaces Submit for Approval. Clicking resubmits to the queue — same behavior as Submit for Approval. Amber note box from admin remains visible above the editor until resubmitted.** |
| Download PDF | Always active after generation | Downloads beacon-[client]-[date].pdf |
| Copy to Clipboard | Always active after generation | Copies letter text, toast "Copied to clipboard" |
| Save as Template | Always active after generation | Saves to /templates, toast "Template saved" |

**Send confirmation popover:**
```
Send this letter to [Client Name] at [email@example.com]?
[Cancel]  [Send Letter]
```

**After send:**
- Toast: "Letter sent to [Client Name]. Logged to your E&O record."
- Client card on calendar updates to Green status

---

### Mobile Layout (<768px)

- Left panel (client/scenario/fields) shows full width ABOVE the editor
- After clicking Generate: left panel collapses to a summary bar (tap to expand)
- Editor expands to fill remaining screen height
- Action bar: 2 buttons per row, Send + Download top row, Copy + Template bottom row

### Unsaved Changes — Navigation Away

If the agent has a letter with unsaved edits and tries to navigate away (click a nav item, close tab, use browser back):
- Browser `beforeunload` event fires — standard browser dialog: "Leave site? Changes you made may not be saved."
- If auto-save is working normally (status shows "Saved ✓"): no dialog — changes are already persisted.
- Dialog only appears when status indicator shows "Unsaved changes."
- After a successful send: status resets, no dialog on navigation.

### Reloading/Using a Template After Generation

If a letter has already been generated and the agent clicks "Browse saved templates" (from scenario picker area):
- Confirmation: "Loading a template will replace your current letter. Continue?"
- [Cancel] [Load Template] — if confirmed, navigates to /templates for that scenario
- On template selection: returns to /letters/new with template pre-loaded in editor
- Left panel inputs (client, scenario, fields) remain as-set; only the editor content changes

---

## Screen: Letter Generator — Signature Incomplete State

When agent tries to Generate before completing onboarding:

- Generate button click → validation fires
- Inline error banner below Generate button:
  "Your letter signature is incomplete. Add your agency details before generating."
  [Go to Settings →] (link → `/settings/agency`)
- Generation does not proceed

---

## Screen: Letter View (`/letters/[id]`)

View a previously generated letter (read-only).

### Layout

```
APP SHELL
Top bar title: "[Scenario Name] — [Client Name]" with back arrow → /log

┌─────────────────────────────────────────────────────────┐
│ META BAR (full width, below top bar):                   │
│  Generated: [date]  |  Sent: [Yes/No]  |  Producer: [name] │
│  [Use as Template]  [Download PDF]  [Copy]              │
├─────────────────────────────────────────────────────────┤
│ SUBJECT: [subject line]                                 │
├─────────────────────────────────────────────────────────┤
│ LETTER BODY (read-only, formatted)                      │
│                                                         │
│ [E&O disclaimer footer — same locked treatment]         │
│ [Agent signature — same locked treatment]               │
└─────────────────────────────────────────────────────────┘
```

- Entire letter is read-only (no editor toolbar)
- "Use as Template" saves the current letter as a template → toast "Template saved"
- Editing not allowed on a sent/logged letter (E&O integrity)
- If letter was edited before sending: "Toggle: AI Draft | Sent Version" control visible in meta bar

**Back button behavior:**
- Back arrow in top bar uses **browser history back** (not a hardcoded `/log` link)
- Agent may arrive at `/letters/[id]` from: E&O log, client detail letter history, or approval queue
- Browser back returns them to their origin in all cases
