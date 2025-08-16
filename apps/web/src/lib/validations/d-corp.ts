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
    waiveFiduciaryDuty: z.boolean().refine(val => val === true),
    agreeToDistribution: z.boolean().refine(val => val === true),
    agreeToPrinciples: z.boolean().refine(val => val === true),
  }),
});

export type CreateDCorpInput = z.infer<typeof createDCorpSchema>;

export const createOpportunitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(["development", "design", "content", "marketing", "other"]),
  pointsAwarded: z.number().min(1).max(10000),
  estimatedHours: z.number().min(0.5).max(40),
  difficulty: z.enum(["easy", "medium", "hard"]),
  requirements: z.array(z.string()),
  deadline: z.date().optional(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

export const distributionSchema = z.object({
  amount: z.number().min(0),
  note: z.string().optional(),
});

export type DistributionInput = z.infer<typeof distributionSchema>;

export const submissionReviewSchema = z.object({
  submissionId: z.string(),
  decision: z.enum(["approve", "reject"]),
  feedback: z.string().optional(),
  pointsAwarded: z.number().min(0).optional(),
});

export type SubmissionReviewInput = z.infer<typeof submissionReviewSchema>;