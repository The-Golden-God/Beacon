# Beacon — Financial Model

## Pricing Tiers

| Tier | Price/Month | Who |
|---|---|---|
| Solo | $149 | 1 agent, unlimited letters |
| Agency | $299 | 2–5 agents, team letter history |
| Office | $499 | 6–15 agents, shared templates, bulk generation |

**Blended average (assumed customer mix: 40% Solo / 45% Agency / 15% Office):**
(0.40 × $149) + (0.45 × $299) + (0.15 × $499) = $59.60 + $134.55 + $74.85 = **$269/month blended**

---

## Cost Structure

### Fixed Monthly Costs (Infrastructure)

| Item | Monthly Cost |
|---|---|
| Neon PostgreSQL (Launch plan) | $19 |
| Railway (backend + worker) | $20 |
| Netlify (frontend, free tier) | $0 |
| Upstash Redis (free tier to start) | $0 |
| Sentry (free tier) | $0 |
| UptimeRobot (free tier) | $0 |
| Resend (transactional email, free tier) | $0 |
| **Total fixed** | **$39/month at launch** |

Scale adjustments:
- At 100+ accounts: Neon → $69/month, Railway → $40/month, Resend → $20/month = $129/month
- At 500+ accounts: Neon → $169/month, Railway → $100/month, Upstash → $30/month = $299/month

### Variable Costs

**Claude API (letter generation):**
- ~$0.008-0.01 per letter with prompt caching
- At 20 letters/account/month: $0.20 per account per month

**Stripe payment processing:**
- 2.9% + $0.30 per transaction
- Monthly billing: (MRR × 0.029) + ($0.30 × account count)

---

## Month-by-Month Projections (18 Months)

### Assumptions
- Weeks 1–10 (~Months 1–3): 10-week development build and beta testing (0 paying customers)
- Month 3 (week 11+): Soft launch, first paying customers
- Customer growth: 5 net new customers/month in months 3-6, then 10/month months 7-12, then 15/month months 13-18
- Monthly churn: 6% months 1-6, 5% months 7-12, 4% months 13-18
- Blended ARPU: $269/month

| Month | New Customers | Churned | Total Accounts | MRR | Costs | Net Profit |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 0 | $0 | $39 | -$39 |
| 2 | 0 | 0 | 0 | $0 | $39 | -$39 |
| 3 | 8 | 0 | 8 | $2,152 | $102 | $2,050 |
| 4 | 8 | 0 | 16 | $4,304 | $165 | $4,139 |
| 5 | 8 | 1 | 23 | $6,187 | $219 | $5,968 |
| 6 | 8 | 1 | 30 | $8,070 | $273 | $7,797 |
| 7 | 12 | 2 | 40 | $10,760 | $350 | $10,410 |
| 8 | 12 | 2 | 50 | $13,450 | $427 | $13,023 |
| 9 | 12 | 3 | 59 | $15,871 | $497 | $15,374 |
| 10 | 12 | 3 | 68 | $18,292 | $567 | $17,725 |
| 11 | 12 | 3 | 77 | $20,713 | $636 | $20,077 |
| 12 | 12 | 4 | 85 | $22,865 | $699 | $22,166 |
| 13 | 15 | 3 | 97 | $26,093 | $787 | $25,306 |
| 14 | 15 | 4 | 108 | $29,052 | $867 | $28,185 |
| 15 | 15 | 4 | 119 | $32,011 | $947 | $31,064 |
| 16 | 15 | 5 | 129 | $34,701 | $1,019 | $33,682 |
| 17 | 15 | 5 | 139 | $37,391 | $1,091 | $36,300 |
| 18 | 15 | 6 | 148 | $39,812 | $1,156 | $38,656 |

**Key milestones:**
- **Break-even:** Month 3 (first paying customers immediately cover costs)
- **$100K ARR:** Month 5 (~$6,187 MRR × 12 = $74K — actually hits $100K ARR in Month 7)
- **$200K ARR:** Month 10 ($18,292 MRR × 12 = $219K ARR)
- **$275K ARR target:** Month 12 ($22,865 MRR × 12 = $274K)
- **$500K ARR:** Month 16
- **$1M ARR:** ~Month 26 (continuing trajectory)

---

## Year 1 Summary

| Metric | Value |
|---|---|
| Total revenue (months 3-12) | $122,464 |
| Total costs (months 1-12) | $3,976 |
| **Net profit Year 1** | **$118,488** |
| Paying accounts at end of Year 1 | 85 |
| ARR at end of Year 1 | $274,380 |

**Note:** This model assumes zero paid marketing spend. All growth is organic through community, referrals, and founder-led outreach. This is conservative on growth and very profitable. If paid channels are introduced, growth accelerates but costs rise.

---

## Break-Even Analysis

Monthly break-even (when revenue covers all costs):
- Fixed costs at launch: $39/month
- Variable cost per account: ~$0.20 (Claude) + ~$8 (Stripe fees on $269) = $8.20
- Break-even accounts: $39 / ($269 - $8.20) = 0.15 accounts

**Beacon is profitable from the first paying customer.** The infrastructure cost is so low relative to subscription revenue that there is no scale at which Beacon loses money on a per-account basis.

---

## Unit Economics

| Metric | Calculation | Value |
|---|---|---|
| ARPU (blended) | Avg monthly revenue per account | $269 |
| Gross margin per account | ($269 - $8.20) / $269 | 96.9% |
| Monthly churn (target) | Accounts canceled / total accounts | 5% |
| LTV | ARPU × gross margin / monthly churn | $269 × 0.969 / 0.05 = **$5,213** |
| CAC (community-led, estimated) | Time invested in outreach / customers acquired | ~$50-100 |
| LTV:CAC ratio | LTV / CAC | **52:1 to 104:1** |
| CAC payback period | CAC / (ARPU × gross margin) | <1 month |

These are exceptional unit economics. LTV:CAC of 50:1+ is among the best possible for any SaaS business. This is achievable because the GTM is community-led (very low CAC) and the gross margin is extremely high.

---

## Claude API Cost at Scale

| Accounts | Letters/Month | Claude Cost/Month | % of Revenue |
|---|---|---|---|
| 85 | 1,700 | $17 | 0.07% |
| 300 | 6,000 | $60 | 0.07% |
| 1,000 | 20,000 | $200 | 0.07% |
| 5,000 | 100,000 | $1,000 | 0.07% |

Claude API cost is essentially irrelevant at any foreseeable scale. Prompt caching keeps this flat.

---

## Scenario Analysis

### Conservative Scenario (5 net new accounts/month throughout)
- Month 12: 50 accounts, $13,450 MRR, $161K ARR
- Month 18: 80 accounts, $21,520 MRR, $258K ARR

### Base Scenario (as modeled above)
- Month 12: 85 accounts, $22,865 MRR, $274K ARR
- Month 18: 148 accounts, $39,812 MRR, $478K ARR

### Optimistic Scenario (one agency network partnership, 20+ net new/month from month 6)
- Month 12: 150 accounts, $40,350 MRR, $484K ARR
- Month 18: 300 accounts, $80,700 MRR, $968K ARR

---

## Funding Note

Beacon is designed to be 100% bootstrapped to profitability. No outside capital is required or planned. Revenue from the first paying customer covers all costs, and the business is profitable from month 3.

If an agency network partnership or significant press coverage drives faster growth than the model projects, the business may choose to raise a small amount ($500K-1M) to accelerate sales and marketing. This is optional, not required.

The exit (acquisition by Applied Systems, Vertafore, Zywave, or AgentSync) becomes a serious conversation at $5M+ ARR, which the base scenario projects for Year 4-5.
