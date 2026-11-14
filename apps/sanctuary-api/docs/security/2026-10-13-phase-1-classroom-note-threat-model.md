---
title: "Phase 1 Classroom Note Capability Threat Model"
status: "draft"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [security, threat-model, phase-1, classroom, multi-tenant, ai]
---

# Phase 1 Classroom Note Capability Threat Model

## Scope and assumptions

In scope: the proposed `classroom.note.promote.v1` capability, from web/mobile draft and confirmation through API authorization and durable classroom-note commit. Adjacent AI proposal, local draft, database, logs, provider, worker, and support boundaries are included where they can affect this capability.

Assumptions confirmed for this phase: internet-facing managed deployment; multi-tenant school/family data; teachers and principals may author; AI drafts/proposes only; human confirmation is required. Production topology, staffing, backup configuration, and provider contracts remain unknown.

Out of scope: a complete Sanctuary penetration test, all API routes, physical school hubs, WhatsApp/Telegram/SMS promotion, general MCP, and provider-specific certification.

## Repository-grounded system model

| Component/entry point | Evidence | Security relevance |
| --- | --- | --- |
| Native oRPC educational procedures | `packages/core/src/api/educational.contract.ts`; `apps/sanctuary-api/src/core/handlers/educational.ts` | Note CRUD, DTO validation, policy metadata, direct ORM writes |
| Separate classroom-note contract/domain port | `packages/core/src/api/classroomNotes.contract.ts`; `packages/core/src/logic/domains/classroomNotes/{ports,services}.ts` | Existing domain seam; API path does not consistently use it |
| Request context | `apps/sanctuary-api/src/core/router.ts` and `orpc.ts` | JWT identity, active bond, school/classroom relationship, security context |
| Authorization middleware | `apps/sanctuary-api/src/core/orpcMiddleware.ts` | Cedar/double-gate policy and resource facts |
| Server database | ZenStack/PostgreSQL client through `context.db`; `classroomNote`, `classroomNoteEvent` | Integrity, tenancy, audit, transaction/recovery |
| Local sync | PowerSync/op-sqlite adapters and `sync.uploadBatch` | Offline drafts/queued writes; stale authority and replay boundary |
| AI route | `apps/sanctuary-api/src/ai/routes.ts` | Prompt/output/provider/billing/privacy boundary; proposal only |
| Logs/telemetry | Hono request IDs, OTel/Pino/Sentry paths | Potential content/identity/secret leakage |
| Tests | `src/__tests__/education.orpc.test.ts` and related setup | Mostly mocked/in-memory contract evidence; not production proof |

## Trust boundaries

1. **Person/device → client:** shared/recycled device, account switching, local storage, screenshots, accessibility/clipboard exposure.
2. **Client → API:** bearer authentication, request validation, operation identity, proposal version, current scope, transport replay.
3. **API → authorization/data:** Cedar/double gate, active bond, classroom relationship, tenant isolation, server-derived author.
4. **API → database:** ORM writes, lifecycle event, receipt, transaction and backup boundary.
5. **API → AI/provider:** learner-sensitive prompt/output, provider key, retention, model-generated proposal, prompt injection.
6. **API → worker/outbox/provider:** delayed execution, duplicate/retry, provider acceptance versus delivery, webhook authenticity.
7. **API → telemetry/support:** logs, traces, errors, dashboards, operator access and incident exports.
8. **Database/backup → successor/operator:** restore, exports, retention/deletion, credential rotation and institutional transfer.

## Assets

- classroom note content, draft content, learner names/references, and classroom membership;
- teacher/principal identity, active bond, role, school/classroom scope, and revocation state;
- operation IDs, idempotency keys, proposal versions, receipts, and lifecycle provenance;
- JWT/signing/webhook/provider/model/local-storage keys;
- database integrity, tenant isolation, backup/restore copies, and audit history;
- model prompts/outputs, provider billing data, and user privacy mode;
- API/database/worker capacity and queue fairness;
- operator credentials, runbooks, support exports, and incident evidence.

## Attacker capabilities

Assume a realistic internet attacker can send malformed, replayed, oversized, and high-volume requests; an authenticated ordinary user can attempt cross-classroom or cross-tenant identifiers; a compromised/shared device can expose cached drafts; malicious lesson text can attempt prompt injection; a provider/webhook can fail or replay; and an operator or worker credential can be lost or misused. Do not assume database administrator compromise, OS escape, or cryptographic breakage for this slice; those require separate infrastructure reviews.

## Abuse paths and priorities

