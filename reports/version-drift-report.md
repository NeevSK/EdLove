# Sovereign Dependency Intelligence & Cohort Audit Report

Generated: 2026-10-28T12:32:54.375Z
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
| 🏛️ `COHORT MANAGED` | `typescript-eslint` | `8.69.0` | `8.72.1` | +3 min | Tooling, Test & Quality Gates universal pin (8.69.0) |

### 1D. Standalone External Dependencies (Actionable Upgrades & Waivers)

| Status | Package | Reachability Tier | Current | Latest | Lag (Δ) | Notes / Waiver |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ⚠️ **`UNANNOTATED`** | `@opentelemetry/exporter-trace-otlp-http` | 🚀 `PRODUCTION` | `0.221.0` | `0.300.0` | +79 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@sentry/react-native` | 🚀 `PRODUCTION` | `8.23.0` | `8.32.0` | +9 min | Description only (no waiver): "v8.31.0 active in mobile app; aligned to Expo SDK 58 runtime." |
| ⚠️ **`UNANNOTATED`** | `oxlint@1.81.0 (dev)` | 🛠️ `TOOLING` | `1.81.0` | `1.90.0` | +9 min | - |
| ⚠️ **`UNANNOTATED`** | `@lottiefiles/dotlottie-react` | 🚀 `PRODUCTION` | `0.13.5` | `0.20.0` | +7 min (0.x break) | - |
| 📝 `WAIVED` | `vercel` | 🛠️ `TOOLING` | `59.26.0` | `65.4.0` | +6 maj | v59 pinned for monorepo build deployment workflows. (Review: Next.js 17 milestone) |
| ⚠️ **`UNANNOTATED`** | `@rnx-kit/eslint-plugin` | 🛠️ `TOOLING` | `0.5.3` | `0.9.9` | +4 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@supabase/mcp-server-supabase` | 🛠️ `TOOLING` | `0.11.0` | `0.14.0` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@swmansion/react-native-bottom-sheet` | 🚀 `PRODUCTION` | `0.14.1` | `0.17.1` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `fallow` | 🛠️ `TOOLING` | `3.33.1` | `3.36.0` | +3 min | - |
| ⚠️ **`UNANNOTATED`** | `foglamp` | 🚀 `PRODUCTION` | `0.7.1` | `0.10.1` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `posthog-react-native` | 🚀 `PRODUCTION` | `4.81.8` | `4.84.2` | +3 min | - |
| ⚠️ **`UNANNOTATED`** | `@stripe/stripe-react-native` | 🚀 `PRODUCTION` | `0.81.0` | `0.83.0` | +2 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@tanstack/react-pacer` | 🚀 `PRODUCTION` | `0.22.1` | `0.24.1` | +2 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `oxfmt` | 🛠️ `TOOLING` | `0.73.0` | `0.75.0` | +2 min (0.x break) | - |
| 📝 `WAIVED` | `@op-engineering/op-sqlite` | 🚀 `PRODUCTION` | `17.2.0` | `19.0.1` | +2 maj | v17 pinned for Nitro SQLite bindings and PowerSync native compatibility. |
| 📝 `WAIVED` | `inline-style-prefixer` | 🚀 `PRODUCTION` | `5.1.2` | `7.0.1` | +2 maj | v5 pinned as direct peer dependency of react-native-web runtime. (Review: react-native-web v0.22) |
| 📝 `WAIVED` | `tesseract.js` | 💤 `INERT` | `5.1.1` | `7.0.0` | +2 maj | v5 pinned for local web worker and OCR model asset stability. (Review: Q1-2027) |

### 1E. Upstream Ecosystem Hazards (rn-terrain TCDI Signals)

> **TCDI Signal Intelligence:** Multi-package compatibility and native runtime hazards projected from `c:/projects/rn-terrain`.

