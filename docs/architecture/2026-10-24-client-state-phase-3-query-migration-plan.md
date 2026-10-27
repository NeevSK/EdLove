---
title: "Client State Phase 3: Scoped Remote-State Migration"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Codex"
tags: [architecture, phase-3, tanstack-query, state, query, migration]
---

# Client State Phase 3: Scoped Remote-State Migration

> **Canonical integration:** This is the executable Phase 3 record for the
> [client-state migration plan](2026-10-23-client-state-migration-plan.md).
> It inherits the scope, account-transition, durable-command, and web-offline
> rules in [client-state and web offline capability canon](client-state-and-web-offline-capability-canon.md).

## Decision

Phase 3 moves **one remote-state family at a time** from independently mutable
Zustand state to TanStack Query. Query owns remote-read cache and lifecycle;
the service remains authoritative. Zustand may remain only as a compatibility
projection during a bounded migration and must never be a second writable truth.

The first deliverable is a readiness increment, not a bulk rewrite. It proves
that a feature can consume canonical scope in both web and mobile before a
private resource adopts `scopedQueryKey`. Only then does the first family,
notifications, migrate.

**Implementation status (2026-10-24):** Phase 3.1 is implemented as a
bounded notification increment. `useScopedNotifications` admits only a
committed, non-transitioning matching `ScopeSessionSnapshot`; it uses
principal-only scoped keys because inbox ownership is not workspace-owned.
Authenticated list/count/read commands use the actor-derived social oRPC
contract. One ref-counted realtime channel is shared per QueryClient and
principal. On 2026-10-24, after explicit human authorization, the obsolete
Zustand store, compatibility hooks, and their tests were removed; all known
consumers import the scoped hook directly.

## Non-goals and invariants

- Do not delete stores, persistence keys, routes, hooks, realtime fallbacks,
  or outbox records. Deletion requires separate human approval.
- Do not persist generic private Query data. Browser offline W2–W4 remains a
  separately approved vertical slice.
- Do not treat cached entitlement, Cedar, or device-security values as an
  authorization decision. Server verification and safe denial remain decisive.
- Do not clear `MutationCache`, durable outbox, or unrelated account data at a
  query boundary.
- Do not introduce XState in this phase. A Query lifecycle is not sufficient
  evidence for an actor.

## Existing substrate and architectural finding

`@repo/core/lib/clientStateFoundation.ts` already provides
`scopedQueryKey`, scope disposal, and account-boundary cleanup. It intentionally
retains a broad legacy-key fallback. That helper proves neither that a family
uses complete scope facts nor that its realtime/mutation behavior is correct.

The inventory classifies feature flags, entitlements, Cedar decisions,
notifications, and device security as Query-review candidates. Durable command
and conflict stores remain out of scope. Web attendance is a promising later
small read slice, but its current key uses only `subjectId`; its canonical
tenant/bond/perspective facts are not yet consumed by the web shell. Attendance
drafts remain durable local data and must not be placed in Query.

## Phase 3.0 — scoped-query readiness

**Purpose:** establish a reusable, tested composition boundary between the
canonical `ScopeSessionSnapshot` and a domain hook; do not migrate a domain yet.

1. Expose a read-only scope selector/hook at the existing scope-session
   boundary for web and mobile consumers. It must expose principal, tenant,
   active bond, and active perspective without creating another scope store.
2. Add a `createScopedResourceKey(scope, family, parameters)` convention built
   on `scopedQueryKey`; keys include every server-relevant scope fact. Public
   data uses a separate explicitly-public key namespace.
3. Characterize `disposeQueryScope` and account disposal against a real
   consuming hook: cancel in-flight work, remove only its outgoing scope, keep
   other-account/public entries, and retain MutationCache/outbox entries.
4. Add a static/AST guard or focused source test preventing new private Query
   families from using a bare first-segment key once they are admitted.

**Exit gate:** canonical scope is available at the consumer boundary, a
real hook has scope-separated cache entries, and account/scope changes dispose
only matching private Query entries.

**Web admission record (2026-10-24):** the authenticated Workspace route
derives its read-only Query scope directly from authoritative entry facts passed
to `WorkspaceFloor`: authenticated principal and active bond. The active entity
is a required resource-key segment. The web entry contract does not yet expose
canonical tenant or perspective facts, so this increment does not fabricate
either one. This is not a second scope store and does not grant authorization;
the server remains authoritative. Missing/blank facts deny Query admission and
surface an unavailable state.

