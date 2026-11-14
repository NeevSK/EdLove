---
title: "LMS Task and Workflow Seam"
status: "active"
created: 2026-10-14
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [architecture, lms, classroom, tasks, workflows, receipts, phased-delivery]
---

# LMS Task and Workflow Seam

## Decision

Gurudevi should distinguish three things without introducing a generic workflow engine yet:

1. **Domain task** — an authoritative unit of learning or administration, such as submitting an assignment, reviewing work, recording attendance, or responding to feedback.
2. **Workflow** — a bounded, multi-actor lifecycle that coordinates domain tasks and transitions, such as assignment publication → submission → review → grade → feedback.
3. **Workbench task** — a client-local UI affordance for opening, focusing, restoring, or closing a feature surface. It is not an LMS record and must not become one accidentally.

The Sanctuary API remains the authority for domain tasks and workflow transitions. Web, mobile, WhatsApp, Telegram, MCP, and agents are adapters that render or request the same capabilities.

## Current terrain

The repository already has useful LMS building blocks:

- `Assignment`, `Lesson`, `AssignmentSubmission`, and student submission summaries in `packages/core/src/logic/schemas/classroom.schema.ts`.
- Educational contracts for student submissions and grading in `packages/core/src/api/educational.contract.ts`.
- Server handlers for assignment reads, submission creation, and grading in `apps/sanctuary-api/src/core/handlers/educational.ts` and `grading.ts`.
- Classroom package services and student/teacher workspace projections.
- Attendance batch recording with local Explore practice and authenticated Sanctuary save paths.
- Idempotency keys, mutation receipts, offline outbox, and sync reconciliation primitives, although coverage is not uniform across every educational mutation.
- `WorkbenchTask*` types and stores in the web client for UI navigation state.
- Durable agent runs and promotion receipts, which are an agent-run lifecycle—not a general LMS workflow engine.

The current domain is therefore capable of adding workflows later, but assignment lifecycle states and transition guarantees are still partly implicit in handlers and database behavior.

## Canonical distinction

```text
Client/channel
  -> capability command
  -> authenticated subject + server-derived scope
  -> domain task mutation
  -> receipt + audit/outbox event
  -> projection/notification for the relevant client
```

A future workflow coordinates commands; it does not bypass them:

```text
Workflow instance
  -> submitAssignment
  -> reviewSubmission
  -> gradeSubmission
  -> publishFeedback
```

Each command remains independently authorized, idempotent, auditable, and safe to retry.

## Minimum contracts to reserve now

These are additive seams and invariants, not an instruction to create tables immediately.

### Domain task

Every authoritative task-like mutation should be able to identify:

- stable resource and tenant/scope IDs;
- actor/subject derived from authenticated context;
- operation name and schema version;
- lifecycle status or result where the domain requires it;
- client-supplied idempotency key bound to the normalized payload;
- optimistic version/concurrency expectation when concurrent edits are possible;
- receipt status: `accepted`, `committed`, `failed`, `conflict`, or `unknown`;
- audit/event intent sufficient for later notification or reconciliation.

Do not force all read models or UI drafts to pretend they are domain tasks.

### Workflow

When the first real workflow is formalized, its contract should include:

```text
WorkflowDefinition (versioned, immutable once used)
WorkflowInstance (subject, scope, definition version, status)
WorkflowStep (logical step and responsible actor/capability)
Transition (from, command, to, preconditions, timestamp, actor)
TaskAssignment (who may act and by when)
Receipt/Event (durable outcome and correlation ID)
```

Required lifecycle semantics:

- legal transitions are explicit and server-enforced;
- repeated commands are safe through idempotency;
- retries never silently duplicate a submission, grade, notification, or side effect;
- unknown outcomes are queryable rather than guessed;
- authorization is evaluated at transition time, not only when the workflow starts;
- cancellation, expiry, rejection, and correction paths are modeled where the domain needs them;
- audit history is append-oriented and does not rely on client-local history;
- notifications are derived from committed events/outbox intent, not from UI optimism;
- offline clients can keep drafts or commands durable without claiming server completion.

## Foundation now versus later

### Add now in the horizontal foundation

1. Keep domain capability names transport-neutral and usable by web/mobile first.
2. Standardize operation identity, idempotency, payload hashing, receipts, and unknown-outcome handling for educational writes.
3. Ensure authorization and tenant/classroom scope are derived on the server for every command.
4. Preserve draft versus committed state in client adapters and sync/outbox records.
5. Emit a durable correlation/event intent for committed mutations where downstream notification or workflow coordination will later be needed.
6. Record API contract/version evolution rules so adding status, receipt, or workflow metadata is additive.
7. Keep `WorkbenchTask` explicitly client-local in naming, types, and persistence.
8. Test duplicate delivery, timeout, retry, offline replay, concurrent edit, revoked access, and scope mismatch for the first representative educational mutation.

### Defer until real LMS demand exists

- A generic workflow engine or visual workflow builder.
- A universal task table spanning personal wellbeing, classroom, school, family, community, and agent runs.
- GraphQL or a second API query model solely for workflows.
- Microservices, a second database, or a separate workflow runtime.
- Cross-channel workflow-specific logic in WhatsApp or Telegram handlers.
- Autonomous agent execution of educational transitions without explicit delegation and human confirmation policy.

## Phased implementation

### Phase L0 — Foundation alignment

Inventory every educational write and classify it as draft, command, receipt, or projection. Add missing idempotency/receipt/error semantics without changing user-visible workflow behavior. Gate: no write can claim success when its durable outcome is unknown.

### Phase L1 — One bounded workflow

Formalize `assignment → submission → review → grade → feedback` using existing assignment/submission/grading capabilities. Start with a versioned state/transition specification and contract tests; do not generalize yet. Gate: teacher/student authorization, duplicate delivery, retries, conflict, and recovery are proven.

### Phase L2 — Shared coordination primitives

Only after L1, extract the repeated transition, assignment, event, receipt, and notification patterns. Keep them in the modular monolith and preserve domain-specific rules in the classroom package.

### Phase L3 — Channel projections

Expose the same bounded capabilities through mobile, WhatsApp, Telegram, and MCP/agent adapters. Channel identity, consent, delegation, and rate limits remain separate from LMS authorization.

### Phase L4 — Additional workflows

Add attendance review, lesson planning, or teacher feedback loops only when a real product need exists. Each workflow must reuse L2 primitives and pass the same failure/recovery gates.

## Review position

The present API is structurally able to move forward without a workflow rewrite. It is not yet honest to call it workflow-complete: educational writes have uneven receipt/idempotency coverage, and the assignment lifecycle is not yet a single explicit state machine. The correct action is to harden the shared operation seam now, prove one LMS workflow later, and let future channels consume it through the canonical API.
