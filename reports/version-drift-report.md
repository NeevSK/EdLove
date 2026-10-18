# Sovereign Dependency Intelligence & Cohort Audit Report

Generated: 2026-10-17T17:56:24.615Z
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

| Status | Package | Current | Latest | Lag (Δ) | Notes / Waiver |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ⚠️ **`UNANNOTATED`** | `@tanstack/ai-client` | `0.23.3` | `0.39.3` | +16 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@tanstack/ai-react` | `0.19.3` | `0.30.4` | +11 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@zip.js/zip.js` | `2.14.0` | `2.24.0` | +10 min | - |
| ⚠️ **`UNANNOTATED`** | `@eslint-react/eslint-plugin` | `5.19.0` | `5.28.0` | +9 min | - |
| ⚠️ **`UNANNOTATED`** | `@sentry/react-native` | `8.23.0` | `8.31.0` | +8 min | - |
| ⚠️ **`UNANNOTATED`** | `posthog-js` | `1.430.2` | `1.438.12` | +8 min | - |
| ⚠️ **`UNANNOTATED`** | `@lottiefiles/dotlottie-react` | `0.13.5` | `0.20.0` | +7 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `oxlint` | `1.81.0` | `1.88.0` | +7 min | - |
| 📝 `WAIVED` | `vercel` | `59.23.2` | `64.3.1` | +5 maj | v59 pinned for monorepo build deployment workflows. |
| ⚠️ **`UNANNOTATED`** | `@rnx-kit/eslint-plugin` | `0.5.3` | `0.9.9` | +4 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@react-navigation/core` | `7.21.13` | `7.24.0` | +3 min | - |
| ⚠️ **`UNANNOTATED`** | `@supabase/mcp-server-supabase` | `0.11.0` | `0.14.0` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `foglamp` | `0.7.1` | `0.10.1` | +3 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `inngest` | `4.21.1` | `4.24.0` | +3 min | - |
| 📝 `WAIVED` | `@sentry/node` | `8.55.2` | `11.8.0` | +3 maj | v8 held for Node/Hono server compatibility. |
| ⚠️ **`UNANNOTATED`** | `@opentelemetry/exporter-trace-otlp-http` | `0.221.0` | `0.223.0` | +2 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@swmansion/react-native-bottom-sheet` | `0.14.1` | `0.16.2` | +2 min (0.x break) | - |
| ⚠️ **`UNANNOTATED`** | `@tanstack/react-pacer` | `0.22.1` | `0.24.1` | +2 min (0.x break) | - |
| 📝 `WAIVED` | `inline-style-prefixer` | `5.1.2` | `7.0.1` | +2 maj | v5 pinned as direct peer dependency of react-native-web runtime. |
| 📝 `WAIVED` | `tesseract.js` | `5.1.1` | `7.0.0` | +2 maj | v5 pinned for local web worker and model asset stability. |

## 2. Framework Dialect & Code Deprecation Drift

### zod: z.ZodTypeAny (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** Use z.ZodType (without generics) instead. (Replacement: z)

- [packages/core/src/api/planBridge.ts:21](file:///C:/x/packages/core/src/api/planBridge.ts#L21)
  ```typescript
  body: infer B extends z.ZodTypeAny;
  ```

### zod: z.input (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** Use `ctx.value` (Replacement: ctx.value)

- [packages/core/src/api/planBridge.ts:23](file:///C:/x/packages/core/src/api/planBridge.ts#L23)
  ```typescript
  ? z.input<B>
  ```

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

