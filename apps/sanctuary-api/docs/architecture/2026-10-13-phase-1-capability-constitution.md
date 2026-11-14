---
title: "Phase 1 Capability Constitution: Classroom Note Vertical Slice"
status: "draft"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [phase-1, capability, constitution, classroom, lifecycle, authority]
---

# Phase 1 Capability Constitution: Classroom Note Vertical Slice

## Status and assumptions

This is the proposed constitution for the first bounded capability slice. It is not a production contract until the Phase 1 decision record accepts it and Phase 2 implementation evidence exists.

Security context for this draft: internet-facing managed deployment; multi-tenant school/family data; teachers and principals may author classroom notes; AI may draft or propose but may not commit; a person must confirm a protected promotion.

## Capability identity

| Field | Constitution |
| --- | --- |
| Capability ID | `classroom.note.promote.v1` |
| Human purpose | Turn a teacher/principal-reviewed lesson draft into an authoritative classroom note |
| Primary place | 🛠️ Workspace → 👩‍🏫 Classroom or 🏫 School |
| Private precursor | 🫶 Self/private draft or local draft surface, not yet a classroom record |
| Authoritative record | `classroom_notes` plus lifecycle event/provenance record |
| Allowed authors | Authenticated teacher or principal with current server-verified classroom/school authority |
| AI role | Optional draft/proposal generation only; never authoritative and never auto-commit |
| First doors | Web/mobile first; chat/assistant/MCP are not enabled by this constitution |
| Mode | `real` for committed records; `demo` and `experimental` cannot satisfy this capability |
| Data class | School/classroom operational data; content may contain sensitive learner information and is treated as restricted by default |

## Non-goals

- This does not create a general lesson-planning or grading agent.
- This does not authorize parent/guardian or student promotion of a classroom record.
- This does not authorize offline promotion using stale role authority.
- This does not send WhatsApp, Telegram, SMS, push, or email as part of the classroom commit.
- This does not treat an AI response, provider response, or UI toast as a saved record.
- This does not expose raw database procedures to agents or automation.

## Authority model

The caller supplies the proposed content and selected classroom identifier. The server derives and verifies identity, active bond, role, school, classroom relationship, and current authorization. Caller-supplied teacher/principal IDs, school IDs, or role labels are hints at most and cannot establish authority.

| Actor | Draft privately | Read classroom notes | Promote draft | Update/delete existing note |
| --- | --- | --- | --- | --- |
| Teacher with current classroom bond | Yes | Assigned classroom(s) | Yes, assigned classroom(s) | Only according to explicit note ownership/school policy |
| Principal with current school authority | Yes | School-authorized classrooms | Yes, school-authorized classrooms | According to explicit school policy and audit |
| Student | Private personal draft only | Only visible notes allowed by policy | No | No |
| Parent/guardian | Private communication/read surfaces as separately authorized | No by default through this slice | No | No |
| Former/revoked teacher | Existing permitted historical read only if policy allows | No new promotion | No | No |
| Anonymous/shared device user | No protected operation | No protected operation | No | No |
| AI/provider/automation | May prepare a proposal | Only scoped data explicitly supplied | No | No |

Promotion always revalidates current server authority. A cached local permission snapshot may help render UI but cannot settle the protected commit.

## Lifecycle constitution

```text
local_draft
  → proposal(version, source, provenance)
  → human_confirmed(version)
  → server_authorized(current scope)
  → committed(note + lifecycle event + receipt)
  → inspected/corrected/exported
```

Failure and asynchronous states:

```text
proposal_expired | authorization_rejected | conflict | failed
unknown_commit | repair_pending | reconciled
```

### State meanings

| State | Meaning visible to client | Authority |
| --- | --- | --- |
| `local_draft` | Exists only in permitted local storage; loss/revocation caveats apply | Device/client |
| `proposal` | Exact content/version waiting for human confirmation | Client plus signed/identified operation context |
| `human_confirmed` | Person confirmed this exact version; not yet a commit | Server records confirmation request; no record yet |
| `server_authorized` | Current server policy permits this operation | Server policy evaluator |
| `committed` | Classroom record and lifecycle event are durable in one accepted transaction | Server database |
| `unknown_commit` | Client lost response and cannot safely infer commit outcome | Server receipt lookup/reconciliation |
| `repair_pending` | Accepted work needs dispatcher/recovery action | Server operator/worker |
| `reconciled` | Previously unknown/failed external or repair state has a final recorded outcome | Server receipt/audit |
| `proposal_expired` | Old confirmation cannot authorize a newer proposal | Server version/expiry check |

