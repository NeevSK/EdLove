---
title: "ADR: Nitro Fetch adoption"
status: "accepted"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, nitro, networking, tanstack, prefetch]
---

# ADR: Nitro Fetch adoption (accepted — 2026-09-04)

## Status

**Decision: CONDITIONAL — profile-gated spike only.** Adopt iff device-measured win on release builds; `prefetchOnAppStart` explicitly excluded from this ADR.

## Context

`react-native-nitro-fetch` (Margelo, Nitro Module over Cronet/URLSession, HTTP/1-3 + QUIC + Brotli + disk cache) is a drop-in `fetch` with `prefetch(url, { headers: { prefetchKey } })` and `nitroFetchOnWorklet` mappers. Prerequisites already in-repo: `react-native-nitro-modules 0.37.1` + `react-native-worklets 0.12.1` (sacred), RN 0.86.2, `@tanstack/react-query 5.102.8`. Swap surface: 4 raw-`fetch` callsites in `src/screens/DurableAgentsScreen.tsx:39,65,80,90`; `SanctuaryProvider.tsx:16,24,108` owns the single `QueryClient`. Spike screen: list→detail prefetch-on-intent in `DurableAgentsScreen` (`getRuns` row `onPress` prefetches `getRun(runId)`; destination `queryFn: ({ signal }) => nitroFetch(url, { signal })`). Web stays on browser `fetch`. See spike `docs/research/2026-09-04-spike-native-capabilities.md`.

## Options

1. **Profile-gated spike (chosen).** One `fetchFn` factory (oRPC-adjacent, not per-screen), signal-forward mandatory, prefetch-on-intent only.
2. **Full adopt incl. `prefetchOnAppStart`.** Rejected for this ADR — auth-token replay + logout-clearing needs its own ADR.
3. **Stay on global fetch.** Fallback if profiling shows no win.

## Gates (all must pass before merge)

- **Prebuild gate:** `npx expo prebuild --no-install` (NEVER `--clean`); Expo plugin auto-injects Android `AutoPrefetcher` — verify output, never hand-edit `android/`/`ios/`; NEVER `expo install --fix`; sacred pins untouched.
- **EAS gate:** flag-gated PR build on preview channel; confirm AbortSignal cancel, offline/PowerSync paths unaffected, `nitroPrefetched: true` hit observable on prefetch path.
- **Device-test gate:** standalone Release APK via `doppler run --no-fallback -- ./gradlew :app:assembleRelease` per AGENTS.md §5; physical-device P50/P75 list→detail + cold-start-to-first-query vs main release. Adopt threshold (proposal): ≥10% P50 improvement with no P75 regression; else stay on global fetch.

## Rollback

Revert `fetchFn` factory to global `fetch` (single import swap), remove `prefetch` call + flag, uninstall package, `prebuild --no-install`. No persisted state (prefetch cache is memory/native-transient; `prefetchOnAppStart` never enabled so no queue to drain).

## Implementation Evidence (2026-09-04)

- **Files updated:** `apps/gurudevi-mobile/src/lib/fetchFn.ts` (centralized `getFetchFn`, `getPrefetchFn`, `getPrefetchOnAppStartFn` with feature-flag gating)
- **Feature flag:** `isNitroFetchEnabled` (`gurudevi.core.nitro-fetch`) added to manifest + store
- **Dependency:** `react-native-nitro-fetch@1.6.3` (hoisted to root workspace)
- **TypeScript:** ✅ passes
- **Style-stack gate:** ✅ verify:style-stack passes
