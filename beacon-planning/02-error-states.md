# Beacon — Error States & Empty States

Every screen and every failure mode is documented here. The rule: no user should ever see a blank screen, a raw error message, or a dead end. Every state has a message, a next action, and a reason why.

---

## Design Principles for All Error and Empty States

1. **Never show a raw error.** "500 Internal Server Error" or "TypeError: undefined is not a function" never reaches the user. Always translate to plain English.
2. **Always give one clear next action.** Every error message ends with a button, link, or instruction. No dead ends.
3. **Tone is calm and human.** Not apologetic, not alarming. The agent is a professional — treat them as one.
4. **Distinguish between user error and system error.** User errors explain what they did and how to fix it. System errors take responsibility and give a timeline.
5. **Never blame the user for system failures.** If Claude is down, say so. Don't say "something went wrong on your end."
6. **Log everything.** Even if we show a friendly message, every error is logged to Sentry with full context.

---

## Screen 1: Renewal Calendar

### Empty State — No Clients Imported Yet

**When it appears:** Agent has completed onboarding but has zero clients in the system.

**Visual:** Large centered illustration (calendar with a small clock icon). Muted colors, not alarming.

**Heading:** "Your calendar is empty — let's fix that"

**Body:**
> Your renewal calendar fills up when you add clients. Import your book of business from a CSV file, or add clients one at a time.
> 
> Most agents import their first clients in under 3 minutes.

**Primary CTA button:** "Import Clients from CSV"
**Secondary link:** "Add a Client Manually"

**Note:** Do not show any calendar grid in this state. Show only the illustration + text + CTAs.

---

### Empty State — No Clients Match Current Filter

**When it appears:** Agent has applied a date range filter or producer filter (Agency/Office) that returns zero results.

**Heading:** "No clients match this filter"

**Body:**
> Try widening your date range or clearing the filter to see all clients.

**CTA button:** "Clear Filter"

---

### Loading State — Calendar Fetching

**When it appears:** Calendar data is in flight (first load or refresh).

**Visual:** Skeleton placeholders in the calendar grid — grey rounded rectangles where client cards will appear. Animate with a soft shimmer (CSS).

**No spinner overlay.** Skeleton cards only. Calendar header/navigation visible immediately with real data so the agent can orient themselves.

**If load exceeds 5 seconds:** Show a subtle toast at the bottom: "Taking longer than usual... still loading."

**If load exceeds 15 seconds:** Show inline message: "This is taking a while. Try refreshing the page." with a "Refresh" button.

---

### Error State — Calendar Fails to Load

**When it appears:** Network error, server 5xx, or database timeout when fetching calendar data.

**Heading:** "Couldn't load your calendar"

**Body:**
> We hit a problem loading your client data. This is on us, not you.

**CTA button:** "Try Again" (retries the fetch)
**Secondary link:** "Refresh the page"

**Do not show:** Any partial calendar. Either the full calendar loads or this message shows.

---

## Screen 2: Letter Generator

### Empty State — Generator Open but No Client Selected

**When it appears:** Agent navigates to letter generator without selecting a client first.

**Heading:** "Choose a client to get started"

**Body:**
> Select a client from your renewal calendar or client list. Their details will pre-fill the letter automatically.

**CTA button:** "Go to Renewal Calendar"
**Secondary link:** "Go to Client List"

---

### Empty State — Letter Not Yet Generated

**When it appears:** Agent has selected a client and scenario but has not clicked Generate yet.

**Visual:** Tiptap editor area shows a light grey placeholder. No letter content.

**Placeholder text inside editor (non-editable, styled as hint):**
> Your letter will appear here after you click Generate. It usually takes 5–15 seconds.

**Generate button is prominent.** Subject line field is empty and editable.

---

### Generating State — Streaming in Progress

**When it appears:** Agent has clicked Generate, Claude is streaming.

