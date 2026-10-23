---
title: "API v0 to v1 Gate A Inventory Charter"
status: "draft"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, inventory, migration, gate-a, evidence]
---

# API v0 to v1 Gate A Inventory Charter

## Purpose

Gate A establishes a source-grounded reality ledger before any `/api/v1` route
is mounted or `/api` behavior is changed. It converts the current API migration
from a file/folder exercise into a reviewable capability map.

## Scope

Inventory these sources without changing their behavior:

- `apps/sanctuary-api/src/core/app.ts`, router, route modules, handlers,
  middleware, adapters, AI, agent, webhook, and SSE entry points;
- `packages/core/src/api`, client runtimes, contracts, compatibility facades,
  hooks, and event receivers;
- web, mobile, and package callers of `orpcClient`, legacy core API facades,
  direct `fetch`, and direct Supabase access;
- current API architecture, migration, progress, and operational documents;
- existing tests and evidence commands.

Gate A excludes route movement, contract conversion, database/schema migration,
dependency changes, client migration, BFF implementation, event-pipeline
implementation, and deletion.

## Deliverables

### 1. Machine-readable capability ledger

Create a versioned, reviewable inventory file under a location chosen during the
implementation task. It must not be a throwaway script output.

One row represents one externally callable operation or direct protected
boundary. Required fields:

| Field | Required content |
| --- | --- |
| `operation_id` | Stable capability-oriented identifier, not merely a file path |
| `api_version` | `v0`, proposed `v1`, or protocol exception |
| `domain` | One of the provisional ownership domains or `unclassified` |
| `lifecycle_class` | `read`, `draft`, `proposal`, `commit`, `external_effect`, or `unknown` |
| `transport` | native oRPC, OpenAPI, HTTP, SSE, webhook, worker, BFF, or direct database |
| `route_or_entry` | Concrete route/procedure/function entry point |
| `contract_source` | Contract/module or `none` with reason |
| `implementation_owner` | Handler/application module or `unknown` |
| `authority_path` | Authentication, scope, and policy mechanism observed |
| `data_owner` | Authoritative record/table/module or `unknown` |
| `transaction_and_effect` | Transaction/outbox/provider behavior observed or `unknown` |
| `receipt_policy` | Operation/replay/receipt evidence or `none` |
| `event_policy` | Audit/activity/telemetry producer or `none` |
| `privacy_class` | `minimal`, `sensitive`, `restricted`, or `unclassified` |
| `callers` | Import/call-site inventory and count |
| `evidence` | Existing test names/evidence tier and gaps |
| `disposition` | `canonical`, `adapter`, `compatibility`, `deprecated`, or `unknown` |
| `recommended_action` | retain, migrate, consolidate, document exception, or investigate |

`unknown` is an acceptable early answer. Guessing is not.

### 2. Route and transport map

Produce a concise map that distinguishes:

```text
/api/*             v0 compatibility routes
/api/openapi/*     read-only interoperability adapter
/api/ai/*          streaming/AI protocol adapter
/webhooks/*        verified provider ingress
/events/*          realtime adapter
workers/agents      asynchronous execution entry points
direct Supabase     exceptional or migration data boundary
```

This map must mark observed versus proposed `/api/v1`; Gate A must not pretend
v1 is mounted before it is.

### 3. Caller and duplication register

For every operation with more than one client/facade/path, identify:

- all known callers;
- whether each path carries distinct behavior or is a forwarding alias;
- which path is currently canonical for v0;
- migration risk and missing characterization tests.

### 4. Documentation truth index

Classify related documents as current reference, active plan, decision,
historical audit, superseded, or invalid/missing-frontmatter. Record source
contradictions, especially product API version versus installed oRPC version and
actual mount prefixes.

## Collection method

1. Parse and search source first; documentation is supporting evidence.
2. Record exact files/symbols/routes, not only informal feature names.
3. Use Git history only to explain evolution, never as evidence of current
   runtime behavior.
4. Preserve every ambiguity as `unknown` and create an investigation item.
5. Search call sites before proposing a compatibility path as redundant.
6. Capture tests as evidence with their substitutions and limits.
7. Do not read or record secret values, tokens, personal payloads, or production
   user data.

## Classification rules

| Classification | Meaning | Consequence |
| --- | --- | --- |
| Canonical | Current intended path with observed callers and required controls | Candidate v1 source or retained v0 authority |
| Adapter | Protocol translation without independent domain meaning | Must delegate to a canonical capability |
| Compatibility | Preserves an older caller/shape | Needs caller inventory, owner, retirement trigger |
| Deprecated | Explicitly no-new-use path | Needs migration target and date/condition |
| Unknown | Ownership/behavior cannot yet be established | Blocks deletion and v1 promotion |

## Acceptance criteria

Gate A is complete only when:

1. every Sanctuary API route family and direct protected entry has a ledger row;
2. every public core API facade and direct web/mobile caller is mapped to a row
   or logged as unclassified;
3. direct Supabase writes/reads are classified by domain and risk;
4. each route family has an observed authority path or an explicit gap;
5. compatibility aliases have callers and an owner, or are marked unknown;
6. activity/audit/receipt/telemetry gaps are visible instead of assumed;
7. documents with conflicting current-state claims are indexed;
8. no existing route, caller, test, or fallback is removed or weakened;
9. the team selects one proving capability for Phase B using this evidence.

## Initial work breakdown

| Workstream | Output | Depends on |
| --- | --- | --- |
| Runtime inventory | app/router/route/handler map | source search |
| Contract inventory | legacy/native contracts and conversion paths | core API source |
| Client inventory | web/mobile/package caller map | import/call-site search |
| Data boundary inventory | direct Supabase, ZenStack, worker/provider writes | source search |
| Lifecycle inventory | receipts, idempotency, audit, activity, telemetry | contracts/handlers/tests |
| Documentation index | current versus historical claim map | docs + source reconciliation |
| Evidence register | G0/G1/G2+ proof and limitations | package scripts/tests |

## Stop conditions

Stop and request direction rather than inventing policy if the inventory exposes:

- a route whose security ownership cannot be established;
- an apparent route removal required for a v1 mount;
- a data owner or retention requirement that needs product/governance choice;
- a v0 caller with unknown migration or compatibility expectations;
- a mismatch between production configuration and documented topology that cannot
  be verified safely from the workspace.

## Verification boundary

Gate A is discovery and documentation work. Its outputs are an inventory and a
decision record, not evidence that v1 behavior works in production. A later
Phase B task must supply implementation-specific G0 through G5 evidence.
