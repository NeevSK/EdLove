---
title: "ADR: Sanctuary Authorization â€” Final Architecture, CASL Retirement, and UI Rendering Strategy"
status: "active"
created: 2026-06-19
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture, historical]
---

# ADR: Sanctuary Authorization — Final Architecture, CASL Retirement, and UI Rendering Strategy

**Date:** 2026-06-19
**Status:** Accepted
**Supersedes:** Ambiguity left open by 2026-06-10-poa-proxy-unentanglement.md and 2026-06-12-hexagonal-ports-adapters-rollout.md regarding CASL's final disposition and UI-level instance gating.

---

## 1. Context

Three prior audits (March, May, June 2026) tracked an evolution from CASL-based client proxies (`poaProxy`, `temporalPOAProxy`) toward a Cedar-WASM-based local-first authorization model. By June 12, the intent to eliminate CASL was decided in principle, but the codebase was left in a state where:

- CASL was removed from all *runtime evaluation* paths.
- CASL remained present as a *type-vocabulary* source (`@casl/ability`, `@casl/react` in `package.json`; `abilities/{base,teacher,student}.ts` defining `Actions`/`SubjectType`).
- No document had resolved whether this remaining CASL presence was acceptable residue or unfinished migration.
- No document had specified how UI rendering should request authorization decisions, leading to confusion about whether Cedar's async nature constituted a UX or security risk.
- A code-level audit (this session) surfaced that **offline writes do not currently perform instance-level (ownership) checks** — the `createSecureDrizzleProxy` interceptor passes a hardcoded placeholder `resourceId` rather than the actual record's attributes.

This document closes all of the above with one coherent, final position.

---

## 2. Decision Summary

| Concern | Final Decision |
|---|---|
| CASL package & type files | **Delete entirely.** Not retained in any form, including as a type-only dependency. |
| Action/Subject vocabulary | Hand-defined TypeScript types, or generated from the Cedar schema if/when tooling supports it. Not borrowed from CASL builders. |
| Authorization source of truth | **Cedar**, exclusively. One DSL, synced from server, evaluated locally via WASM and authoritatively on the server. |
| UI instance-level gating | **Pre-computed at fetch time**, never at render time, never inline in components. |
| The real security boundary | **The database write path** (online: Hono Gateway; offline: `SecureDrizzleProxy`). UI checks are UX convenience only — never trusted for security. |
| Offline write instance checks | **Currently incomplete — scoped as follow-up work** (Section 6). This is a real gap, not a hypothetical one. |
| Staleness / sync lag | Bounded by PowerSync's sync cadence, not by which authorization library is used. Reactive queries auto-update UI on sync; no manual cache invalidation needed. |

---

## 3. Rationale: Why CASL Is Fully Retired, Not Partially Retained

### 3.1 What CASL was actually doing

CASL provided three things: synchronous instance-level checks (`ability.can('update', classroom)`), synchronous UI-safe evaluation (no async/loading state needed), and a TypeScript-native way to declare role abilities.

### 3.2 Why partial retention was rejected

Three options were considered for the residual `@casl/ability` type dependency:

1. **Keep CASL types permanently as a vocabulary DSL with zero runtime use.** Rejected — keeping a dependency for its type-builder syntax alone, after deliberately discarding its actual function (ability evaluation), is dependency debt with no corresponding benefit.
2. **Hand-roll `Action`/`Subject` types.** Adopted as the immediate path — zero dependency, full clarity, no ambiguity about what's "live" vs "vestigial."
3. **Generate types from Cedar schema directly.** Preferred long-term path if/when codegen tooling is in place — this makes Cedar the single source of truth not just for evaluation, but for the vocabulary itself, fully closing the rule-drift risk that motivated CASL's removal in the first place.

**Action items:**
- Delete `abilities/{base,teacher,student}.ts`.
- Remove `@casl/ability` and `@casl/react` from `package.json`.
- Replace `Actions`/`SubjectType` imports in `usePermissions.ts` with hand-defined types (interim) or Cedar-schema-derived types (target).

This was scoped as a half-day cleanup task, not an architecture review — the architecture decision was already made in June; this is execution hygiene.

---

## 4. Rationale: Cedar's Async Nature Is Not a Security Risk

A recurring point of confusion across this exploration was whether Cedar's async/WASM evaluation model made it inherently more "stale" or riskier than CASL's synchronous evaluation. This is resolved as follows:

**Staleness is a property of data freshness, not of evaluation speed.** CASL evaluated synchronously, but against whatever local data it was handed — if that data was stale, CASL would confidently return a wrong answer just as fast as a right one. Sync/async is orthogonal to correctness. The actual freshness boundary in both systems is PowerSync's sync layer, not the authorization engine.

**Confirmed via code audit:**
- PowerSync streams deltas to local SQLite and triggers reactive query updates automatically.
- Because queries are bound to reactive hooks, a change to a record's ownership re-triggers evaluation and updates the UI without manual cache invalidation or app restart.
- This holds equally whether the evaluation logic is CASL or Cedar — neither library owns the sync/freshness mechanism.