**Behavior:**
- Generate button changes to "Generating..." and is disabled
- Tiptap editor is read-only during streaming
- Text appears word by word inside the editor (real streaming, not a fake animation)
- A subtle "Writing your letter..." label appears above the editor
- Subject line auto-fills when the letter is complete

**If first token does not appear within 5 seconds:**
- Show below the editor: "Still working... this can take up to 15 seconds."
- No cancellation in MVP. Add later.

---

### Error State — Generation Timeout (>20 seconds, no completion)

**When it appears:** Claude API request has been in flight for 20+ seconds without completing.

**Heading:** "Letter generation timed out"

**Body:**
> This took longer than expected. The draft below may be incomplete — review it carefully before sending.

**If partial content exists:** Show it in the editor. The agent can manually complete or regenerate.

**If no content at all:** Show the empty editor with the message.

**CTA button:** "Try Again" (triggers a fresh generation)
**Secondary button:** "Write Manually" (dismisses the error, enables editing in the empty editor)

**Sentry log:** Includes account ID, scenario, client ID, elapsed time, whether partial content was received.

---

### Error State — Claude API Down (5xx from Anthropic)

**When it appears:** Anthropic API returns a 5xx error or connection failure.

**Heading:** "Letter generation is temporarily unavailable"

**Body:**
> Our AI writing service is experiencing an issue. We're monitoring it automatically and it typically resolves within a few minutes.
> 
> In the meantime, you can write the letter manually or try again in a few minutes.

**CTA button:** "Try Again in 5 Minutes" (disabled for 5 minutes, then re-enables)
**Secondary button:** "Write Manually"

**Retry behavior:** BullMQ job queued automatically. If Claude comes back up within 30 minutes, agent gets a notification: "Your letter is ready — we finished generating it while you were away." (MVP: in-app toast; not push notification)

---

### Error State — Rate Limit Hit (100 letters/hour per workspace)

**When it appears:** Workspace has exceeded the API rate limit for letter generation.

**Heading:** "You've reached the hourly generation limit"

**Body:**
> Beacon allows up to 100 letter generations per hour per account. This limit resets at [TIME] (in X minutes).
> 
> If you need this limit raised, contact us at support@get-monolith.com.

**CTA:** No button. Show a countdown timer to reset. Auto-re-enable Generate when timer hits 0.

---

### Error State — Free Trial Exhausted (0 letters remaining)

**When it appears:** Free trial account has used all 10 letter generations.

**Heading:** "You've used all your free letters"

**Body:**
> You've generated 10 letters during your free trial. To keep writing letters for your clients, upgrade to a paid plan.

**CTA button:** "Upgrade Now" (opens Stripe checkout)
**Secondary link:** "See what's included"

**Counter throughout app:** "X free letters remaining" shown in nav bar. At 3 remaining: "3 free letters left — upgrade anytime." At 1 remaining: highlighted in amber. At 0: shown in red, generator disabled.

---

### Error State — Letter Generation Fails (Unknown Error)

**When it appears:** Any unhandled error during generation that doesn't fit the above categories.

**Heading:** "Something went wrong"

**Body:**
> We hit an unexpected error while generating your letter. Our team has been notified automatically.
> 
> Try generating again — this is usually a one-time glitch.

**CTA button:** "Try Again"
**Secondary button:** "Write Manually"

---

### Error State — No Signature Fields Completed

**When it appears:** Agent tries to generate a letter before completing agency setup (name, agency name, phone, email).

**Inline validation below the Generate button:**
> Your letter signature is incomplete. Add your name, agency name, phone, and email in [Settings → Agency Profile] before generating.

**Link:** "Go to Agency Profile"

**Generate button:** Disabled until signature fields are complete.

---

### Error State — Letter Auto-Save Failure

**When it appears:** The agent has edited a letter in the Tiptap editor but the automatic save failed (network interruption, session timeout, or server error).

