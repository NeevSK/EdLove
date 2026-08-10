---
title: "PowerSync Phased Implementation Plan"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [powersync, implementation-plan, migration, testing, release, offline-first]
---

# PowerSync Phased Implementation Plan

This plan takes the repository from a disabled, partially wired PowerSync foundation to a measured production rollout. Every phase has a gate. A later phase must not hide an earlier correctness gap.

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
- define boot order: identity, secure key, runtime registration, database creation, provider mount, connector connection;
- define logout and account-switch behavior: drain, disconnect, clear, reset security state, then boot the next account;
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

## Phase 4 — Ship one vertical slice

**Goal:** prove the full offline lifecycle with a narrow classroom workflow.

Recommended slice: classroom roster plus attendance.

Work:

- finalize the client schema and indexes;
- use one explicit classroom/teacher stream and one policy/identity stream;
- migrate reads to current reactive hooks;
- route writes through the secure Drizzle boundary;
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

- replace process-local idempotency with a durable server ledger;
- include account/principal, operation IDs, batch identity, result, and retention metadata in the ledger;
- remove the deterministic encryption-key fallback and define a recoverable secure-storage failure state;
- add metrics for queue depth, upload/download errors, last successful sync, replication lag, and rejected operations;
- exercise token expiry, policy-version changes, logout during upload, and network transitions;
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

## Phase 7 — Add web parity selectively

**Goal:** make selected browser workflows genuinely offline-capable.

Work:

- verify OPFS, IndexedDB fallback, workers, service-worker/build assets, and multi-tab behavior;
- define browser account isolation and logout deletion semantics;
- test Safari private mode, Firefox, Chromium, and an unsupported-browser state;
- do not claim SQLCipher-equivalent web encryption until the browser storage/security review is complete;
- keep unsupported web features on an explicit direct-API path.

Gate:

- selected web flows pass offline/reload/reconnect tests;
- private browsing and storage-quota failures are visible and recoverable;
- browser data cannot be mistaken for server-authoritative state.

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
