---
title: "Existing Gluestack and NativeWind Stack Hardening"
status: "active"
created: 2026-08-11
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [mobile, gluestack, nativewind, hardening, reliability]
---

# Existing Gluestack and NativeWind Stack Hardening

This is deliberately separate from the earlier one-week styling-engine comparison in [the stack audit](./2026-08-11-gluestack-v5-stack-audit.md). The decision is now NativeWind v5 preview.4/Tailwind 4 behind the stable facade; hardening means making that selected compatibility bridge predictable while preserving a documented rollback.

## Feature spec

### Blast Zone: AMBER

### Target files

- `apps/gurudevi-mobile/scripts/audit-style-stack.mjs`
- `apps/gurudevi-mobile/package.json`
- `packages/ui/src/**` only if a later hardening patch requires source changes

### Reuses

- Existing `@repo/ui/gluestack` facade.
- Existing Metro resolver and web firewall.
- Existing app/package manifests and lockfile.
- Existing scoped typecheck, lint, test and web-audit scripts.

### Does not

- Change the styling engine.
- Run the Gluestack CLI against canonical source-owned components.
- Convert `cssInterop` to `styled()`.
- Add UniWind, Tamagui or Unistyles.
- Change sacred native dependency versions.
- Edit `android/`, `ios/` or the root router/provider shell.

### Complexity budget

The audit script is a small deterministic checker with no React components and no cognitive-complexity exceptions.

## Hardening contract

Until the separate engine spike chooses a path, the current bridge is considered valid only when:

1. Gluestack and NativeWind versions are aligned between the app and `@repo/ui`.
2. `react-native-css-interop` remains explicitly pinned and its Metro runtime shims remain resolvable.
3. NativeWind Babel and Metro configuration remain present together.
4. The app and shared package retain the same Tailwind 4 runtime baseline.
5. The CSS entry file remains importable from the shared UI package.
6. `@repo/ui/gluestack` remains the public boundary for product code.
7. Known debt—legacy `cssInterop` and remaining token migration—is reported rather than silently “fixed.” Lightning CSS is now pinned at the documented NativeWind v5 compatibility version.

## Monorepo web fallback clarification

Gluestack’s current CLI documentation says:

- `--nativewind` means NativeWind v4 with Tailwind CSS v3.
- `--nativewind-v5` means NativeWind v5 with Tailwind CSS v4, but the CLI says NativeWind v5 is not yet web-compatible in monorepo mode and will fall back to NativeWind v4 in that setup.
- `--uniwind` means UniWind with Tailwind CSS v4, but the CLI says UniWind is not supported for monorepo Next.js setups and falls back to NativeWind v4 there.

This is not an automatic per-platform runtime switch. If the CLI selects NativeWind v4 for the monorepo, the coherent fallback is NativeWind v4 + Tailwind CSS v3 for the affected project/package graph. Tailwind v4 with NativeWind v4 is not the documented pairing.

For Gurudevi, the safe choices are:

1. **Preferred first workaround:** do not invoke the monorepo CLI upgrade. Keep the current NativeWind v5/Tailwind 4 bridge, manually own `packages/ui` configuration, and test Expo Web. Use direct `StyleSheet` or `.web` implementations for primitives that fail web rather than introducing a second compiler.
2. **Deliberate rollback:** if Expo Web cannot be made reliable, move the coherent app/UI graph back to NativeWind v4 + Tailwind v3. Treat this as a rollback ADR with a lockfile and visual baseline—not as a hidden CLI side effect.
3. **Isolated web package:** only if web becomes a hard product requirement and neither engine works, create a separately owned web implementation/package. Do not make one shared primitive package compile with NativeWind v4 on web and NativeWind v5 on native without an explicit package boundary.

Therefore, we do **not** add Tailwind 3 now. We already removed the unused Tailwind 3 dev dependency while hardening the current bridge. We will only reintroduce Tailwind 3 if the acceptance harness proves that a full, intentional NativeWind v4 rollback is the least risky option.

