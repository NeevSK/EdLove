---
title: "OSS Pattern Integration Plan — CBT & Reader Patterns from quirk and ReadAny"
status: "active"
created: 2026-08-27
updated: 2026-08-27
author: "Naveen"
scribe: "opencode"
tags: [self, classroom, library, cbt, reader, integration, priorities, plan]
---

# OSS Pattern Integration Plan — quirk (CBT) & ReadAny (Reader) → Gurudevi

> Strategy and priorities for studying two GPL-3.0 reference apps and building our own
> MIT-clean implementations. **Legal posture:** clean-room, study-don't-copy.
> See root ADR `docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md`.

## 1. Where each pattern lands

| Pattern | Source | Target domain | Destination feature(s) |
|---|---|---|---|
| Structured reflection exercise (wizard) | quirk thought record | `@repo/self` | **Reframe** — guided thought record (P0) |
| Thinking-trap awareness | quirk distortion list | `@repo/self` + `@repo/classroom` | Trap catalog → learning traps in Reframe; later assignment reflection |
| Follow-up / spaced review | quirk follow-up | `@repo/self` (+ later classroom) | Reframe follow-up scheduling |
| Check-in rhythm | quirk checkups | `@repo/self` | Already covered by `daily_pulse` / `mood_checkin` — no new work |
| Micro-lesson content rendering | quirk articles | — | **Already solved** via `react-native-enriched-markdown` (swm). No adoption. |
| Reader + annotation model | ReadAny reader/highlights | `@repo/library` + `@repo/classroom` | Highlights/notes/tags on lessons & library docs (P2) |
| Reading progress & analytics | ReadAny stats | `@repo/library` | Time-on-task, completion, streak (P2) |
| EPUB/PDF ingestion | ReadAny foliate-js / pdfjs | `@repo/library` | Textbook/curriculum ingestion (P2, uses existing PDFViewer) |
| RAG over corpus | ReadAny rag | `@repo/library` + `@repo/ai` | "Ask my textbook" semantic search (P3) |
| TTS queue | ReadAny tts | `@repo/library` | Read-aloud accessibility (P3) |
| Multi-backend sync | ReadAny sync | `@repo/core` | Self-host edge (WebDAV/S3) — only if school demand (P3) |
| Knowledge graph / concept map | ReadAny notes | `@repo/library` | Concept maps (P3, downstream) |

## 2. Priorities (decided)

### P0 — Reframe in `@repo/self` (direct CBT feature)

A first-class Self feature: a structured, guided thought record that helps a user notice
an automatic thought, name the feeling, spot the thinking trap, weigh evidence, and
reframe — with a before/after check and an optional follow-up reminder.

- **Feature id:** `reframe`
- **Registry:** brand id `SELF_FEATURE_IDS.reframe`, reflection domain, category `practice`
- **Surfaces:** native + web (Self canvas via `FEATURE_CATALOG` + `SelfFeatureRenderer`)
- **Data:** local-first `thought_records` table (PowerSync/drizzle) with mutation-queue
  outbox, mirroring `wellbeingRepository` (mood logs) exactly.
- **Analytics:** posthoc events `self.reframe.recorded`, `.feltReframed`, `.trapSelected(slug)`,
  `.followUpScheduled` — privacy-safe aggregates only.

Worktrack:
1. Domain types + thinking-trap catalog + unit tests — **done 2026-08-27**

   Landing files: `packages/self/src/types/thoughtRecord.ts`,
   `packages/self/src/constants/trapCatalog.ts` (+`trapCatalog.test.ts`).
   Verified: vitest 6/6 new tests pass; biome clean; types clean (package-level
   `check-types` still has two pre-existing WIP errors in the in-progress
   SelfCanvas refactor — unrelated to Reframe).
2. Local-first repository + `useThoughtRecords` hook — **done 2026-08-27**

   `packages/self/src/api/thoughtRecordRepository.ts` (SQLite insert + outbox
   mutation `saveThoughtRecord`/`completeThoughtRecordFollowUp` + RPC fallback,
   wire⇄domain mapping), `packages/self/src/hooks/useThoughtRecords.ts`,
   `packages/self/src/logic/reframe.ts` (+8 tests), barrels exported.
   Reframe growth signals `reframe_recorded` / `reframe_follow_up_completed`
   added to `growthSignals.schema.json` and emitted by `selfAPI`.
