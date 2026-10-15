---
title: "Integration Rounds: Scenarios, Scales, Milestones, and Open Decisions"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [integration, scenarios, scale, milestones, decisions, resilience]
---

# Integration Rounds: Scenarios, Scales, Milestones, and Open Decisions

## Method and status

Each round below incorporates the preceding perspective, challenges the accumulated recommendation, and leaves an explicit unresolved condition. These are author-reasoned integration rounds, not stakeholder meetings or independent specialist sign-offs. Conclusions are proposed and may change when field/runtime evidence arrives.

The later [technical frontier](12-technical-frontier-and-edge.md), [material reality](13-material-reality-and-access.md), and [combined integration](14-frontier-reality-integration.md) extend these rounds through R13, add S23–S32, and add resource/maturity gates to each milestone. Read them before selecting an edge or on-device implementation path.

## Cumulative integration ledger

| Round | New contribution | Collision with previous rounds | Proposed resolution | Evidence still owed |
| --- | --- | --- | --- | --- |
| R0: vision | Interfaces and ownership can evolve across decades | Today's gaps could prematurely shrink imagination | Keep alternative horizons open; choose one learning experiment | Participant priorities and current deployment inventory |
| R1: architect | Shared authority can have several processes/cells | More distribution raises coordination cost | Modular owned boundaries first; split for measured reason | Failure domains, actual workload/operator capacity |
| R2: engineer | Operation identity, exact proposals, receipts and outbox | A “small core” can turn into a giant executor | Share contracts; domains retain effect validation | Crash/replay and real-DB seam evidence |
| R3: UX | Honest states and least-burden interaction | Security/confirmation can become ritual friction | Review consequences; private drafts and ordinary reads stay simple | Comprehension, correction, accessibility and language observations |
| R4: business | Whole-workflow value, custody, adoption | Technical success may create parallel clerical work | Measure net effort and accepted artifacts | Institutional acceptance, role lifecycle, support burden |
| R5: security | Linked actors, bounded delegation, current authorization | Offline continuity delays revocation | Allow specified cached/private work; revalidate protected settlement | Shared-device, stale-role, malicious-input and isolation evidence |
| R6: finance | Recurring operation and support dominate hidden cost | HA/hubs/cells may exceed stewardship capacity | Match service promise to funded owner and conservative budget | Rate cards, labor costs, usage sensitivity and funding continuity |
| R7: database | Atomic owned writes and explicit external uncertainty | Generic sync cannot preserve every invariant | Classify consistency per domain; reconcile external results | Transactions/races, migration, backup/restore and queue repair |
| R8: hostile review | Existing simulations and unproven transports defeat blanket guarantees | Documentation can become capability theatre | Maturity labels, blockers, falsification experiments and exit criteria | Independent challenge and selected runtime proof |
| R9: product | Several portfolios, one bounded first proof | Breadth can exceed maintenance capacity | Dream widely; gate each release by useful outcome and ownership | Product steward selection and staffed execution scope |

### Integration outcome

Proposed initial backbone: bounded domain modules, authoritative protected records, durable acceptance/receipts, external effects through recoverable workers, local drafts/scoped cached reads, and consistent lifecycle meaning across chosen doors. A modular deployment may later replicate or split. Cells, school hubs, federation, and ambient assistants remain legitimate future paths with distinct conditions.

The logical system remains distributed whenever a device, API, database, worker, or provider crosses a failure boundary. A modular monolith reduces internal deployment complexity; it does not eliminate delayed messages, uncertain external effects, partitions, or recovery obligations.

## Cross-role worked scenario: lesson record

