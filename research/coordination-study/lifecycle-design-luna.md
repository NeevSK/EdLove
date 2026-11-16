---
title: "Feature lifecycle integration sketch: Luna"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Codex Luna"
tags: [lifecycle, design, investigation]
---

# Feature lifecycle and role handoffs

## Recommendation

Keep the current `sovereign_coordination` CLI and MCP gateway as the entry point. Extend its persisted change record into a feature lifecycle with explicit coverage, reviewed task proposals, durable role outputs, and a runnable queue. Keep PJC, domain cards, API capability manifests, and the system model as source authorities. The lifecycle stores references and review decisions. It does not copy those catalogs or decide product policy.

A feature graph alone is insufficient. The current change record contains a goal, impact labels, source hashes, links, required checks, and procedure revision. Its events record analysis, reconciliation, and check results. It has no feature profile, per-layer coverage, decomposition proposal, role ownership, accepted output version, or work queue. `requiredChecks` are selected from broad impact labels. A check passing cannot fill a missing screen state, retry policy, API contract, or human decision.

## Grounded boundary

The MCP tool `sovereign_coordination` is registered in gateway mode and backed by the same CLI handler. `CoordinationService` accepts inventory, PJC context, create, status, record, and check actions. `coordinationStore.ts` stores changes and events in SQLite transactions. The store sets a three-second busy timeout, but it does not authenticate local records or establish tamper resistance.

The installed `@langchain/langgraph` is 1.7.3. The existing pipeline in `pipeline/graph.ts` is a fixed ingest, scaffold, grounding, builder, and verification graph. `builderNode.ts` only increments an iteration, copies a contract path into `modifiedFiles`, and clears `lastError`. It does not call a model, edit files, or create a handoff. The graph compiles without a checkpointer. Do not present it as an agent that already builds features. Use LangGraph only as a deterministic executor for validated queue transitions and registered tools. A host agent or actual delegated agent may propose work through the gateway. The executor must not invoke a model provider that this runtime has not configured.

## Data model

Use a versioned feature record and immutable proposal and output records. These are proposed shapes, not current exports.

```ts
type FeatureRevision = {
  runId: string;
  featureId: string;
  revision: number;
  goal: string;
  profileId: string;
  sourceRefs: SourceRef[];
  coverage: CoverageRow[];
  planRevision: string;
};

type CoverageArea =
  | 'ux.states'
  | 'ux.errors-recovery'
  | 'ux.motion-accessibility'
  | 'client.state-query'
  | 'api.contract-authorization'
  | 'data.persistence-privacy'
  | 'dependencies-runtime'
  | 'tests-evidence';

type CoverageRow = {
  area: CoverageArea;
  disposition: 'linked' | 'unknown' | 'not-applicable';
  sourceRefs: SourceRef[];
  reason?: string;
};

type TaskProposal = {
  proposalId: string;
  featureRevision: number;
  tasks: ProposedTask[];
  proposedBy: RoleRef;
  sourceRefs: SourceRef[];
};

type ProposedTask = {
  taskId: string;
  profileId: string;
  role: RoleRef;
  owns: string[];
  dependsOn: string[];
  expectedOutputs: string[];
  requiredChecks: string[];
  coverageAreas: CoverageArea[];
};

type RoleOutput = {
  outputId: string;
  taskId: string;
  taskRevision: number;
  role: RoleRef;
  sourceRefs: SourceRef[];
  artifactRefs: SourceRef[];
  evidenceRefs: SourceRef[];
  submittedAt: string;
  disposition: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  reviewRef?: SourceRef;
};
```

`RoleRef` identifies a role profile and the actual runtime agent that submitted the result. It must not hard-code a model name. The host supplies an agent identity when it delegates work. If no delegate is available, the proposal remains blocked or the coordinator asks for a local manual task. It does not fabricate an agent response.

Coverage rows name the product areas a role must resolve. `unknown` creates a follow-up task or a manual decision request. `not-applicable` requires a reason and source. A declared PJC link remains `declared`; a source parser may add a `mechanically-extracted` relation; an agent suggestion remains `inferred` until a reviewer accepts it. These labels reuse the distinction in `coordination.ts` and prevent a proposed relation from becoming a fact by serialization.

## Caller flow

Keep the CLI and MCP payloads aligned. A typical run has these calls:

```text
coordination create { featureId, goal, profileId, sourceRefs }
coordination status { runId }
coordination propose-plan { runId, proposal }
coordination review-plan { runId, proposalId, decision }
coordination queue { runId }
coordination submit-output { runId, taskId, role, outputs, evidence }
coordination review-output { runId, outputId, decision }
coordination resume { runId }
```

