# [FE-003] Consumer User Journey - Consumption Rewards & Claims

**Priority:** P0 (Highest)  
**Story Points:** 6  
**Epic:** D-Corp Platform MVP  
**Tags:** `frontend`, `consumer`, `rewards`, `trpc`, `gamification`

## 📋 Overview

Build the consumer experience for discovering rewards, claiming UsePoints, and tracking earnings using our Next.js 15 + tRPC + Drizzle stack with gamification features.

## 🎯 User Stories

**As a Consumer, I want to:**
- Discover and claim rewards for consumption activities
- Easily verify my consumption through simple proof mechanisms
- Track my UsePoints balance and earning history
- Understand how my consumption contributes to profit sharing
- See available ways to earn more UsePoints
- Monitor my estimated quarterly distribution value

## ✅ Acceptance Criteria

### Rewards Discovery
- [ ] tRPC-powered rewards marketplace with real-time updates
- [ ] Server-side filtering and search capabilities
- [ ] Live countdown timers for time-sensitive rewards
- [ ] Detailed reward instructions with proof requirements
- [ ] Dynamic reward availability based on user eligibility

### Claims System
- [ ] Optimistic UI for instant claim feedback
- [ ] File upload with secure proof storage
- [ ] QR code scanning with camera integration
- [ ] Receipt OCR processing (future integration point)
- [ ] Social media proof validation

### Consumer Dashboard
- [ ] Real-time UsePoints balance from database
- [ ] Claims history with live status updates
- [ ] Dynamic earnings projections from distribution calculations
- [ ] Achievement system with database-backed progress
- [ ] Streak tracking with automated notifications

### Gamification Elements
- [ ] Dynamic challenges generated from tRPC procedures
- [ ] Real-time progress tracking with tRPC subscriptions
- [ ] Privacy-respecting leaderboards with opt-in
- [ ] Achievement unlock animations and notifications
- [ ] Referral tracking with unique codes and attribution

## 🔧 Technical Implementation

### Frontend Routes & Components
```
/apps/web/src/app/(frontend)/a/consumer/
├── dashboard/
│   ├── page.tsx                     # Consumer dashboard overview
│   └── _components/
│       ├── points-summary.tsx       # UsePoints balance & trends
│       ├── earnings-projection.tsx  # Estimated quarterly payouts
│       ├── active-challenges.tsx    # Current challenges progress
│       ├── streak-tracker.tsx       # Consumption streak display
│       └── achievement-showcase.tsx # Recent achievements
├── rewards/
│   ├── page.tsx                     # Rewards marketplace
│   ├── [rewardId]/
│   │   └── page.tsx                 # Detailed reward view
│   └── _components/
│       ├── rewards-grid.tsx         # Paginated rewards list
│       ├── reward-card.tsx          # Individual reward display
│       ├── reward-filters.tsx       # Search & filter controls
│       ├── featured-rewards.tsx     # Highlighted opportunities
│       └── claim-modal.tsx          # Claim process modal
├── claims/
│   ├── new/
│   │   └── page.tsx                 # Submit new claim
│   ├── [claimId]/
│   │   └── page.tsx                 # View claim details
│   ├── page.tsx                     # Claims history
│   └── _components/
│       ├── claim-form.tsx           # Proof submission form
│       ├── proof-upload.tsx         # File/image upload
│       ├── qr-scanner.tsx           # QR code scanning
│       ├── claims-table.tsx         # History with status
│       └── social-proof.tsx         # Social media integration
├── challenges/
│   ├── page.tsx                     # Active & completed challenges
│   ├── [challengeId]/
│   │   └── page.tsx                 # Challenge details & progress
│   └── _components/
│       ├── challenges-grid.tsx      # Challenge list
│       ├── challenge-card.tsx       # Individual challenge
│       ├── progress-tracker.tsx     # Challenge progress
│       └── completion-modal.tsx     # Challenge completion
└── achievements/
    ├── page.tsx                     # Achievements gallery
    └── _components/
        ├── achievements-grid.tsx    # All achievements
        ├── achievement-card.tsx     # Individual achievement
        ├── progress-badge.tsx       # Progress indicator
        └── unlock-animation.tsx     # Achievement unlock
```

