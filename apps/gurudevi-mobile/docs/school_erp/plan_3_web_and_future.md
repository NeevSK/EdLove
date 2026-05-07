# Plan 3: The Web Dimension & Future Strategy

*Objective: Establish how `*.web.tsx` files operate across packages without leaking App Shell context, and create the template for future package development.*

## 1. The Web Colocation Protocol
We have `*.tsx` (Native/Default) and `*.web.tsx` (Web-specific) files natively resolved by Metro.
*   **The Problem**: `.web.tsx` files inside `packages/` often try to "escape" by importing React Navigation web routers or configuration from `apps/gurudevi-mobile`. This creates a severe cyclic dependency (Packages -> App -> Packages).
*   **The Fix**: 
    *   No file inside `packages/` (even `.web.tsx`) is allowed to import from `apps/`.
    *   **Routing**: `.web.tsx` navigation must rely on abstract path strings (e.g., `router.push('/c/[id]')`) or a shared interface pattern located in `@repo/core`, rather than direct dependency on standard React Nav.
    *   **Shared Logic**: To keep bundles thin, any logic shared by *both* `FeatureScreen.tsx` and `FeatureScreen.web.tsx` MUST be extracted to `useFeatureScreen.ts`. 

## 2. Adding Future Packages (Without Tech Debt)
When you want to add a new package (e.g., `@repo/gamification`), follow this strict protocol:

1.  **Determine the Layer**:
    *   Is it a primitive that everyone uses without business logic? **L1 (Foundation)**.
    *   Is it a major feature set / distinct product area? **L2 (Core Domain)**.
2.  **Define the Interface**:
    *   For L2, the package must expose an `index.ts` file that only exports what the App Shell (`L3`) actually needs to mount it (e.g., `GamificationNavigator`, `useGamificationSetup`).
3.  **Cross-Package Interactions**:
    *   If `@repo/gamification` needs to give points when a student finishes a course in `@repo/classroom`, it does **not** import classroom. 
    *   Instead, `@repo/classroom` dispatches a domain event via `@repo/core`. `@repo/gamification` listens to this event.

## 3. CI/CD Enforcement
*   **Action**: Integrate an ESLint boundary plugin (e.g., `eslint-plugin-boundaries` or custom TSLint rules) into your pre-commits.
*   **Result**: If a developer tries to `import { Classroom } from '@repo/classroom'` inside `@repo/admin`, the CI/CD pipeline and local pre-commits will immediately reject it, guaranteeing zero architectural tech debt drift forever.
