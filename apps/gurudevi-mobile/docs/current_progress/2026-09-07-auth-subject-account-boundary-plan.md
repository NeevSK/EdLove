---
title: "Auth Subject–Account Boundary Plan"
status: "phase-1-implemented-code"
created: 2026-09-07
owners: [identity, lifecycle, mobile, web]
tags: [auth, account-lifecycle, multi-account, web, native]
---

# Auth Subject–Account Boundary Plan

## Problem

The authenticated Supabase subject (`auth.uid()`) and the Gurudevi account
(`public.users.id`) may differ for mapped/legacy identities. Lifecycle SQL
already resolves that mapping through `public.get_my_id()`, but client shell
admission and remembered-account capture had compared the two IDs directly.

## Invariants

1. An auth subject is not an account ID.
2. A resolved identity may be applied only to the auth subject whose request
   produced it; an older account's in-flight resolution cannot overwrite a
   newer subject.
3. Account-scoped persistence uses the resolved Gurudevi account ID and stores
   the Supabase auth subject separately.
4. Routing admits an active profile only when the resolved auth subject matches
   the restored session. It never compares the profile/account ID with
   `session.user.id`.
5. Server lifecycle RPCs keep resolving the subject through `get_my_id()`.

## Delivery phases

1. **Client proof boundary — current slice.** Key in-flight identity work by
   auth subject/session, reject stale profile-resolution results, and expose the
   resolved auth subject to bootstrap routing and device-account capture.
2. **Server contract proof.** Have the identity highway return an explicit
   authenticated-subject binding or signed request context; add mapped-identity
   integration tests against the real Supabase environment.
3. **Persistence migration.** Audit existing remembered-account records,
   entitlement snapshots, telemetry identifiers, and PowerSync scopes for any
   former conflation. Migrate only records with a verified mapping.
4. **Universal acceptance.** Exercise legacy/mapped and one-to-one users on
   browser and native through restore, A → B switch, sign-out, recovery,
   deletion request/cancel, reload, offline return, and stale-response races.

## Phase 1 evidence and limits

Implemented client proof now keys in-flight identity requests by auth subject
and token, rejects stale resolutions, carries the resolved auth subject through
the auth context, and requires that binding before either route admission or
remembered-account capture. Offline restoration also verifies the persisted
`{ accountId, authUserId }` pair; it never uses equality between those two IDs
as proof.

Focused unit coverage includes mapped account IDs, a mismatched resolved
subject, stale-resolution ownership, and the account-capture retry path.
`@repo/core` type-check and the focused test suite pass. This remains code
evidence, not device or real-Supabase acceptance: Phase 2 must expose or prove
the server-side subject binding before the Phase 4 matrix can be signed off.

## Explicit non-goals

This does not alter account authority, create a reactivation workflow, change
Supabase schema, or claim a server identity response is valid without a
session-scoped request. It makes the client boundary truthful until Phase 2
adds server-side proof.
