# Beacon — Privacy Policy
**Effective Date: April 27, 2026**
**Last Updated: April 27, 2026**

## Who We Are

Beacon is a software product operated by Scott Figeroa d/b/a Monolith, located in Ogden, Utah, United States. Beacon provides AI-assisted client communication tools for licensed independent insurance agents and agencies. You can reach us at legal@get-monolith.com.

## What Information We Collect

**From agents and agency accounts:**
- Name, email address, phone number, agency name, and state of licensure
- Billing information (processed entirely by Stripe — we never see, store, or have access to card numbers or banking details)
- Communication preferences and style settings
- Letters generated, edited, and sent through the platform
- Login credentials (passwords are hashed and salted — never stored in readable form)

**From client records agents upload:**
- Client names, email addresses, and phone numbers
- Policy types, carrier names, premium amounts, and renewal dates
- Any additional information the agent chooses to enter into a client record

**Automatically collected:**
- Browser type, IP address, and device information for security and fraud prevention
- Usage data (which features are used, when) for product improvement
- Error logs for diagnosing technical issues (personal data is excluded from error logs)

## How We Use This Information

- To operate the Beacon platform and generate AI-drafted letters
- To send letters via connected Gmail or Outlook accounts on the agent's behalf
- To maintain the E&O documentation log
- To process billing through Stripe
- To send product updates, security notices, and account communications
- To improve the platform based on usage patterns

**We do not sell your data or your clients' data to any third party. Ever.**

## AI Processing — Important Disclosure

When an agent generates a letter, certain client details — including first name, policy type, carrier name, premium information, and renewal date — are transmitted to Anthropic, PBC via their API solely for the purpose of generating letter drafts.

**Anthropic does not use API-submitted data to train their AI models.** Data transmitted to Anthropic is governed by Anthropic's privacy policy and API data usage policies. We transmit the minimum information necessary to generate each letter and do not send sensitive identifiers such as Social Security numbers, driver's license numbers, or financial account numbers to Anthropic.

## Data Storage and Security

- All data is stored in encrypted databases using AES-256 encryption at rest
- All data transmission uses TLS 1.3 encryption in transit
- Client records are isolated by agency — no agency can ever access another agency's data
- Access controls are enforced at both the application layer and the database layer independently
- Rate limiting is applied to all API endpoints to prevent abuse
- We maintain a Written Information Security Program (WISP) consistent with GLBA Safeguards Rule requirements

## Email Integration

When you connect a Gmail or Outlook account to Beacon, you authorize Beacon to send emails on your behalf through that account. We store only the OAuth access token required to send emails — we do not store your email password, and we do not read, index, or retain the content of your existing emails. You can disconnect your email account at any time from your account settings, which immediately revokes Beacon's sending access.

## Your Rights

**For all users:**
You may request a complete export of your data or permanent deletion of your account at any time by contacting legal@get-monolith.com. Account deletion removes all agency data, client records, and letter history within 30 days, except where retention is required by law.

**For California residents (CCPA):**
You have the right to know what personal information we collect and how it is used, request deletion of your personal information, and opt out of the sale of personal information. We do not sell personal information. Note: deletion requests for E&O documentation records will result in anonymization of personal identifiers rather than full deletion during the 7-year regulatory retention period, as described in the Data Retention section above. To exercise any of these rights, contact legal@get-monolith.com.

**For users in the European Union (GDPR):**
You have the right to access, rectify, erase, and port your personal data, and to object to or restrict certain processing. To exercise these rights, contact legal@get-monolith.com. We will respond within 30 days.

## Data Retention

Active account data is retained for the life of the account. E&O documentation logs are retained for 7 years following account closure to support the regulatory and legal record-keeping requirements common in the insurance industry. Upon account deletion, all other personal data (client names, contact information, premium details) is permanently removed within 30 days; however, the E&O communication record (letter text, timestamps, scenario type) is anonymized rather than deleted during the 7-year retention window — the communication history is preserved but stripped of personally identifiable client information after account deletion. Billing records are retained as required by applicable law.

**Read-only archive access:** During the 7-year E&O retention period following account closure, the account owner may request read-only access to their historical E&O log by contacting legal@get-monolith.com. Beacon will provide a secure, time-limited read-only view or a full PDF export of the retained E&O records upon identity verification.

## GLBA Compliance

Beacon operates as a service provider to licensed insurance agents who qualify as financial institutions under the Gramm-Leach-Bliley Act (GLBA). Beacon maintains a Written Information Security Program consistent with the GLBA Safeguards Rule and contractually commits to appropriate safeguards for nonpublic personal information through its Data Processing Agreement, available upon request at legal@get-monolith.com.

## Third-Party Services

Beacon uses the following third-party services which may process data as part of platform operations:

| Service | Purpose |
|---|---|
| Anthropic | AI letter generation |
| Stripe | Payment processing |
| Neon | Database hosting |
| Railway | Backend application hosting |
| Netlify | Frontend application hosting |
| Google | Gmail OAuth integration (only when agent connects their account) |
| Microsoft | Outlook OAuth integration (only when agent connects their account) |
| Sentry | Error monitoring (anonymized error logs — personal data excluded) |
| Upstash | Rate limiting and background job queue processing |
| Resend | Transactional email delivery (verification, password reset, billing notices) |

## Data Breaches

In the event of a data breach affecting your personal information, we will notify affected users by email within 72 hours of becoming aware of the breach, to the extent practicable. Notification will include the nature of the breach, the data affected, and the steps we are taking to address it.

## Children's Privacy

Beacon is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact legal@get-monolith.com immediately.

## Changes to This Policy

We will notify account holders by email at least 30 days before any material changes to this policy take effect. The "Last Updated" date at the top of this page will reflect any changes. Continued use of Beacon after changes take effect constitutes acceptance of the updated policy.

## Contact

Scott Figeroa d/b/a Monolith
Ogden, Utah, United States
legal@get-monolith.com
