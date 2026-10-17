---
title: "Sanctuary Explore Access and Persistence Model"
status: "accepted"
created: 2026-09-14
updated: 2026-10-11
decision_owner: "Gurudevi product architecture"
tags: [adr, sanctuary, explore, guest, sandbox, local-first, web]
---

# Sanctuary Explore Access and Persistence Model

## Decision

Gurudevi admits people to the real Sanctuary without requiring a phone number,
payment method, or account. The public entry is an **Explore** session: the
same domain routes, feature components, and interaction rules as the product,
backed by a private local data adapter and a clearly identified baseline data
set. It is not a separate preview application and it must not report discarded
writes as successful.

The persistence commitment, rather than a different application, changes as a
person chooses more continuity:

| Session | Identity and data | Intended use |
| --- | --- | --- |
| Explore | No Supabase identity. Browser-local, namespaced data plus baseline fixtures. | Immediate, private, frictionless exploration. |
| Mobile Guest | Explicitly requested anonymous Supabase identity; feature data remains local-first. | Mobile-only temporary continuity under the separate Guest lease ADR; not a web Explore state. |
| Account | Authenticated durable identity and server-authorized data. | Sync, sharing, collaboration, billing, and durable work. |
| Developer sandbox | Development-only, separately gated tooling with scoped real accounts or fixtures. | Engineering and QA only; never the public Explore experience. |

`https://explore.gurudevi.app` is the public, account-free Explore host. Its
clean paths (`/self`, `/workspace`, and the other explicitly supported Explore
surfaces) rewrite internally to `/explore-internal/*`. The old
`/explore/*` public paths are retired and return 404. Sanctuary remains the durable-account
boundary until a feature-specific policy explicitly admits a different
session. `/welcome` offers Explore without turning a visitor into a cloud
identity.

## Non-negotiable experience rules

- A person may navigate and use every feature that has a safe local
  representation. Local edits save locally and remain visible on the current
  browser/device.
- Baseline data makes a first visit understandable, but is visibly sample data,
  resettable, and never mixed with another person's cloud records.
- A request requiring a real external effect -- sharing, invitations, messages
  to other people, provider connections, paid compute, cloud sync, or billing
  -- explains the requirement at that moment and preserves the person's input.
- "Keep this work" is an invitation to create or sign into an account and
  migrate supported local work. It is not an entry gate.
- No public Explore request may create a Supabase anonymous user, outbox item,
  cloud record, analytics identity with personal work, or background sync job.
- Demo/mock interception that returns a success while discarding a mutation is
  forbidden for product-facing exploration. A local adapter must actually
  apply the mutation, or the UI must say that the action is unavailable.

## Relationship to existing guest work

This record preserves the accepted fifteen-day local-first lease in
`2026-09-10-guest-local-first-lease.md` for an explicit anonymous guest
session. Fifteen days is the canonical value; references to fourteen days are
documentation defects, not a second policy.

The existing native guest manager, lease registry, reminder, expiry cleanup,
and account-conversion flow are behavior references. They are not browser
imports: they depend on native storage and Expo routing. The browser must own
an equivalent browser-safe persistence port.

Guest is the mobile-only local-first path defined by the September 10 Guest
lease ADR. There is no browser Guest identity, Guest cloud session, or
cross-device Guest continuity in this product scope. Public web Explore stays
identity-free; Safe Try for authenticated users is a separate per-feature
capability.

## Architecture contract

Domain components receive a narrow session/data capability boundary. They do
not branch into separate "demo UI" and "real UI" trees.

```text
same domain canvas and feature components
               |
     session + capability + data ports
       /            |             \
Explore local                  Account server/sync
adapter                         adapter
```

Each adapter must explicitly define reads, local mutation application, reset,
export for conversion, and unavailable external effects. Domain data schemas
and command validation stay shared; authorization remains server-owned for
durable operations. An Explore adapter never imports PowerSync, mobile native
storage, or a privileged Supabase client.

## Migration and reset

Baseline fixtures are versioned, provenance-labelled product fixtures, not
untracked mock data. Reset restores a new baseline and removes only the active
Explore namespace. Account conversion validates and imports a feature manifest
of supported records transactionally where possible; unsupported records stay
local and are explained before the person commits.

The product must never claim that all Explore work can migrate until that
manifest and its failure/retry behavior exist. A failed conversion preserves
the original local namespace.

## Implementation sequence

1. Inventory the existing demo providers, guest stores, mutation queues, and
   domain fixtures; classify each as reusable behavior, legacy, or unsafe.
2. Define browser-safe Explore session, storage, baseline-fixture, reset, and
   conversion-export contracts in `apps/gurudevi-web` or a browser-safe shared
   package.
3. Deliver Explore at `explore.gurudevi.app` with one real domain canvas and local mutations; prove
   that it makes no auth, API-write, outbox, or sync call.
4. Reuse that route component for the corresponding authenticated domain slice
   by swapping only the adapter.
5. Replace product-facing global demo interception feature by feature. Keep
   developer-only sandbox tooling isolated and production-hidden.
6. Keep mobile Guest governed by its separate accepted lease decision; no web
   Guest state is part of this Explore implementation sequence.

## Known reconciliation work

- The older guest-to-authenticated mutation-queue test and related behavior
  conflict with the no-outbox-before-account rule and are legacy until revised.
- The entry-route record's former fourteen-day wording was corrected to the
  canonical fifteen-day lease.
- Existing guest conversion currently covers only a limited set of records;
  it is not a general conversion guarantee.
- Existing Next.js Sanctuary authorization intentionally rejects anonymous and
  local sessions. Preserve that boundary while Explore is introduced as a
  separate public route family.

## Acceptance criteria

- First-time Explore works with no account, phone, card, or anonymous cloud
  identity.
- A local edit survives reload in its active browser namespace and can be
  reset without affecting durable account data.
- Explore network evidence shows no durable mutation, outbox, or sync request.
- The same domain component renders with local and authenticated adapters.
- External/durable actions retain input and state the actual requirement.
- Reduced motion, keyboard, screen-reader, offline, storage-failure, reset,
  conversion-success, and conversion-failure paths are verified at the
  appropriate evidence levels.


## Platform-scope clarification (2026-10-04)

This ADR governs public **web Explore** only. Mobile does not offer an Explore
mode; it offers the explicit **Continue as Guest** flow governed by
[`2026-09-10-guest-local-first-lease.md`](2026-09-10-guest-local-first-lease.md).
Web does not offer Guest identity, guest-cloud persistence, or cross-device
Guest continuity. Public web Explore remains identity-free. Authenticated
account holders on web and mobile receive feature-level Safe Try under
[`safe-exploration-and-reversible-work-model.md`](../architecture/safe-exploration-and-reversible-work-model.md).
