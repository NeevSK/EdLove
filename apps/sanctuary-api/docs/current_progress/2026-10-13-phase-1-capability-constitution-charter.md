---
title: "Phase 1 Capability Constitution and Security-Gated Vertical Slice Charter"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [phase-1, milestone, capability, cybersecurity, api, vertical-slice, governance]
---

# Phase 1 Capability Constitution and Security-Gated Vertical Slice Charter

## Charter

Phase 1 converts the API platform direction into a small, reviewable constitution and chooses one real vertical slice. It is deliberately a planning and contract phase. It does not authorize a broad API refactor, GraphQL, a new agent framework, a database migration, a microservice split, or public mutation exposure.

**Calibration:** the selected slice is not implemented on top of an assumed horizontal foundation. Before protected Phase 2 work, the API must establish the foundation floor: typed expected failures versus defects, declared oRPC errors, Hono/RFC 9457 mapping, streaming error behavior, request/operation/trace correlation, retry/timeout/cancellation rules, redaction, and route-family consistency. Effect remains an optional application-layer evaluation, not a prerequisite.

**Active goal:** establish a security-reviewed capability constitution and select one bounded vertical slice with explicit authority, lifecycle, data, recovery, cost, and evidence contracts before broad implementation.

**Recommended slice for planning:** teacher creates a private lesson draft, reviews it, and explicitly promotes it to an authorized classroom note. Manual text is the baseline. AI/voice is optional proposal assistance, never a prerequisite. This slice is a recommendation for Phase 1 planning; it is not yet an implementation approval.

## Bounding triad

1. **Surface & mode:** `apps/sanctuary-api` contracts, handlers, policy middleware, database boundary, and selected web/mobile callers; `[CHAR]` and `[AUTHZ]` planning with `+NO-PROD-CODE`.
2. **Grounded substrate:** current capability audit, layered roadmap, Hono/oRPC router and context, Cedar/double-gate path, classroom/teacher-note contracts and handlers, PowerSync sync boundary, durable-agent/event patterns, and production evidence governance.
3. **Active seam & constraints:** define the smallest safe capability constitution and slice; preserve current behavior, make no deletions, keep the modular monolith, and require cyber-security review before any protected effect is exposed to an additional door.

## Phase boundaries

### In scope

- capability descriptor and lifecycle vocabulary;
- actor, role, active scope, consent, and confirmation rules;
- canonical operation/receipt/error semantics for the selected slice;
- data ownership, classification, retention, and transaction outline;
- threat model and abuse cases;
- current route/contract/handler mapping;
- cost/resource envelope and support owner;
- G0/G1/G2 evidence plan and implementation-ready task breakdown;
- decision record selecting, deferring, or rejecting the slice.

### Explicitly out of scope

- changing production routes or wire formats;
- deleting or deprecating existing handlers;
- adding GraphQL;
- adding MCP, n8n, Mastra, LangChain, CopilotKit, Rivet, Alchemy, or another vendor;
- introducing a second database or microservice;
- claiming production availability, user value, or security certification;
- enabling AI to commit a classroom record without a human-controlled proposal/confirmation path.

## Milestones and timeboxes

Timeboxes begin when the phase is authorized and the owner has access to the required repository/runtime evidence. Dates do not override gates.

| Milestone | Window | Outcome | Gate |
| --- | --- | --- | --- |
| M0 — Ground and ownership | Days 1–2 | Scope, owner, source inventory, decision log, threat-model owner | No implementation starts until the slice and custodian are named |
| M1 — Capability constitution | Days 3–6 | Descriptor, lifecycle, errors, receipts, maturity/mode vocabulary | Domain, security, and API reviewers agree on semantics |
| M2 — Authority and threat model | Days 7–10 | Actor/scope matrix, data classification, abuse cases, security controls | No unmitigated critical/high risk for the proposed slice |
| M3 — Data and operational contract | Days 11–14 | Transaction/outbox/retention/cost/support/restore outline | Database and operator owners accept recovery and cost envelope |
| M4 — Evidence and implementation packet | Days 15–19 | G0/G1/G2 charter, file impact set, rollback, granular tasks | Reviewer confirms bounded additive implementation plan |
| M5 — Phase decision | Days 20–21 | Proceed, reshape, defer, or reject record | Product owner signs the next phase or records why not |

