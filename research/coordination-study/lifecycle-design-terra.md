---
title: "Feature lifecycle integration sketch: Terra"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Codex Terra"
tags: [lifecycle, design, investigation]
---

# Feature lifecycle integration sketch

This is a proposed developer workflow. It does not infer product policy, execute an agent, or turn a transcript into owner approval. Existing PJC, C4, domain cards and API catalogs remain authorities. The current coordination pilot already persists source-hashed changes and check outcomes; it has no typed role tasks or transitive artifact graph. The existing pipeline `graph.ts` compiles a LangGraph sequence but its builder and E2E receipts are not evidence of real implementation or device execution. Do not promote those receipts.

## Public contract

CLI and MCP call one strict discriminated request handler. Each mutation includes lifecycle ID, operation ID and expected revision; retries with the same canonical payload return the prior result, conflicting reuse rejects. Read operations expose history as well as the current projection.

- `create`: goal, explicit source locators and snapshots, optional PJC journey and owning authority references.
- `classify`: structured applicability for UX, screens, state, errors, motion, data, API, database, dependencies, crosscutting and shared code. Every item is `applies`, `not_applicable`, or `unknown`, with rationale and source references. Unknown blocks claiming coverage.
- `artifact`: append a typed immutable version of scope, requirement, invariant, decision, scenario, task, implementation evidence, review or tool decision. A version identifies its author role, authority class, source snapshots, dependency versions, applicable scope and unresolved questions. Product requirements reference PJC or an explicit source, never become product authority merely through this store.
- `decompose`: record explicit role tasks, responsibilities, dependencies and expected output artifact types. Roles may include investigator, designer, implementer and verifier; assignment is a recorded plan, not an agent launch.
- `handoff`: role task names the exact consumed artifact versions and emits typed output versions or an explicit blocked outcome. A reviewer may return a task for revision with findings; loops append history rather than mutate old outputs.
- `toolDecision`: select an allowlisted existing tool and expected evidence, or record `manual`, `unavailable` or `checker_gap` with rationale and next obligation. An unavailable checker is not a pass; manual review is attributed and scoped, not fabricated machine evidence.
- `advance` and `status`: invoke the LangGraph evaluator on the persisted snapshot, return permissible tasks, blockers, stale descendants and recorded observations. Checks execute only via existing coordination adapters and persist actual outcomes. No generated product code or invented owner decision follows from `advance`.

## Data and invalidation

Use SQLite through the existing developer store, with immutable artifact version rows, dependency edges, events and unique operation IDs. Strict schemas and foreign keys validate references; an atomic transaction appends a version and advances a revision. A task consumes exact versions rather than shared mutable prose. Two local writers use compare-and-swap revision and bounded SQLite busy handling. An invocation intent is persisted before the actual tool call; a crash yields unknown and requires a new attempt ID. No exactly-once, remote coordination or tamper resistance is claimed.

Each source snapshot includes path or provider identity, hash or version, observation time and scope. Each artifact version lists exact upstream versions and source snapshots. Content changes, superseding versions, changed tool/procedure revision and changed source membership produce stale status. Walk reverse dependency edges transitively to invalidate dependent tasks, check results and reviews while preserving independent branches and historical records. Detect cycles before insertion. Historical applicability is explicit, with supersession scoped to the affected claim. A past review remains historically visible, but cannot authorize a current descendant after its dependency changes. Unregistered dependencies are coverage gaps, not evidence of independence.

Requirements and invariants remain separately typed from agent proposals and owner decisions. Philosophy-to-code paths are explicit source-backed links through decisions, requirements, scenarios, bindings and observed evidence, where available. Each missing edge and inaccessible source stays unknown. A structural link is not a semantic proof.

## LangGraph execution

Build a graph whose nodes perform actual work rather than fabricate receipts: load and validate persisted snapshot; compute applicability and transitive staleness; evaluate task prerequisites; invoke one selected allowlisted check through the existing adapter when requested; persist its real outcome; project next actions. Conditional edges return blocked or review-required states, and a returned review may lead to a fresh task version. Each graph node receives the persisted version IDs. Pin graph/procedure identity and tool adapter revision. Do not run effectful nodes again merely because a checkpoint is replayed; check intent/outcome records govern retry semantics.

LangGraph orchestration and SQLite event history have distinct responsibilities. The graph routes and evaluates; the store is the authoritative local record of operations and versions. A checkpointer is optional only if restart reconstructs graph state from that store, and any adopted persistent saver must be tested with the actual installed API. Do not treat `MemorySaver` as durable. Never trust current `pipeline/verifyE2ENode` as proof of a device run. Existing `CoordinationService` supplies shared gateway/CLI entry, `coordinationTools` provides allowlisted checks, and PJC reader supplies declared journey context. Add explicit service boundary rather than importing private PJC internals.

## Bounded first complete slice

Support one feature change with explicit sources, all applicability decisions, one requirement and invariant, one scenario, two role tasks with a review return loop, one real PJC or C4 check and a final review-required projection. Allow the same lifecycle to resume after a process restart and after an upstream version changes. Preserve the coordination pilot as existing behavior. Broaden roles, adapters and delivery surfaces only after this end-to-end slice works. This is a generic lifecycle; a chat feature is merely an example input, not a hardcoded policy or required workflow.

Acceptance must exercise CLI and MCP against the same persisted lifecycle, prove role B receives exact role A outputs without re-entry, demonstrate actual LangGraph node and check execution, and verify changed source invalidates transitive descendants but not an independent branch. Test missing tools, manual obligations, failed checks, conflicting IDs, concurrent writers, restart, failed/returned review and retained historic versions. Include UI/data/API applicability as structured decisions without requiring every dimension to apply. Do not label structural validity, a graph node invocation or a report as proof that product behavior works.

Foundational Thinking drove immutable artifact versions and explicit dependency edges. Type-system discipline calls for strict discriminated requests and parsing at boundaries. The requested no-child restriction precludes the architect skill's independent comparison panel; this is a single grounded design for synthesis, not a completed panel. Source grounding includes `coordination.ts`, `coordinationStore.ts`, `CoordinationService.ts`, `pipeline/graph.ts` and PJC `hierarchy.ts`/`hierarchyQuery.ts`.
