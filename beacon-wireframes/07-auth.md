# Wireframe 07 — Auth Screens

Routes: `/signup`, `/login`, `/verify-email`, `/verify-email/confirmed`, `/verify-email/error`, `/forgot-password`, `/reset-password`, `/invite/[token]`, `/404`, `/500`, `/maintenance`

All auth screens share a centered card layout (no sidebar nav).

---

## Auth Shell (all auth pages)

```
┌──────────────────────────────────────────────────────────┐
│  [Beacon logo — centered, top]                           │
│                                                          │
│  CARD (max-width 400px, centered, white, shadow):        │
│    [Page-specific content]                               │
│                                                          │
│  FOOTER (below card, small grey text):                   │
│    © 2026 Beacon · Privacy Policy · Terms of Service    │
└──────────────────────────────────────────────────────────┘
```

---

## Screen: Sign Up (`/signup`)

```
CARD:
  HEADING: "Create your account"
  SUBTEXT: "Free trial — 10 letters, no credit card required."

  ─────────────────────────────────────
  Email *         [______________________]
  Password *      [______________________] [👁 show/hide]
    Helper: "At least 8 characters"
  ─────────────────────────────────────

  [☐] I agree to the Terms of Service and Privacy Policy *
     (links open in new tab)

  [Create Account] (primary, full width)

  ─────────────────────────────────────
  Already have an account? [Log In]
```

**Validation (on submit):**
- Email: required, valid format
- Password: required, min 8 characters
- Checkbox: required — if unchecked, inline error "You must agree to continue"

**Inline errors:** Below each field, red text. Field border turns red.

**On success:** Redirect to `/verify-email` (not logged in yet).

**Duplicate email:** Inline error on email field: "An account with this email already exists. [Log in instead?]"

---

## Screen: Log In (`/login`)

```
CARD:
  HEADING: "Welcome back"

  ─────────────────────────────────────
  Email *         [______________________]
  Password *      [______________________] [👁 show/hide]
  ─────────────────────────────────────

  [Forgot password?] (text link, right-aligned above password field)

  [☐] Remember me for 7 days

  [Log In] (primary, full width)

  ─────────────────────────────────────
  Don't have an account? [Start free]
```

**Remember Me behavior:**
- Unchecked (default): session expires after 24 hours of inactivity
- Checked: session persists for 7 days regardless of inactivity
- The DOD specifies "Session persists for 7 days (remember me) or expires after 24 hours of inactivity" — this checkbox is the mechanism that controls which applies
- Checkbox state is not persisted across visits (always unchecked on fresh load)

**Invalid credentials error:** Inline banner below form fields:
"Incorrect email or password." (do not specify which is wrong — security)

**Account not verified:** Inline banner:
"Please verify your email before logging in. [Resend verification email]"

**On success:** Redirect to `/dashboard` (or `/onboarding/agency` if onboarding incomplete).

---

## Screen: Email Verification Pending (`/verify-email`)

```
CARD:
  [Envelope illustration]

  HEADING: "Check your inbox"
  SUBTEXT: "We sent a verification link to [email@example.com]."

  ─────────────────────────────────────
  "Didn't get it? Check your spam folder, or:"
  [Resend Verification Email] (secondary button)

  ─────────────────────────────────────
  [Use a different email] (text link → /signup)
```

**Resend:** Button → "Sent! Check your inbox." + disabled for 60 seconds (shows countdown "Resend in 58s...")

---

## Screen: Email Verification Success (`/verify-email/confirmed`)

Reached via clicking link in email. Brief success state, then auto-redirect.

```
CARD:
  [Checkmark animation]

  HEADING: "Email verified!"
  SUBTEXT: "Let's set up your account."

  [Continue to Setup →] (primary button → /onboarding/agency)
  (auto-redirects after 3 seconds if no click)
```

---

## Screen: Email Verification Error (`/verify-email/error`)

Shown when verification link is expired, invalid, or already used.

