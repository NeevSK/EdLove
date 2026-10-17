---
title: "Gurudevi Web Dual-Surface Integration Contract"
status: "active"
created: 2026-10-13
updated: 2026-10-14
author: "Gurudevi product architecture"
tags: [architecture, gurudevi-web, explore, sanctuary, storage, authentication, authorization]
---

# Gurudevi Web Dual-Surface Integration Contract

## Decision

`gurudevi-web` is one Next.js application with two deliberately different
browser surfaces:

| Host | Visitor | Identity | Data authority | Canonical use |
| --- | --- | --- | --- | --- |
| `gurudevi.app` | public visitor | none | public/static content | marketing, editorial, legal, entry |
| `explore.gurudevi.app` | outsider / explorer | none | browser-local fixtures and local edits | showcase, try-before-account, future local sandbox |
| `sanctuary.gurudevi.app` | signed-in account holder | verified Supabase session | server-authorized account data plus explicitly local Safe Try | real work, collaboration, durable effects |

The surfaces may share route components and domain contracts, but they must
not share identity, write authority, or persistence namespaces accidentally.
The host is a presentation and boundary selector; it is never the sole
authorization mechanism.

## Product-surface rule

Explore is a progressive public window onto the real product, not a parallel
demo application. A capability has one identity and, when it is interactive on
both surfaces, one renderer/UI. The runtime behind that renderer changes:

```text
capability declaration + shared renderer
          |
          +-- Explore runtime: fictional, local-only, resettable
          |
          +-- Sanctuary runtime: authenticated, server-authorized, durable
```

The public catalogue may list every real capability with a truthful state
(`local practice`, `available in Sanctuary`, `native only`, or `not yet
delivered`). It must not infer that a capability is interactive merely because
it has a local mode. A browser Explore interaction requires an explicit
browser `practice` declaration.

## Runtime contract

```text
request host
   |
   +-- gurudevi.app --------------------> public route family
   |
   +-- explore.gurudevi.app ------------> Explore route family
   |                                      no AuthProvider, no API writes
   |
   +-- sanctuary.gurudevi.app ----------> account route family
                                          Supabase claim verification
                                          -> authoritative identity/scope
                                          -> feature authz
                                          -> live or Safe Try adapter
```

Explore is not a second application. Its clean paths are internally rewritten
to the non-public `/explore-internal/*` route namespace. The old `/explore/*` public paths
are retired and return 404.

## Storage and persistence matrix

| Surface / mode | Core identity | Current adapter | Allowed writes | Must never do |
| --- | --- | --- | --- | --- |
| Explore | `experience: explore`, guest `browser-explorer` | `createExploreStorage()`; localStorage with in-memory fallback | local browser fixtures and edits | create Supabase identity, API mutation, outbox, sync, account-cookie bootstrap |
| Public demo | no durable principal | feature-specific fixture adapter | none or local-only by explicit contract | imply that sample data is a person's account data |
| Account Safe Try | `experience: sandbox`, account principal | IndexedDB via `createRequiredBrowserPracticeStorage()` and `resolvePracticeSession()` | account-owned, device-local practice documents | dispatch production mutations or silently fall back to localStorage when required storage fails |
| Account live | `experience: standard`, account principal | feature-owned API/repository and server persistence | only after server authn + scope/authz | use client role/capacity as authority or write directly from Explore adapters |
| Mobile Guest | guest principal under the separate mobile lease | native local-first adapter | device-local until explicit conversion | treat it as web Explore or grant cloud-write authority |

The canonical namespace helpers are `createPersistenceIdentity()` and
`derivePersistenceKey()` in `packages/core/src/lib/persistenceBoundary.ts`.
Feature callers must use those helpers rather than inventing storage keys.
Those namespaces are correctness boundaries, **not encryption or a security
sandbox**. Browser-local practice data can be read by someone using the same
browser profile and by same-origin script running under a successful XSS or
dependency compromise. Explore must state this plainly, provide reset, avoid
sensitive analytics/logging, and never encourage visitors to enter secrets.

## Authentication and authorization

Authentication answers “who is this browser?” and is supplied by Supabase on
the Sanctuary host. The browser session is not itself authorization.

1. The Sanctuary proxy refreshes cookies and validates claims.
2. `resolveAuthorizedEntry()` verifies the subject and asks the authoritative
   Sanctuary API for the resolved account, capacity, and active scope.
3. Feature operations apply feature-specific authorization and server checks.
4. Account Safe Try uses the account ID only to namespace local practice data;
   it remains production-write denied.

