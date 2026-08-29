# PROPOSAL: Guided-Reflection Persistence Port to `packages/core` (Phase 2)

status: "RED — pending user approval to implement"
created: 2026-08-27
author: "Naveen"
scribe: "opencode"
parent: `docs/current_progress/2026-08-27-guided-reflection-engine-extraction-proposal.md`

> Phase 2 of the engine extraction. Phase 1 (pure engine → `core/logic/reflection`) is
> **implemented and verified**. This proposal moves the **persistence layer** so the
> local-first path and the row↔wire↔domain mapping are core-owned and reusable,
> with the RPC client injected instead of imported.

---

## 1. Why

Classroom learning reflections already persist today — but only because the
`<ReframeWizard />` reused in classroom reaches through `@repo/self`'s hook →
`thoughtRecordRepository` → `selfAPI` (the wellbeing RPC). The generic
**local-first path** (SQLite → outbox → RPC fallback) and the row/wire/domain
**mapping** live in a self file that imports `react-native` `Platform` and the
self API client. That means:

1. The reusable 80% of persistence is invisible to classroom and untestable
   without RN + a live PowerSync DB.
2. Core — which already owns `thoughtRecords` table (`schema.ts:216`), the wire
   schema (`logic/schemas/self.schema.ts`), `getDrizzleDB` (`@repo/core/powersync`),
   and the outbox queue (`useMutationQueue`) — has no reflection persistence of
   its own.
3. A second consumer (classroom, later `@repo/library` annotations) could not
   share the path without reaching into `selfAPI`.

## 2. Current ownership (what the persistence layer actually is)

| Layer | File | Generic? | Depends on |
|---|---|---|---|
| Row↔domain mapping | `self/api/thoughtRecordRepository.ts` (toDomainFromRow, normalizeMood, parseJson, …) | ✅ yes | nothing domain-specific |
| Wire↔domain mapping | same file (toDomainFromWire, fromWireFollowUp, fromTrapEntries, …) | ✅ yes | core wire schema |
| Domain→wire payload | same file (toWirePayload, toTrapEntries, toWireFollowUp) | ✅ yes | core wire schema |
| Local-first orchestration | same file: `createThoughtRecord` / `fetchThoughtRecordsForView` / `completeThoughtRecordFollowUp` | ⚠️ mostly | `@repo/core/powersync`, `@repo/core` queue, `react-native` `Platform`, `selfAPI` |
| Cached runtime hook | `self/hooks/useThoughtRecords.ts` (126 ln) | ⚠️ mostly | self repo, core authAPI / SafeZustandStorage / useStore |
| RPC client | `self/api/self.ts` → `selfAPI.saveThoughtRecord` / `getThoughtRecords` / `completeThoughtRecordFollowUp` | ❌ app client | api client, growthSignals (side-effect) |
| Table + wire schema | `core/adapters/powersync/schema.ts:216`, `core/logic/schemas/self.schema.ts` | ✅ core | — |

Callers of the persisted path today: `ReframeWizard.tsx:168` (`useThoughtRecords`),
`:232` (`addThoughtRecord`). Classroom `LearningReflectionScreen.tsx:55` renders the
same wizard, so classroom **already writes the same `thoughtRecords` table with the
same outbox scope `wellbeing`** as a side effect.

## 3. Proposal — Phase 2 (records store to core, behavior-identical)

**New core file** `packages/core/src/logic/reflection/records.ts`:

- **Moved verbatim** (pure, no new deps): `parseJson`, `normalizeMood`,
  `toWireFollowUp`, `fromWireFollowUp`, `toTrapEntries`, `fromTrapEntries`,
  `toDomainFromRow`, `toDomainFromWire`, `toWirePayload`. Types from
  `./types` (domain) and `@repo/core/logic/schemas/self.schema` (wire) — both
  same-package subpaths.
- **New injected RPC port** (three methods, mirror of what the repository calls
  today, wire types in / wire types out):

  ```ts
  interface ThoughtRecordRpcPort {
    saveThoughtRecord(input: WirePayload): Promise<WireThoughtRecord>;
    getThoughtRecords(userId: string, limit?: number, viewDate?: string): Promise<WireThoughtRecord[]>;
    completeThoughtRecordFollowUp(id: string, input: { post_outcome?; follow_up? }): Promise<WireThoughtRecord>;
  }
  ```

