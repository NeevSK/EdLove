---
title: "Runtime, Governor, Verger Audit (Deep Inventory)"
status: "draft"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "opencode"
tags: [runtime-performance, governor, verger, efficiency, audit, inventory]
---
# Runtime, Governor, Verger Audit (Deep Inventory)

This is a file-by-file inventory of the governor/verger/efficiency stacks, their consumers, wiring state, and evidence levels. It is intended to inform the convergence plan before making any changes (and respects ADR D8: no active/native runtime changes until after 2026-10-26 pilot).

## 1) Package inventory

| Package | Path | Role | Exports/Notes | Evidence |
| --- | --- | --- | --- | --- |
| `@repo/verger-core` | `packages/verger-core/` | Host-neutral supervisor: reducer, runtime loop, telemetry, replay, experiments, recovery, flight recorder, session ledger. | Exports from `src/index.ts` (ts source). Has `dist/*.d.ts` built; main exports point to `src/`. Tests: `goldenVectors.test.ts`, `host.test.ts`, `recovery.test.ts`, `verger.test.ts`. | G2 (unit tests passing per notes; contracts tested). |
| `@repo/verger-android` | `packages/verger-android/` | Android Expo module for sensing/hardware levers. Measures only, never decides. | `expo-module.config.json` points to `expo.modules.verger.VergerModule`. Depends on `@repo/verger-core`. Tests: `src/mapping.test.ts` + 4 Kotlin tests. | G1/G2 (Kotlin unit tests; binding tested against stubs). |
| `@repo/verger-react` | `packages/verger-react/` | React bindings: `VergerProvider`, `useVergerSnapshot`, `useLeverLevel`, long tasks observer. | Depends on `@repo/verger-core`, peers RN/Reanimated. Exports from `src/index.ts`. | G1 (code present; no app usage found). |
| `@repo/core/efficiency` | `packages/core/src/efficiency/` | Efficiency/policy stack: work admission, visual budget, runtime conditions, policy, observability, hermes device shield, wallpaper. Exported via `@repo/core` and `./efficiency`. | Many symbols exported; used by mobile web paths and some mobile code. Tests extensive (workAdmission, policy, runtimeConditions, visualBudget, wallpaper, observability, hermes shields, governor facade tests). | G1/G2 (well tested). |
| `@repo/core/governor` | `packages/core/src/governor/` | Gurudevi host adapter for verger. Re-exports `@repo/verger-core`, defines `GURUDEVI_HOST`, `GURUDEVI_MOBILE_HOST`, lever manifests. | Exported via `@repo/core/governor`. Tests: controller/governor/hardwareAndContention. | G1/G2 (host boundary tested). |
| `@gurudevi/runtime-pressure` | `apps/gurudevi-mobile/modules/runtime-pressure/` | Local Expo module for pressure/thermal/memory signals (Android). | Native module class `app.gurudevi.runtimepressure.RuntimePressureModule`. Used by `OptionalStartupServices`. | G1/G2 (wired, tested via mocks in mobile tests). |

## 2) Symbol usage (from audit)

Key findings from the symbol scan:

**Verger (new supervisor stack):**
- `createVerger` defined in `packages/verger-core/src/verger.ts`; consumed by `packages/verger-react/src/VergerProvider.tsx`. Tested in `packages/verger-core/src/verger.test.ts`.
- `VergerProvider` defined in `packages/verger-react/src/VergerProvider.tsx`; used by `apps/gurudevi-mobile/src/runtime/GurudeviVerger.tsx`. **Not mounted anywhere else in apps** (no references found outside verger packages and GurudeviVerger).
- `createVergerAndroidPlatform` used by `GurudeviVerger.tsx` and defined in `packages/verger-android/index.ts`.
- `GURUDEVI_MOBILE_HOST` used by `GurudeviVerger.tsx`; `GURUDEVI_HOST/LEVERS` defined in `packages/core/src/governor/*`.
- `defineHost`, `createGovernor`, `createRuntimeController`, `createGovernorTelemetry`, recovery/session/flight/quality/experiment/replay symbols all defined in verger-core with tests; consumed internally by verger-core/verger-react mostly.

**Efficiency (existing pilot stack):**
- `reduceWorkAdmission`, `resolveWorkAdmission` used by `apps/gurudevi-mobile/src/boot/OptionalStartupServices.tsx` (active). Tested heavily.
- `resolveRuntimeVisualBudget`, `classifyMemoryTier`, `normalizeNetworkConditions`, `evaluateEfficiency`, `observeEfficiencyDecision` used in various places (web/mobile). `performanceGovernor`/`senseGovernor`/`admitWorkCategory` defined in efficiency but **no production consumers found in scanned codebase** (only tests). 
- `setupHermesMemoryShield` used by `apps/gurudevi-mobile/src/entry/AuthQueryCacheBoundary.tsx` (active). `reclaimHermesMemory` used by `OptionalStartupServices.tsx` and governor facade.
- `buildResponsiveWallpaperUrl`/`resolveWallpaperPresentation` used in web/UI.

## 3) Runtime wiring state