## Phase 3.1 — notifications: first remote-state family

Notifications are the first full migration because they are explicitly
principal-owned and have a finite read/list/count/mutation/realtime surface.

| Concern | Target ownership | Required behavior |
| --- | --- | --- |
| List and unread count | Scoped Query cache | Same scope owns both list and count; no duplicated local count. |
| Mark-one / mark-all | Server mutation + targeted cache reconciliation | Confirmed invalidation by default; optimism only with tested rollback. |
| Realtime subscription | One query-owned subscription adapter | Deduplicate event IDs, reconcile reconnect with refetch, unsubscribe at scope change. |
| Guest/explore samples | Explicit local/public adapter, not private Query data | Never mix samples with an authenticated account key. |
| Errors/offline | Query error/loading state | Show retryable failure; never render transport failure as a truthful empty inbox. |

Mutation writes use the existing server command path. The first version uses
confirmed invalidation/refetch rather than optimistic mark-read; a later
optimization needs a rollback and event-order proof. Realtime INSERT/UPDATE
events must target exactly the active scoped keys and cannot assume exactly-once
or in-order delivery.

A missing, mismatched, or transitioning canonical scope is an explicit
unavailable error—not an empty result. Guest and Explore samples are local-only
state: their mark-one/mark-all actions never invoke a remote mutation or
subscription. SSE notification events invalidate the same scoped keys only when
they supply a recipient principal; they no longer invalidate broad generated
notification keys.

**Exit gate:** all notification consumers use one scoped hook; no dual mutable
notification list/count remains; A→B, reconnect, duplicate realtime event,
mark-read failure, and in-flight response after a scope change are evidenced.
The former store and compatibility hooks were removed after explicit approval
once every known production consumer was directly wired to this hook.

## Phase 3.2 — attendance read migration

Migrate web workspace classrooms/roster reads to scoped keys only after Phase
3.0 makes canonical scope available. Preserve the existing typed server calls,
batch-record receipt contract, and account/bond/entity/date-scoped durable
drafts. Query handles remote roster reads; drafts remain in their current
persistence boundary and are neither cached nor disposed as server data.

**Exit gate:** changing principal, bond, entity/perspective, classroom, or date
cannot reuse a prior roster; submit invalidates/refetches the exact scoped
roster; draft persistence and command recovery survive query disposal.

**Implementation record (2026-10-24):** the authenticated `WorkspaceFloor`
grade-class list and selected grade-class roster/snapshot now use the existing
Workspace domain read boundary, `useWorkspaceDomain`; no standalone
attendance-query adapter exists. That boundary delegates protected transport
through `workspaceHexagonalService`, while `attendance.ts` remains the only
browser draft/practice and validated batch-command boundary. Their keys include principal, active bond,
active entity, grade-class id, and date—the complete set of facts actually
provided by the current web entry contract. Service calls retain their session
recheck and server denial behavior and now receive Query cancellation signals.

The applicable native consumer, `@repo/classroom`'s `AttendanceScreen`, now
uses `useScopedAttendanceRegister`. It admits reads only from a settled
`ScopeSessionSnapshot` with principal, active bond, and derived tenant/entity;
its Query keys include those facts, active perspective, grade class, and date.
Query cancellation rejects the native consumer read immediately, so a late
underlying legacy transport response cannot populate a replaced scope. The screen retains
only its editable roster projection, scanner interaction, and existing durable
idempotent command path. A successful command invalidates precisely the active
register. The former effect-owned remote read lifecycle is removed; neither the
mobile register nor the web Workspace surface retains a second mutable remote
read cache.
Authentication/scope denial does not retry; retryable transport/service
failures retry twice and remain visible as errors rather than an empty roster.
A successful batch command invalidates only the exact active roster key.
Existing account draft helpers and batch receipt validation remain outside
Query. Explore, Safe Try, kiosk, badges,
shared classroom/mobile surfaces, reports/history/pulse, and the legacy API
remain deliberately outside this bounded increment.

