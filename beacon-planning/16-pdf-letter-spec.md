# Beacon — PDF Letter Spec

This document defines the layout, typography, and content structure for two distinct PDF types that Beacon generates:

1. **Letter PDF** — a single generated letter, downloaded via "Download PDF" from the letter generator
2. **E&O Log PDF** — the audit export of the full E&O documentation log, downloaded via "Export PDF" from the log screen

Both are generated server-side (not client-side print). The PDF generation library should produce clean, print-ready output. Recommended: `@react-pdf/renderer` or Puppeteer with a headless browser. The exact library is a Phase 4 implementation decision.

---

## Part 1: Letter PDF

### File Naming

`beacon-[client-last-name]-[YYYY-MM-DD].pdf`

Example: `beacon-johnson-2026-05-15.pdf`

If client last name is unavailable: `beacon-letter-[YYYY-MM-DD].pdf`

---

### Page Setup

| Property | Value |
|---|---|
| Paper size | US Letter (8.5" × 11") |
| Orientation | Portrait |
| Margins | 1" top, 1" bottom, 1.25" left, 1.25" right |
| Font family | Georgia (serif) for body; system-ui or Inter for metadata |
| Base font size | 11pt |
| Line height | 1.6 |

---

### Header (top of every page)

```
┌──────────────────────────────────────────────────────────┐
│  [Agency Logo — if uploaded]    Beacon                   │
│  [Agency Name]                  [Date generated]         │
│  [Agent Name]                                            │
└──────────────────────────────────────────────────────────┘
```

**Agency logo placement:**
- If logo is uploaded: displayed top-left, max 120px wide, max 60px tall — maintains aspect ratio
- If no logo: agency name text fills the left column
- Beacon wordmark: top-right, small (grey, 10pt)
- Date: top-right, below Beacon wordmark, format: "May 15, 2026"
- Horizontal rule separates header from letter body

**Logo rendering note:** Logos must be provided as PNG, JPG, or SVG. At PDF generation time, SVG logos are rasterized at 2x resolution for print clarity.

---

### Subject Line Block

Below the header, above the letter salutation:

```
Subject: [Subject line text]
```

- Font: bold, 11pt
- Preceded by a 0.25" gap below the header rule
- Followed by a 0.25" gap before the salutation

---

### Letter Body

The full letter text as formatted in the Tiptap editor:
- Paragraphs separated by 0.15" vertical spacing (not indented)
- Bold, italic, underline formatting preserved
- Bullet lists and numbered lists rendered with standard indentation
- No header/footer inside the letter body section

---

### E&O Disclaimer Footer

Rendered as a locked section below the letter body, separated by a horizontal rule:

```
─────────────────────────────────────────────────────────

This communication was drafted with the assistance of AI writing technology. The licensed
agent of record reviewed and approved all content prior to sending. This letter is for
informational and relationship purposes only. It does not constitute a change to,
confirmation of, or advice regarding your insurance coverage. Please review your policy
documents for the terms and conditions of your coverage. For questions about your specific
coverage, contact your agent directly.
```

