---
title: "UI Runtime Testing Standard"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [ui, testing, vitest, react-native, nativewind, accessibility, quality]
---

# UI Runtime Testing Standard

This is the canonical authority for how `@repo/ui` evidence is produced and
how test results are interpreted. The production gate is runtime behavior, not
the number of tests and not the number of mocks.

## Decision

`packages/ui` uses Vitest 5 as its test runner. Evidence follows one
graduation model. The scenario contract is designed before execution, while
the actual runtime gates prove progressively more of the production system.

The ordering is: **contract → boundary harness → scenario definition → real
component runtime → browser/Metro runtime → device smoke**. A higher gate may
invalidate confidence from a lower gate. A mock test cannot certify browser or
native style behavior.

## Graduation levels

“Graduated” means the highest gate that has passed for a named primitive and
scenario set. It does not mean that every test for that primitive has reached
the same level.

| Level | Promotion requirement | What may be claimed |
|---|---|---|
| G0 — Contracted | Public API, states, accessibility obligations, and platform differences are written | The intended behavior is reviewable |
| G1 — Harnessed | Boundary seams are isolated and deterministic | The test harness and adapter wiring work |
| G2 — Scenario-defined | Success, failure, retry, cancellation, loading, and recovery outcomes are named with observable acceptance criteria | The test design is not mock-shaped |
| G3 — Component-real | The real component implementation executes the G2 scenarios with real React lifecycle/state/effects | Component behavior is verified in-process |
| G4 — Platform-real | The same scenarios execute through browser DOM/CSS or Metro NativeWind runtime as applicable | Web behavior or class-to-style behavior is verified |
| G5 — Device-confirmed | A minimal smoke subset passes on a real platform build | Device-host integration is confirmed |

G2 is a prerequisite for G3, not a substitute for execution. G1 is never a
release claim. G4 is split by platform: browser evidence does not certify
Metro/native style output, and Metro evidence does not certify browser focus or
keyboard behavior. G5 is intentionally the last runtime-evidence level.

### Post-G5 release assurance

There is no G6 runtime level. G0–G5 answer whether the contract survives the
real component, platform, and device environments. After G5, the question
changes to whether the release can be safely operated and recovered in the
field. That is a release gate, not stronger component evidence.

The separate post-G5 gate is **R1 — Production-assured**. It requires a
release-candidate build, the supported device/OS matrix, production-like
configuration and auth/network conditions, telemetry for errors and crashes,
accessibility and visual regression checks, a canary or controlled rollout,
and a verified rollback/recovery path. A soak period must show no unresolved
critical regression. R1 evidence belongs to the release/operations record and
must not be used to relabel a primitive's G5 status.

### Reusable promotion record

Every primitive promotion should add a short record using this shape:

```text
Primitive: Button | Input | FormField | ...
Scenarios: ready, loading, failure, retry, recovery, cancellation
Boundary substitutions: only named host modules/services, never the component or CSS engine
G0/G1/G2 evidence: command and test file
G3 evidence: command, runtime, and passing scenario IDs
G4 evidence: browser or Metro fixture and assertions
G5 evidence: device/build smoke reference
R1 evidence: release candidate, rollout, telemetry, rollback, and soak references
Highest passed runtime level: G0–G5
Release assurance: not started | blocked | passed (R1)
Blocked by: exact failure, if any
```

## G1/G2 uplift rule for the existing suite

The package-wide boundary command is the G1 baseline only when the suite is
deterministic, its required host seams are explicit, and the command reports
all discovered files. Passing that command does not make every assertion a
G2 scenario.

Every UI test file must be classified in the evidence inventory as one of:

- **G1 harnessed** — deterministic boundary execution with named substitutions
  and observable assertions;
- **G2 scenario-defined** — one or more user journeys have explicit ready,
  state-change, cancellation, failure, retry/recovery, or completion outcomes;
- **G0 contract/unit** — pure logic, token, type, or static contract evidence
  that is useful but does not exercise a component boundary;
- **unclassified** — a governance failure that must be resolved before the file
  can be treated as evidence.

Static primitives do not need an artificial network retry scenario. For them,
G2 means the applicable state matrix is explicit: default, controlled and
uncontrolled state, disabled, accessibility state, keyboard/press transition,
and cancellation or dismissal where the primitive supports it. Async or
failure-capable primitives additionally require failure → visible error →
retry → success recovery.

The uplift order is therefore:

1. classify every existing file and make the G1 boundary run complete and
   deterministic;
2. add G2 scenario contracts for every Tier-1 primitive, starting with
   Modal/Dialog, Sheet/Actionsheet, Select/Combobox, Tabs, Toast, Checkbox,
   Radio, Switch, Progress, and Popover;
3. promote only those named scenarios to G3/G4, then run the G5 device subset;
4. record R1 separately after a release candidate exists.

