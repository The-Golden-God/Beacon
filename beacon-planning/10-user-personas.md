# Beacon — User Personas

Three primary personas. Every design, copy, and feature decision must be tested against one of these three people. If a feature makes sense for none of them, cut it.

---

## Persona 1: Sandra "Sandy" Kowalski
**The Veteran Agency Owner**

| | |
|---|---|
| **Age** | 52 |
| **Location** | Suburban Midwest (Columbus, Indianapolis, Cleveland) |
| **Role** | Agency principal, licensed P&C agent, 22 years in the industry |
| **Agency size** | 3 agents (herself + 2 producers she hired) |
| **Book of business** | ~850 clients, primarily personal lines (home, auto, umbrella), some small commercial |
| **Carriers** | 8-10, mix of regional and national |
| **Tech comfort** | 3/10 — uses email, her AMS, and nothing else voluntarily |
| **Current tools** | HawkSoft (AMS), Outlook, Microsoft Word |
| **Annual commissions** | ~$480,000 |
| **Beacon plan** | Agency ($299/month) |

### Sandy's Problem

Sandy knows she's losing clients. She's been in this business long enough to know that the agents who communicate consistently are the ones who retain. She sends Christmas cards — actual paper cards — to her top 50 clients every year. She used to call every client before renewal. She can't anymore. Her book is too big and her producers don't do it.

Last year she lost 18 clients she can identify by name. She believes at least 12 of them would have stayed with a letter or a phone call before renewal. She's calculated the number she lost in revenue. She won't say it out loud.

She tried having a producer write template renewal letters. It lasted six weeks. The letters didn't feel personal. The producer resented the time. Nobody sent them consistently.

### What Sandy Cares About (in order)

1. **Keeping clients she has** — she can't sustain losing 15+ per year
2. **E&O protection** — she's seen two colleagues face claims; she is meticulous about documentation
3. **Easy setup** — if it takes more than a week to learn, she won't adopt it
4. **Her producers actually using it** — she's bought software before that collects dust
5. **Price** — $299/month is nothing if it keeps even 2 clients she'd otherwise lose

### Sandy's Objections

- "Is this going to sound like a robot wrote it?"
- "My clients know me. If I send them a form letter they'll notice."
- "I don't want my clients' information in some cloud system I don't control."
- "How long does the setup take? I don't have a week to migrate everything."

### How Beacon Wins Sandy

The demo moment: she names a real client, the policy type, and the situation. In 60 seconds she sees a letter that sounds like she wrote it. She edits one sentence. She asks "can I send that right now?" That's the moment she's sold.

The E&O log is the closing argument. She didn't know she needed it until she saw it — a tamper-proof record of every communication, automatically documented, exportable as PDF.

### Sandy's First Month

- Exports HawkSoft CSV on Day 1, imports in under 10 minutes
- Sees renewal calendar — immediately identifies 7 clients in the red zone (renewal within 30 days, no outreach)
- Generates and sends 3 letters in the first session
- Demos it to her producers in a team meeting in Week 2
- By Month 2, the agency is generating 25-30 letters/month

### Design Implications for Sandy

- Onboarding must be completable in under 5 minutes — no multi-step wizard she can abandon
- Every screen must be legible without hover states or icon-only navigation — she uses a laptop, not a touchpad
- Error messages must be in plain English — no technical jargon
- The renewal calendar must make it immediately obvious who needs a letter — no interpretation required
- The admin view of all producers' clients must be simple, not a reporting dashboard

---

## Persona 2: Jake Rivera
**The Young Producer Building His Book**

| | |
|---|---|
| **Age** | 27 |
| **Location** | Urban or suburban (Denver, Austin, Phoenix, Charlotte) |
| **Role** | Independent producer, 3 years licensed, building his own book |
| **Book of business** | 180 clients and growing (adds 8-12 per month) |
| **Tech comfort** | 9/10 — early adopter, already uses AI informally |
| **Current tools** | EZLynx (AMS), Gmail, ChatGPT, Slack, Calendly |
| **Annual commissions** | ~$95,000 and growing |
| **Beacon plan** | Solo ($149/month) |

### Jake's Problem

Jake is building fast. He knows client communication matters for retention but he's spending time producing, not writing. When he does write letters, he uses ChatGPT — it's okay, but he types in all the client details manually every time, the letters don't sound like him, and there's no record of what he sent.

He's also forward-thinking enough to know his E&O exposure is growing with his book. He doesn't have documentation habits yet. He knows he should.

### What Jake Cares About (in order)

1. **Speed** — 60 seconds is genuinely attractive; he doesn't have 45 minutes
2. **Looking professional** — he's competing for trust against 20-year veterans
3. **Gmail send** — he is not switching email; the letter has to go from his Gmail
4. **Building good habits now** — he wants to do this right from the start
5. **Price** — $149/month is easy. He'll sign up in 5 minutes if the demo looks good.

### Jake's Objections

