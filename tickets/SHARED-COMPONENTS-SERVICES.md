# [FE-004] Shared Components & UI Library

**Priority:** P1 (High)  
**Story Points:** 5  
**Epic:** D-Corp Platform MVP  
**Tags:** `components`, `shadcn`, `shared`, `ui`, `reusable`

## 📋 Overview

Build D-Corp-specific shared components on top of our existing shadcn/ui foundation, focusing on domain-specific components that will be reused across all user journeys (Admin, Labor, Consumer).

## 🎯 Goals

- Extend shadcn/ui with D-Corp-specific components
- Create domain-specific UI patterns for points, earnings, distributions
- Build reusable form components with proper validation
- Establish consistent data visualization components
- Enable rapid feature development with pre-built D-Corp components
- Maintain design system consistency across all user types

## ✅ Acceptance Criteria

### D-Corp Specific Components
- [ ] Points display components (LaborPoints, UsePoints)
- [ ] Distribution visualization components
- [ ] Earnings projection displays
- [ ] Status indicators for submissions/claims
- [ ] D-Corp branding and theming components
- [ ] Role-based UI components

### Enhanced Form Components
- [ ] File upload with progress indicators
- [ ] Multi-step form wizard components
- [ ] Validation feedback components
- [ ] Auto-save form components
- [ ] Date/time picker components

### Data Display Components
- [ ] Charts for earnings and analytics
- [ ] Tables with sorting and filtering
- [ ] Timeline components for history
- [ ] Progress indicators and metrics
- [ ] Responsive cards and layouts

## 🧩 D-Corp Component Library

### Domain-Specific Components
```
/apps/web/src/components/
├── ui/                          # shadcn/ui base components (already exists)
├── d-corp/                       # D-Corp specific components
│   ├── points/
│   │   ├── points-display.tsx        # LaborPoints/UsePoints display
│   │   ├── points-animation.tsx      # Points earning animations
│   │   ├── points-chart.tsx          # Points history visualization
│   │   └── points-breakdown.tsx      # Points source breakdown
│   ├── distribution/
│   │   ├── distribution-pie.tsx      # C/L/U distribution chart
│   │   ├── distribution-slider.tsx   # Interactive percentage sliders
│   │   ├── earnings-projection.tsx   # Estimated earnings display
│   │   └── payout-history.tsx        # Past distribution history
│   ├── status/
│   │   ├── submission-status.tsx     # Work submission status
│   │   ├── claim-status.tsx          # Reward claim status
│   │   ├── approval-actions.tsx      # Approve/reject buttons
│   │   └── status-timeline.tsx       # Status change timeline
│   ├── forms/
│   │   ├── wizard-form.tsx           # Multi-step form wrapper
│   │   ├── file-upload.tsx           # Enhanced file upload
│   │   ├── auto-save-form.tsx        # Auto-saving form wrapper
│   │   ├── proof-submission.tsx      # Proof upload component
│   │   └── validation-feedback.tsx   # Enhanced validation display
│   ├── layout/
│   │   ├── role-header.tsx           # Role-specific header
│   │   ├── metric-card.tsx           # Dashboard metric cards
│   │   ├── activity-feed.tsx         # Recent activity display
│   │   └── empty-state.tsx           # Empty state illustrations
│   └── analytics/
│       ├── trend-chart.tsx           # Trend visualization
│       ├── comparison-chart.tsx      # Period comparisons
│       ├── progress-ring.tsx         # Circular progress
│       └── stats-grid.tsx            # Statistics grid layout
└── providers/                    # Context providers
    ├── d-corp-provider.tsx       # D-Corp context
    ├── points-provider.tsx       # Points tracking context
    └── notifications-provider.tsx # Real-time notifications
```