The model-generated plan is a proposal. A deterministic validator checks unique IDs, acyclic dependencies, allowed task profiles, declared coverage mapping, available tools, and required outputs. It does not judge whether the feature itself is good. The coordinator reviews cross-cutting tasks and overlapping file ownership before accepting the plan. A reviewed product decision remains a separate source reference; model agreement cannot replace the authorized decision-maker.

`queue` returns only tasks whose dependencies have accepted outputs and whose required tools are available. It may schedule independent tasks with disjoint ownership in parallel. It blocks conflicting ownership rather than allowing two agents to edit the same files. A task handoff carries the feature revision, accepted upstream artifact IDs, source hashes, task scope, output contract, and verification obligations. The receiving role submits a versioned `RoleOutput`; downstream tasks remain blocked until that output is reviewed.

`resume` reads the existing SQLite run and returns the current queue, pending proposals, accepted outputs, failed checks, and stale task IDs. It does not replay completed side effects blindly. Every external command or write-capable task needs an idempotency key and a recorded outcome before retry. Unknown outcomes remain blocked for reconciliation.

## Task profiles and routing

Profiles define required input and output contracts. They do not bind work to one agent or model. A profile can require a UI states and motion artifact, client state/query contract, API contract and authorization review, persistence and privacy review, dependency matrix, or focused implementation and verification output. A task can require more than one specialist role when the boundaries interact.

Decomposition must include cross-cutting tasks where evidence shows a shared seam. For example, a persistence change may require one owner for a shared contract, then dependent client and API tasks. Do not create duplicate copies of the same contract task in each vertical slice. The decomposition proposer must state ownership and dependency edges. The reviewer can consolidate or split tasks before accepting the plan.

The tool registry answers whether a command exists and which declared impacts it covers. It does not claim that the command validates all feature details. For each task, store required checks separately from required human review. If a check is unavailable, record `blocked` with the missing executable or adapter. If a decision requires product judgment, create a manual decision task with its question, required authority, and source references. Do not convert a missing tool or unanswered decision into a passing result.

## LangGraph execution

Use LangGraph 1.7.3 for state transitions that can be computed from persisted data. A graph state can carry `runId`, `featureRevision`, ready task IDs, pending handoffs, completed action IDs, and blocked reasons. Nodes can load a run, validate a submitted plan, select ready tasks, invoke an allowlisted check, persist its receipt, or mark dependent work stale. Conditional edges route based on typed task status and actual command outcomes.

Keep model proposal generation outside that deterministic graph unless the runtime later provides a real configured model adapter and records its provider, model, prompt, and response provenance. In the current setup, the caller can ask a real host agent or delegated agent to propose a plan, then submit that output through the coordination gateway. The gateway validates and persists the proposal. The executor checks it and schedules only reviewed tasks. This keeps model choice with the runtime that actually owns the agent and prevents the placeholder `builderNode` from masquerading as an implementation agent.

Persist lifecycle events and role outputs in the coordination store, not solely in in-memory LangGraph state. LangGraph checkpoints can later help resume deterministic execution, but they do not replace the feature record or the reviewed artifact history. Keep task transition rules in one typed state machine. CLI and MCP adapters call the same functions.

## Changes and back-propagation

When a source, task profile, procedure, tool definition, or accepted upstream output changes, create a new feature or plan revision. Preserve old outputs and check receipts as history. Compute the reverse dependency closure from the changed reference. Mark affected tasks and their descendants `stale`, retain unaffected accepted outputs, and rebuild the ready queue from current prerequisites. Never overwrite an old role response with a new one.

A change to a screen state may invalidate its UI artifact, tests, and client transition task without invalidating unrelated API work. A changed API contract may invalidate client queries, integration tests, and dependent documentation. A changed PJC source hash requires the owner to review affected coverage rows. Hashes find changed files; they do not prove that every semantically affected task appears in the dependency graph. Ask the reviewer to confirm the affected set when the graph has no explicit link.

## Review gates and limits

Require review before accepting a task decomposition, a product-policy interpretation, a shared contract that crosses package boundaries, a role output that authorizes downstream work, and any claim that a test proves behavior outside its measured scope. Mechanical checks can establish command outcomes and declared static rules. Human review supplies product judgment. Neither source hashes nor role-output persistence authenticate a human unless the host provides an authenticated identity and the record binds it.

The coordination store is local SQLite and currently holds change and event JSON. It is a useful persistence seam, not a trusted append-only audit system. This design does not establish multi-machine concurrency, secure approvals, universal agent availability, or semantic completeness. Add those only with a real runtime and authority contract.

This design follows **Foundational Thinking** by defining feature revisions, coverage, tasks, and role outputs before execution rules. **Model the Domain** changes a generic graph into explicit proposal, review, queue, and stale states. **Type System Discipline** keeps task roles, coverage dispositions, and outputs distinguishable. No parallel design panel ran because child agents were prohibited.
