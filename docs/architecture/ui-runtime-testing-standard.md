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

`packages/ui` uses Vitest 5 as its test runner. Tests are layered by the
reality they exercise:

| Layer | Name | What it proves | Release role |
|---|---|---|---|
| 0.0 | Inventory and contract | The intended public API, states, semantics, and platform obligations are explicit | Required before implementation |
| 0.1 | Boundary harness | The component can be isolated and native-host boundaries are wired correctly | Bootstrap only; never sufficient |
| 0.2 | Scenario and recovery contract | User journeys including loading, failure, retry, cancellation, and recovery are explicit before choosing test doubles or runners | Required design input |
| 0.3 | Real in-process runtime | Real component code, state transitions, effects, timers, portals, and accessibility output execute together against the 0.2 scenarios | Primary component gate |
| 0.4 | Browser runtime | Real DOM, CSS, focus, keyboard, hover, Escape, and browser portal behavior execute against the same scenarios | Required for web behavior |
| 0.5 | Metro style-engine fixture | NativeWind v5/react-native-css class compilation and rendered style output run through the supported Metro path | Required for CSS/native-style claims |
| 0.6 | Device smoke | A small set of platform-host assumptions hold on a real build/device after test-running evidence is green | Final confidence layer, not a replacement for component tests |

The important ordering is: **contract → boundary harness → scenario/recovery
contract → real runtime → browser/Metro runtime → device smoke**. The scenario
contract comes before the runtime so tests are designed around user-visible
failure and recovery, not around whatever a mock happens to return. A higher
layer may invalidate confidence from a lower layer. A mock test cannot certify
a browser or native style result.

## What “real” means in this repository

Real in-process tests render the actual primitive implementation with the real
React state/effect lifecycle and real test renderer. They drive user-visible
events and assert observable output: role, name, state, text, focus, portal
presence, disabled behavior, loading completion, error recovery, and retry.

They may replace an unavoidable host boundary, such as a native module that
cannot exist in Node or a test renderer. Those replacements must be narrow,
typed, explicit, and documented. They must not replace the component state
machine, accessibility tree, class composition, or failure path under test.

Layer 0.1 is therefore useful but deliberately weak. It proves the harness and
adapter seam; it does not prove that the production interaction works.

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

- The Vitest 5 mock/boundary lane is a bootstrap lane and currently passes its
  migrated baseline; it is not the production-quality gate.
- The `vitest-native` lane proves that selected primitives can execute against
  the real React Native runtime, but it is not yet complete for every Tier-1
  primitive.
- The Metro style-engine fixture is the current real NativeWind/CSS evidence
  path. Vite-side CSS aliases remain harness conveniences only.
- Browser behavior, scenario/recovery matrices, and visual/a11y reporting are the next
  implementation layers, not assumptions implied by the mock suite.

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