## Roles and separation of duties

One person may hold multiple roles at this stage, but the roles must remain visible.

| Role | Responsibility | Cannot self-approve alone |
| --- | --- | --- |
| Product steward | User outcome, non-goals, stop conditions | Security or data exposure |
| Domain steward | Meaning of lesson draft/note and classroom authority | Infrastructure readiness |
| API engineer | Contract, application seam, transport mapping | Its own security exception |
| Database steward | Ownership, transaction, constraints, migration/restore | User-purpose change |
| Security owner | Threat model, abuse controls, secrets, authorization | Product value/acceptance |
| Client owner | Review/confirmation and truthful states | Server authority |
| Operator | Deploy/configure/monitor/restore and incident path | Data-purpose decision |
| Finance/support steward | Cost, support minutes, funding and replacement coverage | Security risk acceptance |
| Independent challenger | Hostile review and deletion/claim veto | No implementation ownership |

## Task breakdown

### M0 — Ground and ownership

**P1-001 — Freeze the bounded question**

- Write one sentence describing the selected slice and one sentence describing what it must never do.
- Name the authoritative classroom record and the person who can correct it.
- Record the manual baseline: how a teacher currently creates and stores the note.
- **Done when:** product and domain owners agree; no “general lesson automation” language remains.

**P1-002 — Build the source map**

- Map the existing contract, handler, client caller, schema/table, policy metadata, tests, and docs for lesson/classroom notes.
- Mark each as observed, inferred, proposed, or unknown.
- Record legacy and compatibility routes without deleting them.
- **Done when:** every proposed change has an evidence-backed file impact set.

**P1-003 — Assign security and recovery ownership**

- Name security reviewer, database/restore reviewer, operator, and support escalation owner.
- Record absence coverage: who acts if each person is unavailable.
- **Done when:** no critical decision has an unowned reviewer or recovery path.

### M1 — Capability constitution

**P1-010 — Define the descriptor fields**

Create the smallest schema covering: capability ID/version, purpose, audience, actor/scope, input/output, data class, side effect, consent/confirmation, idempotency, offline allowance, cost units, supported doors, receipt query, recovery owner, maturity, and mode.

- Do not make every possible future field mandatory.
- Distinguish a human-readable label from an authority-bearing field.
- **Done when:** the selected slice can be described without mentioning Hono, PostgreSQL, AI, WhatsApp, or a vendor.

**P1-011 — Define lifecycle states**

Use the minimum useful state vocabulary:

`draft → proposed(version) → confirmed → authorized → committed → receipt observed → corrected/exported`

For asynchronous work add `queued`, `unknown`, `failed`, `reconciled`, and `expired`. Define which transitions are server-authoritative and which are local UI states.

- **Done when:** a lost response, repeated confirmation, stale proposal, and provider timeout each have a defined state.

**P1-012 — Define canonical errors**

Map transport errors to stable meanings: validation, unauthenticated, unauthorized, conflict, expired, rate-limited, unavailable, provider-unknown, permanent-failure, and demo/experimental boundary.

- Each error specifies safe user copy, retryability, operation ID, and escalation owner.
- **Done when:** mobile, web, and a hypothetical chat adapter can make the same retry/confirmation decision.

**P1-013 — Define receipt semantics**

Specify the operation ID, idempotency key scope, payload binding, replay response, retention, lookup authorization, and redaction. A receipt must distinguish classroom commit from any later notification or AI generation.

- **Done when:** “saved,” “queued,” “delivered,” “unknown,” and “not authorized” cannot be collapsed into one boolean.

### M2 — Authority and cybersecurity

**P1-020 — Build the actor/scope matrix**

For teacher lesson work, enumerate authenticated person, active bond, school, classroom, teacher relationship, device trust, network zone, and any student references. Mark server-derived versus caller-supplied values.

- Parent/guardian, principal, student, former teacher, shared-device user, and anonymous paths must be explicit deny/allow cases.
- **Done when:** a caller cannot promote a note merely by naming a classroom or teacher ID.

**P1-021 — Classify data and minimize it**

Label draft text, classroom identifiers, student references, audio, model prompts, model outputs, audit metadata, and receipts. Define what is never sent to a provider, what may be cached offline, and what must be redacted from logs.

