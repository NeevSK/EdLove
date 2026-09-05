---
status: draft
date: 2026-09-04
author: Naveen
scribe: opencode
tags: [research, triage]
theme: cross-platform-and-noise
---

# Cross-platform & noise triage — foraged items (2026-09-04)

Low-relevance batch. Mostly cross-platform (NativeScript), web-GPU/shader,
fetch-library, creative-tooling, and outright noise. No Gurudevi code changes
proposed. One watch item (Nitro Fetch + TanStack Query) documented for future
only.

## 1. Sources (C:\x\temp, explicit disposition)

| # | File | Claim | Disposition |
|---|------|-------|-------------|
| 1 | `Screenshot_20260829_004956_X.jpg` | NativeScript 9.1: "hot-reload the native platform itself (APIs, modal controllers) with a new module system built for rapid agentic visual iteration" | **DUPE (1 of 3, count as one)** — same @NativeScript post as #2/#3, feed vs detail view |
| 2 | `Screenshot_20260829_005018_X.jpg` | Same NativeScript 9.1 agentic-HMR post, scrolled variant | **DUPE (2 of 3, count as one)** |
| 3 | `Screenshot_20260829_005033_X.jpg` | Same post opened as detail: 2:17 AM 28 Aug 26, 11.2K views, reply "not conventional HMR, agent-native development loop" | **DUPE (3 of 3, canonical copy)** |
| 4 | `Screenshot_20260829_005621_X.jpg` | OpenJS Foundation repost: NativeScript 9.1 adds Node-API support + Vitest-based on-device test runner, link `openjsf.org/blog/nativescr…` | **Single — companion claim to #1-3** |
| 5 | `Screenshot_20260829_005257_X.jpg` | @vercel: `vgpu.sh` open-sourced — minimal agent-first WebGPU lib, browser/headless-Node, CPU-sandbox/CI render, reusable `.wgsl` modules | **Single — low relevance (web-only)** |
| 6 | `Screenshot_20260903_231957_GitHub.jpg` | `blazejkustra/react-native-effects` — "WebGPU-powered shader effects for React Native, drop-in components on a separate thread", 331 stars / 12 forks | **Single — low relevance (early-stage)** |
| 7 | `Screenshot_20260829_004544_X.jpg` | @RiteshRk14: Nitro Fetch works with RTK Query + TanStack Query, ready-to-use snippets in docs; code shows `fetch as nitroFetch` wired as RTK `fetchFn` | **Single — only actionable/watch item** |
| 8 | `Screenshot_20260829_005354_X.jpg` | @knowlifyai Apple-ad recreation "in 10 minutes with no edits" ($50k+ hand-made original) | **Single — creative-tooling, out of scope** |
| 9 | `Screenshot_20260903_183317_One UI Home.jpg` | Device lockscreen photo (trees, Thu Sep 3, 6:33:16, 29°) | **NOISE — accidental capture, no content** |
| 10 | `Screenshot_20260829_011542_X.jpg` | @k_grajeda DIV-1 Flash parody: "centering a div is now a solved problem", CSS-bench charts, "will not be releasing weights" | **NOISE/HUMOR — parody, no content** |

Net: 10 files → 7 unique claims → 1 watch, 6 no-action (of which 2 pure noise).

## 2. External claims (briefly web-verified 2026-09-04)

- **NativeScript 9.1 HMR/module system — CONFIRMED.** Release blog (2026-08-27, `blog.nativescript.org/nativescript-9-1-announcement/`): runtimes on V8 14.9, "mature module system (one loader over disk and HTTP, a `ns:` builtin namespace, Node-compatible require/esm) that powers Vite 8 hot updates without a process restart". Matches the "hot-reload the native platform itself" marketing in #1-3, but the technical substance is Vite-8 HMR + unified loader, NativeScript-only.
- **NativeScript 9.1 Node-API + Vitest runner — CONFIRMED.** OpenJS post (`openjsf.org/blog/nativescript-9-1`): "adds Node-API support, so many existing Node native addons can run with little or no change. The test runner was also rebuilt around Vitest, running real tests on a real device." Matches #4 verbatim.
- **Nitro Fetch + TanStack/RTK Query — CONFIRMED.** Repo `github.com/margelo/react-native-nitro-fetch` (Margelo, authors incl. Ritesh Shukla): "general purpose network fetching library, drop-in replacement for built-in fetch, plus prefetching and workletized mappers". Docs (`fetch.margelo.com/docs/global-replace`, `docs/prefetch.md`): explicit TanStack Query pattern (use Nitro `fetch` inside `queryFn`, forward `signal`) and prefetch-on-navigation-intent + `useQuery` pattern. So #7's "answer to both is yes" is accurate.
- **vgpu.sh / react-native-effects — NOT deep-verified (deliberately).** Both are shader/WebGPU plays with no Gurudevi hook (see §3: no shader/WebGPU code in app). `react-native-effects` at 331 stars / 12 forks / 1 issue / 2 PRs per screenshot is early-stage; no adoption case. `vgpu.sh` is browser/headless-Node `.wgsl` tooling — web-only.
- **knowlifyai / DIV-1 / lockscreen — NOT verified.** Creative-tooling promo, parody, and accidental capture respectively. No technical claim relevant to Gurudevi.

