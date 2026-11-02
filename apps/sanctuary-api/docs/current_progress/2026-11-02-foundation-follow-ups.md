---
title: "Foundation Roadmap and Follow-ups"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [api, foundation, authority, roadmap, follow-ups, todo]
---

# Foundation Roadmap and Follow-ups

What remains after 2026-11-02, as a hierarchy: main tracks, then their parts, in the order
to do them. Each item is marked:

- **[load-bearing]**: architecture or engineering that other work stands on. Give it to
  the most careful engineer or model available, read the linked docs first, and prove
  it with real scenarios. Mistakes here spread.
- **[simple]**: mechanical edits with a clear target. Any agent can do them, following
  the [platform map](../../../../docs/architecture/platform-map.md) and the rules in
  `AGENTS.md`.
- **[owner]**: a decision or an action only Naveen can take.

Overall layer status lives in the
[playbook's layer table](../architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on).
Tick items here as they land.

## Done on 2026-11-02

- [x] Foundation docs: platform map, module structure, domain index, domain design method,
  authority model, data governance, security and AI threat model, API first principles,
  local-first writes, scale and operation, data portability.
- [x] Walking skeleton: module catalog (`apps/sanctuary-api/src/modules/catalog.ts`) with
  fitness tests; one default-deny Cedar namespace per domain plus `Platform`.
- [x] Authority boundary: citizenship on every bond; domain-namespaced Cedar engine
  (`packages/policies/src/modules/engine.ts`); `authorizeCapability` in `security.ts`.
- [x] Offline permission snapshots, server side: `issueSnapshot` and
  `authority.refreshSnapshot`; Ed25519 key from `SNAPSHOT_SIGNING_PRIVATE_KEY`, required
  in production.

These code changes sit on the uncommitted API v1 reset and are **not committed yet**
(see track 0).

## 0. Land the API v1 reset in git [load-bearing]

The new API (foundation, security, operations, the 2026-11-02 work) exists only in the
working tree, on top of ~320 deleted old-API files. A full snapshot is on
`backup/wip-snapshot-20261102`.

- [ ] 0.1 Commit the API v1 reset as its own commit: `apps/sanctuary-api/src`, its docs,
  `packages/core/src/api/v1`, `packages/policies`, `scripts/audit-api-composition*`,
  `render.yaml`, the four API migrations
  (`20261029220000`, `20261030020000`, `20261030021000`, `20261030022000`). Review the
  deletions first (Deletion Veto).
- [ ] 0.2 Commit the 2026-11-02 code on top as a second commit.

## 1. Finish authority, layer 2 [load-bearing]

Read: [authority model](../../../../docs/architecture/authority-model.md).

- [ ] 1.1 Database permissions
  - [ ] Grant the API's database role write on `public.permission_snapshots` and read on
    `public.policy_version` (migration `20260726000000` grants only `service_role` and
    read-only `authenticated`).
  - [ ] Add both to the readiness probe in `platform.ts`.
- [ ] 1.2 Real-database scenarios through `test:database`
  - [ ] `authorizeCapability`: bond ended between resolve and decide (under row lock),
    another school's record, suspended bond, deleted account.
  - [ ] `issueSnapshot`: row written, readable only by its owner under RLS, ended bond
    gets nothing, missing policy version.
- [ ] 1.3 Make the boundary unskippable
  - [ ] A handler helper or middleware so every domain command calls
    `authorizeCapability`.
  - [ ] A composition-audit check that no domain handler skips it.
- [ ] 1.4 Decision quality
  - [ ] Pass policies to Cedar as an id map (`<file>#<n>`) so decisions name their policy
    in the audit (Cedar reports `policy0` … today).
  - [ ] Validate requests against the schema once actions are declared.
  - [ ] Put domain-namespaced capabilities into the snapshot once any is permitted.
- [ ] 1.5 Bond model
  - [ ] Support more bond entity types in `resolveScope` (only `SCHOOL` and `PERSONAL`
    today; `CLASSROOM`, `PERSONAL_CLASSROOM`, `COMMUNITY`, `GROUP`, `PLATFORM` are
    refused).
  - [ ] [owner] Decide whether bonds get their own `citizenship` column (citizenship is
    stored on `public.users` today; bonds derive it from entity type).
- [ ] 1.6 Move role policies into domain namespaces, one subdomain at a time as each card
  is admitted. The role engine keeps running until then.

## 2. App client for /api/v1 [load-bearing]

Nothing in the apps can call the new API yet; only tests create a v1 client. This blocks
every app feature, including snapshot refresh.

- [ ] 2.1 One authenticated v1 client per app (session token, account switching, request
  identifiers), in `@repo/core` next to `api/v1/client.ts`.
- [ ] 2.2 Commands carry idempotency keys and replay safely from the offline queue (see
  [local-first writes](../architecture/api-foundations/local-first-writes-and-sync.md)).
- [ ] 2.3 Call `authority.refreshSnapshot` when a scope session commits
  (`packages/core/src/store/scopeSessionCoordinator.ts`) and before expiry.
- [ ] 2.4 Retire `packages/core/src/api/authorization.ts` (it calls the removed
  `authorization.refresh`).

## 3. Horizontal layers 3–7 [load-bearing]

Read: [data governance](../../../../docs/architecture/data-governance-and-records.md),
[playbook](../architecture/api-engineering-playbook.md). Every domain needs these before
admission.

- [ ] 3.1 Durable operations (layer 3): land the operation-foundation migration; scenarios
  for duplicate, conflicting payload, concurrent retry, unknown outcome and recovery.
- [ ] 3.2 Request budgets (layer 4): per person and per institution; the morning burst.
- [ ] 3.3 Audit trail (layer 5)
  - [ ] Table design: actor, bond, channel, device, agent and delegator, action, target,
    times, reason, outcome; hash chain.
  - [ ] Write path from `authorizeCapability` decisions and every command.
  - [ ] Read auditing for sensitive classes; access to the audit itself audited.
- [ ] 3.4 Records lifecycle (layer 6): versions, corrections, soft delete with restore
  window, legal hold, retention jobs, erasure.
- [ ] 3.5 Grants, consent and minors (layer 7): sharing grants evaluated with bonds;
  guardian consent; coming of age.

## 4. First vertical slice [load-bearing]

Proves the frame end to end. Read: [domain design method](../../../../docs/architecture/domain-design-method.md),
[module structure](../../../../docs/architecture/module-structure.md).

- [ ] 4.1 [owner] Pick the subdomain.
- [ ] 4.2 Write and admit its card.
- [ ] 4.3 Contract in `@repo/core/api/v1`, Cedar actions and policies in its namespace,
  Postgres schema for its domain, module folder, scenario tests through the real host and
  database.
- [ ] 4.4 Add the import-boundary fitness checks when this first module folder exists (no
  reaching into a module's internals, no writes to another module's tables).

## 5. Workspace clean-up [simple]

- [ ] 5.1 Remove the remaining legacy client contracts in `packages/core/src/api` (249
  `legacy-source` findings in `pnpm audit:api-composition`).
- [ ] 5.2 Fix the `@repo/core` type errors left by the manager removal (imports of
  `logic/managers/factory` and `growth`).
- [ ] 5.3 Web code that still calls removed procedures, e.g.
  `apps/gurudevi-web/lib/community/posts.ts`.
- [ ] 5.4 `packages/core/src/logic/permissions/__tests__/localEvaluator.test.ts`, "delegates
  to WASM evaluate and returns true if decision is Allow", fails. It failed before the
  2026-11-02 changes.
- [ ] 5.5 Copy the 2026-11-01 plan *Canonical Architecture: ReBAC Covenant, Semantic
  Citizenship in Bonds, and Omnichannel Doors* from Antigravity session `789f6735` into
  `docs/architecture/` with its date.
- [ ] 5.6 Mobile tab bar: restore Library, Community and Profile as places (removed on
  2026-11-01), empty until their domains have procedures. Needs the owner's yes on what
  each shows meanwhile.

## 6. Owner actions [owner]

- [ ] 6.1 Before the next deploy, which now fails without it: generate an Ed25519 key pair.
  Private key (PKCS#8 PEM) in Doppler and Render as `SNAPSHOT_SIGNING_PRIVATE_KEY`; public
  key (raw 32 bytes, base64) in `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY` and
  `NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY`. Decide how it rotates.
- [ ] 6.2 Rotate the two Stitch API keys pasted into an Antigravity chat on 2026-11-01;
  keep them in Doppler.
- [ ] 6.3 Open decisions: attendance owner (Learning or Ops), Rewards as its own domain,
  Postgres schema per domain (recommended), where client-side domain logic lives, the
  first slice. See the [domain index](../../../../docs/architecture/domains/README.md#open-decisions).
- [ ] 6.4 Production hosting that doesn't sleep before the morning burst (the Render free
  tier does).
