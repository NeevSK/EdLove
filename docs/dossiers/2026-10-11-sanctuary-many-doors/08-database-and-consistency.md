---
title: "Database and System Design: Consistency, Ownership, and Recovery"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [database, consistency, synchronization, transactions, recovery]
---

# Database and System Design: Consistency, Ownership, and Recovery

## Possibility

People work through intermittent connections while records remain attributable and correctable. Institutions can restore their memory after mistakes and export it when stewardship changes. Future independent cells exchange selected records without assuming the newest timestamp is always the truth.

## Domain-specific consistency

Local-first is a family of behaviors, not a guarantee that every record can safely be edited offline. Classify each effect before choosing sync semantics.

| Data/effect | Candidate consistency rule | Partition behavior |
| --- | --- | --- |
| Private lesson draft | Local persistence; revisions on later share | Continue on device; no institutional commit claim |
| Attendance | Scoped command with explicit session/date and correction policy | Provisional capture; server validates ownership and conflicting edits |
| Grade | Authorized versioned change and traceable correction | Preserve proposal; block final institutional settlement until revalidated |
| Fee/payment | Reconciliation to provider/ledger; deduplicated external references | Pending/unknown outcome; never infer payment from client intent |
| Profile/permissions | Authoritative membership and revocation | Cached display may be stale; protected commit uses current authority |
| Library cache | Provenance/version/expiry where relevant | Read selected downloads; clearly label stale material |
| Workspace layout | Grouped revision-aware changes | Reuse existing domain-specific conflict handling |
| Family notice | Durable notice and delivery intent | Record pending delivery; do not equate receipt with comprehension |
| Self journal | Personal isolation and explicit sync preference | Local/private capability subject to device custody |

Do not apply last-write-wins indiscriminately to grades, money, identity, or institutional disputes. CRDTs may suit collaborative text or selected collections; they cannot decide whether an actor was authorized to change a grade.

## Atomicity at the owned boundary

Proposed transaction for a confirmed command: resolve/revalidate authority, check proposal/input/version, enforce uniqueness/conflict rules, write domain effect, append minimally necessary audit event, settle operation receipt, and create notification intent. Provider calls occur after commit. A worker performs external effects using bounded retry and records outcomes.

Idempotency key must be scoped to actor, action, and relevant resource, with input fingerprint checked for reuse. One stable operation identity must survive reconnect and retries. If a response disappears after commit, retry returns the original receipt. A duplicate business action can still be created with a different key, so domain uniqueness constraints matter too.

Expiry rules differ: a proposal can expire; its receipt may need longer retention; a deduplication record must cover the permitted retry horizon. Deleting keys too early resurrects duplicates. Keeping full payloads indefinitely creates privacy/cost liabilities. Document each retention purpose.

PostgreSQL transactions can guarantee the selected local commit; they do not provide exactly-once external sending. A provider may accept a message and then time out. The application must distinguish known failure, known success, and unknown outcome. Reconciliation or idempotency support at the provider determines what can be promised.

## Observed gaps requiring focused verification

E05 shows specific revision/receipt machinery. E06's run/event/dispatch steps are separate calls without a surrounding transaction visible in that route. Promotion similarly writes a teacher note, an event, and a run update separately. Partial results may diverge; reproduce crash/concurrency cases before naming an exact production defect.

The live teacher-note SQL uses `on conflict do update` without an explicit conflict target. This deserves a real PostgreSQL contract test and SQL review before relying on promotion; its source presence is not a demonstrated successful execution. Demo promotion cannot prove that live query works.

PowerSync's [conflict documentation](https://docs.powersync.com/handling-writes/handling-update-conflicts) makes the backend responsible for idempotent writes and conflict handling. Installed connector declarations confirm backend uploads are application work. A synced SQLite file alone does not establish current authorization or domain correctness.

The local Postgres target is 17. Its [serialization guidance](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html) requires retrying the full transaction on relevant serialization failures. Pick constraints, row locks, compare-and-swap, or serializable transactions according to the invariant; do not mandate one isolation level for all workloads.

## Operational database reality

Model peak writes, connection pools, audit growth, media references, scoped replication, replication lag, reconnect backlog, slow queries, lock contention, and schema migration compatibility. A reporting query can damage morning attendance latency unless bounded or isolated. Read replicas can return stale policy or receipts; do not route authority-sensitive decisions there without explicit guarantees.

A queue stored in Postgres is a reasonable initial option if existing mechanisms fit, but competes for connections/IO. Track oldest pending age, lease expiry, retry rate, dead-letter reason, and per-tenant fairness. Recovery capacity must exceed arrival rate: a backlog drains only when useful processing throughput exceeds new work.

### Backups and restoration

Proposed rehearsal: restore to isolated infrastructure, validate schema and sampled invariants, inspect receipt/audit consistency, recover references to media, determine replayable inbox/outbox range, and safely resume workers. Prevent duplicate external sends when historical outbox state is restored. Verify backup encryption and key custody separately.

RPO is acceptable lost committed data over a time window; RTO is time to recover a defined usable service. Their targets must reflect paid capability and actual drills. Local copies reduce some user loss but are not an institutional backup. Replicas copy corrupt writes; snapshots may omit in-flight external effects.

## Future cells and federation

Avoid premature global unique database coupling. Preserve stable record identity and owning institution; migrations require compatible contract versions. Cross-cell exchange must state whether it is a copy, delegated read, or transfer of custody. Export import needs provenance, tombstones/corrections, and duplicate policy. Active writes in disconnected authorities require an explicit dispute/merge protocol; there is no generic reconciliation rule for all educational truth.

## Integration round R7

R2's lifecycle is anchored to atomic owned writes and explicit external uncertainty. R5's authorization is revalidated at settlement. R6 funds restore and database operation. Retain local drafts and scoped reads, but promise only the data/effect classes actually proven. Before scale, run real-DB races, partial-write recovery, queue starvation, and restore/replay scenarios.
