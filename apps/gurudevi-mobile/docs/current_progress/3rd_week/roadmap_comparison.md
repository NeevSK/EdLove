# Roadmap Comparison: Next Phase vs. Alpha Phase

## 1. High-Level Strategy Shift

| Feature | **Alpha Phase (Previous)** | **Next Phase (2026-02-18)** |
| :--- | :--- | :--- |
| **Primary Goal** | **Foundation & Security**: Building the core architecture, auth flows, and basic role structures. | **Refinement & Engagement**: Polishing the "Sanctuary" experience, fixing guest utility, and driving organic discovery. |
| **User Entry** | **Invite-Only / "Pathfinder"**: Heavy focus on Deep Links, QR Invitations, and Passwordless Auth as the gatekeepers. | **Open / Guest-Friendly**: Critical focus on "Guest Error Elimination" and allowing users to explore *before* syncing/committing. |
| **Engagement** | **Functional**: Completing core loops (Classroom enrollment, Self check-ins). | **Gamified**: Introducing "Treasure Hunt", "Hidden Achievements", and "Stat Card" points to award exploration. |

## 2. Key Differences in Scope

### 🆕 New in Next Phase
*   **Guest Mode First**: The Alpha specs were very aggressive about "locking" roles and requiring invitations. The new roadmap prioritizes making the app crash-proof and useful for Guests (unauthenticated users).
*   **Gamification Layer**: Concepts like "Sanctuary Seeker", "Early Riser", and tracking "Milestone Actions" (rewards for exploring sections) are entirely new additions to the scope.
*   **Extended QR Utility**: Alpha used QR primarily for *Invitations*. The new roadmap extends this to day-to-day utility: **Classroom Joining**, **Assignment Submission**, and **Resource Sharing**.
*   **Dynamic "Self" UI**: Detaching the Stat Card and making the ID card dynamic based on roles.

### 🔄 Refinements & Continuations
*   **Role-Based Features**:
    *   *Alpha*: Established the roles (Principal, Teacher, Founder).
    *   *Next Phase*: Tying specific feature visibility to these roles (e.g., "Online Teachers" vs "Online Students" renaming).
*   **UI Polish**:
    *   *Alpha*: "Sanctuary Aesthetics" at 60%.
    *   *Next Phase*: Specific targeting of **Light Mode** consistency (fixing dark fill-ins) and "Glass Sanctuary" refinement.

### 📉 De-emphasized / Completed
*   **Auth & Onboarding**: The "5-screen onboarding" and "Passwordless Auth" flows were major Alpha deliverables. The new roadmap assumes these are largely done or stable, focusing instead on what happens *after* (or before) login.

## 3. Immediate Priorities Comparison

**Alpha Priority:**
1.  RLS Security & API Auth checks 🔴
2.  TS Error Resolution 🔴
3.  Component Library (LotusButton, Inputs) 🔨

**Next Phase Priority:**
1.  **Guest Error Elimination**: Audit all sections for crashes when not logged in. 🚨
2.  **Role Visibility Hooks**: `useRoleFeatures` implementation.
3.  **Visual Polish**: Fixing Light Mode inputs and card backgrounds. ✨

## 4. Conclusion
The **Next Phase Roadmap** represents a maturity step. You are moving from **"Can we build it?"** (Architecture, Auth, Data Security) to **"Do people love using it?"** (UX, Gamification, Polish). The shift from "Invite-Only" exclusiveness to a more robust "Guest Experience" suggestion is the most significant strategic pivot.
