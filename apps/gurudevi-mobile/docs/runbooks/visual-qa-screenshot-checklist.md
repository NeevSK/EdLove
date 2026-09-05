---
title: "Visual QA Screenshot-Evidence Contract Checklist (Phase 0: Informational)"
status: "active"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [visual-qa, checklist, phase0, informational]
parent_adr: "docs/decisions/2026-09-04-visual-qa-contract.md"
---

# Visual QA Screenshot-Evidence Contract Checklist

This checklist operationalizes **Phase 0 (informational)** of the Visual QA contract.
No gate effect; a missing or red visual artifact never fails the PR.

## Trigger (Proposed, Not Yet Implemented in CI)

- [ ] PR touches `app/`, `features/`, or `packages/ui`
- [ ] PR is JS-only (no native fingerprint change)
- [ ] PR author or reviewer runs the local capture workflow (below)

## Local Capture Workflow (Agent-Driven, Zero CI Change)

### Prerequisites
- [ ] `pnpm --filter gurudevi-mobile exec expo-doctor` passes
- [ ] EAS preview build exists for the base commit (fingerprint match)
- [ ] Doppler secrets available for public env vars (`EXPO_PUBLIC_*`)

### Capture Commands (reuse `agent-device-control` + `screenshot` + `playwright` skills)

```bash
# 1. Start dev server (or use exported web dist)
pnpm --filter gurudevi-mobile exec expo start --web --port 4173

# 2. In separate terminal, capture baseline/current/diff triplets
# Using Playwright (web) + agent-device-control (native preview)
pnpm --filter gurudevi-mobile exec playwright test \
  --project="Mobile Chromium (Brave/Chrome)" \
  --config=apps/gurudevi-mobile/playwright.config.ts \
  --grep="visual"

# 3. If agent exploration enabled, record coverage mode
# fast | balanced | thorough
export SCREENMAP_COVERAGE_MODE=balanced
```

### Artifact Requirements (per ADR §35-44)
- [ ] PR comment with baseline/current/diff triplets per touched screen
- [ ] Full-map viewer link (local `.screenmap/out/` or run artifact)
- [ ] Coverage mode recorded in comment (`fast` / `balanced` / `thorough` / `none`)
- [ ] Explicit "informational, does not affect pass/fail" banner

## Determinism Verification (per ADR §2)

- [ ] Same commit re-run twice → identical screen set (empty route-list diff)
- [ ] No native rebuild triggered on fingerprint match (EAS cache hit)
- [ ] Agent key runs labeled with coverage mode; no-key runs deterministic-by-construction

## PII Masking Review (per ADR §3)

| Surface | Treatment | Verified |
|---|---|---|
| `/auth`, OTP / email / password fields | Always mask inputs + keyboards | [ ] |
| Student names, grades, attendance, photos | Always mask (skeleton/placeholder) | [ ] |
| Demo/seeded accounts only in flows | Real school fixtures banned | [ ] |
| Error/sync states with user content | Mask content regions, keep chrome | [ ] |
| Marketing/empty states, welcome (logged-out) | Unmasked allowed | [ ] |

- [ ] No unmasked PII in any posted bundle
- [ ] Bundles stored as private run artifacts (14-day retention)
- [ ] No `screenmaps` branch created during trial

## Known Flake Sources (per ADR §4) — Disposition Tracking

| Source | Disposition | Fix Landed? |
|---|---|---|
| Fonts — async load shifts text metrics | Wait-for-font + pinned assets OR mask text | [ ] |
| Skia — GPU/canvas raster variance | Per-surface tolerance OR static-mode capture | [ ] |
| Shimmer — skeletons animate mid-capture | Capture at settled state OR freeze animation clock | [ ] |
| Dates — relative/absolute timestamps | Freeze clock in seeded flows OR mask date regions | [ ] |
| Theme/locale matrix | One baseline per theme×locale cell OR stay informational | [ ] |

## Phase 0 Exit → Phase 1 Eligibility (per ADR §46-54)

A route earns Phase 1 blocking eligibility ONLY when:
- [ ] ≥ 3 consecutive informational runs with identical screen sets
- [ ] Masks reviewed clean (this checklist §PII Masking all ✅)
- [ ] Flake budget met: ≤ 1 flake per 20 runs attributable to known sources
- [ ] Each flake has a masking or wait fix landed OR explicit waiver documented
- [ ] Route added to eligibility list in promotion proposal (not in this ADR)

## Anti-Slop Guards (per AGENTS.md)

- [ ] No raised diff budgets to force green
- [ ] No deleted baselines to hide regressions
- [ ] No skipped routes without written justification in promotion proposal
- [ ] Blocking assertions must be able to fail for a product reason (tautology-test rule)

---

**Note:** This checklist is for local/agent-driven use during the trial. CI automation (Screenmap Action) is **not authorized** until all Phase 0 exit criteria are met and explicit user approval is obtained (see `docs/research/2026-09-04-trial-ci-visual.md` §6).