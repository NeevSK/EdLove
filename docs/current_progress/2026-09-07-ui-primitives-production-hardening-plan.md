---
title: "UI Primitives Production Hardening and Vitest 5 Modernization"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [ui, primitives, accessibility, vitest, nativewind, tailwind, reanimated, hardening]
---

# UI Primitives Production Hardening and Vitest 5 Modernization

## Summary

Harden `@repo/ui` from prototype-grade primitives into a production-owned design system with reliable Vitest 5 testing, explicit accessibility contracts, stronger interaction and failure-state behavior, consistent `cn`/NativeWind v5 composition, Tailwind CSS v4 token-safe styling, Reanimated 4 interaction polish, native/web parity, and visual/runtime verification.

The canonical implementation remains `packages/ui/src/components/ui`. Legacy Gluestack and `components-legacy` remain migration/deletion candidates and are not expanded.

The authoritative evidence hierarchy for this plan is
[`docs/architecture/ui-runtime-testing-standard.md`](../architecture/ui-runtime-testing-standard.md).
This plan records execution status; it does not redefine what a real test is.

## Phases

### Phase 0 — Establish evidence and test governance

Create a baseline matrix for Button, Input/TextInput, FormControl/FormField, Dialog/Modal, Sheet/Actionsheet, Select/Combobox, Tabs, Toast, Checkbox, Radio, Switch, Progress, and Popover. Record public props, variants, native/web implementation, accessibility role/name/state, focus and keyboard behavior, loading/disabled/invalid/error behavior, portal behavior, reduced-motion behavior, current tests, and missing coverage.

Move the source-owned UI test lane to Vitest 5. No new Jest tests may be added for `packages/ui`.

Exit gate: Vitest 5 executes the UI suite; failures are classified as harness or implementation failures; the baseline matrix is linked from the plan and UI inventory.

### Phase 0.1 — Establish scenario-first evidence governance

Classify the existing UI tests into the canonical layers: contract, boundary
harness, scenario/recovery contract, real in-process runtime, browser runtime,
Metro style-engine runtime, and device smoke. Define the user-visible scenario
and recovery matrix before selecting mocks or implementing more test cases.
Mark mock-heavy tests as bootstrap evidence only. Do not count a mock of
NativeWind, `react-native-css`, Reanimated, or a portal host as proof of
native/web output.

Promote the existing Metro style-engine fixture as the source of truth for
NativeWind/react-native-css compilation claims. Add the missing real-runtime
and recovery executions before raising coverage thresholds. Keep Vitest 5
projects/Browser Mode as explicit entrypoints rather than mixing environments
inside one ambiguous suite.

Exit gate: every Tier-1 primitive has an evidence classification, every
production claim names its required layer, each failure/retry/recovery journey
has an observable acceptance contract, and the mock lane is visibly
non-authoritative in CI and documentation.

### Phase 1 — Vitest 5 migration and deterministic harness

Replace the `packages/ui` Jest command with Vitest 5 while preserving React Native Testing Library semantics. Use ESM-native Vitest imports, typed `vi` mocks, a dedicated setup file, explicit React Native/Reanimated/Worklets/Skia/AsyncStorage/portal mocks, Vitest disk caching, deterministic sequencing with optional shuffle, tagged tests, async leak detection, selective fake timers, `expectTypeOf`, table-driven tests, and `vi.when` where appropriate.

Resolve the current Reanimated `isSharedValue` failure, Vitest-through-CommonJS failures, `@orpc/client` ESM transformation failures, and unrelated application dependency loading from primitive tests. Maintain separate contract, React Native, web/browser, and visual/a11y entrypoints.

Exit gate: all UI tests run under Vitest 5, no Jest globals remain in UI tests/setup, no suite is silently excluded, async-leak and shuffled runs are clean, and coverage thresholds are introduced only after the baseline is stable.

### Phase 2 — Primitive API and accessibility contracts

Standardize `variant`, `size`, `disabled`, `loading`, `invalid`, `required`, `className`, slot classes, accessibility label/hint, and controlled/uncontrolled state APIs. Replace primitive `any` types with typed interfaces, especially in Modal subcomponents.

Use semantic button/pressable controls, require labels for icon-only controls, propagate FormControl/FormField labels and descriptions, expose all relevant accessibility states, connect error/help text, hide decorative icons, and prevent duplicate actions while loading.

Harden Modal/Dialog with dialog semantics, accessible naming, Escape dismissal on web, configurable backdrop dismissal, close-button semantics, focus entry/restoration, trapping or platform-equivalent behavior, and background interaction blocking.

Exit gate: every Tier-1 primitive has behavioral accessibility contracts; role/name locators work; state transitions are asserted behaviorally; no primitive public API uses `any`.

### Phase 3 — `cn`, NativeWind v5, and Tailwind v4 consistency

Keep `packages/ui/src/utils/classNames.ts` as the sole `cn(...classNames: ClassValue[]): string` helper. Use it throughout canonical primitives and branded components where conditional classes are composed. Remove ad-hoc class concatenation, duplicated helpers, dynamic Tailwind strings, unsupported native `ring-*` styling, and reusable-UI raw colors.

Use static variant maps and semantic phase tokens for modal/scrim, text-on-accent, focus, danger, success, warning, muted, light/dark, and temporal states. Add focused `cn` conflict-resolution tests.

