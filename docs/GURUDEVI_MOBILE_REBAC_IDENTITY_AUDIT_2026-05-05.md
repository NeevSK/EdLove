# Gurudevi Mobile ReBAC + Identity Audit (2026-05-05)

Scope: `apps/gurudevi-mobile`, `packages/core`, `packages/profile`, Supabase migrations under `apps/gurudevi-mobile/supabase/migrations`.

Goal: capture a comprehensive, actionable checklist of gaps, loopholes, bugs, vulnerabilities, and integrity risks in the current ReBAC + identity refactor, specifically through a 2026 “hexagonal IAM + zero-trust + RLS-first” lens.

This document is intentionally blunt. Treat it as a release checklist and an engineering integrity ledger.

## Executive Summary

The refactor is directionally correct (ReBAC bonds + identity decoupling), but the system is currently in a mixed-model intermediate state:

- UI/runtime still has legacy `role`/`authority` consumers in multiple packages.
- DB policies and helpers still frequently assume `auth.uid()` equals `public.users.id`, even though identity-decoupling explicitly breaks that assumption.
- The identity core was partially centralized, but the port/manager/adapters are not fully consistent, so the project does not typecheck.
- “Perspective” (active bond) is now persisted, but the type model and DB schema are not aligned (missing bond status in runtime objects).

This produces two kinds of risk:

- Security risk: authorization drift between API surface checks, RLS policies, and identity principals.
- Reliability risk: migrations that “purge legacy” will break active runtime behavior and potentially deny access or misroute users.

## Key Concepts (as currently implemented)

- Internal user identity is decoupled via `public.auth_identities` mapping table (migration `20260308000000_identity_architecture.sql`).
- ReBAC model is `public.bonds` providing `(user_id, entity_id, entity_type, capacity, metadata, ...)`.
- App “principal” is intended to be the internal `public.users.id`, not necessarily `auth.uid()`.
- “Perspective” is the currently focused bond; “primary capacity” is an onboarding anchor.
- CASL abilities are composed from `UserContext` and used for UI gating and a coarse API-surface gate (`AuthorityInterceptor`).
- RLS is expected to be the ultimate authority for row-level safety (but this is only safe if it is complete and consistent).

## Findings (Checklist)

Each item includes:

- Symptom: what breaks or becomes unsafe.
- Root cause: why it exists.
- Where to inspect: paths to check.
- Closure criterion: how to know it’s actually fixed.

### F1. Purge migration will break live runtime behavior (P1)

Symptom:
- Applying `apps/gurudevi-mobile/supabase/migrations/20260504000000_rebac_purge_legacy.sql` drops `users.role`, `users.authority`, `platform_roles`, etc. This will break UI logic, profile logic, and any generated/contract schemas still expecting these fields.

Root cause:
- Runtime consumers of legacy fields remain, and schema generation still publishes legacy identity facets.

Where to inspect:
- `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`
- `packages/profile/src/hooks/useSchoolProfile.ts`
- `packages/profile/src/navigation/fullProfileParams.ts`
- `packages/core/src/api/identity.generated.ts`
- `rg -n "\\brole\\b|\\bauthority\\b|platform_roles|school_role|work_roles|context\\.roles" apps/gurudevi-mobile packages/core packages/profile`

Closure criterion:
- No runtime code reads any of these legacy columns for authorization or routing.
- Generated contracts (`packages/core/src/api/identity.generated.ts` and friends) no longer include legacy fields.
- Purge migration is gated behind a repo-wide “ghost RBAC” check (see Plan doc).

### F2. RLS helpers and policies compare `auth.uid()` to internal IDs (P1)

Symptom:
- Policies and helper functions (notably in `20260504000000_rebac_purge_legacy.sql`) compare `auth.uid()` directly to `bonds.user_id`, `teacher_profiles.user_id`, `student_id`, etc.
- If internal user IDs differ from Supabase auth UUIDs (the entire point of `auth_identities`), RLS will deny valid access or allow incorrect access depending on table contents and migration state.

Root cause:
- DB policies were written during earlier era where `public.users.id == auth.uid()`.
- Identity decoupling introduced `public.get_my_id()` but policies were not consistently refactored to use it.