| ID | Abuse path and impact | Existing controls | Likelihood | Impact | Priority | Required Phase 2 control/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Teacher or principal submits another classroom/school ID to create or read a note; cross-tenant disclosure/integrity loss | Active context, classroom ID derivation, double gate, Cedar metadata | Medium | High | High | Server-derived relationship tests; deny forged IDs; AUTHZ G1 + real DB seam |
| T02 | Revoked teacher confirms an offline/stale proposal; unauthorized record mutation | Current context revalidation direction; offline boundary not yet constitutional in code | Medium | High | High | Require current server authority at promotion; stale-role G2 |
| T03 | Same confirmation is replayed; duplicate note or duplicate lifecycle event | Existing procedure tests; no classroom-note idempotency in contract | High | High | Critical | Payload-bound idempotency ledger/constraint, replay result, changed-payload conflict, RACE/FAIL |
| T04 | Note write succeeds but lifecycle event fails; record has no audit/provenance or snapshot consistency | Event table exists; handler performs separate operations | Medium | High | High | Single transaction or durable repair invariant; DB failure injection and restore evidence |
| T05 | Client times out after commit and blindly retries; duplicate or misleading “failed” state | No receipt contract for this slice | High | High | Critical | Operation receipt lookup, unknown state, safe retry guidance, G2 |
| T06 | Malicious lesson content instructs AI/tool to promote, export, or reveal data | AI route validates size/circuit/rate but is not a domain action authority | Medium | High | High | Treat content as untrusted data; proposal-only AI; tool boundary tests and human confirmation |
| T07 | Sensitive draft/prompt/content leaks into logs, traces, provider storage, or support exports | Privacy modes and telemetry exist; field-level slice policy not yet defined | Medium | High | High | Data classification/redaction tests; provider retention decision; secret/content scan |
| T08 | Error/receipt lookup accepts another user’s operation ID; metadata enumeration | Authorization middleware exists for resource routes; receipt path not yet defined | Medium | High | High | Actor/scope-bound receipt lookup and non-enumerating errors; AUTHZ G1 |
| T09 | Shared/recycled device exposes local draft or confirms under wrong account | Native storage/sync exists; account boundary varies by client | Medium | High | High | Account-switch purge/partition behavior, lock-screen/privacy review, G2/device later |
| T10 | Oversized content, repeated AI calls, sync replay, or fan-out exhausts API/DB/provider budget | Body limit, timeout, rate limits, AI transcript caps | Medium | Medium/High | High | Capability cost units, per-actor/tenant budgets, retry bounds and load scenario |
| T11 | Demo/experimental result is treated as authoritative classroom record | Demo modes exist in durable-agent paths | Low/Medium | High | High | Mode typed in descriptor/receipt; production catalog excludes demo; negative test |
| T12 | Worker/outbox dispatch is lost or repeated after process failure | Durable event/run patterns; handoff repair not yet proven | Medium | High | High | Accepted→dispatched repair job, same event identity, crash injection |
| T13 | Webhook/provider callback is forged or replayed into a note-related effect | Provider-specific routes/signature controls elsewhere | Low/Medium | High | High | Keep external providers out of Phase 1 commit; if added, signature/dedupe/receipt tests |
| T14 | Operator credentials/backup export expose school data during recovery | Operational controls unknown | Low/Medium | High | High | Least privilege, rotation, audited recovery, export minimization and successor procedure |

## Required controls before protected promotion

1. Server-derived identity, role, school, classroom, and author; no client header as authority.
2. Current policy evaluation immediately before commit.
3. Exact proposal version bound to human confirmation.
4. Payload-bound, actor-scoped idempotency with changed-payload rejection.
5. Atomic classroom-note + lifecycle event + receipt settlement, or an explicitly proven equivalent.
6. Receipt lookup authorized to the initiating actor and permitted institutional scope.
7. No raw content/secrets in ordinary logs, traces, errors, or tool descriptions.
8. AI cannot call the commit directly; it can return a typed proposal.
9. Offline local drafts cannot settle protected authority after revocation.
10. Bounded input, retry, token, storage, and per-tenant resource budgets.
11. Explicit real/demo/experimental mode separation.
12. Repair owner and runbook for unknown, partial, or delayed operations.

## Evidence plan

| Control | Evidence level | Required proof |
| --- | --- | --- |
| Input/output/receipt schemas | G0 | Static schema and contract inspection |
| Server-derived scope | G1 + AUTHZ | Forged classroom/school/author IDs denied under named doubles; real DB relationship check where claimed |
| Replay/idempotency | G1 + RACE | Same key/same payload replays; same key/changed payload conflicts; concurrent duplicate test |
| Atomic event history | INT + FAIL | Real transaction/failure injection proves no unrecorded committed note, or explicit repair state |
| AI proposal boundary | G1/G2 | Prompt injection cannot create an effect; human confirms exact proposal version |
| Privacy/redaction | G1 | Sensitive content absent from logs/errors/provider payload where prohibited |
| Offline/revocation | G2; G5 later | Local draft survives permitted interruption; revoked actor cannot promote |
| Recovery/restore | FAIL/DATA | Dropped response, worker crash, backup restore, and repair owner are observable |

## Residual risks and assumptions

The current repository does not prove production database topology, RLS/ZenStack deployment parity, backup configuration, provider retention, physical-device behavior, or operator access controls. The current native educational handler performs note and event writes separately. These are not silently accepted as secure; they block protected cross-door promotion until addressed or explicitly risk-accepted by the responsible security/data owner.

If the deployment is not internet-facing, risk likelihoods should be recalibrated—not removed. If guardians or students become authors, the actor matrix and data purpose must be reworked. If AI authority expands beyond proposal, this threat model is invalid and must be reopened.

## Security decision

**Conditional proceed to Phase 2 design/implementation packet; do not release the protected capability yet.** The bounded slice is worthwhile and has a credible authority model, but T03–T05 and T07–T09 remain release-blocking until their controls and evidence exist. This report is a draft threat model pending independent security review; it is not a clearance.

## Verification boundary

This is a repository-grounded threat model based on static source inspection and the confirmed Phase 1 assumptions. It does not prove exploitability, remediation, production configuration, penetration resistance, or security certification. The listed controls and evidence are required before protected release.
