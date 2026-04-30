# Wireframe 10 — Landing Page & Pricing Page

Routes: `/` (landing), `/pricing`, `/privacy`, `/terms`

---

## Screen: Landing Page (`/`)

Public marketing page. No app shell sidebar. Has its own public nav.

### Public Nav (top of all public pages)

```
┌──────────────────────────────────────────────────────────────┐
│  [Beacon logo — left]        Features  Pricing  [Log In]    │
│                              (text links)       [Start Free →]│
│                                                 (primary btn)│
└──────────────────────────────────────────────────────────────┘
```

- Sticky on scroll (stays at top)
- On mobile: logo left, hamburger menu right → drawer with all links
- "Start Free →" → `/signup`
- "Log In" → `/login`

---

### Section 1: Hero

```
┌──────────────────────────────────────────────────────────────┐
│  [EYEBROW LABEL — small, brand color, centered]:            │
│   "Built for independent insurance agents"                   │
│                                                              │
│  [HEADLINE — large, centered, ~48px]:                       │
│   "Stop losing clients to silence."                          │
│                                                              │
│  [SUBHEADLINE — 18px, grey, centered, max-width 600px]:     │
│   "Beacon writes the renewal letters, rate increase          │
│    explanations, and welcome notes your clients deserve —    │
│    in your voice, in 60 seconds."                            │
│                                                              │
│  [CTA ROW — centered]:                                      │
│   [Start Free — 10 Letters on Us] (primary, large)          │
│   "See how it works ↓" (text link, small)                    │
│                                                              │
│  [HERO VISUAL — centered, max-width 900px, rounded shadow]: │
│   Screenshot/mockup of letter generator:                     │
│   - Left panel: client selected (Sarah Johnson, Home+Auto)  │
│   - Right panel: letter streaming into editor               │
│   - Client panel visible: Renewal 28 days · State Farm      │
│                                                              │
│  [SOCIAL PROOF STRIP — below visual, grey bg, full width]:  │
│   ★★★★★ "[quote]" — Independent agent, Phoenix AZ          │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 2: The Problem

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL — small, uppercase, brand color]:           │
│   "The retention problem nobody talks about"                 │
│                                                              │
│  [HEADLINE — centered, 36px]:                               │
│   "You know you should reach out. You just never get to it."│
│                                                              │
│  [BODY COPY — 3 paragraphs, centered, max-width 700px]:     │
│   (from doc 01 — the $21,000 walking out the door copy)     │
│                                                              │
│  [PULL QUOTE — large italics, centered, brand color]:       │
│   "The letters don't get written. And the clients quietly   │
│    leave."                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 3: The Solution

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "What Beacon does"                        │
│                                                              │
│  [HEADLINE]: "Every letter your clients deserve —           │
│               written in 60 seconds."                        │
│                                                              │
│  [BODY COPY — 3 paragraphs from doc 01]                     │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 4: How It Works (3 steps)

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "Three steps. Two minutes."               │
│                                                              │
│  3-COLUMN GRID (stacks on mobile):                          │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  [Icon or   │ │  [Icon or   │ │  [Icon or   │        │
│  │  number: 1] │ │  number: 2] │ │  number: 3] │        │
│  │             │ │             │ │             │        │
│  │ Import your │ │ Generate    │ │ Edit, then  │        │
│  │ clients     │ │ the letter  │ │ send from   │        │
│  │             │ │             │ │ your email  │        │
│  │ [Body copy] │ │ [Body copy] │ │ [Body copy] │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

Each step: number badge (1/2/3), heading, 2–3 sentence description from doc 01.

---

### Section 5: Features (6 features)

Alternating layout: even rows = text left / image right. Odd rows = image left / text right.
On mobile: stacks vertically (image always above text).

```
[Feature 1 — Renewal Calendar]
  LEFT: Heading + body copy
  RIGHT: Calendar screenshot (color-coded cards)

[Feature 2 — Insurance-Specific AI]
  LEFT: Screenshot/illustration
  RIGHT: Heading + body copy

