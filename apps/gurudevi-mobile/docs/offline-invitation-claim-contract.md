---
title: "Offline Invitation and Membership Claim Contract"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, offline, powersync, invitations, memberships, claims, rpc]
---

# Offline Invitation and Membership Claim Contract

## Decision

Invitation claiming is an online-authoritative command. The client must not
pretend that a school bond, classroom membership, citizenship change, or invite
consumption succeeded while offline.

This is intentional: `claim_invite_code` performs several related changes as one
database transaction. Supabase documents RPC as the appropriate boundary for
multi-statement transactional logic, while PowerSync's CRUD queue is designed for
queued table writes. [Supabase RPC documentation](https://supabase.com/docs/reference/javascript/rpc)

## What can work offline

| Action | Offline behavior |
| --- | --- |
| Read already-synced school/classroom data | Read locally from PowerSync |
| See an already-synced invite preview | Show cached data with an “online claim required” state |
| Claim a school invite | Queue a local claim intent; do not create a local bond |
| Generate a new school invite | Queue a local draft only; do not show it as redeemable |
| Add a provisional classroom roster entry | May be queued as a normal synchronized mutation once the local schema and upload policy support `classroom_students` |
| Consume/redeem an invite | Server RPC only |

## Required state machine

```text
LOCAL_DRAFT
    -> PENDING_NETWORK
    -> CLAIMING
    -> CLAIMED

PENDING_NETWORK -> RETRYABLE_FAILURE -> PENDING_NETWORK
CLAIMING        -> REJECTED
CLAIMING        -> ALREADY_CLAIMED
```

The local intent should contain only safe metadata:

- local intent ID;
- authenticated internal user ID;
- normalized invite code or a protected reference to it;
- requested entity/capacity preview, if known;
- created time, attempt count, and last error;
- status and server result.

It must not create a fake local `Bond`, change `users.citizenship`, or mark the
invite as consumed. The UI may show “waiting for connection,” but authorization
must continue to use the last server-confirmed bond and permission snapshot.

## Retry and idempotency

When connectivity and authentication return, the worker calls the same RPC. The
RPC already locks the invite row and returns success for an existing matching
bond, so a retry is safe for the current claim path. The client should still use
one stable intent ID for telemetry and deduplication, and should classify these
responses separately:

- invalid, inactive, or exhausted code → terminal rejection;
- account mismatch or anonymous account → terminal user-action error;
- timeout/network failure → retryable;
- existing matching bond → successful completion;
- successful new bond → successful completion.

PowerSync upload errors must not be used for the RPC intent unless the backend
explicitly supports that command in its upload contract. A failed upload item can
block a CRUD queue, so command validation should return an application result and
retain retry state rather than repeatedly returning an unrecoverable 4xx.

## Current repository gap

As of 2026-08-10:

- `packages/core/src/native/flows/FlowResolver.ts` calls `claim_invite_code`
  directly;
- there is no durable offline claim-intent table or retry worker;
- `invite_codes` is not part of the local PowerSync schema;
- the local PowerSync schema contains a legacy `students` table but not the
  canonical `classroom_students` provisional-membership table.

Therefore the safe current behavior is to disable or defer the claim action while
offline and show a clear pending/network-required message. The next implementation
should add a local-only `membership_claim_intents` table and a connectivity-aware
worker before advertising offline invite claiming.

## Implementation order

1. Add the local-only intent schema and status transitions.
2. Add retry handling tied to authenticated account scope and account switching.
3. Make the claim UI visibly online-required or pending; never show a claimed bond
   before the server result is confirmed.
4. Add tests for retry, duplicate claim, expired code, logout/account switch, and
   process restart while pending.
5. Only then decide whether invite previews and provisional classroom roster writes
   belong in PowerSync Sync Streams.

