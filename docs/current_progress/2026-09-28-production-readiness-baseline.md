---
title: "Production Readiness Baseline and Hardening Map"
status: "draft"
created: 2026-09-28
author: "Naveen"
scribe: "Codex"
tags: [production, testing, reliability, evidence, hardening]
---

# Production Readiness Baseline and Hardening Map

## Purpose and boundary

This is a read-only baseline of the repository's testing and production
readiness system. It implements the intent in
[`2026-09-28-production-hardening-intent.md`](../decisions/2026-09-28-production-hardening-intent.md):
make the feedback loop truthful and useful without treating the current system
as disposable or requiring a wholesale rewrite.

It is not a claim that the product is production-ready, nor a test execution
report. It identifies what infrastructure exists, what it can prove, and the
smallest sequence for making assurance stronger.

## Current inventory

The repository contains 381 source test files detected by test-directory and
test-file conventions.

| Area | Test files | Primary runtime/lane |
| --- | ---: | --- |
| `packages/` | 227 | Vitest unit, contracts, adapters, component support |
| `apps/sanctuary-api/` | 57 | Vitest API/ORPC tests and optional real integration configuration |
| `apps/gurudevi-mobile/` | 70 | Vitest/React Native boundary tests, Playwright web lane, Maestro flows |
| `apps/gurudevi-web/` | 22 | Vitest node/jsdom and Playwright |
| root `tests/` | 5 | architecture, integration contracts, workflows |
| other locations | 5 | scripts and support tests |

Filename conventions identify 54 contract/scenario/auth-oriented files, 18
integration-named files, and 6 E2E/spec files. The remainder are primarily
unit or component tests. These names are only an inventory signal; they do not
prove the runtime level of the test.

There are 101 audited `test` or `test:*` package scripts across 38 packages,
excluding the governance script itself. 38 currently declare an explicit
G0-G5/R1 evidence level. A full audit identifies 63 legacy evidence-policy
violations; the remaining unlabelled commands are tracked migration debt.

## Existing sources of truth to reconcile

These documents and mechanisms already contain valuable policy. New work must
reconcile them rather than replace them with another parallel rulebook.

| Source | Current contribution | Reconciliation need |
| --- | --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | anti-slop rules, exact test-claim protocol, G0-G5/R1 definitions, mobile build constraints | Remains repo law for implementation and reporting. |
| [`production-evidence-governance.md`](../architecture/production-evidence-governance.md) | adapted task modes, catch-early contract, mock policy, and progressive enforcement | Canonical integration of the hardening protocol; subordinate to `AGENTS.md`. |
| [`ARCHITECTURAL_TESTING_STRATEGY.md`](../ARCHITECTURAL_TESTING_STRATEGY.md) | contract-first API/architecture testing direction | Contains future-state enforcement language and older mock-test assumptions; validate against runnable current configuration. |
| [`ui-runtime-testing-standard.md`](../architecture/ui-runtime-testing-standard.md) | explicit graduation from G0 through G5 and R1 | Canonical evidence model for UI; extend its distinction between boundary and runtime proof to other domains. |
| [`ui-test-evidence-inventory.md`](../../packages/ui/docs/architecture/ui-test-evidence-inventory.md) | named current UI promotions and gaps | Provides a useful model for component-by-component truthfulness. |
| [`apps/sanctuary-api` testing standards](../../apps/sanctuary-api/docs/architecture/testing-standards.md) | current API test conventions | Reconcile mock-oriented in-process patterns with the newer real local/test database integration lane. |
| API `vitest.integration.config.ts` and `integration-setup.ts` | local/test DB, signed JWT, and running API prerequisites | This is the real-seam foundation; it must be made runnable and used for selected critical flows. |
| Mobile testing strategy and browser/Maestro configuration | boundary, browser, and device-test lanes | Establish which actual journeys are required in each lane. |
| CI workflows | browser E2E and storage-contract PR workflows; broader quality audit weekly/manual | Make gates correspond to risk and avoid calling informational checks enforcement. |
| `TEST_INFRA.md` and `TEST_READY.md` | real filesystem/SQLite acceptance evidence for Edu-Audit | Keep separate from app-release evidence; it is a production-data pipeline lane, not proof of the mobile/web product. |

## Evidence topology

| Level | Existing capability | Honest current reading | Next use |
| --- | --- | --- | --- |
| G0 contract/unit | Extensive Vitest coverage in packages and API contracts | Strongest current volume; proves pure logic and declared contracts only | Use for state machines, schemas, idempotency, authorization decisions, and error taxonomy. |
| G1 boundary/mock | Mobile and UI harnesses explicitly substitute React Native, Expo, storage, and service seams | Useful deterministic feedback; cannot prove native/browser runtime behavior | Retain for fast feedback and failure modelling, with substitutions named. |
| G2 scenario contract | Some scripts and documents declare it; explicit scenario design exists in UI standards | Inconsistent classification; a mock-heavy scenario must not be represented as real integration proof | Require named user outcome, failure, retry, cancellation, and recovery criteria before promotion. |
| G3 component-real | `@repo/ui` has a native runtime lane | Limited named component scenarios, not application-wide proof | Promote only stable G2 scenarios. |
| G4 platform-real | Playwright web lanes for mobile-web and Gurudevi web | Browser proof is available for selected public journeys; it does not certify native devices | Use for high-value browser user journeys and storage/network UX. |
| G5 device-confirmed | Maestro configuration and Android build tooling exist | No repository-wide device evidence inventory; UI inventory marks this as not started | Define a deliberately small supported-device smoke matrix. |
| R1 operational assurance | Edu-Audit has real filesystem/SQLite checks; release/build runbooks exist | No single application release assurance record currently connects device, telemetry, rollout, and rollback evidence | Create release records only after required G5 evidence exists. |