No test may be promoted merely by adding a tag, renaming a suite, or increasing
coverage. The implementation and its observable acceptance criteria must pass.

The record must state the highest passed level, not the intended level. A
primitive with green mock tests and a blocked runtime remains G2 or below.

## What “real” means in this repository

Real in-process tests render the actual primitive implementation with the real
React state/effect lifecycle and real test renderer. They drive user-visible
events and assert observable output: role, name, state, text, focus, portal
presence, disabled behavior, loading completion, error recovery, and retry.

They may replace an unavoidable host boundary, such as a native module that
cannot exist in Node or a test renderer. Those replacements must be narrow,
typed, explicit, and documented. They must not replace the component state
machine, accessibility tree, class composition, or failure path under test.

G1 is therefore useful but deliberately weak. It proves the harness and
adapter seam; it does not prove that the production interaction works.

## Boundary with offline/resilience testing

This standard owns primitive rendering and interaction behavior. The separate
[offline-state resilience SOP](offline-state-resilience-sop.md) owns network
failure classification, cache integrity, outbox retry, auth expiration, and
identity migration. Do not copy those domain chaos suites into every UI
primitive.

The UI handoff is narrower: give the primitive a deterministic boundary outcome
such as `loading`, `transient failure`, `retry available`, or `success`, then
verify the user-visible state transition and recovery. The resilience SOP
proves why that outcome occurred; this standard proves that the UI responds
correctly to it.

## React Native CSS and NativeWind rule

NativeWind v5 delegates substantial work to `react-native-css`. The supported
runtime path is Metro. Vite can execute the JavaScript component graph, but an
alias or lightweight CSS mock must not be reported as evidence that
`className` compiled to native styles.

The existing style-engine fixture is the authority for that claim:
`apps/gurudevi-mobile/runtime-fixtures/style-engine/`. It builds with Metro and
checks computed web output through Playwright. New style assertions belong
there, or in an equivalent real Metro/browser fixture, rather than in a mock
of `react-native-css`.

## Vitest 4/5 capability policy

The repository may use the following capabilities when they improve evidence;
availability does not mean every capability is already enabled:

| Capability | Policy |
|---|---|
| Projects | Separate contract, native, browser, and visual/a11y entrypoints rather than one ambiguous environment |
| Environments | Use Node/jsdom/happy-dom only for the behavior they can represent; use Browser Mode for real browser behavior |
| Native engine | Use `vitest-native` for real React Native JS execution; mock only the host boundary |
| Real module graph | Prefer Vite module execution; inline problematic ESM dependencies explicitly instead of importing the app shell |
| `test.for` / `it.for` | Use for state, variant, platform, and failure matrices |
| `expectTypeOf` | Enforce public primitive prop and controlled-state contracts |
| `vi.spyOn` / `vi.importActual` | Observe or partially replace a boundary without replacing the implementation under test |
| fake timers | Use only for owned time boundaries such as toast expiry or retry backoff; assert cleanup and restore real timers |
| coverage | Use V8 coverage to find unexecuted branches; do not treat percentage as behavioral proof |
| snapshots | Use small semantic or visual snapshots only when a focused behavioral assertion is not clearer |
| sequence/shuffle/leak checks | Run deterministic order, shuffled order, async-leak, and open-handle checks in CI |
| annotations | Attach component, state, platform, theme, and evidence type to reports |

Vitest 5 features are adopted behind explicit project configuration and a
passing baseline. A feature is not considered adopted merely because the
version supports it.

## Capability disposition for this repository

The repository contains useful work at different ages. Existing text is
evidence to audit, not automatically current policy:

| Capability or guidance | Disposition | Accepted use |
|---|---|---|
| Vitest 5, ESM configuration, projects, coverage, type assertions, table-driven tests | Current | Canonical runner capabilities for the UI lanes |
| `vitest-native` real React Native engine | Current but partial | Real in-process native execution; expand by primitive and scenario |
| React Native Testing Library | Current | User-observable component interaction and accessibility assertions |
| Metro style-engine fixture | Current and authoritative for CSS claims | NativeWind/react-native-css compilation and rendered style evidence |
| Existing mock-engine UI tests | Transitional | Harness and boundary checks only; not release evidence |
| Jest tests in app packages | Transitional/legacy boundary | May remain for unrelated app mounts; no new `@repo/ui` policy may depend on them |
| Playwright web E2E | Current web runtime tool | Browser behavior and CSS/focus evidence where component tests cannot represent it |
| Maestro/device flows | Final smoke layer | Device-host verification after lower layers are green |
| Vite-side `react-native-css` or NativeWind aliases | Test seam only | Never claim native style correctness from the alias |
| Old plans or docs that call Jest prop snapshots “runtime proof” | Obsolete for this standard | Preserve as history; link this standard when updating them |

