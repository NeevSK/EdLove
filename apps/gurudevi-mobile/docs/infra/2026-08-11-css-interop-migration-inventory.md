---
title: "NativeWind CSS Interop Migration Inventory"
status: "active"
created: 2026-08-11
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [mobile, gluestack, nativewind, css-interop, migration]
---

# NativeWind CSS Interop Migration Inventory

This inventory is the controlled follow-up to the existing-style-stack hardening work. It records the current legacy `cssInterop` surface before any `styled()` conversion. It is an inventory and decision boundary, not permission to mass-rewrite components.

## Snapshot

- Scope: `packages/ui/src/components/ui` and `packages/ui/src/components-legacy`.
- Historical baseline: 41 source files contained `cssInterop` before the 2026-08-12 hardening pass (including the frozen legacy tree).
- Current state: 29 source files contain `cssInterop`, with 17 actual registrations. No current product-owned files register it; the remaining registrations belong to the frozen legacy tree.
- Current consumer audit: 0 current app/library/UI source files import the frozen legacy tree. The legacy files remain only as an isolated compatibility archive and are not reachable through the product facade.
- 19 production `styled()` registrations now cover the core layout, media, progress and interaction wrappers.
- The legacy component tree is frozen. New product code must use the canonical `@repo/ui` facade and must not add new `cssInterop` registrations.

## Decision rules

1. Do not replace `cssInterop` because the call is mechanically simple. A `styled()` migration changes prop typing, third-party component behavior, event/style-array handling and sometimes web output.
2. Migrate one primitive at a time, starting with a leaf component that has no stateful overlay behavior.
3. Each candidate needs native, web and test evidence before the registration is removed: className rendering, explicit `style` precedence, dark mode, disabled/pressed/focus states, accessibility props and any platform-specific props.
4. Keep a direct `StyleSheet`/platform-style escape hatch for SVG, gradients, lists, animated views and native controls. These are not good first migration candidates.
5. If a component is generated or legacy-only, do not hand-migrate it during this hardening phase. Re-add or regenerate it only inside a disposable Gluestack v5 acceptance harness after its exact CLI output is reviewed.

## Risk-ranked inventory

### Tier 0 — freeze and leave on the bridge

These are legacy-only source files. They are not migration candidates for the product baseline.

| File | References | Reason |
| --- | ---: | --- |
| `components-legacy/box/index.tsx` | 2 | Legacy layout alias; duplicate of the v5 surface. |
| `components-legacy/center/index.tsx` | 2 | Legacy layout alias; duplicate of the v5 surface. |
| `components-legacy/divider/index.tsx` | 2 | Legacy loading/divider implementation. |
| `components-legacy/hstack/index.tsx` | 2 | Legacy layout alias. |
| `components-legacy/image/index.tsx` | 2 | Legacy image wrapper. |
| `components-legacy/text/index.tsx` | 2 | Legacy text wrapper. |
| `components-legacy/vstack/index.tsx` | 2 | Legacy layout alias. |
| `components-legacy/button/index.tsx` | 3 | Legacy interaction and text pair. |
| `components-legacy/form-control/index.tsx` | 3 | Legacy form composition. |
| `components-legacy/input/index.tsx` | 4 | Legacy form control with multiple native targets. |
| `components-legacy/view/index.tsx` | 4 | Legacy catch-all wrapper for several native targets. |

Tier 0 policy: no new references, no conversion, and no cleanup until all consumers have moved to `components/ui` or a product-owned wrapper.

### Tier 1 — first controlled migration candidates

These are the best candidates for a disposable `styled()` spike because they mostly map `className` to `style` on standard React Native primitives.

| File | References | Target |
| --- | ---: | --- |
| `components/ui/box/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(View)` adapter; verified by the isolated browser fixture. |
| `components/ui/text/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(Text)` adapter; verified by the isolated browser fixture. |
| `components/ui/pressable/index.tsx` | 0 | **Code migrated earlier:** narrowed `styled(Pressable)` adapter; verify pressed/disabled state styles. |
| `components/ui/image/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(Image)` adapter; verify resize and tint behavior. |
| `components/ui/image-background/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(ImageBackground)` adapter; verify background image props on web/native. |
| `components/ui/divider/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(View)` adapter; verify border/background tokens. |
| `components/ui/spinner/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(ActivityIndicator)` adapter; verify tint and size props. |
| `components/ui/progress/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(View)` adapters; verify width and state variants. |
| `components/ui/fab/index.tsx` | 0 | **Code migrated 2026-08-12:** consumes the canonical product-owned Pressable; verify positioning, hit target and pressed state. |

Recommended order: `box` → `text` → `pressable` → `divider` → `progress` → `image`/`image-background` → `spinner` → `fab`.

