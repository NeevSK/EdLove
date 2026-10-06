---
title: "Phase 1 Evidence Classification Ledger"
status: "active"
created: 2026-09-28
author: "Naveen"
scribe: "Codex"
tags: [production, testing, evidence, phase-1, governance]
---

# Phase 1 Evidence Classification Ledger

## Decision boundary

Phase 1 makes test evidence claims and enforcement truthful. It does not
rewrite product behavior, inflate an isolated browser or device command into a
graduation, or convert every historic command in bulk. The governing policy is
[`production-evidence-governance.md`](../architecture/production-evidence-governance.md).

The full audit currently identifies 63 legacy unclassified test commands.
Pull requests now run changed-command mode, so an altered or added test command
cannot evade evidence classification while the backlog is worked down.

## Priority-surface classification

| Surface | Command group | Classification | What it proves | Important limit |
| --- | --- | --- | --- | --- |
| `@repo/core` | `test:logic` | G0 | Pure logic contracts under Vitest. | Does not prove host adapters, React Native, storage, or network behavior. |
| `@repo/core` | `test`, `test:watch`, `test:ui`, focused account tests | G1 | Deterministic package behavior with the configured host shims and mocks. | The aggregate suite substitutes platform/service boundaries; it is not real component or device proof. |
| Sanctuary API | `test`, `test:coverage`, `test:bun` | G1 | API contract/boundary behavior under the Vitest harness. | It is not a real database, HTTP service, or signed-auth result. |
| Sanctuary API | `test:integration`, `test:integration:watch` | G3 execution lane | The named command is restricted to a running test API, explicitly local/test database, and signed test JWT. | No execution report exists in this ledger. It is **not G3 graduated** until the applicable lower chain is recorded. |
| Gurudevi mobile | Vitest commands and focused route/capability commands | G1 | React Native/Expo boundary behavior under the configured Vitest substitutions. | Does not prove Metro or native-device behavior. |
| Gurudevi mobile | Playwright `test:e2e*` commands | G4 execution lane | Browser/Expo-web journey execution when run. | An isolated G4 result is not graduated: required G2/G3 evidence and device assurance remain separate. |
| Gurudevi web | focused auth-callback and self-journal commands | G1 | Route and UI boundary behavior under Vitest + jsdom substitutions. | The self-journal command currently exposes six browser-availability failures; it is not supporting green evidence. |
| Gurudevi web | Playwright `test:e2e*` commands | G4 execution lane | Browser journey execution when run. | It does not establish native-device behavior or bypass lower applicable levels. |

## Corrected misleading behavior

`apps/sanctuary-api/src/__tests__/integration/self.integration.test.ts` no
longer supplies a retired `mock-token`, silently returns when setup is absent,
or targets a hard-coded API URL. The test obtains its API URL and JWT from the
validated integration environment. A missing user or JWT fails the scenario.

This prevents seven integration scenarios from reporting green after a skipped
real-seam path. It does not itself establish that the test environment or API
is working; only a recorded execution with those prerequisites can do that.

## Executions recorded during this phase

- `pnpm --filter @repo/core run test:logic` — G0 / Vitest 5.0.0: 36 test
  files and 249 tests completed. This proves the selected pure-logic contracts
  in the Vitest runtime; it does not prove platform adapters, storage, network,
  browser, or native-device behavior.
- `pnpm --filter gurudevi-web run test:g1:auth-callback` — G1 / Vitest 5.0.0
  with the web jsdom harness: 3 test files and 8 tests completed. This proves
  the named route assertions under that boundary harness; it does not prove a
  deployed Next.js runtime, browser cookie behavior, or device UX.
- `pnpm --filter @repo/sanctuary-api run test:integration` — G3 execution
  attempt / Vitest 5.0.0: 1 suite failed during setup and its 7 scenarios were
  skipped because `TEST_DATABASE_URL`, `TEST_API_URL`, and `TEST_AUTH_TOKEN`
  were unavailable. This is a correct prerequisite failure, not G3 evidence.
- `pnpm --filter @repo/sanctuary-api exec tsc --noEmit` currently fails at
  `src/ai/routes.ts:286` because `totalTokens` is not present on every member
  of the inferred usage union. That file is outside this Phase 1 change; the
  API package also lacks a standard `check-types` script.

## Remaining classification debt and next owner action

1. Classify the 63 legacy commands in small package-owned slices; inspect their
   runtime and substitutions before assigning a level.
2. Supply isolated `TEST_DATABASE_URL`, `TEST_API_URL`, and a signed
   `TEST_AUTH_TOKEN`, then run the Sanctuary API integration lane and record
   its scenario counts, engine, substitutions, and limitations.
3. Characterize the Gurudevi web browser-practice availability decision before
   changing its six failing self-journal assertions. The current tests expect
   browser availability while the product takes its unavailable recovery path.
4. For each critical journey, add the missing G2 scenario contract and G3 real
   component proof before treating any existing G4 command as graduated.
5. Configure the changed-command evidence job as a required branch-protection
   check. The workflow is present, but repository administrator settings are
   external to this workspace.

## Phase 1 completion criteria

- The audit itself detects current test filenames and command changes.
- Changed test commands are blocked unless their claim is explicit and
  compatible with direct mock usage.
- The priority surfaces have deliberate, documented classifications.
- Known false-green integration behavior is removed.
- Backlog size and the next bounded migrations are visible rather than hidden.
