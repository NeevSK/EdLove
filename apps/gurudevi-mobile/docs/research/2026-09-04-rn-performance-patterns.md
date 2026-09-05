---
title: "RN Performance Patterns: Foraged Screenshots vs Workspace Capabilities"
status: draft
created: 2026-09-04
updated: 2026-09-04
author: Naveen
scribe: opencode
tags: [research, react-native, performance]
---

# RN Performance Patterns: Foraged Screenshots vs Workspace Capabilities

Workspace baseline (verified `apps/gurudevi-mobile/package.json`): Expo ~57.0.19, RN 0.86.2, React 19.2.3, RNGH 3.2.1 (sacred), Reanimated 4.6.0, FlashList 2.0.2, @legendapp/list 3.3.9, eslint-plugin-react-compiler 19.1.0-rc.2.

## 1. Sources

| # | File | Claim |
|---|------|-------|
| S1 | `C:\x\temp\Screenshot_20260829_004354_X.jpg` | Andrei Calazans: React Suspense has a 300ms throttle; `React.lazy` + Suspense screen that resolves in ~20ms still takes 300ms to begin work |
| S2 | `C:\x\temp\Screenshot_20260827_000538_X.jpg` | Jakub Piasecki: RNGH 3.0 moved API to hooks so React Compiler can memoize gesture code; migration notes thread |
| S3 | `C:\x\temp\Screenshot_20260903_232456_X.jpg` | useEffect debate: Fernando Rojo "react is solved, useEffect is not"; Ryan Carniato "poor use cases come from state sync representable without side effects"; consensus: Effects only for external-system sync |
| S4 | `C:\x\temp\Screenshot_20260829_010902_X.jpg` | Pooya Parsa: ESM package with `"type": "module"` + `.js` forces Node to find/read/parse package.json per file; shipping `.mjs` skips that runtime cost; UnJS obuild ships `.mjs` |
| S5 | `C:\x\temp\Screenshot_20260829_005954_X.jpg` | Maciej Jastrzebski: `react-native-plain-text` crossed 100 stars + 15K weekly npm downloads ~1 month after release; single-style text bypassing RN text pipeline |

## 2. External claims (web-verified)

