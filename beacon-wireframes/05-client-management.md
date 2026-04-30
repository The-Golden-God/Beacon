# Wireframe 05 — Client Management

Routes: `/clients`, `/clients/new`, `/clients/[id]`, `/clients/[id]/edit`, `/clients/import`

---

## Screen: Client List (`/clients`)

### Layout

```
APP SHELL
Top bar title: "Clients"
Top bar right: [Import from CSV]  [+ Add Client] (primary)

┌─────────────────────────────────────────────────────────┐
│ CONTROLS BAR:                                           │
│  [🔍 Search clients...]  [Policy Type ▼]  [Status ▼]   │
│  Sort: [Renewal Date ▼]                    [Clear all] │
├─────────────────────────────────────────────────────────┤
│ RESULTS COUNT: "247 clients"                            │
├─────────────────────────────────────────────────────────┤
│ TABLE:                                                  │
│  [Status] [Name ▲▼] [Policy ▲▼] [Renewal ▲▼]          │
│  [Carrier ▲▼] [Last Outreach ▲▼] [Actions]             │
│  ─────────────────────────────────────────────────────  │
│  [rows...]                                              │
│  [Pagination]                                           │
└─────────────────────────────────────────────────────────┘
```

### Controls Bar

**Search:** Live filter, searches first name, last name, email. Placeholder: "Search by name or email..."

**Policy Type Dropdown:** All | Auto | Home | Commercial | Life | Other

**Status Dropdown:** All | Urgent (renewal <30 days, no outreach) | Upcoming (30–60 days) | Contacted (outreach sent) | Scheduled (>60 days)

### Loading State

On first load and on filter/sort change: skeleton rows (grey placeholder bars, 3 columns wide, 8 rows) appear while data fetches. No spinner overlay. If load exceeds 5 seconds, subtle message below skeleton: "Taking longer than usual..."

### No Search Results State

When search is active and no clients match:
```
  [Inline, below search bar]:
  No clients match "[search term]" — check the spelling or try a shorter search.
  [Clear Search] (text link — clears search input and resets list)
```

**Sort Dropdown:** Renewal Date (soonest) | Renewal Date (latest) | Name A–Z | Name Z–A | Policy Type | Last Outreach

### Table Columns

| Column | Content |
|---|---|
| Status | Color dot (see 00-index.md) |
| Name | "[First Last]" — clickable → `/clients/[id]` |
| Policy Type | Text |
| Renewal Date | "May 15, 2026" |
| Carrier | Text |
| Last Outreach | Date or "—" |
| Actions | "Generate Letter" link | "..." → Edit Client, Delete |

**Delete client:** Clicking Delete → confirmation modal:
"Delete [Client Name]? This removes their record and cannot be undone. Their E&O log entries will be retained."
[Cancel] [Delete Client] (red button)

### Empty State

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [Illustration: empty contacts]               │
│                                                 │
│        No clients yet.                         │
│   Add clients manually or import from a CSV.   │
│                                                 │
│   [Import from CSV]   [Add a Client]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Pagination

- Default: first 50 clients loaded
- "Load More" button at bottom loads next 50, appended to the list
- Hidden when all clients are visible
- Results summary ("247 clients") always shows total, not just loaded count

---

## Screen: Add Client (`/clients/new`)

### Layout

```
APP SHELL
Top bar: [← Clients]  "Add Client"

FORM CARD (max-width 560px, left-aligned or centered):

─────────────────────────────────────
CONTACT INFORMATION
  First Name *    [______________]
  Last Name *     [______________]
  Email           [______________]
  Phone           [______________]

POLICY INFORMATION
  Policy Type *   [Dropdown ▼ — Auto | Home | Commercial | Life | Other]
  Carrier         [______________]
  Current Premium [$_____________]
  Renewal Date *  [Date Picker   ]

NOTES
  [Textarea — "Agent notes (optional)..."  4 rows]

─────────────────────────────────────
[Save Client] (primary)
[Cancel] (text link → /clients)
```

**Validation (on Save):**
- First Name, Last Name: required
- Policy Type: required
- Renewal Date: required, must be a valid date
- Carrier: optional — if blank, letter generator will generate without carrier reference
- Current Premium: optional, must be numeric if provided
- Email: optional, but if provided must be valid format
- Phone: optional, but if provided validate format
- At least Email or Phone recommended (inline helper text below those fields: "Add at least one so you can send letters directly") — not a hard validation block, just a nudge

**On success:**
- Redirect to `/clients/[id]` (new client detail page)
- Success toast: "Client added."

---

## Screen: Client Detail (`/clients/[id]`)

### Layout