### tRPC Integration Examples
```typescript
// Rewards marketplace with real-time updates
const RewardsMarketplace = () => {
  const [filters, setFilters] = useState({ category: 'all', difficulty: 'all' });
  
  const { data: rewards, isLoading } = api.consumer.getRewards.useQuery(
    { filters, limit: 20 },
    { refetchInterval: 30000 } // Regular updates for new rewards
  );
  
  const claimReward = api.consumer.claimReward.useMutation({
    onSuccess: (result) => {
      toast.success(`+${result.pointsAwarded} UsePoints earned!`);
      // Optimistic UI update
    },
  });
  
  // Real-time reward availability updates
  api.consumer.onRewardUpdate.useSubscription(undefined, {
    onData: (update) => {
      // Update available rewards list
    },
  });
};

// Claim submission with proof upload
const ClaimRewardForm = ({ rewardId }: { rewardId: string }) => {
  const submitClaim = api.consumer.submitClaim.useMutation();
  const uploadProof = api.files.upload.useMutation();
  
  const form = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
  });
  
  const onSubmit = async (data: ClaimInput) => {
    // Upload proof files if any
    const proofUrls = await Promise.all(
      data.proofFiles.map(file => uploadProof.mutateAsync({ file }))
    );
    
    await submitClaim.mutateAsync({
      rewardId,
      ...data,
      proofUrls,
    });
  };
};

// Consumer dashboard with live data
const ConsumerDashboard = () => {
  const { data: profile } = api.consumer.getProfile.useQuery();
  const { data: activeChallenges } = api.consumer.getActiveChallenges.useQuery();
  const { data: earnings } = api.consumer.getEarningsProjection.useQuery();
  
  // Real-time points updates
  api.consumer.onPointsUpdate.useSubscription(undefined, {
    onData: (pointsUpdate) => {
      // Show points earned animation
      showPointsAnimation(pointsUpdate.points);
    },
  });
  
  // Challenge completion notifications
  api.consumer.onChallengeComplete.useSubscription(undefined, {
    onData: (challenge) => {
      showAchievementModal(challenge);
    },
  });
};
```
```

### Form Validation Schemas
```typescript
// apps/web/src/lib/validations/consumer.ts
import { z } from "zod";

export const claimSchema = z.object({
  rewardId: z.string().uuid(),
  proofDescription: z.string().min(10, "Please describe your proof"),
  proofLinks: z.array(z.string().url()).optional(),
  proofFiles: z.array(z.instanceof(File)).optional(),
  socialProof: z.object({
    platform: z.enum(["twitter", "instagram", "facebook", "linkedin"]).optional(),
    postUrl: z.string().url().optional(),
    screenshot: z.instanceof(File).optional(),
  }).optional(),
}).refine(
  (data) => data.proofLinks?.length || data.proofFiles?.length || data.socialProof,
  { message: "At least one form of proof is required" }
);

export type ClaimInput = z.infer<typeof claimSchema>;

export const rewardFilterSchema = z.object({
  category: z.enum(["purchase", "review", "referral", "social", "engagement", "all"]).default("all"),
  difficulty: z.enum(["easy", "medium", "hard", "all"]).default("all"),
  minPoints: z.number().min(0).optional(),
  maxPoints: z.number().min(0).optional(),
  timeToComplete: z.enum(["quick", "medium", "long", "all"]).default("all"),
  availableOnly: z.boolean().default(true),
});

export type RewardFilters = z.infer<typeof rewardFilterSchema>;

export const challengeJoinSchema = z.object({
  challengeId: z.string().uuid(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    publicProgress: z.boolean().default(false),
  }).optional(),
});

export type ChallengeJoinInput = z.infer<typeof challengeJoinSchema>;

export const referralSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  personalMessage: z.string().max(500).optional(),
});

export type ReferralInput = z.infer<typeof referralSchema>;
```
```

## 🎨 Design Specifications

