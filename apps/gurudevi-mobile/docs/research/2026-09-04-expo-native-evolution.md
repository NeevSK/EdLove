---
title: "Expo Native Evolution: Foraged Screenshots vs Gurudevi Workspace"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, expo, native]
---

# Expo Native Evolution: Foraged Screenshots vs Gurudevi Workspace

Theme: `expo-native-evolution`. Compares five foraged screenshots in `C:\x\temp\` against the verified Gurudevi-mobile baseline. No `android/` or `ios/` edits were made.

## Sources

Foraged (read with Read tool as images):

- `C:\x\temp\Screenshot_20260902_224323_X.jpg` — X post by Lukasz Kosmaty (@lkosmaty), 02 Sep 26: "We are rewriting Expo Modules from scratch… A preview ships with SDK 58 soon. Here is where Android stands today." Embedded benchmark table "Expo Modules v2 benchmark: native call cost on Android" (Expo Modules v2 vs Expo Modules vs TurboModule, lower-is-better, release build, arm64-v8a, OnePlus 9 Pro). Follow-ups: first preview is module implementations only, native views come later, expect rough edges; TurboModules credit note (RN core, no extra dep, C++ shareable).
- `C:\x\temp\Screenshot_20260829_010035_X.jpg` — X thread: Arunabh Verma (@iamaru…) reposting @expo: "expo-paste-input … bringing native paste support for images, gifs, and stickers to react native." Quoted @expo post: "React Native TextInput now has a real paste event. expo-paste-input wraps your existing input and fires onPaste with text or loc…", with chat/sticker demo video still.
- `C:\x\temp\Screenshot_20260829_010629_X.jpg` + `C:\x\temp\Screenshot_20260829_010636_X.jpg` — X post by Alex Miku…ki (@aleqsio), 28 Aug 26: "You liked my app map viewer, so I built a proper CI tool for it" — one-click map previews from a PR comment, supports @expo EAS, deterministic on CI without burning tokens (or bring your own LLM key), free/customizable/open source. Card: screenmap.dev, "Preview changes without running the app. Every screen your pull request touched, screenshotted in CI and posted to the review." Second screenshot adds thread context: MVP shared ~09 Aug built with Argent (by @swmansion); replies praise deterministic CI preview over "AI reviews your PR".
- `C:\x\temp\Screenshot_20260828_015225_Perplexity.jpg` — Perplexity/Discover summary card (citing androidpolice, android-developers.googleblog, 9to5google): "Google to enforce Android app memory limits starting February 2027. Apps and games exceeding new RAM and code optimization thresholds will face reduced visibility and publishing restrictions." Bullets: "bad behavior thresholds" for memory usage, bitmap memory, DEX code optimization effective Feb 2027; RAM-supply/AI-datacenter framing; non-compliant apps not banned but may lose visibility; new dev tools rolling out.

Baseline (verified in workspace):

- `apps/gurudevi-mobile/app.json` — Expo config, EAS projectId, plugins, minSdk.
- `apps/gurudevi-mobile/package.json` — Expo 57 dep pins, router, notifications, background tasks.
- `apps/gurudevi-mobile/eas.json` — build profiles (development / preview / production).

## External claims (web-verified 2026-09-04)

### 1. Expo Modules v2 rewrite + SDK 58 preview — PLAUSIBLE, PRE-RELEASE ONLY

- Screenshot claim matches the author's public framing: rewrite, same concepts, simpler API, better performance, Android benchmark, SDK 58 preview.
- SDK status: latest stable is SDK 57 (released June 30, 2026, React Native 0.86; see `expo.dev/changelog/sdk-57`). SDK 56 released May 21, 2026. No stable SDK 58 exists. Only evidence is `expo@58.0.0-canary-20260902-26df09e` published Sep 2, 2026 (releasealert.dev/npmjs expo feed) — consistent with a "preview ships soon" window, not a release.
- Scope caveat comes from the author himself (visible in screenshot): first preview = module implementations only, no native views yet, rough edges expected. Benchmark table is author-provided, single-device (OnePlus 9 Pro, CPU locked), not independently reproduced here.
- Related stable-track work already documented: precompiled Expo Modules for faster native builds (`docs.expo.dev/guides/prebuilt-expo-modules/`, mod. Aug 13, 2026). Do not confuse with the v2 rewrite.

### 2. expo-paste-input — REAL, THIRD-PARTY (NOT EXPO SDK CORE)

- Package is real: `github.com/arunabhverma/expo-paste-input` (MIT, ~337 stars, created Nov 2025). Install via `npx expo install expo-paste-input`; requires dev-build rebuild (standard loop; Expo Go non-criterion).
- API per README: `TextInputWrapper` wraps an existing `TextInput`, fires `onPaste` with `{ type: "text"; value } | { type: "images"; uris: string[] } | { type: "unsupported" }`. Local `file://` temp URIs; web is a no-op. iOS uses native `paste(_:)` + `UIPasteboard` + text-input hooks for keyboard stickers (`NSTextAttachment`, `NSAdaptiveImageGlyph`); Android uses `OnReceiveContentListener` + ActionMode hooks.
- Provenance: Expo guest post `expo.dev/blog/pasting-images-into-textinput-should-not-be-this-hard` (Aug 28, 2026) by the same author confirms origin story — Mattermost `react-native-paste-input` broke in pieces on the New Architecture; `react-native-enriched` was considered but rejected as too broad (goal was a URI attachment event, not an embedded rich editor); Fernando Rojo / v0 wrapper pattern was the design inspiration.
- Screenshot wording ("is on the @expo") means featured/promoted by Expo, not shipped in the SDK. Do not treat as `expo-*` versioned SDK package.

