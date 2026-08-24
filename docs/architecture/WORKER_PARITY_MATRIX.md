---
title: "Platform Worker Parity Matrix"
status: "active"
created: 2026-08-14
updated: 2026-08-14
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture]
---

# Platform Worker Parity Matrix

Status: active migration artifact
Date: 2026-08-14

This matrix is the release checklist for removing privileged worker ownership
from `apps/gurudevi-marketingWeb`. A worker is not considered migrated merely
because an Inngest function with the same event name exists in Sanctuary.

| Event / worker | Marketing side effects | Sanctuary status | Release decision |
| --- | --- | --- | --- |
| `school/attendance.recorded` | Classroom lookup; audit record; analytics; private teacher insight on absence | Validated payload; classroom lookup; durable worker event record; idempotent private teacher note on absence; privacy-bounded server telemetry | Keep marketing until audit parity, intervention delivery, and staging replay prove parity. |
| `school/classroom.created` | Audit record; analytics | Validated payload; durable worker event record; privacy-bounded server telemetry | Safe behaviorally after staging replay confirms event ledger, audit, and telemetry replacement. |
| `school/grade.published` | Classroom lookup; audit record; analytics | Validated payload; classroom lookup; durable worker event record; privacy-bounded server telemetry | Safe behaviorally after staging replay confirms event ledger, audit, and telemetry replacement. |
| `wellbeing/mood.logged` | Intervention decision; audit for low mood; analytics | Validated payload; intervention decision; durable worker event record; privacy-bounded server telemetry | Keep until intervention delivery/alert ownership is explicit; telemetry is not an operational action. |
| `sync/mutation-queued:saveJournalEntry` | Insert into `journal_entries`; audit | Insert path exists; event requires an authenticated actor and verifies `payload.user_id === actorId` | Requires duplicate replay and authenticated actor/owner proof before enablement. |
| `sync/mutation-queued:updateAttendance` | Domain attendance write; emits attendance event; audit | Event requires an authenticated actor and checks classroom teacher/school-bond authority before the upsert | Replace direct SQL with the canonical attendance use case before release. |
| `sync/mutation-queued:saveDecision` | Insert into `decision_journals`; audit | Schema authority authored in `20260814060000_self_reflection_and_teacher_notes.sql`; event verifies `payload.user_id === actorId`; deployment still pending | Enable only after migration parity and duplicate replay checks pass. |

## Required evidence before marketing deletion

1. Every event has one registered Sanctuary function in the deployed function
   manifest and no marketing registration.
2. Each side effect has an authoritative table/use-case owner and a migration
   source.
3. Replaying the same event twice produces one logical side effect and one
   terminal worker outcome. The Sanctuary ledger now upserts completed/failed
   outcomes by idempotency key.
4. A failed side effect is retryable without silently marking the event done.
   Sanctuary now records a failed outcome before rethrowing so Inngest can
   retry while operators can distinguish failure from completion.
5. Correlation, causation, and school scope are persisted and observable.
6. Staging smoke checks confirm event delivery, authorization assumptions,
   database constraints, and failure behavior.
7. The marketing build and route inventory prove that no worker endpoint,
   service-role client, or privileged worker import remains.

The worker event contract now requires `actorId` for queued mutations. The
mobile dispatch bridge derives it from the authenticated store and refuses to
publish without a session; Sanctuary rejects owner mismatches and unauthorized
classroom attendance before any write. This is an authorization invariant, not
just a unit-test expectation.

The Sanctuary worker callback is also exercised directly in
`src/__tests__/platform-workers.test.ts` for actor mismatch, terminal ledger
recording, and duplicate replay. These checks supplement—rather than replace—
staging Inngest delivery and real-database replay evidence.

Sanctuary now has a server-side PostHog capture adapter for the generic worker
families. It sends only an allowlisted set of identifiers/status fields and
never forwards journal text, decision content, or arbitrary event payloads.
Analytics is best-effort and cannot turn a completed domain side effect into a
failed worker outcome; provider unavailability remains visible through the
worker ledger and deployment telemetry configuration.

## Current safe action

Sanctuary owns the durable-agent worker surface and has a validated generic
worker implementation for the supported event families. The remaining
generic workers stay in marketing until the matrix rows above are closed; this
is deliberate containment, not an unfinished rename. The new schema migration
is authored but must not be treated as deployed until migration parity is
verified.

The repository exposes two checks: `pnpm run audit:worker-parity` validates
that Sanctuary registrations and replay-safety invariants exist, while
`pnpm run audit:worker-parity:strict` is the release/deletion gate. Strict mode
fails while any legacy Marketing worker source remains, and treats missing
worker files as successfully removed after the Marketing cleanup lands.
