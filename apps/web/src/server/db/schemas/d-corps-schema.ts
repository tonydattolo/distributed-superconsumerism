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
  treasuryBalance: numeric("treasury_balance", {
    precision: 18,
    scale: 2,
  }).default("0"),
  totalDistributed: numeric("total_distributed", {
    precision: 18,
    scale: 2,
  }).default("0"),

  // Attestations
  attestations: jsonb("attestations").notNull(), // stores the required attestations

  // Blockchain addresses
  blockchainTxHash: varchar("blockchain_tx_hash", { length: 66 }), // 0x + 64 chars
  
  // OVault deployment and configuration status
  oVaultStatus: varchar("ovault_status", { length: 20 }).default("not_deployed"), // not_deployed, deploying, deployed, failed
  oVaultDeployedAt: timestamp("ovault_deployed_at"),
  oVaultTxHashes: jsonb("ovault_tx_hashes").$type<{
    [step: string]: string; // deployment step -> transaction hash
  }>(),
  
  // OVault contract addresses (LayerZero omnichain vault system)
  oVaultAddresses: jsonb("ovault_addresses").$type<{
    // Hub chain (Arbitrum Sepolia) addresses
    hubChain: {
      eid: number; // LayerZero endpoint ID (40231 for Arbitrum Sepolia)
      assetOFT: string; // MyAssetOFT address
      vault: string; // MyERC4626 address  
      shareAdapter: string; // MyShareOFTAdapter address
      composer: string; // MyOVaultComposer address
    };
    // Spoke chain addresses
    spokeChains: {
      [eid: number]: {
        assetOFT?: string; // MyAssetOFT address
        shareOFT?: string; // MyShareOFT address
      };
    };
  }>(),
  
  // OVault configuration
  oVaultConfig: jsonb("ovault_config").$type<{
    assetName: string; // e.g., "TechCorpAsset"
    assetSymbol: string; // e.g., "TCA"
    shareName: string; // e.g., "TechCorpShares"
    shareSymbol: string; // e.g., "TCS"
    targetChains: number[]; // LayerZero endpoint IDs for spoke chains
    initialFunding?: string; // Initial funding amount in ETH
  }>(),

  // Status and metadata
  isActive: boolean("is_active").default(true),
  founderWalletAddress: varchar("founder_wallet_address", {
    length: 42,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const distributionStatusEnum = pgEnum("distribution_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const distributions = pgTable("distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id")
    .notNull()
    .references(() => dCorps.id),

  // Distribution amounts
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
  capitalAmount: numeric("capital_amount", {
    precision: 18,
    scale: 2,
  }).notNull(),
  laborAmount: numeric("labor_amount", { precision: 18, scale: 2 }).notNull(),
  consumerAmount: numeric("consumer_amount", {
    precision: 18,
    scale: 2,
  }).notNull(),

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
  "member",
]);

export const dCorpMembers = pgTable("d_corp_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id")
    .notNull()
    .references(() => dCorps.id),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(), // Ethereum wallet address

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