[Feature 3 — Your Voice]
  LEFT: Heading + body copy
  RIGHT: Before/after letter tone comparison visual

[Feature 4 — Sends From Your Email]
  LEFT: Gmail/Outlook connect screenshot
  RIGHT: Heading + body copy

[Feature 5 — Automatic E&O Documentation]
  LEFT: Heading + body copy
  RIGHT: E&O log screenshot

[Feature 6 — Edit Before You Send]
  LEFT: Tiptap editor screenshot
  RIGHT: Heading + body copy
```

All copy from doc 01, Section "Features."

---

### Section 6: Trust & Compliance

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "Built for agents who take compliance     │
│   seriously"                                                 │
│                                                              │
│  [HEADLINE]: "Your clients' data is private.                │
│               Your E&O record is protected."                 │
│                                                              │
│  3-COLUMN ICON GRID:                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  🔒          │ │  📋          │ │  ✓           │        │
│  │  Encrypted   │ │  GLBA        │ │  Tamper-proof│        │
│  │  and private │ │  compliant   │ │  E&O log     │        │
│  │  [copy]      │ │  [copy]      │ │  [copy]      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  [SUBTEXT — below icons]: "Beacon sends letters from your   │
│   personal Gmail or Outlook address — not from a Beacon     │
│   domain."                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 7: Testimonials

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "What agents are saying"                  │
│                                                              │
│  3 TESTIMONIAL CARDS (horizontal, stacks on mobile):       │
│  Each card:                                                  │
│  - ★★★★★ (5 stars)                                         │
│  - Quote text (from doc 01)                                  │
│  - — Name, Title, Location                                   │
│                                                              │
│  NOTE: Replace placeholder quotes with real beta agent      │
│  quotes before launch (doc 01 explicitly states this)       │
└──────────────────────────────────────────────────────────────┘
```

---

### Section 8: Pricing Preview (abbreviated)

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "Simple, flat pricing. No per-user fees." │
│                                                              │
│  [HEADLINE]: "One price. Unlimited letters. Every client    │
│   covered."                                                  │
│                                                              │
│  [INTRO COPY]: "Beacon charges by agency, not by agent..."  │
│                                                              │
│  3 PRICING CARDS (abbreviated — link to /pricing for full):│
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Solo       │  │ Agency     │  │ Office     │           │
│  │ $149/mo    │  │ $299/mo    │  │ $499/mo    │           │
│  │ 1 agent    │  │ Up to 5    │  │ Up to 15   │           │
│  │ Unlimited  │  │ Team hist. │  │ Appr. queue│           │
│  │ [Full →]  │  │ [Full →]  │  │ [Full →]  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  [BELOW CARDS]: "All plans include a 10-letter free trial.  │
│   No credit card required to start."                        │
│                                                              │
│  [CTA]: [Start Free — No Card Required] (primary, centered)│
└──────────────────────────────────────────────────────────────┘
```

---

### Section 9: FAQ (Accordion)

```
┌──────────────────────────────────────────────────────────────┐
│  [SECTION LABEL]: "Questions we get asked"                  │
│                                                              │
│  ACCORDION LIST (each item = clickable row, expands answer):│
│  ▶ Do the letters go out from a Beacon email address?       │
│  ▶ What if I don't want to connect my email?                │
│  ▶ What kind of letters does Beacon write?                  │
│  ▶ Do I have to import all my clients?                      │
│  ▶ Does Beacon keep my E&O records automatically?           │
│  ▶ Is Beacon GLBA compliant?                                │
│  ▶ What happens to my data if I cancel?                     │
│  ▶ Can I cancel anytime?                                    │
│  ▶ What's included in the free trial?                       │
│  ▶ Does Beacon work with my AMS?                            │
└──────────────────────────────────────────────────────────────┘
```

All Q&A copy from doc 01.

---

### Section 10: Final CTA

```
┌──────────────────────────────────────────────────────────────┐
│  [HEADLINE — centered]: "Your clients are waiting to hear   │
│   from you."                                                 │
│                                                              │
│  [BODY COPY — centered]: from doc 01                        │
│                                                              │
│  [CTA — primary, large, centered]:                         │
│   Start Free — 10 Letters on Us                             │
│                                                              │
│  [SUB-TEXT]: "No credit card. Takes 2 minutes to set up."  │
└──────────────────────────────────────────────────────────────┘
```

---

### Footer (all public pages)

```
┌──────────────────────────────────────────────────────────────┐
│  [Beacon logo — left]                                        │
│                                                              │
│  Nav: Home · Features · Pricing · Log In · Sign Up          │
│  Legal: Privacy Policy · Terms of Service                   │
│  Contact: support@get-monolith.com                          │
│  Company: Beacon is a product of Monolith · Ogden, Utah     │
│                                                              │
│  [LEGAL BOILERPLATE — small, grey]:                         │
│   "Beacon is a drafting tool. All letters generated by      │
│    Beacon must be reviewed and approved by the licensed     │
│    agent before sending..."                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Screen: Pricing Page (`/pricing`)

