---
title: "Build, Bundler & Tooling Research — Metro vs Web Bundlers"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, tooling, build]
---

# Build, Bundler & Tooling — Research (2026-09-04)

Theme: `build-bundler-tooling`. External signal sweep (X/Brave/GitHub screenshots in `C:\x\temp\`) compared against the Gurudevi Mobile monorepo baseline (`package.json`, `turbo.json`, `pnpm-workspace.yaml`, `apps/gurudevi-mobile/package.json`).

## Sources

All sources are local screenshots in `C:\x\temp\` (captured 2026-08-29 → 2026-09-04):

| # | File | Topic / claim |
|---|---|---|
| 1 | `Screenshot_20260902_201407_Brave.jpg` | `bazel.build/about/intro` — "Intro to Bazel": open-source build/test tool like Make/Maven/Gradle; multi-language, multi-platform, large monorepos |
| 2 | `Screenshot_20260902_224513_X.jpg` | `@unsafemut` (Jerry Zhao): **Rolldown v1.2.7 out** (2026-09-02) — fixes `Export is not defined` from circular dynamic imports; `facadeModuleId` → `null` like Rollup; improved `[PLUGIN_TIMINGS]` warning |
| 3 | `Screenshot_20260903_231725_X.jpg` | `@rspack_dev`: **Rslib 1.0 is here** — multiple output formats incl. Module Federation, bundled/bundleless, cross-framework component libs, built-in CSS/asset support, TypeScript 7 support for fast declarations. Adjacent post: `@qwen_cloud` "Qwen is up" (noise, not tooling) |
| 4 | `Screenshot_20260902_201118_X.jpg` | `@voidzerodev`: **Tales from the Void, Aug 2026** — native React Compiler in **Vite 8 via Oxc** (15x faster than Babel); RFC to reduce chunks in Vite; **Vitest crosses 100M weekly downloads**; ViteConf tickets customizable |
| 5 | `Screenshot_20260904_075858_X.jpg` | `@geteslint`: **eslint/compat v2.1.1, eslint/plugin-kit v0.7.3, eslint/mcp v0.3.12, eslint/migrate-config v3.0.3** (compat 2026-09-01, bugfix: `markVariableAsUsed` return value) |
| 6 | `Screenshot_20260829_011412_X.jpg` | `@yonasbe` (Yonas Beshawred): **sling** — agent-first CLI for GitHub Actions (`sling why`, `sling bill`, `sling top`/`sling usage`: p50/p95/p99, queue wait, WoW trend); `starsling.dev/cli` |
| 7 | `Screenshot_20260902_225450_X.jpg` | `@astrodotbuild`: **Starlight v0.42** riddle — "LESS JavaScript and MORE JavaScript" in one release |
| 8 | `Screenshot_20260902_224208_GitHub.jpg` | `productdevbook/unemail` — **unified email API across 18 providers** (SMTP, Resend, SES, Postmark, SendGrid, Mailgun…); zero deps, RFC 8058 + DKIM ready, edge-first, strict TS; 274 stars / 12 forks, 11 releases (v0.7.0 visible) |
| 9 | `Screenshot_20260904_075024_X.jpg` | `@GenkitFramework` (Google) — **Genkit**: open-source AI toolkit for full-stack AI apps; TS/Go/Dart/Python; `genkit.dev`; pinned post: Genkit Dart (Preview) |

## External claims

1. **Bazel** — Google's polyglot build/test system for large multi-repo, multi-user codebases. Positioned as Make/Maven/Gradle successor with hermetic, cached builds.
2. **Rolldown v1.2.7 (2026-09-02)** — Rust bundler with Rollup-compatible API, future bundler for Vite. This patch is bugfix-only (circular-import exports, `facadeModuleId` parity, plugin-timing DX).
3. **Rslib 1.0** — Rsbuild/Rspack-family library builder. Headline features: multi-format output + Module Federation, bundled or bundleless modes, cross-framework components, CSS/assets built in, TS 7 fast declarations.
4. **Vite 8 + Oxc** — Native React Compiler ships in Vite 8 via Oxc (no Babel needed, claimed 15x faster); opt-in via `@vitejs/plugin-react@^6.1.0` + `oxc-transform-react`. Separate RFC to reduce small/common-chunk sprawl.
5. **Vitest 100M weekly downloads** — VoidZero milestone post; project context: Vitest 5 in RC at time of August recap (promoting experimentals to stable, perf work, forked `@vitest/istanbuljs` coverage engine), Vitest 5.0 release notes live on `vitest.dev`.
6. **ESLint rewrite-line releases** — `compat 2.1.1` / `plugin-kit 0.7.3` / `mcp 0.3.12` / `migrate-config 3.0.3`. Incremental migration tooling around flat-config / plugin authoring, plus an MCP server for agents.
7. **sling CLI** — Agent-first wrapper over GHA: failure diagnosis without dumping full logs into context; billing/minutes by runner label; latency stats (p50/p95/p99, queue wait, trends).
8. **Starlight v0.42** — Docs-framework release marketed on JS payload riddle (less + more simultaneously — likely selective hydration / per-page strategy change). Docs-site only.
9. **unemail v0.7.x** — Single TS API over 18 email providers, zero-dep, edge-first. 274 ★ = early-stage, not a standard.
10. **Genkit** — Google's full-stack AI app toolkit (flows, prompts, RAG, evals, plugins). Multi-SDK (TS/Go/Dart/Python).

### Web verification (2026-09-04)

- **Rslib 1.0: confirmed.** `rslib.rs/blog/v1-0` published 2026-09-03 ("Rslib 1.0 is here"). GitHub `web-infra-dev/rslib` shows 1.0 betas through Aug 2026; npm `@rslib/core` lags the announcement in cached indexes — treat X post + official blog as source of truth.
- **Rolldown 1.2.7: confirmed.** `npmjs.com/package/rolldown` lists **1.2.7 as latest** ("last published: 3 hours ago" at crawl time); `@unsafemut` X post 2026-09-02 matches. GitHub releases page cache still shows v1.2.6 (2026-08-26) as latest — stale cache, npm + X agree on 1.2.7.
- **Vitest milestone: confirmed as claimed by author.** `@voidzerodev` X: "Vitest crosses 100M weekly downloads"; companion recap `voidzero.dev/posts/whats-new-aug-2026` (2026-09-02) documents Vite 8 + Oxc compiler, chunk RFC, Vitest 5 RC, property-mangling in Rolldown/Oxc. `vitest.dev/blog/vitest-5` confirms Vitest 5.0 shipped (requires Vite ≥ 6.4, Node ≥ 22.12; coverage moved to `@vitest/istanbuljs` fork).

## Gurudevi today

Verified from repo files (no changes made):

- **Orchestration:** `turbo@^2.10.12` (`turbo.json`: `build` depends on `^build`, outputs `dist/**`, `.next/**`; `lint` = `lint:biome` + `lint:eslint`; `check-types` topological). `packageManager: pnpm@12.1.0`, `pnpm-workspace.yaml` with `packages/*` + `apps/*`, RN/Expo singletons in `publicHoistPattern`.
- **Bundler: Metro, not Vite/Rolldown.** `apps/gurudevi-mobile/app.json:69` → `"bundler": "metro"`; `@expo/metro-runtime ~57.0.15`; `babel-preset-expo ~57.0.9`. No `vite`, `rolldown`, `rspack`, `rsbuild`, or `rslib` in `gurudevi-mobile/package.json` or root `package.json`.
- **Tests: Vitest 5 line.** `vitest: ^5.0.0` in `apps/gurudevi-mobile` devDependencies; scripts `test` / `test:watch` / `test:ui` all Vitest; plus `jest-expo ~57.0.5` / `jest ^29.7.0` legacy, `@playwright/test ^1.62.1` for e2e, `reassure ^1.6.0` for perf.
- **Lint: ESLint 10 + Biome/Oxlint.** `eslint ^10.9.1` (root + mobile), `eslint-config-expo ~57.0.2`, `oxlint ^1.81.0` + `eslint-plugin-oxlint ^1.81.0`, `@biomejs/biome ^2.5.12`, `oxfmt ^0.66.0`. No `eslint/compat`, `plugin-kit`, `mcp`, or `migrate-config` deps pinned.
- **AI toolkit: Genkit absent, Inngest present.** Grep for `genkit` across repo: zero code hits. `inngest ^4.18.1` in mobile deps; `@repo/ai` workspace package exists. Genkit would be net-new.
- **Email: no server provider, no unemail.** Grep for `resend|sendgrid|postmark|mailgun|unemail`: only UI copy ("Resend Email" OTP button), offline-queue naming (`resendInvite`), and a commented `smtp.sendgrid.net` example in `supabase/config.toml`. Runtime email = on-device composers only: `expo-mail-composer ~57.0.1`, `expo-sms ~57.0.1` (also in `app.json` plugin list). No transactional-email dependency to unify.
- **Adjacent:** `react-native-bundle-visualizer ^4.0.0` + `audit:bundle` / `audit:route-bundles` scripts exist; `tailwindcss 4.3.0` + `nativewind 5.0.0-preview.4`; TypeScript `7.0.2` (sacred pin — relevant to Rslib's "TS 7 fast declarations" claim).

## Gap table

| External signal | Gurudevi status | Gap / relevance |
|---|---|---|
| Bazel (polyglot hermetic builds) | Turborepo + pnpm workspaces | **No gap.** Same job at our scale; Bazel migration cost dwarfs benefit for one RN app + TS packages |
| Rolldown 1.2.7 | Metro (Expo RN requirement) | **Not applicable to app bundle.** Rolldown/Vite cannot replace Metro for RN native builds; only relevant to future web/docs tooling |
| Rslib 1.0 (library builder) | `tsc --build`, no lib bundler | Low. Only matters if we publish `@repo/*` packages externally; internal workspace consumption needs no Rslib |
| Vite 8 + Oxc React Compiler | Babel (`babel-preset-expo`), Expo 57 | Watch. Compiler benefits don't transfer to RN/Metro today; revisit only via Expo-supported path |
| Vitest 100M / Vitest 5 | Vitest `^5.0.0` already | **Aligned.** Action: confirm installed 5.x is post-RC stable and coverage uses `@vitest/istanbuljs` fork |
| ESLint compat/plugin-kit/mcp/migrate-config | ESLint 10, no rewrite helpers | Minor. `compat`/`migrate-config` useful only during flat-config migration leftovers; `mcp` worth a look for agent-assisted linting |
| sling (GHA analytics CLI) | Custom `run-and-report.mjs` wrappers, no GHA cost tool | Potential DX win. Trial `sling bill/usage/why` read-only against CI before adopting |
| Starlight v0.42 | Docs are repo Markdown, no Starlight site | None unless docs site is created; then evaluate |
| unemail (18-provider email API) | No server email provider at all | **No gap to unify.** Revisit only when a transactional provider (Resend/SES/…) is chosen; 274 ★ = adopt with caution |
| Genkit (AI toolkit) | Inngest + `@repo/ai`, no Genkit | Strategic choice, not a gap. Only evaluate if Inngest + current AI stack hits limits (flows/evals/observability) |

## Recommendation

1. **Do not swap bundlers.** Metro vs Vite/Rolldown is not a choice for React Native — Metro is mandated by Expo/RN native builds. Rolldown 1.2.7, Vite 8, Rspack/Rslib 1.0 are web-stack news; track for future web/docs targets only. No action.
2. **Do not adopt Bazel.** Turborepo + pnpm already solve caching/orchestration at this monorepo's scale. Bazel is overkill (hermetic toolchains, Starlark maintenance, Expo/Gradle friction) with no identified cache-correctness problem. No action.
3. **Close the two in-stack items (cheap):** verify Vitest resolves to stable 5.x and note the Istanbul fork in the test docs; check whether `eslint/compat` or `migrate-config` resolves any remaining flat-config friction, otherwise ignore the rewrite-line patch releases.
4. **Trial sling read-only.** Biggest unknown-cost area is GHA minutes/latency; `sling bill` / `sling usage` / `sling why` are agent-friendly and non-invasive. Pilot before any CI change.
5. **Defer unemail, Genkit, Starlight, Rslib.** Each solves a problem Gurudevi doesn't currently have (server email provider, AI orchestration gap, docs site, published libs). Revisit triggers: choosing Resend/SES → re-evaluate unemail; outgrowing Inngest flows → spike Genkit; publishing `@repo/*` → spike Rslib; launching a docs site → evaluate Starlight v0.42+.
6. **QwenCloud post is noise** — no relevance to build/bundler tooling; ignore.
