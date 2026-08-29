# PROPOSAL: Shared Guided-Reflection Engine in `packages/core/src/logic`

status: **proposed — awaiting approval**
created: 2026-08-27
author: "Naveen" · scribe: "opencode"
blast zone: **RED** (`packages/core/src/logic`) + AMBER (`packages/self/src`)
references:
- `docs/current_progress/2026-08-27-oss-pattern-integration-plan.md` (P1 requires "one guided-exercise engine; two catalogs")
- `docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md`
- P1a decision note (same plan doc): engine currently imported wholesale by `@repo/classroom`

---

## 1. Why

P1 requires a **shared engine** that `@repo/self` (Reframe / wellbeing) and
`@repo/classroom` (Learning Reflection) both consume. Today the engine is a
single 642-line component (`ReframeWizard.tsx`) in `@repo/self`, so classroom
imports a whole *feature UI component* from a sibling domain
(`@repo/self/components/ReframeWizard`). That works (built + verified in P1a)
but binds classroom to self's presentation. The plan doc's stated end-state is
one engine, two catalogs, with the engine at `core/logic`.

This proposal extracts the **pure, UI/domain-agnostic 80%** of the engine into
`packages/core/src/logic/reflection/` so both packages call the same typed core
and supply their own catalog content, persistence, and chrome.

## 2. Current ownership (what the engine actually is)

| Layer | File | Generic? | Depends on |
|---|---|---|---|
| Types | `packages/self/src/types/thoughtRecord.ts` | ✅ yes (CBT-shaped) | nothing |
| Pure logic | `packages/self/src/logic/reframe.ts` (26 ln) | ✅ yes | only self types |
| Catalog helpers | `packages/self/src/constants/trapCatalog.ts` (helpers only) | ✅ yes | only self types |
| Catalog content | same file, `TRAP_CATALOG` (18 traps, 10 general + 8 learning) | ❌ authored content | types |
| Persistence (repo) | `packages/self/src/api/thoughtRecordRepository.ts` | ⚠️ mostly | core schema/table, `@repo/core` queue, `selfAPI` RPC, react-native |
| Runtime hook | `packages/self/src/hooks/useThoughtRecords.ts` | ⚠️ mostly | core store, SafeZustandStorage, self repo, authAPI |
| UI | `packages/self/src/components/ReframeWizard.tsx` (642 ln) | ❌ feature UI | ui kit, core (usePermissions), engine pieces, i18n |

Core **already owns** the storage contract: the `thoughtRecords` SQLite table
(`packages/core/src/adapters/powersync/schema.ts`) and the snake_case wire type
(`packages/core/src/logic/schemas/self.schema.ts`). So the table + wire
boundary is core's; the domain shape and logic are duplicating themselves in
self only because they never moved.

## 3. Proposal — Phase 1 (pure engine to core, behavior-identical)

New directory `packages/core/src/logic/reflection/`:

```
reflection/
  types.ts     ← move domain types from self/types/thoughtRecord.ts verbatim
                (ThinkingTrap, TrapSlope, ThinkingTrapEmotion set, ReframeOutcome,
                 ReframeFollowUp, ThoughtRecord, ThoughtRecordDraft)
  reframe.ts   ← move deriveReframeOutcome, isFollowUpDue verbatim
  catalog.ts   ← move generic helpers getTrapById, getTrapsBySlope, resolveTraps,
                 customTrapIsLearning — they operate on a ThinkingTrap[] argument
  index.ts     ← barrel, wired into packages/core exports (logic/reflection)
```

- **Catalogs are a parameter, not a core import** — `catalog.ts` helpers take a
  `ThinkingTrap[]` (the content array stays owned by each domain). `@repo/self`
  keeps `TRAP_CATALOG` as authored data.
- Names stay `Reframe*` / `ThoughtRecord` (no rename — minimal churn; the terms
  are already domain-neutral enough for the second surface).
- **No dependency adds**: the moved code imports only core types/nothing.
  `core` must not gain imports of `self`/`ui` (depcruise direction rules).
- Clean-room attribution comments move with the code (unchanged).

Self-side moves (AMBER):
- `packages/self/src/logic/reframe.ts` → **delete**; update importers
  (`ReframeWizard.tsx`, `thoughtRecordRepository.ts`, `reframe.test.ts`).
- `reframe.test.ts` + the catalog-helper test → **move verbatim** to
  `packages/core/src/logic/reflection/__tests__/` (assertions unchanged — no
  weakening).
- `constants/trapCatalog.ts` → keeps `TRAP_CATALOG` data and the trap-id
  index; its three exported helpers become re-exports of core
  (`@repo/self/constants/trapCatalog` subpath preserved for current consumers).
