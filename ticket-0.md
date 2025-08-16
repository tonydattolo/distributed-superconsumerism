Of course. Here is the single, comprehensive, end-to-end ticket that combines all requirements for the D-Corp platform frontend. This "uber-ticket" covers the founder's launch process, the admin's management dashboard, and the portals for labor and consumers to submit and claim proofs.

---

### **[FE] Build Unified D-Corp Platform (Admin, Labor & Consumer Portals)**

**Project:** D-Corp Initiative
**Priority:** Highest
**Tags:** `Frontend`, `MVP`, `UI/UX`, `Attestation`

### 1. Overview & Goal

This ticket specifies the complete, end-to-end development of the D-Corp platform's frontend UI, built first with **dummy data**. The goal is to create a fully-functional and intuitive interface that supports the entire lifecycle and all key user journeys of a Distributed Corporation:
1.  **Founder/Admin Journey:** Launching, configuring, and managing a D-Corp, including its profit distribution and attestation engine.
2.  **Labor/Contributor Journey:** Submitting "proof-of-labor" to earn `LaborPoints`.
3.  **Consumer/User Journey:** Claiming "proof-of-consumption" to earn `UsePoints`.

This approach allows for rapid, parallel development and user experience validation before any web3 contracts are integrated.

### 2. User Stories

*   **As a Founder,** I want to easily launch a new Distributed Corporation, encoding its constitution and C/L/U profit-sharing model from day one.
*   **As a Founder,** I want to attest to a new corporate structure that removes fiduciary duty and commits to programmatic profit distribution.
*   **As a D-Corp Administrator,** I want to define specific, rewardable actions for both laborers and consumers to incentivize value creation.
*   **As a D-Corp Administrator,** I want a clear dashboard to view my treasury's value, manage quarterly profit distributions, and review pending attestations.
*   **As a Contributor (Labor),** I want to submit proof of my work (e.g., a link to a GitHub commit) to an admin for attestation so I can earn `LaborPoints`.
*   **As a Consumer (User),** I want to easily claim rewards for my consumption (e.g., making a purchase, leaving a review) so I can earn `UsePoints` and a share of the profits.
*   **As any Stakeholder,** I want to view a history of my earned points and the D-Corp's past distributions to verify the system's fairness and transparency.

### 3. Acceptance Criteria

*   The entire application, including all three user journeys (Admin, Labor, Consumer), is built and fully functional using mock data objects.
*   A user can complete the entire "Launch a D-Corp" flow.
*   An admin can manage distributions, define rewardable actions, and approve/reject labor attestations from the dashboard.
*   A user can submit proof of labor and claim proof of consumption from their portal.
*   All interactive elements have clear states (default, hover, disabled, success/error).
*   The application is responsive and usable on modern desktop browsers.
*   All web3 functionality (wallet connections, contract calls) is stubbed out with placeholder functions.

### 4. UI/UX Wireframe Concepts

#### **Global Layout**

*   A persistent top navigation bar with the App Logo, navigation links (`Dashboard`, `My Portal`), and a placeholder for a "Connect Wallet" button.

---

#### **Screen 1: The "Launch a D-Corp" Wizard (Multi-step Form)**

*   **Step 1: The Basics**
    *   Input: `D-Corp Name`
    *   Input: `Token Symbol`
*   **Step 2: Distribution Model**
    *   Input (%): `Initial Investor Pool`
    *   Interactive Sliders (total must be 100%): `Capital (Founders/Execs)`, `Labor (Contributors)`, `Consumers (Users)`.
    *   Real-time updating pie chart visual.
*   **Step 3: Formation Agreement**
    *   Scrollable text box with "D-Corp Formation Principles."
    *   Checkboxes: `[ ] I attest to waiving fiduciary duty.`, `[ ] I agree to quarterly profit distribution.`, `[ ] I agree to the full Principles.`
*   **Step 4: Review & Launch**
    *   Summary of all configured details.
    *   Prominent "Launch D-Corp" button.

