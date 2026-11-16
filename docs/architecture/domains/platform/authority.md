---
title: "Platform · Bonds and authority"
status: "draft"
owner: "Naveen"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
scribe: "Claude"
tags: [architecture, domains, platform, authority, card]
---

# Bonds and authority

Written from the code on 2026-11-08 (`packages/core/src/api/v1/contract.ts`,
`apps/sanctuary-api/src/security/security.ts`, `packages/policies`). The model itself is the
[authority model](../../authority-model.md); this card records the capabilities exposed today.

## Facts it owns

- Bonds (`public.bonds`): account, entity, capacity, citizenship, status, validity.
- Signed offline permission snapshots (`public.permission_snapshots`) and the enforced policy fingerprint (`public.policy_version`).

## Invariants (what must always be true)

- A snapshot is issued only for an active bond of the calling account, re-read under lock in the same transaction.
- The stored `policy_version` and every newly issued snapshot carry the same fingerprint of the policies the server enforces.
- With no signing key configured, no snapshot is issued (`SERVICE_UNAVAILABLE`).

## Lifecycle of each fact (states and who may move between them)

- Bond: `invited → active → suspended → ended (kept)`, from the authority model.
- Snapshot: replaced on each refresh (upsert by id); expires at `expiresAt`.

## Authority (which capacities, through which bonds, may do what)

- A person may refresh the snapshot only for a bond they hold. Decisions on the server are Cedar; the snapshot only lets the device hide what it expects to be denied.

## Privacy and visibility class (see data governance)

- Private to the account. Class name to be settled (open question).

## Mutation kind per fact: editable | versioned | corrected | append-only

- Bond: versioned through its lifecycle (ended bonds are kept). Snapshot: replaced.

## Retention class and horizon

- Not decided (open question).

## Commands

- `authority.refreshSnapshot`

## Queries

## Events it publishes

- None yet. Devices receive the stored snapshot row through sync.

## What it reads from other subdomains (queries or events only)

- The account from Identity.

## Standards it maps to (OneRoster, QTI, CLR …), if any

- None.

## Open questions

1. `authority.refreshSnapshot` writes stored rows, so it is a command, but it is not audited and has no idempotency key. Does it go through the durable command path when layer 3 lands?
2. Bonds are created today by `identity.createInitialBond` (see the identity card). Should Authority own that insert?
3. Privacy class and retention horizon for bonds and snapshots.
