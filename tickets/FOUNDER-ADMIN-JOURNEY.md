# [FE-001] Founder/Admin User Journey - D-Corp Launch & Management

**Priority:** P0 (Highest)  
**Story Points:** 13  
**Epic:** D-Corp Platform MVP  
**Tags:** `frontend`, `admin`, `onboarding`, `dashboard`, `mvp`

## 📋 Overview

Build the complete founder/admin experience for launching and managing a Distributed Corporation (D-Corp), including the initial setup wizard and comprehensive management dashboard.

## 🎯 User Stories

**As a Founder, I want to:**
- Launch a new D-Corp with custom profit distribution settings
- Attest to removing fiduciary duty and committing to equitable profit sharing
- Configure rewardable actions for labor and consumer stakeholders
- Manage quarterly profit distributions from the treasury
- Review and approve/reject labor attestation submissions
- Monitor D-Corp metrics and member activity

## ✅ Acceptance Criteria

### D-Corp Launch Wizard
- [ ] Multi-step form with validation and state persistence
- [ ] Interactive profit distribution slider (Capital/Labor/Consumer must total 100%)
- [ ] Real-time pie chart visualization of distribution percentages
- [ ] Formation agreement with required attestations
- [ ] Review & confirmation step before launch
- [ ] Success state with next steps guidance

### Admin Dashboard
- [ ] Tabbed interface: Overview, Distributions, Attestation Engine, Members
- [ ] Key metrics cards with live data from mock service
- [ ] Distribution management with amount input and auto-calculated breakdowns
- [ ] Past distributions table with expandable details
- [ ] Action creation form for defining rewardable behaviors
- [ ] Pending attestations queue with approve/reject functionality
- [ ] Searchable members table with filtering by class type

### UI/UX Requirements
- [ ] Responsive design (desktop-first, mobile-compatible)
- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages
- [ ] Consistent design system with hover/focus states
- [ ] Accessibility compliance (WCAG 2.1 AA)

## 🔧 Technical Implementation

### Frontend Routes & Components
```
/apps/web/src/app/(frontend)/a/d-corp/
├── create/
│   ├── page.tsx                     # D-Corp creation wizard
│   └── _components/
│       ├── creation-wizard.tsx      # Multi-step form with React Hook Form
│       ├── step-basics.tsx          # Name, symbol, description
│       ├── step-distribution.tsx    # Profit sharing configuration
│       ├── step-agreement.tsx       # Legal attestations
│       └── step-review.tsx          # Final review & submission
├── [dCorpId]/
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   └── _components/
│   │       ├── dashboard-overview.tsx
│   │       ├── metric-cards.tsx
│   │       └── recent-activity.tsx
│   ├── distributions/
│   │   ├── page.tsx                 # Distribution management
│   │   └── _components/
│   │       ├── distribution-form.tsx
│   │       ├── distribution-history.tsx
│   │       └── distribution-preview.tsx
│   ├── opportunities/
│   │   ├── page.tsx                 # Labor opportunity management
│   │   └── _components/
│   │       ├── opportunity-form.tsx
│   │       ├── opportunities-list.tsx
│   │       └── opportunity-analytics.tsx
│   ├── submissions/
│   │   ├── page.tsx                 # Work submission reviews
│   │   └── _components/
│   │       ├── submissions-queue.tsx
│   │       ├── submission-review.tsx
│   │       └── approval-actions.tsx
│   └── members/
│       ├── page.tsx                 # Member management
│       └── _components/
│           ├── members-table.tsx
│           ├── member-invite.tsx
│           └── role-management.tsx
```

