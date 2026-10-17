# Sovereign Dependency Intelligence & Cohort Audit Report

Generated: 2026-10-17T05:29:47.722Z
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
| ⚠️ **`UNANNOTATED`** | `@zip.js/zip.js` | `2.14.0` | `2.23.0` | +9 min | - |
| ⚠️ **`UNANNOTATED`** | `@eslint-react/eslint-plugin` | `5.19.0` | `5.27.2` | +8 min | - |
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

### zod: z.ZodTypeAny (8 occurrences) — `Live Substrate Deprecation`
> **Advice:** Use z.ZodType (without generics) instead. (Replacement: z)

- [apps/sanctuary-api/src/core/orpc.ts:75](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L75)
  ```typescript
  function transformSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  ```
- [apps/sanctuary-api/src/core/orpc.ts:181](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L181)
  ```typescript
  z.ZodTypeAny,
  ```
- [apps/sanctuary-api/src/core/orpc.ts:182](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L182)
  ```typescript
  z.ZodTypeAny,
  ```
- [apps/sanctuary-api/src/core/orpc.ts:183](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L183)
  ```typescript
  ...z.ZodTypeAny[],
  ```
- [apps/sanctuary-api/src/core/orpc.ts:192](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L192)
  ```typescript
  params?: z.ZodTypeAny;
  ```
- [apps/sanctuary-api/src/core/orpc.ts:193](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L193)
  ```typescript
  query?: z.ZodTypeAny;
  ```
- [apps/sanctuary-api/src/core/orpc.ts:194](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L194)
  ```typescript
  body?: z.ZodTypeAny;
  ```