## 3. Gurudevi today (baseline verified in-repo)

Stack (from `apps/gurudevi-mobile/package.json`):

- Expo `~57.0.19` (`package.json:119`), `expo-dev-client` `~57.0.18` (`package.json:140`), `expo-updates` `~57.0.21` (`package.json:183`), `expo-router` `~57.0.18` (`package.json:168`), `updates` key in `app.json:165`. Dev loop is Expo dev-client + Metro HMR/Fast Refresh — not NativeScript, not Vite 8.
- `react-native` `0.86.2` (`package.json:212`), `react`/`react-dom` `19.2.3` (`package.json:207-208`).
- `react-native-nitro-modules` `0.37.1` sacred (`package.json:227`). Only Nitro consumers are `react-native-nitro-google-signin` (`src/lib/googleSignIn.ts:9`) and `react-native-nitro-theme-transition` (`package.json:229`). **No `nitro-fetch` / `nitroFetch` match in `apps/gurudevi-mobile`** (grep: zero hits).
- Skia: `@shopify/react-native-skia` **`2.11.1`** (`package.json:101`) — note: task baseline said 2.11.2, repo has 2.11.1. Only Skia reference in app is the boundary-test allowlist entry for `packages/ui/src/components/SkiaGlowAura.tsx` (`src/__tests__/architecture/efficiency-policy-boundaries.test.ts:22`); component itself lives in `@repo/ui` (`packages/ui/src/components/SkiaGlowAura.tsx`). **No `WebGPU` / `wgsl` / `shader` / `react-native-effects` / `vgpu` match in `src`** (grep: zero hits outside that one Skia test line).
- TanStack: `@tanstack/react-query` `^5.102.8` (`package.json:107`) + `@tanstack/react-pacer` `^0.22.1` (`package.json:106`). Wired at root: `QueryClient` + `QueryClientProvider` in `src/providers/SanctuaryProvider.tsx:16,24,108,126`; `useQueryClient` in `src/hooks/usePacer.ts:2,12`; demo `useQuery` in `src/screens/TanStackPacerDemo.tsx:1,24`. Standard `fetch` in `queryFn` — no Nitro fetchFn.

## 4. Gap table

| External item | Gurudevi equivalent | Gap | Verdict |
|---------------|---------------------|-----|---------|
| NS 9.1 agentic/native-platform HMR | Expo dev-client + Metro Fast Refresh | Different platform entirely; no migration path, no missing capability | No action |
| NS 9.1 Node-API + on-device Vitest | Expo 57 / RN 0.86.2; `vitest ^5.0.0` for unit tests (`package.json:291`), Playwright for e2e | Node-API is a NativeScript runtime feature; Gurudevi native modules go through Expo config plugins, not Node addons | No action |
| vgpu.sh (WebGPU `.wgsl`, browser/Node) | Skia 2.11.1 via `@repo/ui` (`SkiaGlowAura`); `expo-gl ~57.0.2` present but unused for shaders | Web-only lib; RN mobile has no WebGPU surface to consume it | No action |
| react-native-effects (331★, WebGPU shaders on separate thread) | Same as above | Early-stage third-party native dependency; would violate sacred-pins discipline + add native risk for zero requested effect | No action (watch star-count only if a real shader requirement ever appears) |
| Nitro Fetch + RTK/TanStack snippets | TanStack Query 5.102.8 on stock `fetch`; Nitro 0.37.1 present so Nitro Fetch is technically installable | No perf complaint on record; Nitro Fetch would be a new native module (config-plugin + prebuild + physical-device validation per AGENTS.md) | **Watch — adopt only if fetch profiling justifies it** |
| knowlifyai ad recreation | None (marketing creative tooling) | Out of domain | No action |
| Lockscreen / DIV-1 parody | None | Noise/humor, zero technical content | No action (discard) |

## 5. Recommendation

**Mostly no-action / watch. No code, dependency, or sacred-version changes.**

1. **NativeScript items (#1-4): no action.** Different cross-platform stack. The only transferable idea — faster agent visual iteration — is already covered by Expo dev-client + Metro; nothing to port.
2. **vgpu.sh + react-native-effects (#5-6): no action.** No shader/WebGPU requirement in Gurudevi; no matching code in `src`. If a branded shader effect is ever specced, prefer Skia (already in stack via `@repo/ui`) over a 331-star WebGPU dependency. Re-triage only on a real design requirement.
3. **Nitro Fetch (#7): watch, do not adopt now.** Reason: TanStack integration is real and documented, and Nitro 0.37.1 sacred means the native foundation exists — but Gurudevi has no measured fetch bottleneck, and adding `react-native-nitro-fetch` means a new native module (config plugin, prebuild, Doppler release-APK validation). Action only if network profiling shows stock-`fetch` costs; then spike with `fetchFn: nitroFetch` + `signal` forwarding per Margelo docs and measure before committing.
4. **knowlifyai (#8): no action.** Creative-tooling promo, unrelated to mobile codebase.
5. **Lockscreen + DIV-1 (#9-10): discard as noise.** Mark in forage log so future triage doesn't re-process; no further verification warranted.

*Next triage: skip cross-platform-runtime and pure-noise captures at intake; keep Nitro Fetch note linked from any future network-perf investigation.*
