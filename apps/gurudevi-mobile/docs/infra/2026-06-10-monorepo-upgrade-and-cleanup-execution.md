---
title: "Monorepo Upgrade and Navigation Purge Execution Report"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [monorepo, migration, upgrading, navigation, cleanup]
---

# Monorepo Upgrade & Navigation Purge Execution Report

This document reports the technical execution, rationale, and outcomes of the monorepo upgrades and cleanups performed on June 10, 2026.

---

## 1. Expo SDK 56 Parity Alignment

### Context & Rationale
`gurudevi-mobile` was migrated to Expo SDK 56, but several workspace packages (e.g., `@repo/ui`, `@repo/core`, `@repo/graphics`, and `@repo/scanner-kit`) were still referencing Expo SDK 55 packages. This version mismatch resulted in duplicate packages in the lockfile and risks of runtime native linking crashes.

### Actions Taken
- Ran the `align-expo-sdk.js` script to recursively update `package.json` files for all workspace packages.
- Pinned all Expo modules across `@repo/core`, `@repo/graphics`, `@repo/scanner-kit`, and `@repo/ui` to target SDK 56 compatible versions (e.g., `expo-router@~56.2.9`, `expo-video@~56.1.2`, and `expo-clipboard@~56.0.4`).
- Aligned other shared native package versions (`react-native-skia`, `react-native-svg`, and `@react-native-community/slider`) in `packages/ui/package.json` to match `apps/gurudevi-mobile/package.json` exactly.

---

## 2. React Navigation Decoupling & Flag Purge

### Context & Rationale
With the migration to Expo Router fully realized for routing, legacy React Navigation dependencies became redundant. Continuing to support both architectures bloated the bundle and forced us to carry temporary migration-era checks while the live app was still straddling two routing models.

### Actions Taken
- **Decoupled Code**: Removed direct imports of `useNavigation` and other `@react-navigation/native` symbols in `@repo/ui` components ([GlobalHeader.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.tsx), [SanctuarySignal.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/SanctuarySignal.tsx), and [OnboardingScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/screens/OnboardingScreen.tsx)), replacing them with the unified `expo-router` `router` API.
- **Removed Dependencies**: Removed unused `@react-navigation/*` packages from dependencies inside `apps/gurudevi-mobile/package.json` and decoupled nested libraries.
- **Environment Flag Purge**: Removed the router-navigation-check bypass from the live Expo Router startup path so the app no longer depends on a legacy React Navigation-era escape hatch.

---

## 3. Safe Major Upgrades

### Context & Rationale
To align with newer tooling and avoid security vulnerabilities, several devDependencies and safe workspace packages were upgraded to their latest major versions.

### Actions Taken
- **Tooling Upgrades**: Upgraded `eslint` to `v10.4.1` and `vitest` to `v4.1.8`.
- **Runtime Dependency Upgrades**:
  - `uuid` to `v14.0.0`
  - `pino` to `v10.3.1`
  - `i18next` to `v26.3.1` & `react-i18next` to `v17.0.8`
  - `lucide-react` & `lucide-react-native` to `v1.17.0`
- **Retained Overrides**: Retained `@sentry/react-native@8.13.0` and `react-native-get-random-values@2.0.0` to test for runtime compatibility.
- **Downgrades/Reversions**: Reverted `@op-engineering/op-sqlite` to `^15.2.14` to resolve peer dependency issues with `@powersync/op-sqlite@0.9.9`.

---

## 4. Mise & PNPM Version Harmonization

### Context & Rationale
We identified discrepancies between the locally installed `pnpm` version and the version defined in `mise` config.

### Actions Taken
- Updated `mise.toml` and `@intuitui-labs/lk-edu-geo/package.json` to target `pnpm@11.5.2` explicitly.
- `mise` automatically aligned and activated the correct executable version, unifying local development and CI toolchains.

---

## 5. POA Client-Side Proxy Unentanglement

### Context & Rationale
The legacy Protocol-Oriented Authority (POA) client-side proxy introduced unnecessary network hops and complexity.

### Actions Taken
- Deleted redundant files `packages/core/src/api/poaProxy.ts` and `packages/core/src/api/temporalPOAProxy.ts`.
- Migrated authorization handling to direct database evaluations and clean API gateway middleware layers.