**Conclusion:** Cedar's async nature affects *where in the code* you can call it (not inside a synchronous render function), not *whether the result can be trusted*. This is an engineering constraint, not a security concern.

---

## 5. Decision: UI Rendering Strategy — "No False Buttons" Without Exception

### 5.1 The requirement

Action buttons (edit/delete/etc.) must never render in a state where clicking them leads to a failure. This was explicitly requested as a non-negotiable UX bar — not "fail gracefully," but "never show what you can't do."

### 5.2 The two shapes of authorization question

| Shape | Question | Cost | Where computed |
|---|---|---|---|
| **Shape 1** | "Can this role generally perform this action?" (e.g., can a Teacher update Classrooms at all) | Free — no DB lookup, role-shaped only | Once at login/sync, cached flat in `permissionsMap` (Zustand) |
| **Shape 2** | "Can this user act on this specific record?" (e.g., can this teacher edit classroom #482) | ~0.5–2ms per record once WASM is warm; 25–100ms for a 50-record batch (confirmed via profiling) | At fetch time, attached to the record — never inside a render loop |

### 5.3 The rule

> **Any query that returns records destined for action buttons must attach the Shape 2 verdict at fetch time, as a field on the returned object. Components only ever read an already-computed field — they never decide.**

This eliminates the "render then fail" pattern entirely. The async cost is absorbed during data loading (which already has a loading state), not during paint.

### 5.4 Why this isn't over-engineering

Two alternatives were rejected:

- **Per-item async check inside list render** — rejected: confirmed via profiling to exceed the 16.6ms frame budget at any meaningful list size, causing visible stutter.
- **Manual inline ownership checks scattered through components** (`if (classroom.teacherId === user.id)`) — rejected: this silently re-introduces the exact rule-drift risk CASL's removal was meant to solve, just relocated into component bodies instead of a central ability file.

### 5.5 Compile-time enforcement (DX requirement)

To prevent a developer from forgetting to attach Shape 2 verdicts before rendering action buttons, this is enforced as a **type error, not a convention**:

```typescript
export type WithPermissions<T> = T & {
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
};

export function attachClassroomPermissions(
  user: UserContext,
  classroom: Classroom,
  permissionsMap: Record<string, Record<string, boolean>>
): WithPermissions<Classroom> {
  const hasBaseEdit = permissionsMap['Classroom']?.['update'] ?? false;
  const hasBaseDelete = permissionsMap['Classroom']?.['delete'] ?? false;

  return {
    ...classroom,
    permissions: {
      canEdit: hasBaseEdit && classroom.teacherId === user.userId,
      canDelete: hasBaseDelete && classroom.teacherId === user.userId,
    },
  };
}
```

Components that render action buttons accept only `WithPermissions<Classroom>`, never raw `Classroom`. Passing an unhydrated object is a compiler error, not a runtime bug waiting to be discovered.

**Open follow-up:** generalize this pattern (a typed `withPermissions()` query wrapper, or an ESLint rule) so it applies uniformly across all entity types, not just Classroom, and so new entity types inherit the constraint by default rather than by developer memory.

---

## 6. Confirmed Findings From Code Audit (2026-06-19)

These are facts about the current codebase, not design decisions — recorded here so the gap between "intended architecture" and "current state" is explicit and trackable.

### 6.1 Read path — confirmed
- **No Cedar involvement on the client read path at all**, currently. Reads fetch directly from Hono/Supabase or local PowerSync/Drizzle with no permission computation attached.
- This is not a bug — it's the expected pre-implementation state. Section 5.3's rule has not yet been applied; there is currently no false-button risk because there is no button-gating logic yet, computed or otherwise.

### 6.2 Online write path — confirmed secure
- Hono Gateway's `poa()` middleware intercepts all writes and runs the authoritative server-side Cedar engine (`checkCedar`).
- JWT verified via asymmetric crypto; user's role/capacity hydrated from the authoritative database (`db.bond.findFirst`), never from client-supplied headers.
- Explicit privilege-escalation defense confirmed: a client claiming `x-capacity: admin` while the DB says `teacher` is rejected with `403 PrivilegeEscalation`.
- **No further action needed here.**

### 6.3 Offline write path — confirmed gap, scoped as follow-up

This is the one finding from this exploration that constitutes a genuine security gap rather than a UX or architecture preference:

- `createSecureDrizzleProxy` (`database.ts`) intercepts `.insert()`, `.update()`, `.delete()` at the Drizzle builder level.
- At interception time, it currently has access only to **table name** and **action type** — not the record's `id` or attributes.
- It passes a **hardcoded placeholder string** (`'local-drizzle-write-interceptor'`) as the `resourceId` to Cedar, meaning **offline writes are currently checked only at the table-capability level, not the instance/ownership level.**
- **Practical consequence:** offline, a teacher could currently write to a classroom they do not own, and Cedar would not catch it, because the resource identity being evaluated is a placeholder, not the real record.

**What fixing this actually requires** (confirmed, not estimated):

| Operation | Requirement |
|---|---|
| `insert` (create) | Trivial — payload is already present in the builder's `values` state; no DB lookup needed. |
| `update` / `delete` | Non-trivial — requires extracting the `where` clause's target id from the query builder, then performing an additional async `SELECT` against SQLite to retrieve the record's current attributes (e.g. `teacher_id`) **before** allowing the original write to proceed, then feeding those attributes into the Cedar WASM evaluator. |

**Drizzle introspection: confirmed, two real options, one clearly correct.**

Drizzle does not expose an official AST traverser for pending `where`/`set`/`values` state. Two ways to get at it were evaluated:

| | Option A — Private internals (`builder.config.where`) | Option B — Public `.toSQL()` |
|---|---|---|
| Stability | **Unofficial.** Drizzle frequently refactors internal builder layout; even patch upgrades can silently break this. | **Official, stable, public contract.** Will not break across upgrades. |
| Mechanism | Direct property access on internal state (requires `as any` casts). | Compile the builder to `{ sql, params }` — e.g. `delete from "classrooms" where "id" = ?` plus `params: ["classroom-123"]`. |
| Cost | Looks simple, is actually fragile. | Requires parsing the SQL string (e.g. regex matching `where "id" = ?` to map to the correct `params` position) — more upfront parsing work, but on a contract that holds. |

**Decision: use `.toSQL()` (Option B).** This was a close call resolved in favor of stability over implementation convenience — the parsing work is a one-time cost; private-internals coupling is a recurring, silent risk on every future Drizzle upgrade, and `drizzle-orm` is a direct workspace dependency (`^0.45.2`) upgraded independently of PowerSync, so this risk is not hypothetical. Option A is rejected outright, not just "accepted with a version pin" as originally considered — a stable public path exists, so there is no remaining justification for the brittle route.

**Implementation note confirmed:** Drizzle is not bundled inside PowerSync. They're independent layers connected by `@powersync/drizzle-driver`, a bridge adapter that redirects Drizzle-generated SQL to the local PowerSync SQLite engine. This means a `drizzle-orm` version bump can affect the interceptor regardless of whether PowerSync itself is touched — reinforcing why the interceptor should depend on Drizzle's stable public surface (`.toSQL()`) rather than its internal one.

**Risks of the update/delete fix, named explicitly (still apply under Option B):**
- The SQL-string parsing logic (mapping `?` placeholders to `params` positions) must correctly handle the case where a `where` clause filters by something other than `id`.
- Must handle batch update/delete affecting multiple rows — Cedar would need to evaluate against each affected row, or the operation must be restructured to disallow ambiguous batch writes.

**Status:** Scoped as its own implementation task, not bundled into general cleanup. Approach is now settled (`.toSQL()` parsing); remaining open question is the multi-row batch-write handling above, which should be resolved during implementation, not deferred again.

**Priority:** This should be sequenced **before** the read-path Shape 2 attachment work (Section 5), since it is a security gap rather than a UX gap.

---

## 7. What Cedar Owns vs. What It Doesn't

To close the recurring confusion about "Cedar-related UI rendering" as a concept:

**Cedar owns:** evaluating `(principal, action, resource, context) → ALLOW/DENY`. Nothing else. It has no concept of buttons, components, or rendering.

**Cedar does not own:**
- *When* to ask the question (that's application code — Section 5.3's rule).
- *Where* the verdict is stored once computed (Zustand `permissionsMap` for Shape 1; attached record fields for Shape 2).
- *What the UI does* with a DENY verdict (hide a button, show a disabled state, show an inline message — all application-layer UX decisions, not Cedar's concern).

There is no such thing as "Cedar UI rendering" as a distinct technical concept. Treating it as one was a source of confusion in earlier exploration of this problem, not a real architectural surface.

---

## 8. Summary of Action Items

1. **Delete CASL entirely:** remove `abilities/*.ts`, remove `@casl/ability` and `@casl/react` from `package.json`, replace `Actions`/`SubjectType` with hand-defined (interim) or Cedar-schema-derived (target) types.
2. **Fix offline instance-level checks** in `createSecureDrizzleProxy` — use `.toSQL()` to extract `where`/`values` state (not private builder internals), per Section 6.3. Sequenced first due to security priority.
3. **Implement Shape 2 attachment at fetch time** for all entities with action buttons, starting with Classroom, using the `WithPermissions<T>` pattern in Section 5.5.
4. **Generalize the compile-time enforcement** (typed query wrapper or lint rule) so future entity types inherit the "no unhydrated object reaches a button-rendering component" constraint automatically.
5. **(Long-term, optional)** Investigate Cedar-schema-to-TypeScript codegen to make Cedar the source of truth for the action/subject vocabulary itself, not just for evaluation.

---

## 9. Non-Goals (Explicitly Rejected)

- **A CASL/Cedar transpiler** to keep CASL's React ergonomics while sourcing rules from Cedar. Rejected — adds a parsing/maintenance burden and a new class of transpilation bugs to avoid a problem (sync UI checks) that's already solved more simply by Shape 1 pre-computation.
- **Per-item Cedar evaluation inside list render loops.** Rejected — confirmed by profiling to violate frame budget at realistic list sizes.
- **Manual scattered inline ownership checks in components.** Rejected — reintroduces rule drift in a new location.