**Behavior:** The "Saved" status indicator above the editor changes to an amber warning. Does not show a blocking modal — the agent can still read and copy their work.

**Persistent amber banner above editor:**
> Changes not saved — check your connection or copy your letter to clipboard before refreshing.

**CTAs:** "Try Saving Now" (retries the save immediately) | "Copy to Clipboard" (preserves the content before any page action)

**If save fails 3 consecutive times:**
> We're having trouble saving your edits. Copy your letter to clipboard now before refreshing the page.

**Sentry log:** Save failure count, elapsed time since last successful save, whether the session token is still valid.

---

## Screen 3: CSV Import

### Empty State — No Import History

**When it appears:** Agent has never imported a CSV.

**Heading:** "Import your client list"

**Body:**
> Upload a CSV file with your clients' renewal dates, policy types, and contact info. Beacon will add them to your renewal calendar automatically.
> 
> Required columns: first name, last name, one of (email or phone), policy type, renewal date.

**CTA button:** "Choose CSV File" (triggers file picker)
**Secondary link:** "Download a sample CSV template"

---

### Validation State — File Selected, Mapping Shown

**When it appears:** Agent has selected a valid .csv file. Beacon has parsed the headers.

**Visual:** Column mapping UI. Each column in the CSV is shown as a row with a dropdown to map it to a Beacon field. Required fields are clearly marked.

**Unmapped required field indicator:** Red badge "Required — not mapped"

**If Beacon auto-detects a column match:** Pre-fills the mapping (e.g., "First Name" → first_name). Show a green "Auto-matched" tag.

**CTA button:** "Import [N] Clients" (disabled until all required fields are mapped)

---

### Error State — Wrong File Type

**When it appears:** User uploads a file that is not .csv (e.g., .xlsx, .pdf, .txt).

**Inline error (below file picker):**
> This file isn't a CSV. Please export your client list as a .csv file and try again.
> 
> Most AMS systems (EZLynx, Applied Epic, HawkSoft) can export as CSV.

**CTA button:** "Choose a Different File"

---

### Error State — File Corrupted / Unreadable

**When it appears:** File is .csv extension but cannot be parsed (binary corruption, encoding issue, empty file).

**Inline error:**
> We couldn't read this file. It may be corrupted or saved in an unsupported format. Try re-exporting it from your AMS and upload again.

**CTA button:** "Choose a Different File"

---

### Error State — CSV Has No Rows

**When it appears:** CSV parses successfully but contains zero data rows (only a header row).

**Inline error:**
> This CSV has no clients. Make sure your file includes at least one data row below the header.

---

### Error State — CSV Exceeds 1,000 Row Limit

**When it appears:** CSV has more than 1,000 client rows.

**Inline error:**
> This file has [N] clients. Beacon's import limit is 1,000 clients per import. Please split your file into smaller batches and import each one separately.

---

### Partial Import Result — Some Rows Failed

**When it appears:** Import completes but some rows had validation errors.

**Success banner (green):**
> [N] clients imported successfully.

**Warning section (amber):**
> [M] rows had errors and were skipped. Download the error report to see which rows and why.

**CTA button:** "Download Error Report" (.csv file showing failed rows + reason per row)
**Secondary:** "View imported clients"

**Error reasons shown in the report:**
- "Missing required field: renewal_date"
- "Invalid date format in renewal_date — expected MM/DD/YYYY"
- "No email or phone number provided"
- "Duplicate client: [name] already exists in your account"

---

### Full Import Failure — Zero Rows Imported

**When it appears:** Import attempted but every row failed (usually a structural issue with the file).

**Heading:** "Import failed — no clients added"

**Body:**
> Every row in your file had an error. This usually means the columns aren't mapped correctly, or the required fields are missing data.

**CTA button:** "Download Error Report"
**Secondary:** "Start Over"

---

### Loading State — Import In Progress

**When it appears:** Import job is running (can take up to 30 seconds for 500 clients).