**Hostile review resolution (2026-10-24):** the initial cut was rejected for
three defects: it fabricated unavailable tenant/perspective values, failed to
forward Query cancellation into protected fetches, and could briefly project a
prior roster when a new key already had cached data. The admitted seam now keys
only actual entry facts; passes abort signals through both roster read requests;
and identity-gates every roster display, edit, draft write, and submit action by
principal, bond, entity, grade-class, and date. Focused evidence includes a
cached grade-class switch proving that old marks do not render after the switch.
Mounted date and full principal/bond/entity transition scenarios remain G3
release-confidence work, not a claim implied by the focused suite.

**Evidence status (2026-10-24):** Web G1/G3 tests prove scoped-key
partitioning, scope admission, draft survival across disposal, protected
request cancellation, class/date/entity projection isolation, and exact
invalidation. Native G1 tests prove its scoped-key partitioning, admission
failure, and Query-consumer abort behavior; native screen projection gating is
implementation-reviewed but still needs a mounted scope-transition test. The
shared SSE receiver has a G1 deterministic transient-failure reconnect test.
The Next.js Workspace route now mounts in a real browser after the shared SSE receiver was
made browser-safe: native lifecycle is an injected mobile `AppState` adapter,
while the core receiver uses browser visibility by default. The mounted Explore
attendance journey renders and updates a learner mark. A real authenticated
browser/device journey and a live reconnect/ambiguous-write response remain
release-environment evidence; they cannot be proved against the local guest
session. They are not silently represented as passed.

## Phase 3.2.1 — web build-admission remediation

**Status (2026-10-25): web build gate and native mounted evidence passed; authenticated browser journey remains release-environment work.** Phase 3.2's attendance seam is
complete, but the full `gurudevi-web` production build cannot yet be an
evidence gate because the unrelated `/self` route imports mobile-oriented
packages into browser components. This workstream is not a Query-family
migration and must close before another family is admitted.

The first repair removed two false build blockers: browser `@repo/ui/icons`
now resolves to the existing web icon bridge, and `@repo/self` explicitly
exports its existing hook/API source subpaths. The next build reduced the
failure set from 195 to 17 errors. The remaining error classes are real
boundary violations, not candidates for a `react-native-web` alias:

**Resolver finding (2026-10-24):** the root TypeScript `paths` rule for
`@repo/self/*` resolves directly to package source before Turbopack can consult
the package `exports` map. Browser conditions added only to that map therefore
cannot protect this application. That experiment was removed rather than
leaving a dead compatibility layer. The required repair remains explicit,
app-local browser contracts and direct imports from `/self` components; those
contracts must cover the complete selected vertical slice before the full
route is re-admitted to production build verification.

1. `useTimetable` reaches native MMKV through `GuestDataManager`.
2. `useThoughtRecords` and self repositories reach native storage, PowerSync,
   database, and broad core barrels.
3. The teacher-history hook reaches mobile permission/database barrels.
4. Core and database barrels include unresolved mobile-only modules that the
   browser route must not load.
5. The optional Cedar WASM import is unresolved in the browser bundle and
   requires an explicit web capability policy, not a suppressed warning.

**Execution order:**

1. Inventory every `/self` browser component and classify each dependency as
   web-safe, browser-adapter-required, or native-only. The route must import
   only its direct web-safe contract, never a mobile barrel.
2. Create browser-native adapters in `apps/gurudevi-web` for the selected
   personal-data vertical slice. Use the existing authorized web entry and
   browser storage affordances; do not import MMKV, PowerSync, Expo Router,
   React Native, or database clients.
3. Repair only the actually missing source exports/modules that are reachable
   from those approved web contracts. Do not add placeholder exports or delete
   working mobile flows to make the bundle pass.
4. Decide and document whether Cedar WASM is a web runtime capability for the
   selected surface. If not, browser UI fails closed and the server remains the
   authorization authority.
5. Prove the repaired `/self` route with a production build and a browser
   journey. Retain the Phase 3.2 scoped-attendance test suite as regression
   coverage.

**Exit gate:** `pnpm --filter gurudevi-web build` passes without React Native,
Expo, MMKV, PowerSync, database-client, or unresolved-module traces from the
browser graph; an authenticated browser journey covers the selected self
surface. No mobile route, fallback, or durable record is removed.