### tRPC Integration
```typescript
// D-Corp creation with form validation
const CreateDCorpForm = () => {
  const createDCorp = api.dCorp.create.useMutation({
    onSuccess: (dCorp) => {
      router.push(`/a/d-corp/${dCorp.id}/dashboard`);
      toast.success('D-Corp created successfully!');
    },
  });
  
  const form = useForm<CreateDCorpInput>({
    resolver: zodResolver(createDCorpSchema),
    defaultValues: {
      distributionConfig: { capital: 20, labor: 40, consumers: 40 }
    },
  });
  
  const onSubmit = (data: CreateDCorpInput) => {
    createDCorp.mutate(data);
  };
};

// Dashboard data fetching
const DashboardOverview = ({ dCorpId }: { dCorpId: string }) => {
  const { data: dashboardData, isLoading } = api.dCorp.getDashboardData.useQuery(
    { dCorpId },
    { refetchInterval: 30000 } // Real-time updates
  );
  
  const { data: pendingSubmissions } = api.labor.getPendingSubmissions.useQuery(
    { dCorpId }
  );
  
  // Component renders dashboard metrics
};

// Submission approval actions
const useSubmissionActions = (dCorpId: string) => {
  const utils = api.useUtils();
  
  const approveSubmission = api.labor.approveSubmission.useMutation({
    onSuccess: () => {
      utils.labor.getPendingSubmissions.invalidate({ dCorpId });
      utils.dCorp.getDashboardData.invalidate({ dCorpId });
    },
  });
  
  const rejectSubmission = api.labor.rejectSubmission.useMutation({
    onSuccess: () => {
      utils.labor.getPendingSubmissions.invalidate({ dCorpId });
    },
  });
  
  return { approveSubmission, rejectSubmission };
};
```
```

### Form Validation Schemas
```typescript
// apps/web/src/lib/validations/d-corp.ts
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
```
```

## 🎨 Design Specifications

### Launch Wizard Flow
1. **Step 1: Basics** - Name, symbol, description inputs
2. **Step 2: Distribution** - Interactive sliders with live preview
3. **Step 3: Agreement** - Legal attestations with checkboxes
4. **Step 4: Review** - Summary with edit links, launch button

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ D-Corp Admin Dashboard                          │
│ [Overview] [Distributions] [Engine] [Members]  │
├─────────────────────────────────────────────────┤
│ Overview Tab:                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │Treasury  │ │Next Dist │ │Members   │         │
│ │$1.2M     │ │Oct 1     │ │342       │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                 │
│ Recent Activity:                                │
│ • Alice submitted labor proof                   │
│ • 15 new consumer claims processed              │
│ • Distribution scheduled for Q4                 │
└─────────────────────────────────────────────────┘
```

## 🧪 Testing Requirements

### Unit Tests
- [ ] LaunchWizard form validation
- [ ] Distribution slider calculations
- [ ] Attestation approval/rejection
- [ ] Members table filtering and search

### Integration Tests
- [ ] Complete wizard flow with mock data
- [ ] Dashboard tab navigation
- [ ] Distribution processing workflow
- [ ] Attestation management workflow

### E2E Tests
- [ ] Full founder onboarding journey
- [ ] Admin daily management tasks
- [ ] Error scenarios and recovery

## 📱 Responsive Breakpoints

- **Desktop:** 1200px+ (primary design)
- **Tablet:** 768px-1199px (adapted layout)
- **Mobile:** 320px-767px (stacked components)

## 🔗 Dependencies

### Frontend
- Next.js 14+ with App Router
- TypeScript for type safety
- TailwindCSS + Shadcn/UI components
- React Hook Form for form management
- Recharts for data visualization
- Framer Motion for animations

### Mock Services
- `/services/mockAdminService.ts` - Admin data operations
- `/services/mockDCorpService.ts` - D-Corp management
- `/hooks/useAdmin.ts` - Admin state management

## 🚀 Definition of Done

- [ ] All components built and tested
- [ ] Mock data integration complete
- [ ] Responsive design implemented
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Accessibility reviewed
- [ ] Code review completed
- [ ] Documentation updated

## 📝 Notes

- Focus on UX polish - this is the founder's first impression
- Ensure distribution math is always accurate and validated
- Consider progressive disclosure for complex features
- Plan for future Web3 integration hooks
- Mock all blockchain interactions with realistic delays

## 🔄 Follow-up Tickets

- [FE-002] Labor/Contributor Portal
- [FE-003] Consumer Portal  
- [FE-004] Web3 Integration Layer
- [FE-005] Advanced Analytics Dashboard