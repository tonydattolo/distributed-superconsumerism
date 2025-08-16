# [FE-002] Labor/Contributor User Journey - Work Submission & Rewards

**Priority:** P0 (Highest)  
**Story Points:** 8  
**Epic:** D-Corp Platform MVP  
**Tags:** `frontend`, `labor`, `trpc`, `drizzle`, `submissions`

## 📋 Overview

Build the complete labor/contributor experience for discovering opportunities, submitting work, and tracking earnings using our Next.js 15 + tRPC + Drizzle stack.

## 🎯 User Stories

**As a Labor/Contributor, I want to:**
- Submit proof-of-work for admin review and earn LaborPoints
- View available work opportunities with clear point values
- Track my contribution history and earnings
- See my LaborPoints balance and estimated distribution value
- Receive clear feedback on submitted work (approved/rejected)
- Monitor my standing within the D-Corp community

## ✅ Acceptance Criteria

### Work Submission Portal
- [ ] tRPC-powered submission form with Zod validation
- [ ] File upload integration with secure storage
- [ ] Link validation for external proof (GitHub, documents, etc.)
- [ ] Opportunity selection from active D-Corp opportunities
- [ ] Draft auto-saving using React Hook Form
- [ ] Real-time submission status tracking with tRPC subscriptions

### Available Opportunities
- [ ] tRPC query for active opportunities with pagination
- [ ] Server-side filtering by category, points, difficulty
- [ ] Real-time opportunity updates
- [ ] Optimistic UI for quick applications
- [ ] Detailed opportunity view with requirements

### Personal Dashboard
- [ ] Real-time LaborPoints balance from database
- [ ] Contribution history with status indicators
- [ ] Earnings calculations based on live distribution data
- [ ] Analytics from tRPC aggregation queries
- [ ] Real-time notifications using tRPC subscriptions

### UI/UX Requirements
- [ ] Mobile-first responsive design
- [ ] Intuitive submission workflow
- [ ] Progress indicators for multi-step processes
- [ ] Inline validation with helpful error messages
- [ ] Accessible design with screen reader support

## 🔧 Technical Implementation

### Frontend Routes & Components
```
/apps/web/src/app/(frontend)/a/labor/
├── dashboard/
│   ├── page.tsx                     # Labor dashboard overview
│   └── _components/
│       ├── points-overview.tsx      # LaborPoints balance & trends
│       ├── earnings-projection.tsx  # Estimated distribution payouts
│       ├── recent-submissions.tsx   # Latest work submissions
│       └── performance-metrics.tsx  # Analytics & achievements
├── opportunities/
│   ├── page.tsx                     # Browse available work
│   ├── [opportunityId]/
│   │   └── page.tsx                 # Detailed opportunity view
│   └── _components/
│       ├── opportunities-grid.tsx   # Paginated opportunity list
│       ├── opportunity-card.tsx     # Individual opportunity display
│       ├── opportunity-filters.tsx  # Search & filter controls
│       └── apply-modal.tsx          # Quick application modal
├── submissions/
│   ├── new/
│   │   └── page.tsx                 # Submit new work
│   ├── [submissionId]/
│   │   └── page.tsx                 # View submission details
│   ├── page.tsx                     # Submissions history
│   └── _components/
│       ├── submission-form.tsx      # Work submission form
│       ├── file-upload.tsx          # Artifact upload component
│       ├── submissions-table.tsx    # History table with status
│       └── status-badge.tsx         # Submission status indicator
└── earnings/
    ├── page.tsx                     # Earnings tracking & history
    └── _components/
        ├── earnings-chart.tsx       # Historical earnings visualization
        ├── distribution-history.tsx # Past profit distributions
        └── points-breakdown.tsx     # LaborPoints source analysis
```

### tRPC Integration Examples
```typescript
// Opportunities discovery
const OpportunitiesPage = () => {
  const [filters, setFilters] = useState({ category: 'all', difficulty: 'all' });
  
  const { data: opportunities, isLoading } = api.labor.getOpportunities.useQuery(
    { filters, limit: 20 },
    { refetchInterval: 60000 } // Refresh for new opportunities
  );
  
  const applyToOpportunity = api.labor.applyToOpportunity.useMutation({
    onSuccess: () => {
      toast.success('Applied successfully!');
      router.push('/a/labor/submissions');
    },
  });
};

// Work submission with file upload
const SubmissionForm = ({ opportunityId }: { opportunityId: string }) => {
  const submitWork = api.labor.submitWork.useMutation();
  const uploadFile = api.files.upload.useMutation();
  
  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
  });
  
  const onSubmit = async (data: SubmissionInput) => {
    // Upload files first if any
    const fileUrls = await Promise.all(
      data.files.map(file => uploadFile.mutateAsync({ file }))
    );
    
    await submitWork.mutateAsync({
      opportunityId,
      ...data,
      attachments: fileUrls,
    });
  };
};

// Real-time dashboard data
const LaborDashboard = () => {
  const { data: profile } = api.labor.getProfile.useQuery();
  const { data: recentSubmissions } = api.labor.getRecentSubmissions.useQuery();
  const { data: earnings } = api.labor.getEarningsProjection.useQuery();
  
  // Subscription for real-time point updates
  api.labor.onPointsUpdate.useSubscription(undefined, {
    onData: (pointsUpdate) => {
      // Update UI with new points
      toast.success(`+${pointsUpdate.points} LaborPoints earned!`);
    },
  });
};
```
```

### Form Validation Schemas
```typescript
// apps/web/src/lib/validations/labor.ts
import { z } from "zod";

