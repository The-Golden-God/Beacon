# Beacon — Letter Content Guide & Prompt Strategy

This document defines what each of Beacon's three letter scenarios must contain, must never contain, and what quality looks like. This is the core IP — it drives the system prompt, the UI field requirements, and the quality bar for beta review.

---

## Universal Rules (All Three Scenarios)

### Must Always Include
- Client's first name in the first sentence — always, without exception
- Agent's full name, agency name, phone number, and email in the signature
- E&O disclaimer footer (hardcoded, non-editable, non-removable — see exact language below)
- A clear, specific call to action at the end (call me, reply to this email, schedule a review — never vague)
- Written in first person from the agent

### Must Never Include
- Insurance jargon the client wouldn't know: surplus lines, endorsement form numbers, SIC codes, facultative reinsurance, ISO forms, etc.
- Coverage promises or guarantees — never "you're covered for X" — always "your policy includes X, which I'm happy to review with you"
- Specific legal advice of any kind
- Hollow filler phrases:
  - "I hope this letter finds you well"
  - "As always, we value your business"
  - "Please don't hesitate to reach out"
  - "I wanted to reach out regarding..."
  - "Dear Valued Customer"
  - "Thank you for your continued loyalty"
- More than the scenario word limit (Pre-Renewal Outreach: 250 words; Rate Increase Explanation: 220 words; New Client Welcome: 200 words)
- More than 4 paragraphs
- Multiple calls to action (one is enough — two creates confusion)
- Anything that sounds like a mass communication or bulk mail

### Tone Rules
- Warm but professional. Not corporate. Not overly casual.
- Direct — says what it means in the first sentence, not the third
- Specific — references the client's actual situation (name, policy type, renewal timeframe, carrier if known)
- Confident, not pushy. Helpful, not sycophantic.
- The agent is a trusted advisor writing to someone they know — not a salesperson writing to a prospect.

### Quality Bar Test
Before any letter is considered acceptable output, it must pass three tests:

1. **The 16-year-old test:** A 16-year-old with no insurance knowledge can read it and understand every sentence.
2. **The "did they write this themselves" test:** The client should not be able to tell the letter was AI-generated.
3. **The E&O test:** Nothing in the letter makes a specific coverage promise, provides legal advice, or could be used against the agent in a claim.

---

## E&O Disclaimer Footer (Exact Language — Hardcoded)

This text appears at the bottom of every letter, separated by a horizontal rule, in a smaller font size. It is non-editable and cannot be removed by any user including admins.

---

*This communication was drafted with the assistance of AI writing technology. The licensed agent of record reviewed and approved all content prior to sending. This letter is for informational and relationship purposes only. It does not constitute a change to, confirmation of, or advice regarding your insurance coverage. Please review your policy documents for the terms and conditions of your coverage. For questions about your specific coverage, contact your agent directly.*

---

## Subject Line Auto-Generation

Every generated letter includes an auto-generated subject line. Subject lines follow these formats by scenario:

| Scenario | Format | Example |
|---|---|---|
| Pre-Renewal Outreach | "Your [Policy Type] renewal — let's connect before [Month]" | "Your home and auto renewal — let's connect before May" |
| Rate Increase Explanation | "Important update on your [Policy Type] renewal" | "Important update on your homeowner renewal" |
| New Client Welcome | "Welcome — your [Policy Type] coverage is in place" | "Welcome — your home and auto coverage is in place" |

Rules:
- Subject line is always auto-generated immediately after the letter body streams in
- Subject line is fully editable by the agent before sending
- If policy type is not provided: use "insurance" as the fallback ("Your insurance renewal — let's connect before May")
- Subject lines do not include the client's name (avoids appearing as a merge-mail blast in email clients)
- Subject lines do not include specific dollar amounts or premium figures (reduces spam filter triggers)

---

## Empty Variable Fallback Language

When optional input variables are absent, the AI generates gracefully without them. These are the canonical fallback behaviors — the prompt strategy must match these specs:

| Variable | If Empty | Fallback behavior |
|---|---|---|
| `carrier` | Omit carrier reference | "your coverage" instead of "your State Farm policy" |
| `current_premium` | Omit premium reference | No dollar figure in letter; focus on renewal timing |
| `years_as_client` | Omit tenure reference | No "we've worked together for X years" line |
| `recent_life_change` | Omit life change reference | Letter focuses on renewal timing and market conditions |
| `rate_increase_reason` | Use generic market explanation | "Carriers across the market are adjusting rates in response to broader industry trends." |
| `policy_effective_date` | Omit effective date | "your coverage is now in place" without specific date |
| `what_they_insured` | Use policy type only | "your home and auto coverage" instead of "your 3-bedroom home on Oak Street" |
| `agent_notes` | Omit notes entirely | No additional context paragraph |

