# Gurudevi Mobile ReBAC + Identity Remediation Plan (2026-05-05)

Companion to: `docs/GURUDEVI_MOBILE_REBAC_IDENTITY_AUDIT_2026-05-05.md`

Outcome goal: make ReBAC + identity decoupling shippable without “authorization drift”, and make the May 4 legacy purge migration safe to apply.

This plan is structured to match the 2026 Apr/May patterns already present in the repo:

- Hexagonal identity (ports + adapters): one authoritative principal resolver.
- Zero-trust: deny-by-default, explicit invariants, no silent fallbacks.
- RLS-first: DB policies remain the final authority for row-level access, but only after internal principal is consistently used.
- “Truth gap closure”: eliminate mixed identity models (auth UID vs internal UUID vs legacy role strings).
- “Seam tests”: tests at the identity/authz boundaries, not unit-only.

## Phase 0: Establish Gates (No More Unsafe Drift)

Goal: prevent regressions while refactoring.

Deliverables:
- A “ghost RBAC” grep gate documented and runnable.
- A “principal mismatch” gate (auth UID vs internal ID) test harness.

Acceptance criteria:
- A single command can show remaining legacy consumers:
  - `rg -n "\\brole\\b|\\bauthority\\b|platform_roles|school_role|work_roles|context\\.roles" apps/gurudevi-mobile packages/core packages/profile`
- This command returns 0 hits in runtime code (tests/docs allowed) before Phase 3 is considered complete.

## Phase 1: Repair the Hexagonal Identity Core (Unblock Typecheck)

Goal: one authoritative resolver and a coherent type model.

Work items:
- Finish the `IIdentityPort` contract: ensure `IdentityManager` implements every method required by the port.
- Ensure `identityAPI` delegates only through `identity` (the manager), never directly to Supabase.
- Normalize `Bond` shape end-to-end:
  - Decide the canonical fields: `id`, `userId`, `entityId`, `entityType`, `capacity`, `status`, `validFrom`, `validUntil`, `metadata`.
  - Ensure DB schema, Zod schema, TS types, and adapter mapping match.
- Update `UserContextSchema` consumers:
  - `usePermissions` must populate `bonds`, `primaryCapacity`, `activeBond`, and `activeBondStatus` consistently.
  - `composer.test.ts` fixtures must match the new schema.

Acceptance criteria:
- Core typecheck passes:
  - `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`
- Identity boundary invariants are documented in code:
  - “Only adapter calls `supabase.auth.getUser()` for principal mapping.”

Notes:
- Do not “fix the whole repo” typecheck. Limit to identity-related errors; treat external deps (Powersync) as separate backlog.

## Phase 2: Make the DB Authorization Model Principal-Correct (RLS Integrity)

Goal: eliminate the “auth.uid() equals internal user id” assumption everywhere that touches app-domain tables.

Work items:
- Choose and enforce one DB-level internal principal function:
  - Option A: keep `public.get_my_id()` as the canonical internal principal.
  - Option B: replace it with a hardened, consistently named function (e.g. `public.current_user_id()`).
- Update all ReBAC helpers and policies:
  - `has_capacity()` and `has_capacity_in_school()` must use internal principal, not raw `auth.uid()`.
  - Policies on profiles, student records, bonds, membership tables must join on internal principal.
- Harden SECURITY DEFINER functions:
  - Explicit `SET search_path = public, pg_temp` (or approved subset).
  - Grant execute narrowly where possible.

Acceptance criteria:
- The purge migration no longer references `auth.uid()` for app-domain joins.
- There is a consistent internal principal function used for all app-domain RLS.

## Phase 2B: Hybrid Sync Principal Binding (PowerSync + Token Parameters)

Goal: ensure PowerSync scoping rules and credentials use the same principal identity as ReBAC/RLS.

Work items:
- Declare the PowerSync principal explicitly as the internal `public.users.id` used by `bonds.user_id`.
- Ensure credential issuance binds the token parameter `user_id` to internal principal (not raw auth UID).
- Validate bucket scoping rules against the ReBAC principal:
  - Example rule in the resilience doc:
    - `SELECT school_id FROM bonds WHERE user_id = token_parameters.user_id`
  - This must use internal principal and must only return schools the user has valid bonds for.

Acceptance criteria:
- A written “principal binding contract” exists (internal user id everywhere).
- PowerSync rules are audited against this contract before enabling `ENABLE_POWERSYNC`.

## Phase 3: Remove Legacy Role/Authority Usage in Runtime

Goal: runtime authorization and routing are bond/ability-based only.