**Visual:** Progress bar with percentage. "Importing [N] clients..."

**If over 30 seconds:** "This is taking a bit longer than usual... almost done."

**Do not show a spinning loader with no progress indication.** Always show progress.

---

## Screen 3.5: Client Management (Edit / Delete)

### Error State — Client Record Save Failure

**When it appears:** Agent edits a client record and clicks Save, but the database write fails (network error or server timeout).

**Inline error below the form (red):**
> Changes couldn't be saved. Check your connection and try again.

**CTA button:** "Try Again"
**Secondary link:** "Discard Changes" (reverts to the last saved state)

**The form stays open with the agent's edits still populated — do not clear the form on error.**

---

### State — Client Delete Confirmation Dialog

**When it appears:** Agent clicks the delete button on any client record.

**This is a blocking modal — no action is taken until explicit confirmation.**

**Heading:** "Delete [Client First Name] [Client Last Name]?"

**Body:**
> This will permanently remove this client from your client list and renewal calendar. Their E&O log entries are not affected — those records are retained regardless.
>
> This cannot be undone.

**Primary CTA (red, destructive):** "Yes, Delete Client"
**Secondary button:** "Cancel"

**Behavior:** Client is soft-deleted in the DB (marked inactive). Hard delete runs on a 30-day scheduled job. E&O log entries linked to this client are never deleted.

---

### Error State — Client Search Returns No Results

**When it appears:** Agent searches by name or email in the client list and no matches are found.

**Inline below the search bar:**
> No clients match "[search term]" — check the spelling or try a shorter search.

**CTA link:** "Clear Search"

---

### Error State — Client List Fails to Load

**When it appears:** Server or network error when fetching the client list.

**Heading:** "Couldn't load your clients"

**Body:**
> We hit a problem fetching your client list. Try refreshing the page.

**CTA button:** "Refresh Page"

---

## Screen 4: Email Send

### Error State — No Email Connected

**When it appears:** Agent tries to send a letter but has not connected Gmail or Outlook.

**Send button is disabled.** Tooltip on hover: "Connect an email account to send letters."

**Below the disabled button:**
> Connect your Gmail or Outlook to send letters directly from your email address. [Connect Email →]

---

### Error State — No Email Address on Client Record

**When it appears:** Agent tries to send a letter to a client who has no email address.

**Send button is disabled.** Below the button:
> This client has no email address on file. [Edit Client →] to add one, or use Download as PDF instead.

**CTA:** "Edit Client" | "Download as PDF"

---

### Error State — OAuth Token Expired / Revoked

**When it appears:** Agent clicks Send but the stored OAuth token has expired or been revoked by Google/Microsoft.

**Toast notification (red):**
> Your [Gmail / Outlook] connection has expired. Reconnect your email to continue sending.

**CTA button in toast:** "Reconnect Email" (opens OAuth flow)

**After reconnection:** Automatically retry the send.

---

### Error State — Send API Failure (Gmail or Microsoft API 5xx)

**When it appears:** OAuth token is valid but Google/Microsoft API returns an error.

**Toast notification (red):**
> Your letter couldn't be sent due to a [Gmail / Outlook] error. Try again in a moment.

**CTA button:** "Try Again"

**The letter is NOT logged as "sent" in the E&O log. It remains in "draft" status.**

---

### Error State — Send Rate Limit (>50 sends per hour)

**When it appears:** Agent's connected email account has attempted to send more than 50 letters in one hour.

**Toast notification (amber):**
> You've sent 50 letters in the last hour. To protect your email's deliverability, we've paused sending for [X] minutes. You can still download as PDF or copy to clipboard.

**Send button disabled for remainder of the hour.**

---

### Success State — Letter Sent

**When it appears:** Letter sends successfully.

**Toast notification (green, bottom of screen, auto-dismisses after 5 seconds):**
> Letter sent to [Client First Name] at [email@domain.com]. ✓ Logged to your E&O record.

