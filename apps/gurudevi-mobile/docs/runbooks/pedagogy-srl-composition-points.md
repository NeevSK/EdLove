---
title: "Pedagogy SRL Template Composition Points (Content + Composition Only)"
status: "active"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [pedagogy, srl, composition, content, no-deps]
parent_research: "docs/research/2026-09-04-adopt-hygiene.md"
parent_pedagogy: "docs/research/2026-09-04-education-domain-pedagogy.md"
---

# Pedagogy SRL Template Composition Points

**Scope:** Content + composition on existing seams — **no new packages, no native changes, no schema migrations without their own ADR.**
**Gate:** PDPA / child-safety review before any share-to-community loop or parent-visible artifact.

---

## 1. Grade-9 Bridge (Content Work)

**Seam:** `packages/library/src/types/Library.ts:25-31` (grade tags) + `LibraryCollection.sequence_order` (`:75-88`)

**Action:** Every Grade 5 drill in a Scholarship collection ships paired with its successor skill.
- Memorized procedure → Explain/derive/generalize
- Uses existing `grades: number[]` tagging on content items
- Uses existing `sequence_order` on collections for ordering

**No code change.** Content authoring only.

**Deliverable:** Updated Scholarship collection JSON/content with paired drills.

---

## 2. SRL Spine — 6–8 Scaffolded Templates (Composition)

**Seam:** `packages/classroom/src/hooks/useLearningReflections.ts:17-22` (record shape) + `:94-116` (follow-up completion) + `packages/classroom/src/student/workspace.ts:198-206` (`reflection_bridge`, currently `planned`)

**Templates (Sinhala-first, rendered through existing record shape):**

| # | Template Phase | Prompt Shape | Record Field |
|---|---|---|---|
| 1 | Goal setting | "What do I want to achieve in this session?" | `goal` |
| 2 | Strategy pick | "Which strategy will I use? (retrieve / elaborate / map / teach)" | `strategy` |
| 3 | Monitoring check (mid) | "Am I on track? What's working / stuck?" | `monitoring_check` |
| 4 | Monitoring check (end) | "Did the strategy work? Evidence?" | `monitoring_check` |
| 5 | Delayed-gratification nudge | "What will I review tomorrow / in 3 days?" | `next_review` |
| 6 | Reflection synthesis | "What did I learn about how I learn?" | `synthesis` |
| 7 | Transfer prompt | "Where else could I use this strategy?" | `transfer` |
| 8 | Growth attribution | "What effort led to this progress?" | `attribution` |

**Rendering:** Through `useLearningReflections` record shape — no schema change.

**Measurement:** Strategy-use frequency (not just marks). Query `reflection_bridge` when `planned → live`.

**Gate:** `reflection_bridge` stays `planned` until templates are authored and PDPA review passes.

---

## 3. Mastered Scorer (Transparent Rule — Hidden Until Shipped)

**Seam:** `packages/library/src/types/Library.ts:449-450` (`UserJourney.status` includes `mastered` + `progress_score`) — **no scorer writes it yet** (only positional progress in `packages/library/src/api/annotations.ts:53-71`)

**Proposed Rule (candidate, not active):**
> 3 spaced retrievals correct across 7+ days → `mastered`

**Backfill Source:** Assignment/quiz events (existing event stream)

**Hard Constraint:** **Keep `mastered` OUT of user-visible UI until the scorer ships.**
- `UserJourney.status.mastered` exists in schema as aspiration
- No UI component reads `status === 'mastered'` today
- Do not surface in `BrandedEmptyState`, `SuccessGlow`, progress rings, or any user-facing element

**Activation:** Separate ADR required when scorer is implemented and backfilled.

---

## 4. Coasting Metric (One Longitudinal Signal)

**Seam:** `packages/classroom/src/hooks/useGradebook.ts:42-55` (term-scoped snapshot load) + attendance

**Definition:** One slope per student:
```
coasting_score = f(grade_trend, assignment_depth_trend, reflection_quality_trend, attendance_trend)
```
- Seeded from `useGradebook` term snapshots
- Flagged **only on post-Scholarship flattening** (not continuous dashboard)

**Output:** Single flag per student per term: `coasting: true | false`

**No dashboard.** One signal for instigator-teacher intervention.

**Gate:** PDPA review before any teacher-visible artifact.

---

## Composition Summary (Zero Deps)

| # | Workstream | Seam | Code Change? | Schema Change? | PDPA Gate? |
|---|---|---|---|---|---|
| 1 | Grade-9 Bridge | `Library.ts` grades + `sequence_order` | No (content) | No | No (internal content) |
| 2 | SRL Templates | `useLearningReflections` record + `reflection_bridge` | No (render) | No | Yes (before `planned→live`) |
| 3 | Mastered Scorer | `UserJourney.status.mastered` | No (scorer not built) | No (field exists) | Yes (before UI surface) |
| 4 | Coasting Metric | `useGradebook` snapshots + attendance | No (computed) | No | Yes (before teacher view) |

---

## Rollout Per Granovetter (Threshold-Designed)

1. **Seed:** 2–3 visible instigator teachers per school
2. **Track:** Adoption distribution (not just averages)
3. **Expand:** Only when distribution shows critical mass at seed schools
4. **Never:** Top-down mandate without distribution evidence

---

## Explicit Non-Goals (This Track)

- SDK 58 canary, `expo-paste-input`, Screenmap adoption, Nitro Fetch, TinyFish, sling, Rslib/Rolldown/Vite-8/Bazel/Starlight/unemail/Genkit
- All tracked or deferred per `docs/research/2026-09-04-forage-candidate-catalog.md`

---

## Files Referenced (No Edits)

- `packages/library/src/types/Library.ts:25-31, :33-38, :75-88, :449-450`
- `packages/classroom/src/hooks/useLearningReflections.ts:17-22, :59-71, :94-116`
- `packages/classroom/src/student/workspace.ts:142-171, :198-206`
- `packages/classroom/src/hooks/useGradebook.ts:11-17, :42-55`
- `packages/library/src/api/annotations.ts:53-71`

**No file modifications in this record.**