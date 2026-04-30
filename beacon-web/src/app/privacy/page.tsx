import Link from "next/link";
import { BeaconLogo } from "@/components/beacon-logo";

export const metadata = {
  title: "Privacy Policy — Beacon",
  description: "How Beacon collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <BeaconLogo href="/" />
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Effective Date: April 27, 2026 · Last Updated: April 27, 2026</p>

          <Section title="Who We Are">
            <p>Beacon is a software product operated by Scott Figeroa d/b/a Monolith, located in Ogden, Utah, United States. Beacon provides AI-assisted client communication tools for licensed independent insurance agents and agencies. You can reach us at <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>.</p>
          </Section>

          <Section title="What Information We Collect">
            <p><strong>From agents and agency accounts:</strong></p>
            <ul>
              <li>Name, email address, phone number, agency name, and state of licensure</li>
              <li>Billing information (processed entirely by Stripe — we never see, store, or have access to card numbers or banking details)</li>
              <li>Communication preferences and style settings</li>
              <li>Letters generated, edited, and sent through the platform</li>
              <li>Login credentials (passwords are hashed and salted — never stored in readable form)</li>
            </ul>
            <p><strong>From client records agents upload:</strong></p>
            <ul>
              <li>Client names, email addresses, and phone numbers</li>
              <li>Policy types, carrier names, premium amounts, and renewal dates</li>
              <li>Any additional information the agent chooses to enter into a client record</li>
            </ul>
            <p><strong>Automatically collected:</strong></p>
            <ul>
              <li>Browser type, IP address, and device information for security and fraud prevention</li>
              <li>Usage data (which features are used, when) for product improvement</li>
              <li>Error logs for diagnosing technical issues (personal data is excluded from error logs)</li>
            </ul>
          </Section>

          <Section title="How We Use This Information">
            <ul>
              <li>To operate the Beacon platform and generate AI-drafted letters</li>
              <li>To send letters via connected Gmail or Outlook accounts on the agent's behalf</li>
              <li>To maintain the E&amp;O documentation log</li>
              <li>To process billing through Stripe</li>
              <li>To send product updates, security notices, and account communications</li>
              <li>To improve the platform based on usage patterns</li>
            </ul>
            <p><strong>We do not sell your data or your clients' data to any third party. Ever.</strong></p>
          </Section>

          <Section title="AI Processing — Important Disclosure">
            <p>When an agent generates a letter, certain client details — including first name, policy type, carrier name, premium information, and renewal date — are transmitted to Anthropic, PBC via their API solely for the purpose of generating letter drafts.</p>
            <p><strong>Anthropic does not use API-submitted data to train their AI models.</strong> Data transmitted to Anthropic is governed by Anthropic's privacy policy and API data usage policies. We transmit the minimum information necessary to generate each letter and do not send sensitive identifiers such as Social Security numbers, driver's license numbers, or financial account numbers to Anthropic.</p>
          </Section>

          <Section title="Data Storage and Security">
            <ul>
              <li>All data is stored in encrypted databases using AES-256 encryption at rest</li>
              <li>All data transmission uses TLS 1.3 encryption in transit</li>
              <li>Client records are isolated by agency — no agency can ever access another agency's data</li>
              <li>Access controls are enforced at both the application layer and the database layer independently</li>
              <li>Rate limiting is applied to all API endpoints to prevent abuse</li>
              <li>We maintain a Written Information Security Program (WISP) consistent with GLBA Safeguards Rule requirements</li>
            </ul>
          </Section>

          <Section title="Email Integration">
            <p>When you connect a Gmail or Outlook account to Beacon, you authorize Beacon to send emails on your behalf through that account. We store only the OAuth access token required to send emails — we do not store your email password, and we do not read, index, or retain the content of your existing emails. You can disconnect your email account at any time from your account settings, which immediately revokes Beacon's sending access.</p>
          </Section>

          <Section title="Your Rights">
            <p><strong>For all users:</strong> You may request a complete export of your data or permanent deletion of your account at any time by contacting <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>. Account deletion removes all agency data, client records, and letter history within 30 days, except where retention is required by law.</p>
            <p><strong>For California residents (CCPA):</strong> You have the right to know what personal information we collect and how it is used, request deletion of your personal information, and opt out of the sale of personal information. We do not sell personal information. To exercise any of these rights, contact <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>.</p>
            <p><strong>For users in the European Union (GDPR):</strong> You have the right to access, rectify, erase, and port your personal data, and to object to or restrict certain processing. To exercise these rights, contact <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="Data Retention">
            <p>Active account data is retained for the life of the account. E&amp;O documentation logs are retained for 7 years following account closure to support the regulatory and legal record-keeping requirements common in the insurance industry. Upon account deletion, all other personal data is permanently removed within 30 days; however, the E&amp;O communication record is anonymized rather than deleted during the 7-year retention window.</p>
            <p><strong>Read-only archive access:</strong> During the 7-year E&amp;O retention period following account closure, the account owner may request read-only access to their historical E&amp;O log by contacting <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>.</p>
          </Section>

          <Section title="GLBA Compliance">
            <p>Beacon operates as a service provider to licensed insurance agents who qualify as financial institutions under the Gramm-Leach-Bliley Act (GLBA). Beacon maintains a Written Information Security Program consistent with the GLBA Safeguards Rule and contractually commits to appropriate safeguards for nonpublic personal information through its Data Processing Agreement, available upon request at <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a>.</p>
          </Section>

          <Section title="Third-Party Services">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Service</th>
                  <th className="text-left py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Anthropic", "AI letter generation"],
                  ["Stripe", "Payment processing"],
                  ["Neon", "Database hosting"],
                  ["Railway", "Backend application hosting"],
                  ["Netlify", "Frontend application hosting"],
                  ["Google", "Gmail OAuth integration (only when agent connects their account)"],
                  ["Microsoft", "Outlook OAuth integration (only when agent connects their account)"],
                  ["Sentry", "Error monitoring (anonymized error logs — personal data excluded)"],
                  ["Upstash", "Rate limiting and background job queue processing"],
                  ["Resend", "Transactional email delivery"],
                ].map(([service, purpose]) => (
                  <tr key={service} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{service}</td>
                    <td className="py-2 text-muted-foreground">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Data Breaches">
            <p>In the event of a data breach affecting your personal information, we will notify affected users by email within 72 hours of becoming aware of the breach, to the extent practicable.</p>
          </Section>

          <Section title="Children's Privacy">
            <p>Beacon is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact <a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a> immediately.</p>
          </Section>

          <Section title="Changes to This Policy">
            <p>We will notify account holders by email at least 30 days before any material changes to this policy take effect. Continued use of Beacon after changes take effect constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="Contact">
            <p>Scott Figeroa d/b/a Monolith<br />Ogden, Utah, United States<br /><a href="mailto:legal@get-monolith.com" className="underline">legal@get-monolith.com</a></p>
          </Section>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Beacon · A product of Monolith · Ogden, Utah</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/80 space-y-3">{children}</div>
    </section>
  );
}
