# Wireframe 11 — Templates

Routes: `/templates`, `/templates/[id]`

---

## Screen: Templates List (`/templates`)

### Layout

```
APP SHELL
Top bar title: "Templates"

┌─────────────────────────────────────────────────────────┐
│ TABS (below top bar):                                   │
│  [All]  [Pre-Renewal Outreach]  [Rate Increase]        │
│  [New Client Welcome]                                   │
│  (active tab: underline + brand color)                  │
├─────────────────────────────────────────────────────────┤
│ TEMPLATE CARDS GRID (2–3 columns on desktop, 1 mobile): │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │  [Scenario badge — pill: "Pre-Renewal Outreach"] │    │
│ │  "Hi [Client], I wanted to reach out before     │    │
│ │   your homeowner's policy renews next month..." │    │
│ │   (first 2–3 lines, truncated, italic)          │    │
│ │  ──────────────────────────────────────────────  │    │
│ │  Saved Apr 15, 2026                             │    │
│ │  [Use Template →]  [🗑 Delete]                  │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│  [next card...] [next card...]                          │
└─────────────────────────────────────────────────────────┘
```

### Template Card — Spec

- **Scenario badge:** color-coded pill matching scenario type
  - Pre-Renewal Outreach: blue
  - Rate Increase Explanation: amber
  - New Client Welcome: green
- **Preview text:** First 2–3 lines of template body, truncated with "..." — italicized to signal it's content
- **Date saved:** "Saved [Month D, YYYY]"
- **Use Template →:** Links to `/letters/new` with this template pre-loaded in the editor. Client selector remains empty — agent must select a client.
- **Delete (🗑):** Icon button — click triggers delete confirmation modal (no inline delete)

### URL Filter Param

The page supports a `?scenario=` URL parameter to pre-select a tab on load.

| URL | Tab pre-selected |
|---|---|
| `/templates` | All (default) |
| `/templates?scenario=pre-renewal` | Pre-Renewal Outreach |
| `/templates?scenario=rate-increase` | Rate Increase Explanation |
| `/templates?scenario=new-client-welcome` | New Client Welcome |

Used by the "Browse saved templates →" link in the letter generator (see wireframe 02).

### Loading State

On page load: skeleton template cards (grey rounded rectangles, 2–3 columns, 3 rows) appear while data fetches. Tabs are visible and correct tab is active immediately. Skeleton replaced by real cards on load. If load fails: error state (see below).

### Tabs Behavior

- Default tab on load: "All" (all saved templates regardless of scenario)
- Clicking a scenario tab filters to only templates of that type
- Tab shows count badge if > 0: "Pre-Renewal Outreach (3)"

### Card Hover State

- Subtle shadow lift
- "Use Template →" button becomes more prominent (opacity 1)

---

### Empty State — No Templates (All Tab)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   [Illustration: blank document with bookmark]        │
│                                                        │
│         No templates saved yet.                       │
│                                                        │
│   When you edit a letter and save it as a template,   │
│   it appears here as a starting point for future      │
│   letters of the same scenario.                       │
│                                                        │
│   To save a template: generate a letter →             │
│   edit it → click "Save as Template."                 │
│                                                        │
│   [Generate a Letter] (primary → /letters/new)        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Empty State — No Templates (Scenario Tab)

```
  No [Scenario Name] templates saved yet.
  Generate a [scenario name] letter and save it as a
  template to see it here.
  [Generate a Letter] (text link → /letters/new)
```

### Error State — Templates Fail to Load

```
┌────────────────────────────────────────────────────────┐
│  Couldn't load your templates.                        │
│  We hit a problem fetching your saved templates.       │
│  [Refresh Page] (button)                               │
└────────────────────────────────────────────────────────┘
```

### Delete Template — Confirmation Modal

```
┌────────────────────────────────────────┐
│ [✕]  Delete this template?            │
│                                        │
│ This permanently removes this template.│
│ Past letters generated from it are     │
│ not affected.                          │
│                                        │
│ [Cancel]  [Delete Template] (red)      │
└────────────────────────────────────────┘
```

On delete: card removed from grid (animate out), toast "Template deleted."

### Error State — Template Save Failure (triggered from Letter Generator)

Toast notification (red, bottom of screen):
"Template couldn't be saved. Try again."
[Try Again] button in toast.

The letter editor stays open — agent does not lose their letter content on a save failure.

---

## Screen: Template Detail / Edit (`/templates/[id]`)

Clicking a template card opens this page. Agent can preview the full template and choose to use it, or delete it.

### Layout

```
APP SHELL
Top bar: [← Templates]  "[Scenario Name] Template"
Top bar right: [Use Template →] (primary)  [Delete] (secondary, red text)

┌─────────────────────────────────────────────────────────┐
│ META (grey background bar):                             │
│  Scenario: [Name]  |  Saved: [Date]                    │
├─────────────────────────────────────────────────────────┤
│ TEMPLATE BODY (read-only, formatted):                   │
│                                                         │
│  [Full template letter text]                           │
│                                                         │
│  [E&O DISCLAIMER — greyed, non-editable]               │
│  [SIGNATURE PLACEHOLDER — "[Agent Name]", greyed]      │
│  Note: signature shows placeholder, not actual agent   │
│  details, since template is agent-agnostic             │
├─────────────────────────────────────────────────────────┤
│ BOTTOM ACTIONS:                                         │
│  [Use Template →]  (primary → /letters/new?templateId) │
│  [Delete Template] (secondary, red)                    │
└─────────────────────────────────────────────────────────┘
```

### Use Template behavior

Navigates to `/letters/new?templateId=[id]`.
In the letter generator:
- Scenario is pre-selected (matches template's scenario)
- Right panel: template text pre-loaded in Tiptap editor (editable)
- Client selector is empty — agent must select a client
- Subject line: empty (template doesn't include a locked subject — agent fills it)
- Status indicator: "Template loaded — select a client to continue"

### Notes

- Template content is read-only on this detail page — editing is done by loading the template into the generator, making edits, and saving as a new template
- No inline editing of templates (avoids confusion between editing the template vs. a specific letter)
- E&O disclaimer shown in template preview but noted as the live version, not hardcoded in the template text itself
