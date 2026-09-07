---
title: "Gurudevi Audit Remediation SOP"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, mobile, audit, remediation, sop, quality]
---

# Gurudevi Audit Remediation SOP

## Purpose

Provide one repeatable operating procedure for implementing any item from the
Gurudevi audit recovery plan without reintroducing false success, silent
failure, architecture drift, or unsafe native build changes.

## Inputs

- Recovery plan: `../current_progress/2026-09-07-gurudevi-audit-recovery-plan.md`.
- Audit index and original reports: `../../temp/GURUDEVI_AUDIT_INDEX.md`.
- Granular issue source: `../../temp/GURUDEVI_GRANULAR_LINE_BY_LINE_CROSSLIST.md`.
- Repository rules: repository-root `AGENTS.md`.

## 1. Select one bounded slice

1. Choose one GD item or a tightly coupled group listed in the same Phase.
2. Read the matching L entries and then the original supplied audit section.
3. Trace the current call chain before assuming the audit is still current.
4. Record: user action, success condition, failure condition, offline/queued
   condition, recovery action, platform scope, and affected routes.
5. If the item is stale, corrected, or disproven, update the ledger/worklog and
   stop rather than implementing a historical fix.

## 2. Design the behavior contract

Every asynchronous user action must answer:

| State | Required user experience |
|---|---|
| Pending | A visible, accessible pending state; duplicate action prevented. |
| Confirmed success | Success feedback only after durable acknowledged success. |
| Queued/local success | Explicitly say it is saved on device and still needs sync. |
| Failure | Preserve input where possible, show cause/recovery, never close/reset as success. |
| Empty data | Only show when the query succeeded and returned no data. |
| Stale data | Identify freshness and provide retry/refresh where the data matters. |

Use an existing shared contract (`useSafeMutation`, `handleAPIError`, shared
toast/feedback primitives, clipboard adapter, typed route adapter) before
introducing another helper. Search the workspace first.

### Lifecycle, auth, or routing slices

These are RED-zone changes. Before implementation, write a feature spec that
names the exact target files, existing utilities reused, explicit exclusions,
and a cognitive-complexity budget below 15. In particular:

- treat `bootstrapRoutes.ts` as the pure route decision authority; do not mix
  Context and persisted Zustand state to make a second decision;
- enumerate every sign-out, account-recovery, and account-switch caller, then
  specify one account-scoped device-cleanup invariant;
- separate session observation, profile hydration, telemetry, recovery, and
  device-account capture into explicit contracts before moving code;
- prove live-provider mounting, deep-link, and sync behavior before retiring
  `SanctuaryProvider` or the duplicate native lifecycle implementation;
- keep `app/_layout.tsx` a thin shell—never make it a new lifecycle owner.

## 3. Implement safely

- Keep the diff small and confined to the selected feature plus direct tests.
- Do not use `any`, double casts, ignored errors, or browser-only global APIs in
  native-capable code.
- Do not hand-edit `android/` or `ios/`.
- Do not change Expo/RN/sacred package versions unless the change is explicitly
  approved and has its own compatibility/device-validation scope.
- For destructive actions, require explicit confirmation or an intentional
  recoverable undo model on every supported platform.

## 4. Verify proportionately

Minimum for every repaired issue:

1. Focused unit/component test for success and failure.
2. Typecheck and lint for the touched package.
3. Read the diff with deletions first; confirm no guard or assertion was lost.
4. Run `pnpm run check:anti-slop`.

Additionally required when applicable:

| Change type | Required validation |
|---|---|
| Native UI/a11y | Debug APK from WSL plus screen-reader/touch/font-scale walkthrough. |
| Route/deep link | Every route entry; native dev-client deep-link test. |
| Auth/logout/account switching | Multi-account and expired/offline session paths. |
| Lifecycle/route authority | Cold bootstrap, account recovery, every logout caller, deep links, and provider-mount coverage. |
| Sync/local persistence | Offline queue, retry, mixed batch, and account-change cases. |
| Dependency/native config | Stack-map flow, Expo diagnostics, WSL debug build, physical device. |
| Performance | Before/after metric from the existing Beast/Observe baseline. |

## 5. Update evidence in the same PR

Update all of the following with exact evidence:

- affected GD and L item status;
- `GURUDEVI_AUDIT_COVERAGE_MATRIX.md`;
- `GURUDEVI_AUDIT_WORKLOG.md`;
- recovery plan phase status if a milestone moved;
- any canonical architecture or runbook document whose stated contract changed.

Do not edit historical audit prose to make it look like the issue never existed.
Add a dated resolution note instead.

## 6. Completion checklist

- [ ] Current source and original audit were both read.
- [ ] Behavior contract covers pending, success, queued, failure, and retry.
- [ ] No false success, silent error, or error-as-empty path remains.
- [ ] Tests demonstrate the repaired failure path.
- [ ] Relevant package checks and anti-slop gate pass.
- [ ] Device/runtime validation completed when required.
- [ ] Audit ledger, matrix, and worklog contain the evidence.

## Escalation rules

Stop and create a separate design/decision slice when:

- a fix crosses packages or requires a new shared abstraction;
- a dependency/native configuration change is necessary;
- current source contradicts the audit and the intended product behavior is
  unclear;
- a data migration, sync schema, or account-boundary change could affect stored
  user data;
- lifecycle/provider ownership, bootstrap routing, or logout behavior crosses
  the core/app boundary;
- the change cannot be made readable in a small reviewable diff.

## Non-negotiable release rule

No phase is “done” because code compiles. It is done only when the user-facing
failure behavior is tested, platform behavior is checked where relevant, and the
audit evidence is updated.