**The letter generator panel resets to "ready" state after 3 seconds.**

---

### Error State — PDF Download Fails

**When it appears:** PDF generation fails on the server side.

**Toast notification (red):**
> PDF download failed. Try again — if the issue continues, use Copy to Clipboard instead.

**Copy to Clipboard is always available as a fallback.**

---

## Screen 4.5: Template Management

### Empty State — No Templates Saved

**When it appears:** Agent opens the templates section for the first time with no saved templates.

**Heading:** "No templates saved yet"

**Body:**
> When you edit a letter and save it as a template, it appears here and is available as a starting point for future letters of the same scenario.
>
> To save a template: generate a letter → edit it → click "Save as Template."

**CTA button:** "Generate a Letter"

---

### Error State — Template Save Failure

**When it appears:** Agent clicks "Save as Template" and the server write fails.

**Toast notification (red):**
> Template couldn't be saved. Try again.

**CTA button in toast:** "Try Again"

**The letter editor stays open** — the agent does not lose their letter content on a save failure.

---

### Error State — Template List Fails to Load

**When it appears:** The templates section fails to load (server or network error).

**Heading:** "Couldn't load your templates"

**Body:**
> We hit a problem loading your saved templates. Try refreshing the page.

**CTA button:** "Refresh Page"

---

### State — Template Delete Confirmation

**When it appears:** Agent clicks delete on a saved template.

**Blocking confirmation modal — no action taken until confirmed.**

**Heading:** "Delete this template?"

**Body:**
> This permanently removes this template. Past letters generated from it are not affected.

**Primary CTA (red):** "Delete Template"
**Secondary button:** "Cancel"

---

## Screen 5: E&O Documentation Log

### Empty State — No Letters Generated Yet

**When it appears:** Brand new account, no letters generated.

**Heading:** "Your E&O log is empty"

**Body:**
> Every letter you generate in Beacon is automatically logged here with a timestamp, the client's name, and the final letter content — creating a tamper-proof record for your E&O documentation.
> 
> Generate your first letter to see it appear here.

**CTA button:** "Generate a Letter"

---

### Empty State — No Results Match Search

**When it appears:** Agent searches by client name, date range, or scenario type and gets zero results.

**Heading:** "No records match your search"

**Body:**
> Try different search terms or a wider date range.

**CTA link:** "Clear Search"

---

### Error State — Log Export (PDF) Fails

**When it appears:** Agent requests a PDF export but it fails to generate.

**Toast notification (red):**
> PDF export failed. Try again. If this keeps happening, contact support@get-monolith.com.

---

### Loading State — Log Fetching

**Visual:** Skeleton rows (grey placeholders) in the table where log entries will appear.

**If over 10 seconds:** "Taking longer than usual... still loading."

---

## Screen 6: Authentication

### Error State — Invalid Email / Password at Login

**Inline error below the form (red):**
> The email or password you entered is incorrect. Check your details and try again.

**Do NOT say** "Email not found" or "Password incorrect" separately — this reveals which is wrong.

**After 5 failed attempts:**
> Too many failed attempts. Please wait 15 minutes before trying again, or [reset your password].

---

### Error State — Unverified Email

**When it appears:** Agent tries to log in with an account that has not verified their email.

**Inline message (amber):**
> You need to verify your email before logging in. Check your inbox for a verification email from Beacon.

**CTA button:** "Resend Verification Email"

---

### Error State — Email Already Registered (Signup)

**Inline error below email field:**
> An account with this email already exists. [Log in instead] or [reset your password].

---

### Error State — Password Reset Link Expired or Invalid

**When it appears:** Agent clicks a password reset link that has expired (>1 hour) or has already been used.

**Full-page message (not a crash):**

**Heading:** "This link has expired"

**Body:**
> Password reset links expire after 1 hour and can only be used once. Request a new one below.

**CTA button:** "Request a New Reset Link"

---