Where to inspect:
- `apps/gurudevi-mobile/supabase/migrations/20260504000000_rebac_purge_legacy.sql`
- `apps/gurudevi-mobile/supabase/migrations/20260309000000_identity_rls_fix.sql`
- Any `USING (auth.uid() = ...)` or `WHERE user_id = auth.uid()` policies in migrations.

Closure criterion:
- All RLS helpers use a single “internal principal” function (e.g. `public.get_my_id()` or a hardened equivalent), never raw `auth.uid()` for app-domain joins.
- Bonds table uses internal `user_id` consistently, and policies match that choice.

### F3. API-surface authorization ignores CASL conditions (P1)

Symptom:
- `packages/core/src/logic/permissions/AuthorityInterceptor.ts` checks only action+subject rule existence and ignores rule conditions/fields.
- This can over-authorize any API handler whose downstream protection is incomplete (RLS gaps, RPCs, service-role operations, non-row resources).

Root cause:
- The surface gate was intentionally designed as “coarse” but does not enforce an explicit contract for which endpoints are safe to gate coarsely.

Where to inspect:
- `packages/core/src/logic/permissions/AuthorityInterceptor.ts`
- `packages/core/src/api/**/*.contract.ts` and route metadata generation

Closure criterion:
- Either:
  - Surface gate becomes condition-aware (ability.can called with an instance / conditions), or
  - Surface gate is limited to routes proven to have complete downstream enforcement, and the rest are deny-by-default.

### F4. Perspective selection is not a server-authoritative truth (P2)

Symptom:
- The adapter persists active perspective locally and defaults to “first bond” if missing.
- Multi-bond users can open in a different workspace after device restore / storage wipe / multi-device usage, because the choice is not server-backed.

Root cause:
- Perspective is treated as UI state, not as a durable domain decision.

Where to inspect:
- `packages/core/src/adapters/supabaseIdentity.adapter.ts` (`getActivePerspective`, `switchPerspective`)
- Store persistence config: `packages/core/src/store/useAuthStore.ts`

Closure criterion:
- Either:
  - Add a server-backed preference (e.g. `user_preferences.active_bond_id`), or
  - Define a deterministic selection contract (e.g. prefer SCHOOL bond matching membership, else PLATFORM bond; order by `valid_from`, etc.) and persist locally as a caching layer only.

### F5. Identity resolution is duplicated / drift-prone (P2)

Symptom:
- Two stacks existed: `SupabaseIdentityAdapter.getMyInternalId()` and `identityAPI.getMyInternalId()`.
- Recent changes attempt to centralize, but the port/manager layer became incomplete, and typecheck fails.

Root cause:
- Refactor was started in multiple places without finishing the hexagonal contract.

Where to inspect:
- `packages/core/src/api/identity.ts`
- `packages/core/src/logic/managers/IdentityManager.ts`
- `packages/core/src/logic/ports/identity.port.ts`
- `packages/core/src/adapters/supabaseIdentity.adapter.ts`

Closure criterion:
- Exactly one resolver is the source of truth (adapter via the port).
- No other code calls `supabase.auth.getUser()` for identity mapping except that adapter.
- `identityAPI` delegates to the manager, and the manager fully implements the port.

### F6. Current branch does not typecheck (P1)

Observed errors (non-exhaustive) from `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`:

- `packages/core/src/logic/managers/IdentityManager.ts` missing `resolveInternalId`, `linkIdentity`.
- `packages/core/src/api/identity.ts` calls methods missing on `IdentityManager`.
- `packages/core/src/adapters/supabaseIdentity.adapter.ts` returns `Bond` without required `status`.
- `packages/core/src/logic/permissions/composer.test.ts` not updated to new `UserContextSchema` shape (`bonds`, `primaryCapacity`, `activeBondStatus`).

Additional unrelated core errors exist (e.g. missing powersync deps), but the above are directly tied to identity/ReBAC work.

Closure criterion:
- Core package typechecks when running:
  - `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`

### F7. Compile regressions introduced by partial legacy-removal refactor (P1)

