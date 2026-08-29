---
title: "Beast Baseline — P0 Measurements (T1–T8 Before)"
status: "active"
created: 2026-08-28
updated: 2026-08-28
author: "Naveen"
scribe: "opencode"
tags: [beast, baseline, performance, expo-observe, gurudevi-mobile]
---

# Beast Baseline — P0 Measurements (T1–T8 Before)

> **Purpose:** Falsifiable "before" for the Beast initiative. Defines how each target is measured, what command/artifacts to capture, and where the first Expo Observe markers land. Updated per `2026-08-28-beast-master-plan.md` §1.

> **Environment required for fill:** Node `22.23.2` + pnpm `11.21.0` per `mise.toml` (and `eas.json:3` `cli.version >=16.0.0`). Current host is Node `24.11.0` + pnpm `11.24.0` (global store) — so `pnpm install` hits `ERR_PNPM_VIRTUAL_STORE_DIR_MAX_LENGTH_DIFF` and requires a clean reinstall on CI/dev with correct versions. This doc is committed with TBD before values; fill via `mise exec -- pnpm install` on first CI run.

---

## 1) Targets — Before Table (fill on first Node 22 run)

| # | Signal | How measured (script) | Before value | Artifact | Command |
|---|--------|-----------------------|--------------|----------|---------|
| T1 | Cold start TTI (mid Android) | Expo Observe `cold launch` + `TTI` median / p90 | **TBD** | `eas observe:metrics-summary` JSON + `adb` manual | `mise exec -- eas observe:metrics-summary --platform android` |
| T2 | JS bundle android | `audit:bundle` + `audit:route-bundles` | **TBD** | `audit:bundle` HTML + `report-mobile-route-bundles.mjs` json | `mise exec -- pnpm --filter gurudevi-mobile audit:bundle` |
| T3 | Scroll jank (Library/Community feed) | Reassure + `@rozenite/performance-monitor-plugin` + Observe per-route TTR | **TBD** | Reassure baseline + `eas observe:routes` | `mise exec -- pnpm --filter gurudevi-mobile test` (reassure) + `eas observe:routes` |
| T4 | Offline reads (<500ms) | Airplane E2E `src/features/*.feature` | **TBD** | Manual E2E log | `app/(tabs)/workspace/*` airplane → gradebook |
| T5 | Crash-free | Sentry `packages/core/src/lib/monitoring/sentry.ts:11` | **TBD** | Sentry dashboard | `Sentry.init` `tracesSampleRate:0.1` |
| T6 | Feature surface | Route count + `42P01` guard audit | **57 routes, 2 `.feature`, 5/6 wellbeing tables unguarded** | `app/**/*.tsx` count + `issues_i_saw.md:70` | `git ls-files "apps/gurudevi-mobile/app/**/*.tsx"` |
| T7 | A11y | `audit:contrast` + `audit:font-scaling` | **TBD** | Audit json/exit code | `mise exec -- pnpm --filter gurudevi-mobile audit:contrast` |
| T8 | Per-tab wow | Manual checklist | **Not yet** | Device video | Demo |

---

## 2) Baseline Commands (run with `mise exec --` on Node 22.23.2)

```bash
# Node + pnpm truth (per mise.toml)
mise exec -- node --version   # -> v22.23.2
mise exec -- pnpm --version   # -> 11.21.0 (after mise install pnpm@11.21.0)

# Clean reinstall if virtual-store-dir-max-length diff (host was 11.24.0):
mise exec -- pnpm install

# 1) Bundle + graphs (Callstack Part 3)
mise exec -- pnpm --filter gurudevi-mobile audit:bundle            # -> audit:bundle HTML (react-native-bundle-visualizer --expo)
mise exec -- pnpm --filter gurudevi-mobile audit:route-bundles     # -> report-mobile-route-bundles.mjs
mise exec -- pnpm --filter gurudevi-mobile audit:expo-native-graph # -> expo-modules-autolinking resolve (124 LOC)
mise exec -- pnpm --filter gurudevi-mobile audit:tree-shaking
mise exec -- pnpm --filter gurudevi-mobile audit:boundaries
mise exec -- pnpm --filter gurudevi-mobile audit:web               # web deps
mise exec -- pnpm run audit:duplication  # jscpd (repo root, for import-cost)

# 2) Type + cycles + tests + a11y
mise exec -- pnpm --filter gurudevi-mobile check-types              # tsc --build --noEmit
mise exec -- pnpm --filter gurudevi-mobile test                    # vitest run (includes reassure after P1 card fix)
mise exec -- pnpm --filter gurudevi-mobile check-cycles            # sovereign-cycle-checker.mjs
mise exec -- pnpm --filter gurudevi-mobile audit:contrast
mise exec -- pnpm --filter gurudevi-mobile audit:font-scaling

# 3) Anti-slop gate (repo root)
mise exec -- pnpm run check:anti-slop  # aislop + fallow on changed files

# 4) Expo Observe (P0/P1 truth for T1/T3)
mise exec -- pnpm --filter gurudevi-mobile exec eas observe:versions
mise exec -- pnpm --filter gurudevi-mobile exec eas observe:metrics-summary --platform android
mise exec -- pnpm --filter gurudevi-mobile exec eas observe:routes --platform android
mise exec -- pnpm --filter gurudevi-mobile exec eas observe:events --limit 20
```

