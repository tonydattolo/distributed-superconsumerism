# [FE-000] D-Corp Platform Database Schema & Architecture Foundation

**Priority:** P0 (Highest)  
**Story Points:** 8  
**Epic:** D-Corp Platform MVP  
**Tags:** `setup`, `database`, `architecture`, `foundation`, `mvp`

## 📋 Overview

Establish the foundational database schema, tRPC procedures, and authentication system for the D-Corp platform using our existing tech stack (Next.js 15, Drizzle ORM, Supabase Auth, tRPC).

## 🎯 Goals

- Design and implement D-Corp database schema with proper RLS policies
- Set up tRPC routers for all D-Corp entities
- Configure multi-tenancy through D-Corp workspaces
- Establish user roles (Founder/Admin, Labor, Consumer)
- Prepare Web3 integration points
- Enable rapid feature development

## ✅ Acceptance Criteria

### Database Schema Design
- [ ] D-Corp core entities schema (d_corps, distribution_configs)
- [ ] User roles and permissions schema (d_corp_members, roles)
- [ ] Labor system schema (opportunities, submissions, attestations)
- [ ] Consumer system schema (rewards, claims, challenges)
- [ ] Points tracking schema (labor_points, use_points, distributions)
- [ ] Postgres RLS policies for multi-tenancy

### tRPC API Layer
- [ ] D-Corp management procedures (create, update, manage)
- [ ] Labor procedures (submit work, approve attestations)
- [ ] Consumer procedures (claim rewards, track points)
- [ ] Distribution procedures (calculate, execute payouts)
- [ ] Analytics procedures (metrics, reporting)
- [ ] Proper Zod validation for all inputs

### Authentication & Authorization
- [ ] D-Corp workspace-based multi-tenancy
- [ ] Role-based access control (Founder/Admin/Labor/Consumer)
- [ ] RLS policies for data isolation
- [ ] Permission checking middleware
- [ ] User onboarding flow integration

## 🏗️ Database Schema Structure

```
/apps/web/src/server/db/schemas/
├── d_corps_schema.ts          # Core D-Corp entities
├── d_corp_members_schema.ts   # D-Corp membership & roles
├── opportunities_schema.ts    # Labor opportunities
├── submissions_schema.ts      # Work submissions & attestations
├── rewards_schema.ts          # Consumer rewards system
├── claims_schema.ts           # Consumer claims tracking
├── points_schema.ts           # Labor/Use points tracking
├── distributions_schema.ts    # Profit distribution history
├── challenges_schema.ts       # Consumer challenges/gamification
└── index.ts                   # Schema exports

/apps/web/src/server/api/routers/
├── d_corp_router.ts           # D-Corp CRUD operations
├── labor_router.ts            # Labor submission management
├── consumer_router.ts         # Consumer rewards & claims
├── distribution_router.ts     # Profit distribution logic
├── analytics_router.ts        # Metrics & reporting
└── index.ts                   # Router aggregation

/apps/web/src/app/(frontend)/a/
├── d-corp/                    # D-Corp management routes
│   ├── create/               # D-Corp creation wizard
│   ├── [dCorpId]/           # Individual D-Corp dashboard
│   │   ├── dashboard/       # Overview & metrics
│   │   ├── distributions/   # Profit distribution
│   │   ├── attestations/    # Labor approval queue
│   │   └── members/         # Member management
├── labor/                     # Labor portal routes
│   ├── opportunities/        # Browse work opportunities
│   ├── submissions/          # Submit & track work
│   └── earnings/            # Points & distribution tracking
└── consumer/                  # Consumer portal routes
    ├── rewards/              # Browse & claim rewards
    ├── challenges/           # Gamification features
    └── history/              # Claims & earnings history
```

## 🔧 Database Schema Examples

### Core D-Corp Schema
```typescript
// apps/web/src/server/db/schemas/d_corps_schema.ts
export const dCorps = pgTable(
  "d_corps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull().unique(),
    description: text("description"),
    treasuryAddress: text("treasury_address"),
    treasuryValue: decimal("treasury_value", { precision: 18, scale: 6 }).default("0"),
    founderId: uuid("founder_id").references(() => profiles.id).notNull(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    // RLS Policy: Users can only see D-Corps in their workspaces
    pgPolicy("view_d_corps", {
      for: "select",
      to: authenticatedRole,
      using: sql`
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = ${table.workspaceId}
          AND wm.user_id = auth.uid()
          AND wm.deleted_at IS NULL
        )
      `,
    }),
  ]
);
```

