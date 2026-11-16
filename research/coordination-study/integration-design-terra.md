---
title: "Developer coordination pilot design: Terra"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Codex Terra"
tags: [coordination, design, investigation]
---

# Developer coordination pilot design

This is a design sketch, not an implemented API. The pilot records a bounded engineering procedure and invokes an existing read-only check. PJC, C4, API catalogs, product decisions, and source files retain their existing authority. The pilot records declared links and observed command results; it does not infer that philosophy entails code or that a passing check proves a product claim.

## Usage

A developer creates a change with an explicit procedure ID and version, source references and a journey ID. The same operation can be called through the local CLI or the registered MCP gateway. They run the declared check, inspect the recorded result and next action, and resume later. A source change blocks dependent work until it is reconsidered. A missing source, unavailable command or failed check is reported distinctly from a clean result.

```text
coordination create <strict JSON request>
coordination status <change-id>
coordination record <strict JSON request>
coordination invoke <strict JSON request>
```

These commands are proposed, not existing CLI syntax. CLI and MCP parse the same request schemas and call the same functions; adapters cannot independently decide completion. The root workstream owns the concrete tool catalog and invocation adapter. The pilot should accept only a stable catalog tool ID and validated input, never arbitrary shell text.

## Data and behavior

```ts
type SourceRef = { locator: string; sha256: string; scope: string };
type Link = { subject: string; predicate: string; object: string; source: SourceRef; classification: 'declared' | 'inferred' | 'unresolved' };
type Evidence =
  | { kind: 'declared'; source: SourceRef; statement: string }
  | { kind: 'observed'; toolId: string; inputHash: string; outcome: 'passed' | 'failed' | 'unavailable'; resultRef: string; sources: SourceRef[] };
type Action = { id: string; stage: string; input: unknown; evidence: Evidence[]; unresolved: string[] };
type Procedure = { id: string; version: string; stages: readonly { id: string; requires: readonly string[] }[] };
```

These abbreviated shapes are design intent. The actual boundary uses strict discriminated schemas for each supported action and tool input, bounded strings and arrays, exact known fields, and validated source locators. A run pins its procedure version and immutable source identities; a change can have multiple runs. A user-declared observed result is not accepted as a tool observation. Only the invocation adapter creates that evidence from its actual completed subprocess result, recording exit status, errors, output location and invocation identity. A hash does not establish reading, meaning or authorization.

Persist ordered events with change ID, run ID, unique action ID, canonical payload hash, source dependencies, evidence and outcome. Identical canonical retries return the original event; a different payload under the same ID is rejected. Evaluate prerequisites from events and the pinned procedure. On a changed hash or membership, block dependent events; retain valid independent prefix and historical records, and create a fresh run or explicit rebase event. Unknown dependency scope conservatively blocks review rather than declaring it unaffected. Unresolved authority remains blocked: no unauthenticated resolution command in the pilot.

A relationship projection accepts explicit scoped links from philosophy or decisions to PJC requirements, scenarios, bindings and observed evidence. Missing, inaccessible and unresolved links stay visible. PJC `inspectHierarchyJourney(catalog, id)` already projects declared requirements, bindings and scenario evidence, with an explicit non-execution disclaimer. C4 and API conformance results remain separate sources; no matching by display name becomes identity or policy.

## Placement and concurrent writers

A minimal slice is three new files plus targeted edits to existing registration and package scripts:

1. `src/coordination.ts` owns strict request schemas, typed procedure definition, deterministic projection and transitions.
2. `src/coordinationStore.ts` owns SQLite event persistence and transactions, following the local `node:sqlite` substrate used in `services/deviceProfileStore.ts`, without reusing that domain's database.
3. `src/cli/coordination.ts` parses JSON and calls the same implementation as the gateway.
4. Existing `src/index.ts` registers a strictly validated MCP action in intended `MCP_MODE` values. The tool catalog adapter is separately owned and must have a supported import boundary.

A dedicated local database uses unique `(run_id, action_id)` and sequence constraints. A single transaction reads state, checks prerequisites and source freshness, and appends the event. Concurrent writers serialize or return a bounded busy/conflict error; they must not silently overwrite. Tool execution occurs outside the transaction: persist an invocation intent first, then record the result under the same idempotency key. A crash between invocation and result is `unknown`, not success; re-running read-only checks is safe only when the tool's contract says so. There is no exactly-once guarantee for side effects. SQLite transactions do not protect against an owner directly rewriting the local database, and no multi-host shared-store guarantee is implied.

The exact list of touched files may grow when existing tests and supported package exports are accounted for; the 2–4-file target describes the core production slice, not a reason to skip tests or alter other workers' changes. The gateway's `registerPlatformTool` and `MCP_MODE` registration lists must be updated together. `@repo/platform-mcp` currently lacks an explicit `@repo/core` dependency; use an approved export or existing CLI interface, not a private source import guessed to work.

## LangGraph comparison

The installed package is `@langchain/langgraph` 1.7.3. Its declarations export `StateGraph`, `BaseCheckpointSaver` and `MemorySaver`. The official persistence design uses checkpointers and thread IDs; in-memory checkpoints do not survive restart. Its [1.7.3 release](https://github.com/langchain-ai/langgraphjs/releases/tag/%40langchain%2Flanggraph%401.7.3) and [persistence documentation](https://github.com/langchain-ai/langgraphjs/blob/main/docs/docs/concepts/persistence.md) support graph execution and checkpointing, not the pilot's authority, evidence provenance, deterministic source invalidation or trusted idempotency rules by themselves. A durable saver and its concurrency semantics would need separate grounding and tests.

For one local, finite procedure, a strict evaluator plus transactional event store is the smaller verifiable design. Keep the installed dependency unchanged. Reconsider LangGraph if independently specified workflows require graph branching, interruptions or resumable multi-step orchestration beyond this pilot, and compare it on the same crash, source freshness, evidence and concurrency tests. The LangGraph choice is an engineering judgment, not a benchmark or an assertion that it cannot implement these requirements.

## Acceptance

Test real CLI and MCP calls against the same isolated store. Verify identical and conflicting retries, missing prerequisite rejection, changed source content and membership, retained independent work, restart recovery, unavailable and failing commands, and two concurrent writers. Assert declared versus observed evidence and preserve uncertainty after an interrupted invocation. Exercise one explicit journey projection and at least one allowlisted existing read-only check end to end. Run package typecheck, focused tests and build, then applicable repository gates and raw diff review. Report the known wider anti-slop failure separately. No test here proves semantic completeness, automatic hook interception, or production readiness.

Grounding: `research/coordination-study/integration-seams.json`, `packages/platform-mcp/src/index.ts`, `packages/platform-mcp/src/utils/execution.ts`, `packages/core/src/flows/pjc/hierarchyQuery.ts`, and the installed `@langchain/langgraph` declarations. Foundational Thinking drove the event and concurrency shape; Prove It Works requires end-to-end checks of both entry points. The requested no-child constraint precludes the architect skill's independent design panel; this is one reviewable proposal, not a completed panel.
