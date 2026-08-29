---
title: "Beast Master Plan — Gurudevi Mobile Powerhouse (P0–P7)"
status: "active"
created: 2026-08-28
updated: 2026-08-28
author: "Naveen"
scribe: "opencode"
tags: [beast, powerhouse, performance, expo-observe, callstack, offline-first, gurudevi-mobile]
---

# Beast Master Plan — Gurudevi Mobile Powerhouse (P0–P7)

> **Intent:** Make Gurudevi Mobile undeniably excellent — deliberate feature density, measured performance, polished feel. This is the living contract for the "ego-soothing beast" initiative. It supersedes `FUTURE_ROADMAP.md` as the execution plan while preserving its Alpha→Beta→Launch milestone logic.

> **Canonical companion:** `~/.opencode/plans/tingly-chewing-saga.md` (plan scratch) + `docs/architecture/2026-08-28-callstack-perf-checklist.md` + `docs/Learning/EXPO_OBSERVE_RUNBOOK.md`.

---

## 0) Why Beast — Rationale

1. **Craft already disciplined, under-used.** PowerSync offline, FlashList via `SanctuaryFlashList` (`packages/ui`), Skia 2.6.5, new-arch sacred pins (`AGENTS.md:31-37`), MMKV 4 nitro — but floating packages (`@repo/payments`, `@repo/accounting` orphan `docs/stack-map/landscape/stack-map.md:82-88`), built-but-invisible Self features (`SleepTracker.tsx:37`/`RemindersManager.tsx:41`/`VoiceJournaling.tsx:46` gated by `canvas.self.unified` `SelfScreen.tsx:27` + 5/6 tables 42P01 `issues_i_saw.md:70`), and trivial perf infra (`src/performance/AppPerformance.test.tsx:1` SimpleCard only) mean capability is not compounding.

2. **"More deps" as signal, not bloat.** User explicitly wants powerhouse dep surface. We add deps only when they are the *smallest specialized* library per Callstack Guide ("Think twice before you pick an external library") and after `audit:expo-native-graph` + `audit:web` + `audit:route-bundles` prove no duplication of `packages/*`.

