---
title: "Local developer coordination"
status: "active"
created: 2026-11-11
updated: 2026-11-11
author: "Codex"
tags: [agents, developer-tooling, procedures, evidence]
---

# Local developer coordination

For typed requirement versions, task decomposition, role handoffs and reconsideration, use
the integrated [`lifecycle` action](feature-lifecycle.md). The simpler record/check protocol
below remains available for existing local records.

The CLI and `sovereign_coordination` MCP tool share one implementation and local SQLite
history. This is a bounded pilot for recording engineering analysis and existing checks.
It does not schedule agents, intercept editor writes, accept product requirements, or
replace the repository's gates. The gateway exposes it in GATEWAY and unrestricted modes;
LEAN mode retains its existing allowlist.

Build first with `pnpm --filter @repo/platform-mcp build`, then use
`pnpm --filter @repo/platform-mcp coordination <request.json|->`. A dash reads JSON
from stdin. `--store <database.sqlite>` selects an isolated local store for experiments;
the default is `.agents/state/coordination.sqlite` in the workspace. MCP uses that same
default; `COORDINATION_STORE` can select a different store before starting the gateway.
Restart a gateway to load changed tool registrations. No host configuration is changed
automatically by this pilot.

The package command uses the compiled CLI, matching the compiled gateway's implementation
identity. For source development, run both entrypoints through `tsx`. Mixing compiled and
source entrypoints is deliberately treated as a changed procedure; rebuild and use the
same entrypoint form for a shared run.

## Recover context and check tools

```json
{"action":"inventory"}
```

Inventory actually probes versions. Available, unavailable, blocked, discovery-only and
check-enabled are distinct. Inventory does not execute load tests or vulnerability scans.
Spectral needs a document and ruleset; Schemathesis needs a supported schema and scoped
target. Their installation does not authorize a parallel first-party API contract.

```json
{"action":"context","journeyId":"journey:api.secure_operations"}
```

Context calls the existing PJC journey reader and returns its projection with hashes of
the adjacent PJC JSON files, C4 model, API catalog and reader entrypoint. Missing inputs
or a failed reader produce errors; they do not become an empty successful search. These
hashes identify sources, not a complete dependency closure. C4 and API relationships are
not automatically joined to the journey. External sources and chat history remain explicit
coverage gaps. Before/after hashes detect source changes during the reader call.

## Record a bounded change

```json
{
  "action":"create", "id":"c4-review-001", "goal":"Review the declared system model",
  "impacts":["architecture"],
  "sources":[{"path":"docs/architecture/model/gurudevi.c4","scope":"Declared model only; live hops unverified"}],
  "links":[]
}
```

Source paths must be explicit workspace files. Known secret paths and escapes are rejected;
filename checks are not a secret scanner. Supply no credentials. Sources are hashed, not
copied. Choose all affected layers; the pilot cannot prove that an agent declared the
complete impact set. Link records carry subject, predicate, object, sourcePath and a
classification: declared, mechanically-extracted, inferred or unresolved. Their supporting
source must be in this change. A sourced inference does not become an accepted requirement.

| Declared impact | Required existing check |
| --- | --- |
| product | PJC structural check |
| architecture | LikeC4 validation |
| integration | LikeC4 and API composition |
| api | API composition and capability conformance |
| web, native | UI import boundaries |
| database | Existing changed-migration Squawk wrapper |
| dependencies | Existing dependency cohort check |
| security | Blocked: scoped security scan adapter not implemented |

This matrix is a versioned pilot policy, not the complete acceptance policy for each
layer. In particular, import boundaries do not test UI behavior; a migration run with no
changed files is not database runtime proof. Continue all applicable build, test,
device, CI, architecture and human review requirements.

```json
{"action":"record","id":"c4-review-001","actionId":"analysis-1","stage":"analysis","notes":"Reviewed declared C4 structure; runtime correspondence remains unverified.","evidencePaths":["docs/architecture/model/gurudevi.c4"],"unresolved":[]}
```

```json
{"action":"check","id":"c4-review-001","actionId":"check-1","checkId":"c4-validate"}
```

Only allowlisted check IDs run, with fixed argument arrays and no command shell. The
adapter records real stdout, stderr, exit status and errors. Callers cannot submit an
observed pass. Analysis must precede checks. A check must exit successfully before it
satisfies its prerequisite. Exceptions, timeouts and missing tools remain unsuccessful.

```json
{"action":"record","id":"c4-review-001","actionId":"reconcile-1","stage":"reconciliation","notes":"The declared model validator completed; product behavior still requires its own evidence.","evidencePaths":["docs/architecture/model/gurudevi.c4"],"unresolved":[]}
```

```json
{"action":"status","id":"c4-review-001"}
```

Reconciliation requires successful selected checks and no unresolved decisions. Later
analysis or checks require reconciliation again. The terminal label is `ready-for-review`.
It proves this local procedure's recorded prerequisites, not truth, approval or shipment.

CLI exit 0 means the request was processed. Inspect the returned check result and
`readiness`; a recorded failing check can still be a successfully processed request.
Use the guarded reconciliation action before treating the local procedure as satisfied.

## Retry, resume and failure

Reuse an action ID with the identical parsed request to retrieve its recorded outcome.
A conflicting payload under that ID is rejected. New attempts use new action IDs. Every
call reopens the same store, so a later process can resume recorded work. Check intent is
persisted before invocation. A crash before its result leaves a pending/unknown outcome;
retrying that ID does not execute the command again. Inspect it, then use a new ID for a
fresh read-only check when appropriate. No exactly-once side-effect guarantee is claimed.

Status rehashes declared sources. Changed or missing files, or a changed procedure
implementation, block readiness and further writes. History is retained. Create a new
change ID after reconsidering the affected conclusions and source set; automatic rebasing
or transferring conclusions is not implemented. Unresolved decisions accumulate and
cannot be erased with an empty later record. Record the eventual authoritative decision
in its owning source, then create a reconsidered change referencing it. This does not
authenticate the person who made the decision.

SQLite transactions serialize local writes with a bounded busy timeout. The local owner
can edit the database or bypass this tool; it is not an authorization boundary, tamper-proof
ledger, or multi-host scheduler. No automatic Codex/Claude hook enforcement is claimed.

Study findings and the integration's verification limits are in
[`2026-11-11-agent-coordination-study.md`](../../../docs/architecture/2026-11-11-agent-coordination-study.md).

The first real local pilot record is `coordination-foundation-20261111`. Resume it with
`{"action":"status","id":"coordination-foundation-20261111"}`. Its retained blockers
are evidence about unfinished integration, not authority to waive repository gates.
