---
title: "Expo Router Migration and Major Dependencies Audit"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, migration, expo-router, major-upgrades, dependency-audit]
---

# Expo Router Migration & Major Dependency Audit

This report addresses key questions regarding the Expo Router migration status, monorepo Expo version mismatches, pending major package upgrades, and library compatibility risks (such as `react-native-gesture-handler` major version upgrades).

---

## 1. Expo Router Migration Status

The transition from React Navigation to Expo Router in `gurudevi-mobile` is **roughly 70% to 75% complete**:
* **Active Routing**: All root paths (`/welcome`, `/auth`, `/onboarding`, `/self`, `/workspace`, `/community`, `/library`) are served dynamically via file-based routing under `/app`.
* **Legacy Code Remaining**: The root-level `App.tsx` and the stacks in `src/navigation/*` are archived shells. However, component-level imports of `useNavigation` from `@react-navigation/native` still exist in shared workspace packages (`@repo/ui`).
* **Remaining Migration Checklist**:
  1. Transfer capacity-aware dynamic tab labels to the Expo Router layout configuration.
  2. Implement reward celebration and breathing reset overlay states inside the active Expo Router layouts.
  3. Ensure web sidebar overlays trap keyboard focus properly on compact screen widths.
  4. Fully decouple remaining direct `@react-navigation/*` imports in shared packages.

---

## 2. Expo SDK Version Parity Check

Our shared libraries inside the monorepo are currently mismatched with the main mobile application:
* **`gurudevi-mobile`**: Successfully running on **Expo SDK 56** (packages pinned to `~56.0.0` or `~56.2.0`).
* **`@repo/ui`**: Still referencing **Expo SDK 55** packages:
  * `expo-auth-session`: `~55.0.16` (instead of `~56.0.13`)
  * `expo-clipboard`: `~55.0.13` (instead of `~56.0.4`)
  * `expo-file-system`: `~55.0.22` (instead of `~56.0.7`)
  * `expo-router`: `~55.0.16` (instead of `~56.2.9`)
  * `expo-sharing`: `~55.0.20` (instead of `~56.0.16`)
  * `expo-video`: `~55.0.18` (instead of `~56.1.2`)
  * `expo-web-browser`: `~55.0.16` (instead of `~56.0.5`)
* **`@repo/core`**: Still referencing **Expo SDK 55** packages:
  * `expo-clipboard`: `~55.0.13` (instead of `~56.0.4`)
  * `expo-crypto`: `~55.0.15` (instead of `~56.0.4`)
  * `expo-file-system`: `~55.0.22` (instead of `~56.0.7`)
  * `expo-sharing`: `~55.0.20` (instead of `~56.0.16`)

> [!WARNING]
> This mismatch causes duplicate dependency resolutions in the lockfile, bloating bundle size and causing potential runtime errors on native builds due to conflicting native SDK code.

---

## 3. Monorepo Major Upgrades Behind List

An audit of packages lagging behind major version updates:

### Core Mobile Dependencies
* `@sentry/react-native`: `~7.11.0` → `~8.13.0`
* `@casl/ability`: `^6.8.1` → `^7.0.0`
* `@casl/react`: `^5.0.1` → `^7.0.0`
* `@op-engineering/op-sqlite`: `^15.2.14` → `^16.2.0`
* `react-native-get-random-values`: `^1.11.0` → `^2.0.0`
* `uuid`: `^13.0.2` → `^14.0.0`

### Shared / Development Dependencies
* `eslint`: `^9.39.4` → `^10.4.1`
* `vitest`: `^2.1.9` → `^4.1.8`
* `lucide-react` & `lucide-react-native`: `^0.474.0` / `^0.563.0` → `^1.17.0`
* `i18next` & `react-i18next`: `^25.10.10` / `^16.6.6` → `^26.3.1` / `^17.0.8`
* `zod` (in form builder engine): `^3.25.76` → `^4.4.3` (Alpha/Beta stage)

---

## 4. Registry Conflicts & Gesture Handler v3 Risk

Upgrading native packages like `react-native-gesture-handler` to major version `v3` presents severe monorepo configuration risks:

### The Problem
If we upgrade `react-native-gesture-handler` to `v3` in our workspace packages, any third-party libraries installed from the public npm registry (which we do not control) that declare a peer dependency of `react-native-gesture-handler@^2.0.0` will:
1. Trigger peer dependency resolution warnings during `pnpm install`.
2. Potentially cause `pnpm` to instantiate multiple copies of the gesture handler package.
3. **Crash the App**: React Native native modules cannot be loaded twice at different versions in a single runtime binary.

### Recommended Mitigation Strategy
1. **Compatibility Audit**: Before upgrading, inspect public dependencies (like navigation or bottom sheet libraries) using `pnpm license list` or checking their peer-dependencies to ensure they support `react-native-gesture-handler@^3.0.0`.
2. **Overrides**: If we must upgrade but some registry packages have not yet updated their peer dependency bounds, we can force-unify resolution using `pnpm.overrides` in the root `package.json`:
   ```json
   "pnpm": {
     "overrides": {
       "react-native-gesture-handler": "^3.0.0"
     }
   }
   ```
3. **Conservative Pinning**: If overrides break the APIs of those third-party registry packages, we must pin `react-native-gesture-handler` to `v2.31.x` until those libraries publish updates supporting `v3`.
