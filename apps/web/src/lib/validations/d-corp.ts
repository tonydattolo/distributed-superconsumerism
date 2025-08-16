import { z } from "zod";

export const createDCorpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  symbol: z.string().min(1).max(10).toUpperCase(),
  description: z.string().optional(),
  distributionConfig: z.object({
    capital: z.number().min(0).max(100),
    labor: z.number().min(0).max(100),
    consumers: z.number().min(0).max(100),
  }).refine(
    (data) => data.capital + data.labor + data.consumers === 100,
    { message: "Distribution percentages must total 100%" }
  ),
  attestations: z.object({
    waiveFiduciaryDuty: z.boolean().refine(val => val === true, {
      message: "You must agree to waive fiduciary duty"
    }),
    agreeToDistribution: z.boolean().refine(val => val === true, {
      message: "You must agree to the distribution terms"
    }),
    agreeToPrinciples: z.boolean().refine(val => val === true, {
      message: "You must agree to the D-Corp principles"
    }),
  }),
});

export type CreateDCorpInput = z.infer<typeof createDCorpSchema>;


export const createDistributionSchema = z.object({
  totalAmount: z.number().min(0.01, "Amount must be greater than 0"),
  quarter: z.string().min(1, "Quarter is required"),
  notes: z.string().optional(),
});

export type CreateDistributionInput = z.infer<typeof createDistributionSchema>;

export const updateTreasurySchema = z.object({
  amount: z.number().min(0, "Amount must be non-negative"),
  operation: z.enum(["add", "set"]),
  notes: z.string().optional(),
});

export type UpdateTreasuryInput = z.infer<typeof updateTreasurySchema>;

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["founder", "admin", "member"]).default("member"),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  role: z.enum(["founder", "admin", "member"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;