Uses same public nav + footer as landing page.

### Layout

```
PUBLIC NAV

SECTION 1: Hero
  [HEADLINE]: "Flat pricing. No per-agent fees. No surprises."
  [SUBHEADLINE]: from doc 01
  [SOCIAL PROOF STRIP]: ★★★★★ quote about flat-rate pricing

SECTION 2: Plan Cards (3 cards)
  [See plan card spec below]

SECTION 3: Full Feature Comparison Table
  [Full table — see spec below]

SECTION 4: Billing FAQ (accordion)
  [12 Q&As from doc 01]

SECTION 5: Final CTA
  "Ready to stop losing clients to silence?"
  [Start Free — No Card Required]

FOOTER
```

### Plan Card Spec (full detail version)

Each card:
```
┌──────────────────────────────────────────────────────────┐
│  [PLAN NAME — large, H2]                                 │
│  [TAGLINE — grey, italic]                                │
│  ────────────────────────────────────────────────────── │
│  [PRICE — large: $149/month]                             │
│  [BILLING NOTE: "per month, cancel anytime"]            │
│  [BEST FOR BADGE: "Best for: Independent agents"]       │
│  ────────────────────────────────────────────────────── │
│  FEATURES LIST (checkmarks):                            │
│  ✓ Unlimited letter generation                          │
│  ✓ Pre-Renewal Outreach letters                         │
│  ✓ Rate Increase Explanation letters                    │
│  ✓ New Client Welcome letters                           │
│  ✓ Renewal calendar                                     │
│  ✓ Gmail + Outlook send                                 │
│  ✓ Full E&O documentation log                          │
│  ✓ [plan-specific features...]                          │
│  [+ N more included] (expandable if long list)          │
│  ────────────────────────────────────────────────────── │
│  [Start Free Trial] (primary, full width)               │
│  "10 free letters. No credit card required."            │
└──────────────────────────────────────────────────────────┘
```

- Agency card: "★ Most Popular" badge, slightly elevated
- All plan features from doc 01

### Feature Comparison Table

Full table from doc 01 (reproduced exactly). Columns: Feature | Solo | Agency | Office.
Cell values: ✓ | — | price/count.
Sticky header row when scrolling.
On mobile: horizontally scrollable table (don't collapse — preserve comparison utility).

---

## Screen: Privacy Policy (`/privacy`)

```
PUBLIC NAV

CONTENT (max-width 760px, centered, readable prose):
  H1: "Privacy Policy"
  [Last updated date]
  [Legal content from beacon-legal/privacy-policy.md]

FOOTER
```

No special UI elements. Pure content + typography. Link from footer on all public pages.

---

## Screen: Terms of Service (`/terms`)

```
PUBLIC NAV

CONTENT (max-width 760px, centered, readable prose):
  H1: "Terms of Service"
  [Last updated date]
  [Legal content from beacon-legal/terms-of-service.md]

FOOTER
```

Same layout as Privacy Policy.
