---
title: "Adopt Hygiene: Play Thresholds Measurement, Vitest 5 Close-Out, Pedagogy Composition"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, play-console, vitest, pedagogy, hygiene]
---

# Adopt Hygiene: Measurement + In-Stack Close-Out (No New Deps)

Senior adopt-track for Gurudevi mobile. Measurement and composition only — no new
dependencies, no `android/`/`ios/` hand-edits (plugin-owned config only), no sacred
version changes.

Parent sources (all in `apps/gurudevi-mobile/docs/research/`):

- `2026-09-04-expo-native-evolution.md` — Play bad-behavior thresholds Feb 2027
  (RSS+swap, bitmap 200/200/400 MB p90, DEX ≥25%), SDK 57 hold.
- `2026-09-04-build-bundler-tooling.md` — Vitest 5 line, ESLint 10 helpers.
- `2026-09-04-education-domain-pedagogy.md` — Grade 5→9 bridge, SRL spine,
  `mastered` scorer, coasting metric.
- `2026-09-04-forage-candidate-catalog.md` — verdict rollup (measure / close out
  in-stack / defer rest).

## 1. Verified baseline (2026-09-04)

### Release config

- `apps/gurudevi-mobile/eas.json:27-43` — preview profile: internal APK,
  `NODE_ENV=production`, image `ubuntu-26.04-jdk-17-ndk-r27b-sdk-57`.
- `apps/gurudevi-mobile/eas.json:44-58` — production profile: `app-bundle`,
  `autoIncrement: true`, same build image. Correct artifact for Play
  per-bundle DEX insights.
- `apps/gurudevi-mobile/app.json:15-17` — package `org.edlove.gurudevi`,
  `versionCode: 24`.
- `apps/gurudevi-mobile/app.json:124-131` — `expo-build-properties`,
  `android.minSdkVersion: 28`, empty `extraMavenRepos`.
- `apps/gurudevi-mobile/app.json:87-91` — plugins `./plugins/withNdkVersion`,
  `./plugins/withGradleProperties`; `withAndroidCruncherDisabled` stays
  commented out — do not touch without an ADR.

### Bitmap surface (`expo-image`)

- Dep: `apps/gurudevi-mobile/package.json:148` `expo-image: ~57.0.4`;
  plugin: `apps/gurudevi-mobile/app.json:110`.
- Usage sites (all in `@repo/ui`, none in `apps/gurudevi-mobile/src`):
  `packages/ui/src/components/CollectionCard.tsx:18` (`contentFit="cover"` +
  `cachePolicy`, `:73-74`), `packages/ui/src/components/HeroBanner.tsx:5`
  (`:49-54`), `packages/ui/src/components/FireflyMascot.tsx:4` (`:94-95`),
  `packages/ui/src/components/UserAvatar.tsx:5`
  (`contentFit="cover"` + `cachePolicy` + `recyclingKey={avatarUrl}`, `:69-73`).
- Spec aligns: `docs/Library/gurudevi-library-ui-spec.md:603-606`
  (always expo-image, `contentFit="cover"`, `recyclingKey` on FlashList).
- Audit gap: `CollectionCard` and `HeroBanner` have no `recyclingKey`
  (only `UserAvatar` sets one). Background/cached-state retention policy
  is not evidenced in code — Play Console bitmap drill-down is the source
  of truth until an explicit eviction pass lands.

### Vitest vs stable

- Declared: `apps/gurudevi-mobile/package.json:291` `vitest: ^5.0.0`.
- Installed: `apps/gurudevi-mobile/node_modules/vitest` resolves to **5.0.0**
  (stable, post-RC). Vitest 5.0 requires Vite ≥ 6.4 / Node ≥ 22.12 —
  satisfied (`eas.json` pins Node 22.23.2).
- Coverage fork **not in use**: no `@vitest/istanbuljs` or
  `@vitest/coverage-*` dep; `vitest.config.mts` configures no coverage
  provider. Either pin the fork provider explicitly or record the decision
  to stay on defaults — see checklist §3.
