---
title: "AI & Human Developer Collaboration: The BDD Manifesto"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# AI & Human Developer Collaboration: The BDD Manifesto

> **Last Updated: 2026-02-11**

This guide outlines our shared journey in building the `gurudevi-mobile` platform, focusing on why we chose **Behavior-Driven Development (BDD)**, the technical obstacles we overcame, and the best practices for our continued partnership.

---

## 1. Why We Choose BDD

BDD serves as the "Common Language" between the Human visionary and the AI implementer.

- **Shared Context**: Gherkin features (`.feature` files) provide a source of truth that both humans and AI can parse without ambiguity.
- **Living Documentation**: The tests *are* the documentation. If a test passes, we know the behavior exists and works as intended.
- **Decoupled Logic**: BDD focuses on *what* the system does, not *how* it's implemented. This allows us to refactor under the hood (e.g., changing UI libraries) while keeping the behavioral verification stable.

---

## 2. Blindspots: BDD vs. TDD

While BDD is powerful for high-level alignment, it has blindspots that **Test-Driven Development (TDD)** typically covers.

| Aspect | BDD Blindspot | TDD Strength |
| --- | --- | --- |
| **Structural Integrity** | May pass even if the internal code is a "spaghetti" mess, as long as the output is correct. | Forces clean, modular interfaces through unit-level constraints. |
| **Edge Case Exhaustion** | Focuses on "Happy Paths" and user stories; may miss low-level boundary conditions. | Encourages testing every branch of a function's logic. |
| **Refactoring Safety** | High-level; may not catch subtle regressions in internal utility functions. | Provides a "safety net" for the smallest units of code. |

---

## 3. The Path of Synthesis (Triple-Helix)

We don't choose BDD *instead* of TDD or Tech Specs; we use the **Triple-Helix Approach**:

1.  **Behavior (BDD)**: Defines the User's "What" (The Soul of the feature).
2.  **Structure (TDD)**: Defines the Developer's "How" (The Bone and Muscle).
3.  **Specs (Technical Docs)**: Defines the System's "Where" and "Limits" (The Environment).

> [!IMPORTANT]
> Giving only the behavior to an AI (or a human) leads to **Suboptimal Paths**. You must provide **Behavior + Technical Specs** to ensure the code isn't just "passing" but is also "performant and scalable."

---

## 4. Goodhart’s Law & The "Suboptimal Path" Trap

**Goodhart’s Law**: *"When a measure becomes a target, it ceases to be a good measure."*

In AI-Human collaboration, this manifests as **Gaming the Tests**:
- **The Problem**: If the only target is "make the BDD test green," the AI might hardcode results, skip error handling, or use inefficient hacks that satisfy the test but break the architecture.
- **The Solution**: 
    - **Review Sample Dumps**: Don't just look at the Green checkmark. Look at the code artifacts and terminal dumps.
    - **Add "Structural" Steps**: Include Gherkin steps that imply technical quality, e.g., *"And the profile should be persisted via the Unified Storage Interceptor"*.
    - **Pair Programming**: The human must act as the "Architectural Guard," ensuring the path taken to "Green" is the most robust one.

---

## 5. The Great "Web vs. Native" Gotcha

In a hybrid environment like Expo (React Native + Web), testing is the most significant hurdle.

### The Invariant Trap
React Native components (like `View` and `Text`) behave differently in a Jest environment than standard HTML elements. 
- **The Error**: `Invariant Violation: Text strings must be rendered within a <Text> component.`
- **The Cause**: Passing a string directly to a mock component that renders as a `div` or doesn't correctly wrap children in a native `Text` component.
- **The Fix**: We adopted a **Web-First BDD strategy**. By using `@testing-library/react` and mocking UI components as standard HTML tags during tests, we bypass native-only invariant checks while still verifying the core business and UI logic.

---

## 6. Best Practices: What to Do & What Not to Do

### ✅ What to Do
- **Synthesis over Isolation**: Provide behavior *and* technical constraints (e.g., "Implement this using a Proxy pattern").
- **Wrap State Updates**: Always use `act()` or `waitFor()`.
- **Prefix Mock Variables**: Use the `mock` prefix for out-of-scope variables in Jest.
- **Specify Encoding**: Always use `utf8` for reports on Windows.

### ❌ What Not to Do
- **Goal-Seek without Guardrails**: Don't let "Green Tests" justify bad architecture.
- **Ignore the "How"**: If the AI takes a suboptimal path, backtrack and add a technical constraint to the requirement.
- **Mix Environments**: Stick to the Web-First pattern for universal component logic.
- **Bypass Abstraction**: Never import directly from `@gluestack-ui/themed` in screen or component files. Always use `@/ui`.

---

## 7. UI Abstraction Pattern (`@/ui`)

To prevent TypeScript stack overflow and optimize bundle size, we use a mandatory UI Abstraction Layer.

**The Workflow**:
1. Human or AI identifies a need for a new UI component.
2. AI checks if it exists in `src/ui/index.ts`.
3. If not, AI adds it via direct sub-module import: `export { Component } from '@gluestack-ui/themed/build/components/Component'`.
4. AI adds the corresponding member to `src/types/gluestack-ui.d.ts` as `any` to keep the TS compiler efficient.
5. AI uses the component via `@/ui` in the application code.

---

## 8. The Power of Reports (.txt vs. Console)

For an AI developer, the terminal is a "blind spot." **Always pipe test results to a `.txt` file** (`npm test > report.txt 2>&1`). This ensures the AI has a persistent, readable log of why a failure occurred, capturing `console.log` and DOM dumps that a standard test runner might hide.

---
*Created by Antigravity & Sovereign Developer*
