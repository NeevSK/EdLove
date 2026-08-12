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

The styling engine remains an implementation detail. We will evaluate NativeWind v5, NativeWind v4/Tailwind v3, and UniWind Free against the same acceptance harness. No paid runtime or support product is required for the baseline architecture.

## Context

The repository contains `gluestack-ui@5.0.3`, but that package is the Gluestack CLI. The runtime components exported through `@repo/ui/gluestack` are local files under `packages/ui/src/components/ui`. They wrap React Native primitives and contain Gurudevi-specific behavior and tokens.

The current styling layer is a hybrid: most primitives use `cssInterop` from `react-native-css-interop`, while NativeWind v5 preview and Tailwind CSS v4 dependencies are also present. This is a valid transitional implementation, but it must not be mistaken for a completed official Gluestack v5 migration.

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
4. Run the same harness against NativeWind v5, NativeWind v4/Tailwind v3 fallback, and UniWind Free where supported.
5. Select an engine only after native, web, type, test, theme, and monorepo gates pass.
6. Migrate one representative primitive slice only; do not rewrite the whole app in the one-week window.
7. Record the selected engine, exact versions, exceptions, and rollback path in a follow-up ADR.

## Selection rule

- If NativeWind v5 passes: keep it behind the facade, while explicitly documenting its upstream maturity status.
- If NativeWind v5 fails but NativeWind v4 passes: use NativeWind v4/Tailwind v3 as the production fallback.
- If UniWind Free passes and is materially stronger for Expo/native/web needs: it may replace NativeWind behind the same facade.
- If all candidates fail: retain the hardened facade, use direct React Native styles for critical primitives, and defer engine migration.

Any of these outcomes is acceptable if it preserves product correctness and rollback ability.

## Acceptance gates

- `@repo/ui` typecheck and tests pass.
- Gurudevi app typecheck and tests pass.
- Expo Web export succeeds and renders authenticated/credentialed smoke routes.
- Native development build verifies representative primitives on a real device or approved emulator.
- Button, Input, Textarea, Select, Checkbox, Radio, Modal, Actionsheet, Toast, lists, SVG, dark mode, disabled/focus/pressed states, and Reanimated behavior are verified.
- No required behavior depends on a paid product.
- Exact dependency versions and known exceptions are documented.

## Consequences

We accept some short-term duplication and compatibility code in exchange for a stable product API and the ability to change engines safely. We will not claim upstream component parity without source-level evidence. The next migration is therefore a controlled implementation behind a stable boundary, not a library identity change across the application.

## References

- [Gluestack UI v5 CLI](https://gluestack.io/ui/docs/home/getting-started/cli)
- [Gluestack UI v5 installation](https://gluestack.io/ui/docs/home/getting-started/installation)
- [Gluestack UI and NativeWind stack audit](../infra/2026-08-11-gluestack-v5-stack-audit.md)
- [Existing style-stack hardening](../infra/2026-08-11-existing-style-stack-hardening.md)
