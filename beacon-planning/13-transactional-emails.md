# Beacon — Transactional Email Copy

All transactional emails sent via Resend.
**Sender name:** Beacon
**From address:** hello@get-monolith.com
**Reply-to:** support@get-monolith.com

Design: plain text style. No heavy HTML templates. Clean, readable, personal. Looks like it came from a real person, not a marketing platform.

---

## 1. Email Verification

**Trigger:** Account created
**Timing:** Immediate
**Subject:** Confirm your email — Beacon

---

Hi [First Name],

One quick step before you get started — confirm your email address by clicking the button below.

[Confirm My Email Address]

This link expires in 24 hours. If you didn't create a Beacon account, ignore this email.

—
Beacon
beacon.get-monolith.com

---

## 2. Welcome Email

**Trigger:** Email verified AND onboarding (agency profile) complete
**Timing:** Immediate after onboarding completes
**Subject:** You're in — here's how to get your first letter in 5 minutes

---

Hi [First Name],

Welcome to Beacon. You have 10 free letters to use, and the fastest way to use one is right now.

Here's the shortest path to your first letter:

1. Import your clients from a CSV — or add one manually if you want to start with one client
2. Open that client from your renewal calendar
3. Pick a scenario and click Generate

The whole thing takes under 5 minutes. Your first letter will be ready before you finish your coffee.

[Go to My Renewal Calendar]

One more thing: connect your Gmail or Outlook in Settings → Email. It takes about 90 seconds and makes the whole workflow click into place — you'll send letters directly from your email address instead of copy-pasting.

If you hit anything confusing, reply to this email. Real answer, no scripts.

—
Scott
Founder, Beacon

---

## 3. Trial Milestone — 3 Letters Remaining

**Trigger:** Trial letter count goes from 4 → 3 (usage crosses the threshold)
**Timing:** Immediate
**Subject:** 3 free letters left on your Beacon trial

---

Hi [First Name],

You've used 7 of your 10 free trial letters. Three more before your trial ends.

If Beacon is working for you, upgrade now and you'll never think about it again. If you're still on the fence, use your last 3 letters on the scenarios that matter most to you — then decide.

[Upgrade to Solo — $149/month]

Questions before you upgrade? Reply to this email.

—
Beacon

---

## 4. Trial Exhausted — 0 Letters Remaining

**Trigger:** Trial letter count hits 0 (10th letter generated)
**Timing:** Immediate
**Subject:** Your Beacon trial is over — keep going?

---

Hi [First Name],

You've used all 10 of your free letters. The Generate button is currently disabled on your account.

If those 10 letters were useful — if even one of them helped you keep a client or get ahead of a rate increase conversation — Beacon is worth it.

Solo plan is $149/month. No per-agent fees. No contracts. Cancel anytime.

[Upgrade Now — Unlock Unlimited Letters]

Not ready? Reply to this email and tell me what's holding you back. I'll give you a straight answer.

—
Scott
Founder, Beacon

---

## 5. Payment Successful — New Subscription

**Trigger:** Stripe `invoice.payment_succeeded` on first payment (new subscription)
**Timing:** Immediate
**Subject:** You're subscribed — Beacon is fully unlocked

---

Hi [First Name],

Your [Solo / Agency / Office] subscription is active. Unlimited letter generation, starting now.

You'll be billed $[amount] on the [day] of each month. Manage your subscription, update your payment method, or view invoices anytime in your billing settings.

[Go to My Dashboard]

—
Beacon

---

## 6. Payment Failed

**Trigger:** Stripe `invoice.payment_failed`
**Timing:** Immediate
**Subject:** Your Beacon payment didn't go through

---

Hi [First Name],

We weren't able to process your payment of $[amount] on [date].

Your account is fully active for 3 more days — until [grace period end date]. Update your payment method before then to avoid any interruption to your access.

[Update Payment Method]

If your card was recently updated or you need help sorting this out, reply to this email.

—
Beacon

---

## 7. Grace Period Ending — 24 Hours Before Access Restriction

**Trigger:** Scheduled — 24 hours before grace period end date
**Timing:** Scheduled
**Subject:** Beacon access ends tomorrow — update your payment method

---

Hi [First Name],

Your payment is still past due and your Beacon access ends tomorrow at [time].

After that, your account moves to the free tier and letter generation is paused. Your client list, E&O log, and letter history stay safe and accessible — nothing is deleted.

[Update Payment Method]

—
Beacon

---

