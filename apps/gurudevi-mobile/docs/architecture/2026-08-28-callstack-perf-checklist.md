---
title: "Callstack Performance Checklist — Mapping Ultimate Guide to Gurudevi Audits"
status: "active"
created: 2026-08-28
updated: 2026-08-28
author: "Naveen"
scribe: "opencode"
tags: [performance, callstack, audit, beast, gurudevi-mobile]
---

# Callstack Performance Checklist — Mapping Ultimate Guide to Gurudevi Audits

> Source: Callstack "The Ultimate Guide to React Native Optimization" (2025/2026 refresh, `callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization`) + DMAIC companion (`ebooks/react-native-performance-optimization-with-dmaic-guide`). 3 parts: React/JS, Native, Bundling. Two product metrics: **TTI** (boot) and **FPS** (runtime). This doc maps each chapter to the audit/script that proves it in Gurudevi Mobile.

---

## How to Use

- **Before P1:** run the "Gurudevi script" column; record baseline in `2026-08-28-beast-baseline.md` (T1–T3).
- **During P1–P7:** each improvement must move a metric in the "Measure again" column; no metric movement = no merge.
- DMAIC framing: **Define** T1–T8 → **Measure** (this checklist) → **Analyze** (triage audits) → **Improve** (P1–P7) → **Control** (Expo Observe + `check:anti-slop`).

---

## Part 1 — React & JavaScript (Runtime Smoothness / FPS)

| Guide chapter | Callstack advice | Gurudevi script | Where in code | Measure again |
|---------------|----------------|-----------------|---------------|---------------|
| Pay attention to UI re-renders | Profile before patching; why-did-you-render, React DevTools flame graph, Profiler | `src/performance/AppPerformance.test.tsx:1` (replace SimpleCard with real Feed/Library cards) + `reassure` baseline + `@rozenite/performance-monitor-plugin` | `app/(tabs)/community/index.tsx:1` Feed, `library/index.tsx:1` Library | Reassure report + Rozenite slow-frame % T3 |
| Use dedicated components for lists | Always FlashList (or LegendList) for lists, never FlatList | `audit:expo-native-graph` + grep for `FlatList` vs `SanctuaryFlashList` (`packages/ui`) | `packages/community`, `packages/library`, `@repo/classroom` | `eas observe:routes` per-route TTR p90 + `audit:route-bundles` |
| Think twice before you pick a library | Less code = faster TTI; Metro has no tree-shaking relief | `audit:bundle` + `audit:route-bundles` + `audit:tree-shaking` + Expo Atlas | `apps/gurudevi-mobile/package.json:53-245` deps | Bundle delta T2 |
| Use dedicated mobile libs | Platform-specific builds | `audit:web` + `audit:css-interop` + `audit:style-stack` | `nativewind 5 preview` + `react-native-css 3.0.7` triple | `audit:style-stack` + `verify:style-stack` |
| Find balance native vs JS | JS thread vs native | `audit:expo-native-graph` + `bootstrap-and-entrypoint-standard.md` | `app/_layout.tsx:175-188` deferred init | T1 cold TTI via Observe |
| Animate at 60 FPS | Worklets + Reanimated, avoid JS-driven anim | Verify `react-native-reanimated 4.5.0` + `worklets 0.11.1` sacred pins, `withReanimated` plugin | `BreathGuide` `app/(tabs)/_layout.tsx:216-281`, `LotusPetalFAB` | Rozenite 60fps + Observe TTI |
| Replace Lottie with Rive | Lottie heavy, Rive lighter (evaluate) | `audit:bundle` import cost of `lottie-react-native@7.5.0` + `@lottiefiles/dotlottie-react` | `packages/ui` branded motion | Bundle + TTI delta |
| Optimize JS bundle | Analyze before startup gets worse | `audit:bundle` + `react-native-bundle-visualizer --expo` (Atlas alt) | `packages/ui` icons (`lucide`/`phosphor` dup) | T2 −20% |
| React Compiler | Auto-memoization beta (Rules of React) | `infra/react-compiler-and-eslint-guide.md` + `eslint-plugin-react-compiler 19.1.0-rc.2` already dep | Feature branches | Reassure delta when enabled |

**Anti-pattern to avoid (Guide):** "appearance slower in dev" — always profile FlashList in **release**, not dev. Our Reassure runs must use `NODE_ENV=production` + release build.

---

## Part 2 — Native Performance (Boot / TTI)