```
CARD:
  [X icon]

  HEADING: "That link didn't work"

  REASONS (shown based on error type):
  - Expired: "This verification link has expired. Links are valid for 24 hours."
  - Already used: "This link has already been used. Your email may already be verified."
  - Invalid: "This link isn't valid."

  [Request a New Link] (primary → triggers resend, shows /verify-email)
  [Back to Log In] (text link)
```

---

## Screen: Forgot Password (`/forgot-password`)

```
CARD:
  [← Back to Log In] (text link, top of card)

  HEADING: "Reset your password"
  SUBTEXT: "Enter your email and we'll send a reset link."

  ─────────────────────────────────────
  Email *         [______________________]
  ─────────────────────────────────────

  [Send Reset Link] (primary, full width)
```

**On submit (any email — success or not):**
Show the same message regardless of whether email exists (prevents email enumeration):
```
"If an account exists for that email, a reset link is on its way.
 Check your spam folder if you don't see it."
```
Button replaced with this message; no retry until 60s cooldown.

---

## Screen: Reset Password (`/reset-password?token=[token]`)

```
CARD:
  HEADING: "Set a new password"

  ─────────────────────────────────────
  New Password *      [______________________] [👁]
    Helper: "At least 8 characters"
  Confirm Password *  [______________________] [👁]
  ─────────────────────────────────────

  [Set New Password] (primary, full width)
```

**Validation:**
- Password: required, min 8 chars
- Confirm: must match password — error: "Passwords don't match"

**On success:** Redirect to `/login` with banner: "Password updated. Log in with your new password."

**Expired token state (detected on page load):**
```
CARD:
  [X icon]
  HEADING: "This link has expired"
  SUBTEXT: "Password reset links expire after 1 hour."
  [Request a New Link] (primary → /forgot-password)
```

---

## Screen: Invitation Accept (`/invite/[token]`)

### State A — New user (no Beacon account)

```
CARD:
  HEADING: "You're invited to join [Agency Name]"
  SUBTEXT: "Create your account to accept the invitation."

  ─────────────────────────────────────
  Email *    [pre-filled, read-only, grey bg]
             "invitation is tied to this email"
  Password * [______________________] [👁]
             Helper: "At least 8 characters"
  ─────────────────────────────────────

  [Create Account & Join [Agency Name]] (primary)
```

On success: email is considered verified automatically — the invitation link is proof of email intent, so the normal verification step is skipped entirely. Onboarding begins immediately at Step 1. Agency Info is pre-filled from the inviting agency; agency-level fields cannot be changed by the invited agent.

### State B — Existing user (already has Beacon account, logged in)

```
CARD:
  HEADING: "Join [Agency Name]"
  SUBTEXT: "You're signed in as [email]. Click below to join."

  [Join [Agency Name]] (primary)
```

### State C — Expired invitation

```
CARD:
  HEADING: "This invitation has expired"
  SUBTEXT: "Ask your agency owner to send a new invitation."
```

---

## Screen: 404 (`/404`)

```
NO APP SHELL (or minimal shell if logged in)

CENTERED:
  "404"  (large, grey)
  HEADING: "Page not found"
  SUBTEXT: "The page you're looking for doesn't exist or was moved."
  [Go to Dashboard] (primary — if authenticated)
  [Go to Home] (primary — if unauthenticated → /)
```

---

## Screen: 500 (`/500`)

```
CENTERED:
  "500"  (large, grey)
  HEADING: "Something went wrong"
  SUBTEXT: "We're having trouble loading this page. Our team has been notified."
  [Try Again] (primary — reloads page)
  [Go to Dashboard] (secondary)
```

---

## Screen: Maintenance (`/maintenance`)

Shown when deployment/planned downtime is active.

```
BEACON LOGO (no nav)

CENTERED:
  [Wrench illustration]
  HEADING: "Beacon is down for maintenance"
  SUBTEXT: "We're making improvements. We'll be back shortly."
  "Estimated completion: [time if known, otherwise 'soon']"
```
