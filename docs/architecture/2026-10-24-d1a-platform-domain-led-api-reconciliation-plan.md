---
title: "D1A — Platform-Domain-Led API Reconciliation and Capability Constitution Plan"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, sanctuary, domains, capability-ledger, reconciliation, v0, v1]
---

# D1A — Platform-Domain-Led API Reconciliation and Capability Constitution Plan

## Decision

The next API phase is **D1A: Platform Domain Ledger and Capability Constitution**. It is a bounded reconciliation and decision phase, not identity implementation, an endpoint rewrite, a generic registry, a `/api/v1` mount, or v0 retirement.

Its job is to turn the existing human-first Sanctuary product map into an API decision surface: coherent capability families, their authority and durable-truth boundaries, their present source seams, and their explicit v0/v1 or specialised-transport disposition.

This corrects the sequencing error of treating `D1 — Human and institution model` as permission to implement identity in isolation. Identity and institutional relationships are foundational facts, but they must be described where they govern every capability family rather than become the whole API programme by default.

## Bounding triad

1. **Surface & mode:** platform-wide API/domain architecture in Maintain Mode; source and documentation reconciliation only.
2. **Grounded substrate:** the Human-First Sanctuary Map, Gate A route/procedure ledger, Gate B/C attendance proof records, Gate D0 inventories, Sanctuary API composition, `@repo/core` contracts, callers, workers, and historical plans.
3. **Active seam & constraints:** derive canonical capability families from product meaning and durable rules—not folders, tabs, routes, or tables—while preserving v0 behavior and never claiming runtime proof from static evidence.

## What the preceding phase actually completed

### D0 completion map

| D0 commitment | Current status | Why it does not finish API architecture |
| --- | --- | --- |
| Bounded route inventory | Completed at capture time | It covers selected Gurudevi Web page files and literal registry `href` values, not runtime reachability, other apps, handlers, rewrites, or authority. |
| Package/export/consumer snapshot | Completed at capture time; **stale in the current shared working tree** | It is lexical package/source evidence, not import resolution, API ownership, or runtime consumer proof. Concurrent source edits correctly invalidate it. |
| Ten source-traced capability cards | Completed as an intentionally selected partial sample | Ten records do not establish a platform census, maturity, authority parity, persistence correctness, or client reachability. |
| Contract/handler discovery | Completed as lexical discovery | Its 328 candidates are leads, not domain equivalence or completeness evidence. |
| Drift/exclusion and evidence classification | Completed within the declared inventory boundary | It reconciles selected observations, not the entire documentation estate. |
| Hostile closure | Accepted only for the bounded inventory boundary | The acceptance excludes live capability, route, authority, package-resolution, and product-readiness claims. |

The relevant D0 evidence is the Gate D programme, its route/package/capability/discovery/drift/evidence artifacts and checkers. Its package generator fingerprints selected tracked app/package sources. Other shared-worktree work changed that substrate after D0 capture, so `node scripts/generate-gate-d0-package-inventory.mjs --check` is expected to fail until a new capture. This is freshness protection working, not an API regression.

Do **not** repeatedly regenerate D0 merely to make a moving shared worktree green. D1A records the Git revision and scoped dirty state used for its conclusions. A reproducible D0 review refreshes once against a settled commit or isolated worktree and reviews that delta.

### What remains

| Unfinished decision | Why it remains | D1A treatment |
| --- | --- | --- |
| Product-to-capability taxonomy | The product map exists, but no authoritative API ledger joins it to actual procedures, callers, workers, and writes. | Build six capability-family cards from the governing map. |
| Domain ownership | Router/package names mix legacy aliases, transports, screens, integrations and domains. | Declare durable-truth owner and cross-domain query/event seams; never infer ownership from a filename. |
| v0/v1 disposition | Gate A records 127 procedures and 50 compatibility mounts, but presence does not mean canonicality. | Classify scoped seams as `retain-v0`, `candidate-v1`, `specialised-transport`, `draft/local-only`, `external-effect`, or `blocked`. |
| Proving-capability selection | Attendance has a proof path, but has not earned universal priority from the full platform map. | Compare candidates against common authority, recovery, privacy and correction tests. |
| Runtime/API proof | D0 is static/design evidence only. | Defer to one later vertical-slice phase with G1–G4 evidence. |

## Authority hierarchy

| Authority | D1A role | May not decide alone |
| --- | --- | --- |
| [Platform Domain Reality and Human-First Sanctuary Map](./2026-10-23-platform-domain-reality-and-human-first-sanctuary-map.md) | Product taxonomy: lived places, relationship contexts, implemented-versus-aspirational distinctions and non-goals | Exact routes, caller adoption or runtime maturity |
| [API v0 Compatibility and v1 Canonicalization Plan](./2026-10-23-api-v0-v1-canonicalization-plan.md) | Versioning, capability admission, transport, recovery and v0-preservation rules | Platform domain taxonomy |
| [Gate A baseline](./2026-10-23-api-v0-v1-gate-a-baseline.md) | Current route/procedure/client evidence and legacy ambiguity | Canonical product meaning or deletion safety |
| Gate D0 artifacts | Bounded static evidence and known exclusions | Capability completeness, production behavior or v1 migration approval |
| Source, schema, tests, composition, callers and workers | Present implementation facts | Product intent when it conflicts with the governing map |
| Older roadmaps/package maps | Historical rationale and leads | Current authority without corroboration |

## D1A scope

### Capability-family frame

These are analysis families, not a mandate to create packages, services, or route prefixes:

| Family | Purpose | Initial durable-truth question | Anti-boundary |
| --- | --- | --- | --- |
| Person and control | Self, Profile, every participating context | Accounts, bonds/capacities, active scope, consent, privacy and person-owned control | Does not own Classroom, Community, Library or workforce records merely because actors have accounts. |
| Participating contexts and Workspace | Learning, family, institutional and operational participation | Context-specific membership, coordination and institutional commitments | Classroom is a major module, not the entire platform; a generic `Organization` mega-model is not presumed. |
| Library and EdLove Commons | Educational knowledge, editorial and research exchange | Resources, collections, curation and engagement | Not assumed to be a general public circulation-library system. |
| Community and communication | Groups, conversations, notices and participation | Social/group/conversation/publication intent | Provider delivery/retries are effects, not Community truth. |
| Bounded assistance and automation | AI assistance, durable workflows, agent-support flows | Human-approved proposals, workflow state and execution intent | Not a general autonomous-agent platform. |
| Platform operations | Receipts, audit, outbox/effects, policy mechanics and observability | Cross-cutting recovery and operational facts | Must not seize product semantics, audience, retention or domain authority. |

### Required card per family

Every card must name:

1. lived place(s), promise, participants and non-goals;
2. durable-truth/data owner(s), distinguishing authoritative, local, derived, external and effect state;
3. relationship/scope facts and authority source; explicit unknowns are valid;
4. package, schema, contract, handler, route, caller, worker and ingress/egress evidence;
5. candidate capabilities by lifecycle: read, draft, proposal, commit, external effect;
6. privacy, audit, product-activity, telemetry, retention and offline decisions or blockers;
7. cross-family dependencies and permitted query/event seams;
8. an API disposition: `retain-v0`, `candidate-v1`, `specialised-transport`, `draft/local-only`, `external-effect`, or `blocked`;
9. confidence/evidence grade; and
10. documentary contradictions and the source required to resolve each.

No card creates a repository, package, route, BFF, schema or client. It names an impact set only after language and authority facts are coherent.

## Work plan for today

### D1A.1 — Pin the evidence frame

Record Git revision, scoped dirty state and reviewed sources. Recheck D0 package output only against that frame if D0 is used as evidence. Identify documents as governing, historical, contradictory or source-verified.

**Output:** evidence header plus contradiction register.

### D1A.2 — Create six family cards

Start with the authority hierarchy. Map procedures, contracts, handlers, callers, workers and direct-boundary exceptions only where source supports the assignment. Keep uncertain signals unassigned.

**Output:** six readable cards plus an ambiguous/unassigned queue.

### D1A.3 — Reconcile API seams without prematurely naming a winner

Separate domain capability from compatibility alias, transport adapter, integration ingress, effect, screen-shaped facade and technical support code. Record duplicates instead of merging them by filename.

**Output:** a disposition table linking Gate A/D0 source identifiers to cards and explaining each classification.

### D1A.4 — Rank proving-capability candidates

Use one test: known durable truth, server-derived authority, lifecycle, idempotency/recovery, privacy/activity choice, correction/reversal policy where relevant, and bounded caller/compatibility impact.

Attendance is a candidate because Gate B/C describe a vertical seam; it is not preselected. A capability with unresolved authority, correction or data ownership remains blocked even if it has many routes.

**Output:** one proposed proving capability, rejected/deferred alternatives, and its precise implementation boundary.

### D1A.5 — Hostile review and decision packet

Reject UI-tab mirroring, package-name ownership, surveillance/event leakage, invented generic organization/HR/agent domains, direct-write bypasses and implied v0 deletion. Review the raw diff before acceptance.

**Output:** a decision packet that admits one vertical slice or stops with named missing facts. It makes no deployment claim.

## Non-goals and stop conditions

- No `/api/v1` mount, client migration, BFF, package reorganization, schema migration, direct-call replacement, v0 deletion or alias retirement.
- No inferred full HR suite, university tenant model, generalized organization ontology, public circulation-library parity or autonomous-agent platform.
- No generic event lake; audit, product activity, telemetry and external effects remain separate per-capability decisions.
- Mark a candidate `blocked` if durable truth, server-derived authority, correction/reversal, privacy/retention ownership or caller impact cannot be established.
- If evidence moves during review, record the revision change rather than silently refreshing until it appears clean.

## Exit criteria

D1A is complete only when:

1. six family cards and an unassigned queue link the governing map to source evidence;
2. each card states durable truth, scope/authority, lifecycle, cross-family seams, explicit uncertainty and API disposition;
3. no folder, route prefix, tab or historic document is sole proof of a domain boundary;
4. non-implemented claims remain visibly excluded: generalized university/college tenant model, generic organization model, full HR suite, public lending-library parity and autonomous-agent orchestration;
5. exactly one proving candidate is admitted, or the record says why none is safe; and
6. hostile review accepts the boundary and raw diff, with no removed behavior or deployment claim.

## What follows D1A

Only then is the next phase implementation: one vertical capability admission using typed contract, server-derived context, durable receipt/recovery, declared audit/activity/privacy choices, explicit transport adapter, compatibility characterization and risk-appropriate G0–G4 evidence. It may reuse Gate B/C attendance work only if D1A confirms attendance remains the best candidate.

## Implementation checkpoint — 2026-10-24

D1A closed as a G0 source-reconciliation decision. The resulting
[Platform Domain API Ledger](./2026-10-24-d1a-platform-domain-api-ledger.md)
contains the six capability-family cards, source-module/seam dispositions,
state-owner and caller/door evidence, unassigned queue, and the narrowly
admitted `classroom.attendance.batch-record` candidate. Hostile review accepted
the ledger's boundary. It does not authorize caller migration, v0 retirement,
additional v1 routes, deployment claims, or product/runtime maturity claims.
