# Wireframe 03 — Onboarding Flow

Routes: `/onboarding/agency`, `/onboarding/style`, `/onboarding/logo`, `/onboarding/clients`

Onboarding only appears for new accounts that haven't completed setup. After completion → `/dashboard`.
If agent closes browser mid-onboarding, next login resumes at the last incomplete step.

---

## Onboarding Shell

All 4 steps share this outer layout (no sidebar nav — onboarding is isolated).

```
┌──────────────────────────────────────────────────────────────┐
│ TOP (centered, full width):                                  │
│   [Beacon logo — centered]                                   │
│                                                              │
│   PROGRESS INDICATOR:                                        │
│   ●━━━○━━━○━━━○  (4 dots with connecting lines)             │
│   Step 1 of 4 · Agency Info                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ FORM CARD (max-width 480px, centered, white card, shadow):   │
│   [Step-specific content — see each step below]             │
│                                                              │
│   [Continue →]  (primary button, full width)                 │
│                                                              │
│   [← Back] (text link, only on steps 2+)                    │
└──────────────────────────────────────────────────────────────┘
```

Progress indicator states:
- Completed step: filled circle (brand color)
- Current step: filled circle with ring
- Upcoming step: empty circle (grey)

---

## Step 1: Agency Info (`/onboarding/agency`)

Progress: Step 1 of 4

### Form Fields

```
HEADING: "Tell us about your agency"
SUBTEXT: "This information appears in your letter signature."

─────────────────────────────────────
Agency Name *        [______________________]
Agent Name *         [______________________]
State *              [Dropdown — 50 states ▼]
Phone                [______________________]
  Helper: "Optional — shown in your signature"
Work Email *         [______________________]
  Helper: "Used for your signature, not for login"
─────────────────────────────────────
[Continue →]
```

**Validation (on Continue click):**
- Agency Name: required
- Agent Name: required
- State: required (must select from dropdown)
- Phone: optional — if provided, validate format
- Work Email: required, validate email format

**Error display:** Inline below each field, red text, field border turns red.

---

## Step 2: Communication Style (`/onboarding/style`)

Progress: Step 2 of 4

### Form

```
HEADING: "How do you write to clients?"
SUBTEXT: "Beacon will match your tone in every letter."

─────────────────────────────────────
Your Communication Tone *

  [○] Formal
      "Professional and precise. Best for commercial clients."

  [○] In Between  ← (default selected)
      "Warm but professional. Works for most agents."

  [○] Conversational
      "Friendly and personal. Best for long-term personal clients."

─────────────────────────────────────
How do you sign off? *

  [Best,          ] (pre-filled, editable text input)
  Helper: "e.g. 'Best regards,' 'Warmly,' 'Thank you,'"

─────────────────────────────────────
[Continue →]
[← Back]
```

**Live preview (optional enhancement):**
Below the form, small grey box:
"Preview: Your letters will begin with a warm greeting and end with '[sign-off phrase] [Agent Name]'"

---

## Step 3: Logo Upload (`/onboarding/logo`)

Progress: Step 3 of 4

```
HEADING: "Add your agency logo"
SUBTEXT: "Your logo appears on PDF letters. You can add or change this later."

─────────────────────────────────────
UPLOAD ZONE:
  ┌─────────────────────────────────────────┐
  │                                         │
  │   [Cloud upload icon]                   │
  │   Drop your logo here, or click to      │
  │   browse                                │
  │   PNG, JPG, or SVG · Max 2MB            │
  │                                         │
  └─────────────────────────────────────────┘

─────────────────────────────────────

[Continue →]
[Skip — I'll add this later] (secondary button or text link)
[← Back]
```

**After file selected:**
```
  ┌─────────────────────────────────────────┐
  │  [Logo preview — max 200px wide]         │
  │  "agency-logo.png" · 42KB               │
  │  [Remove ✕]                             │
  └─────────────────────────────────────────┘
```

**Validation:**
- File type: must be PNG, JPG, or SVG. Error if other: "Please upload a PNG, JPG, or SVG file."
- File size: max 2MB. Error if over: "Your logo is too large. Please use an image under 2MB."

---

## Step 4: Import Clients (`/onboarding/clients`)

Progress: Step 4 of 4

```
HEADING: "Import your client list"
SUBTEXT: "Upload a CSV to see your renewal calendar. You can always do this later."

─────────────────────────────────────
OPTION A:
  [Import from CSV ↑] (primary button)
  Clicking → triggers CSV import modal/flow inline
  (See wireframe 05 for full CSV import spec)

─────────────────────────────────────
  ── or ──
─────────────────────────────────────

OPTION B:
  [Go to Dashboard — I'll import later] (secondary button)

─────────────────────────────────────
[← Back]
```

**If Import from CSV is clicked:**
- Inline: the CSV import experience (file picker → column mapping → result) replaces this step's content within the onboarding shell (progress indicator stays visible at top)
- The component is the same as `/clients/import` with these differences:
  - No "← Clients" back link in top bar — instead, a "← Back to Import Options" link returns agent to the Step 4 choice (Import or Skip)
  - On successful import: success state shows **"Go to My Renewal Calendar →"** (primary button) — clicking this button marks onboarding complete AND navigates to `/dashboard`
  - On Stage 3 (in progress): no back button — agent must wait for import to complete
  - On error: agent can retry or click "Skip — I'll import later" (secondary) to abandon the inline import and mark onboarding complete
- Server marks onboarding complete at the moment the agent clicks "Go to My Renewal Calendar →"

**If Go to Dashboard is clicked:**
- Navigates to `/dashboard`
- Dashboard shows empty state with import CTAs (see wireframe 01)

---

## Onboarding Completion

After Step 4 (either path):
- Server marks onboarding as complete for this workspace
- Future logins skip directly to `/dashboard`
- Progress indicator not shown on dashboard or any app screen

## Onboarding Resume (returning mid-flow)

- Login redirect: if onboarding incomplete, redirect to last incomplete step
- Progress indicator shows completed steps as filled
- Back navigation allowed through completed steps to edit
- "Continue" on completed step saves edits and advances