---

#### **Screen 2: The Management Dashboard (Admin View)**

*   **Layout:** A tabbed interface: `[Overview]`, `[Distributions]`, `[Attestation Engine]`, `[Members]`
*   **Tab 1: `[Overview]`**
    *   Key Metric Cards: `Treasury Value`, `Next Distribution Date`, `Total Members`, `Total Points Issued`.
*   **Tab 2: `[Distributions]`**
    *   **Upcoming Distribution:**
        *   Input: "Amount to Distribute (USDC)".
        *   Read-only calculated breakdown for C/L/U pools.
        *   "Confirm & Issue Distribution" button (opens a confirmation modal).
    *   **Past Distributions:**
        *   Table with columns: `Quarter`, `Date`, `Total Amount`, `Status`.
        *   Rows are expandable to show C/L/U breakdown.
*   **Tab 3: `[Attestation Engine]`**
    *   **Manage Actions:**
        *   "Create New Action" button opening a form: `Action Title`, `Type (Labor/Consumption)`, `Points Awarded`, `Description`.
        *   A list of all active, rewardable actions.
    *   **Pending Attestations (Labor):**
        *   A queue of submissions showing `Contributor`, `Description`, `Proof Link`.
        *   `[Approve]` and `[Reject]` buttons for each item.
*   **Tab 4: `[Members]`**
    *   A searchable table of all members.
    *   Columns: `Address/ENS`, `Class (C/L/U)`, `LaborPoints`, `UsePoints`.

---

#### **Screen 3: User-Facing Portal (Labor/Consumer View)**

*   **Layout:** A simple interface with a header displaying the user's `LaborPoints` and `UsePoints` balances. Tabs: `[Earn Points]` and `[My History]`
*   **Tab 1: `[Earn Points]`**
    *   **Proof of Labor Section:**
        *   Form: `Title`, `Link to Proof`, `Description`.
        *   `[Submit for Attestation]` button.
    *   **Proof of Consumption Section:**
        *   A list of available actions (e.g., "Review our product").
        *   `[Claim Points]` button next to each action.
*   **Tab 2: `[My History]`**
    *   A log of all points transactions and distribution claims.
    *   Columns: `Date`, `Action`, `Type (Labor/Consumption)`, `Points Earned/Claimed`, `Status`.

### 5. Frontend Development Tasks

**Project Setup**
- [ ] Initialize Next.js/Vite project with TypeScript.
- [ ] Set up a component library (e.g., TailwindCSS with Shadcn/UI, or MUI).
- [ ] Define all TypeScript interfaces in a central `types.ts` file.
- [ ] Create a `/data` directory with a `mock.ts` file to house all dummy data.
- [ ] Set up routing for all screens (`/`, `/launch`, `/dashboard/*`, `/portal/*`).

**Onboarding: Launch a D-Corp Wizard**
- [ ] Build the multi-step form component for the wizard flow.
- [ ] Implement the interactive C/L/U slider component.
- [ ] Implement the Formation Agreement step with checkbox validation.
- [ ] Build the Review & Launch summary page.
- [ ] Manage wizard state using context or a state management library.

**Admin Dashboard**
- [ ] Build the main Dashboard layout with the tabbed navigation.
- [ ] **`[Overview]` Tab:** Create the Key Metric card components.
- [ ] **`[Distributions]` Tab:**
    - [ ] Build the "Upcoming Distribution" module.
    - [ ] Build the expandable "Past Distributions" table.
- [ ] **`[Attestation Engine]` Tab:**
    - [ ] Build the "Create New Action" modal and form.
    - [ ] Build the UI for the "Pending Attestations" queue with approve/reject functionality.
- [ ] **`[Members]` Tab:** Build the searchable members data table.

**User-Facing Portal**
- [ ] Build the main layout for the User Portal.
- [ ] Build the header to display the user's point balances from mock data.
- [ ] **`[Earn Points]` Tab:**
    - [ ] Implement the "Submit Proof of Labor" form.
    - [ ] Implement the "Proof of Consumption" section, rendering a list of claimable actions.
