---
title: "Play Hygiene + Pedagogy Composition (No New Deps)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, play-console, vitest, pedagogy, hygiene]
---

# ADR: Play Hygiene Measurement + In-Stack Close-Out + Pedagogy Composition

## Decision

1. Open the Feb-2027 Play workstream as **measurement first**: read vitals
   memory × RAM bucket, bitmap p90 vs 200/200/400 MB, and per-bundle DEX %
   in Play Console on every production promote. No app-code change in this
   phase.
2. Close out the two in-stack tooling items: pin Vitest 5.x stable
   (verified 5.0.0) with an explicit coverage-provider decision, and resolve
   the ESLint flat-config helper question (adopt `compat`/`migrate-config`
   only against demonstrated friction, else close as not-needed).
3. Compose pedagogy from existing seams only — Grade-9 bridge content, SRL
   spine via `useLearningReflections` + `reflection_bridge`, one `mastered`
   scorer, one coasting metric. No new dependencies.
4. PDPA / child-safety review gates any parent/community share loop.

Research basis:
`apps/gurudevi-mobile/docs/research/2026-09-04-adopt-hygiene.md`
(parent: `2026-09-04-expo-native-evolution.md`,
`2026-09-04-build-bundler-tooling.md`,
`2026-09-04-education-domain-pedagogy.md`,
`2026-09-04-forage-candidate-catalog.md`).

## Context

Google enforces bad-behavior thresholds from **February 2027** (dynamic RSS+swap
memory, bitmap 200/200/400 MB p90, DEX ≥25% optimization) with
visibility/publishing consequences. Gurudevi ships a production `app-bundle`
(`eas.json:53-56`) with no versioned R8 config (Expo-managed, ephemeral
`android/`), bitmap usage concentrated in four `@repo/ui` `expo-image` sites,
and no OOM telemetry. Separately, the repo already sits on the Vitest 5 line
with ESLint 10, and owns pedagogy-shaped shells (reflections, growth views,
`mastered` type) with no curriculum or scorer behind them.

## Options considered

| Option | Verdict |
|---|---|
| A. Measure now, fix on signal (chosen) | Cheapest; Play Console already exposes the drill-downs; avoids speculative native work under guardrails |
| B. Pre-emptive bitmap/R8 plugin work before reading vitals | Rejected — builds shrink config no console data asks for; `withAndroidCruncherDisabled` stays commented out |
| C. Adopt Vitest/ESLint helper deps (`@vitest/istanbuljs`, `eslint/compat`) unconditionally | Rejected — helpers only on demonstrated need; record the decision either way |
| D. New pedagogy engine / adaptive SDK | Rejected — out of scope; composition on existing hooks satisfies the next step |

## Consequences

- Each production promote records M1–M6 (see research doc §2) in release notes.
- Bitmap breach triggers a scoped audit (`recyclingKey` on `CollectionCard` /
  `HeroBanner`, background eviction) via existing `expo-image` API only.
- DEX shortfall triggers a **plugin-owned** shrink-ownership proposal
  (`plugins/` + `app.json`), never an `android/` hand-edit.
- `mastered` stays out of user-visible UI until the scorer ships.
- Any OOM/share telemetry ships only after PDPA review.

## Guardrails (binding)

No `android/`/`ios/` hand-edits. No sacred version changes
(RNGH 3.2.1, Reanimated 4.6.0, Worklets 0.12.1, MMKV 4.3.2, Nitro 0.37.1,
Skia, TS 7.0.2). No `expo install --fix`. No new dependencies in this track.

## Rollout

1. Record first M1–M6 reading on the next production promote (baseline).
2. Land Vitest coverage-provider decision + ESLint helper verdict; green
   `check-types` / `lint` / `test`; `check:anti-slop` exit 0.
3. Ship SRL templates (Sinhala-first) behind `reflection_bridge`; define the
   `mastered` scorer rule; spike the coasting metric on existing snapshots.
4. Revisit only on signal: bitmap breach, DEX shortfall, or OOM trend.

## Reversibility

Fully reversible: measurement adds no code; checklist decisions are config
with commit-level revert; pedagogy work is content plus compositional code
on existing seams. No native-module or store-listing commitments made here.