### Tier 2 — stateful and composition-sensitive components

These should remain bridged until Tier 1 has a passing native/web harness. Their styles interact with state, overlays, focus, input events or compound component APIs.

| File | References | Main risk |
| --- | ---: | --- |
| `components/ui/button/index.tsx` | 0 | **Code migrated 2026-08-12:** consumes the canonical Pressable, Text, View and Spinner adapters; base output is covered by the primitive fixture, while pressed/disabled variants remain component-level follow-up. |
| `components/ui/avatar/index.tsx` | 0 | **Code migrated 2026-08-12:** consumes canonical View, Text and Image adapters; nested fallback/image states remain component-level follow-up. |
| `components/ui/badge/index.tsx` | 0 | **Code migrated 2026-08-12:** consumes canonical View and Text adapters; variant class composition remains component-level follow-up. |
| `components/ui/actionsheet/index.tsx` | 3 | Overlay provider, gestures and portal behavior. |
| `components/ui/input/index.tsx` | 4 | View, `TextInput` and `Pressable` share className mapping; focus/error states. |
| `components/ui/textarea/index.tsx` | 3 | Multiline `TextInput`, focus and keyboard behavior. |
| `components/ui/select/index.tsx` | 3 | Trigger state, focus and overlay composition. |
| `components/ui/checkbox/index.tsx` | 4 | Pressable state, indicator state and accessibility semantics. |
| `components/ui/radio/index.tsx` | 4 | Pressable state, indicator state and accessibility semantics. |
| `components/ui/modal/index.tsx` | 2 | Provider/root wiring and web/native overlay differences. |
| `components/ui/toast/index.tsx` | 2 | Portal/provider and timed state behavior. |
| `components/ui/text-input/index.tsx` | 2 | Native input props and focus/selection behavior. |

### Tier 3 — high-risk native or platform-specific interop

Do not use these as the first `styled()` experiment. They need dedicated reproductions and may be better served by direct styles or a small product-owned adapter.

| File | References | Main risk |
| --- | ---: | --- |
| `components/ui/icon/index.tsx` | 2 | SVG prop mapping, tint/fill behavior and known NativeWind v5 SVG risk. |
| `components/ui/linear-gradient/index.tsx` | 2 | Third-party native component and color-array props. |
| `components/ui/slider/index.tsx` | 2 | Native control props and platform-specific styling. |
| `components/ui/list/index.tsx` | 3 | `FlatList`/`SectionList` virtualization and content-container props. |
| `components/ui/scroll-view/index.tsx` | 0 | **Code migrated 2026-08-12:** `styled(ScrollView)` with explicit content-container mapping; primitive output is covered by the renderer gate. |
| `components/ui/view/index.tsx` | 0 | **Code migrated 2026-08-12:** v5 adapters for the View family; primitive output is covered by the renderer gate. |

## First migration slice

The first slice should be a disposable branch or harness containing only `box`, `text` and `pressable`. It must prove:

- `styled()` or the selected NativeWind v5 replacement can type and render standard primitives;
- className plus explicit style precedence is understood;
- light/dark theme tokens work on web and native;
- pressed and disabled states remain correct;
- the existing `@repo/ui` public exports do not change;
- no `react-native-css-interop` registration is removed from the production tree until the harness passes.

If this slice fails, stop the migration and keep the bridge. Do not escalate directly to form controls or replace the styling engine in the main app.

## Exit criteria for reducing the count

The count may only decrease when a pull request includes:

1. Before/after registration count for the exact component.
2. Native test or development-build evidence.
3. Web export evidence and a visual check for the component.
4. Tests for stateful classes and explicit style precedence.
5. Confirmation that no legacy consumer was accidentally redirected.
6. Updated stack audit and this inventory.

Current decision: retain the remaining 17 actual registrations, all in the frozen legacy tree, while enforcing zero current consumers. NativeWind v5 preview.4/Tailwind 4 is the selected engine behind the stable facade; UniWind is future research and NativeWind v4/Tailwind 3 is rollback only. The current-bridge contract harness is `packages/ui/src/__tests__/Tier1InteropHarness.test.tsx`; all current product-owned UI adapters now use `styled()` boundaries in production code. Run `pnpm --filter gurudevi-mobile audit:css-interop` to inspect the source inventory and fail if a new product source file imports the legacy tree or registers `cssInterop`. The isolated renderer fixture now provides browser computed-style evidence for the reviewed primitive slice, including SVG and virtualized-list wrappers.

## Runtime verification note — 2026-08-12

