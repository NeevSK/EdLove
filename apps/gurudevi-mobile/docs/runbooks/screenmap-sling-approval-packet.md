---
title: "Screenmap + sling Trial Approval Packet (Zero Workflow Edits)"
status: "dropped"
created: 2026-09-04
updated: 2026-09-05
author: "Naveen"
scribe: "opencode"
tags: [approval, trial, screenmap, sling, visual-qa, ci]
parent_trial: "docs/research/2026-09-04-trial-ci-visual.md"
parent_adr: "docs/decisions/2026-09-04-visual-qa-contract.md"
---

# Screenmap + sling Trial Approval Packet (DROPPED)

**Status: DROPPED — 2026-09-05**

Reason: No Expo token, no iOS app, no Screenmap project ID, no Anthropic API key. Trial infrastructure cannot run.

**Action taken:**
- ❌ Removed `.github/workflows/screenmap-trial.yml`
- ❌ No secrets configured (EXPO_TOKEN, SCREENMAP_PROJECT_ID, ANTHROPIC_API_KEY)
- ✅ Visual QA contract ADR (`docs/decisions/2026-09-04-visual-qa-contract.md`) remains for future reference
- ✅ `sling` read-only telemetry still available for cost/latency monitoring

---

## Trial Scope (≥ 3 PRs)

| Criterion | Target | Evidence Required |
|---|---|---|
| Route-heavy JS-only PRs | **≥ 3** (minimum) | PR numbers + informational triplet comments |
| Native fingerprint change | **0** (excluded) | EAS build not triggered on any trial PR |
| PII fixtures | **0** (banned) | Masking review clean on every run |
| Android visual claims | **0** (out of scope) | Playwright + Maestro remain Android path |

**Eligible PR profiles:**
- Themed surfaces (brand tokens, color, motion)
- Login/auth sheets (`/welcome`, `/auth` — already in `navigation.spec.ts`)
- Feed cards, collection cards, empty states
- Marketing/logged-out routes (unmasked allowed per ADR §3)

**Ineligible (until proven):**
- PRs with native changes (new EAS build = 2× budget)
- PRs touching sacred pins
- Authenticated/seeded flows (Phase 2)
- Android-only visual regression

---

## Spend Cap (Evidence by `sling bill` / `sling usage`)

| Budget Item | Cap | Tracking |
|---|---|---|
| macOS runner minutes | **≤ 120 min** (≈ 10 runs × ~12 min) | `sling usage --window 7d` |
| EAS build credits | Fingerprint-hit rebuilds only | `sling bill` + EAS dashboard |
| Agent API (if key configured) | **$0** (trial runs without key) | `sling bill` |
| Baseline storage | 14-day artifact retention | Mirrors `browser-e2e.yml:84` |

**Cost Controls (per trial doc §3.2):**
- JS-only PRs must not trigger `eas build` (fingerprint reuse is the lever)
- Any run triggering full build counts 2× against cap
- Stop trial early if cap hit — evidenced by `sling bill` output in close-out

**Read-Only sling Commands (per trial doc §4):**
```bash
sling login           # once per workstation
sling doctor
sling whoami

sling bill                  # open-period spend + projection
sling bill history          # prior invoices (trend anchor)
sling usage --window 7d     # runner minutes + cost per repo
sling top                   # slowest/costliest workflows
sling why <run-id>          # failure classification (on red runs)
sling time <run-id>         # wall-clock decomposition
sling logs <job-id> --grep  # filtered log lines only
```

**No state-changing sling ops.** `gh` handles rerun/cancel/trigger/download.

---

## Masking Matrix (PDPA — Non-Negotiable)

Per ADR `docs/decisions/2026-09-04-visual-qa-contract.md` §3:

| Surface | Treatment | Trial Enforcement |
|---|---|---|
| `/auth`, OTP / email / password | Always mask inputs + keyboards | Review every trial run |
| Student names, grades, attendance, photos | Always mask (skeleton/placeholder) | Review every trial run |
| Demo/seeded accounts only | Real school fixtures banned | Enforced by trial design |
| Error/sync states with user content | Mask content, keep chrome | Review every trial run |
| Marketing/empty states, welcome (logged-out) | Unmasked allowed | Highest blocking priority later |