**Critical rule:** When a variable is absent, the letter must never produce visible placeholder text like "[CLIENT NAME]" or leave a blank in the middle of a sentence. Every fallback must be a complete, natural-sounding sentence.

---

## Universal Input Variables

These inputs are drawn from the client record and agent profile and pre-fill the letter automatically. The agent can override any field before generating.

| Variable | Source | Required? |
|---|---|---|
| `client_first_name` | Client record | Required |
| `client_last_name` | Client record | Optional (for signature reference) |
| `policy_type` | Client record | Required |
| `renewal_date` | Client record | Required |
| `carrier` | Client record | Optional |
| `current_premium` | Client record | Optional |
| `agent_notes` | Client record (free text) | Optional |
| `agent_name` | Agency profile | Required |
| `agency_name` | Agency profile | Required |
| `agent_phone` | Agency profile | Required |
| `agent_email` | Agency profile | Required |
| `communication_style` | Agency profile (formal / conversational / in between) | Required |
| `sign_off_phrase` | Agency profile | Required |

---

## Scenario 1: Pre-Renewal Outreach

### Purpose
Reach out to a client 30-90 days before their renewal date. Get ahead of the renewal conversation, reinforce the relationship, and give the client a reason to stay before they start shopping — or worse, receive a renewal notice in the mail with no context.

### When It's Used
Client has a renewal date within 90 days and no letter has been sent in the last 90 days. This is the most common scenario and the highest-volume use case.

### Additional Input Variables (Scenario-Specific)
| Variable | Notes |
|---|---|
| `years_as_client` | Optional. "We've worked together for 7 years." Adds personalization. |
| `recent_life_change` | Optional. New home, added a driver, new business, recent claim. Agent enters manually. |

### Required Elements
1. Open with client's first name and reference the upcoming renewal (specific month, not exact date unless it adds value)
2. Signal that the agent is aware of the client's specific situation — not sending a form letter
3. Offer to review the policy together before renewal — make it easy, not a formal appointment
4. At least one reason why a review makes sense right now (market conditions, life changes, time since last review)
5. One clear, low-friction CTA — "reply to this email," "give me a call," "just text me"

### Letter Structure
- **Para 1:** Personal opening — client's name, renewal is coming up, agent is thinking about them specifically
- **Para 2:** Reference their coverage + offer the review — confirm the agent knows their situation
- **Para 3:** One reason a review matters right now (market, time since last review, rate environment)
- **Para 4 (optional):** Personal touch if `agent_notes` or `recent_life_change` has relevant context
- **Signature + CTA + E&O disclaimer**

### Tone Calibration
More personal than professional. This is an agent checking in on someone they know. Not a form letter. Not a solicitation. The client should feel like they received a personal note, not a marketing email.

### What Makes This Letter Fail
- Starts with "I wanted to reach out regarding your upcoming renewal" — robotic, generic
- Zero specificity about the client's actual policy type or situation
- Vague CTA ("feel free to contact us if you have any questions")
- Runs past 250 words
- Sounds like it was sent to every client simultaneously (because it was)

### Target Quality Example

> Hi Sarah,
>
> Your homeowner and auto policies are coming up for renewal in April, and I wanted to connect before anything landed in your mailbox.
>
> The market has been moving fast this year — I've been watching rate environments across the carriers we work with, and I'd rather walk through your options with you before the renewal hits than after you have questions. Can we find 15 minutes before the end of March to review your coverage together?
>
> You've been with us for six years now, and I want to make sure we have the right coverage in place going into this renewal — not just the same coverage as last year.
>
> Reply here or give me a call at 801-555-0192 and we'll get it on the calendar.
>
> Talk soon,
> [Agent Name]
> [Agency Name]
> [Phone] | [Email]

---

## Scenario 2: Rate Increase Explanation

### Purpose
Proactively explain a premium increase before the client's renewal documents arrive. Get ahead of the shock. Keep the client from shopping without calling first. Reinforce the agent's value as an advisor who is watching out for them.

The agent who calls first — or writes first — before the client opens a surprising renewal notice is the agent who keeps the client. The agent who goes silent loses them to Google.

### When It's Used
Agent is aware a client is receiving a material rate increase at renewal. Agent selects this scenario and inputs the increase amount or percentage.

