---
title: "Run a persistent feature lifecycle"
status: "active"
created: 2026-11-11
updated: 2026-11-11
author: "Codex"
tags: [agents, requirements, lifecycle, langgraph, handoffs]
---

# Run a persistent feature lifecycle

The `lifecycle` action extends the existing coordination CLI and MCP tool. It stores
versioned analysis, requirements, invariants and role outputs in the same local SQLite
database. LangGraph executes recovery, mutation, tool invocation and projection. Existing
PJC, C4, API catalogs and source documents retain their authority. Lifecycle artifacts are
working proposals and evidence references, not a second product catalog or owner approval.

## Start or resume

Build with `pnpm --filter @repo/platform-mcp build`. Send a JSON file or stdin to
`pnpm --filter @repo/platform-mcp coordination <request.json|->`. The MCP call is
`sovereign_coordination({request: <same JSON>})`. Both use the compiled implementation
and `.agents/state/coordination.sqlite`; `--store` or `COORDINATION_STORE` selects another
store. Source development must use both entrypoints through `tsx`; mixing source and
compiled procedure identities requires explicit reconsideration.

Use `{"action":"inventory"}` to discover saved lifecycle IDs, goals, revisions and role
tasks alongside available tools. Inventory labels stored task states as unevaluated;
retrieve `lifecycle/status` to assess current source freshness before resuming.

```json
{
  "action":"lifecycle",
  "request":{
    "action":"create", "id":"feature-example", "operationId":"create", "expectedRevision":0,
    "goal":"Specify and verify a bounded feature change", "scope":"feature",
    "sourcePaths":["AGENTS.md"],
    "actors":[
      {"id":"product-agent","roles":["product"]},
      {"id":"ux-agent","roles":["ux"]},
      {"id":"reviewer","roles":["verification"]}
    ],
    "externalRefs":[]
  }
}
```

Choose actual explicit source files for a real task. Known secret paths and filesystem
escapes are rejected by the existing source fingerprint boundary. Filename exclusions are
not a comprehensive secret scanner. A source is hashed, not copied into the database.

Creation returns an intake packet and the actual artifact JSON schema. A Codex host agent
uses that packet to investigate and propose a classification. Classification is model
judgment; it is not inferred deterministically from keywords. Every analysis must assess
UX, screens, state, errors, feedback, motion, accessibility, data, API, database,
dependencies, security, offline behavior and reuse. Each dimension requires a sourced
reason for applies, not-applicable or unknown. Unknowns remain blockers.

```json
{"action":"lifecycle","request":{"action":"context","id":"feature-example"}}
```

## Classify, decompose and refine

Publish a typed `analysis` artifact using `publish`, then call `plan` with its exact
`analysisRef: {id,version}`. The planner uses both classification and applicability.
Feature and defect profiles require product requirements, invariants and scenarios.
Refactors preserve invariants and scenarios. Investigations produce findings and scenarios
and do not create an implementation task. An investigation cannot quietly become evidence
of implementation.

Applicable dimensions generate product, UX, visual-motion, architecture and dependency
tasks. Feature/refactor/defect plans also generate implementation and verification tasks.
Visual-motion consumes UX output when UX applies. Implementation consumes the applicable
earlier role outputs. This is a task graph, not an instruction to put every role in a serial
waterfall. `refine` creates smaller dependent tasks while retaining the parent's output and
check obligations. Replanning retains existing refined obligations instead of silently
dropping them under a newer analysis.

`context` with `taskId` returns one role packet: exact upstream artifact versions and
bodies, expected output kinds, source snapshots, declared authority references, tool
obligations and the output schema. Without a task ID it returns currently ready packets.
`register-actor` records an additional local role assignment when a new delegate is needed.
An unavailable role is a blocker, not an invented agent response.

## Typed role outputs and handoffs

Artifacts have stable IDs, immutable versions, author claims, scope, exact upstream
dependencies, source snapshots and procedure identity. Their contents are strict variants:

| Artifact | Required structure |
| --- | --- |
| requirement | Statement, classification, acceptance criteria, origin, authority references, unresolved decisions |
| invariant | Statement, scope, violations and verification obligation |
| experience | Screens, independent state axes, event transitions with guards/effects/feedback/recovery, journeys, motion requirements, accessibility and state combinations |
| visual-motion | Visual and motion behavior, reduced-motion behavior, cancellation |
| architecture | Owned components, directed command/query/event/response flows, contract references, data schemas, constraints and boundaries |
| dependency | Package names, declared/resolved/installed/upstream versions, compatibility and evidence references |
| scenario | Preconditions, actions and expected outcomes |
| implementation | Changed file references, described changes, evidence references and limitations |
| verification | Outcome, scenario references, internal tool observation IDs, manual evidence references and limitations |
| manual-evidence | Scoped claim, method, result and limitations, with pinned sources and upstream dependencies |
| decision/finding | Sourced or proposed statement, unresolved questions or observed/inferred classification |