Symptom:
- `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx` uses `useMemo` without import.
- `packages/profile/src/hooks/useSchoolProfile.ts` uses `useMemo` without import.

Root cause:
- Refactor changed logic but did not keep imports consistent.

Closure criterion:
- Mobile package typechecks when running:
  - `pnpm exec tsc -p apps/gurudevi-mobile/tsconfig.json --noEmit`
  - Note: currently blocked by unrelated syntax errors in `packages/classroom/...` (see “Non-scope blockers”).

### F8. Type model drift: Bond requires status, runtime doesn’t provide it (P2)

Symptom:
- `Bond` type is now expected to include `status` (and possibly validity range), but the Supabase adapter mapper and tests build bonds without it.

Root cause:
- Schema/model changes were applied in one layer (types/schemas) but not propagated to adapters/tests/DB.

Where to inspect:
- `packages/core/src/types/Identity.ts`
- `packages/core/src/adapters/supabaseIdentity.adapter.ts`
- `packages/core/src/logic/schemas/identity.schema.ts`
- DB migrations that define `public.bonds`

Closure criterion:
- One canonical `Bond` shape is defined and enforced:
  - DB schema includes the same columns (or a clearly defined subset).
  - Adapter maps all required fields.
  - Tests/fixtures updated.

### F9. UserContext drift: `UserContextSchema` changed but consumers/tests lag (P2)

Symptom:
- `UserContextSchema` now includes `bonds`, `primaryCapacity`, `activeBondStatus`.
- Consumers and tests still build contexts using old fields, causing runtime validation failures or test failures.

Where to inspect:
- `packages/core/src/logic/schemas/user.schema.ts`
- `packages/core/src/logic/permissions/composer.ts`
- `packages/core/src/logic/permissions/hooks/usePermissions.ts`
- `packages/core/src/logic/permissions/composer.test.ts`

Closure criterion:
- Every context builder sets defaults consistent with the schema.
- `usePermissions` provides `bonds` and `primaryCapacity` consistently.
- Tests updated to new schema.

### F10. Store hydration race and “flash of unauthorized” (P2)

Symptom:
- During app bootstrap, persisted store state may not be hydrated yet, leading to a transient empty bonds array and incorrect redirects or deny UI states.

Status:
- A hydration gate (`isStoreHydrated`) has been introduced into the auth slice and set on rehydration in `useAuthStore`.

Where to inspect:
- `packages/core/src/store/slices/auth.slice.ts`
- `packages/core/src/store/useAuthStore.ts`
- Any provider/bootstrap code that uses the flag to block rendering until hydrated.

Closure criterion:
- App bootstrap blocks permission evaluation until hydration completes.
- No onboarding redirects occur purely due to hydration timing.

### F11. Migration history indicates policy recursion, deadlocks, and privilege escalation patches (P1)

Symptom:
- Multiple migrations exist explicitly to fix RLS recursion, RLS deadlocks, and insert/update vulnerabilities.

Risk:
- This confirms the system has historically had gaps at the exact authorization boundary being refactored. That makes coarse API-surface gating (F3) riskier until RLS is systematically verified.

Where to inspect:
- `apps/gurudevi-mobile/supabase/migrations/20260217192416_fix_rls_privilege_escalation.sql`
- `apps/gurudevi-mobile/supabase/migrations/20260309000003_fix_anonymous_role_constraint.sql`
- `apps/gurudevi-mobile/supabase/migrations/20260311000000_fix_identity_rls_deadlock.sql`

Closure criterion:
- A repeatable RLS test suite exists and runs for all privileged tables.
- Policies are refactored to internal principal consistently (F2).

### F12. Hybrid Sync (PowerSync) introduces a second authorization boundary (P1)

Context:
- `apps/gurudevi-mobile/docs/architecture/Sovereign_Resilience_Architecture_2026.md` describes a two-lane system:
  - Path 1: PowerSync replication (CRUD replication) feature-gated via `ENABLE_POWERSYNC`.
  - Path 2: Message bus + Outbox intent queue (workflow/intent mutations) as permanent fallback.