| Component | Status | Notes |
| --- | --- | --- |
| `apps/gurudevi-mobile/src/runtime/GurudeviVerger.tsx` | **Dormant/Unwired** | Fully implemented: mounts `VergerProvider` with `GURUDEVI_MOBILE_HOST`, `createVergerAndroidPlatform()`, AsyncStorage store, resolves mode via `resolveRuntimeMode()` (defaults to `off`). **Not imported/used by `_layout.tsx` or anywhere else.** |
| `apps/gurudevi-mobile/src/runtime/runtimeMode.ts` | **Dormant/Unused** | Defaults to `off`, reads `EXPO_PUBLIC_GURUDEVI_RUNTIME`, allows global override. Unused. |
| `apps/gurudevi-mobile/app/_layout.tsx` | **Current entry** | Composition-only: `ObserveRoot` + `EntryStartupBoundary`. No verger provider. |
| `apps/gurudevi-mobile/src/boot/OptionalStartupServices.tsx` | **Active (pilot)** | Uses `@repo/core/efficiency` work admission + native `runtime-pressure` module. Actively wired via boot flow (referenced by startup code paths). |
| `apps/gurudevi-mobile/src/entry/AuthQueryCacheBoundary.tsx` | **Active** | Uses `setupHermesMemoryShield` from efficiency. |
| `@repo/core/efficiency/governor.ts` facade (`performanceGovernor`) | **Dormant** | Defined and exported, tested, but no production consumers found. |
| `packages/platform-mcp` device profile/trace plumbing | **Active (observational)** | Captures logcat, projects traces, stores in SQLite; used for evidence collection. |

## 4) Duplicates/overlaps & architecture split

There are **two parallel governor concepts**:

1. **Efficiency pilot stack** (`@repo/core/efficiency/*`) - Currently active in mobile boot (work admission for optional startup, hermes shield, visual budget, policy). Largely TS-only, integrated into existing flows.
2. **Verger supervisor stack** (`@repo/verger-core` + `@repo/verger-react` + `@repo/verger-android` + `@repo/core/governor` host adapter) - Newer, more comprehensive architecture per ADR/docs (host-neutral reducer, recovery/ladder, flight recorder, experiments, hardware levers). **Implemented but not mounted**; mobile has `GurudeviVerger.tsx` ready to mount but unwired.

The ADR (2026-10-21) says "The runtime is named verger..." and D11 makes it decoupled; D8 freezes until after pilot. The reconciliation doc (2026-10-22) says "No generic runtime governor/facade at `@repo/core/governor`" as "not implemented" in that context - but `@repo/core/governor` exists as the host adapter re-exporting verger-core; this is a terminology nuance. The key point: **verger is implemented but dormant; efficiency is active but narrower**.

Also note: `packages/core/src/efficiency/governor.ts` exports `performanceGovernor` facade (different shape from verger's governor) - appears to be an alternative/unified facade per old spec, also with no prod consumers.

## 5) Evidence levels

| Area | Level | Rationale |
| --- | --- | --- |
| Verger-core reducer/recovery/telemetry/experiments | G2 | Unit tests cover host boundaries, recovery ladder, golden vectors, controller behavior. |
| Verger-android module + mapping | G1/G2 | Kotlin unit tests + TS mapping tests; device integration not yet proven in active use. |
| Verger-react bindings | G1 | Code complete, not mounted in app. |
| GurudeviVerger wiring | G0 | Exists but unwired; cannot affect runtime. |
| Efficiency workAdmission + OptionalStartupServices | G2/G5 partial | G1 tests pass; G5 device evidence shows behavior on A52 (observational) but limited. |
| Hermes shield + AuthQueryCacheBoundary | G1/G2 | Tests exist, wired in mobile. |
| Runtime-pressure module | G1/G2 | Wired, used by OptionalStartupServices; native behavior observed but limited on API34. |
| Platform MCP tracing/profile | G1/G5 observational | Good observational tooling, not causal proof. |

## 6) Quick map of files

**Verger stack:** `packages/verger-core/src/*` (25 files including tests), `packages/verger-android/*` (module + kotlin), `packages/verger-react/src/*` (VergerProvider, hooks, longTasks), `packages/core/src/governor/*` (host adapter), `apps/gurudevi-mobile/src/runtime/*` (GurudeviVerger, runtimeMode).

**Efficiency stack:** `packages/core/src/efficiency/*` (governor facade, workAdmission, visualBudget, policy, runtimeConditions, observability, hermesDeviceShield, wallpaper), `apps/gurudevi-mobile/src/boot/OptionalStartupServices.tsx`, `apps/gurudevi-mobile/src/entry/AuthQueryCacheBoundary.tsx`, `apps/gurudevi-mobile/modules/runtime-pressure/*`.

## 7) Recommendations (for convergence)

1. **Treat verger as the convergence target** per ADR D11 (host-neutral) but **do not mount it now** - respect D8 (pilot freeze until 2026-10-26). Keep `GurudeviVerger` unwired.
2. **Efficiency remains the active pilot** - it's wired, tested, and has some device evidence. Don't break it.
3. **Consolidate facades** - `@repo/core/efficiency/governor.ts` exports `performanceGovernor` with no consumers; consider deprecating or merging into verger later.
4. **Wire verger behind flag post-pilot** - `GurudeviVerger` is ready; mount in `app/_layout.tsx` with mode defaulting to `off` (via env/remote kill switch) after pilot approval.
5. **Unify telemetry** - Both stacks emit events; verger has its own telemetry system; efficiency has `observability.ts`. Need a bridge plan.

This audit is based on file contents and symbol usage as of 2026-10-24.
