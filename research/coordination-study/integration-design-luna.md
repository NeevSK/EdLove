---
title: "Developer coordination pilot design: Luna"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Codex Luna"
tags: [coordination, design, investigation]
---

# Integration design: receipts with a thin context projection

## Recommendation

Use a small tool and process receipt registry with a read-only context projection. Do not add a generic workflow engine. The seam inventory identifies existing readers and checkers, but no shared workflow runtime, authenticated decision resolution, durable concurrent event store, or runtime hook contract. A workflow engine would add scheduling, generic transitions, and recovery policy before the supported procedures and authority rules are known.

The registry records which named procedure ran, its inputs, output references, and failure. The context projection joins explicit identifiers from PJC and existing engineering records. It reports sources and declared links; it does not infer that philosophy, a requirement, implementation, or test is semantically aligned.

## Smallest useful interface

```ts
type SourceRef = {
  id: string;
  locator: string;
  version?: string;
  digest?: string;
};

type Procedure = {
  id: string;
  version: string;
  prerequisites: string[];
  run(input: unknown): Promise<ProcedureResult>;
};

type ProcedureResult =
  | { status: 'succeeded'; output: SourceRef[] }
  | { status: 'failed'; code: string; retryable: boolean; detailRef?: SourceRef };

type Receipt = {
  actionId: string;
  procedureId: string;
  procedureVersion: string;
  inputRefs: SourceRef[];
  result: ProcedureResult;
  recordedAt: string;
};

type ContextProjection = {
  journeyId: string;
  sourceRefs: SourceRef[];
  declaredLinks: Array<{ from: string; to: string; relation: string; sourceRef: SourceRef }>;
  unavailable: Array<{ sourceRef: SourceRef; reason: string }>;
  unknowns: string[];
};
```

These are design shapes, not existing exports. Keep the initial procedure allowlist narrow. A suitable first call is the existing PJC journey reader, reached through a supported package export or adapter after its packaging and filesystem behavior are grounded. Do not call a private cross-package path. The projection can resolve one journey ID, validate and inspect it, and return declared graph edges plus missing and failed sources. It must preserve the validator's structural scope and its explicit disclaimer that structural validation does not establish semantic truth.

The receipt registry is an execution record, not an authority ledger. A receipt that says a human decision source was read does not prove the person had authority or approved it. Keep owner decisions in their authoritative source and link to them only by explicit reference. PJC, domain cards, the API catalog, and engineering receipts remain separate authorities.

## Procedure prerequisites and outcomes

Every procedure has a stable ID and pinned procedure version. A caller supplies an idempotent action ID and explicit source references. Before running, the adapter checks that the procedure is allowlisted, required input references resolve, and any declared prerequisite receipts succeeded against the expected input versions. It does not grant permission based on a graph link or a previous agent's assertion.

On success, record the procedure version, input references, output references, and completion time. On failure, record a stable error code, whether retry is permitted, and an optional diagnostic reference. Reuse of an action ID with the same procedure and inputs returns its recorded result; reuse with different inputs is a conflict. A changed input version makes dependent evidence stale and requires a rerun. A missing source, invalid journey ID, unavailable reader, timeout, rejected prerequisite, tool error, and action-ID conflict remain distinct outcomes. Never turn a failed or inaccessible source into an empty successful projection.

No concurrent-write guarantee is established by the study. Until a suitable store and transaction boundary are selected, describe the registry as a local prototype only. Do not claim append-only behavior, restart safety, or safe concurrent retries without implementation evidence.

## Tool availability and check coverage

The gateway registers typed platform tools and forwards downstream calls. The PJC CLI exposes read and check commands. Discovery already has context and gravity actions, so inspect those behaviors before adding another context action. MCP mode gates tool registration, and a new name requires explicit admission or routing through an existing action. Scout can collapse failures in `fd`, docs, and `rg` into a no-traces result. These facts establish entry points, not complete coverage.

Report these separately:

| State | Meaning |
| --- | --- |
| Available | A named tool or CLI entry point is configured or registered in the inspected mode. |
| Invoked | The adapter called that entry point for this action. |
| Succeeded | The call returned a success result under its declared contract. |
| Covered | The relevant source set and check scope are identified, and the check ran over that scope. |
| Semantically reviewed | A named human or review process assessed whether the evidence supports the claim. |

Availability does not prove invocation. Invocation does not prove success. Success does not prove full coverage or semantic correctness. A passing hierarchy check proves only its declared structural rules. A successful test command proves only the tests and inputs it ran. Configuration of an agent instruction or hook does not prove runtime interception. The seam study reports canary bypasses and no observed automatic interception in its session; no universal interception claim follows.

## Why not a generic workflow engine

A workflow engine would need to define generic states, transition policy, retries, persistence, concurrency, authorization, and recovery. The inspected code supplies no approved shared contract for those decisions. The concrete need is narrower: record one allowlisted procedure's execution and project already declared context. Model prerequisites on each procedure instead of introducing general workflow transitions. If multiple supported procedures later demonstrate shared lifecycle rules, reconsider an engine using those observed contracts.

## Boundary and verification limits

Keep reusable coordination types separate from MCP transport and avoid adding a dependency from `@repo/platform-mcp` to `@repo/core` without an approved package boundary. Do not place engineering run state in PJC journeys or Sanctuary business APIs. Do not use downstream tool forwarding as a general shell executor.

Before implementation, resolve package exports and filesystem access for PJC readers. Then verify the selected package's types, tests, and build, and exercise missing inputs, stale source versions, retries, interrupted writes, reader errors, and concurrency if the implementation claims concurrency safety. Run harmless host canaries before claiming that a hook automatically intercepts actions. These checks establish execution behavior and declared coverage; they cannot prove philosophical or semantic completeness.

This design follows **Laziness Protocol** by limiting the proposal to receipts and one projection rather than a workflow framework. **Model the Domain** changes the interface from generic steps to typed procedures, explicit source references, and distinct result states. No delegated design panel ran because the parent prohibited child agents.
