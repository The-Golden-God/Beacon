# Beacon — Written Information Security Program (WISP)
**Version 1.0 | Effective: April 27, 2026**
**Owner:** Scott Figeroa d/b/a Monolith
**Review cycle:** Annual (or after any material security incident)

*This document constitutes Beacon's Written Information Security Program as required by the Gramm-Leach-Bliley Act (GLBA) Safeguards Rule (16 CFR Part 314) as amended effective June 9, 2023. It is referenced in Beacon's Privacy Policy and Data Processing Agreement.*

---

## 1. Program Overview

Beacon is a SaaS platform used by licensed independent insurance agents to generate and send client communications. In providing these services, Beacon processes nonpublic personal information (NPI) of insurance clients — including names, contact information, and policy details — on behalf of agency customers.

This WISP describes the administrative, technical, and physical safeguards Beacon maintains to protect that information. The program is designed to:
- Protect the security, confidentiality, and integrity of customer NPI
- Protect against anticipated threats to the security of NPI
- Protect against unauthorized access to or use of NPI

---

## 2. Qualified Individual

The Qualified Individual responsible for overseeing and implementing this WISP is:

**Scott Figeroa**
Founder, Beacon / Monolith
Ogden, Utah
legal@get-monolith.com

The Qualified Individual reports directly to the business owner (same person at this stage) and is responsible for:
- Overseeing implementation of all safeguards described in this WISP
- Conducting or commissioning the annual risk assessment
- Reviewing and approving material changes to the program
- Reporting to the board of directors (or equivalent) on the status of the information security program — at MVP this means self-review with documentation

---

## 3. Risk Assessment

Beacon conducts a risk assessment at least annually and following any material change to the platform, its data processing activities, or its threat environment. The assessment identifies:
- Reasonably foreseeable internal and external risks to the security, confidentiality, and integrity of NPI
- The likelihood and potential damage of those risks
- The sufficiency of existing safeguards

**Current risk register summary (as of WISP v1.0):**

| Risk | Likelihood | Impact | Primary Control |
|---|---|---|---|
| Unauthorized access to production database | Low | Critical | RLS, no direct DB exposure, Railway private network |
| Compromised agent account (credential theft) | Medium | High | Session expiry, rate-limited login, HTTPS only |
| AI hallucination producing incorrect client information | Medium | Medium | Agent review required before send; E&O disclaimer |
| OAuth token theft (Gmail/Outlook) | Low | High | Tokens encrypted at rest; minimal scope (send-only) |
| Third-party sub-processor breach (Neon, Railway, etc.) | Low | High | DPA with sub-processors; AES-256 at rest |
| Insider threat (employee/contractor access) | Low | High | Least-privilege access; no shared credentials |
| Claude API sending NPI to train models | Low | High | Anthropic API agreement prohibits training on API data |
| Stripe payment data breach | Very Low | High | Beacon never sees card data; Stripe is PCI-DSS Level 1 |

The full risk assessment is maintained as a separate internal document and updated annually.

---

## 4. Technical Safeguards

### 4.1 Access Controls

- **Authentication:** All agents authenticate with email + password. Passwords are hashed using bcrypt (cost factor ≥ 12). Plain-text passwords are never stored.
- **Session management:** Sessions expire after 24 hours of inactivity (7 days with "Remember Me"). Sessions are invalidated on password change.
- **Multi-factor authentication:** Not required at MVP; on roadmap for Phase 2.
- **Principle of least privilege:** Database access uses Row-Level Security (RLS). Each authenticated session can only read and write rows belonging to its own workspace. No agent can access another agency's data.
- **Admin controls:** Two independent access control layers — application-layer middleware validates workspace membership, and database-layer RLS enforces isolation independently.
- **Employee/developer access:** Production database is not directly accessible from developer machines. All production access routes through Railway's private network. No shared production credentials.

### 4.2 Encryption

- **At rest:** All data stored in Neon PostgreSQL is encrypted at rest using AES-256.
- **In transit:** All communications between clients and the Beacon platform use TLS 1.3. All API calls to sub-processors (Anthropic, Stripe, etc.) use TLS.
- **OAuth tokens:** Gmail and Outlook OAuth access tokens are encrypted before storage in the database. They are decrypted only at the moment of use (email send) and never logged.
- **Secrets management:** All API keys, database credentials, and service tokens are stored as environment variables in Railway's secret store. No secrets are committed to source code or version control.

### 4.3 Application Security