The implementation backlog must therefore be ordered by scenario coverage and
runtime evidence, not by converting every old test file one-for-one.

## Required evidence for Tier-1 primitives

Every Tier-1 primitive must have evidence for:

- default, variant, size, disabled, loading, invalid, empty, and error states;
- controlled and uncontrolled state where applicable;
- keyboard, press, focus, dismissal, and repeated interaction behavior;
- accessible role, name, description, and state;
- failure → visible error → retry → success recovery where applicable;
- native and web differences that affect user behavior;
- portal, timer, subscription, animation, and async cleanup;
- style/token output through the real supported runtime when `className` is part
  of the contract.

Tests should assert what a user or assistive technology can observe. Internal
prop shape, mock call counts, and implementation-specific class strings are
supporting evidence only.

## Current repository status

- **Audit date: 2026-09-07.** `packages/ui` has 50 test files: 32 render
  components, 18 are pure/non-rendering, and only a small native-engine subset
  has been exercised against real React Native execution. The default Vitest
  config uses the `vitest-native` mock engine and aliases NativeWind/
  `react-native-css`; therefore the default render suite is G1 even
  when it uses RNTL-style interaction helpers.
- Ten files contain an obvious failure/retry/error/recovery term, but naming a
  failure is not sufficient evidence. Each Tier-1 scenario still needs an
  observable state transition and recovery assertion.
- The Vitest 5 mock/boundary lane is a bootstrap lane and currently passes its
  migrated baseline; it is not the production-quality gate.
- The `vitest-native` lane executes real React Native 0.86.3 for the promoted
  Button/Input/FormField slice. Its native-only alias points NativeWind v5 at
  the real `react-native-css` native API; it is not a CSS mock. This gives the
  slice G3 evidence while leaving unpromoted primitives at their prior gate.
- The Metro style-engine fixture is the current real NativeWind/CSS evidence
  path. Its Button/Input/FormField scenario now exports successfully, loads in
  a static browser server with zero page errors, verifies computed styles, and
  exercises helper → validation error → loading → transient failure → retry →
  success. Vite-side CSS aliases remain harness conveniences only.
- Browser behavior, scenario/recovery matrices, and visual/a11y reporting are the next
  implementation layers, not assumptions implied by the mock suite.
- Button has passed G2 and now has G3 native-engine plus G4 browser/Metro
  evidence.
- Input/FormField have passed G2 for helper → invalid-error → recovery and now
  have G3 native-engine plus G4 browser/Metro evidence.
- The fixture is not device evidence: G5 still requires a device/emulator
  smoke path, and browser G4 does not certify native focus, gesture, or CSS
  behavior.

## Enforcement in commands and review

The package exposes separate commands so the evidence type is visible:

- `pnpm --filter @repo/ui test:boundary` — G1 harness lane;
- `pnpm --filter @repo/ui test:runtime` — real React Native engine lane;
- `pnpm --filter @repo/ui test:governance` — evidence audit and classification;
- `pnpm --filter @repo/ui test` — compatibility alias for the boundary lane,
  retained so existing callers do not silently change meaning.

Until scenario and browser/Metro lanes are implemented, CI must not describe
the compatibility `test` command as full UI production verification. New
runtime evidence must use an explicit filename/configuration lane and must not
inherit the boundary config's NativeWind/CSS aliases.

## Ownership and document hierarchy

1. This document owns UI runtime test hierarchy and evidence requirements.
2. `docs/architecture/vite-vitest-capabilities-matrix.md` owns the general
   Vitest/Vite capability reference, not UI release policy.
3. `packages/ui/docs/architecture/a11y-governance.md` owns accessibility
   semantics and review rules; this document defines how to verify them.
4. `apps/gurudevi-mobile/runtime-fixtures/style-engine/README.md` owns the
   concrete Metro style-engine fixture procedure.
5. `docs/current_progress/2026-09-07-ui-primitives-production-hardening-plan.md`
   owns execution status and phased work; it must link here and may not
   redefine the hierarchy.

When these documents disagree, this standard controls test evidence and the
dated plan is updated rather than creating a competing testing policy.

## Change protocol

Update this document when a test layer, evidence rule, runner capability, or
NativeWind/React Native runtime assumption changes. Record implementation
progress in the dated plan. Once the program is complete, archive only the
dated plan according to `docs/docs-sop.md`; keep this standard active.

## References

- [Vitest environments](https://vitest.dev/guide/environment)
- [Vitest projects](https://main.vitest.dev/guide/projects)
- [Vitest Browser Mode](https://main.vitest.dev/guide/browser/)
- [Vitest component testing](https://vitest.dev/guide/browser/component-testing)
- [Vitest coverage](https://main.vitest.dev/guide/coverage)
- [NativeWind/react-native-css repository](https://github.com/nativewind/react-native-css)