- Config notes: `apps/gurudevi-mobile/vitest.config.mts` uses Vite 8
  `tsconfigPaths: true` (no extra plugin), `include:
  src/__tests__/**/*.{test,spec}.{ts,tsx}` with architecture-suite
  exclusions (`:32-40`).

### DEX / R8 posture

- No `minifyEnabled` / `shrinkResources` / ProGuard config exists in any
  versioned file (grep across repo: only unrelated `R8`-substring hits in
  hashes/skill docs). Release shrink lives in ephemeral `android/`
  (gitignored) — expected under Expo managed workflow.
- Consequence: DEX optimization % can today only be confirmed via
  **Play Console per-bundle insights**, not via repo grep. If shrink
  ownership ever needs to be explicit, it must be a config plugin under
  `apps/gurudevi-mobile/plugins/` (see `plugins/lib/buildGradleBlock.js:36`
  helper) wired through `app.json` — never a hand-edit.

### OOM telemetry

- None exists. `apps/gurudevi-mobile/src/lib/globalErrorHandlers.ts:29,45`
  routes fatal errors to `Sentry.captureException`; breadcrumbs via
  `@repo/core/monitoring/breadcrumbs`
  (`src/hooks/useJourneyStep.ts:2`). No memory-pressure listener, no
  OOM breadcrumb, no anonymized RSS/bitmap gauge. Play Console OOM-kill
  crash filter is the interim signal.

### Pedagogy composition points (verified)

- `packages/classroom/src/hooks/useGradebook.ts:11-17` —
  `GradeMarkLifecycleContext` (school/cycle/class/term/subject); term-scoped
  snapshot load at `:42-55`. Composition seam: cross-term slope reader,
  not a schema change.
- `packages/classroom/src/hooks/useLearningReflections.ts:17-22` —
  local-first reflections mirroring thought records; cache key
  `:59-71`; follow-up completion `:94-116`. Composition seam: SRL prompt
  templates rendered through the existing record shape.
- `packages/classroom/src/student/workspace.ts:142-171` — `growth_goals`
  (live), `rewards_pulse` (live), `growth_progress` (live view shell);
  `reflection_bridge` at `:198-206` is `planned` — the SRL-spine seam.
- `packages/library/src/types/Library.ts:25-31` — grade-tagged content
  (`grades: number[]`, trilingual titles `:33-38`); `Library.ts:75-88`
  collections carry `grades` + `sequence_order`.
- `packages/library/src/types/Library.ts:449-450` — `UserJourney.status`
  includes `mastered` + `progress_score`, but no scorer writes it
  (only positional progress in `packages/library/src/api/annotations.ts:53-71`).
  Schema aspiration, not a loop — do not surface until a scorer exists.

## 2. Play hygiene measurement plan

Enforcement: **February 2027**. Consequence is reduced visibility + publishing
restrictions, not removal. All reads happen in Play Console; no app-code change
required for the measure phase.

| # | Signal | Threshold (p90) | How to read | Pass bar |
|---|---|---|---|---|
| M1 | Dynamic memory (anon RSS + swap) | Per app/game × RAM-tier × process-state bad-behavior cut | Android vitals → memory → percentile × RAM-bucket drill-down, internal track first | Below cut on all RAM tiers × states for 28d |
| M2 | Bitmap memory, user-perceived | 200 MB | Same drill-down, foreground/user-perceived slice | p90 < 200 MB |
| M3 | Bitmap memory, background | 200 MB | Background slice | p90 < 200 MB |
| M4 | Bitmap memory, cached | 400 MB | Cached slice | p90 < 400 MB |
| M5 | DEX optimization coverage | ≥25% (opt/shrink/obfuscate, e.g. R8); applies >10 MB DEX | Play Console per-bundle DEX insights on the production `app-bundle` (`eas.json:53-56`) | ≥25% on every production bundle |
| M6 | OOM-kill crash rate | Trend (no fixed cut published) | Play Console OOM-kill crash filter + Sentry `captureException` volume (`globalErrorHandlers.ts:29`) | Flat-to-down across 2 releases |