- **Suspense 300ms throttle is real.** `FALLBACK_THROTTLE_MS = 300` in `ReactFiberWorkLoop.js`; react.dev documents "React reveals suspended content at most once every 300ms". Open issues (facebook/react#31819, #36569) confirm `React.lazy` first render waits ~300ms even when the loader promise pre-resolved, because `React.lazy` cannot synchronously observe fulfilled state and the retry goes through Suspense throttling. Mitigations discussed: `startTransition`/`useDeferredValue`, preloading before render.
- **RNGH 3.0 hooks API is stable.** `software-mansion/react-native-gesture-handler` v3.0.0 released; SWM blog (2026-05-27) confirms hook-based API (`usePanGesture` etc.), `onStart`->`onActivate` / `onEnd`->`onDeactivate` renames, new-arch-only, React Compiler-compatible memoization, SharedValues directly in gesture config, new `Touchable`. Old builder API kept for gradual migration but hooks and builder relations cannot mix.
- **useEffect guidance 2026 unchanged.** react.dev "You Might Not Need an Effect": Effects only for external-system sync; derive-from-props/state during render, `useMemo` for expensive calc (React Compiler automates much of it), event handlers for interaction-caused logic. Matches S3 thread consensus.
- **`.mjs` skips format-resolution cost.** Node docs (`ESM_FILE_FORMAT`): `.mjs` returns `"module"` without consulting package.json; `.js` requires nearest-parent `package.json` `"type"` lookup (plus syntax detection for ambiguous files). Parsa's mechanism checks out; magnitude is per-file resolution overhead, relevant to tooling/startup, not RN runtime rendering.
- **`react-native-plain-text` exists, new-arch-only native module, dev-build compatible.** GitHub `mdjastrzebski/react-native-plain-text` (created ~Jul 2026): `PlainText` renders to `UILabel`/`TextView` directly, requires Fabric, needs rebuild + `pod install` via dev build (standard loop; Expo Go non-criterion). Star/download counts in S5 are author-reported, not independently verified.

## 3. What Gurudevi does today (file:line)

- **Suspense without lazy.** 8 route shells wrap screens in `<Suspense fallback={<Fallback />}>` with `BrandPulse` fallback, e.g. `apps/gurudevi-mobile/app/a-i-assistant.tsx:41`, `app/auth.tsx:34`, `app/welcome.tsx:32`, `app/onboarding.tsx:21`, `app/qr.tsx:20`. No `React.lazy` usage in app source (only `docs/Core/gurudevi_tools_tricks_v2.md:412` example). i18n explicitly opts out: `src/i18n/config.ts:44` (`useSuspense: false`).
- **RNGH v3 hooks already adopted in shared UI.** `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx:77` (`usePanGesture`), `packages/ui/src/components/visualization/AstroView.tsx:114`, `packages/ui/src/components/LotusPetalFAB.tsx:253,288`, `packages/ui/src/components/TemporalScrubber.tsx:36`, `packages/ui/src/components/ui/actionsheet/index.tsx:87`. App shell mounts `GestureHandlerRootView` at `apps/gurudevi-mobile/src/entry/EntryShell.tsx:35`. Migration analysis already documented in `docs/2026-07-17-rngh-v3-migration-analysis.md`, `docs/decisions/2026-06-20-rngh-v3-upgrade-decision.md`.
- **useEffect in ~30 call sites.** Providers and entry boundaries (`src/entry/SessionRouteGate.tsx:36`, `src/entry/EntryShell.tsx:24`, `src/providers/PowerSyncProvider.tsx:36`, `src/providers/DeepLinkProvider.tsx:108`, `src/providers/SanctuaryProvider.tsx:61,73`) plus screens. Spot pattern is external-sync (subscriptions, deep links, PowerSync) which matches sanctioned use; no audit yet for derived-state-in-effect cases.
- **Lists: FlashList standard, LegendList installed but unused in app source.** `SanctuaryFlashList` (FlashList native / FlatList web fallback) is the documented standard (`docs/Core/flash-list-patterns.md`, `docs/architecture/2026-08-28-callstack-perf-checklist.md:30`). `@legendapp/list 3.3.9` is in `package.json:66` but no `LegendList` import found in app source. No `react-native-plain-text` dependency or import anywhere.
- **React Compiler lint present, not enabled as build transform.** `eslint-plugin-react-compiler 19.1.0-rc.2` in devDependencies (`package.json:277`); guide at `docs/infra/react-compiler-and-eslint-guide.md`. No `babel-plugin-react-compiler` in package.json.

## 4. Version/capability gap table

| Pattern | External state (Sept 2026) | Gurudevi state | Gap |
|---------|---------------------------|----------------|-----|
| Suspense 300ms throttle | `FALLBACK_THROTTLE_MS=300`, React 19.2 behavior | React 19.2.3, Suspense shells on 8 routes, no `React.lazy` | No exposure today; risk only if lazy route-splitting is added later |
| RNGH hooks + Compiler memo | v3 stable, hooks API, `onActivate`/`onDeactivate` | RNGH 3.2.1 sacred; hooks used in 5 shared components | Adopted; residual risk is mixed builder/hooks relations in not-yet-migrated screens |
| useEffect discipline | Effects only for external sync; Compiler reduces `useMemo` need | ~30 `useEffect` sites, plausibly sync-shaped, unaudited | Unknown; needs one audit pass, no version gap |
| `.mjs` ESM resolution | `.mjs` skips package.json lookup (Node/tooling) | Metro/Hermes app; `.mjs` tip affects build scripts, not RN runtime | Not applicable to app perf; optionally apply to local scripts |
| PlainText fast text | Native module, Fabric-only, ~100 stars/15K wkdl (author-reported) | Not installed; heavy branded text/motion system in `@repo/ui` | Full gap; native-module install + prebuild + physical-device validation required |

## 5. Recommendation

| Item | Verdict | Effort |
|------|---------|--------|
| RNGH v3 hooks | **Adopt (continue)** — already on 3.2.1 with hooks in shared components; finish migrating any remaining builder-API screens per `docs/2026-07-17-rngh-v3-migration-analysis.md`, never mix relation APIs | S (per screen) |
| useEffect audit | **Adopt** — one pass over the ~30 sites against "You Might Not Need an Effect" (derived state -> render, interaction logic -> handlers); keep external-sync effects | S (1 audit) |
| Suspense + lazy splitting | **Watch** — current Suspense-only shells are unaffected by the 300ms throttle; if route-level `React.lazy` is introduced, preload before navigation and wrap in transitions | S when triggered |
| `.mjs` shipping | **No action** for app runtime; optionally use `.mjs` for local Node scripts | XS |
| `react-native-plain-text` | **Profile-gated spike in dev build** — promising for single-style high-volume text; dev build fully supports it (Expo Go non-criterion); evaluate with measured text-pipeline bottleneck on release builds | M (spike + device test) |
