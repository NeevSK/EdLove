---
name: expo-rn-expert
description: Authoritative engineering guidelines for building cross-platform React Native applications with Expo SDK and Expo Router.
---

# Expo & React Native Engineering Playbook (expo-rn-expert)

Authoritative engineering guidelines for building cross-platform React Native (web and mobile) applications with **Expo SDK 58**, React Native 0.88 (New Architecture), and Expo Router in the Polymath Platform monorepo.

---

## 0. Stack Facts (Expo SDK 58 — Active Platform Baseline)

- **Expo SDK**: `~58.0.3` · **React Native**: `0.88.0-rc.3` (New Architecture) · **React**: `19.3.0`
- **New Architecture only**: Legacy architecture was removed in SDK 55. All native
  modules must be New-Architecture (Fabric/TurboModules) compatible.
- **Expo Router**: Aligned with SDK 58. Deep linking via `gurudevi`
  scheme; `DeepLinkProvider` is mounted in the root `app/_layout.tsx` provider tree.
- **Sacred native pins** (do NOT change without explicit approval — see `AGENTS.md`):
  - `react-native-gesture-handler`: `3.3.0` (RNGH v3 for New Architecture)
  - `react-native-reanimated`: `4.7.1` (Reanimated 4 for New Architecture & Expo 58)
  - `react-native-worklets`: `0.13.0` (Required by Reanimated 4.7)
  - `react-native-mmkv`: `4.3.2` (Nitro modules v4)
  - `react-native-nitro-modules`: `0.37.1` (Required by MMKV 4 / Nitro v0.37)
  - `react-native-skia`: `3.0.2` (RN Skia v3 Graphite/WebGPU fork)
  - `typescript`: `7.0.2` (Monorepo baseline)
- **NEVER run `npx expo install --fix` or `--check`** — it downgrades sacred pins
  and breaks the New-Architecture build. Use `pnpm --filter gurudevi-mobile exec expo-doctor`.
- **NEVER hand-edit `android/` or `ios/`** — they are ephemeral prebuild output.
  All native config goes through `apps/gurudevi-mobile/app.json` config plugins and
  `apps/gurudevi-mobile/plugins/*.js`.
- **EAS**: profiles `development` (dev client), `preview`, `production` in
  `eas.json`; `appVersionSource: "remote"`, Node `22.23.2`. Project id:
  `1701dfb9-c59e-45c6-a391-58c061a0b8ce`.

---

## 1. Core Architecture & Standards

### A. Modern TypeScript & Type Safety
*   **Strict Mode**: Avoid the use of `any` types. If a type is unknown or complex, define custom interfaces, types, or use generics.
*   **Imports**: Prefer absolute path aliasing via `tsconfig.json` imports (e.g. `@repo/ui/*` or `@/components/*`) to preserve refactorability.
*   **Component Structure**: Always use functional components with explicitly typed props (`React.FC<Props>` or inline destructured types).

---

## 2. Navigation with Expo Router

*   **File-Based Conventions**: Adhere strictly to the `app/` folder routing layout rules:
    *   Shared layout primitives must reside in `_layout.tsx` wrappers.
    *   Route targets should use clean, semantic naming (e.g., `app/(auth)/login.tsx`).
*   **Link Primitives**: Utilize `<Link>` from `expo-router` instead of manual programmatic navigation hooks where possible, to enable declarative, type-safe path transitions.
*   **Query Parameters**: Define clean, validated typings for search params using Zod schemas when resolving deep-link inputs.
*   **Root Layout**: `app/_layout.tsx` is the single bootstrapping point — it owns
    provider mounting (QueryClient → GlobalProvider → EnvironmentProvider →
    PowerSyncProvider → DeepLinkProvider → AppContent), the TOBAC auth guard,
    App Lock (biometrics/PIN), splash-screen handling, and font loading. Treat it
    as a RED-zone file: propose changes, do not edit unilaterally.
*   **Deep Links**: native links are dispatched through `DeepLinkProvider` (mounted
    at the root) → `deepLink.handleURL`. Auth callback `gurudevi://auth/callback`
    is intercepted here; no `app/auth-callback` route file exists.

---

## 3. Universal Layouts & Viewport Scrolling

To eliminate viewport cutoffs and frozen scrolls on high-performance web/mobile layouts (specifically high-constrained web browsers), adhere to the following adaptive viewport layout rules:

### A. The Flexible Scrolling Principle
> [!IMPORTANT]
> Never lock layout heights in complex component shells. Avoid hardcoded `flex: 1` heights that prevent content from expanding naturally.

*   **AdaptiveScrollContainer**: Wrap scrolling lists in robust adaptive boxes using:
    ```tsx
    import { ScrollView, StyleSheet } from 'react-native';
    
    // Always supply explicit content container styles instead of top-level container styles
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
    ```
*   **Web Overrides**: For web-targeted builds, utilize CSS overrides to neutralize rigid viewport constraints and restore natural HTML document scrolling:
    ```css
    html, body, #root {
      height: auto;
      min-height: 100%;
      overflow-y: auto;
    }
    ```

---