3. **Beast = numbers, not vibes.** Targets T1–T8 (see §2) make "beast" falsifiable and prevent powerhouse from regressing into slop (no weakening tests/gates — `AGENTS.md` Slop #6/#7).

4. **Two new doctrines adopted (2026-08-28):**
   - **Expo Observe** — EAS GA Aug 25 2026 (`expo.dev/solutions/expo-observe`, `docs.expo.dev/eas/observe/*`). Provides production TTI/TTR/bundle/Update + per-route navigation metrics (SDK 56+) + `logEvent`/JS errors on real devices, OTel-native, release markers, `eas observe:*` CLI. Requires new binary (`ObserveRoot` + `markInteractive`) and `uploadSourceMaps:true` in `eas.json`. Complements Sentry (crash) + PostHog (product).
   - **Callstack Ultimate Guide to React Native Optimization (2025/2026)** — `callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization` + DMAIC guide. 3 parts (React/JS, Native, Bundling) defining TTI/FPS as product metrics, with practical chapters (re-renders, FlashList release-mode profiling, Hermes, TurboModules/Fabric, Atlas, Tracy). Adopted as checklist doctrine for P1 and DMAIC for P0 flow.

5. **Five prior open questions deferred as small flags** — device target, payments real vs demo, voice STT on-device vs server, map geo vs mind-map, flag system. All remain flexible per-PR (per `FUTURE_ROADMAP.md` "make core loop work first" principle), gated behind `canvas.*`/`FeatureStore` or GrowthBook `gurudevi.*`.

---

## 1) Measurable Targets (falsifiable beast)

| # | Signal | Before (P0) | Target | Source of truth | Gate |
|---|--------|-------------|--------|-----------------|------|
| T1 | Cold start to TTI (mid Android) | TBD `2026-08-28-beast-baseline.md` | <2.0s p50 TTI | **Expo Observe** `cold launch`+TTI + adb spot | 3/5 runs |
| T2 | JS bundle (android) | `audit:bundle` baseline | −20% OR <12 MB | `audit:bundle` + `audit:route-bundles` + Expo Atlas | CI artifact |
| T3 | Scroll jank (Library/Community) | TBD | 60fps, <3% slow frames, per-route TTR p90 green | Observe per-route TTR + Reassure + `@rozenite/performance-monitor-plugin` | No regression |
| T4 | Offline critical path | unknown | Attendance+gradebook <500 ms offline reads | Airplane E2E `src/features/*.feature` | E2E passes |
| T5 | Crash-free | Sentry baseline `packages/core/src/lib/monitoring/sentry.ts:11` `tracesSampleRate:0.1` | >99.5% | Sentry (Observe Errors secondary preview) | 7-day window |
| T6 | Feature surface | ~57 routes, 2 `.feature` files, 5/6 wellbeing tables 42P01 | +40% wired, 0 42P01 | Route count + migration audit | `check-types`+`test` |
| T7 | A11y | `audit:contrast` gaps | 0 critical, font 100/140/200 pass | `audit:contrast` `audit:font-scaling` | Exit 0 |
| T8 | Per-tab wow | subjective | Each tab ≥1 haptics+Skia moment | Device demo checklist | Review sign-off |

---

## 2) Guardrails (NEVER)

- Sacred pins (`AGENTS.md:31-37`), no `expo install --fix` / `prebuild --clean` without approval, no hand-edit `android/`/`ios/` (via `app.json` plugins `plugins/*.js` + `plugins/lib/buildGradleBlock.js`).
- No duplicate utils — search `@repo/core`, `@repo/ui`, `packages/*` first. No dead abstractions, no defensive noise, no `any`/`as unknown` (Slop #1–#9).
- Floating activation requires `pnpm run stack-map:bootstrap` + `stack-map` regen (`AGENTS.md` Stack Map).
- Web triple `nativewind 5 preview` + `react-native-css 3.0.7` + `css-interop 0.1.22` — collapse only if `audit:css-interop` proves bloat.

---

## 3) Debt Map (what beast inherits)

- **Self** `app/(tabs)/self/index.tsx:1` → `@repo/self/screens/SelfScreen` gated `canvas.self.unified:27`. Waste `SleepTracker`/`RemindersManager`/`VoiceJournaling` invisible + `42P01`, no bg reminders, no FTS `wisdom/[id].tsx:11-66`.
- **Workspace** `workspace/index.tsx:7-78` Cedar dispatcher (founder/principal/student/guardian/teacher). Thin `@repo/admin`/`@repo/classroom`, no `@repo/analytics` GPA surfacing, no offline conflict UX.
- **Community** `community/index.tsx:1` Zone B/C presence only, no moderation/DM search, WS `chat/[conversationId].tsx:1` needs hardening.
- **Library** `library/index.tsx:1` no persisted DL cache (has `useMediaDownloader` `DocumentViewerScreen.tsx:48`/`PDFViewerScreen.tsx:21` but no `storageEvictionTask.ts` LRU), no offline FTS (`libraryFilters:321` server debounce, `knowledgeDB` `annotations.ts:92` not exposed), `OCRAPI` `ocrPDF:424` throws `packages/library/src/api/ocr.ts:81`, `MapScreen.web.tsx:65` null, graph "useless" `issues_i_saw.md:21`.
- **Profile** fragmented + `privacy-ledger`/`mute-hub` dup.
- **Infra:** dual SQLite `wa-sqlite 1.7.2` + `op-sqlite 17.1.5`, `withSentryGradleDisabled.js:8` suppresses maps, `src/performance` trivial, audits on-demand not CI.

See `2026-08-28-callstack-perf-checklist.md` for per-chapter debt mapping.

---

## 4) Phased Execution (measure → build → verify, strict order)

### P0 — Baseline & Harness (no product changes beyond Observe wrapper)

- Run `audit:bundle` + `route-bundles` + `expo-native-graph` + `tree-shaking` + `boundaries` + `check-types` + `test` + `check-cycles` + `contrast` + `font-scaling`.
- Wire **Expo Observe** now (so first markers exist): `npx expo install expo-observe`, `app/_layout.tsx:175-188` `ObserveRoot` + `markInteractive()` on first tab + deep-link routes, `eas.json` `uploadSourceMaps:true`, `Observe.configure({sampleRate:0.2})` consent-gated (`useConsentStore` `app/_layout.tsx:153-190`).
- Enable Reassure baseline + Rozenite trace (5 cold starts + 30s Library/Community scroll, Pixel 6a/A35). Airplane E2E attendance→gradebook→doc. Capture `eas observe:metrics-summary`/`routes`/`versions` + Sentry/PostHog baseline.
- **Output:** `docs/current_progress/2026-08-28-beast-baseline.md` + `reassure` baseline + bundle HTML + `2026-08-28-callstack-perf-checklist.md`.

### P1 — Performance Beast (fast before heavy)

1. Startup: lazy 57 routes (remove `.js` twins, typedRoutes), defer PostHog/Sentry/Observe config off critical path (`app/_layout.tsx:175-188`), split `@expo-google-fonts/*`, audit eager `expo-*`.
2. Lists: all feeds via `SanctuaryFlashList` (`packages/ui`) `estimatedItemSize`/`getItemType`/recycling; LegendList 3.3.3 only if measured need (Guide: FlashList slower in dev, not release).
3. Images: `expo-image` priority + manipulator thumbs + `react-native-fast-shimmer` + `BrandedSkeletonList` (`@repo/ui`).
4. JS: dedupe `lucide`/`phosphor` → `@repo/ui/icons` contract (`decisions/2026-07-16-icon-bridge-contract.md`), drop `buffer`/`base64-js` if Metro provides, spike `wa-sqlite` drop if PowerSync can run on `op-sqlite` alone.
5. Web: collapse nativewind triple if `audit:css-interop` proves.
6. Observe: enable Expo Router integration for per-route TTR/TTI + `Observe.logEvent` onboarding→tab spans. Verify via Expo Atlas + `eas observe:routes`.
- **Verify:** T1 <2s p50, T2 −20%, T3 per-route p90 green.

### P2 — Self Powerhouse (wellbeing moat)

- Migrations/guards for `sleep_logs`/`reminders`/`voice_journals` (fix 42P01), flip `canvas.self.unified` via flag (GrowthBook `gurudevi.self.*` or `FeatureStore`).
- `expo-notifications 57.0.13` + `background-task`/`task-manager` `scheduleNotificationAsync` + `expo-calendar` for `RemindersManager`.
- Voice offline `expo-audio 57.0.4` + `expo-file-system` + PowerSync queue + FTS5 (`op-sqlite`) over transcripts + journals/wisdom (`wisdom/[id].tsx:11-66`) + streak card.
- Skia breath ring + haptics `expo-haptics` on `BreathGuide` `app/(tabs)/_layout.tsx:216-281`. STT spike `whisper.rn` vs `@react-native-voice/voice` (50-150 MB).
- Observe: `logEvent("self_voice_recorded")` + `reportError` on STT fail.

### P3 — Workspace Powerhouse (role pedagogy)

- Attendance offline conflict UX Zone A optimistic + `src/lib/backgroundSync*` + `SyncManager`; `markInteractive` after list interactive.
- Gradebook surface `@repo/analytics` GPA/insights `gradebook.tsx:3-7` + Skia micro-charts `@repo/graphics`.
- Principal/Founder/Guardian Drizzle + `lk-edu-geo 1.0.1` rollups (minister gap `issues_i_saw.md:15`) per `principal_dashboard_design.md`.
- `reflect.tsx:3-5` → Self wisdom loop. Observe per-route `classroom/[classroomId]`/`attendance`/`gradebook` TTI.

### P4 — Library Powerhouse

- Persist `useMediaDownloader` to `expo-file-system` + `storageEvictionTask.ts` LRU 2GB cap + Manager UI.
- Offline FTS expose `knowledgeDB` `annotations.ts:92` (not just server debounce `libraryFilters:321`).
- Finish OCR `ocrPDF:424`/`preprocessImage:440` `ocr.ts:81` via `tesseract.js 5.1` + MLKit `text-recognition 2.0.0` fallback.
- Map: replace null `MapScreen.web.tsx:65` + graph `MapScreen.tsx:94` with `react-native-maps 1.29.0` + `lk-edu-geo` choropleth; mind-map second; guard +8% per route.
- Curation `review.tsx` Cedar-gated. Callstack bundle guidance per Library route.

### P5 — Community Powerhouse (retention engine)

- Harden Zone C WS `chat/[conversationId].tsx:1`/`direct-messages/[conversationId].tsx:1` presence/typing/receipts/queue + `backgroundSync` ( `FUTURE_ROADMAP.md:87-95` GroupChat v1 was zero code).
- Moderation `MuteHubScreen` `profile/mute-hub.tsx:1` + Cedar isolation + `sanctuary-api` rate limits.
- Feed `SanctuaryFlashList` + `react-native-custom-pull-refresh 0.1.1` + `BrandedEmptyState`/`SuccessGlow`. Deep links `gurudevi://` + `https://platform.gurudevi.edlove.org/p` `app.json:24-65`.
- Observe per-route chat TTI + `logEvent("message_sent")`.

### P6 — Cross-Cutting (activate floating & intelligence)

- Activate `@repo/payments 0.0.2` + `@repo/accounting 0.0.2` (Stripe `stripe-react-native 0.64.0` already in `app.json` plugins, web-only per `decisions/2026-06-12-web-only-payments-and-entitlements.md`) demo fee Cedar-gated + `@repo/workforce 0.0.2`. `stack-map:bootstrap` + regen.
- Scanner-kit `repo/scanner-kit 0.0.1` + `barcode-scanning 2.0.0` QR `app/qr.tsx` + doc scan→OCR.
- AI `repo/ai 1.0.0` `ai-assistant.tsx:1` Hermes `getReader` streaming, workspace-aware prompts, `logEvent("ai_query")`.
- Consent: PostHog/Sentry/Observe `sampleRate` behind `useConsentStore` PDPA.

### P7 — Polish, Trust & Growth

- Motion `duration/easing/scale/color` + `softCrossfadeScale` (`@repo/ui`) + `BrandPulse` everywhere.
- A11y `audit:contrast`/`font-scaling` 0 critical, `react-i18next 17` extract 272 strings, close si/ta gaps.
- Push `expo-notifications` + `DeepLinkProvider:31` + `background-task`. Observability: fix `withSentryGradleDisabled.js:8`/`withSentryProperties.js:9`, review `tracesSampleRate:0.1` + Observe `sampleRate` cost together.
- Docs: mark `FUTURE_ROADMAP.md` builtin-but-invisible shipped, refresh `docs/stack-map/landscape/*` + `dependency-catalog.md`, add `EXPO_OBSERVE_RUNBOOK.md`.

---

## 5) Sequencing & Doc Lifecycle

```
P0 (1 PR: docs + Observe wrap + eas sourceMaps + baseline + checklist)
→ P1 (2-3 PRs: startup, lists/images, web engine + Atlas)
→ P2 (2 PRs: migration guard + reminders/voice)
→ P3 (2 PRs: attendance offline + gradebook analytics)
→ P4 (3 PRs: offline DL+FTS, OCR, Map)
→ P5 (2 PRs: realtime + moderation)
→ P6 (2 PRs: payments/workforce + scanner/AI)
→ P7 (1-2 PRs: polish/observability/docs)
```

Each PR: `check-types` + `lint` + `test` + `check-cycles` + `check:anti-slop` green (Slop #8). Historical docs → `current_progress/old_docs/YYYY-QN/` when superseded; `stack-map` + `dependency-catalog` regenerated, not hand-edited.

---

## 6) Verification (must green before "beast" claim)

- [ ] `2026-08-28-beast-baseline.md` with T1–T8 Before + `eas observe:metrics-summary` + Reassure + bundle HTML
- [ ] `check-types` 0, `test` 0 fails (assertion count up, not sideways)
- [ ] `check-cycles` 0, `check:anti-slop` 0 new, `audit:boundaries` + `expo-native-graph` clean
- [ ] `audit:bundle` + `route-bundles` delta T2, `audit:contrast` + `font-scaling` T7
- [ ] `eas observe:routes` per-route TTR/TTI green after P1
- [ ] E2E offline attendance→gradebook→doc→DM airplane
- [ ] Sentry >99.5% 7d, Observe Errors 0 new, stack-map regen clean, device per-tab wow video

---

## 7) Open Questions (flexible per PR, not gates)

1. Mid Android target? Suggest Pixel 6a/A35 — confirm at P0 run.
2. Payments real vs demo? Demo first (web-only ADR).
3. Voice STT offline Whisper vs server? Spike in P2.
4. Map geo vs mind-map first? Geo (minister gap) first.
5. Flags GrowthBook `gurudevi.*` vs `FeatureStore`/`canvas.*`? Per-feature PR picks smallest.

---

*Companions: `2026-08-28-callstack-perf-checklist.md` (doctrine → audits), `EXPO_OBSERVE_RUNBOOK.md` (Observe setup), `~/.opencode/plans/tingly-chewing-saga.md` (scratch plan).*