**First Observe markers:** After this PR merges, run one dev build:

```bash
mise exec -- pnpm --filter gurudevi-mobile exec eas build --profile development --platform android
# Launch app once, background once (flushes Observe.dispatchEvents), then:
mise exec -- eas observe:metrics-summary --platform android
```

---

## 3) What Was Wired in This PR (P0 spike)

- **`apps/gurudevi-mobile/package.json:54`** added `expo-observe@~57.0.17` (`npm view expo-observe version` 57.0.17) — install deferred to CI Node 22 (`mise exec -- pnpm install`).
- **`apps/gurudevi-mobile/eas.json:7,26,42`** set `uploadSourceMaps:true` on development/preview/production (required for Observe Errors preview symbolication, alongside existing `SENTRY_DISABLE_AUTO_UPLOAD`).
- **`apps/gurudevi-mobile/app/_layout.tsx:59-60,149-170,523,601-622`** wired `ObserveRoot` + `ObserveErrorBoundary` + `ObserveInteractiveMarker` + `Observe.configure({sampleRate:0.2, dispatchInDebug:false, expoRouter:true})` (consent-respecting via `useConsentStore` for PostHog/Sentry, perf data dispatched always — not PII per `docs.expo.dev/eas/observe/reference/metrics`).
- **`apps/gurudevi-mobile/src/types/expo-observe.d.ts`** shim for TS until package installed (real types override after install).
- **Docs:** `2026-08-28-beast-master-plan.md` (rationale + P0–P7), `2026-08-28-callstack-perf-checklist.md` (Guide → audits), `EXPO_OBSERVE_RUNBOOK.md` (install/wiring/CLI), this baseline doc.

---

## 4) Debt Captured (from master plan §3)

- Self `SleepTracker`/`RemindersManager`/`VoiceJournaling` gated + `42P01` (T6).
- Workspace thin dashboards + no offline conflict UX (T4).
- Library no DL cache, no FTS, `OCRAPI` `ocrPDF:424` throws, `MapScreen.web.tsx:65` null (T2/T6).
- Dual SQLite `wa-sqlite 1.7.2` + `op-sqlite 17.1.5`, triple style engine, `withSentryGradleDisabled.js:8` suppresses maps (T2/T5).

---

## 5) Next Fill — When CI Runs Node 22

On next CI with `mise.toml` Node 22.23.2 + pnpm 11.21.0 (or host after `mise install`):

1. Run all commands in §2, paste outputs into this doc's table (replace TBD).
2. Attach artifacts: `audit:bundle` HTML, `route-bundles` json, `reassure` baseline.
3. Add `eas observe:metrics-summary` JSON as code block.
4. Update `status: active` → keep active until P1 replaces with `-20%` delta doc `2026-08-28-beast-P1-delta.md`.

---

## 6) Verification Checklist for This Doc

- [x] Wiring compiles with shim (`src/types/expo-observe.d.ts`) — `mise exec -- npx tsc --noEmit` passes for `_layout.tsx`
- [ ] `pnpm install` on Node 22 succeeds (virtual-store recreated)
- [ ] `audit:bundle` + `route-bundles` artifacts attached (T2)
- [ ] `eas observe:metrics-summary` returns ≥1 row after dev build (T1)
- [ ] `check-types` + `check-cycles` + `audit:boundaries` + `audit:expo-native-graph` green
- [ ] `check:anti-slop` 0 new findings (this PR adds no slop — all docs + small `_layout` diff)

---

*Companion: `2026-08-28-beast-master-plan.md` (full P0–P7), `2026-08-28-callstack-perf-checklist.md`, `EXPO_OBSERVE_RUNBOOK.md`.*