### Additional Input Variables (Scenario-Specific)
| Variable | Notes |
|---|---|
| `rate_increase_amount` | Required for this scenario. Dollar amount OR percentage — agent specifies. |
| `rate_increase_reason` | Optional but strongly recommended. Agent describes the reason: "auto liability losses in your state," "reinsurance market hardening," "wildfire zone reassessment." Improves specificity dramatically. |

### Required Elements
1. Name the increase directly in the first or second sentence — do not bury it
2. Explain WHY in plain English — market-level explanation, not "the carrier did this." Frame as market forces, not carrier fault.
3. Confirm the agent has reviewed whether better options exist — signals professional advocacy
4. One offer: review and compare options, or explain why staying is the right call
5. Note that going to a new carrier without the agent's guidance has risks (coverage gaps, loss of renewal credits, loss of relationship)
6. Strong, specific CTA — not optional for this scenario

### Letter Structure
- **Para 1:** Name the increase. Acknowledge the impact. Empathize — briefly.
- **Para 2:** Explain the market/industry reason in plain English (2-3 sentences max — do not lecture)
- **Para 3:** What the agent has done or will do on the client's behalf — reviewed options, can shop if warranted, here's the recommendation
- **Para 4 (optional):** What coverage is being maintained and why staying makes sense, if applicable
- **Signature + CTA + E&O disclaimer**

### Tone Calibration
More professional than personal. Empathetic without being apologetic. The agent didn't cause the increase — the market did — but the agent is the advocate helping the client navigate it. Confident, not defensive.

