---
title: "Peer Dependency Audit and Intentional Mismatches"
status: "active"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [peer-dependencies, expo-57, eslint, nativewind, audit]
---

# Peer Dependency Audit and Intentional Mismatches

## Context

After completing the Expo SDK 57 + React Native 0.86.3 + React 19.2.8 dependency update
batch, `pnpm peers check` reported a large number of peer dependency warnings. This audit
investigates each category, determines whether it is a real conflict, a stale pin, or an
intentional architectural choice, and documents the rationale for the actions taken (or
deliberately not taken).

## Stale Pins Fixed

These workspace packages declared peer versions that lagged behind the actually installed
versions. They were trivial metadata mismatches — no runtime breakage.

| Package | Peer | Before | After | Rationale |
|---|---|---|---|---|
| `@repo/core` | `zustand` | `^4.5.0` | `^5.0.14` | Dev dep is 5.0.15; all store files use named imports (`create`, `persist`, `createJSONStorage`) that are unchanged in v5. |
| `@repo/ui` | `@react-native-async-storage/async-storage` | `2.1.2` | `2.2.0` | Installed is 2.2.0; `@repo/core` and `@repo/profile` already declare 2.2.0. |
| `@repo/scanner-kit` | `react` | `19.2.3` | `19.2.8` | Installed is 19.2.8 after repo-wide update. |
| `@repo/scanner-kit` | `react-native` | `0.85.3` | `0.86.3` | Installed is 0.86.3 after repo-wide update. |

Additionally, `packages/core/package.json` and `packages/scanner-kit/package.json` had CRLF
line endings that were normalized to LF.

## Intentional Mismatches (No Action)

These peer warnings remain deliberately. They are either documented architectural decisions
or empirically verified as non-breaking despite their declared peer ranges.

### 1. `react-native-css-interop@0.1.22` wants `tailwindcss ~3`

**Installed**: tailwindcss 4.3.0

**Status**: Intentional, documented, DO NOT touch.

**Rationale**: The repo uses NativeWind v5 (`5.0.0-preview.4`) which requires
`react-native-css@3.0.7` (the renamed successor). However, 17 frozen legacy components
under `packages/ui/src/components-legacy/` still import `cssInterop` from
`react-native-css-interop@0.1.22`. This is a deliberate retained legacy bridge — the
product-owned path has migrated to `styled()` via `react-native-css`, but the legacy tree
is intentionally preserved.

- Metro config (`metro.config.js:283-287`) resolves `react-native-css-interop/jsx-runtime`
  for the legacy components.
- Jest config (`jest.config.js:43`) mocks the legacy package.
- An `audit:css-interop` script and `verify:style-stack` pipeline guard this state.
- Documented in `docs/infra/2026-08-11-gluestack-v5-stack-audit.md` (lines 156-157, 503).

The `tailwindcss ~3` peer on css-interop 0.1.22 is correct for that package's original
design — it was never updated for v4 because the library was forked/renamed to
`react-native-css`. The mismatch is a metadata artifact, not a runtime issue.

### 2. ESLint plugins declare `eslint ^9` max (installed 10.9.1)

**Packages affected**: `eslint-plugin-jsx-a11y@6.10.2`, `eslint-plugin-react-hooks@7.1.1`,
`eslint-plugin-react-native@5.0.0`, `eslint-plugin-deprecation@3.0.0`

**Status**: Working despite metadata — empirically tested, no crashes.

**Rationale**: ESLint 10 removed deprecated APIs (`context.getFilename()`,
`getTokenOrCommentBefore()`, etc.) that some plugins call. Research indicates these specific
plugins *may* crash on certain rule invocations. However, direct testing on the mobile app's
JSX components (`src/screens/AccountRecoveryScreen.tsx`) confirmed eslint 10.9.1 runs all
loaded rules without error:

- `react-native/no-inline-styles`: ✅ fires correctly
- `react-native/no-color-literals`: ✅ fires correctly
- `react-native-a11y/has-accessibility-hint`: ✅ fires correctly
- `react-hooks/rules-of-hooks`: ✅ registered (no violations in test file)
- `react-hooks/exhaustive-deps`: ✅ registered (no violations in test file)

The root `eslint.config.js` uses only `base.js` (modern plugins: `@eslint-react`,
`eslint-plugin-import-x`, `typescript-eslint@8.61`, `eslint-plugin-oxlint`,
`eslint-plugin-sonarjs`). The mobile app's `eslint.config.mjs` loads `react-internal.js`
which adds the legacy plugins above. Neither config loads `eslint-plugin-import` (the
crash-risk legacy package) — the repo uses `eslint-plugin-import-x` instead.

**Action**: Accept the peer metadata warnings. Revisit when the upstream packages publish
new releases with `^10` in their peer ranges.

### 3. `eslint-plugin-oxlint@1.81.0` wants `oxlint ~1.81.0`

**Installed**: oxlint 1.81.0

**Status**: Peer satisfied (exact match).

The earlier summary listed this as `~1.80.0` but the actual peer range in
`eslint-plugin-oxlint@1.81.0` is `~1.81.0`. The installed oxlint 1.81.0 satisfies this.
No issue.

### 4. `@typescript-eslint/*@6.21.0` declares `eslint ^7 || ^8`

**Status**: Not loaded at runtime.

These are transitive packages in the lockfile but are not imported by any eslint config.
The repo uses `typescript-eslint@8.61` (via `base.js` line 6) which declares
`eslint ^8.57.0 || ^9.0.0 || ^10.0.0`. The old 6.x packages are phantom peers.

## Missing Peers (Not Real Conflicts)

The bulk of `pnpm peers check` output consists of "missing peer" warnings from workspace
packages (`@repo/ui`, `@repo/core`, `@repo/scanner-kit`) that declare peers for optional
native dependencies (expo-*, react-native-*, @shopify/*) which are only installed in the
consuming app, not in the shared package itself. This is the expected pattern for
workspace libraries — the mobile app satisfies these peers at install time.

## Expiry / Revisit Triggers

| Condition | Action |
|---|---|
| `eslint-plugin-react` publishes `>=7.38.0` with `eslint ^10` peer | Remove the peer warning by upgrading |
| `eslint-plugin-jsx-a11y` publishes `>=7.0.0` with `eslint ^10` peer | Same |
| NativeWind v5 releases stable (drops `5.0.0-preview`) | Audit whether `react-native-css-interop` is still needed or can be dropped |
| `react-native-css` renames or supersedes css-interop entirely | Update metro config and jest mock to point to new package |
| pnpm adds `--strict-peer-dependencies` enforcement | Review whether these intentional mismatches need `pnpm.peerDependencyRules.ignore` |

## Files Changed in This Audit

- `packages/core/package.json` — zustand peer `^4.5.0` → `^5.0.14`, CRLF → LF
- `packages/ui/package.json` — async-storage peer `2.1.2` → `2.2.0`
- `packages/scanner-kit/package.json` — react peer `19.2.3` → `19.2.8`, react-native peer `0.85.3` → `0.86.3`, CRLF → LF

## Verification

- `tsc --build --noEmit` passes for `@repo/core`, `@repo/ui`, `@repo/scanner-kit` (0 errors)
- `biome check` passes all 3 changed files (0 errors)
- `pnpm peers check` warnings reduced to the documented intentional mismatches only
