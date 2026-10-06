# RNGH 3 / Reanimated 4 migration audit

Status: audit complete; Stage 1 blocked on package public export

## Current baseline

- React Native: 0.86.2
- React Native Gesture Handler: 3.3.0 (workspace pin now aligned)
- React Native Reanimated: 4.6.0
- React Native Worklets: 0.12.2 (workspace pin now aligned)
- Reanimated 4 means Fabric/New Architecture only.
- The codebase has roughly 170 files referencing Reanimated and 48 referencing RNGH.
- A focused legacy/API scan found 57 touchable/pressable references and 39 old gesture/API patterns; these are inventory signals, not automatic migration targets.

## What the current official contracts require

RNGH 3 introduces a hook-based gesture API (`usePanGesture`, `useTapGesture`, relation hooks) and a unified native `Touchable`. Existing components should not be mass-rewritten blindly: RNGH 3 keeps compatibility components, while legacy names are explicitly marked for migration. Gesture relations cannot be mixed between the old builder API and the new hook API.

Reanimated 4 is Fabric-only and requires a compatible Worklets release. The official compatibility table supports Reanimated 4.6.x with React Native 0.86 and Worklets 0.12.x; Reanimated 4.7.x targets newer React Native versions and is not an automatic upgrade for this app.

The new RNGH `Touchable` is the intended replacement for React Native `Pressable` and older touchables. It provides native opacity, underlay, scale, and ripple behavior. It should be adopted at stable component boundaries first, not by mechanically changing every `Pressable` in the repository.

## Local divergence and risk

1. `PressableScale` still wraps React Native `Pressable` with `Animated.createAnimatedComponent`. This is the highest-risk path because Reanimated documents event-loss problems for core pressables under synchronous UI-prop updates.
2. The installed RNGH package contains the new `Touchable` implementation under its v3 bundle, but the workspace TypeScript resolver does not expose a supported public `react-native-gesture-handler/v3` import. Internal deep imports and ambient `any` shims are not acceptable migration solutions.
3. The repository contains a large number of primitive-level `Pressable` usages. Most are not proven to be affected; migrating all of them before a contract inventory would create unnecessary visual and interaction regressions.
4. Reanimated and RNGH migration concerns are coupled at the native/runtime layer but should remain separate in source changes: first stabilize package/API compatibility, then migrate touchables, then migrate gesture builders.

## Staged migration plan

### Stage 0 — baseline and guardrails

- Keep the current pins and verify Expo/RN/native compatibility.
- Run type checks, lint, focused UI tests, Metro startup, and a Samsung debug build.
- Capture the Welcome doorway interaction as the first G3/G5 regression contract.
- Do not change Android/iOS generated files.

### Stage 1 — public API resolution

- Resolve the supported public import/export for RNGH `Touchable` in the exact installed release.
- If the package does not expose it correctly, select an official patch/release that does; do not deep-import `lib/module` and do not add an untyped shim.
- Re-run TypeScript and Metro before changing component code.

### Stage 2 — shared interaction primitive

- Migrate `PressableScale` to native RNGH `Touchable`.
- Preserve accessibility state/labels, disabled behavior, haptics, reduced-motion behavior, long-press behavior, and test IDs.
- Add a real-runtime test for press-in, press-out, press, and transformed content.
- Validate Welcome, onboarding, auth, and tab navigation on Samsung.

### Stage 3 — bounded component migration

- Migrate only high-risk animated controls and shared primitives first.
- Leave ordinary static `Pressable` usages unchanged until their ownership and animation context are audited.
- Record each migrated surface and its G0/G1/G3/G5 evidence.

### Stage 4 — gesture API migration

- Inventory old `Gesture.Pan/Tap/Race/Simultaneous/Exclusive` usage and relation boundaries.
- Migrate one gesture family at a time to RNGH 3 hook APIs.
- Never mix hook-based and builder-based relations in the same interaction graph.

### Stage 5 — cleanup and enforcement

- Replace deprecated touchables and old Reanimated names only after runtime evidence exists.
- Add lint/grep checks for new legacy API usage.
- Remove compatibility paths only after device regression coverage is green.

## Stage 1 result

RNGH 3.3.0 contains `Touchable` in `lib/module/v3`, but the package root exports only the legacy touchable family and its TypeScript declarations do not resolve `react-native-gesture-handler/v3`. The runtime bundle also cannot be loaded directly by Node because it is a React Native ESM bundle. Therefore an internal deep import or local untyped declaration would not be a supported migration.

The `PressableScale` implementation remains unchanged and type-safe. No application behavior was changed in this audit slice.

## Next seam audit: gesture builders

The only production source hit for the old RNGH builder API is `packages/ui/src/components/ui/actionsheet/index.tsx`, which uses `Gesture.Pan()` with chained configuration and `GestureDetector`. The current stable package also does not expose the RNGH 3 hook API (`usePanGesture`) from its root TypeScript entrypoint, so this seam cannot be migrated safely until the public export problem is resolved. The action sheet should remain behaviorally unchanged for now; its drag threshold, cancellation behavior, and spring reset need a dedicated G3/G5 regression when migration becomes possible.

## Decision

Do not perform a repository-wide “upgrade” now. The next implementation slice is Stage 1: establish a supported public `Touchable` import for this exact RNGH release, then migrate only `PressableScale`. The rest of the app remains unchanged until that slice passes type, Metro, scenario, and Samsung evidence.

References: official RNGH 3 upgrade guide and Touchable documentation; official Reanimated 4 compatibility, migration, performance, and troubleshooting documentation.
