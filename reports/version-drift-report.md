# Sovereign Dependency Intelligence & Cohort Audit Report

Generated: 2026-11-25T12:56:22.006Z
Threshold: \Delta_{\text{major}} \ge 2

## 1. Ecosystem Cohorts & External Registry Drift

### 1A. Sacred Native Architecture Pins (Inviolable AGENTS.md Rule 2)

✅ All Sacred Native Pins are verified with zero registry lag.

### 1B. Expo SDK 58 Deterministic Mobile Matrix (Runtime Bundled)

✅ Expo SDK 58 bundled runtime is fully up to date with SDK matrix.

### 1D. Standalone External Dependencies (Actionable Upgrades & Waivers)

| Status | Package | Reachability Tier | Current | Latest | Lag (Δ) | Notes / Waiver |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ⚠️ **`UNANNOTATED`** | `fallow` | 🛠️ `TOOLING` | `3.45.0` | `3.48.0` | +3 min | - |
| 📝 `WAIVED` | `@op-engineering/op-sqlite` | 🚀 `PRODUCTION` | `17.2.0` | `19.0.6` | +2 maj | v17 pinned for Nitro SQLite bindings and PowerSync native compatibility. |

### 1E. Upstream Ecosystem Hazards (rn-terrain TCDI Signals)

> **TCDI Signal Intelligence:** Multi-package compatibility and native runtime hazards projected from `c:/projects/rn-terrain`.

| Package | Current | Latest | Upstream Hazards & Active Regressions |
| :--- | :--- | :--- | :--- |
| `react-native-gesture-handler` | `3.5.0` | `SACRED_PIN` | • 🚫 Legacy Component Handlers (<PanGestureHandler>, <TapGestureHandler>) (CRITICAL)<br>• 💥 RNGH `Pressable` stops working (`isTouchPropagationAllowed` stuck false) [broken in 2.25.0, fixed in unresolved]<br>• 💥 v3 SIGABRT: Yoga assert on `RNGestureHandlerDetectorShadowNode` [broken in 3.0.0, fixed in unresolved]<br>• 💥 `compileDebugKotlin` FAILED with RN New Arch (0.69 era) [broken in 0.69.3, fixed in unresolved] |
| `react-native-reanimated` | `4.8.0` | `SACRED_PIN` | • 🚫 Internal PlainStyle export (HIGH)<br>• 🚫 Legacy Paper Architecture / Bridge Support (CRITICAL)<br>• 💥 Huge performance loss on New Arch with many animated components [broken in 4.1.0, fixed in unresolved]<br>• 💥 Occasional crash on Android when entering animation [broken in 3.17.5, fixed in unresolved]<br>• 💥 NPE in `ViewGroup.dispatchGetDisplayList` when Modal exits + navigates [broken in 4.1.3, fixed in unresolved] |
| `react-native-worklets` | `0.14.0` | `SACRED_PIN` | • 💥 Worklets Legacy Eval Mode memory regression in production [broken in 0.9.1, fixed in unresolved]<br>• 💥 Stack pairs Reanimated 4 + worklets but New Arch not active → crash [broken in 0.4.1, fixed in unresolved]<br>• 💥 Android Modal exit NPE (Reanimated 4.1.3 + worklets 0.6.1) [broken in 0.6.1, fixed in unresolved] |
| `react-native-nitro-modules` | `0.37.2` | `SACRED_PIN` | • 💥 0.37.x iOS: glog module import inside `namespace google` → cannot build NitroModules [broken in 0.37.0, fixed in unresolved]<br>• 💥 Launch abort: Symbol not found `std::exception_ptr::__from_native_exception_pointer` [broken in 0.36.5, fixed in unresolved]<br>• 💥 SIGSEGV in SyncJSCallback after upgrade to 0.36.4 [broken in 0.36.4, fixed in unresolved] |

## 2. Framework Dialect & Code Deprecation Drift

✅ Zero deprecated framework dialects detected across source code.

## 3. Internal Workspace Version Alignment Drift

> 💡 **Automated Alignment:** Run `pnpm run deps:harmonize` to automatically align all 32 manifests in-place.

| Package | Divergent Versions | Consuming Packages | Action / Sacred Baseline |
| :--- | :--- | :--- | :--- |
| `@astrojs/ts-content-mapper` | `0.2.0` vs `^0.2.0` | `0.2.0`: `apps-edlove-web`<br>`^0.2.0`: `apps-gurudevi-public` | Run `pnpm run deps:harmonize` |
| `@tanstack/react-table` | `9.3.1` vs `^9.3.1` | `9.3.1`: `gurudevi-mobile`<br>`^9.3.1`: `@repo/ui` | Run `pnpm run deps:harmonize` |
| `vitest-native` | `0.15.1` vs `^0.15.1` | `0.15.1`: `gurudevi-mobile`<br>`^0.15.1`: `@repo/admin`, `@repo/ui` | Run `pnpm run deps:harmonize` |
| `pdfjs-dist` | `6.5.438` vs `^6.5.438` | `6.5.438`: `gurudevi-web`<br>`^6.5.438`: `@repo/library` | Run `pnpm run deps:harmonize` |

## 4. Sovereign Command Center & Proactive Workflows

- **Harmonize All Packages**: `pnpm run deps:harmonize` (Applies canonical Ecosystem Cohort pins across all 32 manifests)
- **Verify Cohort Harmony**: `pnpm run deps:check` (Instant verification that no manifest has drifted)
- **Audit Mobile Native Health**: `pnpm --filter gurudevi-mobile exec expo-doctor` (Verifies native C++/Fabric runtime)
- **Upgrade Standalone Safe Patches**: `pnpm run deps:upgrade` (Smart upgrades preserving Sacred Pins and Cohorts)