### Utility & Helper Components
```
/apps/web/src/lib/
├── utils/
│   ├── format-points.ts          # Points formatting utilities
│   ├── format-currency.ts        # Currency display helpers
│   ├── calculate-distribution.ts # Distribution math
│   ├── date-helpers.ts           # Date formatting
│   └── color-helpers.ts          # Role-based color scheme
├── hooks/
│   ├── use-d-corp.ts             # D-Corp data hooks
│   ├── use-points.ts             # Points tracking hooks
│   ├── use-earnings.ts           # Earnings calculations
│   ├── use-auto-save.ts          # Auto-save form hook
│   └── use-real-time.ts          # tRPC subscription hooks
├── constants/
│   ├── roles.ts                  # User role definitions
│   ├── points.ts                 # Points system constants
│   ├── colors.ts                 # D-Corp color palette
│   └── permissions.ts            # Permission constants
└── validations/
    ├── d-corp.ts                 # D-Corp validation schemas
    ├── labor.ts                  # Labor validation schemas
    ├── consumer.ts               # Consumer validation schemas
    └── shared.ts                 # Shared validation utilities
```

## 🔧 Component Implementation Examples

### Points Display Component
```typescript
// /apps/web/src/components/d-corp/points/points-display.tsx
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PointsDisplayProps {
  type: "labor" | "consumer";
  current: number;
  change?: {
    value: number;
    period: string;
  };
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
  className?: string;
}

export function PointsDisplay({
  type,
  current,
  change,
  size = "md",
  showAnimation = false,
  className,
}: PointsDisplayProps) {
  const colorScheme = {
    labor: "text-blue-600 bg-blue-50 border-blue-200",
    consumer: "text-green-600 bg-green-50 border-green-200",
  };
  
  const formatPoints = (points: number) => {
    return new Intl.NumberFormat().format(points);
  };
  
  return (
    <Card className={cn("border-2", colorScheme[type], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {type === "labor" ? "LaborPoints" : "UsePoints"}
            </p>
            <p className={cn(
              "font-bold",
              size === "sm" && "text-lg",
              size === "md" && "text-2xl", 
              size === "lg" && "text-3xl"
            )}>
              {formatPoints(current)}
            </p>
          </div>
          {change && (
            <Badge variant={change.value >= 0 ? "default" : "destructive"}>
              {change.value >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change.value)} {change.period}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```
```

### Distribution Slider Component
```typescript
// /apps/web/src/components/d-corp/distribution/distribution-slider.tsx
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface DistributionSliderProps {
  initialDistribution?: {
    capital: number;
    labor: number;
    consumers: number;
  };
  onChange: (distribution: { capital: number; labor: number; consumers: number }) => void;
  disabled?: boolean;
}

export function DistributionSlider({
  initialDistribution = { capital: 20, labor: 40, consumers: 40 },
  onChange,
  disabled = false,
}: DistributionSliderProps) {
  const [distribution, setDistribution] = useState(initialDistribution);
  
  const COLORS = {
    capital: "#ef4444",
    labor: "#3b82f6", 
    consumers: "#10b981",
  };
  
  const handleSliderChange = (key: keyof typeof distribution, value: number[]) => {
    const newValue = value[0];
    const remaining = 100 - newValue;
    const otherKeys = Object.keys(distribution).filter(k => k !== key) as Array<keyof typeof distribution>;
    
    // Proportionally adjust other values
    const currentOthersTotal = otherKeys.reduce((sum, k) => sum + distribution[k], 0);
    const newDistribution = { ...distribution, [key]: newValue };
    
    if (currentOthersTotal > 0) {
      otherKeys.forEach(k => {
        newDistribution[k] = Math.round((distribution[k] / currentOthersTotal) * remaining);
      });
    }
    
    setDistribution(newDistribution);
    onChange(newDistribution);
  };
  
  const pieData = [
    { name: "Capital", value: distribution.capital, color: COLORS.capital },
    { name: "Labor", value: distribution.labor, color: COLORS.labor },
    { name: "Consumers", value: distribution.consumers, color: COLORS.consumers },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Distribution Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(distribution).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium capitalize">
                    {key} ({value}%)
                  </label>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(val) => handleSliderChange(key as keyof typeof distribution, val)}
                  max={100}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```
```

## 🎨 Component Specifications

### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

// Usage examples:
<Button variant="primary" size="lg" loading={isSubmitting}>
  Launch D-Corp
</Button>

<Button variant="secondary" icon={<PlusIcon />} iconPosition="left">
  Add Action
</Button>
```

### Form Components
```typescript
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  helpText?: string;
  error?: string;
}

