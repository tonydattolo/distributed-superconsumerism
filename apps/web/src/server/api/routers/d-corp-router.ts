import { z } from "zod";
import { eq, and, desc, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  authenticatedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  dCorps,
  distributions,
  dCorpMembers,
  type DCorp,
  type Distribution,
} from "@/server/db/schema";
import {
  createDCorpSchema,
  createDistributionSchema,
} from "@/lib/validations/d-corp";

export const dCorpRouter = createTRPCRouter({
  // D-Corp Management
  create: authenticatedProcedure
    .input(createDCorpSchema)
    .mutation(async ({ ctx, input }) => {
      const [dCorp] = await ctx.db
        .insert(dCorps)
        .values({
          name: input.name,
          symbol: input.symbol,
          description: input.description,
          capitalPercentage: input.distributionConfig.capital,
          laborPercentage: input.distributionConfig.labor,
          consumerPercentage: input.distributionConfig.consumers,
          attestations: input.attestations,
          founderId: "user-id-placeholder", // TODO: Replace with actual user ID from auth
        })
        .returning();

      if (!dCorp) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create D-Corp",
        });
      }

      // Add founder as a member with founder role
      await ctx.db.insert(dCorpMembers).values({
        dCorpId: dCorp.id,
        userId: "user-id-placeholder", // TODO: Replace with actual user ID from auth
        role: "founder",
      });

      return dCorp;
    }),

  // Get D-Corp by ID
  getById: authenticatedProcedure
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
  getDashboardData: authenticatedProcedure
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
        .select({ count: z.number() })
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            isNull(dCorpMembers.deletedAt)
          )
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
  getUserDCorps: authenticatedProcedure.query(async ({ ctx }) => {
    const userDCorps = await ctx.db
      .select({
        dCorp: dCorps,
        role: dCorpMembers.role,
      })
      .from(dCorpMembers)
      .innerJoin(dCorps, eq(dCorps.id, dCorpMembers.dCorpId))
      .where(
        and(
          eq(dCorpMembers.userId, "user-id-placeholder"), // TODO: Replace with actual user ID
          isNull(dCorpMembers.deletedAt),
          isNull(dCorps.deletedAt)
        )
      );

    return userDCorps;
  }),

  // Distribution Management
  createDistribution: authenticatedProcedure
    .input(
      createDistributionSchema.extend({
        dCorpId: z.string().uuid(),
      })
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
      const consumerAmount = (input.totalAmount * dCorp.consumerPercentage) / 100;

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
  getDistributions: authenticatedProcedure
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
  updateTreasuryBalance: authenticatedProcedure
    .input(z.object({
      dCorpId: z.string().uuid(),
      amount: z.number().min(0),
      operation: z.enum(["add", "set"]),
      notes: z.string().optional(),
    }))
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

      const currentBalance = parseFloat(dCorp.treasuryBalance);
      const newBalance = input.operation === "add" 
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
  getMembers: authenticatedProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db
        .select()
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            isNull(dCorpMembers.deletedAt)
          )
        )
        .orderBy(desc(dCorpMembers.joinedAt));

      return members;
    }),

  addMember: authenticatedProcedure
    .input(z.object({
      dCorpId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.enum(["founder", "admin", "member"]).default("member"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if member already exists
      const [existingMember] = await ctx.db
        .select()
        .from(dCorpMembers)
        .where(
          and(
            eq(dCorpMembers.dCorpId, input.dCorpId),
            eq(dCorpMembers.userId, input.userId),
            isNull(dCorpMembers.deletedAt)
          )
        );

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this D-Corp",
        });
      }

      const [member] = await ctx.db
        .insert(dCorpMembers)
        .values({
          dCorpId: input.dCorpId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return member;
    }),

  updateMemberRole: authenticatedProcedure
    .input(z.object({
      memberId: z.string().uuid(),
      role: z.enum(["founder", "admin", "member"]),
    }))
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

  removeMember: authenticatedProcedure
    .input(z.object({
      memberId: z.string().uuid(),
    }))
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
});