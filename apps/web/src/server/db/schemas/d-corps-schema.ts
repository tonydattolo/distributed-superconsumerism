import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const dCorps = pgTable("d_corps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  description: text("description"),
  
  // Distribution configuration
  capitalPercentage: integer("capital_percentage").notNull(),
  laborPercentage: integer("labor_percentage").notNull(),
  consumerPercentage: integer("consumer_percentage").notNull(),
  
  // Treasury and financial data
  treasuryBalance: numeric("treasury_balance", { precision: 18, scale: 2 }).default("0"),
  totalDistributed: numeric("total_distributed", { precision: 18, scale: 2 }).default("0"),
  
  // Attestations
  attestations: jsonb("attestations").notNull(), // stores the required attestations
  
  // Status and metadata
  isActive: boolean("is_active").default(true),
  founderId: uuid("founder_id").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const distributionStatusEnum = pgEnum("distribution_status", [
  "pending",
  "processing", 
  "completed",
  "failed"
]);

export const distributions = pgTable("distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id").notNull().references(() => dCorps.id),
  
  // Distribution amounts
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
  capitalAmount: numeric("capital_amount", { precision: 18, scale: 2 }).notNull(),
  laborAmount: numeric("labor_amount", { precision: 18, scale: 2 }).notNull(),
  consumerAmount: numeric("consumer_amount", { precision: 18, scale: 2 }).notNull(),
  
  // Metadata
  quarter: varchar("quarter", { length: 10 }).notNull(), // e.g., "2024-Q1"
  status: distributionStatusEnum("status").default("pending"),
  notes: text("notes"),
  
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const dCorpMemberRoleEnum = pgEnum("d_corp_member_role", [
  "founder",
  "admin",
  "member"
]);

export const dCorpMembers = pgTable("d_corp_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id").notNull().references(() => dCorps.id),
  userId: uuid("user_id").notNull(),
  
  role: dCorpMemberRoleEnum("role").default("member"),
  
  // Member metadata
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Type exports
export type DCorp = typeof dCorps.$inferSelect;
export type NewDCorp = typeof dCorps.$inferInsert;
export const dCorpsSelectSchema = createSelectSchema(dCorps);
export const dCorpsInsertSchema = createInsertSchema(dCorps);

export type Distribution = typeof distributions.$inferSelect;
export type NewDistribution = typeof distributions.$inferInsert;
export const distributionsSelectSchema = createSelectSchema(distributions);
export const distributionsInsertSchema = createInsertSchema(distributions);


export type DCorpMember = typeof dCorpMembers.$inferSelect;
export type NewDCorpMember = typeof dCorpMembers.$inferInsert;
export const dCorpMembersSelectSchema = createSelectSchema(dCorpMembers);
export const dCorpMembersInsertSchema = createInsertSchema(dCorpMembers);