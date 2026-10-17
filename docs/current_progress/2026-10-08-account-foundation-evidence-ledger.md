---
title: "Account Foundation Evidence Ledger"
status: "active"
created: 2026-10-08
owners: [quality, identity, web, mobile]
tags: [audit, evidence, account-lifecycle]
---

# Account Foundation Evidence Ledger

| ID | Command / source | Level | Result | Proves | Does not prove |
|---|---|---|---|---|---|
| E-001 | `pnpm --filter @repo/core run test:invariants` (Vitest 5.0.0) | G2 scenario contract | 1 file, 3 tests completed | Named identity invariants under the configured test runtime | Supabase, browser session transitions, device behavior, production persistence |
| E-002 | Focused core account-transition/device-account/AuthManager Vitest run | G1 boundary | 3 files, 24 tests completed | Adapter and transition contracts with substitutes | Real provider, browser storage, multi-device behavior |
| E-003 | `pnpm --filter gurudevi-web run test:g1:auth-callback` | G1 boundary | 3 files, 8 tests completed | Callback/error boundary behavior under test doubles | Real browser callback, cookies, refresh, cross-tab, provider behavior |
| E-004 | Focused mobile route/integration Vitest run | G1 boundary | 3 files, 23 tests completed | Route and integration contracts with mocked boundaries | Metro, native storage, device lifecycle |
| E-005 | `pnpm run check:test-evidence` | Governance check | Completed successfully | Declared test commands use the evidence classification | Behavioral correctness of the underlying tests |
| E-006 | `pnpm run identity:check` | Audit check | Failed with 127 findings | Identity audit currently detects generated-artifact noise plus source findings | A clean or production-safe identity implementation |
| E-007 | Self/Workspace/Library/Community authority documents dated 2026-09-15 | Repository authority | Read and compared to code | Documented denominators, status vocabulary, and domain boundaries | Runtime completion |
| E-008 | Next floors and integration tests (`SelfFloor`, `WorkspaceFloor`, `LibraryFloor`, `CommunityFeedFloor`) | Source + G1/G2 tests | Inspected; tests are substituted | Reachable UI behavior and failure copy in the selected web target | Browser/provider/runtime evidence, full durable participation |
| E-009 | `pnpm --filter @repo/core exec vitest run src/api/onboardingClient.test.ts` (Vitest 5.0.0) | G1 boundary | 1 file, 4 tests completed | Canonical client request shape, actor-derived completion call, error propagation, malformed-response rejection | Real API, provider session, browser/device runtime |
| E-010 | `pnpm --filter @repo/core run check-types` | Static type verification | Completed with 0 findings after the integration slice | Core package types compile with the new client and tests | Runtime behavior or API deployment |
| E-011 | `pnpm --filter gurudevi-web run check-types` | Static type verification | Completed | Web onboarding integration compiles | Browser behavior, session refresh, real API |
| E-012 | `pnpm --filter gurudevi-web run test:g1:auth-callback` | G1 boundary | 3 files, 8 tests completed | Existing callback/signout/deletion route boundaries remain intact after client integration | Full signup → onboarding journey |
| E-013 | `pnpm exec jscpd packages/core/src/api/onboardingClient.ts packages/core/src/api/onboardingClient.test.ts apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx --min-lines 8 --min-tokens 50 --reporters console` | Quality check | 0 clones found | No duplicated block introduced by this slice | Architectural correctness |
| E-014 | `pnpm run check:anti-slop` | Repository quality gate | Formatting/AI-slop/security clean; fails on 532 pre-existing code-quality findings outside this slice | Shows the new files do not add format/slop/security findings | Does not prove repository-wide quality; inherited findings remain unresolved |
| E-015 | `pnpm --filter @repo/ui run check-types` | Static type verification | Completed with 0 findings after mobile caller integration | Shared mobile onboarding screen compiles with the canonical client branch | Native runtime, provider session, device storage, network |
| E-016 | `pnpm --filter @repo/ui exec vitest run --config vitest.config.mts src/screens/__tests__/onboardingJourney.test.ts src/screens/__tests__/onboardingDevFlow.test.ts` | G1 boundary / Vitest 5.0.0 mock native engine | 2 files, 6/6 tests completed | Existing journey/dev flow contracts remain intact after integration | Real Expo/RN, Supabase, device guest conversion, API runtime |
| E-017 | `pnpm --filter @repo/core exec vitest run src/webAuthorizedEntry.test.ts` | G1 boundary / Vitest 5.0.3 | 1 file, 6/6 tests completed | Completed users with capacity may enter Sanctuary without an institutional scope; incomplete identity/capacity remains gated; malformed scope roles are rejected | Real Supabase claims/session transitions, browser cross-tab behavior, server/API/database runtime |
