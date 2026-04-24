# POA Migration Status Report

## Current State vs. Finalized Technical Plan

| Feature | Plan Requirement | Current Status | Alignment Gap |
| :--- | :--- | :--- | :--- |
| **Zod Source of Truth** | All role/user types defined via Zod in `core`. | `RoleSchema`, `UserContextSchema` exist. | Some roles (e.g. `assistantPrincipal`) may be missing. `UserContext` isn't fully inferred everywhere. |
| **CASL Abilities** | One file per role; merged by `composer.ts`. | Ability files exist for all major roles. | Need to verify hierarchical inheritance (e.g. `assistantPrincipal` extends `principal`). |
| **Unified Interface** | `usePermissions.ts` is the ONLY interface. | Hook exists but is under-utilized. | Needs to replace all `isRole` and legacy role checks. |
| **Guards** | Route and Feature level guards ONLY. | `RouteGuard.tsx` and `FeatureGuard.tsx` exist. | Need to ensure they are used consistently across mobile/web. |
| **Vows/Intents** | Remove for buttons/UI actions. | System exists and is heavily utilized. | **Major Conflict**: Must be dismantled/removed in favor of CASL `can`. |
| **Supabase RLS/Realtime** | DB-level isolation + reactive updates. | Foundation exists in Supabase. | Need to ensure Realtime triggers CASL re-composition in `useStore`. |

## Key Findings
1.  **Redundant Systems**: The `Vow`/`Intent` system currently in many packages (e.g. `classroom`) is now deprecated and must be replaced by the CASL-based capability model.
2.  **Type Safety**: `usePermissions` currently uses `any` for ability checks, which defeats the Zod/TypeScript benefit.
3.  **Role Naming**: CamelCase (`sectionHead`) is the standard, but some legacy code/schema still expects `section_head`.

## Immediate Next Steps
1.  Consolidate `RoleSchema` to match the User's latest specification.
2.  Refactor `usePermissions` to be strictly typed and the sole authority interface.
3.  Dismantle the button-level Vow/Intent system across all packages.
4.  Standardize the `composer` to handle hierarchical role merging.
