---
title: "ADR: Agent Docs / Skills / QA Posture (Local-First, Constrained Healing)"
status: "accepted"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, agents, docs, qa, pilot]
---

# ADR: Agent Docs / Skills / QA Posture (Local-First, Constrained Healing) (accepted — 2026-09-04)

## Status

**Accepted (pilot)**

## Date

2026-09-04

## Context

Field signals (`../research/2026-09-04-agent-docs-skills-qa.md`) converge on a docs → skills → QA spine: Docs7 agent-readable serving + `llms.txt`, TanStack `withSkills` lazy loading, `skill-doctor` skill review, `agent_device` screenshot triplets, Detail background healing, tautology-test warning. Baseline: 82 skill dirs (`.agents/skills/`), 84 vitest files + 2 e2e specs, **0 visual-regression assertions** (`toMatchScreenshot|toHaveScreenshot` grep = 0), Playwright failure forensics only (`playwright.config.ts:49-94`).

GUARDRAILS: agent-side/workstation only. No mobile runtime dep installs. No school PII in any vendor or retained session excerpt.

## Decision

1. **Screenshot-evidence contract (adopt).** UI PRs touching `app/`, `features/`, `packages/ui` attach baseline/current/diff or recording. Informational (comment-only) first via `agent-device-control` + `playwright` + `screenshot` skills; blocking per-route once baselines + masking mature.
2. **Tautology-test lint (adopt).** Extend `check:anti-slop`: flag assertions that cannot fail for a product reason (build-output greps, re-stated class strings). Tooling flags, human decides.
3. **Skill catalog discipline (adopt, no dep).** One-line catalog (name + when-to-load) atop `.agents/skills` and `docs/agent/` briefings, mirroring `withSkills` (`load_skill`-on-demand shape); full protocols behind explicit loads. CI check against drift, not hand maintenance.
4. **Docs7-local index (pilot, no platform buy).** Generate `apps/gurudevi-mobile/docs/llms.txt` from `docs-sop.md` + `INDEX.md` (title + path + when-to-read, git-SHA pinned); log unanswered agent queries manually; convert misses to doc PRs. Docs7 pattern verified (`context7.com/docs7`, `context7.com/docs/llms.txt`, fetched 2026-09-04) — adopt the `llms.txt` half, skip hosting/analytics.
5. **skill-doctor quarterly (pilot, no dep).** Sample 5 longest + 5 failed sessions; propose evidence-linked `SKILL.md` diffs; generator-≠-verifier review. First check conversation-retention availability before committing cadence.
6. **Detail constrained pilot (defer until 1–5 live; then safe surfaces only).** Scope = verified GitHub-App agents only (Dead Code, Doc Fixes, Pass-CI — `docs.detail.dev/integrations/github`, fetched 2026-09-04). Human-merge only, never default branch. Sacred pins permanently out of scope (`react-native-gesture-handler 3.2.1`, `reanimated 4.6.0`, `worklets 0.12.1`, `mmkv 4.3.2`, `nitro-modules 0.37.1`, `@shopify/skia 2.11.2`, `typescript 7.0.2` — AGENTS.md). Metric: 30-day fix-revert rate < 10% + usefulness ≥ 3/5 or uninstall.

## Alternatives considered

- Buying Docs7 Pro / Detail full-auto — rejected for pilot: hosted analytics route school-adjacent queries off-boundary; autonomous merging conflicts with anti-slop gate (optimises merged PRs vs refused slop).
- Visual-diff blocking from day one — rejected: RN flake (fonts, Skia, shimmer, timestamps) needs informational phase first.

## Consequences

- Good: zero new runtime deps; visual QA covers what DOM assertions miss; skill tax capped as library grows past 82; docs loop without vendor lock-in.
- Bad: catalog rots without generator/CI; screenshot baselines need a device-farm home; session mining needs retention we may lack; Detail's "top 1%" picker stays unverified — our revert-rate metric is the real gate.

## Pilot gates

G3 tautology lint in gate · G5 Detail containment (pilot repos only, sacred-pin auto-close, revert dashboard, human-merge) · G6 `llms.txt` generated + query log started + skill-doctor scheduled. (Full gates in `../research/2026-09-04-pilot-agent-evidence.md` §5.)

## Implementation Evidence (2026-09-04)

- **Documentation:** 5 runbooks added in `apps/gurudevi-mobile/docs/runbooks/` (visual-qa-screenshot-checklist, play-console-hygiene-m1-m6, vitest-5-closeout-decision, pedagogy-srl-composition-points, screenmap-sling-approval-packet)
- **Zero runtime deps added**
- **TypeScript:** ✅ passes (no new mobile code)
- **Style-stack gate:** ✅ verify:style-stack passes