### D-Corp Membership Schema
```typescript
// apps/web/src/server/db/schemas/d_corp_members_schema.ts
export const dCorpMembers = pgTable(
  "d_corp_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dCorpId: uuid("d_corp_id").references(() => dCorps.id).notNull(),
    userId: uuid("user_id").references(() => profiles.id).notNull(),
    role: text("role", { enum: ["founder", "admin", "labor", "consumer"] }).notNull(),
    laborPoints: integer("labor_points").default(0),
    usePoints: integer("use_points").default(0),
    totalEarnings: decimal("total_earnings", { precision: 18, scale: 6 }).default("0"),
    joinedAt: timestamp("joined_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    unique("unique_d_corp_member").on(table.dCorpId, table.userId),
    // RLS policies for member access
    pgPolicy("view_d_corp_members", {
      for: "select", 
      to: authenticatedRole,
      using: sql`
        EXISTS (
          SELECT 1 FROM d_corp_members self
          WHERE self.d_corp_id = ${table.dCorpId}
          AND self.user_id = auth.uid()
          AND self.deleted_at IS NULL
        )
      `,
    }),
  ]
);
```

### tRPC Router Example
```typescript
// apps/web/src/server/api/routers/d_corp_router.ts
import { z } from "zod";
import { createTRPCRouter, authenticatedProcedure } from "../trpc";
import { dCorps, dCorpMembers } from "../../db/schemas";
import { TRPCError } from "@trpc/server";

export const dCorpRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      symbol: z.string().min(1).max(10).toUpperCase(),
      description: z.string().optional(),
      distributionConfig: z.object({
        capital: z.number().min(0).max(100),
        labor: z.number().min(0).max(100), 
        consumers: z.number().min(0).max(100),
      }).refine(data => data.capital + data.labor + data.consumers === 100),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create D-Corp with proper workspace association
      const [dCorp] = await ctx.db
        .insert(dCorps)
        .values({
          ...input,
          founderId: ctx.user.id,
          workspaceId: ctx.activeWorkspaceId, // From RBAC context
        })
        .returning();
        
      // Add founder as admin member
      await ctx.db.insert(dCorpMembers).values({
        dCorpId: dCorp.id,
        userId: ctx.user.id,
        role: "founder",
      });
      
      return dCorp;
    }),
    
  getDashboardData: authenticatedProcedure
    .input(z.object({ dCorpId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Fetch D-Corp data with member verification via RLS
      const dCorp = await ctx.db.query.dCorps.findFirst({
        where: eq(dCorps.id, input.dCorpId),
        with: {
          members: true,
          distributions: {
            orderBy: desc(distributions.createdAt),
            limit: 5,
          },
        },
      });
      
      if (!dCorp) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      
      return dCorp;
    }),
});
```

### Distribution Configuration Schema
```typescript
// apps/web/src/server/db/schemas/distributions_schema.ts
export const distributionConfigs = pgTable("distribution_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id").references(() => dCorps.id).notNull(),
  capitalPercentage: integer("capital_percentage").notNull(),
  laborPercentage: integer("labor_percentage").notNull(),
  consumerPercentage: integer("consumer_percentage").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const distributions = pgTable("distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dCorpId: uuid("d_corp_id").references(() => dCorps.id).notNull(),
  quarter: text("quarter").notNull(), // "2024-Q4"
  totalAmount: decimal("total_amount", { precision: 18, scale: 6 }).notNull(),
  capitalAmount: decimal("capital_amount", { precision: 18, scale: 6 }).notNull(),
  laborAmount: decimal("labor_amount", { precision: 18, scale: 6 }).notNull(),
  consumerAmount: decimal("consumer_amount", { precision: 18, scale: 6 }).notNull(),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending"),
  txHash: text("tx_hash"),
  distributedAt: timestamp("distributed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## 🗂️ Core Type Definitions

```typescript
// src/lib/types.ts
export interface User {
  id: string;
  address: string;
  ensName?: string;
  userType: 'CAPITAL' | 'LABOR' | 'CONSUMER';
  joinedAt: string;
  isActive: boolean;
}