The actual Expo Web export completed successfully and emitted CSS artifacts. A real browser loaded the exported artifact with HTTP 200 and no page errors after adding an Expo public-runtime bridge for Supabase values and restoring the missing `school.searchCanonicalSchools` contract coverage entry. This proves production web bootstrap reaches React rendering; it does not prove computed utility styles. The current unit tests are intentionally insufficient for that claim.

An isolated fixture remains at `apps/gurudevi-mobile/runtime-fixtures/style-engine/`. It uses the app’s pnpm fallback resolver and imports only the reviewed primitive adapters. Its export emits CSS and a real browser verifies `p-4` → 16px padding, `p-3` → 12px padding, `mt-4` → 16px margin, phase backgrounds, phase text color and `text-xl` → 20px font size, with no page errors. The aggregate `@repo/ui/gluestack` facade is intentionally not imported by this renderer fixture because unrelated exports pull domain/application modules into the bundle; the product facade remains the public API boundary.

The source migration continued on 2026-08-12: Button, Avatar, Badge, TextInput and Textarea now consume the canonical product-owned wrappers, ordinary `View`/`Text`/`Pressable` usage in Actionsheet, Checkbox, Radio, Select and Input now consumes the same adapters, and the native-sensitive TextInput, SVG, gradient, list and Slider wrappers now use `styled()` mappings. This reduced the actual registration count from the historical 47 baseline to 17, all in the frozen `components-legacy` tree.

## v5 configuration finding — 2026-08-12

The repository was carrying a v4-era `nativewind/preset` reference in `tailwind.config.js`. NativeWind v5 does not export that preset. The shared CSS entry now explicitly references the existing token config with Tailwind v4’s `@config` directive, and `packages/ui` owns a package-local PostCSS configuration so Metro processes CSS imported from the shared package. Without these changes, the browser rendered `styled()` components but utility classes such as `p-4` and phase colors were absent from computed styles.

The fixture is now the authoritative style-engine runtime gate. Full-app production web export succeeds and emits generated CSS, and fresh production browser smoke renders with no page errors. The only observed messages are expected web capability warnings for notifications and native Google One-Tap. Authenticated route coverage remains a separate product-flow test.

## First experiment result

The Jest facade-contract harness renders `styled(View)`, `styled(Text)` and `styled(Pressable)` and preserves explicit style channels and Pressable interaction. It intentionally does **not** claim that class styles were applied: `styled()` consumes `className` before the native renderer sees it. Direct TypeScript inference currently produces `TS2590` (“Expression produces a union type that is too complex to represent”) for the `styled(Pressable)` call under the workspace’s TypeScript 7 configuration. A narrow harness-only cast to `ComponentType<PressableProps>` avoids the expansion and still passes the interaction test, but this is only a possible adapter shape—not permission to weaken production component types. Actual style application remains a Metro/Web/native runtime gate.

## Upstream investigation: 2026-08-11

The exact `Pressable` reproduction was not found in NativeWind or `react-native-css` issue search. However, NativeWind issue [#1732](https://github.com/nativewind/nativewind/issues/1732) is a confirmed adjacent case: `styled(FlatList)` and `styled(FlashList)` produce the same `TS2590`, because the returned type expands a deeply nested union. The issue is open and marked deferred post-5.0. NativeWind’s [official `styled()` API](https://www.nativewind.dev/v5/api/styled) confirms that v5 re-exports the generic `styled()` implementation from `react-native-css`; it is intended mainly for third-party components, not ordinary components that already pass `className`. The [v5 migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4) documents `styled()` as the replacement for `cssInterop`, but does not document a Pressable-specific type workaround.

The likely local trigger is the interaction between React Native 0.86’s large `PressableProps` surface, `react-native-css`’s `ComponentProps<C>`/`DotNotation` conditional types, and TypeScript 7’s instantiation limits. This is an inference from the local declaration graph and the adjacent upstream issue, not a confirmed maintainer diagnosis. It is not evidence of a Lightning CSS, Tailwind token, or runtime styling failure: the runtime test passes and the failure occurs at the type-level `styled(Pressable)` expression.

The Expo ecosystem has also seen a separate TypeScript explosion caused by the `react-native-strict-api` resolver condition, later reverted by Expo; that report concerns className/type errors rather than this `styled()` generic expansion. It is a reminder to test resolver conditions, but it does not explain Gurudevi’s current Pressable-only reproduction. ([Expo issue #39096](https://github.com/expo/expo/issues/39096))

Decision: current product-owned primitives, including native-sensitive adapters, use reviewed local `styled()` boundaries with explicit public prop interfaces and runtime fixture coverage. The remaining `cssInterop` registrations are confined to the frozen legacy tree. Do not scatter `@ts-ignore` or broad `any` casts through component files.