**Current evidence (2026-10-24):** the full production build now passes. The
`/self` components use app-local browser adapters for personal, offline-capable
records and browser-native icons; the mobile modules remain unchanged. This
proves bundle and static-route admission, not an authenticated browser journey
or an authenticated browser journey. Native mounted attendance scope-transition
evidence is now G3: the native Jest harness mounts `AttendanceScreen`, starts
with Grade A under one scope identity, then replaces the bond/entity identity
with a pending empty class read and proves that Grade A no longer renders. The
authenticated browser journey remains release-environment evidence and must
not be reported as complete.

The browser adapter's record storage is deliberately account-namespaced in
browser local storage and has focused tests for account isolation and durable
reminder deletion. It is an offline local affordance, not an invented sync
protocol: cross-device reconciliation remains outside this increment until a
server-owned personal-record contract is explicitly admitted.

## Phase 3.3 — device-security read admission

**Execution record:** [Phase 3.3 device-security Query admission](2026-10-25-client-state-phase-3-device-security-query-admission.md).

Device-security summaries are the next admitted candidate because their read
surface is bounded, while trust, revoke, and recovery remain server commands
with confirmation-first semantics. The admission record must prove that stale,
missing, or failed data never grants a security capability; cached summaries
are informational only. **Implemented and accepted (2026-10-25):** the
summary read is now a principal-scoped Query family; the former independently
mutable Zustand summary store is removed; confirmed commands invalidate only
the exact summary key; and queued commands remain unconfirmed durable work.

## Phase 3.4 — authorization-snapshot admission (next)

**Admission plan:** [Phase 3.4 authorization-snapshot admission](2026-10-25-client-state-phase-3-authorization-snapshot-admission.md).

Entitlements and Cedar are not ordinary remote collections. Entitlements have
a bounded mobile continuity snapshot; Cedar decisions are signed,
policy-versioned, scope-bound authorization snapshots. The next increment must
separate those two contracts, preserve their current fail-closed evaluator, and
admit Query only where one verified read-cache owner can be proven. No cached
snapshot may become server authorization.

## Later families and order constraints

1. **Authorization snapshots:** entitlement and Cedar work follows the Phase
   3.4 admission plan. Every stale, failed, expired, mismatched, or
   unverified snapshot fails closed and is never authorization truth.
2. **Feature flags / remaining entity collections:** admit individually based
   on source-of-truth, scope, realtime, and mutation evidence.

**Completion ledger:** [Phase 3 completion roadmap](2026-10-25-client-state-phase-3-completion-roadmap.md).

## Per-family admission checklist

Before implementation, a dated sub-record must identify:

1. service/API contract and authoritative writer;
2. exact key factory including principal and applicable tenant/bond/perspective/entity;
3. freshness, retry, timeout, loading, empty, denial, and offline behavior;
4. mutation idempotency, invalidation or optimism/rollback semantics;
5. realtime source, duplicate/out-of-order/reconnect reconciliation;
6. account/scope disposal and compatibility callers;
7. rollback route with one active writer and no data loss.

## Evidence ladder

- **G0:** types, lint/static boundary checks, raw diff deletion-first audit.
- **G1:** key isolation, error mapping, mutation failure/rollback, and
  realtime cache reconciliation under controlled substitutes.
- **G2:** A→B, scope/perspective transition, offline/reconnect, denied/503,
  stale/expiry, duplicate event, and delayed mutation response scenarios.
- **G3/G4:** mounted consumer behavior and changed app bundle verification.
- **G5:** device/browser authenticated journey only when a migrated surface
  ships; it is not implied by G1/G2.

Current evidence: focused G1 boundary tests cover scope admission, principal
cache isolation/disposal without MutationCache removal, ref-counted shared
subscription cleanup, stale callback suppression after release, reconnect
notification, insert/update deduplication, and local sample reconciliation.
They do not prove real browser/mobile transport, server deployment, or device
push delivery; those remain G3–G5 release evidence.

## Hostile-review vetoes

Reject any increment that bulk-migrates stores, shrinks the broad legacy
fallback before keys are characterized, persists a generic private cache,
hides an error as empty success, assumes realtime ordering, uses cache data as
authorization, clears mutations/outbox, introduces dual writers, or removes a
compatibility path without approval.
