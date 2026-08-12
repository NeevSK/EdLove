---
title: "Existing Gluestack and NativeWind Stack Hardening"
status: "active"
created: 2026-08-11
updated: 2026-08-11
author: "Naveen"
scribe: "Codex"
tags: [mobile, gluestack, nativewind, hardening, reliability]
---

# Existing Gluestack and NativeWind Stack Hardening

This is deliberately separate from the one-week styling-engine comparison in [the stack audit](./2026-08-11-gluestack-v5-stack-audit.md). Hardening means making the current compatibility bridge predictable before evaluating NativeWind v5 or UniWind.

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

### H5 — Engine spike handoff

The one-week NativeWind-vs-UniWind plan starts only after this hardening sequence produces a reproducible baseline. The hardening branch remains the rollback point.

## 2026-08-12 verification note

The UI test baseline initially failed before test execution because the React Native Worklets Babel plugin could not resolve `@babel/traverse` from the strict pnpm package boundary. The lockfile already contained the package, but it was not directly declared by `@repo/ui` or `gurudevi-mobile`. We added `@babel/traverse@7.29.8` as a dev dependency to both package boundaries and regenerated the lockfile and stack map.

After that boundary correction:

- `@repo/ui` tests: 15 suites, 149 tests passed.
- `@repo/ui` TypeScript build: passed.
- Style-stack audit: bridge invariants passed.
- Remaining `cssInterop` references: 101; retained deliberately as migration debt until component-level behavior is verified.

## Current hardening status

- [x] Separate hardening document and scope guard created.
- [x] Style-stack drift audit passes; it fails if the latest web export contains only empty CSS artifacts.
- [x] Baseline UI/type/test/web results captured; UI typecheck passes and the invalid-state test now checks the actual class contract.
- [x] UI Jest workspace subpath mapping hardened; 11/13 suites initially passed and 13/13 pass after the test-only Lucide ESM mock and invalid-state assertion correction.
- [x] Tailwind major-version debt resolved by removing the unused app devDependency on Tailwind 3.4.17; runtime Tailwind remains 4.3.0.
- [x] Lightning CSS policy resolved: root pnpm override pins `lightningcss` to `1.30.1`, matching gluestack’s NativeWind v5 guidance.
- [ ] CSS/type declaration ownership documented.
- [x] `cssInterop` exception inventory reviewed and risk-ranked in [the migration inventory](./2026-08-11-css-interop-migration-inventory.md); 101 registrations remain bridged and the canonical Pressable is the first reviewed `styled()` exception.
- [ ] Rollback baseline tagged or otherwise recorded.

## Baseline findings recorded on 2026-08-11

- `pnpm --filter @repo/ui check-types`: passed.
- `pnpm --filter @repo/ui test -- --runInBand`: the workspace alias and Lucide ESM loader failures were fixed in Jest configuration/mock infrastructure; the invalid-state test now verifies the `border-phase-danger` class instead of asserting an unsupported React Native accessibility-state key.
- `pnpm --filter gurudevi-mobile check-types`: failed on four unrelated existing errors (`BrandPulse` export and two role-name mismatches in `packages/admin`). No styling-stack error was reported.
- `pnpm --filter @repo/ui lint`: wrapper is not portable in this PowerShell because it embeds `&&`; direct ESLint passes the changed component after the invalid accessibility-state key was rejected. Config/mock files are ignored by the package ESLint policy.
- The workspace reports a Node engine warning because the environment is Node 24 while the workspace requests Node 22.x.
- `pnpm --filter gurudevi-mobile exec expo export -p web --output-dir dist`: JavaScript export succeeds, but `_expo/static/css/global-*.css` is 0 bytes.
- Adding `@tailwindcss/postcss@4.3.0` and `postcss.config.cjs` did not change the 0-byte output. This indicates the current `withNativeWind`/legacy `cssInterop`/CSS-first combination is still incomplete; it must be isolated and repaired before the engine comparison.
- `pnpm --filter gurudevi-mobile audit:web`: the web firewall blocks 62 unique native-module leak paths through existing shims. The command reports them as successfully intercepted, but they remain part of the web hardening surface.
- Browser smoke against the exported `dist` returned HTTP 200 but rendered a black screen because the static smoke server had no `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; this is an app-bootstrap environment blocker, not evidence that CSS generation failed. Use `pnpm --filter gurudevi-mobile inspect:web-runtime` with Doppler-loaded credentials for the next run.
- The isolated Tailwind/PostCSS processor emitted 27 KB from the shared CSS entry, proving Tailwind itself was not the empty-output problem.
- The canonical Metro wiring was aligned with NativeWind v5: explicit `react-native-css` dependencies, `withNativewind(config)`, CSS-first imports, `nativewind/theme`, PostCSS config and `react-native-css-env.d.ts`.
- A fresh Expo Web export now emits generated CSS payloads: index 51 KB, preflight 3.5 KB, theme payloads and utilities. The source `global.css` entry remains an empty shell by design; the generated payload is no longer empty.
- After the wiring correction: style-stack audit passes, `@repo/ui` typecheck passes, and all 13 UI suites/143 tests pass.
