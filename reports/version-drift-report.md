# Sovereign Dependency Intelligence & Cohort Audit Report

Generated: 2026-10-19T08:09:17.850Z
Threshold: \Delta_{\text{major}} \ge 2

## 1. Ecosystem Cohorts & External Registry Drift

### 1A. Sacred Native Architecture Pins (Inviolable AGENTS.md Rule 2)

✅ All Sacred Native Pins are verified with zero registry lag.

### 1B. Expo SDK 58 Deterministic Mobile Matrix (Runtime Bundled)

✅ Expo SDK 58 bundled runtime is fully up to date with SDK matrix.

### 1C. Universal Platform Cohorts (Single-Version Policy)

| Status | Package | Current | Latest | Lag (Δ) | Cohort Policy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🏛️ `COHORT MANAGED` | `lightningcss-linux-x64-gnu` | `1.30.1` | `1.33.0` | +3 min | Tooling, Test & Quality Gates universal pin (1.30.1) |

### 1D. Standalone External Dependencies (Actionable Upgrades & Waivers)

| Status | Package | Reachability Tier | Current | Latest | Lag (Δ) | Notes / Waiver |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ⚠️ **`UNANNOTATED`** | `@tanstack/ai-client` | 💤 `INERT` | `0.23.3` | `0.39.3` | +16 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@tanstack/ai-react` | 💤 `INERT` | `0.19.3` | `0.30.4` | +11 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@zip.js/zip.js` | 💤 `INERT` | `2.14.0` | `2.24.0` | +10 min | - |
| ⚠️ **`UNANNOTATED`** | `@eslint-react/eslint-plugin` | 🛠️ `TOOLING` | `5.19.0` | `5.28.1` | +9 min | - |
| ⚠️ **`UNANNOTATED`** | `@sentry/react-native` | 🚀 `PRODUCTION` | `8.23.0` | `8.31.0` | +8 min | - |
| ⚠️ **`UNANNOTATED`** | `posthog-js` | 🚀 `PRODUCTION` | `1.430.2` | `1.438.12` | +8 min | - |
| ⚠️ **`UNANNOTATED`** | `@lottiefiles/dotlottie-react` | 🚀 `PRODUCTION` | `0.13.5` | `0.20.0` | +7 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `oxlint` | 🛠️ `TOOLING` | `1.81.0` | `1.88.0` | +7 min | - |
| 📝 `WAIVED` | `vercel` | 🛠️ `TOOLING` | `59.23.2` | `64.5.0` | +5 maj | v59 pinned for monorepo build deployment workflows. (Review: Next.js 17 milestone) |
| ⚠️ **`UNANNOTATED`** | `@rnx-kit/eslint-plugin` | 🛠️ `TOOLING` | `0.5.3` | `0.9.9` | +4 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@react-navigation/core` | 🛠️ `TOOLING` | `7.21.13` | `7.24.0` | +3 min | - |
| ⚠️ **`UNANNOTATED`** | `@supabase/mcp-server-supabase` | 🛠️ `TOOLING` | `0.11.0` | `0.14.0` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@swmansion/react-native-bottom-sheet` | 🚀 `PRODUCTION` | `0.14.1` | `0.17.0` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `foglamp` | 🚀 `PRODUCTION` | `0.7.1` | `0.10.1` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `inngest` | 🚀 `PRODUCTION` | `4.21.1` | `4.24.0` | +3 min | - |
| 📝 `WAIVED` | `@sentry/node` | 🚀 `PRODUCTION` | `8.55.2` | `11.8.0` | +3 maj | v8 held for Node/Hono server compatibility. (Review: Hono v5 milestone) |
| ⚠️ **`UNANNOTATED`** | `@opentelemetry/exporter-trace-otlp-http` | 🚀 `PRODUCTION` | `0.221.0` | `0.223.0` | +2 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@tanstack/react-pacer` | 🚀 `PRODUCTION` | `0.22.1` | `0.24.1` | +2 min (0.x break) | - |
| 📝 `WAIVED` | `inline-style-prefixer` | 🚀 `PRODUCTION` | `5.1.2` | `7.0.1` | +2 maj | v5 pinned as direct peer dependency of react-native-web runtime. (Review: react-native-web v0.22) |
| 📝 `WAIVED` | `tesseract.js` | 💤 `INERT` | `5.1.1` | `7.0.0` | +2 maj | v5 pinned for local web worker and OCR model asset stability. (Review: Q1-2027) |

### 1E. Upstream Ecosystem Hazards (rn-terrain TCDI Signals)

> **TCDI Signal Intelligence:** Multi-package compatibility and native runtime hazards projected from `c:/projects/rn-terrain`.

| Package | Current | Latest | Upstream Hazards & Active Regressions |
| :--- | :--- | :--- | :--- |
| `react-native-gesture-handler` | `3.3.0` | `SACRED_PIN` | • 🚫 Legacy Component Handlers (<PanGestureHandler>, <TapGestureHandler>) (CRITICAL)<br>• 💥 RNGH `Pressable` stops working (`isTouchPropagationAllowed` stuck false) [broken in 2.25.0, fixed in unresolved]<br>• 💥 v3 SIGABRT: Yoga assert on `RNGestureHandlerDetectorShadowNode` [broken in 3.0.0, fixed in unresolved]<br>• 💥 `compileDebugKotlin` FAILED with RN New Arch (0.69 era) [broken in 0.69.3, fixed in unresolved] |
| `react-native-reanimated` | `4.7.1` | `SACRED_PIN` | • 🚫 Internal PlainStyle export (HIGH)<br>• 🚫 Legacy Paper Architecture / Bridge Support (CRITICAL)<br>• 💥 Huge performance loss on New Arch with many animated components [broken in 4.1.0, fixed in unresolved]<br>• 💥 Occasional crash on Android when entering animation [broken in 3.17.5, fixed in unresolved]<br>• 💥 NPE in `ViewGroup.dispatchGetDisplayList` when Modal exits + navigates [broken in 4.1.3, fixed in unresolved] |
| `react-native-worklets` | `0.13.0` | `SACRED_PIN` | • 💥 Worklets Legacy Eval Mode memory regression in production [broken in 0.9.1, fixed in unresolved]<br>• 💥 Stack pairs Reanimated 4 + worklets but New Arch not active → crash [broken in 0.4.1, fixed in unresolved]<br>• 💥 Android Modal exit NPE (Reanimated 4.1.3 + worklets 0.6.1) [broken in 0.6.1, fixed in unresolved] |
| `react-native-nitro-modules` | `0.37.1` | `SACRED_PIN` | • 💥 0.37.x iOS: glog module import inside `namespace google` → cannot build NitroModules [broken in 0.37.0, fixed in unresolved]<br>• 💥 Launch abort: Symbol not found `std::exception_ptr::__from_native_exception_pointer` [broken in 0.36.5, fixed in unresolved]<br>• 💥 SIGSEGV in SyncJSCallback after upgrade to 0.36.4 [broken in 0.36.4, fixed in unresolved] |

## 2. Framework Dialect & Code Deprecation Drift

✅ Zero deprecated framework dialects detected across source code.

## 3. Internal Workspace Version Alignment Drift

> 💡 **Automated Alignment:** Run `pnpm run deps:harmonize` to automatically align all 32 manifests in-place.

| Package | Divergent Versions | Consuming Packages | Action / Sacred Baseline |
| :--- | :--- | :--- | :--- |
| `@supabase/postgrest-js` | `2.117.2` vs `2.118.0` | `2.117.2`: `gurudevi-mobile`, `@repo/community`<br>`2.118.0`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `@supabase/supabase-js` | `2.117.2` vs `2.118.0` | `2.117.2`: `gurudevi-mobile`, `@repo/accounting`, `@repo/community`, `@repo/graphics`<br>`2.118.0`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `effect` | `^4.0.2` vs `^4.0.5` | `^4.0.2`: `gurudevi-mobile`<br>`^4.0.5`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `@orpc/client` | `2.0.0-beta.44` vs `1.15.7` | `2.0.0-beta.44`: `gurudevi-web`, `@repo/sanctuary-api`<br>`1.15.7`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `@orpc/contract` | `2.0.0-beta.44` vs `1.15.7` | `2.0.0-beta.44`: `@repo/sanctuary-api`<br>`1.15.7`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `@orpc/server` | `2.0.0-beta.44` vs `1.15.7` | `2.0.0-beta.44`: `@repo/sanctuary-api`<br>`1.15.7`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `inngest` | `^4.24.0` vs `^4.21.1` | `^4.24.0`: `@repo/sanctuary-api`<br>`^4.21.1`: `@repo/core` | Run `pnpm run deps:harmonize` |

## 4. Sovereign Command Center & Proactive Workflows

- **Harmonize All Packages**: `pnpm run deps:harmonize` (Applies canonical Ecosystem Cohort pins across all 32 manifests)
- **Verify Cohort Harmony**: `pnpm run deps:check` (Instant verification that no manifest has drifted)
- **Audit Mobile Native Health**: `pnpm --filter gurudevi-mobile exec expo-doctor` (Verifies native C++/Fabric runtime)
- **Upgrade Standalone Safe Patches**: `pnpm run deps:upgrade` (Smart upgrades preserving Sacred Pins and Cohorts)