Symptom:
- Any sync connector or replication rule that assumes the principal is `auth.uid()` will desynchronize permissions once identity decoupling is active.
- If PowerSync “token parameters user_id” is not the internal user UUID used by `bonds.user_id`, bucket scoping can under-scope (missing data) or over-scope (leaking data), depending on rules.

Root cause:
- Hybrid systems create multiple enforcement points: client ability checks, DB RLS, and sync scoping rules (PowerSync).

Where to inspect:
- `apps/gurudevi-mobile/docs/architecture/Sovereign_Resilience_Architecture_2026.md` (PowerSync rules section)
- `packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts`
- Any PowerSync `sync-rules.yaml` (dashboard-configured) that references `bonds` / `token_parameters.user_id`

Closure criterion:
- Define and document the PowerSync principal as the internal `public.users.id` (not raw auth UID).
- Ensure credential issuance and sync token parameters bind to internal principal.
- Ensure bucket query uses internal principal consistently:
  - Example risk: `SELECT school_id FROM bonds WHERE user_id = token_parameters.user_id` must match the DB’s `bonds.user_id` principal.

### F13. Message Bus / Outbox consumers can bypass RLS if elevated (P1)

Context:
- The resilience doc positions the Outbox queue as “intent engine” and permanent fallback for workflows.

Symptom:
- If queue draining or event handling executes with service-role privileges (or any elevated DB client), RLS is bypassed and the consumer must re-enforce ReBAC explicitly.
- If consumer does not re-check bond `status` / validity / current principal mapping, it can apply stale or unauthorized intents (replay) after permissions were revoked.

Root cause:
- Async consumers and “background drain” flows often run with privileges that are not tied to the end-user principal.

Where to inspect:
- `packages/core/src/lib/sync/*` (queue draining, optimistic merge, bus)
- Any server-side consumers (Inngest, edge functions, cron) that write app-domain tables

Closure criterion:
- Document a rule: no consumer may write app-domain tables without either:
  - RLS in effect under internal principal (no service role), or
  - Explicit ReBAC enforcement in code using internal principal + bond validity.
- Add seam tests for:
  - bond revoked -> queued intent denied at ingest/consumer
  - event replay -> idempotent and re-authorized

### F14. Optimistic merge must not masquerade authorization (P2)

Context:
- The resilience doc describes `useOptimisticMerge` folding pending mutations into cached reads with `_optimistic: true`.

Symptom:
- If optimistic overlays are shown without strict labeling and without preventing privileged fields from being displayed, the UI can temporarily expose data that the user is not authorized to see (especially on shared devices or after role switch).

Root cause:
- Optimistic reads are a UI-layer construct; authorization must still be derived from current bonds/perspective and never from “pending queue intent.”

Where to inspect:
- `packages/core/src/lib/sync/hooks/useOptimisticMerge.ts` (if present)
- Any screens that render `_optimistic` state

Closure criterion:
- `_optimistic` overlays are always labeled and never applied to reads that are authorization-sensitive without additional gating.
- Role/perspective switches clear or re-scope optimistic overlays.

## Non-scope blockers (must be acknowledged during verification)

These are not identity/ReBAC issues but currently block clean verification runs:

- Mobile typecheck is failing due to syntax errors in `packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx`.
- Core typecheck includes missing Powersync deps (`@powersync/react-native`, `@powersync/react`) and some store API drift (`setOnline` vs `setIsOnline`).

Treat these as separate tasks; do not “fix everything” as part of the identity hardening unless explicitly scoped.

## Minimal “Ready-to-Purge” Gate

Do not run the purge migration until all are true:

- No runtime references to legacy identity columns remain in app code.
- `public.has_capacity*` and any ReBAC policies are internal-principal correct (no raw `auth.uid()` joins).
- Core package typechecks.
- A basic RLS verification suite exists for at least: profiles, student records, bonds, membership tables.

## Appendix: Commands Used During Audit

- `rg -n "rebac|identity|authority|tenant|permission|rls|policy|workspace" ...`
- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`
- `pnpm exec tsc -p apps/gurudevi-mobile/tsconfig.json --noEmit`