- [apps/sanctuary-api/src/core/orpc.ts:198](file:///C:/x/apps/sanctuary-api/src/core/orpc.ts#L198)
  ```typescript
  const envelope: Record<string, z.ZodTypeAny> = {};
  ```

### zod: z.uuid (120 occurrences) — `Live Substrate Deprecation`
> **Advice:** Use `z.uuid()` instead. (Replacement: z.uuid)

- [packages/core/src/api/admin.contract.ts:11](file:///C:/x/packages/core/src/api/admin.contract.ts#L11)
  ```typescript
  id: z.uuid(),
  ```
- [packages/core/src/api/admin.contract.ts:34](file:///C:/x/packages/core/src/api/admin.contract.ts#L34)
  ```typescript
  params: z.strictObject({ schoolId: z.uuid() }),
  ```
- [packages/core/src/api/admin.contract.ts:47](file:///C:/x/packages/core/src/api/admin.contract.ts#L47)
  ```typescript
  params: z.strictObject({ schoolId: z.uuid() }),
  ```
- [packages/core/src/api/admin.contract.ts:61](file:///C:/x/packages/core/src/api/admin.contract.ts#L61)
  ```typescript
  schoolId: z.uuid(),
  ```
- [packages/core/src/api/admin.contract.ts:63](file:///C:/x/packages/core/src/api/admin.contract.ts#L63)
  ```typescript
  userId: z.uuid().optional(),
  ```
- [packages/core/src/api/admin.contract.ts:80](file:///C:/x/packages/core/src/api/admin.contract.ts#L80)
  ```typescript
  params: z.strictObject({ id: z.uuid() }),
  ```
- [packages/core/src/api/admin.contract.ts:92](file:///C:/x/packages/core/src/api/admin.contract.ts#L92)
  ```typescript
  params: z.strictObject({ schoolId: z.uuid() }),
  ```
- [packages/core/src/api/admin.contract.ts:104](file:///C:/x/packages/core/src/api/admin.contract.ts#L104)
  ```typescript
  params: z.strictObject({ leaveId: z.uuid() }),
  ```
- [packages/core/src/api/admin.contract.ts:107](file:///C:/x/packages/core/src/api/admin.contract.ts#L107)
  ```typescript
  reviewedBy: z.uuid().optional(),
  ```
- [packages/core/src/api/admin.contract.ts:121](file:///C:/x/packages/core/src/api/admin.contract.ts#L121)
  ```typescript
  params: z.strictObject({ schoolId: z.uuid() }),
  ```
- *(...and 110 more occurrences)*

### zod: z.url (4 occurrences) — `Live Substrate Deprecation`
> **Advice:** Use `z.url()` instead. (Replacement: z.url)

- [packages/core/src/api/educational.contract.ts:406](file:///C:/x/packages/core/src/api/educational.contract.ts#L406)
  ```typescript
  url: z.url().nullable().optional(),
  ```
- [packages/core/src/api/educational.contract.ts:424](file:///C:/x/packages/core/src/api/educational.contract.ts#L424)
  ```typescript
  url: z.url().nullable().optional(),
  ```
- [packages/core/src/api/profile.contract.ts:18](file:///C:/x/packages/core/src/api/profile.contract.ts#L18)
  ```typescript
  url: z.string(), // z.url() is deprecated in v4, use refinements if needed
  ```
- [packages/core/src/logic/schemas/workspace-layout.schema.ts:7](file:///C:/x/packages/core/src/logic/schemas/workspace-layout.schema.ts#L7)
  ```typescript
  url: z.url(),
  ```

### react-native-gesture-handler: Gesture.Tap (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.Tap()` is deprecated and will be removed in the future. Please use `useTapGesture` instead. (Replacement: useTapGesture)

- [packages/ui/src/components/LotusPetalFAB.tsx:313](file:///C:/x/packages/ui/src/components/LotusPetalFAB.tsx#L313)
  ```typescript
  Gesture.Tap()
  ```

### react-native-gesture-handler: Gesture.Pan (4 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.Pan()` is deprecated and will be removed in the future. Please use `usePanGesture` instead. (Replacement: usePanGesture)

- [packages/ui/src/components/LotusPetalFAB.tsx:257](file:///C:/x/packages/ui/src/components/LotusPetalFAB.tsx#L257)
  ```typescript
  Gesture.Pan()
  ```
- [packages/ui/src/components/TemporalScrubber.tsx:45](file:///C:/x/packages/ui/src/components/TemporalScrubber.tsx#L45)
  ```typescript
  Gesture.Pan()
  ```
- [packages/ui/src/components/visualization/AstroView.tsx:125](file:///C:/x/packages/ui/src/components/visualization/AstroView.tsx#L125)
  ```typescript
  Gesture.Pan()
  ```
- [packages/ui/src/components/workspace/DraggableCanvasSurface.tsx:84](file:///C:/x/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx#L84)
  ```typescript
  Gesture.Pan()
  ```

### react-native-gesture-handler: Gesture.Exclusive (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.Exclusive()` is deprecated and will be removed in the future. Please use `useExclusiveGestures` instead. (Replacement: useExclusiveGestures)

- [packages/ui/src/components/LotusPetalFAB.tsx:324](file:///C:/x/packages/ui/src/components/LotusPetalFAB.tsx#L324)
  ```typescript
  () => Gesture.Exclusive(tapGesture, dragGesture),
  ```

### react-native-gesture-handler: Gesture.Pinch (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.Pinch()` is deprecated and will be removed in the future. Please use `usePinchGesture` instead. (Replacement: usePinchGesture)

- [packages/ui/src/components/visualization/AstroView.tsx:105](file:///C:/x/packages/ui/src/components/visualization/AstroView.tsx#L105)
  ```typescript
  Gesture.Pinch()
  ```

### react-native-gesture-handler: Gesture.Simultaneous (2 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.Simultaneous()` is deprecated and will be removed in the future. Please use `useSimultaneousGestures` instead. (Replacement: useSimultaneousGestures)

- [packages/ui/src/components/visualization/AstroView.tsx:147](file:///C:/x/packages/ui/src/components/visualization/AstroView.tsx#L147)
  ```typescript
  () => Gesture.Simultaneous(pinchGesture, panGesture),
  ```
- [packages/ui/src/components/workspace/DraggableCanvasSurface.tsx:130](file:///C:/x/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx#L130)
  ```typescript
  () => Gesture.Simultaneous(longPressGesture, dragGesture),
  ```

### react-native-gesture-handler: Gesture.LongPress (1 occurrences) — `Live Substrate Deprecation`
> **Advice:** `Gesture.LongPress()` is deprecated and will be removed in the future. Please use `useLongPressGesture` instead. (Replacement: useLongPressGesture)

- [packages/ui/src/components/workspace/DraggableCanvasSurface.tsx:67](file:///C:/x/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx#L67)
  ```typescript
  Gesture.LongPress()
  ```

## 3. Internal Workspace Version Alignment Drift

> 💡 **Automated Alignment:** Run `pnpm run deps:harmonize` to automatically align all 32 manifests in-place.

| Package | Divergent Versions | Consuming Packages | Action / Sacred Baseline |
| :--- | :--- | :--- | :--- |
| `@supabase/postgrest-js` | `2.117.2` vs `2.118.0` | `2.117.2`: `gurudevi-mobile`, `@repo/community`<br>`2.118.0`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `@supabase/supabase-js` | `2.117.2` vs `2.118.0` | `2.117.2`: `gurudevi-mobile`, `@repo/accounting`, `@repo/community`, `@repo/graphics`<br>`2.118.0`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `effect` | `^4.0.2` vs `^4.0.5` | `^4.0.2`: `gurudevi-mobile`<br>`^4.0.5`: `@repo/core` | Run `pnpm run deps:harmonize` |
| `inngest` | `^4.24.0` vs `^4.21.1` | `^4.24.0`: `@repo/sanctuary-api`<br>`^4.21.1`: `@repo/core` | Run `pnpm run deps:harmonize` |

## 4. Sovereign Command Center & Proactive Workflows

- **Harmonize All Packages**: `pnpm run deps:harmonize` (Applies canonical Ecosystem Cohort pins across all 32 manifests)
- **Verify Cohort Harmony**: `pnpm run deps:check` (Instant verification that no manifest has drifted)
- **Audit Mobile Native Health**: `pnpm --filter gurudevi-mobile exec expo-doctor` (Verifies native C++/Fabric runtime)
- **Upgrade Standalone Safe Patches**: `pnpm run deps:upgrade` (Smart upgrades preserving Sacred Pins and Cohorts)

