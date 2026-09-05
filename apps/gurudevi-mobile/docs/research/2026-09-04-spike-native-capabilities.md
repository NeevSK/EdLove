---
title: "Spike: Native Capabilities — paste-input, Nitro Fetch, plain-text"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, spike, native, expo, nitro, performance]
---

# Spike: Native Capabilities — paste-input, Nitro Fetch, plain-text

Native-gated evaluation only. No code changes, no installs, no `android/`/`ios/` edits, no `expo install --fix`, no `prebuild --clean`, no sacred-pin changes. Builds on `docs/research/2026-09-04-expo-native-evolution.md`, `docs/research/2026-09-04-rn-performance-patterns.md`, and `docs/research/2026-09-04-forage-candidate-catalog.md`.

## 1. Web verification (2026-09-04)

| Item | Verdict | Evidence |
|---|---|---|
| expo-paste-input `onPaste` API | REAL, third-party (not SDK core) | `github.com/arunabhverma/expo-paste-input` (MIT, ~337★, created Nov 2025). `TextInputWrapper` wraps existing `TextInput`, fires `onPaste: (payload: PasteEventPayload) => void` where payload = `{ type: "text"; value } \| { type: "images"; uris: string[] } \| { type: "unsupported" }`. Local `file://` temp URIs; web no-op. |
| expo-paste-input platforms | iOS + Android only | iOS: native `paste(_:)` + `UIPasteboard` + text-input hooks (`NSTextAttachment`, `NSAdaptiveImageGlyph`, animated stickers). Android: `OnReceiveContentListener` + ActionMode hooks, suppresses "Can't paste images" toast, saves to cache. |
| expo-paste-input dev-build | COMPATIBLE (standard loop) | Requires dev build (`expo-dev-client` ~57.0.18) + prebuild; Expo Go non-criterion (we do not ship Go). Origin: Expo guest post `expo.dev/blog/pasting-images-into-textinput-should-not-be-this-hard` (Aug 28, 2026). |
| Nitro Fetch API | REAL (Margelo) | `github.com/margelo/react-native-nitro-fetch`, docs `fetch.margelo.com`. Drop-in `import { fetch as nitroFetch } from 'react-native-nitro-fetch'` over Cronet (Android) / URLSession (iOS); HTTP/1-3 + QUIC + Brotli + disk cache. `prefetch(url, { headers: { prefetchKey } })` + `prefetchOnAppStart()` queue (AES-GCM encrypted at rest, replayed before JS ready, ~220 ms earlier start claimed). `nitroFetchOnWorklet(url, opts, mapper)` with `'worklet'` mapper via `react-native-worklets`. AbortSignal supported incl. pre-aborted throw. Companion `react-native-nitro-websockets` + `react-native-nitro-text-decoder` for WS/streaming. Expo plugin auto-injects `AutoPrefetcher.prefetchOnStart()` during prebuild. Requires Nitro Modules (RN 0.75+; we are on RN 0.86.2, Nitro 0.37.1 sacred — compatible). |
| react-native-plain-text | REAL, Fabric-only, dev-build compatible | `github.com/mdjastrzebski/react-native-plain-text` (~Jul 2026): `PlainText` renders straight to `UILabel`/`TextView`, bypassing RN text pipeline. Requirements: New Architecture (Fabric), native rebuild (`pod install` on iOS), dev build (our standard loop — Expo Go non-criterion). Star/download counts in prior research are author-reported, not independently verified. |

## 2. Repo evidence (file:line)

Composer / TextInput / clipboard:

- `apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:16` — `TextInput` import; `:413,:420,:444,:454,:464,:492,:500,:507,:515,:522,:579,:587,:594,:601,:609,:617` — ~14 `TextInput` sites (form fields) + `:428` `EnrichedMarkdownTextInput` (render-only markdown editor, not a paste path).
- `apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:155` — only clipboard-adjacent call is `storage.getStringAsync(draftKey)` (draft persistence, not system clipboard). Zero `expo-clipboard` API calls in app source despite `expo-clipboard: ~57.0.1` in `package.json:136`.
- `apps/gurudevi-mobile/src/screens/DurableAgentsScreen.tsx:168,220` (+`.web.tsx:189,220`) and `src/screens/TanStackPacerDemo.tsx:50` — plain `TextInput`, no wrapper, no `onPaste`.
- `expo-paste-input`: zero hits in workspace (not installed) — confirms prior research.

TanStack queryFn fetch sites:

- `apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx:16,24,108` — single `QueryClient` + `QueryClientProvider` root; no custom `queryFn`, no `fetch` wrapper, no prefetch.
- `apps/gurudevi-mobile/src/screens/TanStackPacerDemo.tsx:24-26` — only `useQuery` with network-adjacent `queryFn: () => fetchMockSearchResults(...)` (mock + 300 ms timer, not real fetch).
- `apps/gurudevi-mobile/src/screens/DurableAgentsScreen.tsx:39,65,80,90` (+`.web.tsx:38,64,79,89`) — four raw global-`fetch` callsites in `createApiClient()` (`getRuns`, `startRun`, `getRun`, `promoteRun`); failure mode is silent `[]`/`null` return. These are the only real `fetch` sites — the Nitro Fetch swap surface.
- `apps/gurudevi-mobile/src/hooks/usePacer.ts:2,12-16` — `useQueryClient().invalidateQueries({ queryKey })` via `@tanstack/react-pacer`; no prefetch.
- Pins: `@tanstack/react-query ^5.102.8` (`package.json:107`), `react-native-nitro-modules 0.37.1` sacred (`package.json:227`), `react-native-worklets 0.12.1` sacred (`package.json:242`) — Nitro Fetch prerequisites already satisfied.

