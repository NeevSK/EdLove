# Gurudevi Second Abstraction — Detection, Prevention, and Operating Controls

This document abstracts the recurring patterns into durable controls. It answers
how to catch similar issues proactively rather than fixing only the listed files.

| Control | Applies to | Detection | Prevention | Evidence required |
|---|---|---|---|---|
| C01 Boot measurement gate | P01 | CI/report checks for current TTI baseline. | No boot optimization claim without before measurement. | Timestamped device/route TTI report. |
| C02 Domain-success UI rule | P02 | Tests assert failure does not close/reset/announce success. | UI success branch requires typed success result. | Rejected/offline/soft-failure tests. |
| C03 Lifecycle phase contract | P03 | Race tests and effect dependency review. | Explicit bootstrap/auth/sync phases or state machine. | Ordering/cancellation/retry tests. |
| C04 Boundary invariant matrix | P04 | Client/server schema and account-scope checks. | Canonical ownership for logout, sync, local-only data. | Contract tests and reviewed matrix. |
| C05 Async failure UX rule | P05 | Static scan for console-only catches and ambiguous empty fallbacks. | Shared mutation/load wrappers require error/retry state. | Error-state component tests. |
| C06 Typed route contracts | P06 | Typecheck forbids `any` navigation props and missing route dependencies. | Route adapters provide navigation through typed interfaces. | Typecheck plus every-entry-route tests. |
| C07 Dependency ownership register | P07 | Dependency catalog diff and import inventory. | New engine requires owner, use case, migration/removal plan. | Reviewed annotation and bundle/runtime evidence. |
| C08 UI contract enforcement | P08 | Banned direct imports/local primitive scans. | `@repo/ui` bridge is the only approved public path. | Boundary lint and import audit. |
| C09 Architecture freshness gate | P09 | Generated docs compared with manifests/recent commits. | One canonical architecture/stack source with refresh command. | Fresh generated diff and review log. |
| C10 End-to-end wiring test | P10 | Registry/provider consumer mount scan. | Feature registration requires a mounted renderer or explicit disabled state. | Rendered route test and runtime screenshot/trace. |
| C11 Accessibility acceptance gate | P11 | Static semantics scan plus accessibility test tooling. | Every interactive content control needs label/role/hint/state. | Screen-reader review and component tests. |
| C12 Spec contract test | P12 | BDD scenarios run against current implementation. | Changes to behavior spec require implementation/test update. | Passing feature test and UX copy review. |

## Operating loop

1. Extract a granular issue with source location and confidence.
2. Assign one or more first-abstraction patterns.
3. Assign the prevention/detection control.
4. Reproduce or write a regression test before changing behavior.
5. Implement the smallest shared contract that prevents recurrence.
6. Run focused checks, then package-level checks.
7. Update the granular ledger, pattern document, control document, and worklog
   together.
8. Periodically regenerate stack/dependency documentation and repeat the scan.

## Anti-regression rules

- Never mark a console log as user-facing recovery.
- Never emit success before durable success is known.
- Never infer runtime performance from file size or effect count alone.
- Never remove a dependency solely because it appears redundant; prove ownership
  and usage first.
- Never treat a stale audit claim as current without rechecking source.
- Never weaken an atomicity or security test to make a new implementation pass.