1. Teacher starts with manual text, web form, mobile entry, or voice. Classroom/date/role are explicit or clarified. Unsupported fields stay empty.
2. Draft persists in the actual available store. UI says local, accepted, or pending according to evidence. AI can help but is optional.
3. Teacher reviews the exact proposal/version. The channel confirms only that proposal; expiry/revision invalidates an older approval.
4. Server revalidates teacher authority and the requested domain effect. In one owned commit, write record/revision, receipt, audit metadata, and notification intent if appropriate.
5. Lost response leads to operation lookup/replay. It does not create a fresh action. Contradictory edits return a conflict while preserving the draft.
6. External notification proceeds independently. Provider acceptance/delivery/unknown state is recorded separately from the lesson commit.
7. Teacher can inspect, correct, and export the record. A staff departure revokes new school actions without falsely erasing the history of authorized past work.

Architect: bounded seams. Engineer: durable IDs and handoffs. UX: exact review and truthful states. Business: accepted record and saved effort. Security: linked actor/current scope. Finance: bounded inference/message cost. Database: atomic commit/uniqueness. Reviewer: kill the process at every boundary. Product: call it delivered only when participants and evidence support it.

## Scenarios and failure budgets

Every scenario must name actors, scope, stored work, trigger, visible result, permitted effect, retry/recovery owner, and evidence. These are test/field contracts, not executed results.

| ID | Scenario | Required behavior | What cannot be promised |
| --- | --- | --- | --- |
| S01 | Modern phone, good signal, busy teacher | Fast manual/voice draft with clear class/date and correction | Voice always cheaper or faster than typing |
| S02 | Parent prefers WhatsApp, no app | Useful minimal notice/read; scoped linking where required | Access to existing groups/history or arbitrary bot features |
| S03 | Link outside messaging data allowance | Essential notice includes sufficient in-channel information; optional link | Zero-rated deep link/media without current telco evidence |
| S04 | Shared/recycled number | Minimal disclosure before relinking; revoke old relationship | Number alone identifies a person forever |
| S05 | API down while device offline | Cached permitted reads and durable local drafts; visibly pending protected work | New login, uncached records, immediate authoritative commit |
| S06 | DB down while webhook arrives | No success acceptance without durable storage; recovery/retry boundary explicit | HTTP 200 plus background work is lossless |
| S07 | Run persisted, event dispatch fails | Durable pending dispatch can be repaired and retried with same identity | Inngest can recover an event never delivered to it |
| S08 | Provider accepted then timed out | Separate unknown delivery; reconciliation or bounded safe retry | Exactly one message without provider support |
| S09 | Confirm tapped twice/on two clients | One authorized domain effect; same receipt for replay | Distinct business duplicates disappear merely from HTTP dedupe |
| S10 | Proposal changed or expired | Reject old confirmation; show current draft | Generic Confirm represents any later proposal |
| S11 | Teacher revoked before offline replay | Preserve personal draft; deny protected effect on current policy | Immediate deletion of every offline cached byte |
| S12 | Two teachers change same attendance/grade | Explicit conflict/correction policy and attribution | Device timestamp decides educational truth |
| S13 | AI wrong/unavailable | No invented required values; deterministic/manual path | Model confidence proves correctness |
| S14 | One tenant floods requests or reconnects | Per-tenant fairness, bounded work, core resource protection | Shared-process replicas guarantee isolation |
| S15 | Region/carrier/power interruption | Known physical/offline alternatives; delayed reconciliation | Another cloud channel is independent regional resilience |
| S16 | Phone destroyed with unsynced draft | Explain local-only loss; export/backup choices before reliance | Local persistence equals disaster recovery |
| S17 | Migration/erroneous batch damages data | Bounded rollout, rollback compatibility, isolated restore drill | Live replica repairs logical corruption |
| S18 | Malicious agent/document/peer | Content cannot grant authority; effects remain scoped/validated | Encryption or user consent permits all future actions |
| S19 | Operator/funding lost | Credential custody, successor/exit procedure, usable export | Volunteers or grants last indefinitely |
| S20 | Institution leaves or student transfers | Explicit data custody and portable selected information | All institutional records belong to any requesting individual |
| S21 | School hub partitions from cloud | Specified provisional/cache behavior and authority epochs if writing | Both sides commit every record without disputes |
| S22 | Wellbeing content on shared device | Private storage/preview controls; no school role disclosure | A “Sanctuary” label itself proves privacy |