Explore intentionally skips the web `AuthProvider` at the shared Sanctuary
layout boundary. Its pages must not call `createServerSupabaseClient()`,
`resolveAuthorizedEntry()`, account queries, or live repositories. A component
that needs account identity belongs on Sanctuary or must receive a feature-owned
Safe Try adapter explicitly.

The Explore runtime must never fall back to a live adapter when local storage
fails. It must surface a recoverable local error instead. Switching surface or
account must dispose stale work so a local completion cannot target whichever
account happens to be current later.

The web Self floor enforces that rule by keying its mounted runtime to the
surface and account identity. A transition remounts the floor rather than
reusing its workbench, local adapter, or in-flight view state across modes.
Its live Self adapter also carries an abort signal and initiating account ID
through session resolution; it checks both before dispatch, so a delayed
session cannot retoken account A's work to account B. Cancellation cannot undo
a request that Sanctuary has already accepted; callers must describe that
outcome truthfully and must not retry a non-idempotent write automatically.

## Current integration status

Implemented:

- explicit `explore.gurudevi.app` host classification and read-only route policy;
- clean-host internal rewrites to the non-public `/explore-internal/*` namespace;
- Explore host skips `AuthProvider` while preserving the shared query shell;
- clean-host Explore navigation no longer emits `/explore/*` links;
- “Keep this work” crosses explicitly to the Sanctuary sign-up origin;
- host, proxy, and route-safety tests cover the new boundary.
- the Explore Self route mounts the existing `SelfFloor` with an Explore-local
  storage/workbench adapter and remote canvas sync disabled; Fire Journal is
  the first explicitly browser-practice capability on that shared floor;
- Fire Journal now has one extracted renderer (`FireJournalFeature`) and an
  injected runtime (`FireJournalRuntime`); live and Explore adapters are
  selected outside the renderer, so the feature UI does not choose storage or
  call the account API itself;
- a mounted component test proves the Explore Fire Journal interaction does
  not call the mocked account Self API client.

Required follow-through:

1. Add `explore.gurudevi.app` DNS, TLS, and deployment mapping. Code cannot
   prove provider configuration.
2. Audit every page under `app/(sanctuary)` and classify it as account,
   Explore, public, or intentionally shared. No account page may become
   reachable through the Explore host merely because it is in the same route
   group.
3. Complete the extraction of shared feature renderers toward a single `FeatureRuntime` seam:
   `mode: practice` selects a local controller; `mode: live` selects the
   account repository. The current shared Self floor is the interim composition
   seam; feature renderers must not choose storage themselves or import live
   operations directly.
4. Replace remaining ad-hoc web storage (`localStorage` workbench keys and
   feature-specific constants) with the persistence boundary where the data is
   user-owned or security-sensitive. Preserve compatibility readers until a
   tested migration exists.
5. Add a browser-network evidence test for Explore proving no Supabase, `/api`, outbox,
   or sync request is made during load, edit, reset, and navigation.
6. Add a cross-host browser test proving an authenticated Sanctuary cookie or
   query cache cannot make Explore render account data.
7. Keep server authz authoritative for live operations. Client presentation,
   route host, feature flags, and capacity labels are not substitutes for
   server authorization.
8. Add delayed-session transition coverage for live adapters: an operation
   begun for account A must abort rather than acquire account B's later session
   after a surface or account switch.

## Non-goals

- Do not fork the entire app into a second Explore codebase.
- Do not share a broad cookie domain across `sanctuary.gurudevi.app` and
  `explore.gurudevi.app`.
- Do not create anonymous Supabase users for public Explore.
- Do not migrate Explore browser data automatically into an account. Account
  conversion must be an explicit, feature-specific, user-confirmed operation.
- Do not call the future engineering Sandbox the public Explore surface.

## Verification standard

The dual-surface contract is accepted only when the following evidence exists:

- G0: host classification, route allow-list, persistence decisions, and import
  boundaries are statically checked;
- G1: Vitest boundary tests prove local-only Explore writes and account Safe Try
  production-write denial;
- G2: stateful browser scenarios prove reload/reset/isolation and rejected live
  actions retain user input; a mounted component test proves the configured
  Explore Fire Journal flow calls no account client;
- G4: Next.js browser tests prove both hosts render the intended route family,
  metadata, navigation, and network policy;
- R1: deployment checks prove DNS/TLS, cookie scope, API CORS, and Supabase
  redirect allowlists for the actual production hosts.

