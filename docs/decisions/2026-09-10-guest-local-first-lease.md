---
title: "Guest Local-First Lease and Cloud-Save Boundary"
status: "accepted"
created: 2026-09-10
decision_owner: "Gurudevi mobile architecture"
tags: [adr, guest, local-first, retention, identity]
---

# Guest Local-First Lease and Cloud-Save Boundary

## Decision

An anonymous guest is a fully capable temporary local-first person for fifteen
days from guest creation. They may discover, read, navigate, interact with, and
create or edit every feature that has a local representation. Their work remains
on the current device only and must never be written to cloud data, synchronization
queues, or shared community/classroom records before they create an account.

The fifteen-day lease is a data-retention boundary, not a feature-access
boundary. At expiry, guest-scoped local data is deleted and the guest returns to
`/welcome`. Creating or signing into a real account before expiry migrates the
eligible local data into the account under the normal server authorization path.

## Experience contract

| Moment | Guest experience |
| --- | --- |
| Browsing and using a feature | Full local interaction; no account wall |
| Creating or editing work | Save locally on this device for the active lease |
| Trying to save, share, or sync to the cloud | Explain that an account is required and offer the upgrade action without discarding input |
| Days 1, 3, 6, 10, and 15 | A compact, dismissible reminder with days remaining; never an overlay that blocks the screen |
| Day 15 | A final non-blocking reminder that local work is removed when the lease ends |
| Lease expiry | Delete registered guest-local data, clear the anonymous session, and return to `/welcome` |
| Account creation before expiry | Migrate supported local data, then enable cloud sync only after the authenticated identity is established |

## Enforcement boundaries

- Route and capability policy grants guest access to local feature surfaces; it
  does not grant cloud-write authority.
- Every cloud-write boundary must reject an anonymous identity before a request
  or outbox item is created. A local fallback must preserve the requested work.
- Every guest-local store must register its keys with the shared lease registry
  so expiry deletes all guest data, not only one feature's data.
- The guest lease record carries `startedAt`, `expiresAt`, and dismissed reminder days; client clocks
  may show guidance but cannot extend the lease after an expiry has been
  observed.

## Feature spec: guest local-first lease

### Blast zone: RED + AMBER

### Targets

- `packages/core/src/native/guestIdentity.ts` and guest-data boundaries: lease,
  key registry, expiry cleanup, and migration contract.
- cloud write adapters and outbox admission: reject anonymous cloud writes
  before transport, preserving a local representation.
- `apps/gurudevi-mobile/src/entry/GuestPersistenceNotice.tsx`: compact,
  dismissible status/reminder only.
- feature stores such as `packages/self/src/features/selfCanvasStore.ts`:
  local persistence for guests and cloud persistence only after account upgrade.

### Reuses

`GuestDataManager`, `guestStorageKey`, `SafeZustandStorage`,
`isLocalOnlyIdentity`, the existing guest-to-account migration pipeline, and
the route gate.

### Does not

Does not grant anonymous identities access to another person's cloud data,
create anonymous cloud records, weaken server authorization, or silently drop
work that a person created locally.

### Complexity budget

Small independently tested changes; each function under the workspace
complexity threshold. Each migrated feature must add a guest-local and
authenticated-cloud scenario test.

## Current gap

The current global guest banner is intrusive, guest persistence has no shared
fifteen-day lease, and at least the Self canvas schedules a Supabase
`user_preferences` upsert for an anonymous guest. That is incompatible with
this decision and must be corrected before calling guest mode complete.