### What Makes This Letter Fail
- Buries the increase amount or percentage in paragraph 3 (client feels misled)
- Blames the carrier specifically by name in a way that damages the carrier relationship
- Offers to shop without first defending the current carrier (signals the agent doesn't believe in the product)
- Overly apologetic ("I'm so sorry about this, I know it's frustrating...")
- Doesn't tell the client what to do next
- Runs past 220 words

### Target Quality Example

> Hi James,
>
> I'm reaching out before your renewal documents arrive because I want you to hear about the rate change from me first. Your homeowner premium is increasing by $380 at renewal — and I want to explain why and what we're doing about it.
>
> The entire market is experiencing significant rate increases right now. Carriers are responding to two years of elevated claims frequency and rising reinsurance costs — it's not specific to your property or your claims history. This is a market-wide adjustment, and it's affecting nearly every carrier we work with.
>
> I've already reviewed your coverage to see if there's a better option for your situation. [Option A: I have a quote from another carrier I want to walk you through.] [Option B: After reviewing the available alternatives, I believe staying with your current carrier is still the right call — here's why.]
>
> Give me a call at 801-555-0192 or reply to this email and I'll walk you through exactly what changed and what your options are. Don't make any coverage decisions based on the renewal notice alone — let's talk first.
>
> Best,
> [Agent Name]
> [Agency Name]
> [Phone] | [Email]

**Option A / Option B — Formal Spec:**

The Rate Increase letter requires one of two distinct third-paragraph approaches. The agent must select which applies before generating:

- **Option A (Have a Quote):** "I've reviewed the available alternatives and have a quote from another carrier I want to walk you through."
- **Option B (Staying Is Right):** "After reviewing the available alternatives, I believe staying with your current carrier is still the right call for your situation — here's why."

**UI requirement:** The letter generator left panel shows an additional field when Rate Increase scenario is selected: "What have you found?" — a segmented control or radio group with two options: "I have a quote to present (Option A)" | "Staying put is the right call (Option B)". This field is required before generation can proceed. See wireframe 02 for the UI spec of this selector.

**If neither option is selected:** Generate button remains disabled. Tooltip: "Select what you've found for your client before generating."

*The system prompt must generate Option A or Option B content based entirely on the agent's selection — it must never hallucinate which situation applies.*

---

## Scenario 3: New Client Welcome

### Purpose
Welcome a new policyholder within the first 30 days of their policy going into effect. Establish the relationship, set expectations for how the agent works, and create a personal touchpoint before the client forgets who their agent is.

New clients are most likely to question their decision in the first 90 days. A warm, personal welcome letter reduces first-year cancellation significantly. It also sets the expectation that this agent communicates — which differentiates immediately from the agents who never reach out after the sale.

### When It's Used
Agent has added a new client to the system and selects "New Client Welcome" as the scenario. Best sent within 2 weeks of the policy effective date.

### Additional Input Variables (Scenario-Specific)
| Variable | Notes |
|---|---|
| `policy_effective_date` | Optional. "Your coverage went into effect on [date]." |
| `what_they_insured` | Optional. More specific than policy type — "your new home at [street]," "your family's vehicles." Agent adds if they want specificity. |

### Required Elements
1. Welcome by first name — genuine, not corporate
2. Confirm the specific policy or coverage the client just set up — not generic
3. Tell them exactly how to reach the agent when something comes up
4. Set expectations for future communication (agent will check in before renewal, client should call the agent — not Google, not 1-800 — for questions)
5. One memorable reason to call the agent first: adding a driver, buying a new car, filing a claim, making renovations — the agent should know before the client acts
6. Low-stakes CTA — just confirm they received the letter and can reach the agent

### Letter Structure
- **Para 1:** Welcome + confirmation of the coverage in place (specific, not generic)
- **Para 2:** How the agent works — when to call, what the agent handles, how reachable they are
- **Para 3:** One key thing to know — the "call me first" rule and why it protects the client
- **Para 4 (optional):** Next planned touchpoint — before renewal, annual review, etc.
- **Signature + CTA + E&O disclaimer**

### Tone Calibration
Warm, confident, personal. Slightly more relaxed than the other two scenarios. This is a "glad you're with us, here's how I work" letter. The client should feel welcomed into a professional relationship, not enrolled in a customer service program.

### What Makes This Letter Fail
- Generic opening ("We appreciate your business" / "Welcome to [Agency Name]!")
- Doesn't mention the specific policy or what was insured
- Doesn't tell the client when or why to reach out
- Sounds like a legal notice or terms-of-service email
- Runs past 200 words

### Target Quality Example

> Hi Marcus,
>
> Welcome — your home and auto coverage went into effect this week, and I wanted to reach out personally before you got buried in paperwork.
>
> I'm your agent for both policies, which means I'm the person to call anytime something comes up — not the 1-800 number on your insurance card. Questions about your coverage, a fender-bender, updating your policy when you add a driver — I handle all of it. Fastest way to reach me is my cell: 801-555-0192.
>
> One thing I always tell new clients: if you're thinking about making a change — buying a new car, renting out a room, starting a business from home — call me first. These things affect your coverage in ways that matter, and it takes five minutes to make sure you're protected before something happens.
>
> I'll be in touch before your renewal. In the meantime, my door is open.
>
> Talk soon,
> [Agent Name]
> [Agency Name]
> [Phone] | [Email]

---

## Voice Learning (How It Works)

Each agent builds a voice profile over time that improves letter quality for that specific agent.

### What Voice Data Is Captured

**Explicit signals:**
- Sign-off phrase (from agency profile — "Talk soon," / "Best," / "Warmly,")
- Communication style setting (formal / in between / conversational)
- Templates saved by the agent — represent approved letter quality

**Implicit signals (Post-MVP Phase 2):**
- Edits the agent makes to generated letters — the diff between AI draft and final version
- Common substitutions the agent makes consistently (e.g., always changes "I wanted to reach out" → "I'm writing to")
- Sentence length preference (short/punchy vs. longer/explanatory)
- Formality signals from saved templates

### What Voice Learning Does NOT Do

- Does not change required elements (E&O disclaimer, signature fields, first-name opening — inviolable)
- Does not learn from letters the agent did not interact with
- Does not mix one agent's voice into another agent's letters
- Does not override the scenario's required structure — only adjusts tone and style within that structure

### At MVP

Voice learning at MVP is implemented through:
1. Communication style setting (formal / in between / conversational) — applied to every generation
2. Sign-off phrase from agency profile — applied to every generation
3. Saved templates — the agent approves these as representative of their style, and they're available as starting points for future letters of that scenario

Full edit-diff learning loop (tracking edits to improve future generations) is a Phase 2 feature built after launch, once there's enough usage data to make it meaningful.

---

## Letter Review Checklist (Beta Testing and QA)

Before launch, a licensed P&C agent (not the developer) must review at least 10 sample letters — minimum 3 per scenario — and confirm each one passes:

- [ ] First sentence includes the client's name
- [ ] Under 250 words
- [ ] No insurance jargon that fails the 16-year-old test
- [ ] No coverage promises or guarantees
- [ ] No hollow filler phrases
- [ ] E&O disclaimer footer present and correct
- [ ] Agent signature fields all present
- [ ] Call to action is specific and low-friction
- [ ] The letter sounds like it was written by a human agent
- [ ] A real client would not recognize it as AI-generated
