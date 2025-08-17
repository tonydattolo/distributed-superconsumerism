import { z } from "zod";
import { eq, and, desc, isNull, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  dCorps,
  distributions,
  dCorpMembers,
  // type DCorp,
  // type Distribution,
} from "@/server/db/schemas/d-corps-schema";
import {
  createDCorpSchema,
  createDistributionSchema,
} from "@/lib/validations/d-corp";


export const dCorpRouter = createTRPCRouter({
  // D-Corp Management
  create: publicProcedure
    .input(createDCorpSchema.extend({
      founderWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      blockchainTxHash: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create D-Corp first
      const [dCorp] = await ctx.db
        .insert(dCorps)
        .values({
          name: input.name,
          symbol: input.symbol,
          description: input.description + (input.blockchainTxHash ? `\n\nBlockchain TX: ${input.blockchainTxHash}` : ''),
          capitalPercentage: input.distributionConfig.capital,
          laborPercentage: input.distributionConfig.labor,
          consumerPercentage: input.distributionConfig.consumers,
          founderWalletAddress: input.founderWalletAddress, // Required field
          attestations: {
            ...input.attestations,
            founderWalletAddress: input.founderWalletAddress, // Store wallet address in attestations
          },
        })
        .returning();

      if (!dCorp) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create D-Corp",
        });
      }

      // Now create the founder as a member 
      const [founderMember] = await ctx.db
        .insert(dCorpMembers)
        .values({
          walletAddress: input.founderWalletAddress,
          role: "founder",
          dCorpId: dCorp.id, // Use the actual D-Corp ID
        })
        .returning();

      if (!founderMember) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create founder member",
        });
      }

      return dCorp;
    }),

  // Get D-Corp by ID
  getById: publicProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(and(eq(dCorps.id, input.dCorpId), isNull(dCorps.deletedAt)));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      return dCorp;
    }),

  // Get dashboard data
  getDashboardData: publicProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      // Get recent distributions
      const recentDistributions = await ctx.db
        .select()
        .from(distributions)
        .where(eq(distributions.dCorpId, input.dCorpId))
        .orderBy(desc(distributions.createdAt))
        .limit(5);

      // Get member count
      const memberCount = await ctx.db
        .select({ count: count() })
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            isNull(dCorpMembers.deletedAt),
          ),
        );

      return {
        dCorp,
        metrics: {
          treasuryBalance: dCorp.treasuryBalance,
          totalDistributed: dCorp.totalDistributed,
          memberCount: memberCount[0]?.count ?? 0,
        },
        recentDistributions,
      };
    }),

  // List user's D-Corps
  getUserDCorps: publicProcedure
    .input(z.object({
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    }))
    .query(async ({ ctx, input }) => {
      const userDCorps = await ctx.db
        .select({
          dCorp: dCorps,
          role: dCorpMembers.role,
        })
        .from(dCorpMembers)
        .innerJoin(dCorps, eq(dCorps.id, dCorpMembers.dCorpId))
        .where(
          and(
            eq(dCorpMembers.walletAddress, input.walletAddress),
            isNull(dCorpMembers.deletedAt),
            isNull(dCorps.deletedAt),
          ),
        );

      return userDCorps;
    }),

  // Distribution Management
  createDistribution: publicProcedure
    .input(
      createDistributionSchema.extend({
        dCorpId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      // Calculate distribution amounts based on percentages
      const capitalAmount = (input.totalAmount * dCorp.capitalPercentage) / 100;
      const laborAmount = (input.totalAmount * dCorp.laborPercentage) / 100;
      const consumerAmount =
        (input.totalAmount * dCorp.consumerPercentage) / 100;

      const [distribution] = await ctx.db
        .insert(distributions)
        .values({
          dCorpId: input.dCorpId,
          totalAmount: input.totalAmount.toString(),
          capitalAmount: capitalAmount.toString(),
          laborAmount: laborAmount.toString(),
          consumerAmount: consumerAmount.toString(),
          quarter: input.quarter,
          notes: input.notes,
        })
        .returning();

      return distribution;
    }),

  // Get distributions for a D-Corp
  getDistributions: publicProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const distributionsList = await ctx.db
        .select()
        .from(distributions)
        .where(eq(distributions.dCorpId, input.dCorpId))
        .orderBy(desc(distributions.createdAt));

      return distributionsList;
    }),

  // Treasury Management
  updateTreasuryBalance: publicProcedure
    .input(
      z.object({
        dCorpId: z.string().uuid(),
        amount: z.number().min(0),
        operation: z.enum(["add", "set"]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      const currentBalance = parseFloat(dCorp.treasuryBalance ?? "0");
      const newBalance =
        input.operation === "add"
          ? currentBalance + input.amount
          : input.amount;

      const [updatedDCorp] = await ctx.db
        .update(dCorps)
        .set({
          treasuryBalance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(dCorps.id, input.dCorpId))
        .returning();

      return updatedDCorp;
    }),

  // Member Management
  getMembers: publicProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db
        .select()
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            isNull(dCorpMembers.deletedAt),
          ),
        )
        .orderBy(desc(dCorpMembers.joinedAt));

      return members;
    }),

  addMember: publicProcedure
    .input(
      z.object({
        dCorpId: z.string().uuid(),
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
        role: z.enum(["founder", "admin", "member"]).default("member"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if member already exists
      const [existingMember] = await ctx.db
        .select()
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            eq(dCorpMembers.walletAddress, input.walletAddress),
            isNull(dCorpMembers.deletedAt),
          ),
        );

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Wallet is already a member of this D-Corp",
        });
      }

      const [member] = await ctx.db
        .insert(dCorpMembers)
        .values({
          dCorpId: input.dCorpId,
          walletAddress: input.walletAddress,
          role: input.role,
        })
        .returning();

      return member;
    }),

  updateMemberRole: publicProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        role: z.enum(["founder", "admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedMember] = await ctx.db
        .update(dCorpMembers)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(dCorpMembers.id, input.memberId))
        .returning();

      if (!updatedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return updatedMember;
    }),

  removeMember: publicProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [removedMember] = await ctx.db
        .update(dCorpMembers)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dCorpMembers.id, input.memberId))
        .returning();

      if (!removedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return removedMember;
    }),

  // OVault Management
  initializeOVault: publicProcedure
    .input(
      z.object({
        dCorpId: z.string().uuid(),
        assetName: z.string().min(1),
        assetSymbol: z.string().min(1).max(10),
        shareName: z.string().min(1),
        shareSymbol: z.string().min(1).max(10),
        targetChains: z.array(z.number()).min(1), // LayerZero endpoint IDs
        initialFunding: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      if (dCorp.oVaultStatus !== "not_deployed") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "OVault already initialized or in deployment",
        });
      }

      const [updatedDCorp] = await ctx.db
        .update(dCorps)
        .set({
          oVaultStatus: "deploying",
          oVaultConfig: {
            assetName: input.assetName,
            assetSymbol: input.assetSymbol,
            shareName: input.shareName,
            shareSymbol: input.shareSymbol,
            targetChains: input.targetChains,
            initialFunding: input.initialFunding,
          },
          updatedAt: new Date(),
        })
        .where(eq(dCorps.id, input.dCorpId))
        .returning();

      return updatedDCorp;
    }),

  updateOVaultDeployment: publicProcedure
    .input(
      z.object({
        dCorpId: z.string().uuid(),
        step: z.string(),
        txHash: z.string().optional(),
        contractAddress: z.string().optional(),
        contractType: z.enum(["assetOFT", "vault", "shareAdapter", "composer", "spokeAssetOFT", "spokeShareOFT"]).optional(),
        chainEid: z.number().optional(),
        status: z.enum(["deploying", "deployed", "failed"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select()
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      // Update transaction hashes
      const currentTxHashes = (dCorp.oVaultTxHashes as Record<string, string>) || {};
      if (input.txHash) {
        currentTxHashes[input.step] = input.txHash;
      }

      // Update contract addresses
      let currentAddresses = dCorp.oVaultAddresses as any;
      if (input.contractAddress && input.contractType) {
        if (!currentAddresses) {
          currentAddresses = {
            hubChain: { eid: 40231 }, // Arbitrum Sepolia
            spokeChains: {},
          };
        }

        if (input.contractType === "spokeAssetOFT" || input.contractType === "spokeShareOFT") {
          if (!currentAddresses.spokeChains[input.chainEid!]) {
            currentAddresses.spokeChains[input.chainEid!] = {};
          }
          if (input.contractType === "spokeAssetOFT") {
            currentAddresses.spokeChains[input.chainEid!].assetOFT = input.contractAddress;
          } else {
            currentAddresses.spokeChains[input.chainEid!].shareOFT = input.contractAddress;
          }
        } else {
          // Hub chain contracts
          if (input.contractType === "assetOFT") {
            currentAddresses.hubChain.assetOFT = input.contractAddress;
          } else if (input.contractType === "vault") {
            currentAddresses.hubChain.vault = input.contractAddress;
          } else if (input.contractType === "shareAdapter") {
            currentAddresses.hubChain.shareAdapter = input.contractAddress;
          } else if (input.contractType === "composer") {
            currentAddresses.hubChain.composer = input.contractAddress;
          }
        }
      }

      const updateData: any = {
        oVaultTxHashes: currentTxHashes,
        oVaultAddresses: currentAddresses,
        updatedAt: new Date(),
      };

      if (input.status) {
        updateData.oVaultStatus = input.status;
        if (input.status === "deployed") {
          updateData.oVaultDeployedAt = new Date();
        }
      }

      const [updatedDCorp] = await ctx.db
        .update(dCorps)
        .set(updateData)
        .where(eq(dCorps.id, input.dCorpId))
        .returning();

      return updatedDCorp;
    }),

  getOVaultStatus: publicProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .select({
          oVaultStatus: dCorps.oVaultStatus,
          oVaultConfig: dCorps.oVaultConfig,
          oVaultAddresses: dCorps.oVaultAddresses,
          oVaultTxHashes: dCorps.oVaultTxHashes,
          oVaultDeployedAt: dCorps.oVaultDeployedAt,
        })
        .from(dCorps)
        .where(eq(dCorps.id, input.dCorpId));

      if (!dCorp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "D-Corp not found",
        });
      }

      return dCorp;
    }),
});
