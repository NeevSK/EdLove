---
title: "Sovereign Identity Operationalization (V2)"
status: "active"
created: 2026-05-06
updated: 2026-05-06
author: "Naween"
tags: [reorganized]
---

# Sovereign Identity Operationalization (V2)

## Phase 1: Foundation (Schema Hardening)
*   **Target:** `packages/core/src/logic/schemas/user.schema.ts`
*   **Action:** Add `bonds` array and `primaryCapacity` to `UserContextSchema`.
*   **Goal:** Ensure the Zod contract reflects the ReBAC reality.

## Phase 2: Bridge (Hook Refactor)
*   **Target:** `packages/core/src/logic/permissions/hooks/usePermissions.ts`
*   **Action:** Extract `availableBonds` from the AuthStore and inject them into the `UserContext`. Derive `primaryCapacity`.
*   **Goal:** Connect the global state to the permission engine.

## Phase 3: Brain (Composer Refactor)
*   **Target:** `packages/core/src/logic/permissions/composer.ts`
*   **Action:** Iterate through ALL `user.bonds` to define abilities. 
*   **Goal:** Create a unified capability set (The Union).

## Phase 4: Consumption (UI Migration)
*   **Target:** `TabNavigator.tsx`, `useSchoolProfile.ts`, etc.
*   **Action:** 
    *   Switch from checking `context.roles` (Legacy) to `can('action', 'subject')` or `context.activeBond`.
    *   Use `primaryCapacity` as the "Mental Anchor" for labels.
*   **Goal:** Remove legacy dependencies and enable the new UX.

## Phase 5: Purge (The Clean Slate)
*   **Target:** `20260504000000_rebac_purge_legacy.sql`
*   **Action:** Drop legacy columns (`authority`, `role`, `platform_roles`).
*   **Goal:** Finalize the architectural flip.

## Checkpoints
- [x] Philosophy Alignment
- [x] Foundation (Schemas)
- [x] Bridge (Hooks)
- [x] Brain (Composer)
- [ ] UI Refactor (In Progress)
- [ ] Final SQL Purge