### Consumer Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ Consumer Portal - bob.eth              🔥 7 day │
├─────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐              │
│ │ UsePoints    │ │ Est. Payout  │              │
│ │    1,850     │ │   $185.50    │              │
│ │   Silver ⭐   │ │    Q4 2024   │              │
│ └──────────────┘ └──────────────┘              │
│                                                 │
│ [Claim Rewards] [Challenges] [History]         │
│                                                 │
│ Featured Rewards:                               │
│ 🛒 Premium Subscription (+500 pts) [Claim]     │
│ ⭐ Write Review (+50 pts) [Quick Claim]         │
│ 👥 Refer Friend (+200 pts) ⏰ 15 days left     │
│                                                 │
│ Active Challenges:                              │
│ Weekly Explorer: ▓▓▓░░ 2/3 complete            │
└─────────────────────────────────────────────────┘
```

### Rewards Marketplace
```
┌─────────────────────────────────────────────────┐
│ Rewards Marketplace      [All ▼] [Points ▼]    │
├─────────────────────────────────────────────────┤
│ 🛒 PURCHASE                              500 pts│
│ Premium Subscription                            │
│ Subscribe for enhanced features                 │
│ ⏱ ~2 min • 📄 Receipt required     [Claim Now] │
├─────────────────────────────────────────────────┤
│ ⭐ REVIEW                                50 pts │
│ Write Product Review                           │
│ Share your experience                          │
│ ⏱ ~5 min • 🔗 Link required       [Quick Claim]│
├─────────────────────────────────────────────────┤
│ 👥 REFERRAL                              200 pts│
│ Refer a Friend                         ⏰ 15d  │
│ Invite friends to join                         │
│ ⏱ ~10 min • 🤖 Automatic              [Invite] │
└─────────────────────────────────────────────────┘
```

### Claim Flow
1. **Select Reward** - Choose from marketplace or featured list
2. **Provide Proof** - Upload receipt, paste link, or scan QR
3. **Confirmation** - Review claim details before submission
4. **Success** - Points awarded with celebration animation

## 🧪 Testing Requirements

### Unit Tests
- [ ] Reward claiming logic
- [ ] Points calculations
- [ ] Proof validation
- [ ] Challenge progress tracking

### Integration Tests
- [ ] Complete claim workflow
- [ ] QR code scanning
- [ ] Social sharing integration
- [ ] Challenge completion detection

### E2E Tests
- [ ] Full consumer journey
- [ ] Multi-device synchronization
- [ ] Offline behavior
- [ ] Performance under load

## 📱 Mobile Optimization

### Progressive Web App Features
- Camera integration for QR scanning
- Offline claim drafts
- Push notifications for new rewards
- GPS integration for location-based rewards

### Mobile-Specific Features
- One-handed operation design
- Swipe gestures for browsing
- Haptic feedback for claims
- Apple Pay/Google Pay integration

## 🎮 Gamification Strategy

### Achievement System
- **First Steps:** Complete first claim
- **Consistent Consumer:** 7-day claiming streak
- **Social Star:** Share 10 reviews
- **Premium Member:** Subscribe to premium
- **Community Builder:** Refer 5 friends

### Progress Visualization
- Animated point counters
- Level progression bars
- Streak fire indicators
- Milestone celebrations

### Social Features
- Optional leaderboard participation
- Achievement sharing
- Friend challenges
- Community milestones

## 🔗 Dependencies

### Frontend
- React Native Elements for mobile-first design
- Framer Motion for celebration animations
- React QR Scanner for QR code functionality
- React Social Share for social integration
- React Intersection Observer for scroll animations

### External APIs (Mocked)
- Social media sharing APIs
- QR code generation service
- Receipt OCR service
- Location services

## 🚀 Definition of Done

- [ ] All reward types claimable
- [ ] QR scanning functionality working
- [ ] Social sharing integrated
- [ ] Challenge system operational
- [ ] Achievement system implemented
- [ ] Mobile optimizations complete
- [ ] Offline functionality working
- [ ] Performance targets met

## 🎯 Success Metrics

- Claim completion rate > 90%
- Average time to claim < 2 minutes
- Daily active consumers > 60%
- Challenge participation rate > 40%
- User satisfaction score > 4.5/5

## 📝 Implementation Notes

### Security Considerations
- Proof validation to prevent fraud
- Rate limiting on claims
- Duplicate detection
- User verification for high-value claims

### Performance Optimizations
- Image compression for proof uploads
- Lazy loading for reward lists
- Caching of user achievements
- Optimistic UI updates

### Accessibility Features
- Screen reader support
- High contrast mode
- Large text options
- Voice commands for claims

## 🔄 Follow-up Tickets

- [FE-010] Advanced Consumer Analytics
- [FE-011] Social Features & Community
- [FE-012] Location-Based Rewards
- [FE-013] Consumer Mobile App