## Hardening sequence

### H1 — Drift detection

Run `pnpm --filter gurudevi-mobile audit:style-stack` before any styling dependency or CLI operation. This is the first implemented hardening step.

### H2 — Baseline verification

Run app/UI typechecks and tests, then the web build/audit. Record failures as baseline, bridge, or unrelated. Do not call a timeout a pass.

### H3 — Configuration cleanup

Only after H1/H2 are green or understood, address one debt at a time: duplicate Tailwind major, Lightning CSS policy, CSS/type declaration ownership, then legacy interop exceptions.

### H4 — Source safety

Maintain an explicit list of `cssInterop` exceptions. Migrate a primitive only when its refs, events, style arrays, SVG props, dark mode and web output have tests or a captured visual baseline.

### H5 — Engine decision handoff

The one-week NativeWind-vs-UniWind comparison is no longer the active production decision. The reproducible hardening baseline is now the NativeWind v5 implementation checkpoint; NativeWind v4/Tailwind v3 remains the rollback point and UniWind remains optional future research.

## 2026-08-12 verification note

The UI test baseline initially failed before test execution because the React Native Worklets Babel plugin could not resolve `@babel/traverse` from the strict pnpm package boundary. The lockfile already contained the package, but it was not directly declared by `@repo/ui` or `gurudevi-mobile`. We added `@babel/traverse@7.29.8` as a dev dependency to both package boundaries and regenerated the lockfile and stack map.

After that boundary correction:

- `@repo/ui` tests: 15 suites, 149 tests passed.
- `@repo/ui` TypeScript build: passed.
- `gurudevi-mobile` TypeScript build: passed after the adapter changes.
- Style-stack audit: bridge invariants passed.
- CSS interop inventory: the earlier hardening checkpoint had 36 actual registrations; the final wrapper pass reduced this to 17, all in the frozen legacy tree.
- Remaining actual `cssInterop(...)` registrations: 17; no current product-owned adapter registers the legacy bridge.
- Core layout, media, progress, FAB, Button, Avatar, Badge, TextInput and Textarea adapters migrated to `styled()` on 2026-08-12.
- The isolated renderer fixture now proves actual browser computed styles for padding, margin, phase backgrounds, phase text color and font size with no page errors.
- The v5 CSS pipeline required two compatibility repairs: a package-local PostCSS config for CSS imported from `packages/ui`, and removal of the v4-only `nativewind/preset` reference. The v5-compatible Tailwind config is explicitly loaded with `@config`.
- Production web export now emits a 129 KB generated global CSS payload and completes successfully. Fresh production browser smoke renders with no page errors; only expected web capability warnings remain for notifications and native Google One-Tap. This is separate from the now-passing renderer fixture.
- Post-Expo-alignment export was rerun into an isolated `dist-post-update` directory: Expo 57.0.12 bundled successfully, emitted the same 129 KB CSS payload, and a fresh browser smoke returned HTTP 200, title `Gurudevi`, non-empty body text, and zero page/console errors.
- The hardening audit now checks both `react-native-css` (v5 engine dependency) and `react-native-css-interop` (retained legacy bridge) explicitly; the latter must not be mistaken for the canonical v5 package.
- The final product-source sweep removed the remaining NativeWind 4 runtime boundary from `packages/library/src/screens/MapScreen.tsx`; it now uses `styled(BlurView)`. The library’s direct declarations are pinned to NativeWind `5.0.0-preview.4` and Tailwind `4.3.0`.
- The unused `gluestack-ui@5.0.3` CLI dependency was removed from the app and UI package. It is optional tooling, not the runtime component library, and removing it eliminates its private NativeWind 4 dependency from the workspace graph.
- `expo-doctor` completed with 16/20 checks passing. Its four failures are workspace/dependency hygiene findings: the intentional Metro `disableHierarchicalLookup` override, monorepo duplicate links, React Native Directory metadata/architecture warnings, and existing Expo/RN patch-version drift. No NativeWind/CSS pipeline failure was reported. Do not run `expo install --fix`; sacred new-architecture pins and the monorepo resolution policy require a separate approved upgrade pass.
- Android debug compilation reached Gradle dependency resolution with the available Android Studio JBR, but the first attempt exposed a workspace override mismatch: `expo-task-manager` 57.0.7 requested app-loader 57.0.1 while the root override forced 57.0.0. The Expo 57 graph has since been normalized to the latest compatible SDK 57 patch map and regenerated with `expo prebuild --no-install`; the autolinker now resolves one task-manager/background-task line (57.0.9) and app-loader (57.0.1). Full Android compilation is intentionally deferred to CI/device because this repository’s native build takes roughly 20 minutes; it remains an open native gate rather than a claimed pass.

