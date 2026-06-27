---
title: "Route Onboarding Through Sanctuary API"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [decisions, onboarding, api-routing, sanctuary, architecture]
---

# ADR: Route Onboarding Through Sanctuary API

## Status

Accepted

## Context

Onboarding (`createInitialBond`, `completeOnboarding`) was initially implemented via direct Supabase calls through `IdentityManager`. This was expedient for prototyping but introduced problems:

1. **Dual security boundaries** — The mobile app directly accessed Supabase, bypassing the Sanctuary API's Cedar POA gate and ZenStack ReBAC.
2. **No server-side logging** — Direct Supabase calls couldn't benefit from the API's structured logging.
3. **Future-proofing** — The architecture already routes other operations through the API; onboarding was an outlier.

## Decision

Route `createInitialBond` and `completeOnboarding` through the Sanctuary API using the established SovereignRoute pattern:

- **Contracts**: `packages/core/src/api/onboarding.contract.ts` — two `post` routes under `/identity/`
- **Handlers**: `packages/core/src/api/handlers/onboarding.ts` — ZenStack `db` usage with auth guard, Zod validation, idempotent creation
- **Client**: `packages/core/src/api/onboarding.ts` — `onboardingAPI.createInitialBond()` / `completeOnboarding()` call via `hc` RPC client
- **Registration**: `apps/sanctuary-api/src/core/app.ts` — vertically-sliced Hono app with `registerRoute`

### POA Metadata

Both routes carry `{ action: 'update', subject: 'User' }` (not `'create'`). This is because:

- Cedar guest policy (`guest/personal.cedar`) permits `read`/`update` on own `User` for all non-`wanderer` capacities
- Only `admin` role can `create` a `User`
- The handlers do `update` the user profile (display_name, full_name, capacity, etc.) — the user already exists (created by Supabase Auth)

### CORS

Development CORS allows any `http://localhost` or `https://localhost` origin (any port). Production is restricted to `https://platform.gurudevi.edlove.org`. Unknown origins get `null` (no CORS).

## Consequences

### Positive

- Single security boundary for onboarding
- Server-side Zod validation, error handling, and logging
- Consistent with other API patterns in the codebase
- All 34 existing tests pass with no regression
- 7 new integration tests cover all onboarding scenarios
- 5 new POA contract tests verify contract metadata and route validity

### Negative

- Slightly more latency (localhost call vs. direct DB)
- `getActivePerspective` still uses dynamic `import()` to avoid circular dependency — minor code smell

### Risks

- None identified. The pattern is well-established (SovereignRoute + `registerRoute` + `hc` client).
- Mock-based integration tests cover all failure modes (missing user, invalid body, missing capacity, etc.)

## Alternatives Considered

### Direct Supabase (status quo ante)
- **Rejected**: Bypasses Cedar POA, no server logging, inconsistent architecture.

### Middleware-only (no contract)
- **Rejected**: Would skip SovereignRoute conventions, losing OpenAPI schema generation and POA metadata.

## References

- [current_progress/2026-06-26-onboarding-api-routing.md](../current_progress/2026-06-26-onboarding-api-routing.md)
- [Core/onboarding.md](../Core/onboarding.md)
- [packages/core/src/api/onboarding.contract.ts](../../packages/core/src/api/onboarding.contract.ts)
- [packages/core/src/api/handlers/onboarding.ts](../../packages/core/src/api/handlers/onboarding.ts)
- [packages/core/src/api/onboarding.ts](../../packages/core/src/api/onboarding.ts)
- [apps/sanctuary-api/src/core/app.ts](../../apps/sanctuary-api/src/core/app.ts)
- [apps/sanctuary-api/src/__tests__/setup.ts](../../apps/sanctuary-api/src/__tests__/setup.ts)