### 3. Screenmap EAS previews — REAL, THIRD-PARTY CI TOOL

- Screenshot claims are consistent with the product pitch at screenmap.dev: PR-comment-triggered route/screen map previews, EAS support, deterministic-by-default CI execution with optional BYO LLM key, open-source/customizable.
- No Expo-docs verification (not an Expo first-party service). Treat CI/EAS-build-minutes and screenshot-farm costs as unevaluated. The "supports EAS" claim is the only load-bearing integration point for Gurudevi and was not exercised here.
- Prior-art note in thread (Argent by Software Mansion for the MVP visualiser) is plausible but not verified beyond the screenshot.

### 4. Google Play bad-behavior thresholds Feb 2027 — CONFIRMED (CORE POLICY REAL; SECONDARY FRAMING UNVERIFIED)

- Confirmed via official sources: Android Developers Blog "Elevating app quality…" (Aug 26, 2026) + `developer.android.com/games/optimize/vitals` + Play Console help `answer/17492799`.
- What is enforced from February 2027: apps AND games must meet bad-behavior thresholds for (a) dynamic memory usage (anonymous RSS + swap, sliced by app/game × device RAM tier × process state), (b) bitmap memory usage (same across RAM tiers; 200 MB user-perceived services / 200 MB background / 400 MB cached at p90), (c) DEX code optimization (≥25% coverage across optimization/shrinking/obfuscation, e.g. R8; applies to apps with >10 MB DEX, games with >50 MB DEX). Consequence: reduced Play visibility and publishing-capability restrictions — not a ban.
- New Play Console tooling already rolling out: dynamic + bitmap memory in Android vitals (percentile × RAM-bucket drill-downs), OOM-kill crash filter, per-bundle DEX optimization insights, proactive threshold warnings. More diagnostics promised later in 2026.
- Do NOT carry over the Perplexity card's "RAM production shifts toward AI data centers" causal framing as Google's rationale — that is secondary-press synthesis (androidpolice/9to5google via Perplexity), not present in the official blog wording reviewed.

## Gurudevi today (verified)