export const submissionSchema = z.object({
  opportunityId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(10, "Please provide a detailed description"),
  proofLinks: z.array(z.string().url()).min(1, "At least one proof link is required"),
  estimatedHours: z.number().min(0.1).max(100),
  notes: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const opportunityFilterSchema = z.object({
  category: z.enum(["development", "design", "content", "marketing", "other", "all"]).default("all"),
  difficulty: z.enum(["easy", "medium", "hard", "all"]).default("all"),
  minPoints: z.number().min(0).optional(),
  maxPoints: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  isRemote: z.boolean().optional(),
  deadline: z.date().optional(),
});

export type OpportunityFilters = z.infer<typeof opportunityFilterSchema>;

export const applyToOpportunitySchema = z.object({
  opportunityId: z.string().uuid(),
  coverLetter: z.string().min(50, "Please write a brief cover letter"),
  estimatedCompletion: z.date().min(new Date(), "Completion date must be in the future"),
  proposedApproach: z.string().optional(),
});

export type ApplyToOpportunityInput = z.infer<typeof applyToOpportunitySchema>;
```
```

## 🎨 Design Specifications

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ Labor Portal - alice.eth                  🔔 3  │
├─────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐              │
│ │ LaborPoints  │ │ Est. Earnings│              │
│ │    2,450     │ │   $1,225.50  │              │
│ │    ↗ +200    │ │    ↗ +18%    │              │
│ └──────────────┘ └──────────────┘              │
│                                                 │
│ [Submit Work] [Browse Opportunities] [History] │
│                                                 │
│ Recent Submissions:                             │
│ ○ Auth Bug Fix - Under Review (2 days ago)     │
│ ✓ API Docs Update - Approved (+150 pts)        │
│ ○ UI Component - Draft                          │
└─────────────────────────────────────────────────┘
```

### Submission Form Flow
1. **Category Selection** - Choose work type from D-Corp opportunities
2. **Work Details** - Title, description, proof links
3. **File Upload** - Supporting documents/artifacts
4. **Review & Submit** - Final confirmation before submission

### Opportunities Browser
```
┌─────────────────────────────────────────────────┐
│ Available Opportunities          [Filters ▼]   │
├─────────────────────────────────────────────────┤
│ 🔧 Fix Authentication Bug              200 pts │
│ Medium • ~4 hours • Deadline: Aug 25           │
│ React, TypeScript, Mobile Testing              │
│                               [Apply] [Details]│
├─────────────────────────────────────────────────┤
│ 📝 Write API Documentation             150 pts │
│ Easy • ~6 hours • Deadline: Aug 30             │
│ Technical Writing, API Knowledge               │
│                               [Apply] [Details]│
└─────────────────────────────────────────────────┘
```

## 🧪 Testing Requirements

### Unit Tests
- [ ] Submission form validation
- [ ] Points calculations
- [ ] File upload handling
- [ ] Opportunity filtering

### Integration Tests
- [ ] Complete submission workflow
- [ ] Opportunity application process
- [ ] History and status tracking
- [ ] Notification system

### E2E Tests
- [ ] Full contributor journey
- [ ] Error handling scenarios
- [ ] Mobile responsive behavior

## 📱 Mobile-First Design

### Breakpoints
- **Mobile:** 320px-767px (primary design)
- **Tablet:** 768px-1023px (enhanced layout)
- **Desktop:** 1024px+ (expanded features)

### Mobile Optimizations
- Touch-friendly buttons (44px minimum)
- Simplified navigation with bottom tabs
- Optimized file upload for mobile cameras
- Swipe gestures for browsing opportunities

## 🔗 Dependencies

### Frontend
- React Native Web for mobile-like interactions
- React Hook Form with Zod validation
- TanStack Query for data fetching
- Framer Motion for micro-interactions
- React Dropzone for file uploads

### Mock Services
- `/services/mockLaborService.ts` - Labor operations
- `/services/mockOpportunitiesService.ts` - Available work
- `/hooks/useLabor.ts` - Labor state management

## 🚀 Definition of Done

- [ ] All components built and responsive
- [ ] Mock data integration complete
- [ ] File upload functionality working
- [ ] Form validation implemented
- [ ] Loading and error states handled
- [ ] Mobile optimizations complete
- [ ] Accessibility audit passed
- [ ] Performance optimized (< 3s load)

## 🎯 Success Metrics

- Time to complete first submission < 5 minutes
- Form completion rate > 85%
- Mobile usability score > 90%
- User satisfaction with proof submission process

## 📝 Implementation Notes

### Progressive Web App Features
- Offline capability for drafts
- Push notifications for status updates
- Home screen installation prompt
- Camera integration for proof photos

### Gamification Elements
- Contribution streaks
- Achievement badges
- Leaderboards (optional)
- Progress towards next contribution level

### Future Enhancements
- AI-powered work matching
- Collaborative opportunities
- Skill verification system
- Mentorship programs

## 🔄 Follow-up Tickets

- [FE-003] Consumer Portal
- [FE-007] Advanced Labor Analytics
- [FE-008] Collaborative Work Features
- [FE-009] Mobile App Development