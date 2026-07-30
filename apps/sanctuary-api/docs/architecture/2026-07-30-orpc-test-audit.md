---
title: "oRPC Migration Test Reality Audit"
status: "active"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
scribe: "Codex"
tags: [api, testing, audit, orpc, powersync]
---

# oRPC Migration Test Reality Audit

## Finding

The current suite is a layered test suite, but it is not yet a complete production-equivalence suite. The new tests are real at the in-memory HTTP and procedure level; they are not real-database, real-Cedar-sidecar, real-Bun/Node, or real-device tests.

## What the new oRPC tests actually exercise

`apps/sanctuary-api/src/__tests__/orpc-client.ts` creates an oRPC `RPCLink` whose fetch implementation calls `app.fetch`. Therefore these tests execute the actual in-memory path:

```text
oRPC client serialization
→ Hono app
→ Hono middleware
→ shared context construction
→ oRPC Fetch handler
→ contract input validation
→ Cedar gate code path
→ native handler
→ output validation and oRPC response decoding
```

The oRPC tests cover successful self/profile, profile social-link CRUD, daily content, library resources, collections, resource creation, collection creation, transactional engagement, bookmarked-resource reads, authorization snapshot, education, grading, attendance, principal notes, community group messaging/comments/polls/reports/post ownership/resonance, direct messaging, notifications/safety, announcements, and admin mutations. Onboarding tests cover native completion, founder-bond creation, bond revocation, and raw HTTP invalid-input responses. The sync authorization test covers the native procedure returning a typed 403. Community tests now execute comment, poll, report, and group-message handlers as well as input rejection. Education tests now execute classroom lifecycle, enrollment, shadow-student, classroom-note CRUD, snapshot/timeline, material, assignment, upcoming-assignment, and submission procedures through the native contract. The suite also exercises the selected read-only OpenAPI adapter. The current API suite has 85 passing tests across 17 files.

The same suite passes under Bun 1.3.14 (`pnpm run test:bun`). This proves API runtime parity for the current mocked/in-memory suite, but not parity against a real database or sidecar evaluator.

## What is mocked

The common API setup replaces `@repo/database/client` with a single proxy-style mock database. It also uses test JWT behavior and mocked user/bond state. Consequently, these tests do not prove:

- a real PostgreSQL/ZenStack query;
- real ZenStack policy denial;
- real Supabase JWT cryptographic verification;
- real Cedar sidecar/Rust evaluator behavior;
- unique database instances for each concurrent request;
- real OTel span export;
- real database-backed Bun and Node parity;
- Expo native/web runtime behavior.

The 50-request test is useful for exercising concurrent request flow, but the current shared mock means it is not sufficient evidence for request-scoped database isolation or cross-tenant database leakage.

## Which tests remain legacy-aligned

Several downstream tests still call legacy routes such as `/api/grades` with `app.request()`. Those tests exercise old Hono registrations and remain valuable characterization tests, but they do not verify that equivalent native oRPC procedures exist. The migrated community/admin callers no longer use the legacy route client, and the legacy community/admin route registrations have been removed from the app.

They should be labeled as one of:

- `legacy characterization` while the domain is not migrated;
- `native oRPC integration` once the route uses the shared oRPC client;
- `real integration` only when real database/authorization/runtime dependencies are used.

## PowerSync test reality

`packages/core/src/adapters/__tests__/powersyncSyncIntegration.test.ts` tests the connector’s local behavior and batch completion semantics. The oRPC client is mocked, so it proves:

- a non-empty batch is read with the expected limit;
- the connector sends one batch procedure call;
- `batch.complete()` runs after a successful result;
- rejected local writes do not upload.

It does not prove actual HTTP serialization or server transaction behavior. The new `packages/core/src/api/__tests__/sync.test.ts` tests the real `applyPowerSyncBatch` function against a fake transaction and proves retry-cache and failure behavior, but it still does not use a real database.

## Mobile contract-test alignment

The Expo mobile educational contract test was previously coupled to the legacy contract-coverage registry. That test failed during module loading under the current Node/Vitest setup, before executing an assertion, because the legacy import reached an Expo TypeScript file in `node_modules`. It was corrected to import the canonical `educationalORPCContract` directly and assert the migrated native procedures. The focused mobile contract/bootstrap tests now pass 4/4. This is a test alignment repair, not evidence of a device build or native runtime pass.

The broader mobile suite initially reported 74 passing tests and 5 failed suites. The failures were harness/configuration issues: duplicate `paths` keys made nine package tsconfig files invalid JSON, the Expo module mock was bypassed by dependency externalization, and architecture tests imported legacy package barrels. Those issues were repaired; the full mobile suite now passes 85 tests across 18 files. The self POA test was aligned to assert the canonical native self contract rather than exercising a legacy Hono client path.

## Required next test layers

1. Keep the fast mocked contract/service tests.
2. Add native oRPC HTTP integration tests for every migrated procedure.
3. Add a test profile using a disposable real database and real ZenStack client.
4. Run Cedar allow/deny tests against the supported evaluator mode.
5. Run the API suite under both Node and Bun.
6. Add a real PowerSync connector test against the in-memory Hono app or a test server, while retaining the mocked connector test.
7. Add Expo web and native-compatible client tests for auth, offline classification, retry, and cancellation.
8. Preserve legacy characterization tests until each domain has an equivalent native oRPC suite; then delete the old route tests with the old routes.

## Acceptance interpretation

The current passing numbers are meaningful but narrow:

- API tests passing means the current mocked Hono/oRPC behavior is internally consistent.
- PowerSync tests passing means connector and batch service logic is consistent under controlled doubles.
- They do not mean the complete API cutover is production-ready.
