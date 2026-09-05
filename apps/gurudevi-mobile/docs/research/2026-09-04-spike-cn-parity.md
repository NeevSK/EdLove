---
title: "Spike: cn Parity — Naive Join vs Conflict-Resolving Merge on Phase Tokens"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, ui, styling, spike]
---

# Spike: cn Parity (2026-09-04)

## 1. Problem

`cn` in `packages/ui/src/utils/classNames.ts:2-3` is a naive join with no conflict
resolution. All 20+ consumers (`ui/button`, `ui/input`, `ui/select`, `ui/modal`,
`ui/tabs`, `SanctuaryButton`, `SanctuaryCard`, `SanctuaryModal`, etc. — grep
`packages/ui/src` for `utils/classNames`) compose `baseStyle + variantStyle +
sizeStyle + className` through it. When a caller overrides a default (e.g. Button
`md` → `lg`, `solid` → `ghost`), both the default and the override ship to
NativeWind and last-write wins only by CSS order — nondeterministic from the
caller's perspective. The `cn` shadcn engine (forage verdict: **spike first**,
`2026-09-04-forage-candidate-catalog.md:21`) and the `tailwind-merge + clsx`
fallback (`:22`) both promise deterministic last-wins, but neither is verified
against our custom `bg-phase-*` / `text-phase-*` tokens
(`apps/gurudevi-mobile/tailwind.config.js:15-19`, `packages/ui/src/global.css:8-12`).

## 2. Spike method (pure JS, no installs, no repo changes)

- Fixture: `C:\Users\Naween\AppData\Local\Temp\opencode\cn-parity-spike\fixture.mjs`
  (scratch only — NOT in repo, per guardrails; no `package.json` change, no
  `expo install`, no prebuild).
- `cnNaive` replicates `classNames.ts:2-3` exactly (`filter(Boolean).join(' ')`).
- `twMergeLike` is a minimal last-wins model derived from tailwind-merge docs
  (WebSearch-verified 2026-09-04: `dcastil/tailwind-merge` README + `docs/features.md`
  + `docs/configuration.md`): last conflicting class wins, refinements allowed
  (`p-3` + `px-4` keeps both; `px-4` + `p-3` collapses), modifier-scoped groups
  (`hover:px-*` never conflicts with bare `px-*`), asymmetric cross-group conflicts
  (`px` removes preceding `pr`/`pl`), custom color group extended to `bg-phase-*`.
- 25 cases run with `node fixture.mjs`. tailwind-merge itself was NOT installed;
  the model covers the conflict classes relevant to our consumers, not the full
  Tailwind grammar.

## 3. Parity results

`TOTAL 25 cases, 20 diverge (merge drops a predecessor), 5 identical.`

| # | Input | Naive join | Merge model | Verdict |
|---|---|---|---|---|
| 1 | `px-4`, `px-2` | `px-4 px-2` | `px-2` | DIVERGE — core bug class: override leaks |
| 2 | `px-2 px-4` (single string) | `px-2 px-4` | `px-4` | DIVERGE — same, intra-string |
| 3 | `p-3`, `px-4` | `p-3 px-4` | `p-3 px-4` | SAME — refinement kept by both |
| 4 | `px-4`, `p-3` | `px-4 p-3` | `p-3` | DIVERGE — broader swallows narrower |
| 5 | `bg-phase-primary`, `bg-phase-accent` | both kept | `bg-phase-accent` | DIVERGE — custom tokens DO form one group (config required) |
| 6 | `bg-red-500`, `bg-blue-500` | both kept | `bg-blue-500` | DIVERGE |
| 7 | `bg-phase-accent`, `bg-transparent` | both kept | `bg-transparent` | DIVERGE — Button solid→ghost switch (`ui/button/index.tsx:79-92`) |
| 8 | `text-sm`, `text-lg` | both kept | `text-lg` | DIVERGE |
| 9 | `text-phase-text-primary`, `text-white` | both kept | `text-white` | DIVERGE — ButtonText override path (`:166`) |
| 10 | `text-phase-accent`, `text-phase-danger` | both kept | `text-phase-danger` | DIVERGE |
| 11 | `flex-row`, `flex-col` | both kept | `flex-col` | DIVERGE |
| 12 | `block`, `flex` | both kept | `flex` | DIVERGE |
| 13 | `inline`, `block` | both kept | `block` | DIVERGE — matches tailwind-merge docs example |
| 14 | `opacity-40`, `opacity-100` | both kept | `opacity-100` | DIVERGE — disabled-state override (`ui/button/index.tsx:117`) |
| 15 | `rounded-xl`, `rounded-full` | both kept | `rounded-full` | DIVERGE |
| 16 | `px-3`, `hover:px-4` | both kept | both kept | SAME — modifiers scope correctly |
| 17 | `hover:px-2`, `hover:px-4` | both kept | `hover:px-4` | DIVERGE — same-modifier conflict resolves |
| 18 | `px-4`, `py-2` | both kept | both kept | SAME — orthogonal axes never conflict |
| 19 | `inset-x-px`, `-inset-1` | both kept | `-inset-1` | DIVERGE — matches tailwind-merge docs example |
| 20 | `font-bold`, `font-medium` | both kept | `font-medium` | DIVERGE |
| 21 | `items-center`, `items-start` | both kept | `items-start` | DIVERGE |
| 22 | `bg-phase-accent border border-phase-accent`, `bg-transparent` | 4 tokens | `border border-phase-accent bg-transparent` | DIVERGE — width/color tokens correctly preserved, only bg resolves |
| 23 | `px-4 h-12`, `px-6 h-14` | 4 tokens | `px-6 h-14` | DIVERGE — Button md→lg switch (`ui/button/index.tsx:95`) |
| 24 | `font-bold text-center tracking-tight`, `text-phase-accent` | all kept | all kept | SAME — `text-align` vs `text-color` correctly disjoint (see §4 trap) |
| 25 | `false, undefined, 'px-4', null, 'text-center'` | `px-4 text-center` | `px-4 text-center` | SAME — falsy filtering parity with current test (`classNames.test.ts:5`) |

