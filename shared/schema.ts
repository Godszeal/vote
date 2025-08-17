import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  voterId: varchar("voter_id").unique(),
  isAdmin: boolean("is_admin").default(false),
  isEligible: boolean("is_eligible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Elections table
export const elections = pgTable("elections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  allowMultipleVotes: boolean("allow_multiple_votes").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidates table
export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  electionId: uuid("election_id").notNull().references(() => elections.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  position: varchar("position", { length: 100 }),
  ticketPartner: varchar("ticket_partner"),
  partnerImageUrl: varchar("partner_image_url"),
  partnerPosition: varchar("partner_position", { length: 100 }),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Votes table
export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  electionId: uuid("election_id").notNull().references(() => elections.id, { onDelete: 'cascade' }),
  voterId: varchar("voter_id").notNull().references(() => users.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  encryptedBallot: text("encrypted_ballot"),
  receiptId: varchar("receipt_id").unique().notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.electionId, table.voterId),
  index("idx_votes_election").on(table.electionId),
  index("idx_votes_voter").on(table.voterId),
]);

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_logs_user").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_created").on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdElections: many(elections),
  votes: many(votes),
  auditLogs: many(auditLogs),
}));

export const electionsRelations = relations(elections, ({ one, many }) => ({
  creator: one(users, {
    fields: [elections.createdBy],
    references: [users.id],
  }),
  candidates: many(candidates),
  votes: many(votes),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  election: one(elections, {
    fields: [candidates.electionId],
    references: [elections.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  election: one(elections, {
    fields: [votes.electionId],
    references: [elections.id],
  }),
  voter: one(users, {
    fields: [votes.voterId],
    references: [users.id],
  }),
  candidate: one(candidates, {
    fields: [votes.candidateId],
    references: [candidates.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertElectionSchema = createInsertSchema(elections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Election = typeof elections.$inferSelect;
export type InsertElection = z.infer<typeof insertElectionSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Extended types for API responses
export type ElectionWithCandidates = Election & {
  candidates: Candidate[];
  totalVotes?: number;
  voterTurnout?: number;
  userHasVoted?: boolean;
};

export type CandidateWithVotes = Candidate & {
  voteCount: number;
  percentage: number;
};

export type ElectionResults = {
  election: Election;
  candidates: CandidateWithVotes[];
  totalVotes: number;
  eligibleVoters: number;
  turnoutPercentage: number;
};

export type VoteReceipt = {
  receiptId: string;
  electionTitle: string;
  timestamp: Date;
  confirmed: boolean;
};
