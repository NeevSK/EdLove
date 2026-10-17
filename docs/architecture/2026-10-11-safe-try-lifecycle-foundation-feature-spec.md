---
title: "Safe Try Lifecycle Foundation Feature Spec"
status: "active"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [safe-try, indexeddb, retention, production-hardening]
---

# FEATURE SPEC: Safe Try Lifecycle Foundation

## Blast Zone: RED / AMBER

**Target seams:** `packages/core/src/lib` lifecycle runtime (AMBER), the
capability declaration contract (RED, additive), browser Safe Try storage and
the existing Fire Journal and attendance adapters (AMBER), plus global release
governance documentation.

## Reuses

- The catalog-owned Safe Try document identity and `resolvePracticeSession`.
- `KeyValueStorage` / `LocalOnlyKeyValueStorage`, the existing practice
  controller, existing feature codecs and fictional fixtures.
- The server-derived authorized-entry result already used by Sanctuary pages.
- Native foreground/background storage maintenance only as an eventual platform
  integration seam; it is not treated as a timer guarantee.

## Contract

Account Safe Try is a local-only, device-local document store. Browser Safe Try
requires IndexedDB. Documents have a central envelope containing a revision,
creation/touch/expiry times, schema identity, and byte accounting. They expire
after 30 inactive days; access rejects expired content and attempts best-effort
cleanup. A device may retain at most 20 Safe Try documents and 5 MiB total,
with lower catalog limits allowed. Optimistic revisions reject a stale writer
once it observes a newer document revision.

Sensitive browser content is permitted only after the UI clearly states that it
stays on this browser/device, is not synced or encrypted at rest, can be
discarded immediately, and is unavailable on another device. No telemetry may
contain document content, account storage keys, or identifiers.

## Does NOT

- Does not add a global Safe Try mode, server sandbox, cross-device sync,
  promotion-to-live, or automatic legacy-key deletion.
- Does not change live account commands, PowerSync identity, Supabase data, or
  the mutation outbox.
- Does not use production as a QA database or introduce provider credentials.
- Does not claim exact background deletion, device evidence, staging evidence,
  or production readiness.

## Complexity budget

One generic lifecycle envelope/runtime and one browser IndexedDB port. Existing
feature adapters may only supply the catalog identity, authorized admission
facts, document codec, and fixture. No feature-owned storage implementation is
introduced.

## Required evidence

G0 covers lifecycle parsing, expiry, quotas, revision conflict, migration
preservation, and production-write denial. G1 covers IndexedDB unavailable,
quota, malformed records, discard failure, account isolation, and live-path
non-reachability. Browser mounting/device/release proof remains separately
gated under the production-evidence policy.

## Deliberately outstanding before the contract can be called complete

The present IndexedDB port fails closed and the generic lifecycle has
optimistic conflict detection, but its document and account index writes are
not yet one atomic multi-key IndexedDB transaction. A simultaneous write from
two tabs can therefore still race between its read and write phases. Do not
describe multi-tab conflict safety as delivered until the storage port exposes
an atomic compare-and-write operation and G2 exercises that race. Native UI
integration, lifecycle telemetry wiring, G3/G4/G5 evidence, and staging stay
outside this implementation checkpoint.
