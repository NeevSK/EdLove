---
title: "Platform · Identity and accounts"
status: "draft"
owner: "Naveen"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
scribe: "Claude"
tags: [architecture, domains, platform, identity, card]
---

# Identity and accounts

Written from the code on 2026-11-08 (`packages/core/src/api/v1/contract.ts`,
`apps/sanctuary-api/src/core/router.ts`, `apps/sanctuary-api/src/security/security.ts`). It
records what the module does, not a new rule. The owner confirms it before `status: admitted`.

## Facts it owns

- The canonical account, `public.users.id` (UUIDv8), with `display_name` and the onboarding state.
- Credential bindings in `auth_identities` (see the [authority model](../../authority-model.md#the-parts)).

## Invariants (what must always be true)

- Every call carries a verified account and an unexpired session; an expired one is `UNAUTHORIZED`, checked again after each read.
- A rejected or malformed database row is `SERVICE_UNAVAILABLE`, never a partial answer.

## Lifecycle of each fact (states and who may move between them)

- Account: created by the database with its credential; onboarding goes `false → true` once, through `identity.createInitialBond`.

## Authority (which capacities, through which bonds, may do what)

- Every capability here acts on the caller's own account only. No bond is needed to read your own entry.

## Privacy and visibility class (see data governance)

- Account and bonds are private to the account. Class name to be settled (open question).

## Mutation kind per fact: editable | versioned | corrected | append-only

- `display_name`: editable. Onboarding completion: set once.

## Retention class and horizon

- Not decided (open question).

## Commands

- `identity.createInitialBond`

## Queries

- `identity.session`
- `identity.scopes`
- `identity.entry`
- `identity.syncCredentials`: a PowerSync grant for the caller's own account (ES256, `sub` and
  `canonical_account_id` = the account, audience = the PowerSync origin, at most 5 minutes and never
  past the session). Stores nothing. Added 2026-11-08 for the device sync connector.

## Events it publishes

- None yet.

## What it reads from other subdomains (queries or events only)

- Active bonds (`public.bonds`), owned by Authority, for `identity.scopes` and `identity.entry`.

## Standards it maps to (OneRoster, QTI, CLR …), if any

- None yet.

## Open questions

1. `identity.createInitialBond` inserts a row into `public.bonds`, which [Authority owns](../../authority-model.md#the-parts), in the same transaction that completes onboarding. The [domain design method](../../domain-design-method.md#how-subdomains-work-together) says one transaction changes one subdomain. Keep it as the one sanctioned first-bond path, or move the bond insert to Authority?
2. It writes `public.api_command_audit` directly with a fixed `app` channel rather than through the durable command path. Move it there when layer 3 lands?
3. Privacy class and retention horizon for the account record.