## Known enforcement gaps

1. `pnpm run check:test-evidence` now completes and reports the legacy
   baseline: 63 commands remain unclassified. Pull-request CI uses changed
   mode, which blocks only new or altered test-command claims.
2. The shared test runner rejects unclassified test commands, while most
   declared package scripts remain unclassified. Classification needs an
   incremental migration, not a blanket test rewrite.
3. At least one script labels a mock-heavy test as G2. The test is valuable as
   G1 boundary evidence, but must not be treated as real integration proof.
4. The API real-integration setup rejects mock tokens and requires explicit
   local/test infrastructure. The representative integration source now uses
   that configured API URL and JWT and turns a missing setup into a failure;
   its seven scenarios still need an executed isolated-environment report
   before any G3 claim is made.
5. The broad quality workflow is scheduled/manual. Several more targeted
   workflows run on pull requests. A check is only an enforced gate when its
   PR protection status and failure behavior are verified.

## Risk-ranked hardening lanes

| Priority | Product concern | Why it matters in production | First bounded proof |
| --- | --- | --- | --- |
| P0 | Evidence-runner truthfulness | Misclassified or unrunnable tests create false confidence across every domain | Maintain the repaired audit and classify legacy scripts deliberately without altering application behavior. |
| P0 | Auth, bootstrap, and account custody | A stale or wrong identity can expose the wrong data or run work under the wrong account | Characterize entry, callback, sign-out, switch, retry, and recovery behavior across mobile and web. |
| P0 | Durable mutations, idempotency, and synchronization | Duplicate, lost, or cross-account writes are data-integrity failures | Decide the immutable command/receipt model, then prove one small mutation end-to-end before migrating consumers. |
| P1 | Authorization and tenant boundaries | A valid session must not become access to another role, school, or account | Run selected signed-token/local-test-DB API contracts for allow, deny, stale scope, and tenant mismatch. |
| P1 | Expected failure UX | Network, storage, timeout, and backend failure must produce a safe understandable next action | Define scenario contracts for loading, retry, cancellation, recovery, and data-preservation states in critical journeys. |
| P1 | Browser offline/storage behavior | Browser state can vanish, split across tabs, or fail under quota/private mode | G1 failure modelling followed by G4 supported-browser journeys. |
| P2 | Device and release assurance | A browser or harness result cannot establish native build/device behavior | Small G5 Android/iOS smoke suite, then R1 release record with telemetry, rollback, and rollout evidence. |
| P2 | Performance and scale | Slow or overloaded critical paths become user-facing reliability failures | Establish budgets and representative load/query checks only for chosen high-volume or high-consequence paths. |

## Progressive enforcement model

The goal is to stop new uncertainty from accumulating while avoiding a
repository-wide stop-the-world migration.

1. **Make the measuring tool truthful.** Repair the evidence audit, make it
   understand current test extensions, and report unclassified commands.
2. **Warn on legacy; require classification for changed scripts.** Existing
   unclassified scripts become a tracked baseline. A new or materially changed
   test script must declare its level and environment.
3. **Require a risk contract for changed critical seams.** Identity,
   authorization, durable writes, payments, privacy, sync, and migrations need
   a short contract naming success, failure, recovery, and the highest required
   evidence level.
4. **Promote evidence only by execution.** A G1 mock lane can support fast
   development but cannot be relabelled as G3/G4/G5. Promotion must name its
   runtime command, substitutions, scenarios, and limits.
5. **Gate release candidates, not every edit, on expensive evidence.** Device
   smoke, release configuration, telemetry, rollback, and canary evidence
   belong to release readiness rather than ordinary documentation or pure logic
   edits.

## Operating cadence

| Cadence | Scope | Expected feedback |
| --- | --- | --- |
| Per change | touched tests, types, lint, and relevant G0/G1 contract | fast and deterministic |
| Per critical seam change | scenario contract plus selected real API/runtime proof | evidence of success, failure, and recovery |
| Per release candidate | chosen G4/G5 journeys, build/config safety, observability, rollback rehearsal | operational confidence |
| Periodic hardening review | gap ledger, flaky tests, incidents, performance, and delivery friction | priority adjustments, not bulk cleanup |

## Recommended next work sequence

1. **Governance migration slice:** classify the first legacy package commands
   by inspecting their actual runtime and substitutions. No product behavior
   and no blanket level assignment.
2. **Identity journey contract slice:** map one account from welcome/callback
   through bootstrap, protected entry, failure/retry, sign-out, and account
   switch. Add characterization where behavior is currently implicit.
3. **Mutation foundation decision slice:** approve data custody and receipt
   semantics before changing any queue or sync consumer. The existing mutation
   audit identifies this as a foundation, not a drive-by refactor.
4. **One vertical proof slice:** select one consequential write and cover its
   authorization, idempotency, offline/timeout recovery, real API persistence,
   browser or device UX, and observable receipt.
5. **Release-readiness template:** only after the first vertical proof, define
   the small supported device/browser matrix, telemetry checks, rollback steps,
   and R1 record format.

## Explicit non-goals

- Do not require every historic test to receive a new filename prefix.
- Do not remove all mocks; classify them and replace owned-seam mocks only
  where a critical real-seam proof is required.
- Do not broaden a bounded hardening slice into a rewrite.
- Do not label any suite, app, or release production-ready without the
  corresponding executed runtime and operational evidence.
