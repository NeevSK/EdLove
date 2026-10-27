---
title: "PowerSync hosted download acceptance and revocation boundary"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, powersync, acceptance, revocation]
---

# Hosted development download acceptance

Authorized target: Cloud Development `69f985158d064eb85ee933e0`, project
`69f98513b0f9f400071f2114`, backed by Supabase `qzoawolfkuwiuyaoiybz`.
Production was not accessed or modified. Installed CLI 0.10.0 reports connected
replication, active stream version 7, completed initial replication, zero lag,
zero table errors and no query errors in the current snapshot. Raw service
metadata is in `reports/auth-owned-powersync-current-status.json`; it is a
point-in-time observation rather than durable health or SDK evidence.

The installed CLI has no client-download acceptance command. The additional
probe followed the official service
[v1.27.2 HTTP test client](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/test-client/src/client.ts),
[request types](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/packages/service-core/src/util/protocol-types.ts)
and [checkpoint protocol](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/docs/specs/sync-protocol.md).
It requested default streams, consumed NDJSON through a matching full checkpoint,
discarded operations beyond that checkpoint, and reduced PUT/REMOVE/CLEAR/MOVE
operations per active bucket. Responses and credentials stayed in memory; only
status/boolean evidence was printed. This was a bounded protocol probe, not a
replacement application sync engine or an SDK checksum implementation.

## Actual provider/database/service result

Two admin-provisioned synthetic permanent accounts signed in with real provider
passwords and real issuer tokens. Their canonical account claims differed from
their credential subjects. Each account received one tagged synthetic bond row
in hosted PostgreSQL. Each real PowerSync download checkpoint contained its own
fixture and no foreign-owned bond or other fixture. Supplying the other account
and subject in client parameters did not change that result. Deleting one exact
fixture row was reflected by its absence at a subsequent complete checkpoint.

All operations used the linked Development endpoint and `verify-full` database
TLS. Admin provisioning used an existing modern secret key obtained through
the authenticated CLI, held only in the child process environment. No key was
created, printed or written to a file. The initial key-shape lookup failed
before creating any fixture; parsing the CLI's `keys` envelope corrected it.

Fixture marker: `20261026-powersync-isolation`. Both synthetic bond rows were
removed using exact UUID, owner and marker predicates. Global session revocation
cleanup was attempted and both accounts were banned. Two tagged account records
remain for the separately governed lifecycle cleanup. This does not establish
email ownership; email confirmation was an admin fixture prerequisite.

## Verified revocation gap

After actual Supabase global logout, the same access token opened another
PowerSync stream with HTTP 200 and a complete checkpoint. Thus Sanctuary's
uncached live-session verification is not evidence of immediate PowerSync token
revocation. Stream configuration was not changed by this probe. JWT lifetime,
service expiry behavior, provider refresh denial and a documented maximum
revocation window (or a server-owned sync grant) remain required acceptance
work. Client logout/cache clearing cannot revoke a copied bearer token at the
remote service.

No roster/membership-revocation, SDK SQLite/cache teardown, offline upload,
replay, browser/device or production-canary claim follows from this bond-only
download test. Those remain explicit programme obligations.

## Follow-up feature spec: reconnect credential admission

Blast Zone: AMBER. Targets:
`packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts` and its
existing boundary test. Reuse the existing server identity resolver, typed oRPC
client and local canonical-session checks. Before returning download credentials,
require a successful live-session identity response matching the connector's
canonical account, and recheck the active owner after the await. Failure must
deny credentials without clearing local offline data or acknowledging uploads.
No direct provider fallback, retry loop or second auth endpoint. Handler budget:
below complexity 15. Required G1 cases: provider/API rejection/outage, wrong
canonical account and account switch during the server check.

This client reconnect check strengthens the supported client path. It does not
close the verified direct-service bearer-token revocation gap above.

## Reconnect implementation and evidence

`fetchCredentials()` now calls the existing typed server identity resolver with
the expected canonical account and retries disabled after its local verified
claim check. The returned identity and active account must still match before
credentials leave the connector. Server rejection/outage propagates; local
offline data and upload acknowledgments are not touched by this read path.

G1 / Vitest: 24 cases succeeded across connector, connection lifecycle and
single-active runtime selections, with provider/server/runtime substitutes.
New cases cover revoked/unavailable server admission, mismatched account and
switch during the await. G0 / Core forced declaration build, scoped Biome and
enabled complexity checks succeeded. Raw unified diff/whitespace review retained
existing upload ownership, retry and acknowledgment behavior. The broad
anti-slop gate still exits 1 on 48 native findings; no gate was weakened.

A separate hosted count query confirmed zero remaining tagged bond rows and
exactly two retained fixture accounts, both banned. The remaining account
records are intentional lifecycle-cleanup obligations, not active users.
No database migration, service-config/stream deployment, dependency or production
change was made. The direct HTTP probe is actual hosted server evidence; the
new connector branch currently has substituted boundary evidence only.