State, screen, journey and motion references are checked for declared consistency. This
does not prove that all needed states were considered or that the experience is good.
Package fields distinguish installed versions from upstream knowledge; unknown freshness
does not become a claim that a dependency is current.

`submit` names exact output versions. The actor must have the task's role, required output
kinds must be present, and each output must depend on the exact current upstream packet.
Missing, stale or disconnected outputs are rejected. `review` requires another actor with
the verification role. Return findings reopen work for a new submission; accepted handoffs
allow downstream roles to proceed. They do not authenticate product-owner approval.

## Use tools and handle missing tools

Architecture obligations select existing API composition/conformance and migration checks
when their dimensions apply, as well as model validation. Dependency work selects cohort
checks and freshness review. UX, motion, data, security, offline behavior and reuse retain
their own explicit obligations. A general typecheck cannot fill those obligations.

Before a check, record a `tool-decision`. An executable decision uses the existing fixed
check allowlist. `run-tool` persists an invocation intent before calling its adapter, then
records actual stdout, stderr, exit status and errors. Public requests cannot supply an
observed result. A source/procedure change during invocation makes that observation stale.

If no checker exists, record unavailable or checker-gap. For obligations permitting manual
judgment, publish a supported, scoped `manual-evidence` artifact consuming the task's exact
inputs. A different reviewer must assess the handoff. A requirement or arbitrary note cannot
be substituted as manual evidence. Existing registered machine checks cannot be waived
through the manual branch. A missing mandatory executable adapter needs actual repair or
a separately verified tooling change; it is not a reason to fabricate a pass.

An exit-zero CLI request means the request was processed. Inspect the returned operation,
tool outcome, blockers and readiness. A successful PJC check validates its declared
structure and ceilings, not feature behavior or semantic completeness.

## Change, retrieve and reconsider

`status` projects the current work queue and blockers. `history` retrieves up to 1,000
operation records with their versioned states. Every mutation has an operation ID and
expected revision. Identical parsed retries retrieve the recorded result; conflicting
operation payloads and stale revisions reject. Local SQLite transactions serialize writes.

Publishing a new version supersedes that atomic artifact ID, not every more general or
older document. IDs cannot silently change kind or scope. Exact reverse dependencies make
affected outputs, accepted handoffs and downstream tasks stale; independent branches can
remain current. Replan history remains in the operation records.

Changed or missing source files block mutations until explicit `refresh-sources`. Refresh
rereads registered files through the trusted adapter. It does not rewrite old artifact
snapshots or transfer old acceptance to new inputs. Republish and review affected work
against the new versions. Procedure changes require the same reconsideration.

When investigation discovers a new relevant file, use `register-source` with `sourcePath`,
operation ID and expected revision. The trusted runtime fingerprints that file; callers
cannot supply its hash. Existing snapshots remain unchanged. The new source is an explicit
unassessed blocker until an analysis includes it. Discovery must not silently discard a
useful citation just because it was absent from the original intake.

`impact` searches other lifecycles in this local store for shared declared source paths
and reports possible impacts and stale artifacts. Its bounded index covers 1,000 records.
It does not discover unregistered dependencies or establish semantic dependence merely
because two workflows reference the same file.

Each request reconstructs state from committed SQLite records. LangGraph is not using an
in-memory checkpoint as persistence. An interrupted external check remains pending/unknown;
retrying that operation ID does not run it again. Inspect it and use an explicit new
operation ID for a fresh read-only check when appropriate. There is no exactly-once
side-effect or distributed-store guarantee.

## Codex host execution protocol

The host coordinator consumes ready packets and uses the available collaboration tools to
run bounded role work. This repository runtime does not contain credentials or silently
invoke a model provider. For each delegation:

1. Retrieve the packet and record the actual local actor/role assignment. Use current
   model preferences and at most three concurrent subagents.
2. Give the agent the packet, source locations, applicable skills, owned output files and
   exact schema. Keep its raw proposed output. Another role's summary is a claim.
3. Validate and publish the proposal; submit its exact versions. Do not rewrite consumed
   references to newer versions merely to pass a gate.
4. Execute required allowlisted checks and obtain a separate review. If the current
   revision changed, reread context and confirm dependencies before a new mutation.
5. Process returned findings, unknown decisions and missing tools explicitly. Continue
   independent ready tasks, retaining shared requirements and invariants by reference.
6. Stop claiming completion while blockers remain. `review-ready` describes the recorded
   local procedure, not business acceptance, device behavior, deployment or release.

The local database and role IDs are user-controlled. They are not authenticated approvals,
mandatory editor interception, a semantic proof system or an unattended agent service.
The old `agent:pipeline` command and its verification labels are not evidence for this
lifecycle. Its separate source artifacts can be referenced and assessed through this one.
