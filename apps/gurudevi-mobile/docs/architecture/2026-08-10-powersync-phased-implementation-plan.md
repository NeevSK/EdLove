---
title: "PowerSync Phased Implementation Plan"
status: "active"
created: 2026-08-10
updated: 2026-10-23
author: "Codex"
tags: [powersync, implementation-plan, migration, testing, release, offline-first]
---

# PowerSync Phased Implementation Plan

This plan takes the repository from a disabled, partially wired PowerSync foundation to a measured production rollout. Every phase has a gate. A later phase must not hide an earlier correctness gap.

## Integration status

PowerSync remains a selective replica, not the universal client-state or
offline solution. The cross-platform state owner and browser W0–W4 capability
rules now live in the root
[`Client State and Web Offline Capability Canon`](../../../../docs/architecture/client-state-and-web-offline-capability-canon.md).
This plan remains authoritative for PowerSync admission, account-scoped local
databases, and its mobile/browser replica rollout gates.

## Operating model: many device accounts, one active local runtime

PowerSync is a selective offline subsystem, not the application-wide data
access layer. Each supported offline account gets its own account-scoped local
database and encryption key, but only the currently active account may have a
live PowerSync database and sync connection. Switching accounts closes the
previous runtime before opening the next one. The previous account's local
cache may be retained for fast re-login, while explicit account removal or
sign-out-all can clear it.

Domains that need immediate server authority, transactional RPCs, sensitive
claims, invitations, entitlements, or large/rarely used data remain on the
direct API highway. A domain enters PowerSync only after it has an explicit
offline contract: row-scoped stream, local schema, read path, write path,
conflict semantics, account-isolation proof, and offline tests.

## Phase 0 — Freeze the contract and inventory the surface

**Goal:** establish one authoritative migration baseline.

Work:

- nominate this document as the current roadmap and the existing completeness audit as the baseline audit;
- update the PowerSync skill and stale v1 API references;
- inventory all `@powersync/*` imports, provider paths, hooks, database factories, and direct SQLite access;
- list every proposed offline domain and assign it to direct API, PowerSync, or local queue;
- preserve the repository’s sacred dependency pins and Expo guardrails.

Gate:

- a dependency/import inventory exists;
- no domain is called offline-first without a row-scope, schema, read, write, and test owner;
- the team agrees which environment and PowerSync instance are the target.

## Phase 1 — Migrate the JavaScript SDK family in isolation

**Goal:** make v2 buildable without enabling production sync.

Work:

- migrate `@powersync/react-native`, `@powersync/react`, `@powersync/web`, and the Drizzle driver as a tested unit;
- keep `drizzle-orm` on stable 0.x during this phase; the current PowerSync driver v0.8 peer range is `<1.0.0`;
- do not combine this work with Drizzle ORM v1 RC adoption;
- follow the v2 database construction and direct native SQLite dependency requirements;
- remove old logger setup and use a redacted project logger;
- replace removed hook usage with current v2 hooks;
- remove direct reliance on deprecated package paths and internal types;
- verify ESM behavior in Metro, web bundling, tests, and server tooling;
- update the web asset copy process to the final v2 package layout.

Gate:

- typecheck, unit tests, web export, and a development native build pass;
- no v1-only imports or deprecated hook calls remain outside an explicitly temporary adapter;
- the bridge is proven with the repository’s pinned Drizzle version;
- no `android/` or `ios/` hand edits are required.

## Phase 2 — Make runtime ownership canonical

**Goal:** remove duplicate or silent database paths.

Work:

- make the app provider, core runtime registry, and Drizzle accessor resolve the same active database instance;
- replace or retire the no-op `database.web.ts` proxy;
- enforce account-scoped filenames and lifecycle teardown;
- introduce a serialized single-active-account runtime controller so an async account switch cannot leave two connected databases or close the new one;
- bind every connector to its account scope so an in-flight old connector cannot fetch or upload with the newly selected account's session;
- define boot order: identity, secure key, runtime registration, database creation, provider mount, connector connection;
- define logout and account-switch behavior separately: switch closes the old runtime while preserving its account-scoped cache; account removal/sign-out-all disconnects and clears the selected caches;
- fail visibly when a real PowerSync feature is requested without a real database.

Gate:

- one account cannot read another account’s local file;
- logout leaves no active subscriptions or connector;
- account switching passes on native and web-supported paths;
- web builds do not import native-only runtime code.

