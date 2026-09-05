---
title: "ADR — Visual QA Screenshot-Evidence Contract (Informational → Blocking)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, visual-qa, contract, pdpa, determinism]
---

# ADR — Visual QA Screenshot-Evidence Contract (Informational → Blocking)

Parent trial: `apps/gurudevi-mobile/docs/research/2026-09-04-trial-ci-visual.md`.
Context: `2026-09-04-agent-docs-skills-qa.md` §5.4/§6-rec-1 (agent screenshot
triplets), `2026-09-04-build-bundler-tooling.md` rec 4 (sling read-only),
catalog `2026-09-04-forage-candidate-catalog.md` §5 ("Contract first").

Today: Playwright (`playwright.config.ts:59-61`) keeps failure forensics
only; visual-regression assertion grep is 0 hits; the 2 e2e specs
(`tests/e2e/navigation.spec.ts`, `tests/e2e/web-shell.spec.ts`) assert
DOM/behavior only. No test fails if a screen renders correctly-structured
garbage. This ADR defines the contract that closes that gap without
weakening any existing gate.

## Decision (draft)

Adopt a screenshot-evidence contract for UI PRs in three phases —
informational first, blocking only per stabilized route — reusing the
`agent-device-control` + `screenshot` + `playwright` skills. No new runtime
dependency. No workflow, `eas.json`, `app.json`, or sacred-pin change is
authorized by this ADR; each phase promotion needs explicit approval.

## 1. Contract phases

### Phase 0 — Informational triplets (trial, now)

- Trigger (proposed, not yet implemented): PRs touching `app/`, `features/`,
  or `packages/ui`.
- Artifact: PR comment with baseline/current/diff triplets per touched
  screen + full-map viewer link, mirroring the @parbez artifact
  ("6 screen(s) changed, 12 new — informational, does not affect pass/fail").
- Gate effect: none. A missing or red visual artifact never fails the PR.
- Purpose: build the baseline corpus, prove determinism (§2), prove masking
  (§3), and collect the flake inventory (§4).

### Phase 1 — Per-route blocking (only after trial exit)

- Eligibility per route: (a) ≥ 3 consecutive informational runs with
  identical screen sets; (b) masks reviewed clean; (c) flake budget met
  (≤ 1 flake per 20 runs attributable to §4 sources, each with a masking or
  wait fix landed or explicitly waived).
- Gate effect: diff on an eligible route fails the PR check; new routes stay
  informational until they earn eligibility. Eligibility list lives in the
  promotion proposal, not in this ADR.
- Anti-slop guard: blocking assertions must be able to fail for a product
  reason (cf. tautology-test rule) — pixel diffs complement, never replace,
  the behavioral assertions in `navigation.spec.ts` / `web-shell.spec.ts`.

### Phase 2 — Authenticated/seeded flows (later, recipe-gated)

- Requires a proven seeded-flow recipe (demo accounts, `.screenmap/` route
  params, recorded argent flows) plus PDPA sign-off on the masking matrix.
- Until then authenticated routes are reported as unreached, never faked
  with real school fixtures.

## 2. Determinism rules

1. Pinned environment wins: same commit + same runner image + same EAS
   fingerprint ⇒ identical screen set. Any run that rebuilds the native
   binary when the fingerprint did not change is a trial defect.
2. Agent exploration is labeled: runs with an agent key record coverage mode
   (`fast` / `balanced` / `thorough`) in the comment; runs without a key are
   deterministic-by-construction (reachable routes only).
3. Repeatability proof: one repeat run per trial week; empty route-list diff
   required (see trial doc §3.3).
4. iOS-only acknowledged: Screenmap captures iOS simulator today; Android
   evidence stays on Playwright + Maestro. No ADR claim about Android
   visual parity until the vendor ships it.

## 3. PII masking matrix (PDPA)

| Surface | Treatment | Rationale |
|---|---|---|
| `/auth`, OTP / email / password fields | Always mask inputs + keyboards | Credentials must never appear in bundles |
| Student names, grades, attendance, photos | Always mask (skeleton/placeholder) | School PII; PDPA |
| Demo/seeded accounts only in flows | Real school fixtures banned in all phases | Exfiltration surface |
| Error/sync states with user content | Mask content regions, keep chrome | Diff signal without PII |
| Marketing/empty states, welcome (logged-out) | Unmasked allowed | No PII; highest blocking priority |

Storage: trial baselines as run artifacts, 14-day retention (mirrors
`browser-e2e.yml:84`); any move to a `screenmaps` branch or longer TTL needs
PDPA sign-off. Private-repo posture is artifacts-only (`publish: false`
equivalent).