## 8. Account Downgraded — Grace Period Ended

**Trigger:** Grace period end date passes with no payment update
**Timing:** Immediate (day of downgrade)
**Subject:** Your Beacon account has been downgraded

---

Hi [First Name],

Your Beacon subscription has ended and your account is now on the free tier.

Your client list, E&O log, and all letter history are still there. Letter generation is limited to 10 total on the free tier.

When you're ready to reactivate, it takes about 30 seconds.

[Reactivate My Subscription]

—
Beacon

---

## 9. Subscription Cancelled

**Trigger:** Stripe `customer.subscription.deleted` (agent cancels via customer portal)
**Timing:** Immediate
**Subject:** Your Beacon subscription is cancelled

---

Hi [First Name],

Your subscription has been cancelled. You have full access to Beacon until [end of billing period date].

After that, your account moves to the free tier. Your data — client list, E&O log, templates — stays intact. If you ever reactivate, everything is right where you left it.

If you cancelled because something wasn't working, I'd genuinely like to know. Reply to this email.

—
Scott
Founder, Beacon

---

## 10. Password Reset

**Trigger:** Agent requests a password reset
**Timing:** Immediate
**Subject:** Reset your Beacon password

---

Hi,

You requested a password reset for the Beacon account associated with this email address.

[Reset My Password]

This link expires in 1 hour and can only be used once. If you didn't request this, ignore this email — your password hasn't changed.

—
Beacon

---

## 11. Team Invitation (Agency / Office Tier)

**Trigger:** Agency owner invites a producer or admin
**Timing:** Immediate
**Subject:** [Owner First Name] invited you to join [Agency Name] on Beacon

---

Hi,

[Owner First Name] has invited you to join [Agency Name] on Beacon as a [Producer / Admin].

Beacon is an AI writing tool for insurance agents — it generates personalized renewal letters, rate increase explanations, and client welcome notes in about 60 seconds each. Letters send directly from your Gmail or Outlook. Everything is logged automatically for E&O records.

[Accept Invitation]

This invitation expires in 7 days. If you weren't expecting it, ignore this email.

—
Beacon
beacon.get-monolith.com

---

## 12. Subscription Renewal Reminder (Optional — Pre-Renewal Notice)

**Trigger:** 3 days before next billing date
**Timing:** Scheduled
**Note:** Only send this if the agent's card has previously failed. Do not send to agents with healthy payment history — unsolicited billing reminders annoy good customers.
**Subject:** Your Beacon renewal is in 3 days

---

Hi [First Name],

Your [Solo / Agency / Office] subscription renews on [date] for $[amount].

If you need to update your payment method before then: [Update Payment Method]

—
Beacon

---

## 13. Account Deletion Confirmation

**Trigger:** Agent confirms account deletion (types "DELETE" in confirmation modal)
**Timing:** Immediate
**Subject:** Your Beacon account deletion has been initiated

---

Hi [First Name],

We've received your request to delete your Beacon account.

What happens next:
- Your access ends immediately
- All your data — client list, letter history, templates, settings — will be permanently deleted within 30 days
- Your E&O documentation log is retained for 7 years as required by insurance industry regulatory standards. After that period, it is permanently deleted.

If you need access to your E&O log after your account closes, contact legal@get-monolith.com. We can provide read-only access or a full PDF export upon identity verification.

If you deleted your account by mistake, reply to this email right now. We may be able to reverse it if we hear from you quickly.

—
Beacon
beacon.get-monolith.com

---

## 14. Plan Upgrade Confirmation

**Trigger:** Stripe `customer.subscription.updated` — plan tier increases (Solo → Agency, Solo → Office, or Agency → Office)
**Timing:** Immediate
**Subject:** You're now on the [Agency / Office] plan — here's what's new

---

Hi [First Name],

Your Beacon account has been upgraded to the [Agency / Office] plan. Here's what you now have access to:

**[If upgrading to Agency:]**
- Up to 5 agents — invite your team from Settings → Team
- Team-wide renewal calendar
- Shared letter history per client
- Agency-wide E&O log

**[If upgrading to Office:]**
- Up to 15 agents
- Approval queue — every producer letter requires your review before sending
- Shared template library
- Bulk letter generation

Your billing has been prorated — you'll see the adjustment on your next invoice.

[Go to My Dashboard]

Questions about your new features? Reply here.

—
Beacon

---

## 15. Plan Downgrade Confirmation