## Scale scenarios: separate people, workload, and social scope

The numbers are synthetic planning envelopes. They establish questions, not benchmarked capacity or adoption forecasts. Student population, daily active devices, simultaneous actors, and writes are different denominators.

| Scenario | Illustrative envelope | Technical pressure | Operating/social pressure | Candidate response |
| --- | --- | --- | --- | --- |
| Individual/proof | 1–20 participants, one task | Correctness and recovery dominate | Direct observation, no representativeness claim | Existing deployment; bounded controlled test |
| Institution pilot | 1–3 institutions, 50–500 active participants | Morning bursts, linking and scoped sync | Training, custody, dispute resolution | Durable workflow, monitored limits, restore rehearsal |
| Cluster | 10–100 institutions, 1k–20k active participants | Pools, hot tenants, retry amplification, media growth | Named support/release coverage | API replication/worker separation if measured; scoped sync |
| Regional | 100–1k institutions, 20k–200k active participants | Reconnect storms, reporting, database growth | Stewards, contractual promises, locale and policy variation | Tenant fairness; consider cells where failure/custody needs justify |
| Broad/national | 1k–10k institutions, 200k–2m active participants | Correlated peaks, migration, regional recovery | Procurement, governance, equitable access, funding | Regional topology only after measured envelope and funded operations |
| Federated future | Several independent operators/jurisdictions | Contract versions, ownership/routing, cross-authority exchange | Mutual governance, disputes, exit and accountability | Explicit exchange protocols; no single global write assumption |

### Arithmetic that exposes hidden peaks

Illustration: 100 schools × 20 teachers × 2 operations in a ten-minute arrival window = 4,000 operations, roughly 6.7 per second on average. Multiply by a synthetic 10× burst factor to test about 67 per second. At 10,000 schools the corresponding averages are roughly 667 per second and a 6,667-per-second burst. These figures omit polling, reads, replication, notifications, and retries; they are not requirements or capacity claims.

Fan-out differs from writes: one notice to 500 guardians creates up to 500 delivery jobs. A ten-day reconnect backlog can exceed ordinary daily volume. Queue drain time is backlog divided by processing throughput minus new arrival rate, only when throughput exceeds arrival. Test heavy-tenant and reconnect patterns separately from a smooth average load.

Social scale is not served by flattening schools into one global feed. Preserve bounded classrooms, family linkage, institutions and communities even if shared infrastructure serves millions. A database may scale while trust and support do not.

## Conditional timeframes and milestones

Timing assumes available implementation and institution access; neither staffing nor budget has been committed. Parallel possibility research may continue throughout. Gates override dates.

| Window from authorized implementation start | Milestone/outcome | Exit evidence | Stop/re-scope condition |
| --- | --- | --- | --- |
| 0–2 weeks | Discover actual task and reconcile readiness inventory | Participant baseline; deployment/dependency map; owner and exact first effect | No useful task or no record custodian |
| 2–6 weeks | Structured command lifecycle and recovery proof | Schema/policy/replay tests; real DB commit/receipt; process-crash repair | Domain ownership ambiguous or loss not recoverable |
| 6–12 weeks | One end-to-end door + shared web/mobile inspection | Runtime journey; correction; current channel configuration; physical mobile recovery where claimed | Synthetic success persists; correction/support costs erase value |
| 3–6 months | Small institutional pilot with affordable stewardship | Net-burden observation, privacy/linkage cases, cost ledger, restore/incident drill | Unsafe custody, unowned incidents, unaffordable recurrence |
| 6–18 months | Repeatable deployment and selected second channel/assistant experiment | Multi-institution isolation, load/reconnect measurements, staffed recovery | Common failures/support overload exceed service target |
| 18–36 months | Cell/hub/federation experiments if required | Two accountable operators, version/key lifecycle, partition/restore evidence | Local operation less reliable or materially more burdensome |
| 3–5 years | Portable interoperable ecosystem across chosen institutional boundaries | Exit/import and rights/consent continuity, sustainable independent operation | Federation exists only on paper or concentrates unreviewable control |
| 5–10 years | Ambient/personal-agent and commons possibilities | Repeated evidence of human value and bounded agency in new interfaces | Tech advancement increases coercion or replaces essential human care |