3. DB schema table + registry/feature-catalog wiring — **done 2026-08-27**

   `ThoughtRecord` model in `schema.zmodel` (+ `User` back-relation, migrated
   `add_thought_records.sql`); RPC routes `self.contract.ts` + orpc handlers in
   `apps/sanctuary-api/src/core/handlers/self.ts`; PowerSync `thoughtRecords`
   table + `LOCAL_ONLY_TABLES`; `selfRegistry.ts` `SELF_FEATURE_IDS.reframe`
   (+ emoji + discovery) under the reflection domain; connected to the app via
   `FeatureRegistry.tsx`. Verified: `tsc -b` clean for schema/core/self/
   sanctuary-api; biome clean.
4. Reframe wizard components (native + web) — **done 2026-08-27**

   `packages/self/src/components/ReframeWizard.tsx` (single cross-platform file:
   checkup → thought → feeling → traps → evidence → reframe → recheck, mood
   delta, follow-up scheduling, due re-check list) registered in
   `FEATURE_COMPONENT_MAP`. Verified: types clean; self vitest 25/25.
   NB: repo-wide `pnpm exec tsc --build` currently also compiles root
   `scripts/*` (pre-existing broken TS in four script files) — per-package
   verification uses `tsc -b <package>` instead.

4b. i18n: device-language detection + reframe localization — **done 2026-08-27**

   `expo-localization` (SDK-57-pinned, already in deps + `app.json` plugin) is now
   actually consumed: `apps/gurudevi-mobile/src/i18n/config.ts` derives `lng` from
   `getLocales()[0].languageCode` (si/ta/en, falls back to en). Because
   `@repo/core` runs a second i18n instance and cannot take a new dep yet,
   `packages/core/src/logic/i18n/language.ts` adds a dependency-free
   `detectLanguageCode()` (Hermes/`Intl.resolvedOptions().locale`) used by the core
   config — the supported list is shared via `SUPPORTED_LNGS`. Reframe UI strings
   moved from inline literals in `ReframeWizard.tsx` to a `reframe.*` namespace
   added to en/si/ta in both app and core locale files. Trap-catalog content stays
   English data (follow-up: translate). Verified: `i18n:check` (key audit +
   no-inline-fallbacks), `tsc -b` (core/self/sanctuary-api), self vitest 25/25,
   biome clean. Translations are agent-authored — native-speaker review before
   ship.

### P1 — Same guided-exercise pattern in `@repo/classroom` (learning studio)

Reuse the P0 engine for academic reflection: a student spies an automatic thought about
a grade/feedback, identifies a **learning trap** (subset of the same catalog; e.g.
`fixed-mindset`, `academic-catastrophizing`, `procrastination-forecasting`,
`surface-learning`), challenges it, and reframes into a next-step commitment.

- If the exercise engine is shared with `@repo/self`, extract to `@repo/core` logic and
  consume from both packages (one guided-exercise engine; two catalogs).
- Landing surface: student workspace (`learning-studio`), assignment detail, and grade
  reflections.

**P1a slice (done 2026-08-27) — Grade-reflection surface:**

Decision: the reframe engine moves to `@repo/core/logic/reflection` (Phase 1 of
[docs/current_progress/2026-08-27-guided-reflection-engine-extraction-proposal.md](../../../current_progress/2026-08-27-guided-reflection-engine-extraction-proposal.md)
— **APPROVED and IMPLEMENTED 2026-08-27**). Pure engine (types, reframe logic,
catalog helpers) lives in core; `TRAP_CATALOG` data stays self-owned in
`packages/self/src/constants/trapCatalog.ts` as thin wrappers; `@repo/classroom`
consumes the same engine for Learning Reflections with its own catalog.

