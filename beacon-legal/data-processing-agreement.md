# Beacon — Data Processing Agreement (DPA)
**Version 1.0 | Effective: April 27, 2026**

*This Data Processing Agreement is available upon request to agency customers who require formal documentation of Beacon's data processing practices. To request a countersigned copy, contact legal@get-monolith.com.*

---

This Data Processing Agreement ("Agreement") is entered into between Scott Figeroa d/b/a Monolith, operating Beacon ("Beacon" or "Processor"), and the insurance agency or agent identified in the Beacon account ("Agency" or "Controller").

This Agreement is incorporated into and forms part of the Beacon Terms of Service. In the event of any conflict between this Agreement and the Terms of Service regarding data processing matters, this Agreement controls.

## 1. Definitions

**"Personal Data"** means any information relating to an identified or identifiable natural person, including client names, contact information, and policy details uploaded to Beacon by Agency.

**"Processing"** means any operation performed on Personal Data, including collection, storage, retrieval, use, disclosure, and deletion.

**"Data Subject"** means the individual to whom Personal Data relates — in this context, primarily Agency's insurance clients.

**"Applicable Data Protection Law"** means all applicable laws governing the processing of Personal Data, including the Gramm-Leach-Bliley Act (GLBA), the California Consumer Privacy Act (CCPA), and any other applicable state or federal privacy law.

## 2. Roles of the Parties

**Agency is the data controller.** Agency determines the purposes and means of processing Personal Data uploaded to Beacon and is responsible for ensuring it has a lawful basis for providing that data to Beacon.

**Beacon is the data processor.** Beacon processes Personal Data only as instructed by Agency through the platform and only for the purposes of providing Beacon's services.

## 3. Details of Processing

| Element | Details |
|---|---|
| **Purpose** | Generating AI-drafted client communications; maintaining E&O documentation logs; operating the Beacon platform |
| **Nature** | Storage, retrieval, AI processing, transmission via email integration |
| **Types of Personal Data** | Client names, email addresses, phone numbers, policy types, carrier names, premium amounts, renewal dates |
| **Categories of Data Subjects** | Agency's insurance clients and prospects |
| **Duration** | For the life of Agency's Beacon account, plus retention periods described in the Privacy Policy |

## 4. Beacon's Obligations as Processor

Beacon agrees to:

**a. Process only on documented instructions.** Process Personal Data only as instructed by Agency through the Beacon platform and as described in this Agreement, except where required by applicable law.

**b. Maintain confidentiality.** Ensure that all personnel with access to Personal Data are bound by appropriate confidentiality obligations.

**c. Implement appropriate security measures.** Maintain technical and organizational security measures appropriate to the risk, including:
- AES-256 encryption of data at rest
- TLS 1.3 encryption of data in transit
- Row-level database access controls isolating each agency's data
- Rate limiting and access monitoring
- Regular security assessments

**d. Engage sub-processors only with authorization.** Not engage new sub-processors without prior notification to Agency as described in Section 6.

**e. Assist with data subject rights.** Provide reasonable assistance to Agency in responding to Data Subject requests, taking into account the nature of the processing.

**f. Assist with security obligations.** Provide reasonable assistance to Agency in ensuring compliance with Agency's security, breach notification, and impact assessment obligations under Applicable Data Protection Law.

**g. Delete or return data upon termination.** Upon termination of Agency's account, delete or return all Personal Data within 30 days, except where retention is required by applicable law (E&O logs are retained for 7 years per Section 8 of the Privacy Policy).

**h. Provide compliance information.** Make available to Agency all information reasonably necessary to demonstrate Beacon's compliance with this Agreement, upon written request to legal@get-monolith.com.

## 5. Agency's Obligations as Controller

Agency agrees to:

- Ensure it has a lawful basis under Applicable Data Protection Law for providing Personal Data to Beacon
- Provide all required notices to Data Subjects regarding the use of third-party processors
- Ensure the accuracy of Personal Data provided to Beacon
- Use Beacon's platform and Personal Data only for lawful insurance business purposes
- Notify Beacon promptly if Agency becomes aware of any security incident involving Personal Data

## 6. Sub-Processors

Agency authorizes Beacon to use the sub-processors listed in the Beacon Privacy Policy to assist in providing the platform services. Current sub-processors include:

| Sub-Processor | Purpose |
|---|---|
| Anthropic | AI letter generation |
| Stripe | Billing and payment processing |
| Neon | Database hosting |
| Railway | Backend application hosting |
| Netlify | Frontend application hosting |
| Resend | Transactional email delivery |
| Upstash | Rate limiting and background job queue |
| Google | Gmail OAuth integration (only when agent connects their account) |
| Microsoft | Outlook OAuth integration (only when agent connects their account) |

Beacon will notify Agency of any material addition or replacement of sub-processors by updating the Privacy Policy and providing at least 30 days advance email notice to active Agency accounts. If Agency objects to a new sub-processor on reasonable data protection grounds, Agency may terminate its Beacon subscription and receive a pro-rated refund for any unused prepaid period. This pro-rated refund is the sole exception to Beacon's general no-refund policy for subscriptions (see Terms of Service Section 8).

Beacon remains responsible for the acts and omissions of its sub-processors to the same extent Beacon would be liable if performing the services directly.

## 7. International Data Transfers

Beacon's primary data storage and processing occurs within the United States. To the extent Personal Data of EU or UK Data Subjects is processed, Beacon relies on appropriate transfer mechanisms under applicable law. Contact legal@get-monolith.com for details on applicable transfer mechanisms.

## 8. Security Incidents and Breach Notification

Beacon will notify Agency without undue delay — and in any event within 72 hours — upon becoming aware of a security incident involving unauthorized access to, disclosure of, or destruction of Agency's Personal Data.

Notification will include, to the extent known at the time:
- A description of the nature of the incident
- The categories and approximate number of Data Subjects affected
- The categories and approximate volume of Personal Data records affected
- The likely consequences of the incident
- Measures taken or proposed to address the incident

Beacon will cooperate with Agency and take reasonable steps to mitigate the effects of any security incident.

## 9. Data Protection Impact Assessments

Upon Agency's reasonable written request, Beacon will provide information and reasonable assistance necessary for Agency to conduct a data protection impact assessment or prior consultation with a supervisory authority, where required by Applicable Data Protection Law.

## 10. Audit Rights

Upon Agency's written request (no more than once per calendar year, with at least 30 days advance notice), Beacon will provide Agency with documentation reasonably necessary to verify Beacon's compliance with this Agreement. Physical audits of Beacon's facilities or systems are not available but may be substituted with third-party audit certifications where available.

## 11. Limitation of Liability

Each party's liability under this Agreement is subject to the limitations set forth in the Beacon Terms of Service. This Agreement does not expand either party's liability beyond those limitations.

## 12. Term and Termination

This Agreement remains in effect for as long as Beacon processes Personal Data on Agency's behalf. It automatically terminates upon termination of Agency's Beacon account. Sections 4(g), 8, and 11 survive termination.

## 13. Governing Law

This Agreement is governed by the laws of the State of Utah, consistent with the Beacon Terms of Service.

## 14. Contact

For questions about this Agreement or to request a countersigned copy:

Scott Figeroa d/b/a Monolith
legal@get-monolith.com
Ogden, Utah, United States