interface FormSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  showValue?: boolean;
}
```

### Data Display Components
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

interface PointsDisplayProps {
  points: number;
  type: 'labor' | 'consumer';
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

## 🧪 Testing Strategy

### Component Testing
- Jest + React Testing Library for all components
- Storybook for visual component documentation
- Accessibility testing with axe-core
- Responsive design testing

### Service Testing
- Mock service behavior testing
- Error handling scenarios
- State management testing
- Performance testing

### Integration Testing
- Component + service integration
- Form submission workflows
- Error boundary testing

## 📱 Responsive Design Standards

### Breakpoint System
```css
/* Mobile First Approach */
.component {
  /* Mobile: 320px - 767px */
  padding: 1rem;
}

@media (min-width: 768px) {
  /* Tablet: 768px - 1023px */
  .component {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop: 1024px+ */
  .component {
    padding: 2rem;
  }
}
```

### Touch Targets
- Minimum 44px x 44px for interactive elements
- Adequate spacing between touch targets
- Swipe gestures for mobile interactions

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
- Color contrast ratios ≥ 4.5:1
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure

### Implementation Requirements
```typescript
// Example accessible button
<button
  type="button"
  aria-label="Launch D-Corp"
  aria-describedby="launch-help-text"
  disabled={isLoading}
  className="focus:ring-2 focus:ring-primary-500"
>
  {isLoading ? <Spinner aria-hidden="true" /> : 'Launch'}
</button>
```

## 🚀 Performance Standards

### Bundle Optimization
- Tree shaking for unused code
- Code splitting for components
- Lazy loading for heavy components
- Dynamic imports for routes

### Runtime Performance
- React.memo for expensive components
- useMemo/useCallback for expensive calculations
- Virtualization for large lists
- Image optimization and lazy loading

## 📋 Implementation Tasks

### Phase 1: Base Components
- [ ] Create Button component with all variants
- [ ] Build Input components (text, select, file upload)
- [ ] Implement Modal and Dialog components
- [ ] Create Card components for data display
- [ ] Build Table components with sorting/filtering

### Phase 2: Data Components
- [ ] Chart components using Recharts
- [ ] Progress indicators and loading states
- [ ] Status badges and indicators
- [ ] Points display components
- [ ] Currency formatting components

### Phase 3: Layout Components
- [ ] Navigation components (tabs, breadcrumbs)
- [ ] Page layout containers
- [ ] Header and footer components
- [ ] Sidebar navigation
- [ ] Mobile-responsive layouts

### Phase 4: Services
- [ ] Mock data services for all entities
- [ ] API service base classes
- [ ] Error handling service
- [ ] Notification service
- [ ] Local storage utilities

### Phase 5: Advanced Features
- [ ] Form validation with Zod
- [ ] Animation components with Framer Motion
- [ ] Web3 integration stubs
- [ ] Accessibility improvements
- [ ] Performance optimizations

## 🔄 Dependencies

### Blocks These Tickets:
- [FE-001] Founder/Admin Journey
- [FE-002] Labor/Contributor Journey
- [FE-003] Consumer Journey

### Depends On:
- [FE-000] Project Setup & Architecture

## 📚 Documentation Requirements

- [ ] Component documentation with examples
- [ ] Storybook stories for all components
- [ ] Service usage guidelines
- [ ] Testing patterns and examples
- [ ] Accessibility guidelines

## ✅ Definition of Done

- [ ] All base components implemented and tested
- [ ] Service layer complete with mock data
- [ ] Storybook documentation published
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Mobile responsive design verified
- [ ] Unit tests coverage > 90%
- [ ] Integration tests for critical paths

## 🔄 Follow-up Tickets

- [FE-014] Advanced Component Library
- [FE-015] Animation System
- [FE-016] Accessibility Enhancements
- [FE-017] Performance Optimization