**Phase 2 (persistence port)** — **APPROVED and IMPLEMENTED 2026-08-27** per the
same proposal. Core `reflection/records.ts` now owns the local-first store
factory (`createThoughtRecordStore`) with injected RPC port, generic codec, and
injectable DB; pure mapping functions moved verbatim from self. Self
`thoughtRecordRepository.ts` shrinks to a composition root wiring core store +
`selfAPI` (behavior identical, same `thoughtRecords` table, wellbeing scope).
Classroom gets `learningReflectionRepository.ts` + `useLearningReflections` hook
+ new `learning_reflections` table (separate from `thoughtRecords` per approval)
with classroom/assignment context, separate outbox scope `classroom`.
`ReframeWizard` accepts optional `persistence` override → classroom passes its
own store; self default unchanged. Server contract `learningReflectionsContract`
+ handler `learningReflectionsRouter` mounted in sanctuary-api. ZModel
`LearningReflection` + migration + zenstack generate (clean additive diff).

- `packages/classroom/src/screens/LearningReflectionScreen.tsx` — wrapper screen that
  composes the context header (optional classroom) + `ReframeWizard` (from
  `@repo/self/components/ReframeWizard`) + "your reframe is your next-step" note.
  No edits to `@repo/self`; the wizard already surfaces the six learning-slope traps.
- Gradebook tab (`StudentClassroomDashboard`) upgraded from the `My Grade
  Performance` placeholder to `StudentGradesOverview` + a "Reflect on a grade"
  action routing to the new screen.
- Route `app/(tabs)/workspace/classroom/reflect` registered in workspace stack.
- `learningReflection.*` keys added to en/si/ta in app + core locales (agent-authored
  si/ta — native review before ship).
- Not in this slice: learning-studio quick action, assignment-detail entry,
  engine extraction to core (`RED`, needs proposal).

### P2 — Reader + annotations in `@repo/library` and `@repo/classroom`

Unified highlight/note/tag model over lesson materials, PDFs, and library documents;
reading progress + completion; export study guides. Reuses existing `DocumentViewerScreen`
/ `PDFViewerScreen` and the library resource tables.

### P3 — Downstream (only after the direct features)

- Curriculum RAG ("ask my textbook") via `@repo/ai` + local embeddings (`@huggingface/transformers`)
  + SQLite vector store — verify dep licenses first.
- TTS accessibility queue.
- Knowledge graph / concept maps.
- Multi-backend sync (WebDAV/S3) edge-case self-host.

## 3. Dependencies (evaluate at each track, license-checked)

| Purpose | Candidate | License check? | When |
|---|---|---|---|
| Vector store / cosine search in SQLite | `sqlite-vec` | ✅ before adoption | P3 |
| Local embeddings | `@huggingface/transformers` | ✅ before adoption | P3 |
| EPUB parse | `foliate-js` (or upstream) | ✅ before adoption | P2 |
| WebDAV client | `webdav` | ✅ before adoption | P3 |
| TTS | `expo-speech` (already present) | n/a | P3 |

Rule: never add a dependency without recording its license in the dependency catalog;
never add a GPL dep without explicit consent.

## 4. Verification per track

- `pnpm --filter @repo/self check-types`, `. test`, `. lint` (and the equivalent filter
  for the touched package) must pass with **more** assertions, never looser ones.
- New domain code follows `AGENTS.md` slop rules: no `any`, types over assertions,
  no restating comments, no dead abstractions, no duplicate helpers (search
  `@repo/core` first).
- `bin/check:anti-slop` on the branch before merge; note inherited findings, don't
  suppress.

## References

- Licensing: `docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md`
- Self feature architecture: `packages/self/src/constants/selfRegistry.ts`,
  `packages/self/src/features/featureCatalog.ts`, `packages/self/src/types/Wellbeing.ts`,
  `packages/self/src/api/wellbeingRepository.ts`, `packages/self/src/hooks/useMoodLogs.ts`
- Student workspace boundary rules: `docs/architecture/STUDENT_WORKSPACE_FEATURE_INVENTORY.md`
- Reference apps (study only, GPL-3.0): `Flaque/quirk`, `codedogQBY/ReadAny`