- `types/` barrel re-exports core reflection types; keep `@repo/self/types`
  subpath working (existing consumers untouched).

NOT in Phase 1:
- No schema, table, or wire change. No migration. No i18n change
  (`reframe.*`/`learningReflection.*` keys untouched).
- No behavior change: pure module moves with identical signatures.

Phase 2 (deferred, separate proposal): persistence port —
generalize `thoughtRecordRepository` mapping into core
`reflection/records.ts` behind an injected RPC port (pattern exists:
`core/logic/ports/*`) so classroom shares the local-first path
(SQLite → outbox → RPC fallback) without importing `selfAPI`.
Requires classroom confirmation it should write the same
`thoughtRecords` table (it should — same wire, same outbox scope).

Phase 3 (not planned): do **not** move `ReframeWizard` UI to core/ui; the
wizard is self's presentation. Reuse is via the engine, not the component.

## 4. Verification (before done)

1. `tsc -b packages/core packages/self packages/classroom` — only pre-existing
   known errors (useClassroomRoleData, NoSchoolView.web) may remain.
2. Vitest: moved tests run green in `--dir packages/core`; self suite stays
   green (was 25/25; `reframe.test.ts`/`trapCatalog.test.ts` are *relocated*,
   count stays 25 in self after accounting 2 moves = net zero loss in core).
3. Biome `check --write` on touched files; `audit-keys` + no-inline-fallbacks
   still green (no i18n impact).
4. `check:deep-imports`, `jscpd` on changed files (no duplicate blocks; the
   old self files are deleted, not copied).
5. Existing `@repo/self` public subpaths still resolvable (self types barrel +
   trapCatalog re-export).

## 5. Churn / risk

- ~4 new files in core, ~3 self files rewritten/trimmed, 2 tests relocated,
  ~6 import sites updated. No runtime path, storage, or copy changes.
- Highest risk: accidentally leaving a type in self that core imports, or
  leaving duplication behind — mitigated by deletion + the deep-imports/jscpd
  gates below.
- Gate: `pnpm run check:anti-slop` on the branch before merge; inherited
  pre-existing findings documented in the PR.

## 6. Approval

RED zone (`core/logic`): requires explicit **"proceed"** to implement.
Decision points for the reviewer:
1. Phase 1 only, or Phase 1 + 2 (persistence port) in one go? (Recommend P1.)
2. Keep `Reframe*`/`ThoughtRecord` naming? (Recommend yes.)
3. Keep `TRAP_CATALOG` authored in `@repo/self`? (Recommend yes.)

---
**Status: APPROVED — Phase 1 only. Implemented 2026-08-27.**

Verified: `tsc -b packages/core packages/self packages/classroom` (only the two
pre-existing classroom errors, unrelated); vitest core `src/logic/reflection`
17/17 + self 17/17 (reframe suite moved verbatim, new fixture-based catalog
tests, self data tests preserved — net assertions up); biome clean on all
touched files; jscpd 0 clones; i18n audits green; no `/src/` deep imports.
Phase 2 (persistence port) intentionally deferred — core keeps its existing
wire schema + `thoughtRecords` table ownership, storage stays in `@repo/self`.

---
**Phase 2 Status: APPROVED and IMPLEMENTED 2026-08-27.**

Verified: `tsc -b packages/core packages/self packages/classroom` (only the four
pre-existing classroom/SelfCanvas/NoSchoolView errors); vitest core reflection
25/25 + self 17/17; biome clean; jscpd 1 tiny clone (boilerplate, 0.36%);
i18n audits green; no `/src/` deep imports.

**Phase 2 deliverables:**
- Core `reflection/records.ts` store factory with injected RPC port, generic
  codec, injectable DB (fakes in tests); pure mapping functions moved verbatim.
- Self `thoughtRecordRepository.ts` shrinks to composition root (same public API,
  same `thoughtRecords` table, wellbeing scope, growth signals in selfAPI).
- Classroom `learningReflectionRepository.ts` + `useLearningReflections` hook
  + `learningReflections` table (separate from `thoughtRecords` per approval)
  with classroom/assignment context; separate outbox scope `classroom`.
- `ReframeWizard` accepts optional `persistence` override → classroom passes
  its own store; self default unchanged.
- Server contract `learningReflectionsContract` + handler
  `learningReflectionsRouter` mounted at `learningReflections:` in sanctuary-api
  router.
- ZModel `LearningReflection` model + migration `add_learning_reflections.sql`
  + zenstack generate (clean additive diff).