Exit gate: canonical primitives consistently use `cn`; every variant resolves through static maps; token and composition tests pass.

### Phase 4 — Interaction elegance with Reanimated 4

Use Reanimated 4 for press scale/opacity, focus/hover/active behavior where supported, modal/sheet transitions, reduced-motion fallback, stable motion tokens, and intent-scaled haptics. Prioritize Button, pressable cards, Modal/Dialog, Sheet/Actionsheet, Toast, Select/Combobox, and loading/success feedback.

Animation remains decorative, must degrade safely on web and reduced motion, and must never block accessible action completion.

Exit gate: animated primitives have reduced-motion behavior, cleanup tests, no timer/open-handle leaks, and consistent native/web interaction feedback.

### Phase 5 — High-risk composite primitives

Harden Modal/Dialog, Sheet/Actionsheet, Select/Combobox, FormField, Toast, and Tabs for controlled state, rapid interaction, dismissal/cancellation, portal lifecycle, keyboard/screen-reader use, long labels, small screens, empty/loading/disabled/error states, async failure recovery, and platform differences.

Use table-driven Vitest 5 state and variant matrices.

Exit gate: no high-risk overlay/form primitive is tested only through a happy-path render; every public state has a behavioral assertion; failures recover visibly.

### Phase 6 — Visual and runtime quality gate

Add deterministic visual verification for canonical primitives and representative compositions across light/dark/temporal themes, phone/tablet/desktop widths, long labels, validation, loading/disabled, portals, reduced motion, text scaling, overflow, and contrast-sensitive variants.

Use browser/device checks for focus order, Escape, hover/active/focus states, focus restoration, CSS/native output, and clipping. Attach contrast, dimensions, and snapshot evidence to Vitest reports where useful.

Exit gate: Tier-1 visual coverage exists; accessibility and contrast regressions fail CI; native and web smoke paths are green; reports identify component, state, platform, and theme.

### Phase 7 — Migration, consolidation, and documentation

Update the UI inventory to distinguish canonical primitives, branded compositions, workflow patterns, transitional Gluestack bridge, legacy components, and archive-only components. Migrate remaining transitional imports and ad-hoc class composition. Update the UI inventory, NativeWind roadmap, accessibility governance, root docs index, and this plan. Move finalized transient plans to `docs/current_progress/old_docs` according to the documentation SOP.

## Public API and interface changes

- Replace primitive `any` props with typed interfaces.
- Add standardized loading, disabled, invalid, and accessibility props where missing.
- Require accessible labels for icon-only controls.
- Preserve existing consumer-facing names where possible.
- Keep `cn` as the only shared class composition API.
- Keep branded components separate from low-level primitives.
- Do not add another component library or styling system.
- Do not remove legacy exports until consumer search and focused tests prove they are unused.

## Test plan

Cover unit, type, interaction, accessibility, failure, visual, native, web, and leak behavior. CI gates are UI typecheck, Vitest test, tagged accessibility tests, async leak detection, shuffled tests, visual/a11y runtime checks, lint, and repository anti-slop checks.

## Assumptions and defaults

- Vitest 5 is the canonical test runner for `packages/ui`.
- Existing Jest coverage for unrelated Expo screen mounts may remain temporarily in the app package; no new UI primitive tests use Jest.
- Tailwind CSS v4, NativeWind v5, Reanimated 4, RNGH v3, React 19, and TypeScript 7 remain the target stack.
- Production hardening takes priority over preserving shallow test counts.
- Existing dirty worktree changes are out of scope and must not be overwritten.

## Execution status — 2026-09-07

- Phase 0: plan persisted and indexed; initial Tier-1 evidence captured.
- Phase 1: Vitest 5 config, setup, React Native, NativeWind, and Reanimated test adapters added; package scripts switched from Jest to Vitest. `vitest-native` now supplies the RN-aware Vitest boundary, with explicit test seams for Metro-only `react-native-css` and app-native modules.
- Phase 1: Added a separate `vitest.native.config.mts` and `test:native` lane. It uses `vitest-native`'s native engine and executes the real React Native JavaScript implementation; the Button smoke suite passes in that lane.
- Phase 1: UI test files migrated from Jest APIs to Vitest APIs where covered by the migration pass.
- Phase 3: `cn` conflict-resolution coverage expanded; Text and Button composition paths now use static maps and `cn`.
- Phase 2: Button icon props and Modal section/close-button props are typed; Modal close action now exposes button semantics.
- Verification: UI TypeScript build passes; full UI Vitest lane passes: 47 files and 180 tests. Focused `cn`, Button, overlay, gesture, mascot, and workspace suites also pass.
- Harness follow-up: Vitest reports existing async-act warnings in Select and Button tests; these are now visible and should be cleaned in the next test-quality pass. Visual/browser evidence, leak detection, shuffled runs, and the remaining public `any` audit remain later-phase work.
- NativeWind boundary: the mock lane must not be treated as proof of CSS behavior. `react-native-css` v3 currently documents Metro as its only supported bundler, so actual class-to-style runtime verification must run through the Expo/Metro app path (device/emulator or a Metro-backed integration harness). Vitest can cover the compiler/contracts and real RN JavaScript, but should not claim to reproduce Metro's CSS transform/runtime.
