---
title: "Styling + Design System Research — cn, Own-the-Primitives, Copy-Paste Kits, Triage UX"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, ui, styling]
---

# Styling + Design System Research (2026-09-04)

## 1. Sources (C:\x\temp\, read 2026-09-04)

1. `Screenshot_20260902_224501_X.jpg` — @shadcn (02 Sep 26, 52.9K views): "We are open sourcing `cn`, a new engine for Tailwind class merging and conflict resolution. It is a drop-in replacement for tailwind-merge and clsx. It works with all frameworks, runs everywhere and is 30x faster. Brought to you by @aidenybai and me." Card: `npm i cn`. Follow-up reply (visible, truncated): "cn has full parity, identical output and a…".
2. `Screenshot_20260829_110939_Grok.jpg` — Grok "Ask" answer on own-the-primitives: practical pattern is `Your Design System → Primitives (Box, Text, Pressable, Icon, etc.) → Compounds/Molecules (Button, Input, Card, Ava…) → Organisms/Patterns (Modal, Form, List, Naviga…)`. Third-party UIs are either re-implemented on the primitives or wrapped so internal styling is replaced/overridden by your `className` + theme tokens. "This is exactly the same philosophy that shadcn/ui, NativeWind's own component examples, and many high-quality RN design systems follow: own the primitives → compose everything else on top of them."
3. `Screenshot_20260902_201057_X.jpg` — @dwhitedesign post ("Your UI is too perfect."): drawably.dev — "Hand-drawn UI. Fresh pen sketch every mount." Zero deps, real inputs, boils in CSS. Buttons (Done/Cancel/Save/Wait), radios (Pen/Pencil/Ship it), wobbly input ("your name"), Retry/Saved/Delete chips. Expressive/sketch aesthetic kit.
4. `Screenshot_20260903_232123_X.jpg` — @ephraimduncan ("who made this: blocks.so"): blocks.so — "Building blocks for the web. Copy-paste React components built with shadcn/ui and Tailwind CSS. Open source, accessible, production-ready." Badges: "All React frameworks", "Open Source". Registry link.
5. `Screenshot_20260904_075701_X.jpg` — @oldstackjournal (04 Sep 26): "I'm becoming a big fan of a single 'Needs Attention' view in software. Most days I don't need everything. I need the five things that are stuck, failed, overdue or waiting for me to make a decision." Replies: @KUNUTZ142 (driver/glovebox analogy — "registration expires Friday and nothing else"; hard part is deciding what NOT to show); @77bncvbsdcg ("real life triage").

## 2. External claims (web-verified 2026-09-04)

- **shadcn `cn` package**: `github.com/shadcn-ui/cn` — "cn is a new engine for Tailwind class merging and conflict resolution. It replaces tailwind-merge and clsx. Same APIs. Full parity. And it is 30× faster." Zero dependencies, framework-agnostic (React/Vue/Svelte/Solid/Astro/plain templates; browsers, Node, Bun, Deno, edge). Corroborated by npm `shadcn` 4.16.1 CLI page (init "adds the `cn` util") and AGI Hunt roundup dated 2026-09-02 ("~30x faster performance", drop-in replacement). Note: repo is days old (Sep 2026); "identical output / full parity" is the author's claim, not yet independently benchmarked here. `tailwind-merge` on npm is at 3.6.0 (2 months old) with ~16K dependents.
- **Own-the-primitives philosophy**: corroborated by 2026 ecosystem writing. React Native Relay (2026-06-02, NativeWind vs Unistyles vs Tamagui) documents that NativeWind compiles Tailwind utilities into `StyleSheet.create` at build time, and that component libraries on top (gluestack UI v3, React Native Reusables) are the standard productivity path — consistent with "own primitives, compose the rest". shadcn-for-RN ports (React Native Reusables, NativeCN UI, native-shadcn — 48 components, CVA, copy-paste/you-own-it, NativeWind v4) confirm the pattern is live in the RN ecosystem: copy-paste components you own, styled with NativeWind, no package bloat.
- **Copy-paste kits (blocks.so, drawably.dev)**: blocks.so claim is the standard shadcn distribution model (open-source, accessible, production-ready, registry). drawably.dev is a novelty/expressive kit (CSS boil effect, zero deps) — relevant only as a reference for playful/celebratory surfaces, not as a dependency.
- **Needs Attention triage view**: product-opinion thread, not a library. Claim: users want the 5 stuck/failed/overdue/awaiting-decision items, not the full inventory. Hard problem is exclusion ("what NOT to show").

