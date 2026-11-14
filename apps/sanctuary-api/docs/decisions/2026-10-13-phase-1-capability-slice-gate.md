---
title: "Phase 1 Capability Slice Gate: Conditional Proceed"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [decision, phase-1, classroom, api, security, evidence, gate]
---

# Phase 1 Capability Slice Gate: Conditional Proceed

## Decision

Select `classroom.note.promote.v1` as the first bounded vertical slice:

> A teacher or principal creates or receives a private lesson draft, reviews the exact proposal, confirms it, and promotes it to an authoritative classroom note.

**Gate outcome:** conditional proceed to a Phase 2 design/implementation packet, but only after the horizontal foundation calibration packet is accepted. Do not release protected cross-door promotion yet.

This is a deliberate **reshape**, not an approval to expose the existing classroom-note CRUD unchanged through AI, chat, assistants, MCP, or workflow automation.

## Why this slice

- It has a meaningful daily workflow and a clear authoritative record.
- The repository already contains classroom-note contracts, handlers, schemas, a domain port/service, lifecycle event model, and tests.
- It can begin with manual text; AI/voice can remain optional proposal assistance.
- It exercises the platform’s hardest shared concerns: scope, confirmation, idempotency, atomic history, receipts, offline drafts, and recovery.
- It is small enough to reject or reshape without committing the whole ecosystem to an unverified agent architecture.

## Evidence reviewed

| Artifact | Finding |
| --- | --- |
| [Capability constitution](../architecture/2026-10-13-phase-1-capability-constitution.md) | Defines purpose, roles, lifecycle, data, doors, transaction and evidence contract |
| [Threat model](../security/2026-10-13-phase-1-classroom-note-threat-model.md) | Identifies 14 repository-grounded abuse paths and release-blocking controls |
| [Phase 1 charter](../current_progress/2026-10-13-phase-1-capability-constitution-charter.md) | Defines milestone/task/gate procedure |
| `packages/core/src/api/educational.contract.ts` | Existing classroom-note CRUD procedures and policy metadata |
| `apps/sanctuary-api/src/core/handlers/educational.ts` | Existing direct note/event writes and DTO mapping |
| `packages/core/src/logic/domains/classroomNotes/ports.ts` | Existing domain persistence seam |
| `packages/core/src/adapters/supabase/educational/classroomNotesRepository.ts` | Existing alternate domain adapter; lifecycle event is currently a separate operation |
| `apps/sanctuary-api/src/__tests__/education.orpc.test.ts` | Mocked/native oRPC procedure assertions; not atomic/recovery/device proof |

## Conditions before Phase 2 protected implementation

Phase 2 may implement behind a feature flag or private test surface only after its packet addresses:

1. actor/scope revalidation for teacher and principal;
2. proposal version bound to human confirmation;
3. actor/payload-bound idempotency and changed-payload conflict;
4. atomic note + lifecycle event + receipt settlement, or a proven equivalent;
5. unknown/lost-response receipt lookup rather than blind retry;
6. content/log/provider redaction and retention policy;
7. shared-device/account-switch and revocation behavior;
8. AI proposal-only boundary and prompt-injection tests;
9. repair/restore/runbook ownership;
10. G0/G1/G2 evidence and named real database seams.

It must also consume the horizontal foundation contract: typed expected failures versus defects, declared oRPC errors, Hono/RFC 9457 mapping, streaming-specific error handling, cancellation/timeout semantics, correlation, redaction, and stable client retry guidance. The vertical slice must not define a private error dialect.

## Not accepted as evidence

- route existence;
- a capability manifest without implementation/receipt mapping;
- a client-provided role, school, or classroom identifier;
- a UI success toast or natural-language AI response;
- a mocked test presented as real database/transaction evidence;
- a provider acknowledgement presented as human delivery or comprehension;
- “encrypted” without key, revocation, and recovery behavior;
- a demo row or seeded fixture presented as an authoritative record.

## Security posture

The Phase 1 threat model is repository-grounded and incorporates the confirmed context: internet-facing managed deployment, multi-tenant school/family data, teacher/principal authorship, and human-confirmed AI proposals. It is a review artifact, not an independent penetration test or production security clearance. T03–T05 and T07–T09 in the threat model remain release-blocking until evidence closes them.

## Phase 2 entry packet

The next task is not “build the API.” It is a bounded packet containing the exact contract delta, application/persistence seam, transaction strategy, receipt schema, policy tests, failure tests, migration/rollback, feature gate, telemetry, and support runbook. Any deletion or replacement of an existing route requires a separate approval under the repository deletion veto.

## Revisit triggers

Reopen this decision if: guardians or students become authors; AI may commit; the authoritative record changes; the deployment becomes self-hosted/cell-based; WhatsApp/Telegram/SMS promotion is requested; offline promotion is required; or the database/provider topology changes.

## Decision status

**Phase 1 design gate: complete with conditional proceed.** The constitution, threat model, bounded slice, explicit lifecycle/data/recovery/cost/evidence requirements, and Phase 2 entry conditions exist. The horizontal foundation calibration is now an explicit prerequisite. Protected production implementation remains gated by the listed evidence.

## Verification boundary

The gate proves that Phase 1 planning artifacts and a conditional decision exist. It does not prove that the current handler is safe to release, that security risks are remediated, or that a Phase 2 implementation will pass its evidence gates.