- "I already use ChatGPT for this — what does Beacon do that I can't do myself?"
- "Does it actually work with Gmail? Or do I have to copy-paste?"
- "Can I try it before I pay?"

### How Beacon Wins Jake

Side-by-side comparison. His current workflow: open ChatGPT, type the scenario, type all the client details, get a generic letter, copy it, open Gmail, paste it, send it. No record. 8-10 minutes, minimum.

Beacon: open a client from the renewal calendar (details already there), click Generate, read the letter (personal, pre-filled, sounds like him), click Send from within Beacon. 90 seconds. Logged automatically.

He upgrades from trial within 7 days. Probably Day 3.

### Jake's First Month

- Signs up, skips CSV import, adds 3 clients manually on Day 1
- Generates first letter in under 10 minutes of signing up
- Connects Gmail in the first session — immediately wants the one-click send
- Returns 3-4 times per week — uses it before client calls, not just for letters
- Starts saving templates after his second week
- Upgrades to paid on Day 5 or 6

### Design Implications for Jake

- Must be fast to navigate — no loading spinners, no multi-step confirmation dialogs
- Letter generator must be the primary action from the dashboard — not buried
- Gmail OAuth connect must be frictionless — one button, one auth screen, done
- Trial counter must be visible but not annoying — he notices everything
- Mobile-friendly is important — he checks things from his phone between appointments

---

## Persona 3: Maria Chen
**The Multi-Agent Agency Owner**

| | |
|---|---|
| **Age** | 44 |
| **Location** | Mid-size metro (Sacramento, Tampa, Kansas City, Nashville) |
| **Role** | Agency owner and managing agent, 8 producing agents on her team |
| **Book of business** | 2,200+ clients across all producers, personal and commercial |
| **Tech comfort** | 6/10 — comfortable with software, evaluates it carefully |
| **Current tools** | Applied Epic (AMS), Outlook, agency-wide shared templates (rarely used), Slack |
| **Annual commissions** | ~$1.1M agency-wide |
| **Beacon plan** | Office ($499/month) |

### Maria's Problem

Maria doesn't have a communication inconsistency problem. She has a communication chaos problem. Some producers reach out proactively. Most don't, or do it inconsistently. She has no visibility into which clients got renewal outreach and which didn't. And when an E&O issue surfaced last year — a rate increase nobody had documented discussing with a client — it cost her $12,000 in legal fees before the claim was dismissed.

She needs her producers sending more letters AND she needs to see who's sending what, to whom, and when.

### What Maria Cares About (in order)

1. **Team consistency** — producers must send letters; she can't monitor 8 people manually
2. **Visibility** — she needs the admin calendar view and the shared E&O log
3. **Approval queue** — rate increase letters especially should go through her before sending
4. **Reliable E&O documentation** — not "did Jake send that? I think he did?"
5. **Price** — $499/month is 0.05% of agency revenue. If it prevents one E&O claim, it pays for the next decade.

### Maria's Objections

- "My producers won't use it if it adds friction — I've tried forcing tools before."
- "How do I know what they're actually sending on my agency's behalf?"
- "Can I require approval on rate increase letters before they go out?"
- "We're on Applied Epic — can we get client data in without rekeying everything?"

### How Beacon Wins Maria

The admin calendar view and the approval queue. She can see every client across every producer, color-coded by urgency. She can configure rate increase letters to require her approval before sending. The E&O log shows every letter sent, by which producer, to which client, at what time — immutable.

The Applied Epic CSV export handles the data import. It's a one-time setup, under 10 minutes.

### Maria's First Month

- Asks her office manager to do the CSV import on Day 1
- Sets up producer accounts for all 8 agents in the first week
- Reviews the admin calendar in the first session — immediately sees which producers have red-zone clients and haven't sent anything
- Configures the approval queue for rate increase letters in the first week
- By Week 3, her most hesitant producer has sent more letters in two weeks than in the previous three months

### Design Implications for Maria

- Admin calendar view must clearly differentiate between producers — color coding or filter is essential
- Approval queue must be easy to act on from the admin view — see the letter, approve or request revision, done
- E&O log must show producer attribution for every entry — not just "a letter was sent to this client"
- Role management (admin vs. producer) must be clear in settings — not buried
- The onboarding sequence must work for inviting 8 agents without requiring Maria to do each one personally

---

## Persona Summary

| | Sandy | Jake | Maria |
|---|---|---|---|
| **Plan** | Agency ($299) | Solo ($149) | Office ($499) |
| **Primary pain** | Retention + E&O documentation | Speed + professionalism | Team consistency + visibility |
| **Tech comfort** | Low | High | Medium |
| **Decision speed** | Slow (days) | Fast (hours) | Medium (needs to demo to team) |
| **Key demo moment** | Generating a letter for a real client she names | Side-by-side vs. ChatGPT | Admin calendar + approval queue |
| **Closing argument** | E&O log | Gmail send in one click | Per-producer E&O log |
| **Biggest objection** | "Will it sound robotic?" | "Better than ChatGPT how?" | "Will my producers actually use it?" |