## 2026-08-12 Expo graph hardening

All workspace `expo-*` declarations that have an SDK 57 release now use the latest non-preview SDK 57 patch available on the registry. The root package and app use Expo 57.0.12; `expo-modules-core` is 57.0.10; and the background-task pair is 57.0.9. The shared `eslint-config-expo` tooling declaration was also moved from SDK 56 (`~56.0.4`) to SDK 57 (`~57.0.1`). The old SDK 56 declarations in scanner/core were removed from the active graph. `pnpm install` produced one lockfile entry for each of the key native coordinates (`expo`, `expo-task-manager`, `expo-background-task`, `expo-modules-core`, and `unimodules-app-loader`).

This is version-line alignment, not a claim that every Expo package has the same literal version: Expo publishes each module independently. Packages without a compatible SDK 57 release, such as `@expo/fingerprint` and `expo-doctor`, were not force-upgraded.

Fast gates after alignment:

- `@repo/ui`, `@repo/core`, and `gurudevi-mobile` typechecks pass.
- UI tests pass: 15 suites / 149 tests.
- App Vitest baseline was re-run after the Expo alignment: 18 files / 85 tests passed. A test-only `expo-constants` shim removes Expo 57’s extensionless `Constants.types` loader failure; runtime/native bundles still use the real Expo package. The architecture tests were also corrected to the current strict educational contract and approved Supabase adapter boundary, so the app suite no longer validates stale assumptions.
- CSS interop inventory passes: 17 registrations, all in the frozen legacy tree; 0 product-owned registrations.
- Style-stack audit passes.
- Browser style-engine fixture passes computed-style checks for runtime, Box, Text, Pressable, SVG icon, and list with no page errors.
- Android full compilation is deferred to CI/device; the timed local attempts did not return a new dependency failure and were terminated only because of the known long native build duration.

The Android workflow now runs `pnpm run audit:expo-native-graph`, `pnpm run audit:style-stack`, and `pnpm run audit:css-interop` immediately after installation and before EAS/Gradle. They verify the Expo 57 task-manager/background-task/modules-core line, the autolinked app-loader coordinate, scan all workspace manifests for stale SDK 56 Expo declarations, enforce one NativeWind v5/Tailwind 4 product line, and prevent new legacy-tree consumers. These are fast graph/source gates; they do not replace the full Android compile or device test.

For local repetition, `pnpm --filter gurudevi-mobile verify:style-stack` runs the three audits, the mobile TypeScript build, and the complete mobile Vitest suite in the same order. It passed on 2026-08-12: 18 test files / 85 tests.

## Current hardening status