- SDK pins — `apps/gurudevi-mobile/package.json:119` `expo: ~57.0.19`; `package.json:168` `expo-router: ~57.0.18`; `package.json:207` `react: 19.2.3`; `package.json:212` `react-native: 0.86.2`. Matches the SDK 57 / RN 0.86 line; not on any SDK 58 canary.
- EAS identity — `apps/gurudevi-mobile/app.json:82-83` `extra.eas.projectId: 1701dfb9-c59e-45c6-a391-58c061a0b8ce`; `app.json:162-167` `runtimeVersion.policy: appVersion`, `updates.url: https://u.expo.dev/<projectId>`. `apps/gurudevi-mobile/eas.json:7-58` profiles: development (internal APK, assembleDebug), preview (internal APK), production (app-bundle, autoIncrement); all Android builds pinned to `ubuntu-26.04-jdk-17-ndk-r27b-sdk-57`.
- Native config surface — `apps/gurudevi-mobile/app.json:87-160` plugins include `expo-font`, `./plugins/withNdkVersion`, `./plugins/withGradleProperties` (note: `./plugins/withAndroidCruncherDisabled` is commented out at `app.json:90`), `expo-localization`, `expo-asset`, `expo-audio`, `expo-secure-store`, Sentry (×2 entries), `expo-web-browser`, `expo-image`, `expo-sharing`, `expo-sqlite`, `expo-video`, `expo-notifications`, datetimepicker, stripe, `expo-build-properties` with `app.json:124-131` `android.minSdkVersion: 28` and empty `extraMavenRepos`, `expo-mail-composer`, `expo-splash-screen`, `expo-widgets`, `expo-router`, `react-native-enriched-markdown`, `react-native-nano-icons`, `expo-background-task`, `expo-status-bar`, lucide icons, `react-native-nitro-google-signin`. Per `AGENTS.md`, all native config must flow through `app.json`/plugins — `android/` + `ios/` are ephemeral and were not touched.
- Notifications/background — `apps/gurudevi-mobile/package.json:165` `expo-notifications: ~57.0.16`; `package.json:126` `expo-background-task: ~57.0.15`; `package.json:182` `expo-task-manager: ~57.0.15`. Usage: `apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:1` imports `expo-notifications`; `apps/gurudevi-mobile/src/lib/backgroundSyncTask.ts:9-10` imports `expo-background-task` + `expo-task-manager`; storage-eviction task mocks at `apps/gurudevi-mobile/src/__tests__/architecture/background-sync-task-entry.test.ts:5-6`.
- Expo Modules / paste / map surface — `expo-clipboard: ~57.0.1` present (`package.json:136`); `react-native-enriched-markdown: 1.0.1` present (`package.json:217`, used in `apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:21`). `expo-paste-input` and `screenmap` return zero hits in the app workspace — not installed. `expo-modules-core` appears only in test mocks (`apps/gurudevi-mobile/jest-setup.ts:359`, `apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts:1`).
- Nitro position (relevant to Modules-v2 benchmarks): sacred pins per `AGENTS.md` are already on Nitro — `package.json:224` `react-native-mmkv: 4.3.2`, `package.json:227` `react-native-nitro-modules: 0.37.1`, `package.json:230` `react-native-reanimated: 4.6.0`, `package.json:242` `react-native-worklets: 0.12.1`.

## Gap table

| External signal | Gurudevi today | Gap / action |
|---|---|---|
| Expo Modules v2 preview (SDK 58 canary; impls only, no views) | SDK 57 stable; heavy Expo-module + Nitro user | No action. Watch canary; v2 preview has no views support so zero UI payoff today. Revisit only when views land. Do not chase canary on main-dev. |
| SDK 58 stable | `expo ~57.0.19`, RN 0.86.2, image `sdk-57` | Hold. SDK 57 is current stable and includes the Hermes V1 memory-regression fix (`expo@57.0.17`, RN 0.86.3). Plan the 58 upgrade as a separate task once stable + Go/build images exist. |
| expo-paste-input (native image/GIF/sticker paste, wrapper + `onPaste`) | `expo-clipboard` only; no paste-event path; enriched-markdown is render-only | Optional feature, not parity. Adopt only if a composer/chat flow needs pasted-image attachments. Cost: new native module → dev-build rebuild, temp-file lifecycle ownership, no-op on web, extra bitmap pressure ahead of Feb-2027 limits. Prototype behind a flag first. |
| Screenmap PR map previews (EAS-backed, deterministic CI) | EAS projectId + preview channel exist; no map-preview CI | Low-risk trial candidate. Pilot on preview builds for route-heavy PRs; measure EAS minutes, screenshot determinism, and auth-screen handling before adopting. No app-code change required. |
| Play bad-behavior thresholds Feb 2027 (RSS+swap, bitmap 200/200/400 MB, DEX ≥25%) | minSdk 28; bundle/DEX shrink posture not evidenced in repo (empty `extraMavenRepos`, no R8 config in versioned files; release shrink lives in ephemeral `android/`) | Start hygiene now: read Android vitals memory/bitmap percentiles × RAM buckets; audit bitmap retention in background/cached states (`expo-image` usage); confirm per-bundle DEX optimization % in Play Console; keep release-shrink ownership explicit (plugin, not hand-edited `android/`). Non-compliance risks visibility + publishing restrictions, not removal. |

## Recommendation

1. Stay on SDK 57; track (do not adopt) the SDK 58 canary and Modules-v2 preview until native views land and migration notes exist.
2. Defer `expo-paste-input` unless a concrete composer requirement arrives — it adds a native module, rebuild burden, and bitmap/memory surface with no current caller.
3. Trial Screenmap against the existing preview channel as a CI-only experiment; keep it out of the app bundle.
4. Open the Feb-2027 Play workstream now (measure → bitmap lifecycle audit → DEX/R8 confirmation via Play Console), since it is the only item here with a hard enforcement date and store-visibility consequences.