## Reliability targets for negotiation

Proposed pilot goals: no acknowledged protected command is knowingly discarded; every accepted operation has an inspectable state; zero cross-account/tenant leakage in selected scenarios; server-domain completion distinct from delivery; every failed/unknown operation has a recovery owner. These are desired invariants requiring evidence, not measured guarantees.

Choose quantitative SLO/RPO/RTO only after workload and funding are known. An illustrative pilot negotiation could target critical API availability of 99.5% over 30 days (about 3.6 hours of unavailability), restoration of defined server reads/writes within four hours, and committed-data RPO within fifteen minutes under a purchased/tested backup configuration. This is deliberately a budget discussion, not a promise. Different workflows may need stricter or looser targets; local drafts and external delivery have different clocks.

For queued jobs define a due time, bounded maximum pending age, escalation, fairness, and user notification policy. An essential notice requires an institutional escalation path if digital delivery cannot be confirmed. Queue metrics alone cannot prove families received or understood it.

## Prioritized open decisions and discovery actions

| Priority | Decision/action | Owner role | Evidence needed |
| --- | --- | --- | --- |
| P0 | Inventory actual production hosting/DB/auth/sync/workers and current readiness | Operator + engineer | Configuration without secrets; deployment/restore history |
| P0 | Select first participant task and authoritative record | Product + institution/domain steward | Baseline effort, accepted artifact, correction owner |
| P0 | Define channel linking, offline allowed work, exact confirmation | Security + UX + domain | Shared-device/stale-role scenarios and user comprehension |
| P0 | Close false-save/synthetic-fact claims for selected pilot | Engineer + product | Actual record/receipt and clearly disclosed demo states |
| P0 | Map accepted-operation → dispatch → result recovery | Engineer + database | Crash/race tests and repair procedure |
| P1 | Validate provider versions/model availability/account permissions/telco treatment | Adapter owner | Dated official docs and bounded account/device trial |
| P1 | Price support, messaging, inference, backup and operator coverage | Finance + operator | Current quotes, measured usage, conservative cash model |
| P1 | Prove web/mobile parity for selected action, not entire app | Client owners | Same scope/effect/receipt, real platform journeys |
| P2 | Product MCP/device-assistant narrow read/draft experiment | Product + security + integration owner | Resource-bound consent and per-platform invocation proof |
| P2 | Evaluate cells/hubs/federation against actual failure/custody requirement | Architect + institution + operator | Measured outages/load, ownership, funded maintenance |

## What changes the architecture recommendation

Adopt API replication when process availability or measured load warrants it. Separate workers when provider work competes with core request capacity. Add cells when isolation/custody/recovery needs exceed a shared deployment's affordable protection. Test a hub when repeated offline duration and local operator capacity make it useful. Explore federation when independent stewards need exchange and can govern it. Each step needs an experiment, rollback/exit, operating cost, and compatibility plan.

## Final hostile integration round R10

The recommendation holds only if one actual workflow is useful, honest, recoverable, affordable, and operated by someone accountable. The broad horizon stays open independently of release pace. Continue exploring new interfaces and institutional forms, but require evidence before transferring consequences to users.

The most consequential residual concentration is stewardship: people controlling keys, funding, deployments, domain definitions, and records. Redundant infrastructure alone cannot solve that. Portability, transparent decision authority, successor access, bounded communities, and a credible exit are part of resilience.

## Exploration completion record

Completed: source-grounded evidence ledger; nine role perspectives; integration after each perspective; cumulative/final integration; future horizons; conditional milestones; workload scenarios; failure contracts; cost sensitivity; explicit unknowns. Not completed or claimed: participant research, independent expert sign-off, provider procurement, penetration testing, production load/restore proof, or implementation. Further exploration should add evidence against a named question rather than duplicate the entire dossier.
