---
title: "Solution Architecture: Authority, Independence, and Evolution"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [architecture, resilience, federation, tradeoffs]
---

# Solution Architecture: Authority, Independence, and Evolution

## Possibility

The same meaningful action can be expressed through a classroom screen, a voice note, a browser, a personal assistant, or an institution's own tools. Institutions can choose hosted service, regional operation, or eventually local continuity without rewriting their educational practices. People can carry their personal learning materials between institutions while institutional records retain appropriate custody.

## Bedrock and architectural judgment

E01–E06 and E12 in [01](01-possibility-and-bedrock.md) show contracts, policy, clients, and durable slices. The future architecture should extend these seams. A single universal command bus that absorbs every domain would simply relocate monolithic complexity into core.

Separate four maps: product places, domain ownership, runtime deployments, and trust boundaries. A place can use several domain capabilities; a domain can run inside one application; a deployment can host multiple modules; a trust boundary must remain enforced even within that process. Workspace expressions are user meaning, not automatic service boundaries.

### Candidate paths

| Path | What it buys | What it costs | Trigger to consider |
| --- | --- | --- | --- |
| Modular application + managed Postgres + durable workers | Shared transactions and simplest operation; modules remain bounded | Common deployment/schema failure scope | Initial real workflows |
| Replicated API instances with shared durable state | Process/node continuity and bounded horizontal growth | Connections, coordination, migrations, load balancer; common DB/auth/DNS failures persist | Process interruptions or measured API saturation |
| Separate provider/AI workers | Protects core request resources from slow external work | Job lifecycle, deployment and worker monitoring | Unpredictable provider latency or retry volume |
| Institutional/regional cells | Limits noisy tenants and operational incident scope | Tenant routing, versions, cross-cell identity, export and recovery | Demonstrated blast-radius, jurisdiction, or workload requirement |
| School edge hub | Continued selected service during long WAN interruption | Physical custody, power, patching, key recovery, reconciliation | Repeated outages and an accountable local operator |
| Federation | Institutional autonomy and exchange without one operator owning everything | Governance, revocation, provenance, schema evolution, disputes | Actual independent stewards who need exchange |
| Active writes in multiple regions | Potential lower latency and regional write continuity | Conflict semantics and distributed authorization complexity | Proven requirement that cannot be met by queued work/failover |

Choose a path by the workload and operator capacity. User count alone is not an architecture trigger. A single school reconnecting thousands of queued mutations can be a harder burst than many users reading cached materials.

## Failure boundaries

An authoritative domain write should require only the services needed for identity, current policy, validation, and commit. AI, analytics, message delivery, and civic search should not sit synchronously on that path. External work follows durable intent, with an explicit result lifecycle.

Two channels sharing the same mobile carrier, identity provider, DNS, or API are not independent continuity paths. A mobile cache and a printable record offer different failure coverage from another cloud chat interface. Reliability budgets must include shared dependencies and correlated regional failure.

One authoritative store can still use replication, managed failover, and tested backups. Replication improves availability for some failures; it also copies erroneous writes. Separate restore capability addresses a different failure class. Multiple API processes do not remove database, operator-account, schema, or key-custody concentration.

The claim that connectivity loss only reduces convenience is too strong for uncached data, first login, current permissions, external notices, and financial settlement. Specify those boundaries per capability. Cached reads can be stale; drafts can be provisional; authoritative operations may wait.

## Architecture of a first workflow

Proposed logical flow: channel ingress → durable inbox → linked actor and selected scope → draft/proposal → exact confirmation → domain validation/commit and receipt → notification outbox → provider delivery observation. These are logical seams, not nine mandatory services. Start with existing modules and one transactional database where appropriate.

The execution representation needs operation ID, actor, delegated client if any, scope, input version, input hash, expiry, and effect class. Avoid turning every read into a queued proposal: ordinary authorized reads and explicitly saved private drafts remain direct. Confirmation is tied to changed consequences, not universally added friction.

## Future opening

Reserve identity and ownership identifiers that survive exports. Version public contracts without exposing storage schemas. Keep school-specific data from global discovery by default. Begin portability with validated export/import; federation can then be tested with explicit ownership and provenance rather than global replication.

## Hostile challenge

“We will keep core small” has no value without dependency constraints and ownership. “We will use a queue” has no value without crash recovery. “We will add a second region” has no value without a split-brain and reconciliation policy. Architecture complexity must be charged to the operator who carries it after the demonstration.

## Integration round R1

Carry forward modular authority with potentially replicated deployment. Retain cells, hubs, and federation as future options. Reject topology selection by vision vocabulary alone. Engineering must next identify transaction boundaries and reusable contracts; UX must expose the precise availability boundary; finance must price operation and recovery. The acceptance question is: can a provider/worker/process fail without losing an accepted record or misleading its owner?