## 4. Performance & Resource Loading

*   **Asset Preloading**: Pre-fetch all visual assets (icons, fonts, images) inside the Root Layout wrapper before releasing the native Splash Screen (`expo-splash-screen`).
*   **List Rendering**: Always implement `FlashList` from `@shopify/flash-list` rather than standard `FlatList` for long-scroll interfaces to guarantee 60fps item recycle performance on lower-tier Android and iOS mobile hardware. FlashList v2 **fails** if the New Architecture is disabled (New Arch is always enabled here).
*   **Inline Functions**: Prevent inline JSX arrow functions or inline object declarations inside render blocks to avoid triggering redundant garbage collection sweeps.

---

## 5. New-Architecture Native Modules

*   All native module work goes through **Nitro modules** (`react-native-nitro-modules`
    0.37.1) or Expo Modules. See the nitro-guidance / mmkv-guidance skills for the
    enforcement spec.
*   Motion/animation code uses **Reanimated 4** (4.7.1) + **RNGH v3** (3.3.0, hook-based API).
    Reanimated 4 requires `react-native-worklets` (0.13.0).
*   When adding a native dependency: (1) check for an Expo config plugin and wire it
    into `app.json`; (2) for Maven repos add `android.extraMavenRepos` under
    `expo-build-properties`; (3) for custom native code, write a config plugin under
    `apps/gurudevi-mobile/plugins/` — never hand-edit `android/`/`ios/`.

---

## 6. Builds, EAS & Verification

*   Local web: `pnpm --filter gurudevi-mobile web`. Typecheck:
    `pnpm --filter gurudevi-mobile check-types`. Tests:
    `pnpm --filter gurudevi-mobile test`.
*   EAS builds use the profiles in `eas.json` — dev-client for `development`,
    APK for `preview`, AAB for `production`. Secrets flow through Doppler
    (`doppler run --no-fallback --`), never `.env` files.
*   After any dependency change, run `pnpm run stack-map` (see `AGENTS.md`).
*   Do not claim a native build passes without device/CI verification — Android
    builds take ~20 minutes locally and are deferred to CI.

---

## 7. How to Update Expo SDK

1. **Review Upstream**: Check the Expo SDK changelog and breaking changes before bumping versions.
2. **Upgrade SDK**: Run `npx expo upgrade` (updates SDK + aligned Expo packages).
3. **Verify with Doctor**: Run `pnpm --filter gurudevi-mobile exec expo-doctor` to audit dependency alignment.
4. **Physical Device Validation**: Test on a physical iOS/Android device to verify Fabric and TurboModules initialization.
5. **Protect Sacred Pins**: If `expo upgrade` attempts to bump or align sacred pinned packages (RNGH, Reanimated, MMKV, Nitro, Skia), manually restore the pins in `package.json` and verify `expo.install.exclude` and `expo.doctor.reactNativeDirectoryCheck.exclude`.

---

## 8. Debugging Native Prebuild & Config Plugins

1. **Inspect Resolved Prebuild Config**:
   ```bash
   npx expo config --type prebuild
   ```
   Verifies whether custom config plugins under `apps/gurudevi-mobile/plugins/` transformed the manifest/gradle files as expected.
2. **Clean Ephemeral Native State**:
   ```powershell
   Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
   npx expo prebuild --no-install --platform android
   ```
3. **Inspect Plugin Logs**: Prebuild output enumerates every executed plugin in sequence. Look for plugin resolution failures.
4. **Reference Documentation**:
   - Developer runbook: [`apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md`](file:///c:/x/apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md)
   - Infra & Gradle SOP: [`apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md`](file:///c:/x/apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md)

---

## 9. Agent-Native CLI (`@expo/agent-cli`) in Expo SDK 58

Expo SDK 58 introduces `@expo/agent-cli` (`bin: expo-agent-cli`), the official agent-native interface designed for AI coding agents to run Expo workflows with machine-readable outputs and structured exit codes:

### Core Workflows
* **Project Health & Status**:
  ```bash
  npx @expo/agent-cli status
  ```
  Returns parsed project configuration, SDK alignment, and recommended next step.
* **Detached Dev Server Execution**:
  ```bash
  npx @expo/agent-cli dev --detach
  ```
  Spawns Metro/native dev server in detached mode so agent sessions retain execution control.
* **Runtime Verification & Screen Inspection**:
  ```bash
  npx @expo/agent-cli runtime:tree    # Inspect visible hierarchy and testIDs
  npx @expo/agent-cli runtime:errors  # Capture active exceptions over time window
  npx @expo/agent-cli runtime:reload  # Reload app from disk modifications
  ```
* **Single-Exit-Code Smoke Gate**:
  ```bash
  npx @expo/agent-cli smoke
  ```
  Verifies the running app bundle matches disk changes and returns exit code 0 or structured failure code.
* **Automated Package Skill Synchronization**:
  ```bash
  npx @expo/agent-cli skills:sync
  ```
  Walks autolinked Expo dependencies, discovers embedded `skills/<name>/SKILL.md` files, and creates junctions in `.agents/skills/`.