Cadence: read M1–M6 on each production promote; record in the release notes
table (see ADR §Rollout). If any bitmap slice breaches, the bitmap-lifecycle
audit fires (add `recyclingKey` to `CollectionCard`/`HeroBanner`, evict cached
images on backgrounding) — implementation behind the existing `expo-image`
API, no new dep.

Anonymized OOM telemetry (when built, not now): one Sentry breadcrumb on
low-memory warning + coarse bucket only (RAM tier, process state) — never
heap dumps, never user content. PDPA review before shipping any device-signal
telemetry.

## 3. Vitest 5 + ESLint helper close-out checklist

- [ ] `pnpm --filter gurudevi-mobile exec vitest --version` prints 5.x stable
  (done 2026-09-04: **5.0.0**).
- [ ] Coverage provider decision recorded: adopt `@vitest/istanbuljs` fork
  (Vitest 5 default path) or document staying on current no-coverage config
  in `vitest.config.mts`. No silent drift.
- [ ] `vitest.config.mts` architecture exclusions (`:32-40`) re-justified or
  removed — each exclusion names the owning suite.
- [ ] ESLint: `eslint ^10.9.1` + `eslint-config-expo ~57.0.2` confirmed;
  evaluate `eslint/compat v2.1.1` / `migrate-config v3.0.3` **only** against
  remaining flat-config friction in `eslint.config.mjs`. If no friction
  found, close with "not needed" and move on.
- [ ] `pnpm --filter gurudevi-mobile run check-types && pnpm --filter
  gurudevi-mobile run lint && pnpm --filter gurudevi-mobile test`
  all green on the close-out commit.
- [ ] Anti-slop gate: `pnpm run check:anti-slop` exit 0 on the branch.

## 4. Pedagogy composition (content + composition, zero deps)

All four are content/composition on existing seams — no new packages, no
native changes, no schema migrations without their own ADR.

1. **Grade-9 bridge** — every Grade 5 drill in a Scholarship collection ships
   paired with its successor skill (memorized procedure →
   explain/derive/generalize). Uses `Library.ts:25-31` grade tags +
   `LibraryCollection.sequence_order` (`:75-88`). Content work, not code.
2. **SRL spine** — 6–8 scaffolded Sinhala-first templates (goal → strategy
   pick → monitoring check → delayed-gratification nudge) rendered through
   `useLearningReflections` record shape (`:17-22`, `:94-116`) and surfaced
   via `reflection_bridge` (`workspace.ts:198-206`, currently `planned`).
   Measure strategy-use, not just marks.
3. **Mastered scorer** — one transparent rule (e.g. 3 spaced retrievals
   correct across 7+ days → `mastered`) backfilled from assignment/quiz
   events before new content. Until the scorer ships, keep `mastered`
   (`Library.ts:449-450`) out of user-visible UI.
4. **Coasting metric** — one longitudinal slope per student (grades +
   assignment depth + reflection quality across terms, seeded from
   `useGradebook.ts:42-55` snapshots + attendance), flagged only on
   post-Scholarship flattening. One signal, not a dashboard.

Gating: **PDPA / child-safety review before any share-to-Facebook/community
loop** or parent-visible artifact (§7 of pedagogy doc). Threshold-designed
rollout per Granovetter: seed 2–3 visible instigator teachers per school,
track the adoption distribution, never just averages.

## 5. Explicit non-goals (this track)

SDK 58 canary, `expo-paste-input`, Screenmap adoption, Nitro Fetch, TinyFish,
sling, Rslib/Rolldown/Vite-8/Bazel/Starlight/unemail/Genkit — all tracked or
deferred per the catalog doc. None enters this measurement/close-out scope.
