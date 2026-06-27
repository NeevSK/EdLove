---
title: "Onboarding API Routing — Current Progress"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [current-progress, onboarding, api-routing, integration-tests, sanctuary]
---

# Onboarding API Routing — Current Progress

## Goal

Route `createInitialBond` and `completeOnboarding` through the Sanctuary API (away from direct Supabase), fix CORS to allow any localhost origin dynamically, add comprehensive tests, document everything.

## Task List

### Completed

- [x] **Handler implementation** — `packages/core/src/api/handlers/onboarding.ts`
  - Auth guard returns 401 for anonymous/missing user
  - try/catch with 400 for Zod validation errors, 500 for internal errors
  - Idempotent `personal_classroom` creation via `findFirst` check
  - Capacity validation in `completeOnboarding` (400 when missing capacity + no bonds)
  - Zod schema validation on both request bodies
  - Bond `findFirst`/`create` pattern (update if exists, create if not)

- [x] **Contract metadata** — `packages/core/src/api/onboarding.contract.ts`
  - `createInitialBond` POA: `action: 'update'` (not `'create'`) because:
    - Cedar guest policy only permits `read`/`update` on `User` for non-admin roles
    - `'create'` would be blocked by Cedar policy gateway
  - `completeOnboarding` POA: `action: 'update'` (same reasoning)

- [x] **Frontend API client** — `packages/core/src/api/onboarding.ts`
  - `createInitialBond` and `completeOnboarding` call API via `hc` client
  - `getActivePerspective` uses dynamic `import()` of factory to avoid circular dependency
  - Other methods (`requestSchoolJoin`, `requestClassroomJoin`, etc.) still use factory

- [x] **Route registration** — `apps/sanctuary-api/src/core/app.ts:710-713`
  - Vertically-sliced `onboardingApp` with two `registerRoute` calls

- [x] **CORS dynamic origin** — `apps/sanctuary-api/src/core/app.ts:258-270`
  - Allows any `http://localhost` or `https://localhost` origin (any port)
  - Production restricted to `https://platform.gurudevi.edlove.org`
  - Falls back to `null` (no CORS) for unknown origins

- [x] **Test infrastructure** — `apps/sanctuary-api/src/__tests__/setup.ts`
  - `setMockUserData()` for configurable mock user data per test
  - `getItemAsync`/`setItemAsync`/`deleteItemAsync` in dummyShim (fixes auth storage TypeError)
  - Mock ZenStack DB proxy via `createMockDelegate`

- [x] **Integration tests** — `apps/sanctuary-api/src/__tests__/onboarding.test.ts` (7 tests, all passing)
  - Valid onboarding (200)
  - Idempotent re-onboarding with existing bond (200)
  - Invalid request body (400)
  - Missing user (404)
  - Completed onboarding with existing bonds (200)
  - Default sanctuary creation when bonds empty (200)
  - Missing capacity with no bonds (400)

- [x] **POA contract tests** — `packages/core/src/api/__tests__/onboarding-poa.test.ts` (5 tests, all passing)
  - POA metadata assertions (both routes)
  - Route definition validity (method, path, responses, request body)

### In Progress

- [ ] Documentation per docs-sop.md (this document + ADR + Core doc + INDEX.md)

### Not Started

- [ ] Update `docs/architecture/tech-stack-and-standards.md` CORS section
- [ ] Update `docs/architecture/testing-standards.md` with handler unit test / integration test patterns

## Known Issues / Blockers

- None currently. All 34 existing tests continue to pass with no regression.

## Key Decisions

| Decision | Rationale |
|---|---|
| Onboarding routes through API, not direct Supabase | Single security boundary, server-side logging, consistent auth, future-proof architecture |
| `createInitialBond` POA = `update`, not `create` | Cedar policy only allows non-admin users `read`/`update` on `User`; `create` would be blocked |
| Integration tests use mock ZenStack DB (Proxy) | Avoids real DB dependency in tests; `setMockUserData`/`setMockActiveBond` per-test config |
| JWT bypass in tests via UUID token | `verifySupabaseJwt` accepts UUID-format tokens when `NODE_ENV=test` |

## Next Steps

1. Complete documentation (this doc + ADR + Core doc)
2. Create/update `docs/INDEX.md`
3. Update tech-stack-and-standards.md (CORS section)
4. Update testing-standards.md (integration test patterns)
