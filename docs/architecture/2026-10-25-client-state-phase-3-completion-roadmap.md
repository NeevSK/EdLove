---
title: "Client State Phase 3: Completion Roadmap and Exit Ledger"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Codex"
tags: [architecture, phase-3, client-state, tanstack-query, roadmap]
---

# Client State Phase 3: Completion Roadmap and Exit Ledger

> **Canonical integration:** This ledger expands the execution sequence in the
> [Phase 3 scoped remote-state plan](2026-10-24-client-state-phase-3-query-migration-plan.md).
> The state/offline canon remains authoritative for ownership, authorization,
> durable commands, and browser capability claims.

## What Phase 3 is—and is not

Phase 3 is a controlled transfer of **remote-read lifecycle ownership** from
independently mutable Zustand stores to scoped TanStack Query families. It is
not a mass migration of all state, a replacement for durable commands, a
generic persisted-private-cache rollout, or a reason to add XState.

The completion criterion is not “no Zustand remains.” It is that each admitted
remote family has exactly one mutable read-cache owner, complete scope keys,
safe account disposal, explicit failure behavior, and an unchanged
server-authoritative command path.

## Completed increments

| Increment | Result | Evidence boundary | Deliberate residual |
| --- | --- | --- | --- |
| 3.0 scoped-query readiness | Complete | Canonical scope/session and disposal primitives | Does not migrate a domain by itself. |
| 3.1 notifications | Complete | Principal-scoped reads, mutations, realtime dedupe/reconnect | Authenticated device/browser release journey remains external evidence. |
| 3.2 attendance reads | Complete | Web and native scoped rosters; drafts and batch commands retained outside Query | Authenticated device/browser and ambiguous-write release evidence remains external. |
| 3.2.1 web build admission | Build remediation complete | Full Next production build | Authenticated `/self` browser journey requires an enabled environment. |
| 3.3 device-security summary | Complete | Principal-scoped Query summary; commands/outbox retained | Physical device/deployed security-backend journey remains release evidence. |

## Remaining delivery order

```text
3.4 authorization-snapshot admission
    ├─ 3.4a entitlement read lifecycle
    └─ 3.4b Cedar decision snapshot lifecycle
        ↓
3.5 feature flags and remaining bounded entity collections
        ↓
Phase 3 consolidation and release-evidence closure
```

### 3.4 — authorization snapshots

The next work is fully specified in
[the Phase 3.4 admission record](2026-10-25-client-state-phase-3-authorization-snapshot-admission.md).
It must preserve the existing fail-closed evaluator and distinguish commercial
entitlement continuity from Cedar authorization snapshots.

### 3.5 — feature flags and remaining bounded collections

Admit one family at a time only after its source of truth, key dimensions,
realtime/polling behavior, command semantics, and account-disposal route are
characterized. Feature flags are read metadata, not authorization. Remaining
entity collections are not automatically eligible merely because they live in
a store.

### Consolidation and release evidence

After the admitted families pass their own exit gates:

1. audit all direct remote-read Zustand writers and retain only bounded client,
   protocol, or durable-command stores;
2. remove a compatibility path only after every importer is migrated and a
   deletion review is explicitly approved;
3. perform the deferred authenticated browser/device journeys, scope changes,
   reconnects, and ambiguous-write recovery against a release-like backend;
4. record evidence tiers without upgrading a G1/G2 contract result into a G5
   device or production claim.

## Phase 3 final exit gate

Phase 3 may be marked complete only when:

- every migrated family has one scoped Query read-cache owner and no second
  mutable Zustand read cache;
- keys include the actual server-relevant principal and applicable
  bond/tenant/perspective/entity dimensions;
- account/scope disposal removes only outgoing private reads and never clears
  MutationCache, outbox, or unrelated durable records;
- stale, missing, denied, and failed security/authorization snapshots fail
  closed and never grant a capability;
- commands retain server-derived authority, idempotency, and reconciliation;
- web offline claims remain limited to the evidenced W-level for each vertical
  slice; and
- raw deletion-first diff review plus relevant G0–G4 evidence are recorded,
  with G5/R1 called out separately when actually run.

## Explicit non-goals

Phase 3 does not retire preference stores, rewrite the outbox, establish a
generic browser replica, make the whole web app offline-first, or mandate an
XState conversion. Those are separate Phase 4–6 or vertical-slice decisions.