**Storage:** Trial baselines as run artifacts, **14-day retention**. No `screenmaps` branch. Private-repo posture (artifacts-only).

**Sign-off Required:** Before any workflow promotion, masking review must be clean on **every trial run** — no unmasked PII in any posted bundle.

---

## Determinism Criteria (All Must Hold)

Per trial doc §3.3:

1. [ ] Same commit re-run twice → identical screen set (route list diff empty)
2. [ ] Informational comment posts baseline/current/diff triplets per touched screen
3. [ ] No run fails the PR for visual reasons (informational phase)
4. [ ] Unreached/authenticated routes reported as unreached, not silently dropped
5. [ ] Coverage mode recorded per run (`fast` / `balanced` / `thorough` / `none`)

---

## Flake Inventory + Phase-1 Nominees (Close-Out Deliverable)

Per trial doc §6.5:

| Flake Source | Observed? | Disposition | Fix Landed? | Phase-1 Route Nominee? |
|---|---|---|---|---|
| Fonts (async load) | [ ] | [ ] | [ ] | [ ] |
| Skia (GPU variance) | [ ] | [ ] | [ ] | [ ] |
| Shimmer (animation) | [ ] | [ ] | [ ] | [ ] |
| Dates (timestamps) | [ ] | [ ] | [ ] | [ ] |
| Theme/locale matrix | [ ] | [ ] | [ ] | [ ] |

**Phase-1 Route Nominees** (only after trial exit):
- Route: `/welcome` — mask status: [ ]
- Route: `/auth` — mask status: [ ]
- Route: `/collections/:id` — mask status: [ ]
- Route: `/library` — mask status: [ ]
- Other: _______________

---

## Exit Criteria Checklist (All Must Pass for Promotion Proposal)

Per trial doc §6:

- [ ] **≥ 3 route-heavy JS-only PRs** each received informational triplet comment with **zero false-block**
- [ ] **Determinism criteria** held on at least one repeat run
- [ ] **EAS/macOS spend** stayed within cap, evidenced by `sling bill` / `sling usage` output
- [ ] **Auth-screen masking** reviewed clean on every trial run (no unmasked PII)
- [ ] **Close-out note** records flake sources observed + Phase-1 route nominees (or no-go with reasons)
- [ ] **Explicit user approval** obtained before any:
  - `.github/workflows/screenmap-*.yml`
  - `eas.json` profile changes
  - `app.json` changes
  - Sacred-pin changes

---

## Required Secrets (Configure Before First Run)

| Secret | Source | Required For |
|--------|--------|--------------|
| `EXPO_TOKEN` | Expo account > Access Tokens | EAS fingerprint reuse, Screenmap Action auth |
| `SCREENMAP_PROJECT_ID` | screenmap.dev dashboard > Project Settings | Screenmap Action project linkage |
| `ANTHROPIC_API_KEY` | **NOT CONFIGURED** — trial runs without agent key | Optional: agent exploration (trial = OFF) |

**Configure in:** GitHub repo > Settings > Secrets and variables > Actions > New repository secret

---

## What This Packet DOES Authorize (Trial Activities)

- ✅ Local/agent-driven screenshot capture using `agent-device-control` + `screenshot` + `playwright` skills
- ✅ Manual Screenmap Action runs on approved PRs (via `workflow_dispatch` equivalent, **after per-PR approval**)
- ✅ `sling` read-only commands for cost/latency telemetry
- ✅ Documentation of results in runbooks + close-out note
- ✅ Masking review on trial artifacts

---

## Approval Signature

| Role | Name | Date | Approve? |
|---|---|---|---|
| Platform Lead | | | [ ] Yes / [ ] No |
| Security/PDPA | | | [ ] Yes / [ ] No |
| Mobile Engineer | | | [ ] Yes / [ ] No |

**Next Step:** Upon approval, trial begins with first eligible PR. Close-out note targets 4 weeks or spend cap, whichever comes first.