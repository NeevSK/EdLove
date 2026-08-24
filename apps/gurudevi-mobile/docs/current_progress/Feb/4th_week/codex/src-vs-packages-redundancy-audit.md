---
title: "Audit: `apps/gurudevi-mobile/src` + `components` vs `packages/*`"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Audit: `apps/gurudevi-mobile/src` + `components` vs `packages/*`

## Scope
Checked whether source files inside `apps/gurudevi-mobile/src` (especially `src/components`) duplicate or compete with workspace packages under `packages/*/src`.

## Method
- Compared file basenames across `apps/gurudevi-mobile/src/**/*` and `packages/*/src/**/*`.
- Measured content similarity for `.ts/.tsx` collisions.
- Spot-checked diffs for highest-overlap files.
- Checked whether local `src/lib/api/*.ts` files are referenced by mobile app code.

## Findings

### 1) `src/lib/api/*` in mobile is largely redundant with `packages/core/src/api/*`
High similarity (0.95–0.998) was found for most API modules (e.g. `school.ts`, `classroomStudents.ts`, `lessonMaterials.ts`, `assignments.ts`, `resources.ts`, `groups.ts`, `attendance.ts`, `teacher.ts`, `classroom.ts`). In spot checks, differences are mostly import-path rewrites and minor error handling adjustments.

This means mobile keeps a near-fork of core API code, while also importing `@repo/core` directly.

### 2) Many local API files appear unused by app imports
Static reference check inside `apps/gurudevi-mobile/src` found no direct imports for many local API files:
- `assignments.ts`, `attendance.ts`, `classroom.ts`, `classroomStudents.ts`, `classrooms.ts`, `demoProvider.ts`, `grading.ts`, `groups.ts`, `inventory.ts`, `lessonMaterials.ts`, `mockData.ts`, `resources.ts`, `teacher.ts`.

Only a few local API modules are directly referenced (`demo.ts`, `school.ts` for types, `types.ts`).

### 3) `src/components` has overlapping component names with packages (especially `@repo/classroom`, `@repo/ui`)
Examples of high overlap:
- `components/principal/InviteManager.tsx` ↔ `packages/classroom/src/components/principal/InviteManager.tsx` (very similar).
- `components/principal/HierarchyBuilder.tsx` ↔ package equivalent.
- `components/principal/ResourceNeedsDashboard.tsx` ↔ package equivalent.
- `components/grading/*` (`GradeEntryForm`, `GradebookTable`, `GradingSettings`, `ReportCard`) ↔ package equivalents.
- `components/shared/SandboxBanner.tsx` and `components/SanctuaryCard.tsx` overlap with `@repo/ui` component names.

These are likely competing implementations unless intentionally mobile-specialized.

### 4) Architectural inconsistency is present now
`apps/gurudevi-mobile/src/lib/api/index.ts` composes the exported API from package modules (`@repo/core`, `@repo/library`, `@repo/community`, `@repo/self`), but many local API files still exist beside it as near duplicates.

## Conclusion
Yes — there is meaningful redundancy/competition.

The strongest redundancy is in `apps/gurudevi-mobile/src/lib/api/*` versus `packages/core/src/api/*`.

In `src/components`, there is moderate-to-high overlap with `packages/classroom` and some overlap with `packages/ui`; some files may be deliberate mobile variants, but the current structure makes ownership unclear and invites divergence.

## Recommended cleanup order
1. **API first (highest ROI):**
   - Migrate remaining references to package APIs/types.
   - Remove or deprecate redundant mobile `src/lib/api/*.ts` files.
2. **Principal/grading components second:**
   - Choose a source of truth (`@repo/classroom` or mobile-local).
   - If mobile-specific behavior is required, keep a thin wrapper in mobile and move shared logic to package.
3. **UI overlap third:**
   - Consolidate shared primitives (`SanctuaryCard`, `SandboxBanner`) into `@repo/ui`, keep mobile-specific wrappers only when necessary.