export interface DCorp {
  id: string;
  name: string;
  symbol: string;
  description: string;
  foundedAt: string;
  treasuryAddress: string;
  treasuryValue: number;
  distributionConfig: DistributionConfig;
  nextDistributionDate: string;
  totalMembers: number;
  isActive: boolean;
}

export interface DistributionConfig {
  capital: number;  // Percentage (0-100)
  labor: number;    // Percentage (0-100)
  consumers: number; // Percentage (0-100)
}

export interface Points {
  laborPoints: number;
  usePoints: number;
  totalEarned: number;
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🎨 Design System Foundation

### Color Palette
- **Primary:** Blue gradient for main actions
- **Capital:** Red tones for founder/admin features
- **Labor:** Blue tones for contributor features  
- **Consumer:** Green tones for user features
- **Neutral:** Gray scale for backgrounds and text

### Typography Scale
- **Display:** 48px - Hero headings
- **H1:** 36px - Page titles
- **H2:** 30px - Section headers
- **H3:** 24px - Subsection headers
- **Body:** 16px - Main content
- **Small:** 14px - Labels and captions

### Component Standards
- **Buttons:** Consistent padding, hover states, loading spinners
- **Forms:** Validation styling, error states, success feedback
- **Cards:** Consistent shadows, borders, spacing
- **Navigation:** Active states, breadcrumbs, mobile responsive

## 🧪 Testing Strategy

### Unit Testing
- Jest + React Testing Library
- Component behavior testing
- Hook testing with renderHook
- Utility function testing

### Integration Testing
- API service integration
- Form submission workflows
- Navigation and routing

### E2E Testing
- Playwright for critical user journeys
- Cross-browser compatibility
- Mobile responsive testing

## 🚀 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/FE-001-admin-dashboard
git commit -m "feat: add admin dashboard overview tab"
git push origin feature/FE-001-admin-dashboard

# Code review and merge to main
```

### Code Quality Gates
- ESLint rules enforced
- Prettier formatting required
- TypeScript strict mode
- Test coverage > 80%
- Bundle size monitoring

### Performance Standards
- Lighthouse score > 90
- First Contentful Paint < 2s
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1

## 📋 Implementation Tasks

### Initial Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure TailwindCSS with design system
- [ ] Install and configure Shadcn/UI
- [ ] Set up ESLint and Prettier with rules
- [ ] Configure Git hooks with Husky

### Folder Structure
- [ ] Create organized folder structure
- [ ] Set up route groups for user types
- [ ] Configure TypeScript path aliases
- [ ] Create index files for clean imports

### Core Infrastructure
- [ ] Set up global state management with Zustand
- [ ] Configure React Query for data fetching
- [ ] Create error boundary components
- [ ] Set up loading state management
- [ ] Configure environment variables

### Mock Data Services
- [ ] Create mock data types and interfaces
- [ ] Build admin mock service
- [ ] Build labor mock service  
- [ ] Build consumer mock service
- [ ] Add realistic data generation

### Development Tools
- [ ] Configure VS Code settings and extensions
- [ ] Set up package.json scripts
- [ ] Create development documentation
- [ ] Set up local environment guide

## 🔄 Dependencies for Other Tickets

This ticket blocks:
- [FE-001] Founder/Admin Journey
- [FE-002] Labor/Contributor Journey  
- [FE-003] Consumer Journey
- [FE-004] Shared Components

## 📝 Documentation Requirements

- [ ] Project setup README
- [ ] Architecture decision records
- [ ] Component documentation standards
- [ ] API integration guidelines
- [ ] Testing conventions

## ✅ Definition of Done

- [ ] Next.js project running locally
- [ ] All tooling configured and working
- [ ] Folder structure implemented
- [ ] TypeScript types defined
- [ ] Mock services created
- [ ] Documentation complete
- [ ] Code quality gates passing
- [ ] Team can begin parallel development