Work items:
- Replace `role`/`authority` checks in UI and profile:
  - Navigation label logic uses `activeBond.capacity` with a deterministic fallback contract.
  - Edit gates use `ability.can(...)` rather than role string comparisons.
- Update “bridge” code that still maps to `FullProfileParams`:
  - Remove reliance on `profile.role ?? profile.authority` and switch to a bond-derived representation or a dedicated “primary capacity” field.
- Regenerate API schemas/contracts as needed so they no longer publish legacy facets.

Acceptance criteria:
- Ghost RBAC grep gate returns 0 hits for runtime code.
- Mobile build no longer depends on `users.role`, `users.authority`, or roles arrays.

## Phase 4: Make Perspective Durable and Deterministic

Goal: the active perspective is stable across restarts and predictable across devices.

Work items:
- Define the perspective selection contract:
  - If persisted active bond exists and is valid, use it.
  - Else choose deterministically (by `status`, `validFrom`, and entity priority).
- Decide persistence source of truth:
  - Prefer server-backed `user_preferences.active_bond_id` (multi-device correctness).
  - Local persistence remains acceptable as a cache only.
- Add “bond validity” rules:
  - `pending` bonds do not grant ability unless explicitly allowed.
  - `archived` bonds never grant ability.

Acceptance criteria:
- Multi-bond users resume consistently across restarts.
- Ability composition never uses a `pending` or `archived` bond unless explicitly intended.

## Phase 4B: Outbox/Bus Authorization at Ingest and at Consume

Goal: prevent the Outbox queue (intent engine) from becoming an authorization bypass.

Work items:
- Define an invariant:
  - No queue drain / consumer may write app-domain tables with elevated privileges unless it re-enforces ReBAC explicitly using internal principal + bond validity.
- For any consumer that uses service-role access:
  - Re-validate:
    - principal mapping (auth UID -> internal ID)
    - bond existence and bond status/validity at time of processing (not time of enqueue)
- Add replay/idempotency keys for intents:
  - “dedup” must be stable across app restarts and across retries.

Acceptance criteria:
- At least one seam test proves:
  - enqueue while authorized -> process succeeds
  - revoke bond -> queued intent is rejected at consume time
  - replay same intent -> idempotent and does not double-apply

## Phase 5: Tighten the API-Surface Guard (AuthorityInterceptor)

Goal: surface guard becomes a reliable part of zero-trust rather than a false sense of safety.

Options:
- Option A (preferred): make interceptor condition-aware.
  - Pass a minimal resource instance when required (e.g. `School` with `{ id }`).
  - Evaluate `ability.can(action, subject, instance)` rather than scanning rules.
- Option B: restrict interceptor to “coarse-safe” endpoints only.
  - All other endpoints require explicit handler-level checks and/or deny-by-default metadata.

Acceptance criteria:
- There is no endpoint that is only protected by the coarse interceptor.
- Endpoints that mutate privileged data are covered by RLS and validated by tests.

## Phase 6: Add Seam Tests (Release Confidence)

Goal: tests that catch the actual failure modes seen in this repo’s history (RLS recursion, deadlocks, principal mismatch, mixed identity).

Required seam tests:
- Principal mismatch:
  - auth UID != internal UUID, and access still works correctly for profiles and bonds.
- Multi-bond:
  - user has teacher+parent bonds; ability and routing follow active bond; archived bond doesn’t grant access.
- RLS verification:
  - A minimal suite for: teacher_profiles, student_profiles, student_record_access_grants, student_longitudinal_events, bonds.
- Migration safety:
  - Applying purge migration in a staging schema does not break contract expectations.
 - Hybrid resilience:
  - PowerSync bucket scoping matches internal principal and does not leak cross-school data.
  - Outbox consumer re-authorizes intents at processing time, not enqueue time.

Acceptance criteria:
- Tests run in CI and fail on any permission regression.

## “Ready to Run Purge” Checklist (Must All Be True)

- Phase 1 complete (core typechecks).
- Phase 2 complete (principal-correct RLS helpers/policies).
- Phase 3 complete (no runtime legacy role/authority reads).
- A minimal seam test suite exists (Phase 6 partial) for the tables touched by the purge migration.
- `packages/core/src/api/identity.generated.ts` does not publish legacy role fields.

## Implementation Notes (How to Execute Without Getting Lost)

- Do not attempt a big-bang refactor. Keep work incremental and gate with acceptance checks.
- Prefer “one truth” decisions:
  - One principal resolver.
  - One bond schema.
  - One way to choose active perspective.
- Treat RLS as code: versioned, reviewed, tested.