- [x] Separate hardening document and scope guard created.
- [x] Style-stack drift audit passes; it fails if the latest web export contains only empty CSS artifacts.
- [x] Baseline UI/type/test/web results captured; UI typecheck passes and the invalid-state test now checks the actual class contract.
- [x] UI Jest workspace subpath mapping hardened; 11/13 suites initially passed and 13/13 pass after the test-only Lucide ESM mock and invalid-state assertion correction.
- [x] Tailwind major-version debt resolved by removing the unused app devDependency on Tailwind 3.4.17; runtime Tailwind remains 4.3.0.
- [x] Lightning CSS policy resolved: root pnpm override pins `lightningcss` to `1.30.1`, matching gluestack’s NativeWind v5 guidance.
- [x] Expo SDK 57 native graph normalized and guarded by `audit:expo-native-graph` in the Android workflow.
- [x] CSS/type declaration ownership documented: `packages/ui/src/global.css` is the source entry; package-local PostCSS owns its transformation; the app consumes the generated output through Metro.
- [x] `cssInterop` exception inventory reviewed and risk-ranked in [the migration inventory](./2026-08-11-css-interop-migration-inventory.md); 17 legacy registrations remain bridged while all current product-owned adapters use `styled()`.
- [ ] Rollback baseline tagged or otherwise recorded.

## Baseline findings recorded on 2026-08-11

- `pnpm --filter @repo/ui check-types`: passed.
- `pnpm --filter @repo/ui test -- --runInBand`: the workspace alias and Lucide ESM loader failures were fixed in Jest configuration/mock infrastructure; the invalid-state test now verifies the `border-phase-danger` class instead of asserting an unsupported React Native accessibility-state key.
- Historical checkpoint: an earlier app typecheck reported a missing web `BrandPulse` export and unrelated admin role-name mismatches. The web export parity fix is now applied, and the current app typecheck passes.
- `pnpm --filter @repo/ui lint`: wrapper is not portable in this PowerShell because it embeds `&&`; direct ESLint passes the changed component after the invalid accessibility-state key was rejected. Config/mock files are ignored by the package ESLint policy.
- The workspace reports a Node engine warning because the environment is Node 24 while the workspace requests Node 22.x.
- Historical baseline: the first web export emitted an empty `_expo/static/css/global-*.css` artifact before package-local PostCSS and v5 config repairs.
- The first PostCSS attempt used only the app-level config and left CSS imported from `packages/ui` unprocessed. A package-local PostCSS config plus v5-compatible Tailwind config now produces the expected CSS.
- `pnpm --filter gurudevi-mobile audit:web`: the web firewall blocks 62 unique native-module leak paths through existing shims. The command reports them as successfully intercepted, but they remain part of the web hardening surface.
- Historical checkpoint: an early browser smoke used a static server without public Supabase values and rendered a black screen. The current app config bridge supplies those public values through Expo config; fresh credentialed production smoke renders without page errors.
- The isolated Tailwind/PostCSS processor emitted 27 KB from the shared CSS entry, proving Tailwind itself was not the empty-output problem.
- The canonical Metro wiring was aligned with NativeWind v5: explicit `react-native-css` dependencies, `withNativewind(config)`, CSS-first imports, `nativewind/theme`, PostCSS config and `react-native-css-env.d.ts`.
- The quality gate’s targeted UI lint now passes with warnings only, and jscpd reports zero clones across the migrated primitive slice. The full workspace typecheck remains blocked by unrelated `apps-gurudevi-marketingWeb` attendance payload errors; Gurudevi Mobile, `@repo/ui`, and `@repo/core` typechecks pass independently.
- A fresh Expo Web export now emits generated CSS payloads: index 51 KB, preflight 3.5 KB, theme payloads and utilities. The source `global.css` entry remains an empty shell by design; the generated payload is no longer empty.
- The isolated fixture at `runtime-fixtures/style-engine` emits an 82 KB CSS payload and passes browser computed-style checks. It intentionally imports only the primitives under test rather than the aggregate facade, whose unrelated exports pull application/domain modules into a renderer-only bundle.
- After the wiring correction: style-stack audit passes, `@repo/ui` typecheck passes, and all 13 UI suites/143 tests pass.