## Proposed request contract

The Phase 2 contract must carry, or derive, these values:

```text
operation_id: unique operation identity
idempotency_key: caller retry identity scoped to actor + capability + payload
proposal_version: exact content/version being confirmed
classroom_id: requested target, revalidated server-side
content: reviewed content; normalized and bounded
note_type / visibility: constrained enum values
confirmation: person/device action bound to proposal_version
source: manual | imported | ai_proposal | voice_proposal
provenance: optional model/provider/source metadata, redacted as needed
```

The response must include a stable operation/receipt identifier, canonical state, authoritative note DTO when committed, safe error category, and next action. It must never return `success: true` for a queued, unknown, or uncommitted state.

## Data and retention constitution

| Data | Authority | Default handling |
| --- | --- | --- |
| Draft text | Device or private draft store until submitted | Encrypt where supported; user can discard/export; visibly local |
| Proposed text | Operation record or bounded request context | Retain only as long as needed for confirmation/recovery; redact logs |
| Classroom note | Server authoritative database | Tenant/school scope, audit/provenance, correction path |
| Lifecycle event | Server authoritative audit/history | Append-only intent; correction does not erase provenance silently |
| AI prompt/output | Provider-specific transient or persisted AI store | Human-selected privacy mode; no automatic classroom authority |
| Receipt | Server operation/receipt ledger | Minimal metadata; authorized lookup; bounded retention |
| Logs/traces | Operations telemetry | No raw learner content, tokens, secrets, or unrestricted prompt text |

No provider receives learner-sensitive content unless the purpose, provider, retention, and user/institution policy are explicit. A provider result is evidence for a proposal, not a source of authority.

## Transaction and recovery constitution

The authoritative commit must atomically settle the classroom note, lifecycle event/provenance, and operation receipt. If an external notification is later desired, it becomes a separate outbox effect with its own status; it is not part of “note committed.”

The current source path writes the note and lifecycle event as separate ORM operations and does not expose an idempotency key in the classroom-note contract. Therefore the current path is **not yet Phase 2-ready for protected cross-door promotion**. Phase 2 must either route the slice through a transaction-capable application service or record a deliberate database procedure/transaction boundary with equivalent evidence.

Retry rules:

- same operation key and same payload returns the original receipt/result;
- same operation key with changed payload is rejected as a conflict;
- lost response triggers receipt lookup, never blind re-submission;
- stale proposal version is rejected and preserves the newer draft;
- database/provider timeout yields unknown or failed, never fabricated success;
- repair uses the same operation identity and is observable to the operator.

## Door policy

| Door | Phase 1 status | Permitted shape |
| --- | --- | --- |
| Web/mobile | In scope for contract design | Draft → exact review → confirmation → receipt |
| WhatsApp/Telegram/SMS | Deferred | No protected promotion until linking, message integrity, and receipt UX are proven |
| Device assistant | Deferred | Read/draft proposal only until platform invocation and confirmation are proven |
| MCP/authorized agent | Deferred | No raw tool; future proposal-only, resource-bound adapter |
| Local/offline | Partial | Private draft and selected read; protected promotion requires current server authority |

## Evidence constitution

- **G0:** descriptor, lifecycle state machine, policy matrix, data classes, error/receipt schemas, static contract coverage.
- **G1:** authorization allow/deny, malformed input, idempotency/replay, proposal-version expiry, redaction, and safe errors under named test doubles.
- **G2:** teacher and principal journeys, duplicate confirmation, stale role, account switch, offline draft, dropped response, database failure, restore/repair, and content prompt injection.
- **G3/G4/G5/R1:** required later for component, browser/mobile, physical-device, and pilot claims.

Existing oRPC tests prove named mocked procedure behavior; they do not prove the atomic transaction, real database, physical device, or provider recovery claims above.

## Constitutional decision

Phase 1 may proceed to a bounded Phase 2 implementation packet **only after** the threat model and transaction/recovery plan are reviewed. The constitution deliberately authorizes a smaller protected surface than the current broad route inventory. It does not authorize exposing the existing classroom-note handler unchanged through new AI or messaging doors.

## Verification boundary

This constitution is a proposed contract derived from the current repository surface. It does not prove atomic persistence, production authorization, device recovery, provider privacy, or participant usefulness. Those claims require the G0/G1/G2 and later runtime evidence named above.
