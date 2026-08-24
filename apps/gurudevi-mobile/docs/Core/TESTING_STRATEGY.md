---
title: "GURUDEVI TESTING STRATEGY"
status: "active"
created: 2026-02-11
updated: 2026-02-11
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI TESTING STRATEGY
## Behavior-Driven Development (BDD) & Verification

**Last Updated**: February 11, 2026  
**Core Strategy**: Web-First BDD (Gherkin + Jest)

---

## 1. The Strategy: Web-First BDD

Due to React 19's deprecation of older testing utilities, Gurudevi uses a **Web-First BDD strategy**. This allows us to verify complex business logic and UI flows using standard DOM tools while bypassing native-only environment collisions.

### Why Web-First?
- **Speed**: JSDOM is significantly faster than native emulators for logic verification.
- **Stability**: Standardizes the testing environment across development machines.
- **Generalizability**: verifies the "Soul" of the feature (the Behavioral Helix) which is shared between Web and Mobile environment.

---

## 2. The Triple-Helix Synthesis

Everything we build follows a 3-strand synthesis to ensure long-term integrity:

1.  **Behavior (The Soul)**: Defined in plain English from the user's perspective via Gherkin.
2.  **Structure (The Bone)**: The technical implementation (UI Abstraction, TDD, Clean Code) that supports the behavior.
3.  **Environment (The Gravity)**: The technical specifications and constraints (Monorepo, React 19, $0 Budget) we must survive.

For a deeper dive, see [TRIPLE_HELIX_BDD_ANALYSIS.md](./TRIPLE_HELIX_BDD_ANALYSIS.md).

---

## 3. The BDD Tooling Stack

| Tool | Purpose |
| :--- | :--- |
| **Jest** | Primary test runner and assertion library. |
| **jest-cucumber** | Parses Gherkin `.feature` files into executable Jest tests. |
| **@testing-library/react** | Standard DOM-based querying (replaces native testing library for core logic). |
| **react-native-web** | Bridges native components to the DOM environment during tests. |
| **Supabase Mocks** | Specialized mocks for database interactions. |

---

## 3. The BDD Workflow (The "Triple-Helix")

Everything we build follows a 3-layer synthesis:

1.  **Behavior (`.feature`)**: Defined in plain English from the user's perspective.
2.  **Logic (`.steps.tsx`)**: The "Glue Code" that maps English steps to component interactions.
3.  **Implementation (`.tsx`)**: The component or hook being verified.

### Rules of Engagement
- **Always use Accessibility Labels**: Find elements by `label` or `text`.
- **Verify Database Side-Effects**: Check that Supabase calls are made with the correct payloads.
- **Test "Failure Paths"**: Ensure the UI responds gracefully to errors.
- **No Manual-Only Features**: Every critical Alpha flow MUST have a corresponding BDD feature.

---

## 4. Current Coverage

- ✅ **Auth Refinement**: Email detection, signup vs login nudges.
- ✅ **Invitation System**: Deep-link reception and acceptance logic.
- ✅ **Onboarding**: Role selection (Founder/Admin/Teacher) and global state sync.
- 🔄 **Classroom Management**: (Pending BDD retrofit)
- 🔄 **Library Uploads**: (Pending BDD retrofit)

---

## 5. How to Run Verification

```bash
# Run all BDD suites
pnpm test

# Run specific feature
npx jest src/__tests__/steps/invitation_welcome.steps.tsx
```

---
*Verified by Antigravity*