### Error State — Session Expired

**When it appears:** Agent's session cookie has expired (24 hours of inactivity or 7-day remember-me window exceeded).

**Behavior:** Redirect to login page with a URL parameter `?reason=session_expired`

**At top of login page (amber banner):**
> Your session expired. Log in to continue.

**Do not show this banner on any other login visit (only when `?reason=session_expired` is present in URL).**

---

## Screen 7: Billing & Subscription

### Error State — Stripe Checkout Failure

**When it appears:** Agent is redirected back from Stripe checkout with a failure status (card declined, etc.).

**Banner at top of billing page (red):**
> Your payment wasn't processed. Please check your card details and try again.

**CTA button:** "Try Again" (re-opens Stripe checkout)

---

### Error State — Payment Method Failed (Recurring)

**When it appears:** Stripe webhook fires `invoice.payment_failed`.

**In-app banner (red, shown on every page until resolved):**
> Your last payment failed. Update your payment method to keep your Beacon account active. You have a 3-day grace period — access is available until [DATE].

**CTA button:** "Update Payment Method" (opens Stripe Customer Portal)

**Simultaneously:** Send transactional email (via Resend) to the agent's registered email address with the same message and link.

---

### State — Grace Period Active

**When it appears:** Payment failed, 3-day grace period is counting down.

**In-app banner (amber):**
> Your account is in a grace period. Update your payment method by [DATE + TIME] to avoid losing access.

**CTA button:** "Update Payment Method"

---

### State — Account Downgraded (Grace Period Ended)

**When it appears:** Grace period elapsed, account downgraded to free tier.

**Full-screen modal (cannot be dismissed):**

**Heading:** "Your subscription has ended"

**Body:**
> Your Beacon account has been downgraded to the free tier. You can still access your E&O log and client list, but letter generation is limited to 10 total.
> 
> Upgrade to restore unlimited access.

**CTA button:** "Upgrade Now"
**Secondary link:** "Contact Support"

**Agent retains read access to all historical data. Generate button is disabled with the trial exhausted message.**

---

### State — Cancellation Confirmed

**When it appears:** Agent cancels their subscription via Stripe Customer Portal. Webhook fires.

**Toast notification (green):**
> Your subscription has been cancelled. You'll keep full access until [END DATE].

**Billing page shows:**
> Subscription: Cancelled — Active until [END DATE]

**No other changes to the product UI until the billing period ends.**

---

## Screen 8: Onboarding / Agency Setup

### Error State — Logo Upload Fails

**When it appears:** Image upload to storage fails.

**Inline error below upload area:**
> Logo upload failed. Try again with a different image. Accepted formats: PNG, JPG, SVG. Maximum size: 2MB.

---

### Error State — Logo File Too Large

**Inline error before upload is attempted:**
> This image is too large. Maximum file size is 2MB. Please reduce the image size and try again.

---

### Error State — Unsupported Logo Format

**Inline error:**
> This file type isn't supported. Please upload a PNG, JPG, or SVG.

---

## Screen 9: Multi-Agent Invitation (Agency / Office Tiers)

### Error State — Invite Email Already Has an Account

**Inline error:**
> [email@domain.com] already has a Beacon account. They can't be invited — they would need to be associated directly. Contact support if you need help.

---

### Error State — Invite Limit Reached (Tier Limit)

**Inline error:**
> You've reached the agent limit for your [Agency / Office] plan. Upgrade to add more agents, or remove an existing agent first.

---

### Error State — Invitation Link Expired

**When it appears:** Invited agent clicks an invitation link that is older than 7 days.

**Full-page message:**

**Heading:** "This invitation has expired"

**Body:**
> Invitation links expire after 7 days. Ask your agency owner to send a new invitation.

---

## Screen 9.5: Approval Queue (Office Tier Only)

### State — Letter Pending Admin Review (Producer View)

**When it appears:** Producer generates a letter, the agency has approval queue enabled, and the letter is waiting for admin review before it can be sent.

