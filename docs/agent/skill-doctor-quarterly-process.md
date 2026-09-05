---
title: "Skill-Doctor Quarterly Process Note"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [process, agents, skills, quality, quarterly]
---

# Skill-Doctor Quarterly Process Note

> **No runtime deps.** Agent-workstation only. No school PII in retained excerpts.
> First run: confirm conversation-retention availability (opencode history) before committing cadence.

## Purpose

Systematically improve the `.agents/skills/` library by mining real agent sessions for gaps between skill intent and execution reality. Generates evidence-linked `SKILL.md` diffs, reviewed under generator≠verifier discipline.

## Cadence

Quarterly (Mar / Jun / Sep / Dec), manual trigger.

## Inputs (per cycle)

1. **5 longest sessions** by token/turn count — where context tax is highest
2. **5 failed sessions** — where agent gave up, looped, or produced wrong outcome
3. **Conversation retention check** — opencode history must have ≥ 90-day window with full context

## Process

### 1. Session Selection (15 min)

```bash
# opencode: list recent sessions with duration/turns/outcome
opencode session list --last 90d --format json > /tmp/sessions.json
# Pick 5 longest + 5 failed (outcome != success)
```

### 2. Gap Mapping (45 min)

For each session:
- **Session ID** (opencode hash)
- **Observed waste**: redundant reads, wrong tool, missed skill, hallucinated API, re-reading same file
- **Skill implicated**: which `SKILL.md` should have prevented this
- **Root cause**: missing when-to-load, outdated protocol, wrong example, absent anti-pattern

### 3. Diff Proposal (30 min)

Produce one consolidated PR with `SKILL.md` edits:

```markdown
## Skill-Doctor Q3-2026 Diffs

### gurudevi-quality-gate
**Session**: `abc123` (47 turns, timeout)
**Waste**: Agent re-read AGENTS.md 3× instead of loading skill
**Fix**: Add `when-to-load` anchor: "Load FIRST when editing apps/gurudevi-mobile/**"
**Diff**: `SKILL.md:12-15` — prepend load priority

### playwright
**Session**: `def456` (failed — wrong selector)
**Waste**: Used `page.locator('button')` instead of `getByRole`
**Fix**: Add anti-pattern: "Never use generic CSS selectors; prefer getByRole/getByLabel"
**Diff**: `SKILL.md:88-92` — new anti-pattern section
```

### 4. Generator≠Verifier Review (Required)

- **Author** (this process) proposes diffs
- **Reviewer** (different session/context) validates: does the edit actually prevent the observed waste?
- No rubber-stamp by authoring session.

### 5. PII Scrub

Before committing:
- Replace school names → "Gurudevi School"
- Replace student names → "Student A"
- Replace IDs → "CLASS-XXX", "STU-XXX"
- Remove coordinates, timestamps, exact error messages with PII

## Output

- PR to `.agents/skills/` with evidence-linked diffs
- Updated `CATALOG.md` (auto-regenerated)
- Session log entry in `docs/agent/skill-doctor-log.md` (append-only)

## Metrics (Track Quarterly)

| Metric | Target |
|--------|--------|
| Sessions sampled | 10 (5 long + 5 failed) |
| Skills touched per cycle | ≤ 5 (focus) |
| Diffs proposed | ≤ 10 |
| Diffs merged | ≥ 80% |
| Regressions in next cycle | 0 for touched skills |

## Kill Switch

If conversation retention < 90 days or opencode history unavailable → pause until resolved. Do not fabricate sessions.

## First Run Checklist

- [ ] Confirm opencode retains ≥ 90 days of full session context
- [ ] Run selection on last 90 days
- [ ] Produce first diff PR
- [ ] Schedule next quarterly (calendar invite + automation reminder)
- [ ] Document retention policy in this file

---

*Next scheduled: 2026-12-01 | Owner: Naveen | Reviewer: (rotate)*