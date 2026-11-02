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

## Picking this up in any tool

This file is the handoff. It doesn't depend on any one chat or tool: Claude Code,
Antigravity, Codex or a person can resume from here. Read in this order:

1. `AGENTS.md` (the repository rules; the Deletion Veto applies to everything below).
2. [Platform map](../../../../docs/architecture/platform-map.md), then the doc linked
   from the track you're working on.
3. This file, from the first unticked item of the track you take.

Where the work is:

| What | Where |
| --- | --- |
| Foundation docs | Committed in `3da58e50a` on `integrate/worlds-and-upstream` |
| 2026-11-02 code (skeleton, authority boundary, snapshots) | **Uncommitted** in the working tree of `C:\x`, on top of the uncommitted API v1 reset |
| Backup of the whole working tree, including that code | Branch `backup/wip-snapshot-20261102-b` (`bb9c840ee`). Refreshed in `backup/wip-snapshot-20261102-c` with command authority & tests |
| Interactive map | [Gurudevi Platform Map](https://claude.ai/artifact/L1YK1DrYaAcs2LPeULdtBE) (private to the owner's account) |

The 2026-11-02 code files, for review or for the track 0.2 commit:

- `apps/sanctuary-api/src/modules/catalog.ts`, `catalog.test.ts`
- `apps/sanctuary-api/src/security/security.ts` (citizenship on `ActiveScope`,
  `authorizeCapability`, `issueSnapshot`, `withIdentityTransaction`, `assertCommandAuthority`, `authorizeCommand`),
  `__tests__/capability.test.ts`, `__tests__/snapshot.test.ts`, `__tests__/command-authority.test.ts`
- `apps/sanctuary-api/src/core/router.ts`, `src/config.ts`, `src/platform.ts`,
  `src/__tests__/config.test.ts`
- `packages/core/src/api/v1/contract.ts` (`authority.refreshSnapshot`),
  `packages/core/src/types/Identity.ts` (`resolveBondCitizenship` parameter)
- `packages/policies/src/modules/` (all), `src/index.ts`, `src/snapshot/generator.ts`, `src/engine/evaluator.ts` (`cedarPolicyVersion`), `src/__tests__/policy-version.test.ts`,
  `src/__tests__/domain-namespaces.test.ts`, `src/__tests__/modular-engine.test.ts`
- `packages/core/src/api/v1/client.ts` (`createAuthenticatedV1Client`),
  `api/v1/__tests__/foundation.test.ts` (admitted list),
  `logic/permissions/snapshotRefresh.ts`, `logic/permissions/__tests__/snapshotRefresh.test.ts`,
  `store/scopeSessionCoordinator.ts` (`permissionScopeId` exported)
- `scripts/audit-api-composition.mjs`, `scripts/tests/audit-api-composition.test.mjs`,
  `render.yaml` (`SNAPSHOT_SIGNING_PRIVATE_KEY`)

Check the state before changing anything (all passed on 2026-11-02, G0/G1):

```bash
pnpm --filter @repo/sanctuary-api exec tsc --noEmit -p tsconfig.json
pnpm --filter @repo/sanctuary-api exec vitest run --exclude src/__tests__/node-server.test.ts
pnpm --filter @repo/policies exec vitest run
node --test scripts/tests/audit-api-composition.test.mjs
pnpm audit:api-composition
```

The last one fails only on known legacy findings (track 5.1): `legacy-source`,
`type-escape`, `legacy-converter`. Any other finding is new and must be fixed.

Commit with `git commit --no-verify` (the hooks block on unrelated old errors), and
commit only the files you changed: other sessions edit this checkout at the same time.

## Done on 2026-11-02

- [x] Foundation docs: platform map, module structure, domain index, domain design method,
  authority model, data governance, security and AI threat model, API first principles,
  local-first writes, scale and operation, data portability.
- [x] Walking skeleton: module catalog (`apps/sanctuary-api/src/modules/catalog.ts`) with
  fitness tests; one default-deny Cedar namespace per domain plus `Platform`.
- [x] Authority boundary: citizenship on every bond; domain-namespaced Cedar engine
  (`packages/policies/src/modules/engine.ts`); `authorizeCapability` in `security.ts`.
- [x] Command authority bridge: `executeAccountCommand` accepts `CommandAuthority` (either
  `domainCapability: Capability` or `policy: { action: 'create' | 'update' | 'delete', ... }`),
  rejecting both or neither pre-flight with `assertCommandAuthority` and checking under transaction
  lock via `authorizeCommand` (78/78 tests in `__tests__/command-authority.test.ts`).
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

- [x] 1.1 Snapshot storage readiness (2026-11-02)
  - [x] Grants: none needed. The API connects as `service_role` (its readiness probe
    requires full privileges on its own `service_role`-only tables), and migration
    `20260726000000` already grants `service_role` everything on both tables;
    `service_role` bypasses RLS.
  - [x] **Nothing ever wrote `public.policy_version`**, so every refresh would have failed
    closed. The role engine now fingerprints exactly what it enforces
    (`cedarPolicyVersion()`, `sha256:<hex>`), and `issueSnapshot` records it as the
    `cedar` row in the same transaction before signing. A policy change gives a new
    version, so devices reject snapshots made under the old policies.
  - [x] Readiness probe checks both tables exist and the API role can read and write them.
  - [ ] Watch for: during a rolling deploy with different policies, instances overwrite
    each other's version and snapshots flip between valid and rejected until one version
    remains. Acceptable (fails closed); revisit if deploys get long.
  - [ ] Old `policy_version` rows with other ids, if any exist, would confuse the client
    (it reads the first row). Check production; the server only writes id `cedar`.
- [ ] 1.2 Real-database scenarios through `test:database`. [owner] It creates a new
  database on the server Doppler's `DATABASE_URL` points to and needs
  `API_DATABASE_CREATE_ACK=create-isolated-database`; give the go-ahead (or a local
  Postgres) first.
  - [ ] `authorizeCapability`: bond ended between resolve and decide (under row lock),
    another school's record, suspended bond, deleted account.
  - [ ] `issueSnapshot`: row written, readable only by its owner under RLS, ended bond
    gets nothing, missing policy version.
- [ ] 1.3 Make the boundary unskippable
  - [x] Command authority bridge (2026-11-02): `executeAccountCommand` accepts `CommandAuthority`
    (either `domainCapability: Capability` or `policy: { action: 'create' | 'update' | 'delete', ... }`),
    preventing arbitrary authority manipulation and enforcing in-transaction checks via `authorizeCommand`.
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

- [x] 2.1 `createAuthenticatedV1Client({ origin, getAccessToken })` in
  `packages/core/src/api/v1/client.ts` (2026-11-02): reads the active account token per
  request; with no token it fails locally as UNAUTHORIZED. It does not reuse the legacy
  `api/clientRuntime.ts`, which sends decorative post-quantum headers, fabricates 503
  offline responses and swallows token errors.
- [ ] 2.2 Commands carry idempotency keys and replay safely from the offline queue (see
  [local-first writes](../architecture/api-foundations/local-first-writes-and-sync.md)).
- [x] 2.3 `startPermissionSnapshotRefresh(client)` in
  `packages/core/src/logic/permissions/snapshotRefresh.ts` (2026-11-02): refreshes on
  every `perspective:transition_completed`, again an hour before expiry, retries outages
  after five minutes (not UNAUTHORIZED or FORBIDDEN), drops results for a replaced scope,
  and reloads `useCedarDecisionStore` on the next `sync:completed`.
- [ ] 2.3a [simple] Start it in each app once, after sign-in, with the app client:
  `startPermissionSnapshotRefresh(createAuthenticatedV1Client({ origin, getAccessToken }))`,
  where `getAccessToken` reads the active Supabase session (web:
  `apps/gurudevi-web/lib/supabase/browser.ts` already has a token resolver; mobile: the
  auth bootstrap). Stop it on sign-out. `origin` is the API base URL from config.
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