## 4. Grouping trap found by the spike (load-bearing)

The first fixture run lumped all `text-*` into one group and dropped `text-center`
when `text-phase-accent` followed (case 24 merged to `font-bold tracking-tight
text-phase-accent`). Real tailwind-merge keeps both: `text-center` is `text-align`,
`text-phase-accent` is `text-color`, `text-sm` is `font-size` — three disjoint
groups. **Any hand-rolled merge, and any `cn`-engine / tailwind-merge config we
adopt, must preserve this three-way split or ButtonText (`ui/button/index.tsx:166`)
silently loses centering.** This is the exact class of bug a naive "dedupe by
prefix" rewrite would introduce; the fix in the fixture (dedicated `text-align`
group) models what `extendTailwindMerge` custom groups must also do for
`bg-phase-*` / `text-phase-*`.

## 5. withSkills pattern draft (no dep)

TanStack `withSkills` (verified in `2026-09-04-agent-docs-skills-qa.md:70-74`):
one-line-per-skill catalog in the system prompt + a `load_skill` tool constrained
to catalog names; full body loads on demand; repeat loads return "already loaded".
Applicable agent-side only — never in the mobile runtime. The sole in-app hit for
the whole skill surface is a comment,
`apps/gurudevi-mobile/src/boot/startupCoordinator.ts:42` (Argent/agent-device
handshake note); no `withSkills`/`load_skill` pattern exists in-app and none is
proposed — skills live at repo-root/agent level.

- Layout: `.agents/skills/` holds 82 skill dirs (counted this spike); each carries
  a `SKILL.md` with `name:` + `description:` frontmatter (verified:
  `gurudevi-quality-gate`, `playwright`, `supabase`). That frontmatter IS the
  catalog source — no hand-maintained list.
- Draft: generate `CATALOG.md` (one line per skill: `name` + first line of
  `description`) via a local script at doc-build time; agent briefings
  (`docs/agent/*`, session starters) paste the catalog, never full protocols;
  full `SKILL.md` loads only on explicit need. Generator-owns-catalog avoids the
  catalog-drift risk flagged in `2026-09-04-agent-docs-skills-qa.md:125`.
- Cost: zero runtime, zero deps, doc-side only. Tracked as follow-up, not part of
  the cn decision.

## 6. Decision pointer

Full decision in `docs/decisions/2026-09-04-cn-merge-strategy.md` (status draft):
**adopt conflict-resolving merge behind the existing `cn` import path, via
`tailwind-merge + clsx` first (mature, `extendTailwindMerge` covers `bg-phase-*`);
re-evaluate shadcn `cn` engine only after it proves identical output on cases
5/7/9/22/24 under Metro/Hermes.** Keep-naive-join is rejected (20/25 divergent
cases are live override paths in Button today). Rollout = wrapper-only change in
`packages/ui/src/utils/classNames.ts`, zero consumer edits, gated by
`verify:style-stack` (`apps/gurudevi-mobile/package.json:35`) plus an extended
`classNames.test.ts`; fully reversible by restoring the one-line join.