## Phase 3 — Configure the service and auth contract

**Goal:** prove that the PowerSync service is real and correctly scoped.

Work:

- confirm the target Cloud or self-hosted instance, region, and environment;
- configure the actual Postgres replication connection using secrets, not placeholders;
- configure Supabase JWT/client authentication and verify claims used by streams;
- validate and deploy `sync-config.yaml` with the current CLI;
- correct the YAML schema reference and add compiler-warning checks for aliases, `SELECT *`, and row-scope mistakes;
- document development, staging, and production instance identifiers without committing secrets.

Gate:

- an authenticated device receives only its authorized rows;
- an unauthorized user receives zero rows for the protected stream;
- stream validation passes in CI;
- service logs and diagnostics show successful replication and client connections.

### 2026-08-12 Development deployment checkpoint

- PowerSync CLI `0.10.0` is installed as a workspace dev dependency and should
  be invoked through `doppler run -- powersync ...`.
- Doppler project/config: `gurudevi-mobile` / `dev`.
- The linked Development Cloud instance is `69f985158d064eb85ee933e0` in
  project `69f98513b0f9f400071f2114`; Production instance
  `69f985158d064eb85ee933e2` remains untouched.
- Doppler now provides the client endpoint and instance metadata through
  `EXPO_PUBLIC_POWERSYNC_URL`, `POWERSYNC_URL`, `POWERSYNC_INSTANCE_ID`,
  `POWERSYNC_PROJECT_ID`, and `POWERSYNC_ORG_ID`. The replication URI is
  provided as `POWERSYNC_DATABASE_URI`; secrets are not committed.
- The Supabase direct Postgres connection is healthy. The explicit
  `powersync` publication covers `bonds`, `school_memberships`, `classrooms`,
  and `classroom_students`, with `REPLICA IDENTITY FULL`.
- Development deployment completed successfully on 2026-08-12. Initial
  replication completed, replication lag was zero, and CLI configuration,
  connection, and sync-config validation all passed.
- Client lifecycle now waits for the official SDK first-sync checkpoint with a
  bounded timeout, emits typed connection/status events, and keeps local
  operation available when the network service is unavailable.
- The browser coordinator and first-sync lifecycle have focused regression
  tests. The feature flag remains off until real authenticated clients prove
  row isolation and upload behavior.
- The first deployed streams are intentionally narrow: identity rows are
  scoped by `auth.user_id()`, and classroom roster rows are scoped to the
  authenticated teacher or student. Admin/principal expansion remains a
  separately tested stream task.

Next Phase 3 gates:

- obtain a real Supabase JWT session and verify `fetchCredentials()` against
  the Development endpoint;
- prove teacher A/student B isolation with seeded records;
- verify first-sync completion and upload behavior from the app;
- add the admin/principal stream only after its query passes compiler and
  authorization tests;
- do not deploy or alter the Production instance until Development passes the
  complete vertical-slice checklist.

Implementation status after this checkpoint:

- Completed in code: v2 SDK migration, native SQLCipher/runtime ownership,
  browser OPFS runtime, account-scoped databases, serialized single-active
  lifecycle, account-bound connectors, durable upload idempotency, provider
  mounting, first-sync timeout/status bridge, and browser tab coordination.
- Still requires external evidence: physical Android/iOS runs, supported
  browser matrix, real-user JWT isolation, offline roster/attendance mutation,
  reconnect upload verification, and Production release approval.

## Phase 4 — Ship one vertical slice

**Goal:** prove the full offline lifecycle with a narrow classroom workflow.

Recommended slice: classroom roster plus attendance.

Work:

- finalize the client schema and indexes;
- use one explicit classroom/teacher stream and one policy/identity stream;
- migrate reads to current reactive hooks;
- route writes through the secure Drizzle boundary;
- keep unrelated workflows on their declared direct-API or local-queue highway;
- implement pending/synced/rejected UI states;
- test server acceptance, server rejection, retries, duplicate delivery, restart recovery, and stale data disclosure.

Gate:

- airplane-mode reads work after prior sync;
- airplane-mode writes appear immediately and survive app restart;
- reconnect uploads exactly once at the server ledger level;
- a rejected write remains explainable and does not disappear silently;
- physical Android and iOS tests pass.

## Phase 5 — Harden correctness, security, and operations

