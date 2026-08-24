---
title: "Senior Developer & Architect Audit: Gurudevi Platform"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Senior Developer & Architect Audit: Gurudevi Platform

As an architect looking at this "Clockwork," here is my evaluation of the current state, the rationale behind your screen placement, and the "missing links" that usually separate a good project from a world-class production system.

---

## 1. The "Face" Dilemma: Why Classroom is Different

You noticed that `classroom` faces are in the package, but others are in the app. You are 100% correct.

### The Rationale:
*   **Encapsulation**: The **Classroom** is a "Deep Domain." It’s not just a screen; it’s a complex workflow (Attendance $\rightarrow$ Grading $\rightarrow$ Reports). Moving the "Face" into the package means the mobile app doesn't need to know *how* grading works; it just says "Show the Gradebook."
*   **The Transition State**: The fact that **Library** and **Community** have local faces suggests they are "Shallow Domains" currently. They rely on the mobile app to define their look.
*   **Architectural Goal**: In a perfect monorepo, everything except the `Navigation` and `App.tsx` should eventually live in `@repo/*`. You are halfway through this "Modularization Journey" (Classroom is 100% there, others are 50% there).

---

## 2. What is Missing? (The "Senior" Gap)

If I were to join this team today, here are the 4 things I would flag as "Missing" or "High Risk":

### 🚨 A. The "Source of Truth" Leak (Consistency Gap)
As mentioned, the `lib/api` duplication is your biggest risk. 
*   **Status**: **[RESOLVED]** During this audit, we consolidated 13 orphaned API files and enriched the `lib/api` proxy to cover the entire core platform. 
*   **Result**: The app now has a single "Demo Mode" sandbox that works consistently across all features.

### 🧪 B. Automated Quality Guardrails (The CI/CD Gap)
You have an `android-build.yml`, but it only builds the "final product." 
*   **Missing**: A **"Pull Request Guard"**. You have `android-build.yml`, but it's manual and only for Android. You need a workflow that runs `lint`, `check-types`, and `test` automatically on every PR.
*   **Risk**: Without this, the "Clockwork" will eventually jam because someone will commit code that breaks a package they weren't even looking at.

### 📖 C. Living Documentation (The "Onboarding" Gap)
You have a `docs` folder, but it feels like a "junk drawer" (full of archives and old logs).
*   **Missing**: A `README.md` in every package that explains:
    1. What this package does.
    2. What it depends on.
    3. How to run its tests.
*   **Senior Fix**: Use **Storybook**. It allows you to see all `@repo/ui` components in isolation without launching the whole app.

### 🛡️ D. Shared Business Logic (The "Brain" Gap)
I see API calls in core, but I don't see much "Business Rules" logic. 
*   **Example**: How is a "Grade" calculated? Is that logic in a React component? 
*   **Risk**: If it's in a component, the Web app can't calculate grades. 
*   **Senior Fix**: Move all "pure" logic (calculations, date formatting, data transformations) into `@repo/core/src/lib`.

---

## 3. The Verdict
**State**: **"Highly Competent Skeleton"**
The bones are excellent (pnpm, turbo, expo). The organization is smart. But the "muscles" (consistency and automation) are still being built.

### Immediate Recommendations:
1.  **Consolidate APIs**: Stop the bleeding of duplicate code.
2.  **Expand BDD Tests**: Your `jest-cucumber` setup is great, but it needs to cover more than just basic components.
3.  **CI Automation**: Add a "Lint & Typecheck" workflow to GitHub.