- **New store factory** `createThoughtRecordStore(deps)` returning
  `{ createThoughtRecord, fetchThoughtRecords, completeFollowUp }` with the
  exact current orchestration: on local-first, SQLite write/read/update +
  outbox enqueue (names `saveThoughtRecord` / `completeThoughtRecordFollowUp`,
  scope `wellbeing`, type `CUSTOM`); any failure falls back to `rpc`.
  `react-native` is **not** imported — the `Platform.OS !== 'web'` check becomes
  an injected predicate `isLocalFirstAvailable?: () => boolean` (default true).

  ```ts
  interface ThoughtRecordStoreDeps {
    rpc: ThoughtRecordRpcPort;
    db?: () => ThoughtRecordDb;              // narrow table slice; default = getDrizzleDB
    isLocalFirstAvailable?: () => boolean;
  }
  ```

  `db` is injectable so the store is unit-testable with an in-memory fake;
  default is core's own `getDrizzleDB` (same-package import, no RN). Outbox
  queue stays `await import('@repo/core')` exactly as today.

**Self-side shrinks to a composition root** — `self/api/thoughtRecordRepository.ts`
becomes:

```ts
const store = createThoughtRecordStore({
  rpc: selfAPI,
  isLocalFirstAvailable: () => Platform.OS !== 'web',
});
export const createThoughtRecord = store.createThoughtRecord;
export const fetchThoughtRecordsForView = store.fetchThoughtRecords;
export const completeThoughtRecordFollowUp = store.completeFollowUp;
```

Public API of the file is unchanged → `useThoughtRecords.ts` and the wizard are
untouched. Growth signals stay where they are: inside `selfAPI`'s methods (the
RPC port implementation), so core stays free of marketing telemetry.

**Classroom: no code change.** It keeps persisting through the wizard; the
same-table decision is the approval point below. Later, classroom/library can
build their own store or read history with the same core factory + port.

**Tests (core)** — `__tests__/records.test.ts`, fixture-based, asserting *more*
than today: mapping round-trips (domain→wire→domain), row→domain incl. mood
clamping and custom-trap `#custom` entries, follow-up JSON build/parse, and
store orchestration against fakes — SQLite path + outbox enqueue succeeds;
db throw falls back to rpc; `isLocalFirstAvailable() === false` goes straight
to rpc. Self keeps 17/17 (repo file only loses internals, public API same).

## 4. Verification (before done)

1. `tsc -b packages/core packages/self packages/classroom` — no new errors
   (two pre-existing classroom errors unrelated).
2. `vitest run src/logic/reflection` in core — existing 17 + new records suite.
3. `vitest run --dir packages/self` — still 17/17.
4. biome clean on all touched files; jscpd 0 clones; i18n audits green; grep
   for `/src/` cross-package imports clean.
5. Behavior-identical check: no public signature changes in
   `@repo/self/api/thoughtRecordRepository`; scanner confirms no remaining
   `selfAPI` / `Platform` references inside `packages/core/src`.

## 5. Churn / risk

- New RED file `core/logic/reflection/records.ts` (approved by this proposal).
- `self/api/thoughtRecordRepository.ts` shrinks to a wrapper; nothing else in
  self moves. The hook stays in self (a feature hook, not engine).
- Only behavioral risk is the `Platform`→injected-predicate swap; default
  composition root passes the identical `() => Platform.OS !== 'web'`.
- Same-table decision carries real data semantics — see approval point 2.

## 6. Approval

RED zone (`core/logic`): requires explicit **"proceed"** to implement.
Decision points:
1. **Proceed with the Phase 2 persistence port?** (Recommend yes.)
2. **Classroom learning reflections keep writing the SAME `thoughtRecords` table**
   (shared history with Reframe, same wire + outbox scope)? (Recommend **yes** —
   the wizard already does this today; splitting would fragment reflection history
   and duplicate the outbox scope.)
3. **Growth signals stay as a side-effect in self's RPC port impl** (not moved
   into core)? (Recommend yes — marketing telemetry is not engine logic.)
4. **`useThoughtRecords` hook stays in `@repo/self`** (core exposes the store
   factory, not the hook)? (Recommend yes — it is a domain feature hook.)

---
**Status: PENDING APPROVAL.** Implementation begins only after explicit "proceed".