```
APP SHELL
Top bar: [← Clients]  "[Client Full Name]"
Top bar right: [Generate Letter] (primary)  [Edit Client] (secondary)

┌─────────────────────────────────────────────────────────┐
│ CLIENT HEADER:                                          │
│  [Status color pill]  [Full Name] (H2)                 │
│  [Policy type] · [Carrier] · Renewal: [Date]           │
│                                                        │
├──────────────────────────────┬─────────────────────────┤
│ LEFT COLUMN (60%)            │ RIGHT COLUMN (40%)       │
│                              │                          │
│ CONTACT INFO                 │ POLICY INFO             │
│  Email: [value or "—"]       │  Type:    [value]       │
│  Phone: [value or "—"]       │  Carrier: [value]       │
│                              │  Premium: $[value]/yr   │
│ NOTES                        │  Renewal: [Date]        │
│  [Inline editable textarea]  │                         │
│  Auto-saves on blur          │ STATUS                  │
│  "No notes" if empty         │  [Color badge + label]  │
│                              │                         │
├──────────────────────────────┴─────────────────────────┤
│ LETTER HISTORY                                         │
│  ────────────────────────────────────────────────────  │
│  [Date]  [Scenario]  [Status badge]  [View]           │
│  [Date]  [Scenario]  [Status badge]  [View]           │
│  ────────────────────────────────────────────────────  │
│  Empty: "No letters generated yet for this client."   │
│         [Generate First Letter →]                     │
│                                                        │
├────────────────────────────────────────────────────────┤
│ DANGER ZONE (collapsible, collapsed by default):       │
│  [Delete Client] (red, secondary) — confirmation modal │
└────────────────────────────────────────────────────────┘
```

### Notes Field
- Inline editable: click → textarea becomes active
- Auto-save on blur with "Saved ✓" micro-feedback
- No explicit save button

### Letter History rows
- Date (Apr 27, 2026)
- Scenario name
- Status: "Sent" (green) | "Saved" (grey) | "Awaiting Approval" (amber)
- "View" → `/log/[id]`

---

## Screen: Edit Client (`/clients/[id]/edit`)

Same form as Add Client, pre-filled with existing values.

```
APP SHELL
Top bar: [← Client Name]  "Edit Client"

[Same form fields as Add Client, pre-filled]

[Save Changes] (primary)
[Cancel] (text link → /clients/[id])
```

**On save:** Redirect to `/clients/[id]` with toast "Changes saved."
**Validation:** Same rules as Add Client.

---

## Screen: CSV Import (`/clients/import`)

### Stage 1: File Upload

```
APP SHELL
Top bar: [← Clients]  "Import Clients"

CONTENT (centered, max-width 640px):

  HEADING: "Import your client list"
  SUBTEXT: "Upload a CSV file. We'll walk you through matching your columns."

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   [Upload icon]                                         │
  │   Drop your CSV here, or click to browse               │
  │   CSV files only · Max 1,000 clients                   │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

  [Download Sample CSV Template] (text link — helps agents format their file)
```

**Validation errors (inline, replace the upload zone):**
- Wrong file type: "This isn't a CSV file. Please upload a .csv file."
- File corrupted / unreadable: "We couldn't read this file. It may be corrupted or saved in an unsupported format. Try re-exporting it from your AMS and upload again." [Choose a Different File]
- Empty file: "This file has no data."
- Exceeds 1,000 rows: "This file has [N] clients, which exceeds the 1,000 limit. Split your file and upload in batches."

---

### Stage 2: Column Mapping

Shown after valid file selected.

```
HEADING: "Match your columns"
SUBTEXT: "Tell us which column in your file matches each Beacon field."

TABLE:
┌───────────────────────────────────────────────────────────────┐
│ Your Column Header    │ Beacon Field      │ Tag               │
├───────────────────────┼───────────────────┼───────────────────┤
│ "First Name"          │ [First Name ▼]    │ ✓ Auto-matched    │
│ "Last Name"           │ [Last Name ▼]     │ ✓ Auto-matched    │
│ "Email Address"       │ [Email ▼]         │ ✓ Auto-matched    │
│ "Policy_Type"         │ [Policy Type ▼]   │ ✓ Auto-matched    │
│ "renewal"             │ [Renewal Date ▼]  │ ✓ Auto-matched    │
│ "CARRIER NAME"        │ [Carrier ▼]       │ ✓ Auto-matched    │
│ "Annual_Prem"         │ [Current Premium ▼]│ ✓ Auto-matched   │
│ "Agent Notes"         │ [Notes ▼]         │ Optional          │
│ "Account_Num"         │ [Skip this column ▼]│ Skip             │
└───────────────────────┴───────────────────┴───────────────────┘

Required fields with no match: shown with red "⚠ Required — not mapped" tag
[Import N Clients] button — disabled until all required fields are mapped
[← Back] (text link — returns to file upload)
```

**Beacon field dropdown options:**
First Name, Last Name, Email, Phone, Policy Type, Carrier, Current Premium, Renewal Date, Notes, Skip this column

**Required fields:** First Name, Last Name, Policy Type, Renewal Date
**Conditional required:** Email OR Phone — at least one must be mapped. If neither is mapped, "Import" button stays disabled and an inline message appears: "Map at least one of Email or Phone — required to send letters."
**Phone-only warning:** If Phone is mapped but Email is not: amber inline warning below the mapping table: "⚠ No email column mapped. You'll be able to track these clients but won't be able to send letters directly from Beacon without email addresses. You can add emails manually later." Import button remains **enabled** — this is a warning, not a blocker.
**Optional:** Carrier, Current Premium, Notes