## 4. Known flake sources (must be dispositioned before Phase 1)

1. **Fonts** — async font load shifts text metrics. Disposition: wait-for-font
   readiness + pinned font assets before capture; else mask text regions.
2. **Skia** — GPU/canvas raster variance across runs (celebration/brand
   surfaces). Disposition: tolerance threshold per surface or static-mode
   capture; never raise global tolerance to force green.
3. **Shimmer** — loading skeletons animate mid-capture. Disposition: capture
   at settled state (network idle + skeleton hidden) or freeze animation
   clock; shimmer frames are never baselines.
4. **Dates** — relative/absolute timestamps (cf. `auth-login-home` date diff
   in the source artifact). Disposition: freeze clock in seeded flows or mask
   date regions; calendar-sensitive routes stay informational until clock
   control is proven.
5. **Theme/locale matrix** — `navigation.spec.ts:22-55` proves theme + Sinhala
   persistence behaviorally; visual contract needs one baseline per
   theme×locale cell it blocks on, or it stays informational.

Rule: never weaken the gate to pass — no raised diff budgets, no deleted
baselines, no skipped routes without a written justification in the
promotion proposal (AGENTS.md anti-slop rules 6–7).

## 3. Consequences

- Positive: UI regressions on themed surfaces, login sheets, and feed cards
  get caught where unit + DOM tests are blind; reviewers get visual proof
  without running the app.
- Costs: macOS minutes (~10x Linux) + EAS build credits on fingerprint
  misses + agent API spend when exploration is enabled; tracked via sling
  read-only (`bill`, `usage`, `top`) during the trial.
- Risks: flake-driven review fatigue (mitigated by informational-first +
  per-route eligibility); PII in bundles (mitigated by §3 + artifacts-only
  trial posture); iOS-only blind spot for Android (mitigated by keeping
  Playwright/Maestro as the Android evidence path).

## Reversibility

Each phase is reversible independently: Phase 0 leaves zero repo state
(artifacts expire in 14 days); Phase 1 eligibility is per-route and can be
demoted to informational by removing the route from the eligibility list;
no phase edits app code, native config, or sacred pins.

## Trial exit → promotion checklist

Trial exit criteria live in the parent trial doc §6 (≥ 3 triplet PRs, zero
false-blocks, determinism repeat, spend cap evidenced by sling output,
masking clean, flake inventory + Phase-1 route nominees, explicit approval).
This ADR takes effect as `active` only when that approval lands.

---

## Screenshot-Evidence Contract Checklist (PR Author + Reviewer)

### Pre-PR (Author)
- [ ] **Scope**: PR touches `app/`, `features/`, or `packages/ui` (visual surface)
- [ ] **Device config**: Same EAS fingerprint, runner image, commit as baseline
- [ ] **Exploration mode**: Documented (`fast`/`balanced`/`thorough` or `deterministic`)
- [ ] **Masking plan**: PII surfaces identified + masking strategy per §3 matrix

### PR Artifacts (Author)
- [ ] **Triplet comment**: Baseline / Current / Diff per touched screen
- [ ] **Full-map link**: Screenmap viewer or artifact bundle URL
- [ ] **Mode label**: Coverage mode recorded in PR comment
- [ ] **Route list**: Explicit list of screens captured (new + changed + unchanged)

### Review Gate (Reviewer)
- [ ] **No false blocks**: Phase 0 — visual diff never fails CI (informational only)
- [ ] **Determinism**: Repeat run shows empty route-list diff (weekly proof)
- [ ] **Masking clean**: Auth inputs, student PII, error content masked per §3
- [ ] **Flake budget**: ≤ 1 flake / 20 runs per §4 sources (fonts, Skia, shimmer, dates, theme×locale)

### Phase 1 Promotion (Per Route — Explicit Approval Required)
- [ ] **Eligibility met**: ≥ 3 consecutive informational runs, identical screen sets
- [ ] **Masks reviewed**: Clean sign-off on masking matrix for this route
- [ ] **Flake budget met**: Documented disposition for each §4 source
- [ ] **Anti-slop guard**: Blocking assertion can fail for product reason (not tautology)
- [ ] **Approval recorded**: Explicit approval in promotion proposal (not in this ADR)

### Reversibility Confirmation
- [ ] **Phase 0**: Zero repo state, artifacts expire 14 days
- [ ] **Phase 1**: Route can be demoted by removing from eligibility list
- [ ] **No sacred pins touched**: Verified no `react-native-gesture-handler`, `reanimated`, `worklets`, `mmkv`, `nitro-modules`, `@shopify/skia`, `typescript` version changes