- [ ] **`[My History]` Tab:** Build the transaction log table.

**Core Components & Services**
- [ ] Create mock data services/hooks (`useDCorp`, `useUser`, `useAttestations`) to provide data to all components.
- [ ] Build a library of generic, reusable components: `Button`, `Input`, `Modal`, `Slider`, `Table`, `Tabs`, `Card`.
- [ ] Stub out a `useWeb3` hook with all necessary placeholder functions (`connectWallet`, `launchDCorp`, `approveAttestation`, `claimUsePoints`, `signAndSubmitProof`, etc.).

**Final Touches & Polish**
- [ ] Implement robust form validation across all input forms.
- [ ] Ensure the entire application is fully responsive and visually consistent.
- [ ] Write a comprehensive `README.md` with setup instructions and a guide to the different user journeys.

### 6. Dummy Data Schema (`/data/mock.ts`)

```typescript
// /data/types.ts
export interface DCorp {
  name: string;
  symbol: string;
  treasuryValue: number;
  nextDistributionDate: string;
  distributionConfig: { capital: number; labor: number; consumers: number; };
  pastDistributions: Distribution[];
  actions: Action[];
  members: User[];
  pendingAttestations: Attestation[];
}

export interface Distribution {
  id: string;
  quarter: string;
  dateIssued: string;
  totalAmountDistributed: number;
  status: 'Completed' | 'Pending';
  breakdown: { capital: number; labor: number; consumers: number; };
}

export interface Action {
  id: string;
  title: string;
  type: 'LABOR' | 'CONSUMPTION';
  points: number;
  description: string;
}

export interface Attestation {
  id: string;
  userId: string; // address
  userEns?: string;
  actionId: string;
  title: string;
  linkToProof: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface User {
  id: string; // address
  ensName?: string;
  class: 'CAPITAL' | 'LABOR' | 'CONSUMER';
  laborPoints: number;
  usePoints: number;
}

// /data/mock.ts (Example Instantiation)
export const mockDCorpData: DCorp = {
  name: "Nexus Cooperative",
  symbol: "$NEX",
  treasuryValue: 1250000,
  nextDistributionDate: "2025-10-01T00:00:00Z",
  distributionConfig: { capital: 20, labor: 40, consumers: 40 },
  pastDistributions: [ /* ... Distribution objects ... */ ],
  actions: [
    { id: 'action-1', title: 'Submit a Bug Fix', type: 'LABOR', points: 500, description: 'Submit a PR to our main repo fixing a bug.'},
    { id: 'action-2', title: 'Purchase Premium Subscription', type: 'CONSUMPTION', points: 100, description: 'Users who purchase a yearly sub get points.'},
  ],
  members: [
    { id: '0x123...', ensName: 'founder.eth', class: 'CAPITAL', laborPoints: 0, usePoints: 0 },
    { id: '0x456...', ensName: 'contributor.eth', class: 'LABOR', laborPoints: 1200, usePoints: 50 },
    { id: '0x789...', ensName: 'consumer.eth', class: 'CONSUMER', laborPoints: 0, usePoints: 350 },
  ],
  pendingAttestations: [
    { id: 'attest-1', userId: '0x456...', userEns: 'contributor.eth', actionId: 'action-1', title: 'Fixed login button bug', linkToProof: 'http://github.com/pr/123', description: 'The button was misaligned on mobile.', status: 'PENDING' },
  ],
};
```

### 7. Out of Scope for this Ticket

*   **Web3 Integration:** Actual wallet connections, smart contract deployments, and on-chain function calls.
*   **Backend API:** No server-side logic or database for persistence. The app will be fully client-side with mock data.
*   **User Authentication:** No login/session management beyond a mock "connected user" state.
*   **Advanced Legal Text:** The Formation Agreement will use placeholder text.