**Required fields with no match:** red "⚠ Required — not mapped" tag
**Email/Phone conditional requirement:** if both are unmapped, amber warning row below the table: "⚠ At least one of Email or Phone must be mapped."

---

### Stage 3: Import Progress

```
HEADING: "Importing your clients..."

PROGRESS BAR:
  ████████████░░░░░░░░  62%
  "Importing 310 of 500 clients..."
```

- Non-cancellable once started (show this expectation upfront)
- Auto-advances to Stage 4 on completion

---

### Stage 4: Import Result

Three distinct outcomes — each shown as a distinct state:

```
STATE A — Full success (0 errors):
  HEADING: "Import complete"
  ✓ 500 clients imported successfully.
  [View Your Renewal Calendar] (primary → /dashboard)

STATE B — Partial success (some rows failed):
  HEADING: "Import complete"
  ✓ 487 clients imported successfully.
  ⚠ 13 rows had errors and were skipped.
  [Download Error Report] (downloads CSV of failed rows with "Error Reason" column)
  [View Your Renewal Calendar] (primary)
  [Import Error Rows Again] (secondary)

  **"Import Error Rows Again" behavior:**
  - Downloads the error report CSV automatically (same file as Download Error Report)
  - Returns agent to Stage 1 (file upload)
  - Helper message appears at top of Stage 1: "Fix the errors in the downloaded file, then re-upload it here."
  - Agent fixes the CSV (e.g. adds missing renewal dates), saves it, uploads again
  - The re-import is additive — previously imported rows are already in the system; this run only imports the fixed rows

STATE C — Full failure (zero rows imported):
  HEADING: "Import failed — no clients added"
  ✗ Every row in your file had an error.
  "This usually means the columns aren't mapped correctly,
   or required fields are missing data across the whole file."
  [Download Error Report] (primary)
  [Start Over] (secondary → returns to Stage 1)
```

**Error report CSV columns:** Original row data + "Error Reason" column.
Common error reasons:
- "Missing required field: First Name"
- "Missing required field: Renewal Date"
- "Invalid date format in renewal_date — expected MM/DD/YYYY"
- "No email or phone number provided"
- "Duplicate client: [name] already exists in your account"

If over 30 seconds during Stage 3: "This is taking a bit longer than usual... almost done."

---

### Duplicate Client Resolution (Stage 3b)

When the import detects rows that match an existing client by full name + policy type (fuzzy match — name within 1 edit distance), the import pauses before completing and shows a resolution step:

```
HEADING: "We found potential duplicates"
SUBTEXT: "[N] clients in your file may already be in your account.
          Review each one and choose what to do."

TABLE (one row per duplicate):
┌─────────────────────────────────────────────────────────────────────┐
│ In your file          │ In Beacon           │ Action               │
├─────────────────────────────────────────────────────────────────────┤
│ Sarah Johnson         │ Sarah Johnson        │ [○ Skip] [○ Update]  │
│ Home · State Farm     │ Home · State Farm    │ (radio selection)    │
│ Renewal: 06/15/2026   │ Renewal: 05/15/2026  │                      │
├─────────────────────────────────────────────────────────────────────┤
│ ... (additional duplicates)                                          │
└─────────────────────────────────────────────────────────────────────┘

[Apply to All: Skip All] [Apply to All: Update All]
[Continue Import] (primary — processes all selections)
[Cancel Import] (text link)
```

**Skip:** Keeps the existing Beacon record unchanged. The CSV row is discarded.
**Update:** Overwrites the existing Beacon record with the CSV row's data (all mapped fields replaced). Letter history and E&O log entries are preserved — only the client data fields are updated.
**Default selection:** Skip (conservative — does not overwrite by default).

Non-duplicate rows are imported during this step; only the flagged rows wait for resolution.

---

### Do Not Contact (DNC) Flag

Available on the Edit Client screen as a toggle:

```
─────────────────────────────────────
DO NOT CONTACT
[○ OFF]  Mark this client as Do Not Contact

If enabled, generating a letter for this client will
show a warning before proceeding.
─────────────────────────────────────
```

**DNC badge on client list:** Shown as a small grey `DNC` pill next to the client's name in the list table and calendar card.
**DNC warning on letter generation:** Clicking "Generate Letter" for a DNC-flagged client (from any surface) shows a modal:
```
"[Client Name] is marked Do Not Contact."
"Generate a letter anyway?"
[Cancel]  [Generate Anyway]
```
DNC does not block generation — it surfaces the flag and requires deliberate confirmation. The E&O log records the DNC flag status at time of generation.

---

### Data Export

Available from the top-right of the Client List screen as a text link: **"Export CSV"**.

**Behavior:**
- Exports all clients currently matching the active filter (or all clients if no filter)
- CSV columns: First Name, Last Name, Email, Phone, Policy Type, Carrier, Current Premium, Renewal Date, Notes, DNC (Yes/No), Status, Last Outreach Date
- Downloads as: `beacon-clients-[YYYY-MM-DD].csv`
- No confirmation required
- Also accessible from `/settings/export` (exports all clients regardless of filters, plus letter history summary)