## 3. Gurudevi today (verified, file:line proof)

Style engine (all pinned, match the requested baseline):

- `apps/gurudevi-mobile/package.json:201` — `"nativewind": "5.0.0-preview.4"`
- `apps/gurudevi-mobile/package.json:214` — `"react-native-css": "3.0.7"`
- `apps/gurudevi-mobile/package.json:215` — `"react-native-css-interop": "0.1.22"`
- `packages/ui/package.json:869` — `"nativewind": "5.0.0-preview.4"`
- `packages/ui/package.json:871` — `"react-native-css": "3.0.7"`
- `packages/ui/package.json:872` — `"react-native-css-interop": "0.1.22"`
- `packages/ui/gluestack-ui.json:2` — `"engine": "nativewind"`
- `apps/gurudevi-mobile/metro.config.js:2` — `withNativewind` from `'nativewind/metro'`; lines 283–287 alias `react-native-css-interop/jsx-runtime` via pnpm resolution.
- `packages/ui/src/global.css:1-6` — Tailwind v4 theme import (`tailwindcss/theme.css`, `preflight`, `utilities`) + `@import "nativewind/theme"`; `@config` points at `apps/gurudevi-mobile/tailwind.config.js`; `@theme` maps `--color-phase-*` tokens (lines 8–12).
- Health gates: `apps/gurudevi-mobile/package.json:31,35` — `audit:css-interop`, `audit:style-stack`, `verify:style-stack`; `scripts/audit-style-stack.mjs:45,50` pins the same four versions.

`cn` today is a naive join — **no conflict resolution**:

- `packages/ui/src/utils/classNames.ts:2-3` — `export function cn(...classNames: Array<string | false | null | undefined>): string { return classNames.filter(Boolean).join(' '); }`
- 20+ consumers import it (`SanctuaryButton`, `SanctuaryCard`, `SanctuaryModal`, `ui/button`, `ui/input`, `ui/select`, `ui/modal`, `ui/tabs`, etc. — grep `packages/ui/src` for `utils/classNames`).
- No `tailwind-merge`, `clsx`, or `cn` npm package anywhere in `apps/gurudevi-mobile/package.json` or `packages/ui/package.json` (grep confirms absence). So conflicting classes (e.g. `px-2` + `px-4`) currently concatenate instead of resolving — last-write does NOT win deterministically the way tailwind-merge guarantees.

Owned primitives + branded layer (already the Grok-screenshot pattern):

- `packages/ui/src/primitives.ts:8-53` — re-exports owned primitives (`ui/box`, `ui/text`, `ui/pressable`, `ui/hstack`, `ui/vstack`, `ui/view`, `ui/input`, `ui/modal`, etc.) plus theme (`theme/Theme`, `gluestack` config, `useTheme`).
- `packages/ui/src/brand.ts:1-10` — `BrandedEmptyState`, `BrandPulse`, `BrandedErrorState` (alias of `ErrorState`), motion tokens (`color, duration, easing, scale`), `ShimmerBlock`/`BrandedSkeletonCard`/`BrandedSkeletonList`, `SuccessCheck`/`SuccessGlow`.
- `packages/ui/src/components/BrandPulse.tsx:29-36` — breathing loader (`size = 28`, Reanimated pulse, `Mascot` glow, `className` passthrough, reduced-motion support). Per AGENTS.md: replaces `ActivityIndicator`.
- `className`-first contract: `packages/ui/README.md:25` ("accept `className` where styling is part of the public contract… derive colors from semantic tokens"); `docs/architecture/source-owned-nativewind-ui.md:33-34` (compose `className` with defaults using `cn`).
- App usage is `className` + phase tokens throughout, e.g. `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:63-65` (`bg-phase-primary`, `text-phase-world`), `app/(tabs)/self/wisdom/[id].tsx:21-61` (`bg-obsidian`, `text-sacredWhite`, `bg-white/5`).