- **Input validation:** All user inputs are validated using Zod schemas on the server before processing. Client-side validation is for UX only and is never the security boundary.
- **SQL injection prevention:** Drizzle ORM is used for all database queries. All queries use parameterized statements by default.
- **XSS prevention:** AI-generated content is sanitized before rendering. No raw `innerHTML` from AI output.
- **Security headers:** All responses include: `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Rate limiting:** Login attempts are rate-limited (5 attempts per 15 minutes per email + IP). Letter generation is rate-limited (100 per hour per workspace). Implemented via Upstash Redis.
- **Webhook verification:** Stripe webhook payloads are verified using Stripe's signature verification before processing.

### 4.4 Infrastructure Security

- **Cloudflare WAF:** All production traffic routes through Cloudflare before reaching Railway. Cloudflare provides DDoS protection, bot filtering, and IP reputation blocking.
- **Network isolation:** Railway backend services are on a private network. The database is not publicly accessible.
- **Dependency management:** Renovate Bot monitors all production dependencies and opens automated PRs for security updates. Updates are reviewed and merged within 7 days for security patches.
- **CI/CD security:** All deployments are gated behind a CI pipeline that runs TypeScript checks and tests. No direct manual deployments to production.

### 4.5 Monitoring and Detection

- **Error monitoring:** Sentry captures all application errors in real time. Personal data is explicitly excluded from error log payloads.
- **Uptime monitoring:** UptimeRobot pings the production URL every 5 minutes. Alerts are sent via SMS and email if the service is unreachable for more than 10 minutes.
- **Railway alerts:** CPU and memory utilization alerts configured at 80% threshold for 5 minutes.
- **Claude API monitoring:** Consecutive API failure rate is monitored; alerts fire if >3 consecutive failures.

---

## 5. Physical Safeguards

Beacon is a cloud-native product with no on-premises infrastructure. Physical safeguards are provided by our sub-processors:

- **Neon (database):** Operates on AWS infrastructure (us-east-1). AWS maintains SOC 2 Type II compliance and physical datacenter security.
- **Railway (backend hosting):** Operates on GCP infrastructure. GCP maintains SOC 2 Type II compliance.
- **Netlify (frontend hosting):** Global CDN with standard datacenter physical controls.

Developer workstations:
- Full-disk encryption enabled on all developer machines
- Developer machines are personal devices; company policy requires lock screens active within 5 minutes
- No production data is stored on developer workstations

---

## 6. Vendor and Third-Party Management

All sub-processors that handle NPI are governed by Data Processing Agreements (or equivalent contractual data protection terms). Current sub-processors:

| Sub-Processor | NPI Exposure | Controls |
|---|---|---|
| Anthropic | Client first name, policy type, carrier, premium, renewal date (letter generation only) | API terms prohibit training on API data; minimum necessary data transmitted |
| Neon | All NPI (database storage) | SOC 2 Type II; AES-256 at rest; encrypted connections |
| Railway | Application-layer access to NPI | SOC 2 Type II; private network; no direct DB access |
| Netlify | None (static frontend only) | No NPI handled |
| Resend | Agent email address (for transactional delivery) | No client NPI transmitted |
| Upstash | Rate-limiting keys only (no NPI) | Ephemeral data; no NPI stored |
| Stripe | Billing data only (no client NPI) | PCI-DSS Level 1 |
| Google/Microsoft | Client email address + letter content (send-only, when agent connects account) | OAuth limited to send scope only |

New sub-processors are reviewed for security posture before onboarding. Customers are notified of material sub-processor additions per the DPA.

---

## 7. Employee Training and Awareness

At MVP, Beacon has no employees other than the founder. As the team grows:

- All new hires who access production systems or customer data will complete a security orientation within their first week
- Security orientation covers: acceptable use, password hygiene, phishing awareness, incident reporting procedures, and data handling obligations under GLBA
- Security training is repeated annually
- This WISP is reviewed with all relevant personnel annually

---

## 8. Incident Response

Beacon maintains a separate Incident Response Plan (see `incident-response-plan.md`) that defines:
- Incident classification (P0 through P2)
- Notification timelines (72-hour GLBA notification for NPI breaches)
- Containment and remediation procedures
- Post-incident review requirements

In the event of a security incident involving NPI, the Qualified Individual is immediately notified and the Incident Response Plan is activated.

---

## 9. Program Review and Testing

- **Annual review:** This WISP is reviewed and updated at least once per calendar year. The next scheduled review is April 2027.
- **Penetration testing:** Basic penetration testing is performed before each major feature release involving new data handling (Phase 2 and beyond). At MVP, the security test matrix in the DOD serves as the baseline security verification.
- **Vulnerability disclosure:** Security researchers may report vulnerabilities to legal@get-monolith.com. Beacon commits to acknowledging reports within 5 business days and responding substantively within 30 days.
- **Post-incident review:** Following any P0 or P1 security incident, a post-mortem is completed within 14 days and any required WISP updates are implemented within 30 days.

---

## 10. Records

Beacon retains records of:
- This WISP and all prior versions (version history in git)
- Annual risk assessments
- Security incident logs
- Sub-processor agreements and reviews
- Employee training completion records (when applicable)

Records are retained for a minimum of 5 years.

---

*WISP approved by: Scott Figeroa, April 27, 2026*
*Next review due: April 2027*