| Guide chapter | Callstack advice | Gurudevi script | Where in code | Measure again |
|---------------|----------------|-----------------|---------------|---------------|
| Measure startup the same way every time | Define cold vs warm vs hot vs prewarmed | **Expo Observe** `cold launch`/`warm launch`/`TTR`/`TTI` + `eas observe:metrics-summary` | `app/_layout.tsx:89-91` Splash + `scheduleNativeSplashHandoff` `src/boot/nativeSplashHandoff` | Observe p50 T1, per-release marker delta |
| Separate launch types | Understand what native-only vs JS affects | Observe `cold launch` (native) vs `bundle load` (JS) vs `TTR` (first render) split | `docs.expo.dev/eas/observe/reference/metrics` | Bundle vs native regression isolation |
| Profile native work iOS/Android | Tracy, DevTools Performance | `docs/infra/testing-and-performance-toolchain.md` lanes (Perf Monitor, Flashlight, Expo Atlas, Hermes) | `android/` (gitignored, via `app.json` plugins) | Tracy / Android Profiler traces |
| Threading model (Fabric/TurboModules) | Multithreading isn't free (contention) | `audit:expo-native-graph` + `expo-build-properties` `android.extraMavenRepos` | `react-native-nitro-modules 0.36.1` + `mmkv 4.3.2` nitro | Jank + Observe bundle load |
| Debug TurboModules/Fabric | New-arch specifics | Verify sacred pins + `AGENTS.md` never `expo install --fix` | `packages/core` Cedar WASM `warmCedarWasm` `app/_layout.tsx:428` | TTI before/after nitro change |

---

## Part 3 — Bundling & Startup Cost (Build-time)

| Guide chapter | Callstack advice | Gurudevi script | Where in code | Measure again |
|---------------|----------------|-----------------|---------------|---------------|
| Analyze bundle size before startup gets worse | Bundle is TTI | `audit:bundle` + `audit:route-bundles` + `size-limit` root `audit:size` | `apps/gurudevi-mobile/package.json` deps + `packages/*` | T2 |
| Check how much deps really add | Import cost, not just version | Expo Atlas / bundle visualizer treemap, `audit:duplication` (jscpd) | `lucide-react`/`phosphor`/`buffer`/`base64-js` | Per-dep import cost |
| Tree shaking / import patterns | Selective imports | `audit:tree-shaking` `scripts/audit-tree-shaking.mjs` + `audit:boundaries` | `@repo/ui/icons` bridge `decisions/2026-07-16-icon-bridge-contract.md` | Bundle delta |
| Packaging tradeoffs across platforms | Android Gradle size vs iOS | `infra/2026-06-11-mobile-bundle-optimization-report.md` (1.28 MB reduction provenance) + `expo-build-properties` | `app.json:plugins` `expo-build-properties` | APK size + T1 |
| Bundle affects startup cost | Direct TTI correlation | `eas observe:metrics-summary` before/after bundle change (release marker) | Every `pnpm run stack-map:deps` dependency catalog | Observe TTI delta per release |

---

## DMAIC Companion — How We Run It

| DMAIC phase | Gurudevi artifact |
|-------------|-------------------|
| **Define** | T1–T8 `2026-08-28-beast-master-plan.md:§1` |
| **Measure** | This checklist + `2026-08-28-beast-baseline.md` + Observe + Reassure + Atlas |
| **Analyze** | Triage via `audit:*` outputs, `issues_i_saw.md`, `stack-map-annotations.yaml` |
| **Improve** | P1–P7 PRs, each with metric delta in PR description |
| **Control** | Observe dashboards + `eas observe:*` CLI + `pnpm run check:anti-slop` + `check:circular`/`check:architecture` |

---

## Running the Checklist

```bash
# 1) Bundle truth (callstack Part 3)
pnpm --filter gurudevi-mobile audit:bundle
pnpm --filter gurudevi-mobile audit:route-bundles
pnpm --filter gurudevi-mobile audit:tree-shaking
pnpm --filter gurudevi-mobile audit:expo-native-graph
pnpm run audit:duplication  # jscpd

# 2) Runtime FPS (Part 1) — after fixing src/performance to real cards
pnpm --filter gurudevi-mobile test  # includes reassure via vitest
# + Rozenite on device + eas observe:routes for per-route TTR

# 3) Boot TTI (Part 2)
eas observe:metrics-summary --platform android
eas observe:routes --platform android
eas observe:versions

# 4) Guardrails (not in Guide but repo-mandated)
pnpm --filter gurudevi-mobile check-types
pnpm --filter gurudevi-mobile check-cycles
pnpm --filter gurudevi-mobile audit:boundaries
pnpm --filter gurudevi-mobile audit:contrast
pnpm --filter gurudevi-mobile audit:font-scaling
pnpm run check:anti-slop  # repo root
```

Every entry here must be **release-build** measured (Guide: "Remember to turn on release mode for the JS bundle beforehand") before claiming a win.
