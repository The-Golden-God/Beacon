import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Beacon <hello@get-monolith.com>";
const REPLY_TO = "support@get-monolith.com";
const SITE_URL = "https://beacon.get-monolith.com";

const FOOTER = `
<p style="color:#6b7280;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
  Beacon · A product of Monolith · Ogden, Utah · <a href="${SITE_URL}" style="color:#6b7280;">${SITE_URL}</a>
</p>`;

function html(body: string) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:560px;margin:0 auto;padding:32px 16px;line-height:1.6;">
<p style="font-weight:700;font-size:18px;margin-bottom:24px;">Beacon</p>
${body}
${FOOTER}
</body></html>`;
}

function btn(label: string, url: string) {
  return `<p style="margin:24px 0;"><a href="${url}" style="background:#111827;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;display:inline-block;">${label}</a></p>`;
}

// ─── Email verification ────────────────────────────────────────────────────────

export async function sendVerificationEmail(params: {
  to: string;
  firstName: string;
  url: string;
}) {
  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject: "Confirm your email — Beacon",
    html: html(`
      <p>Hi ${params.firstName},</p>
      <p>One quick step before you get started — confirm your email address by clicking the button below.</p>
      ${btn("Confirm My Email Address", params.url)}
      <p style="color:#6b7280;font-size:14px;">This link expires in 24 hours. If you didn't create a Beacon account, ignore this email.</p>
    `),
  });
}

// ─── Password reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(params: {
  to: string;
  url: string;
}) {
  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject: "Reset your Beacon password",
    html: html(`
      <p>You requested a password reset for the Beacon account associated with this email address.</p>
      ${btn("Reset My Password", params.url)}
      <p style="color:#6b7280;font-size:14px;">This link expires in 1 hour and can only be used once. If you didn't request this, ignore this email — your password hasn't changed.</p>
    `),
  });
}

// ─── Team invitation ───────────────────────────────────────────────────────────

export async function sendTeamInviteEmail(params: {
  to: string;
  inviterFirstName: string;
  agencyName: string;
  role: string;
  token: string;
}) {
  const acceptUrl = `${process.env.FRONTEND_URL}/invite/${params.token}`;
  const roleLabel = params.role === "admin" ? "Admin" : "Producer";

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject: `${params.inviterFirstName} invited you to join ${params.agencyName} on Beacon`,
    html: html(`
      <p>${params.inviterFirstName} has invited you to join <strong>${params.agencyName}</strong> on Beacon as a ${roleLabel}.</p>
      <p>Beacon is an AI writing tool for insurance agents — it generates personalized renewal letters, rate increase explanations, and client welcome notes in about 60 seconds each. Letters send directly from your Gmail or Outlook. Everything is logged automatically for E&amp;O records.</p>
      ${btn("Accept Invitation", acceptUrl)}
      <p style="color:#6b7280;font-size:14px;">This invitation expires in 7 days. If you weren't expecting it, ignore this email.</p>
    `),
  });
}

// ─── Welcome email (post-onboarding) ──────────────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string;
  firstName: string;
}) {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject: "You're in — here's how to get your first letter in 5 minutes",
    html: html(`
      <p>Hi ${params.firstName},</p>
      <p>Welcome to Beacon. You have 10 free letters to use, and the fastest way to use one is right now.</p>
      <p>Here's the shortest path to your first letter:</p>
      <ol style="padding-left:20px;">
        <li>Import your clients from a CSV — or add one manually</li>
        <li>Open that client from your renewal calendar</li>
        <li>Pick a scenario and click Generate</li>
      </ol>
      <p>The whole thing takes under 5 minutes.</p>
      ${btn("Go to My Renewal Calendar", dashboardUrl)}
      <p>One more thing: connect your Gmail or Outlook in Settings → Email. It takes about 90 seconds and makes the whole workflow click into place.</p>
      <p>If you hit anything confusing, reply to this email. Real answer, no scripts.</p>
      <p>— Scott<br>Founder, Beacon</p>
    `),
  });
}