**Goal:** remove production blockers before expanding coverage.

Work:

- apply the durable server ledger migration and verify it in staging;
- include account/principal, operation IDs, batch identity, result, and retention metadata in the ledger;
- remove the deterministic encryption-key fallback and define a recoverable secure-storage failure state;
- add metrics for queue depth, upload/download errors, last successful sync, replication lag, and rejected operations;
- exercise token expiry, policy-version changes, logout during upload, and network transitions;
- test app termination during upload and retry the same batch through the durable idempotency ledger;
- run the PowerSync diagnostics workflow and attach sanitized evidence to support runbooks.

Gate:

- multi-instance API deployment cannot double-apply a batch;
- expired or mismatched policy tokens fail closed;
- no secrets or user payloads leak into logs;
- recovery behavior is documented and tested.

## Phase 6 — Expand by domain, not by table count

**Goal:** migrate only domains that benefit from offline behavior.

For each domain, repeat the vertical-slice checklist:

- row-scope proof;
- schema and stream;
- reactive read hook;
- secure local write;
- upload contract;
- conflict/rejection semantics;
- account isolation;
- offline/reconnect tests;
- UI state coverage.

Keep identity, onboarding, invites, entitlements, notifications requiring immediate authority, and sensitive RPC workflows on the direct API highway unless a separate offline command contract is approved.

The migration is additive: a screen may combine PowerSync-backed reads for an
approved offline domain with direct API calls for authority-sensitive actions.
It must label those states explicitly instead of presenting all local data as
server-authoritative.

## Phase 7 — Add web parity selectively

**Goal:** make selected browser workflows genuinely offline-capable.

Work:

- verify OPFS, IndexedDB fallback, workers, service-worker/build assets, and multi-tab behavior;
- coordinate account switches across browser tabs with the implemented account broadcast protocol; one tab must not keep uploading after another tab changes the shared auth session to account B;
- define browser account isolation and logout deletion semantics;
- test Safari private mode, Firefox, Chromium, and an unsupported-browser state;
- do not claim SQLCipher-equivalent web encryption until the browser storage/security review is complete;
- keep unsupported web features on an explicit direct-API path.

Gate:

- selected web flows pass offline/reload/reconnect tests;
- private browsing and storage-quota failures are visible and recoverable;
- browser data cannot be mistaken for server-authoritative state.

## Edge-case release matrix

| Event | Required behavior |
|---|---|
| Account switch during upload | Old connector is account-bound; old database closes before the new one connects; queued data remains in the old account file. |
| Offline account switch | Open the cached account database locally; if cached authentication cannot be restored, roll back the switch without clearing either cache. |
| App termination during upload | The batch may be retried; server-side durable idempotency must make the retry safe before production. |
| Intermittent network | Local reads/writes continue; sync reports status and retries; no UI silently replaces local data with empty mock data. |
| Browser tab switch | Coordinate the active account across tabs/workers and isolate account-specific database filenames. |
| Account removal | Explicitly disconnect and clear only the removed account's local database; normal switching never clears it. |
| Validation/conflict response | Do not permanently block the queue with a retryable HTTP error; record a user-visible rejection/conflict according to the backend contract. |

## Phase 8 — Optional attachments and advanced capabilities

**Goal:** add higher-value capabilities only after core sync is stable.

Candidates:

- built-in attachment queue for classroom evidence, documents, and profile media;
- Terraform-managed PowerSync environments;
- on-demand stream subscriptions with bounded TTLs;
- iOS widget/share-extension experiments;
- local-first search or AI assistance over explicitly authorized, minimized local data.

Each candidate needs a separate design review because the official maturity differs: attachments and several SDK integrations are alpha/beta, while Sync Streams and core JS/RN SDKs are GA.

## Release checklist

Before enabling the feature flag:

- v2 migration passes build, typecheck, tests, and platform smoke tests;
- service replication and auth are configured against the confirmed instance;
- one vertical slice passes offline/reconnect/account-switch tests;
- durable idempotency is deployed;
- secure key failures fail closed;
- observability and rollback steps are documented;
- rollout starts with an internal cohort and a kill switch.

## Rollback rule

If any phase gate fails, keep `isPowerSyncEnabled` off for the affected cohort and route the feature to its declared fallback highway. Do not silently fall back from an offline-capable PowerSync screen to empty mock data.