**Letter generator panel (producer sees):**
> Your letter has been submitted for review. You'll be notified when it's approved or returned with notes.

**Generate button:** Replaced with "Submitted — Awaiting Approval" status indicator. Disabled for this letter.

---

### State — Approval Queue (Admin View)

**When it appears:** Admin opens the approval queue page. Pending letters from all producers are listed.

**Each queue item shows:**
- Client name + scenario type
- Producer name
- Generated timestamp
- Full letter preview (expandable)
- Approve button | Return for Revision button

**If queue is empty:**
> No letters are waiting for your review. You're all caught up.

---

### State — Letter Approved (Producer Notification)

**When it appears:** Admin clicks Approve on a submitted letter.

**In-app toast (producer sees on their next interaction):**
> [Admin Name] approved your letter to [Client First Name]. It's ready to send.

**Letter generator panel updates:** "Approved — Ready to Send." Send button becomes active.

---

### State — Letter Returned for Revision

**When it appears:** Admin returns a letter with revision notes.

**In-app toast (producer sees):**
> [Admin Name] returned your letter to [Client First Name] for revision. [View Notes →]

**Letter generator panel:** Shows admin's revision note in an amber box. Producer can edit the letter in the Tiptap editor and resubmit, or generate a new draft from scratch.

**Resubmit button:** Appears after the producer has made edits.

---

### Error State — Approval Queue Fails to Load

**When it appears:** Admin navigates to the approval queue page and it fails to load (server error).

**Heading:** "Approval queue unavailable"

**Body:**
> We couldn't load the approval queue. Letters your producers submitted are safe. Try refreshing.

**CTA button:** "Refresh Page"

---

## Global States

### 404 — Page Not Found

**Heading:** "This page doesn't exist"

**Body:**
> The page you were looking for isn't here. It may have been moved or the link may be broken.

**CTA button:** "Go to Dashboard"
**Secondary link:** "Go to Home"

---

### 500 — Server Error

**Heading:** "Something went wrong on our end"

**Body:**
> We hit an unexpected error. Our team has been notified automatically and we're looking into it.
> 
> This usually resolves within a few minutes.

**CTA button:** "Try Refreshing the Page"
**Secondary link:** "Go to Dashboard"

**Do not show:** Any stack trace, error ID, database info, or technical detail.

**Sentry:** Full error captured automatically including request details, user ID (anonymized), and stack trace.

---

### Network Offline State

**When it appears:** Browser detects no internet connection.

**Persistent banner (amber, top of page):**
> You appear to be offline. Some features may not work until your connection is restored.

**Behavior:** Banner appears automatically. Disappears automatically when connection is restored. No action required from user.

---

### Maintenance Mode (Planned Downtime)

**Full-screen page (replaces app entirely):**

**Heading:** "Beacon is down for maintenance"

**Body:**
> We're making improvements to Beacon. We'll be back shortly — usually within [X] minutes.
> 
> For urgent issues, email support@get-monolith.com.

**Implementation:** Railway deploy with `MAINTENANCE_MODE=true` env var triggers a middleware that redirects all routes to this page. E&O log data is never touched during maintenance.

---

## Error State Logging Checklist

Every error state in production must:
- [ ] Be logged to Sentry with event type, user ID (anonymized), and relevant context
- [ ] Show a human-readable message to the user (no raw errors)
- [ ] Offer at least one actionable next step
- [ ] Not expose any internal technical detail (stack traces, SQL errors, API keys, internal URLs)
- [ ] Be tested manually during beta testing phase

---

## Empty State Design Checklist

Every empty state must:
- [ ] Have a clear heading that states what is empty
- [ ] Explain why it is empty and what will change that
- [ ] Offer at least one primary CTA
- [ ] Never show a blank white screen with no text
- [ ] Be reviewed during beta testing to confirm the copy makes sense to a real agent