| Package | Current | Latest | Upstream Hazards & Active Regressions |
| :--- | :--- | :--- | :--- |
| `react-native-gesture-handler` | `3.4.0` | `SACRED_PIN` | • 🚫 Legacy Component Handlers (<PanGestureHandler>, <TapGestureHandler>) (CRITICAL)<br>• 💥 RNGH `Pressable` stops working (`isTouchPropagationAllowed` stuck false) [broken in 2.25.0, fixed in unresolved]<br>• 💥 v3 SIGABRT: Yoga assert on `RNGestureHandlerDetectorShadowNode` [broken in 3.0.0, fixed in unresolved]<br>• 💥 `compileDebugKotlin` FAILED with RN New Arch (0.69 era) [broken in 0.69.3, fixed in unresolved] |
| `react-native-reanimated` | `4.7.1` | `SACRED_PIN` | • 🚫 Internal PlainStyle export (HIGH)<br>• 🚫 Legacy Paper Architecture / Bridge Support (CRITICAL)<br>• 💥 Huge performance loss on New Arch with many animated components [broken in 4.1.0, fixed in unresolved]<br>• 💥 Occasional crash on Android when entering animation [broken in 3.17.5, fixed in unresolved]<br>• 💥 NPE in `ViewGroup.dispatchGetDisplayList` when Modal exits + navigates [broken in 4.1.3, fixed in unresolved] |
| `react-native-worklets` | `0.13.0` | `SACRED_PIN` | • 💥 Worklets Legacy Eval Mode memory regression in production [broken in 0.9.1, fixed in unresolved]<br>• 💥 Stack pairs Reanimated 4 + worklets but New Arch not active → crash [broken in 0.4.1, fixed in unresolved]<br>• 💥 Android Modal exit NPE (Reanimated 4.1.3 + worklets 0.6.1) [broken in 0.6.1, fixed in unresolved] |
| `react-native-nitro-modules` | `0.37.1` | `SACRED_PIN` | • 💥 0.37.x iOS: glog module import inside `namespace google` → cannot build NitroModules [broken in 0.37.0, fixed in unresolved]<br>• 💥 Launch abort: Symbol not found `std::exception_ptr::__from_native_exception_pointer` [broken in 0.36.5, fixed in unresolved]<br>• 💥 SIGSEGV in SyncJSCallback after upgrade to 0.36.4 [broken in 0.36.4, fixed in unresolved] |

## 2. Framework Dialect & Code Deprecation Drift

✅ Zero deprecated framework dialects detected across source code.

## 3. Internal Workspace Version Alignment Drift

> 💡 **Automated Alignment:** Run `pnpm run deps:harmonize` to automatically align all 32 manifests in-place.

| Package | Divergent Versions | Consuming Packages | Action / Sacred Baseline |
| :--- | :--- | :--- | :--- |
| `@react-native-async-storage/async-storage` | `2.2.0` vs `*` | `2.2.0`: `gurudevi-mobile`<br>`*`: `@repo/profile` | Run `pnpm run deps:harmonize` |
| `effect` | `^4.0.5` vs `^4.0.0-alpha.1` | `^4.0.5`: `gurudevi-mobile`, `@repo/admin`, `@repo/classroom`, `@repo/core`, `@repo/scanner-kit`, `@repo/ui`<br>`^4.0.0-alpha.1`: `@repo/self` | Run `pnpm run deps:harmonize` |
| `react-native-enriched-markdown` | `1.1.1` vs `^1.1.1` | `1.1.1`: `gurudevi-mobile`<br>`^1.1.1`: `@repo/ui` | Run `pnpm run deps:harmonize` |
| `zod` | `4.6.7` vs `4.6.5` | `4.6.7`: `gurudevi-mobile`, `@repo/sanctuary-api`, `@repo/admin`, `@repo/classroom`, `@repo/community`, `@repo/core`, `@repo/database`, `@repo/platform-mcp`, `@repo/schema`, `@repo/self`, `@repo/ui`<br>`4.6.5`: `@repo/scanner-kit` | Run `pnpm run deps:harmonize` |
| `hono` | `5.0.0-rc.1` vs `^4.13.13` | `5.0.0-rc.1`: `@repo/sanctuary-api`<br>`^4.13.13`: `@repo/core` | Run `pnpm run deps:harmonize` |

## 4. Sovereign Command Center & Proactive Workflows

- **Harmonize All Packages**: `pnpm run deps:harmonize` (Applies canonical Ecosystem Cohort pins across all 32 manifests)
- **Verify Cohort Harmony**: `pnpm run deps:check` (Instant verification that no manifest has drifted)
- **Audit Mobile Native Health**: `pnpm --filter gurudevi-mobile exec expo-doctor` (Verifies native C++/Fabric runtime)
- **Upgrade Standalone Safe Patches**: `pnpm run deps:upgrade` (Smart upgrades preserving Sacred Pins and Cohorts)