Skia text components:

- `@shopify/react-native-skia 2.11.1` (`package.json:101`; sacred per AGENTS.md is 2.11.2 — minor drift noted, not this spike's scope). No `Paragraph` / `SkParagraphBuilder` / `useFont` / `matchFont` usage anywhere in app or `@repo/ui` (grep: zero hits).
- Skia usage is decorative only: `packages/ui/src/components/SkiaGlowAura.tsx:15,32`, `packages/ui/src/components-native/LivingCard.tsx:19,54`, `packages/ui/src/components/CelebrationOverlay.tsx:29` (fast-confetti Atlas). Text rendering is all RN `<Text>` (100+ sites in `@repo/ui`) + branded motion (`BrandPulse` etc.).
- `react-native-plain-text`: zero hits (not installed).

## 3. Integration designs (no code changes)

### A. expo-paste-input wrapper lifecycle + temp-file purge + PDPA consent

- Where: single new wrapper component (e.g. `ComposerPasteWrapper`) around the target `TextInput`, adopted per-screen behind a feature flag; candidate first screen is the editorial composer (`editorial.tsx:428` region) only if a pasted-image-attachment requirement is confirmed.
- Lifecycle: `onPaste` discriminates `text` (let default insert proceed) vs `images` (default paste prevented by the lib; `uris: file://...` temp files) vs `unsupported` (ignore + log). App copies temp URIs into its own attachment store immediately (uploads dir), then deletes originals. Purge job: on send, on draft-discard, and on app foreground (sweep wrapper temp dir for files older than N hours).
- PDPA consent: pasted images may contain third-party personal data (screenshots, photos of others). Gate: first-paste consent sheet (what is attached, where stored, school-data policy), per-school allowlist for paste-attachments, PII masking obligation carries to Screenmap-style CI baselines if composer screenshots are ever captured. Temp files are device-local until explicit send — state this in the consent copy.
- Gates: `expo prebuild --no-install` (never `--clean`), config-plugin check (package ships its own Expo plugin — verify; else add via `app.json`), dev-build rebuild (standard loop; Expo Go non-criterion), release-APK + Doppler device test per AGENTS.md §5, bitmap-memory watch (Feb-2027 Play thresholds: pasted images add bitmap pressure).

### B. Nitro Fetch: fetchFn + signal-forward + prefetch-on-intent screen choice + profiling gate

- `fetchFn` shape: `queryFn: ({ signal }) => nitroFetch(url, { signal })` — TanStack passes `AbortSignal`; Nitro Fetch honors it (incl. pre-aborted). Centralize in one `fetchFn` factory (oRPC-adjacent `clientRuntime`, not per-screen) so the four `DurableAgentsScreen` callsites (`:39,:65,:80,:90`) migrate together; keep web on browser `fetch` (Nitro Fetch is native-only benefit).
- Prefetch-on-intent: official pattern (`prefetch` + `prefetchKey` header, destination `useQuery` reads same key, `nitroPrefetched: true` header on hit). Screen choice: `DurableAgentsScreen` list → detail navigation (`getRuns` list row `onPress` prefetches `getRun(runId)` before `navigate`). Rationale: smallest real-fetch surface, list→detail is the canonical intent gap, isolated from PowerSync/offline paths. `prefetchOnAppStart` explicitly OUT of scope (auth-token replay risk; Expensify precedent requires logout-clearing; needs separate ADR).
- Profiling gate (per AGENTS.md §5): standalone `assembleRelease` wrapped with `doppler run --no-fallback --` (injects `EXPO_PUBLIC_*` into Metro bundle), physical-device measured (P50/P75 on list→detail + cold-start-to-first-query), release build only (debug + Metro invalidates numbers). Compare main release vs Nitro Fetch PR build; adopt only on measured win. Success metric + rollback trigger defined in ADR.

### C. plain-text bottleneck criteria

Adopt `react-native-plain-text` only if ALL hold: (1) release-APK profile attributes ≥X% of list-row render time to the RN text pipeline (Hermes profile / FlashList `onLayout` jitter on high-volume single-style rows — grades/attendance lists); (2) target rows are provably single-style (no nested spans, no markdown, no emoji-mixed runs — `PlainText` cannot do rich text); (3) Fabric confirmed on the test device (requirement) + dev-build validation passes; (4) branded text/motion (`@repo/ui`) keeps ownership — `PlainText` used via a branded wrapper on the profiled rows only, never as a global `Text` replacement. Otherwise: stay on RN `<Text>` + FlashList; re-check only when a measured bottleneck appears.

## 4. Go / no-go

| Item | Verdict |
|---|---|
| expo-paste-input | **NO-GO (deferred)** — real and well-understood, but no composer attachment requirement exists; adds native module + rebuild + temp-file/PDPA ownership + bitmap pressure. Proceed only on confirmed spec → ADR gates. |
| Nitro Fetch | **CONDITIONAL GO (profile-gated spike)** — prerequisites already in-repo (Nitro 0.37.1, worklets 0.12.1, Query 5.102.8); swap surface is 4 callsites in one screen. Spike allowed only behind the release-APK + Doppler + device-measured gate; no `prefetchOnAppStart` without follow-up ADR. |
| react-native-plain-text | **NO-GO (watch)** — no Skia-Paragraph or text-pipeline bottleneck evidenced; decorative-Skia-only + RN-`<Text>`-everywhere today. Revisit only when §3C criteria all hold. |

## 5. ADRs issued

- `docs/decisions/2026-09-04-paste-input-adoption.md` (draft)
- `docs/decisions/2026-09-04-nitro-fetch-adoption.md` (draft)
