import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["solo", "agency", "office"]);
export const roleEnum = pgEnum("role", ["admin", "agent"]);
export const policyTypeEnum = pgEnum("policy_type", [
  "auto",
  "home",
  "life",
  "health",
  "commercial",
  "umbrella",
  "other",
]);
export const letterScenarioEnum = pgEnum("letter_scenario", [
  "pre_renewal",
  "rate_increase",
  "new_client_welcome",
  "claims_checkin",
  "coverage_gap",
  "annual_review",
]);
export const letterStatusEnum = pgEnum("letter_status", [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "rejected",
]);
export const sendMethodEnum = pgEnum("send_method", ["gmail", "outlook", "manual"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);

// ─── Workspaces ───────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logoUrl: text("logo_url"),
  // Agency profile fields
  agentName: text("agent_name"),
  state: text("state"),
  phone: text("phone"),
  workEmail: text("work_email"),
  // Voice / style settings for letter generation
  agencyVoice: text("agency_voice"),
  signoff: text("signoff"),         // sign-off phrase (e.g. "Warm regards")
  signatureBlock: text("signature_block"), // assembled full signature block
  eoDisclaimer: text("eo_disclaimer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("workspaces_slug_idx").on(t.slug),
]);

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  plan: planEnum("plan").notNull().default("solo"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  // Free trial tracking (10 letters)
  trialLettersUsed: integer("trial_letters_used").notNull().default(0),
  trialLettersLimit: integer("trial_letters_limit").notNull().default(10),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("subscriptions_workspace_idx").on(t.workspaceId),
  index("subscriptions_stripe_customer_idx").on(t.stripeCustomerId),
]);

// ─── Users ────────────────────────────────────────────────────────────────────
// Better Auth manages the `users` table — we extend it here with app columns.
// Better Auth requires: id, email, emailVerified, name, image, createdAt, updatedAt

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name").notNull(),
  image: text("image"),
  // App-specific
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  role: roleEnum("role").notNull().default("agent"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  // OAuth tokens (encrypted)
  gmailAccessToken: text("gmail_access_token"),
  gmailRefreshToken: text("gmail_refresh_token"),
  gmailTokenExpiry: timestamp("gmail_token_expiry"),
  gmailEmail: text("gmail_email"),
  outlookAccessToken: text("outlook_access_token"),
  outlookRefreshToken: text("outlook_refresh_token"),
  outlookTokenExpiry: timestamp("outlook_token_expiry"),
  outlookEmail: text("outlook_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("users_email_idx").on(t.email),
  index("users_workspace_idx").on(t.workspaceId),
]);

// ─── Better Auth Tables ───────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("sessions_token_idx").on(t.token),
  index("sessions_user_idx").on(t.userId),
]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("accounts_user_idx").on(t.userId),
]);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  // Basic info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  // Policy info
  policyType: policyTypeEnum("policy_type"),
  policyNumber: text("policy_number"),
  carrier: text("carrier"),
  premium: decimal("premium", { precision: 10, scale: 2 }),
  renewalDate: timestamp("renewal_date"),
  // Flags
  doNotContact: boolean("do_not_contact").notNull().default(false),
  notes: text("notes"),
  // CSV import tracking
  importBatchId: uuid("import_batch_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("clients_workspace_idx").on(t.workspaceId),
  index("clients_renewal_date_idx").on(t.renewalDate),
  index("clients_workspace_renewal_idx").on(t.workspaceId, t.renewalDate),
]);

// ─── Letter Templates ─────────────────────────────────────────────────────────

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  scenario: letterScenarioEnum("scenario").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("templates_workspace_idx").on(t.workspaceId),
  index("templates_scenario_idx").on(t.workspaceId, t.scenario),
]);

// ─── Letters ──────────────────────────────────────────────────────────────────

export const letters = pgTable("letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  authorUserId: text("author_user_id").notNull().references(() => users.id),
  scenario: letterScenarioEnum("scenario").notNull(),
  status: letterStatusEnum("status").notNull().default("draft"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  // Version tracking
  version: integer("version").notNull().default(1),
  parentLetterId: uuid("parent_letter_id"), // references prior version
  // Approval workflow (Agency/Office tiers)
  submittedForApprovalAt: timestamp("submitted_for_approval_at"),
  approvedByUserId: text("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  // Prompt metadata (for quality tracking)
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  templateId: uuid("template_id").references(() => templates.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("letters_workspace_idx").on(t.workspaceId),
  index("letters_client_idx").on(t.clientId),
  index("letters_workspace_status_idx").on(t.workspaceId, t.status),
  index("letters_author_idx").on(t.authorUserId),
]);

// ─── E&O Audit Log ────────────────────────────────────────────────────────────

export const eoLog = pgTable("eo_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  letterId: uuid("letter_id").notNull().references(() => letters.id, { onDelete: "restrict" }),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
  sentByUserId: text("sent_by_user_id").notNull().references(() => users.id),
  // Snapshot of the letter content at send time (tamper-proof)
  letterSubjectSnapshot: text("letter_subject_snapshot").notNull(),
  letterContentSnapshot: text("letter_content_snapshot").notNull(),
  clientNameSnapshot: text("client_name_snapshot").notNull(),
  clientEmailSnapshot: text("client_email_snapshot"),
  // Send details
  sendMethod: sendMethodEnum("send_method").notNull(),
  sentToEmail: text("sent_to_email"),
  externalMessageId: text("external_message_id"), // Gmail/Outlook message ID
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  // Checksum for tamper detection
  contentHash: text("content_hash").notNull(),
}, (t) => [
  index("eo_log_workspace_idx").on(t.workspaceId),
  index("eo_log_client_idx").on(t.clientId),
  index("eo_log_sent_at_idx").on(t.workspaceId, t.sentAt),
  index("eo_log_letter_idx").on(t.letterId),
]);

// ─── Invite Tokens ────────────────────────────────────────────────────────────

export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  invitedByUserId: text("invited_by_user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("agent"),
  token: text("token").notNull(),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("invites_token_idx").on(t.token),
  index("invites_workspace_idx").on(t.workspaceId),
  index("invites_email_idx").on(t.email),
]);

// ─── Relations ────────────────────────────────────────────────────────────────

export const workspaceRelations = relations(workspaces, ({ many, one }) => ({
  users: many(users),
  clients: many(clients),
  letters: many(letters),
  templates: many(templates),
  eoLog: many(eoLog),
  invites: many(invites),
  subscription: one(subscriptions, {
    fields: [workspaces.id],
    references: [subscriptions.workspaceId],
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [users.workspaceId],
    references: [workspaces.id],
  }),
  sessions: many(sessions),
  letters: many(letters),
  templates: many(templates),
}));

export const clientRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  letters: many(letters),
  eoLog: many(eoLog),
}));

export const letterRelations = relations(letters, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [letters.workspaceId],
    references: [workspaces.id],
  }),
  client: one(clients, {
    fields: [letters.clientId],
    references: [clients.id],
  }),
  author: one(users, {
    fields: [letters.authorUserId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [letters.templateId],
    references: [templates.id],
  }),
}));

export const eoLogRelations = relations(eoLog, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [eoLog.workspaceId],
    references: [workspaces.id],
  }),
  letter: one(letters, {
    fields: [eoLog.letterId],
    references: [letters.id],
  }),
  client: one(clients, {
    fields: [eoLog.clientId],
    references: [clients.id],
  }),
  sentBy: one(users, {
    fields: [eoLog.sentByUserId],
    references: [users.id],
  }),
}));