- Font: 9pt, italic, grey (#6B7280)
- Background: light grey (#F9FAFB) behind the disclaimer block
- Horizontal rule above disclaimer: full page width, 0.5pt, grey

---

### Agent Signature Block

Below the disclaimer, at the bottom of the letter:

```
[Agent Full Name]
[Agency Name]
[Phone] | [Email]
[State] | NPN: [NPN if provided]
```

- Font: 10pt, regular weight
- Same grey background as disclaimer block
- "Signature — edit in Beacon Settings" label: 8pt, grey, below the block (for PDF clarity)

---

### Footer (bottom of every page, if multi-page)

```
Page [N] of [N]        beacon.get-monolith.com        Generated [Date]
```

- 8pt, grey, centered
- Shown only if letter spans more than one page (rare — letters are under 250 words)

---

### Page Break Behavior

- The letter body should never be split between a page break mid-paragraph
- The E&O disclaimer block must never be orphaned on a new page alone — if it doesn't fit on the letter page, the entire disclaimer+signature block moves to page 2 together

---

## Part 2: E&O Log PDF Export

### File Naming

`beacon-eo-log-[YYYY-MM-DD].pdf`

If filters were applied at export time: `beacon-eo-log-[YYYY-MM-DD]-filtered.pdf`

---

### Page Setup

| Property | Value |
|---|---|
| Paper size | US Letter (8.5" × 11") |
| Orientation | Landscape (more columns) |
| Margins | 0.75" all sides |
| Font family | system-ui / Inter |
| Base font size | 9pt |

---

### Cover Page

The E&O log PDF begins with a cover page:

```
┌──────────────────────────────────────────────────────────┐
│  [Agency Logo — if uploaded]                             │
│                                                          │
│  E&O Documentation Log                                   │
│  [Agency Name]                                           │
│  [Agent Name]  |  NPN: [NPN if provided]                 │
│  [State of Licensure]                                    │
│                                                          │
│  Export generated: [Date and time]                       │
│  Date range covered: [All time] or [From — To]          │
│  Filters applied: [List of active filters, or "None"]   │
│  Total entries: [N]                                      │
│                                                          │
│  Exported by: [Admin/Agent Name] (if admin export)       │
│                                                          │
│  Log ID prefix: beacon-log-[workspace-uuid-prefix]       │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│  This document is an export of Beacon's tamper-proof     │
│  E&O documentation log. Entries cannot be edited or      │
│  deleted in the Beacon platform. Entries in this PDF     │
│  are a point-in-time snapshot as of the export date.     │
└──────────────────────────────────────────────────────────┘
```

---

### Log Summary Table

Page 2+ of the export. One row per log entry, sorted newest first (matching the on-screen sort).

**Table columns:**

| Column | Width | Content |
|---|---|---|
| # | 4% | Entry number (1, 2, 3...) |
| Date/Time | 14% | "Apr 27, 2026 · 2:14 PM" |
| Client | 16% | Full name |
| Scenario | 14% | Pre-Renewal / Rate Increase / New Client Welcome |
| Producer | 12% | Agent name (Agency/Office tiers) |
| Status | 10% | "Sent ✓" or "Not Sent —" or "Awaiting Approval" |
| Recipient | 18% | Email address (if sent), else "—" |
| Log ID | 12% | beacon-log-[short uuid] |

**Table styling:**
- Header row: dark grey background, white text, 9pt bold
- Alternating row colors: white / light grey (#F9FAFB)
- Row height: auto (wraps if content long)
- No cell borders except bottom border per row

---

### Letter Text Appendix (Optional)

By default, the E&O log PDF includes only the summary table. An agent or admin may optionally request a "Full Export" which appends the full letter text for each entry after the summary table.

**Full Export format:**
- Each entry gets its own page (or section separated by a full-width rule)
- Shows: all metadata from the summary row + full letter body + E&O disclaimer + agent signature
- Ordered same as summary table (newest first)
- Page header on each letter page: "E&O Log Entry [#] of [N]" + Log ID

**Default export (summary only):** This is the standard export available from the UI. The Full Export is available as a secondary option on the Export PDF dialog.

---

### Export PDF Dialog

When agent clicks "Export PDF" from the E&O log screen:

```
MODAL (max-width 420px):
  ┌────────────────────────────────────────────┐
  │ Export E&O Log                             │
  ├────────────────────────────────────────────┤
  │                                            │
  │ [N] entries will be exported               │
  │ (based on current filters)                 │
  │                                            │
  │ Format:                                    │
  │ [●] Summary only (log table)               │
  │ [○] Full export (includes letter text)     │
  │                                            │
  │ [Export PDF] (primary)                     │
  │ [Cancel] (text link)                       │
  └────────────────────────────────────────────┘
```

For very large exports (>500 entries), a note: "Large exports may take up to 30 seconds to generate."

---

## Part 3: Shared PDF Requirements

### Accessibility

PDF outputs should meet basic PDF/UA requirements where the PDF library supports it:
- Tagged PDF structure for screen reader compatibility
- Document title metadata set to the file name
- Language set to "en-US"

### Print Quality

- All content should print clearly at 300 DPI on a standard laser or inkjet printer
- Logos rendered at 2x for print clarity
- No backgrounds that would waste printer toner in excessive amounts (light grey is acceptable; heavy dark backgrounds are not)

### Beacon Branding

- Beacon wordmark appears in the header of letter PDFs (top right, small, grey)
- Beacon wordmark appears on the cover page of E&O log PDFs
- No Beacon watermarks or overlays on the letter body itself — the letter should look like it came from the agent, not from Beacon