- Include child/student data, teacher private notes, shared-device exposure, and provider retention.
- **Done when:** each field has purpose, access scope, retention, export, and deletion/correction owner.

**P1-022 — Threat-model the complete path**

Threats to test and control:

- stolen/recycled/shared phone and account switching;
- forged or stale active scope;
- replayed confirmation or reused idempotency key with changed content;
- prompt injection through lesson text, document, or external message;
- model/tool confusion causing a proposal to be treated as a commit;
- cross-classroom/tenant enumeration through errors or query filters;
- malicious or misconfigured webhook/provider callback;
- compromised worker or outbox replay;
- log, trace, model-provider, backup, and support-channel leakage;
- denial of service through transcript, media, sync, retry, or fan-out amplification;
- unsafe demo/experimental result reaching an authoritative surface;
- operator credential loss or unauthorized successor access.

For every threat record asset, actor, precondition, control, detection, recovery, residual risk, and evidence level.

- **Done when:** no high-risk threat is described only as “Cedar handles it” or “the API is authenticated.”

**P1-023 — Review cryptographic and secret boundaries**

- Identify JWT verification, webhook signature/token paths, provider keys, model keys, encryption keys, local storage keys, signing keys, and operator credentials.
- Check that secrets never enter capability descriptors, client bundles, logs, prompts, or receipts.
- Define rotation, revocation, and incident response owner.
- **Done when:** every secret has storage, use, rotation, and failure behavior documented.

**P1-024 — Define adversarial evidence**

Plan negative tests for forged scope, stale teacher role, duplicate confirmation, changed payload, cross-account receipt lookup, prompt-injected content, oversized input, provider timeout, worker crash, and restore from backup.

- **Done when:** each threat has a named G1 or G2 test; owned database/authorization seams are marked for INT/AUTHZ/FAIL evidence.

### M3 — Data and operational contract

**P1-030 — Draw the transaction boundary**

Identify the single commit containing classroom note, revision/provenance, receipt, audit event, and any outbox intent. Identify everything that must happen later and cannot be part of the transaction.

- **Done when:** no external provider or model call is hidden inside “saved.”

**P1-031 — Define persistence ports**

Name domain-specific ports for draft, proposal, authorization facts, commit, receipt, and repair. Document the current ZenStack/PostgreSQL adapter without creating a generic repository abstraction.

- **Done when:** the application contract could be tested with an in-memory boundary and later backed by a cell without changing its meaning.

**P1-032 — Define offline and revocation behavior**

- Decide whether private draft creation is allowed offline.
- Decide whether promotion to classroom note always requires current server authority.
- Define stale scope, revoked teacher, device loss, conflict, and account-switch behavior.
- **Done when:** cached data never silently authorizes a protected server commit.

**P1-033 — Define recovery and restore**

- Specify accepted-but-undispatched repair, duplicate replay, partial transaction, backup restore, migration rollback, and operator escalation.
- Define maximum pending age for a note promotion and who repairs it.
- **Done when:** every failure leaves a visible state and a repair owner.

**P1-034 — Price the slice**

Estimate relative cost drivers: API/database work, storage, sync bytes, optional audio/model usage, support minutes, review time, backup/restore, and incident reserve. Do not use free-tier assumptions as the baseline.

- **Done when:** the slice can run with AI disabled and has a support budget.

### M4 — Evidence and implementation packet

**P1-040 — Write the G0/G1/G2 charter**

- G0: descriptor schemas, state machine, policy matrix, error/receipt contract, static route coverage.
- G1: boundary authorization, validation, idempotency, redaction, and error mapping with declared substitutions.
- G2: teacher workflow, duplicate confirmation, stale scope, offline draft, crash/retry, provider timeout, and account switch.
- Mark G3/G4/G5/R1 as future requirements rather than pretending they are complete.

**P1-041 — Prepare the implementation impact set**

List exact contracts, handler/application files, policy definitions, database migration candidates, clients, tests, docs, telemetry, and runbook files. Include files explicitly not to touch.

- **Done when:** scope is bounded and no broad “clean up API” task remains.

**P1-042 — Prepare rollback and migration plan**

