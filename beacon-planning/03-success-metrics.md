# Beacon — Success Metrics & KPIs

## North Star Metric

**Letters sent per month** — the single number that captures whether Beacon is delivering value. If agents are sending letters, they're using the product, retaining clients, and seeing ROI. Everything else follows from this.

Secondary north star: **Monthly Recurring Revenue (MRR)**

---

## Business Metrics

| Metric | Definition | Target Month 6 | Target Month 12 |
|---|---|---|---|
| MRR | Total monthly subscription revenue | $8,000 | $22,000 |
| ARR | MRR × 12 | $96,000 | $264,000 |
| Paying accounts | Total active paying subscriptions | 35 | 85 |
| Monthly churn rate | % of paying accounts that cancel | <8% | <5% |
| MRR churn | % of MRR lost each month | <8% | <5% |
| Net Revenue Retention | MRR retained + expansion / starting MRR | >95% | >100% |
| LTV | Avg MRR per account / monthly churn rate | $2,700+ | $4,500+ |
| CAC | Total sales/marketing spend / new customers | <$200 | <$150 |
| LTV:CAC ratio | LTV divided by CAC | >10:1 | >20:1 |
| Gross margin | (MRR - COGS) / MRR | >94% | >94% |

---

## Product Metrics (Engagement)

| Metric | Definition | Target |
|---|---|---|
| Activation rate | % of signups who generate ≥1 letter within 7 days | 60%+ |
| Time to first letter | Minutes from signup to first generated letter | <5 minutes |
| Letters per active account per month | Engagement depth indicator | 15+ |
| DAU/MAU ratio | Days active / month (proxy for daily habit) | 40%+ |
| Gmail/Outlook connection rate | % of active accounts with email connected | 70%+ |
| Client import rate | % of active accounts with ≥1 client imported | 80%+ |
| Edit rate | % of letters edited before sending | 30-50% (healthy range — too low means agents aren't reviewing, too high means AI quality needs work) |
| Send rate | % of generated letters that are actually sent | 75%+ |
| Template save rate | % of users who save at least one template | 40%+ |
| E&O log export rate | % of accounts that export the log at least once | 20%+ (indicates real E&O usage) |

---

## Acquisition Metrics

| Metric | Definition | Target Month 3 | Target Month 12 |
|---|---|---|---|
| Weekly trial signups | New free accounts created | 5 | 25 |
| Trial to paid conversion | % of trial users who upgrade | 20% | 30% |
| Trial conversion time | Days from signup to first payment | <14 days | <10 days |
| Referral rate | % of new customers from another customer's referral | 20% | 35% |
| Channel breakdown | % from IIABA / LinkedIn / organic / referral | Tracked | Optimized |
| CAC by channel | Cost per acquired customer per channel | Tracked | Optimized |

---

## Retention Metrics

| Metric | Definition | Target |
|---|---|---|
| Month 1 retention | % of paying accounts still active after 30 days | 92%+ |
| Month 3 retention | % of paying accounts still active after 90 days | 85%+ |
| Month 6 retention | % of paying accounts still active after 180 days | 78%+ |
| Month 12 retention | % of paying accounts still active after 1 year | 70%+ |
| Cancellation reasons | Tracked on every cancellation | Top 3 reasons documented monthly |
| Resurrection rate | % of canceled accounts that reactivate | Track from month 6 |

---

## Operational / Quality Metrics

| Metric | Definition | Target |
|---|---|---|
| Letter generation success rate | % of generation attempts that succeed | 99.5%+ |
| Letter generation P95 latency | 95th percentile time to first token | <3 seconds |
| Letter generation P95 completion | 95th percentile time to full letter | <15 seconds |
| Email send success rate | % of send attempts that succeed | 99%+ |
| API uptime | % of time the platform is operational | 99.9%+ |
| Error rate | % of API requests that return 5xx errors | <0.1% |
| Support ticket volume | Tickets per 100 active accounts per month | <5 |
| CSV import success rate | % of imports that complete without errors | 90%+ |

---

## Financial Health Metrics

| Metric | Definition | Target Month 12 |
|---|---|---|
| Monthly profit | MRR - all costs | $21,000+ |
| Claude API cost per letter | Total Anthropic spend / letters generated | <$0.05 |
| Infrastructure cost per account | Total infra / paying accounts | <$2 |
| Stripe fees as % of MRR | Total Stripe fees / MRR | ~3% |

---

## Milestone Definitions

**Green Light to Launch (end of Phase 4):**
- All definition-of-done items checked
- 5 beta users have completed full workflow (signup → import → generate → send)
- Zero P0 bugs
- Legal pages live on site

**Traction Proof (Month 6):**
- 30+ paying accounts
- <8% monthly churn
- At least 5 unprompted referrals received
- Average 15+ letters generated per active account per month

**Product-Market Fit Signal (Month 12):**
- 80+ paying accounts
- NPS score 50+ (if measured)
- <5% monthly churn
- Referrals accounting for 30%+ of new customers
- At least 3 agencies have upgraded from Solo to Agency tier

**Acquisition-Ready (Year 3-5):**
- $5M+ ARR
- <3% monthly churn
- NPS 60+
- 3+ agency network partnerships
- SOC 2 Type II in progress or complete

---

## What to Measure From Day One

Even before paying customers, track:
- Signup date and source for every beta user
- Every letter generated (scenario, timestamp, account)
- Every edit made to a generated letter (what changed)
- Every send (success/failure)
- Time between signup and first letter
- Time between first letter and payment

This data is the foundation of every product decision in Years 1 and 2.
