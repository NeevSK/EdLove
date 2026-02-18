# 🤖 Delegation Playbook: Orchestrating Your AI Agents

**Objective**: Maximize velocity by assigning the *right* tasks to the *right* intelligence.
- **You (Human Founder)**: Vision, Taste, Critical Decisions.
- **Me (Antigravity)**: Architecture, Deep Refactoring, Complex Logic, Verification.
- **GitHub Copilot Agent**: Boilerplate, Repetitive Patterns, "grunt work," Isolation Tasks.

---

## 🚦 Roadmap Delegation Analysis (Next Phase)

Based on `next_phase_roadmap.md`, here is how we split the work.

### ✅ GREEN: Perfect for GitHub Copilot Workspace
*Low User Consequence, High Repetition, Clear specs*

1.  **UI Component Audits (Visual Consistency)**
    *   **Task**: "Find all `TextInput` components and ensure they use `SanctuaryInput`."
    *   **Task**: "Refactor `SanctuaryCard` to handle Light Mode background colors."
    *   **Why**: Pattern-matching is their superpower.

2.  **Boilerplate Component Creation**
    *   **Task**: "Create `QRDisplay` component that takes a string and renders a code."
    *   **Task**: "Create `useRoleFeatures` hook with this specific TypeScript interface."

3.  **Skeleton Loaders & Empty States**
    *   **Task**: "Create `SkeletonLoader` component with shimmer effect."
    *   **Task**: "Replace spinners with Skeletons in `SelfScreen`."
    *   **Why**: Visual work, requires implementing a standard pattern.

### ⚠️ YELLOW: Collaborative (Agent Starts, We Finish)
*Logic exists, but requires nuance*

1.  **Gamification Logic (Points System)**
    *   **Agent**: "Create a `GamificationService` class that has methods for `awardPoints(action)`."
    *   **Human**: Define the specific point values and anti-abuse logic.

2.  **Guest Mode Fallbacks**
    *   **Agent**: "Wrap `UserProfile` fetch in a try-catch and return null if not logged in."
    *   **Human**: Design the *exact* empty state UI that converts users.

### 🛑 RED: Keep Manual / Antigravity
*High Complexity, Security Risk, "Taste" Required*

1.  **RLS & Database Security**: Never trust an unverified agent with security policies.
2.  **Deep Link Architecture**: configuring Firebase/Supabase routing is fragile.
3.  **"Vobe" & Aesthetics**: Only you/we can judge if an animation feels "Sanctuary" enough.

---

## 📝 Ready-to-Use Prompts for GitHub Agent

### Prompt 1: The "Guest Proofing" Sweep (Phase 1.1)
> **Context**: We need to ensure the app doesn't crash for guests OR new users with empty data.
> **Task**: Scan `src/screens/SelfScreen.tsx` and `src/components/self/*`. Identify any database calls (e.g. `useQuery`, `supabase.from`).
> **Requirement 1 (Safety)**: Wrap calls in a check for `user.id`. If `user` is null, skip the query.
> **Requirement 2 (Empty States)**: If data is empty (for guest or new user), return a specialized `PositiveEmptyState` component. Messaging should be a **Positive Invitation** (e.g., "This space is yours to create" or "Your journey begins here") rather than "Nothing here."
> **Requirement 3 (Loading)**: Use `SkeletonLoader` (see Prompt 4) while fetching, instead of a simple spinner.

### Prompt 4: The "Skeleton Loader" Build (Phase 2.3)
> **Context**: We need a modern "shimmer" loading state that mimics the shape of content.
> **Task**: Create `src/components/shared/SkeletonLoader.tsx`.
> **Requirements**:
> - Use `react-native-reanimated` for a subtle pulse/shimmer effect. **DO NOT use `moti`**.
> - Props: `width`, `height`, `borderRadius`.
> - Create preset variants: `SkeletonCard`, `SkeletonAvatar`, `SkeletonTextLine`.
> - Replace existing `ActivityIndicator` spinners in main screens with these skeletons.

### Prompt 2: The "Role Hook" Generator (Phase 1.2)
> **Context**: We need a central hook to manage feature flags based on user roles.
> **Task**: Create `src/hooks/useRoleFeatures.ts`.
> **Output Location**: Save this file to `src/hooks/`.
> **Documentation**: Update `docs/current_progress/18022026/agent_work_log.md` with your status.
> **Specs**:
> - Input: `user.role` (string)
> - Output: Object with booleans: `{ canManageClassroom, canViewStudents, homeLabel, showOnlineUsers }`
> - Logic:
>   - Teacher: `true`, `true`, "Teacher's Desk", "Online Teachers"
>   - Student: `false`, `false`, "My Study Space", "Online Students"
>   - Principal: `true`, `true`, "Principal's Office", "Staff Directory"

---

## 🔍 The "Check All" Verification Pattern
*How to handle "stateless" agents verifying large codebases*

Since agents can't "see" the whole project at once, use this **Map & Conquer** pattern in your prompts:

1.  **Map**: "First, run `ls -R src/` to get a full file list."
2.  **Filter**: "Identify all files that might contain [X] (e.g. `grep "useQuery" src/`)."
3.  **Check**: "Read these files 5 at a time and verify [Condition]."
4.  **Log & Tick**: "Maintain a checklist in `docs/current_progress/18022026/verification_log.md`."
    *   **CRITICAL**: You must **only marks [x] AFTER** you have actually read and verified the file.
    *   Do NOT pre-fill the checklist with [x].
    *   Update the file after every batch of 5 checks.

**Example Prompt:**
> "We need to check ALL screens for Guest compatibility.
> 1. List all files in `src/screens`.
> 2. Create `docs/current_progress/18022026/guest_audit.md` with a checkbox for each screen (all unchecked `[ ]`).
> 3. For each screen, check if it accesses `user` without a null check.
> 4. **AFTER** verifying a file, update the list to mark it `[x]`.
> 5. If issues are found, add a note next to the checkbox."

---

## 🚀 Suggested Next Step
Since I am already here and deeply context-aware, I can handle the **Complex/Yellow** tasks immediately.

**Recommendation:**
1.  **You/Agent**: Handle the **UI Text updates** and **Boilerplate components** (Prompts 2 & 3 above).
2.  **Me (Antigravity)**: Tackle **Phase 1.1 (Guest Errors)** and **Phase 3 (Gamification Logic)** because I can verify the *logic* and *safety* better than a fire-and-forget agent.