**Trigger:** Stripe `customer.subscription.updated` — plan tier decreases (Office → Agency, Office → Solo, or Agency → Solo); fires when downgrade takes effect (start of new billing cycle), not when scheduled
**Timing:** Immediate (when downgrade takes effect)
**Subject:** Your Beacon plan has changed to [Solo / Agency]

---

Hi [First Name],

Your Beacon plan changed to [Solo / Agency] at the start of this billing period.

**What changed:**
- [If downgraded to Solo:] Your account now supports 1 agent. Additional team members have been removed from your workspace. Their letter history and E&O log entries are retained.
- [If downgraded from Office to Agency:] The approval queue has been disabled. Producers can now send letters directly without admin review.

Your client list, E&O log, letter history, and templates are all still here.

[Go to My Account]

If this change wasn't intentional, contact support@get-monolith.com.

—
Beacon

---

## 16. Referral Success Notification

**Note:** This email fires when the referral program is implemented. Referral tracking is a Phase 2 feature. These email templates are ready for when the program launches.

### 16a. Referrer — Their Referral Signed Up

**Trigger:** Referred agent creates an account using the referrer's link or code
**Timing:** Immediate
**Subject:** Your Beacon referral just signed up

---

Hi [Referrer First Name],

Good news — [Referred Name] just created their Beacon account using your referral link.

[Insert referral reward details when referral program is finalized — e.g., "You'll receive a credit when they upgrade to a paid plan."]

Thanks for spreading the word.

—
Beacon

### 16b. Referred Agent — Welcome with Referral Credit

**Trigger:** Referred agent creates an account using the referrer's link or code
**Timing:** Immediate (replaces the standard Email Verification email — or fires alongside it)
**Subject:** You're in — [Referrer Name] sent you to Beacon

---

Hi [First Name],

[Referrer Name] thought you should know about Beacon — and you're in.

[Insert referral reward details — e.g., extra trial letters, first month discount] applied to your account automatically.

Your free trial is ready. Fastest path to your first letter:

1. Import your clients or add one manually
2. Pick a scenario
3. Click Generate

[Go to My Account]

—
Scott
Founder, Beacon

---

## Email Delivery Rules

| Email | Trigger Event | Timing | Recipient |
|---|---|---|---|
| Email verification | Account created | Immediate | Registered email |
| Welcome | Onboarding complete | Immediate | Registered email |
| 3 letters remaining | Trial count hits 3 | Immediate | Registered email |
| Trial exhausted | Trial count hits 0 | Immediate | Registered email |
| Payment successful | `invoice.payment_succeeded` (first) | Immediate | Registered email |
| Payment failed | `invoice.payment_failed` | Immediate | Registered email |
| Grace period ending | 24 hrs before grace end | Scheduled | Registered email |
| Account downgraded | Grace period end date | Immediate | Registered email |
| Subscription cancelled | `customer.subscription.deleted` | Immediate | Registered email |
| Password reset | Reset requested | Immediate | Email entered in form |
| Team invitation | Owner sends invite | Immediate | Invited email address |
| Renewal reminder | 3 days before billing (failed payment history only) | Scheduled | Registered email |
| Account deletion confirmation | Agent confirms deletion | Immediate | Registered email |
| Plan upgrade confirmation | Stripe subscription tier increases | Immediate | Registered email |
| Plan downgrade confirmation | Stripe subscription tier decreases (at cycle start) | Immediate | Registered email |
| Referral — referrer notified | Referred agent signs up (Phase 2) | Immediate | Referrer email |
| Referral — referred welcome | Referred agent signs up (Phase 2) | Immediate | Referred agent email |

---

## Tone and Design Rules for All Transactional Emails

- **No heavy HTML.** Clean, text-forward layout. Small Beacon wordmark at the top. One or two buttons max.
- **No marketing language in transactional emails.** The verification email does not try to sell anything. The payment failed email does not include a product update.
- **Always one clear action.** Every email has a single primary CTA. No secondary promotions buried in the footer.
- **Plain language.** If the email would make sense to someone who isn't technical, it's written correctly.
- **Reply-to is support@get-monolith.com.** Agents should be able to reply directly and get a real response.
- **No unsubscribe link on transactional emails.** These are service communications, not marketing. CAN-SPAM and GDPR both allow this for service emails. (Marketing emails — if we ever send them — require unsubscribe.)
- **Footer on all emails:** Beacon · A product of Monolith · Ogden, Utah · beacon.get-monolith.com