- Prefer additive contract fields and adapter paths.
- Define feature-flag/route gating and old-client behavior.
- Define database migration rollback or forward-compatible fallback.
- No deletion or deprecation without a separate approval record.

**P1-043 — Security review packet**

Bundle descriptor, data-flow diagram, actor/scope matrix, threat model, secret map, abuse tests, retention/export policy, and residual-risk decisions for security review.

- **Gate:** unresolved high-risk issue blocks Phase 2 implementation.

**P1-044 — Horizontal foundation calibration packet**

- Select representative read, validation failure, authentication failure, authorization denial, conflict, dependency outage, timeout, and streamed AI failure paths.
- Map each path from domain/application failure through oRPC or Hono transport to stable client response and structured observability.
- Record retryability, cancellation behavior, operation/receipt correlation, redaction, and client action for each path.
- Verify that direct JSON/text webhook/AI routes either intentionally use a protocol-specific adapter or map to the same canonical semantics.
- **Gate:** the selected slice cannot enter protected implementation until this packet is accepted. A global error handler alone is insufficient evidence.

### M5 — Phase decision

**P1-050 — Hostile review meeting/record**

Ask: What if the request drops after commit? What if the teacher loses the phone? What if the student text contains instructions to the model? What if the role is revoked while offline? What if the database restores yesterday’s state? What if the support owner disappears? What does the user see in each case?

**P1-051 — Select one decision**

Record exactly one:

- **Proceed:** implementation packet accepted and Phase 2 authorized.
- **Reshape:** capability remains useful but scope/door/data/AI is reduced.
- **Defer:** evidence or ownership is missing; no implementation starts.
- **Reject:** the workflow causes more burden/harm than value.

**P1-052 — Update the evidence ledger and goal**

Record completed artifacts, unresolved risks, evidence levels, and the next bounded goal. Do not call Phase 1 complete because documents exist; the gate requires a decision and named residual risks.

## Phase 1 acceptance checklist

- [ ] One capability and one authoritative record are named.
- [ ] Product, domain, API, database, security, operator, support, and challenger roles are assigned.
- [ ] Descriptor and lifecycle are transport-independent.
- [ ] Actor/scope/consent/confirmation are explicit.
- [ ] Data classes, provider boundaries, retention, export, and correction are explicit.
- [ ] Threat model includes abuse, privacy, prompt injection, replay, DoS, secrets, and operator failure.
- [ ] Transaction, idempotency, receipt, outbox, conflict, offline, and restore behavior are explicit.
- [ ] Cost and support envelope exists without requiring AI.
- [ ] G0/G1/G2 evidence charter names substitutions and real seams.
- [ ] Horizontal error/timeout/cancellation/observability calibration packet is accepted.
- [ ] Granular implementation impact set and rollback plan exist.
- [ ] Security packet is reviewed; no unresolved high-risk issue is silently accepted.
- [ ] Product owner records proceed/reshape/defer/reject.

## Phase stop conditions

Stop Phase 1 and ask for a decision if:

- the authoritative record or correction owner cannot be named;
- protected work can be committed from stale/offline authority without an explicit policy;
- the receipt cannot distinguish committed, queued, unknown, and failed;
- a model/provider receives data without a purpose and retention decision;
- security depends on an unverified client header, natural-language claim, or hidden shared secret;
- support/recovery requires an unnamed person or unpaid heroics;
- the cost envelope is unknown enough that the first pilot cannot be funded;
- resolving the slice requires deleting or replacing existing behavior without approval.

## Expected Phase 1 artifacts

1. Capability descriptor draft.
2. Lifecycle/error/receipt contract.
3. Actor/scope and data-classification matrix.
4. Threat model and abuse-case ledger.
5. Secret/provider boundary map.
6. Data ownership and transaction/outbox outline.
7. Offline/revocation/conflict/recovery policy.
8. Cost/support envelope.
9. G0/G1/G2 evidence charter.
10. Bounded Phase 2 implementation packet.
11. Proceed/reshape/defer/reject decision record.

## Verification boundary

This charter is a planning artifact. It does not prove that the selected slice is secure, affordable, recoverable, or useful. Phase 1 is complete only after the listed artifacts exist, the security packet has been reviewed, and the product decision is recorded. No product code, route, database schema, provider configuration, or secret was changed by creating this charter.