## 4. Gap table

| # | External idea | Gurudevi status | Gap | Effort |
|---|---|---|---|---|
| 1 | shadcn `cn` engine: 30× faster merge + conflict resolution, drop-in for tailwind-merge/clsx | Naive join (`classNames.ts:2-3`); no tailwind-merge/clsx dep | **Adopt or replicate conflict resolution.** Risk: `cn` npm package is days old, Tailwind-v4/RN-class compatibility unverified; our classes include custom phase tokens (`bg-phase-primary`, `text-sacredWhite`) that tailwind-merge-style resolvers only handle if configured. Do NOT swap blindly. | S (spike: benchmark `cn` vs `tailwind-merge` on our token set; verify identical output on phase tokens) |
| 2 | Own-the-primitives (Grok answer) | Already implemented (`primitives.ts`, `brand.ts`, gluestack engine=nativewind, className contract) | **No structural gap.** Remaining work is enforcement: keep third-party UI wrapped/re-implemented on our primitives (per `source-owned-nativewind-ui.md`). | — (guardrail only) |
| 3 | blocks.so copy-paste registry model | We vendor/own components in `@repo/ui` but have no registry/CLI surface | **Optional DX gap.** A blocks-style registry page or `add` script for Sanctuary components would speed cross-app reuse. Not a styling correctness issue. | M (only if reuse pain is real) |
| 4 | drawably.dev hand-drawn kit | Brand is sanctuary/ceremony (BrandPulse breathing, SuccessGlow), not sketch | **No adoption.** At most a reference for celebratory/playful micro-surfaces (e.g. onboarding doodles). Zero-dep CSS-boil technique doesn't transfer to RN/Reanimated directly. | — (inspiration only) |
| 5 | "Needs Attention" triage view | No single stuck/failed/overdue/awaiting-decision surface identified in this pass | **Product gap, not styling gap.** If pursued, it composes existing primitives (SanctuaryCard + BrandedErrorState + skeleton list) — a composition task, no new styling infra. Exclusion rules ("what NOT to show") are the hard part per the thread. | M (product spec first) |

## 5. Recommendation

1. **Spike the `cn` engine before adopting** (small, time-boxed): install `cn` in a scratch fixture (NOT in `package.json` yet — sacred-version rules apply to the style stack by extension), run our phase-token class pairs (`bg-phase-*`, `text-*`, conflicting `px-`/`py-` combos) through `cn` vs current join vs `tailwind-merge`, and check output parity + RN compatibility. Adopt only if (a) output is identical on our tokens, (b) it runs under Metro/Hermes without Node-only APIs, and (c) it survives `verify:style-stack`. If `cn` fails any check, the fallback is `tailwind-merge` + `clsx` behind our existing `cn` import path (`packages/ui/src/utils/classNames.ts`) — zero consumer changes either way since all 20+ call sites already import from there.
2. **Keep own-the-primitives; don't add a component dependency.** The Grok-thread philosophy is already our architecture. Any blocks.so-style kit pieces get copied into `@repo/ui` and re-skinned to phase tokens — never imported as a runtime dep.
3. **No drawably adoption.** File under brand inspiration only.
4. **Triage view goes to product backlog**, not this styling track: spec the five-item exclusion rules first, then compose from `SanctuaryCard` + `BrandedErrorState` + `BrandedSkeletonList`.
