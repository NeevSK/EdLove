---
title: "Handover: Self Domain Migration & Hook Resonance"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Handover: Self Domain Migration & Hook Resonance

## 1. Overview
We successfully migrated the **Self Domain** (Mood Logs, Fire Journal, Daily Rhythm, etc.) from a monolithic structure within the mobile app to a shared, domain-bound package `@repo/self`.

- **Package:** `packages/self`
- **Goal:** Enable "Resonance Engineering" where domain logic and atomic UI are shared across multiple apps (Gurudevi Mobile, EdLove Web, etc.).

## 2. What We Did
- **Hooks Migration:** Moved `useMoodLogs`, `useFireJournal`, and others from the app to the package.
- **Hook Flattening:** Removed nested `hooks/self/` subdirectories in favor of a flatter, cleaner `hooks/` structure.
- **Component Migration:** Moved **23 atomic components** (e.g., `MoodLotus`, `ProgressTree`, `DailyRhythm`) from `apps/gurudevi-mobile/src/components/self/` to `packages/self/src/components/`.
- **Assets Migration:** Encapsulated domain assets (lotus images) within `packages/self/assets/`.
- **Package Harmonization:** Updated `index.ts` to export all hooks and components, ensuring they are accessible via the `@repo/self` alias.
- **App Update:** Refactored role-specific screens (`StudentSelfView`, `TeacherSelfView`, etc.) to import from the shared package.

## 3. Why We Did It (Architectural Verdict)
- **BRAIN (Hooks/API) → Package:** All business logic must live in the package so that bugs fixed once propagate to all consuming apps.
- **SKIN (Atomic UI) → Package:** Domain visuals should be consistent across platforms.
- **EXPERIENCE (Screens/Navigation) → App:** Screens stay in the app to handle platform-specific navigation and layout assemblies (`*.web.tsx`).

## 4. Post-Mortem: The Corruption Incident
During the migration, a bulk import update script (PowerShell) failed, leading to file corruption.

### What Happened
- **The Bug:** A regex-based find-and-replace injected script snippets (e.g., `param($m)`) directly into the `.tsx` source files.
- **The Impact:** Several screen files (`AdminSelfView`, `PrincipalSelfView`, etc.) were emptied or rendered unparseable by TypeScript.
- **The Mistake:** Large-scale automated edits were performed without a safety-first "restore point" check or dry-run validation on a per-file basis.

### How We Fixed It
1.  **Git Restoration:** Reverted the corrupted files to their last-known stable state.
2.  **Surgical Update:** Manually re-applied the `@repo/self` imports to the core screens.
3.  **Audit Scripts:** Ran global searches for the `param(` pattern to ensure no residual script debris remained in the codebase.

## 5. Lessons for Future Agents
- **Validate Scripts:** Never run a bulk-edit script without verifying the first 3 files manually.
- **Commit Often:** Migration of logic (hooks) should be a separate commit from UI (components) to isolate failure points.
- **Encoding Matters:** Be wary of PowerShell's default output encoding (UTF-8 with BOM can sometimes cause issues with source parsers).
- **Hierarchy Purity:** If a component has deep dependencies on mobile-only navigation, reconsider moving it to a shared package unless you provide a web-shim.

---
**Status:** Completed & Verified (March 2026)
**Agent:** Antigravity (DeepMind)
