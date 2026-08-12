---
title: "UI Facade and Styling Engine Decision"
status: "active"
created: 2026-08-12
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [architecture, gluestack, nativewind, styling, migration, decision]
---

# UI Facade and Styling Engine Decision

## Decision

Gurudevi will keep `@repo/ui/gluestack` as the stable public UI boundary. Product code must not depend directly on Gluestack, NativeWind, UniWind, Unistyles, or another styling engine.

The components behind that boundary remain Gurudevi-owned primitives. We will not describe them as official Gluestack UI v5 runtime components unless individual upstream sources are deliberately ported, reviewed, and verified.

NativeWind v5 preview.4 with Tailwind CSS 4 is the selected implementation behind the facade. It remains an implementation detail and is pinned as an explicitly monitored pre-release dependency; NativeWind v4/Tailwind v3 and UniWind Free are rollback or future evaluation options, not parallel production engines. No paid runtime or support product is required for the baseline architecture.

## Context

The repository contains `gluestack-ui@5.0.3`, but that package is the Gluestack CLI. The runtime components exported through `@repo/ui/gluestack` are local files under `packages/ui/src/components/ui`. They wrap React Native primitives and contain Gurudevi-specific behavior and tokens.

The current product-owned styling layer uses NativeWind v5’s `styled()` path through `react-native-css`. The frozen legacy tree retains 17 `cssInterop` registrations from `react-native-css-interop`, but it is not part of the current product-owned facade path. This is a valid transitional repository state, but it must not be mistaken for a completed official Gluestack v5 migration.

The v5 CSS pipeline is now wired through CSS-first Tailwind v4 imports, an explicit `@config` token reference, package-local PostCSS configuration, and Metro `withNativewind`. The obsolete NativeWind v4 Babel transform is not part of the current app or renderer fixture configuration.

## Architectural target

```text
Product screens
    ↓
@repo/ui/gluestack
    ↓
Gurudevi-owned primitives
    ↓
One selected styling engine + React Native StyleSheet escape hatch
```

The facade protects product code from styling-engine churn, preserves the ability to patch upstream behavior locally, and prevents paid tooling from becoming a hidden runtime requirement.

## Constraints

- Do not mix NativeWind, UniWind, Unistyles, and Tamagui in the production component path.
- Do not purchase UniWind Pro, Gluestack Pro, or Tamagui Pro for this migration.
- Do not run a blind Gluestack CLI upgrade against the customized monorepo.
- Do not mass-convert all `cssInterop` calls to `styled()` without platform and prop-flow tests.
- Keep `StyleSheet` available for shadows, animations, third-party components, and CSS-interop edge cases.
- Preserve the existing public facade while implementations change.

## One-week implementation scope

1. Freeze the current facade and dependency state.
2. Build the acceptance harness for layout, text, pressable, input, lists, SVG, forms, overlays, themes, web, and animation.
3. Harden the current implementation and classify every remaining interop exception.
4. Run the acceptance harness against the selected NativeWind v5 path and record failures by platform.
5. Keep NativeWind v4/Tailwind v3 and UniWind Free as explicit rollback/research options, never as mixed production dependencies.
6. Migrate and harden the representative primitive slice only; do not rewrite the whole app in the one-week window.
7. Record exact versions, exceptions, and rollback path in this ADR and the hardening inventory.

## Current hardening status

The representative renderer slice is implemented and verified in `apps/gurudevi-mobile/runtime-fixtures/style-engine/`. Jest and TypeScript remain contract/type gates; they are not accepted as proof that a Tailwind class rendered. The browser fixture is the style-runtime gate.

The current product-owned adapters, including TextInput, SVG, LinearGradient, virtualized lists and Slider, now use dedicated `styled()` mappings. The remaining 17 `cssInterop` registrations are confined to the frozen legacy tree and are not on the product facade path.

The full app production web export succeeds and emits generated CSS. After the Expo 57.0.12 alignment, an isolated export produced the 129 KB CSS bundle; browser smoke returned HTTP 200, title `Gurudevi`, non-empty body text, and zero page/console errors. Authenticated route coverage remains a separate product-flow test.

## Selection rule

The selected production path is NativeWind v5 preview.4/Tailwind 4 behind `@repo/ui/gluestack`. The project must not silently upgrade to a newer preview, introduce a second utility compiler, or remove the legacy bridge until the corresponding harness and native gate are green.

NativeWind v4/Tailwind v3 remains the documented rollback path if a native or web gate fails. UniWind Free remains a future disposable spike only; it is not part of the current dependency graph.

## Acceptance gates

- `@repo/ui` typecheck and tests pass.
- Gurudevi app typecheck and tests pass.
- Expo Web export succeeds and renders authenticated/credentialed smoke routes.
- Native development build verifies representative primitives on a real device or approved emulator.
- Button, Input, Textarea, Select, Checkbox, Radio, Modal, Actionsheet, Toast, lists, SVG, dark mode, disabled/focus/pressed states, and Reanimated behavior are verified.
- No required behavior depends on a paid product.
- Exact dependency versions and known exceptions are documented.

Current evidence satisfies the product-owned web/style gates. The first Android attempt exposed and corrected an Expo workspace override mismatch: the root task-manager override was forcing 57.0.2/loader 57.0.0 while the app’s Expo aggregate used task-manager 57.0.7/loader 57.0.1. The graph is now aligned to the latest compatible SDK 57 patch map and regenerated with `expo prebuild --no-install`. Full Android compilation and device verification remain CI/device gates because the local build takes roughly 20 minutes; they are not being represented as passed. `expo-doctor` still reports separate monorepo duplicate-link and Expo/RN drift findings. We intentionally do not run `expo install --fix`, which is prohibited for this repository’s sacred new-architecture pins.

The fast native graph gate passes locally and is now required in `.github/workflows/android-build.yml`; it checks the Expo 57 task-manager/background-task/modules-core line, app-loader publication, and stale SDK 56 modules before the long EAS/Gradle job. Targeted UI lint has no errors and jscpd reports no clones in the migrated primitive slice. The full workspace typecheck still has unrelated marketing-web attendance payload errors, while the mobile/UI/core typechecks pass.

## Consequences

We accept some short-term duplication and compatibility code in exchange for a stable product API and the ability to change engines safely. We will not claim upstream component parity without source-level evidence. The next migration is therefore a controlled implementation behind a stable boundary, not a library identity change across the application.

## References

- [Gluestack UI v5 CLI](https://gluestack.io/ui/docs/home/getting-started/cli)
- [Gluestack UI v5 installation](https://gluestack.io/ui/docs/home/getting-started/installation)
- [Gluestack UI and NativeWind stack audit](../infra/2026-08-11-gluestack-v5-stack-audit.md)
- [Existing style-stack hardening](../infra/2026-08-11-existing-style-stack-hardening.md)
