---
title: "Account switch preserves offline work"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, accounts, powersync, verification]
---

# Feature spec

Maintain mode; AMBER. Targets: core accounts/accountTransition.ts,
accounts/deviceAccounts.ts, their existing tests and a composed runtime scenario.
Reuse disconnectPowerSync, clearPowerSyncAccount, the account-specific encrypted
database factory, SingleActivePowerSyncRuntime, and the existing principal-owned
mutation queue. No dependency, database schema or hosted configuration changes.
Functions remain below cognitive complexity 15.

Invariant: preserving outgoing work closes its runtime without clearing its
account-specific database, so both PowerSync CRUD work and the application
outbox can survive switching. The incoming account opens its own file. Explicit
discard/removal keeps destructive cleanup. A request combining preserve with
clearReplicatedData must reject before any cleanup or queue mutation; silent
reinterpretation would conceal the broken caller contract.

Switch callers request preservation without clearing. Runtime close failures
must reject before session replacement or outbox mutation. Failed incoming
session installation restores the previous active account while retaining both
account databases and the quarantined outgoing commands. Retrying as the same
principal retains existing no-op semantics.

Evidence must cover close without clear, explicit discard with clear, invalid
policy denial, close failure and retry, incoming session failure/rollback, and
composed A-to-B-to-A runtime ownership and queue isolation. State precisely when
database handles, storage or network are substituted; a simulated database does
not establish native SQLite durability or G5 acceptance.

## Grounding and implementation

OPSQLiteAdapter already selects gurudevi-powersync-${accountId}.db and an
account-scoped SecureStore encryption key. SingleActivePowerSyncRuntime closes
the outgoing handle before opening a replacement. Registry release captures the
handle, preventing a delayed cleanup from forgetting its replacement. These
existing mechanisms are reused.

Installed @powersync/common 2.3.1 declares close/disconnectAndClear; installed
@powersync/shared-internals 1.3.1 BasePowerSyncDatabase.disconnectAndClear calls
powersync_clear inside a write transaction after disconnect. The documented
clearLocal option concerns local-only tables; it is not an offline CRUD
preservation promise. See the [SDK API reference](https://powersync-ja.github.io/powersync-js/common/interfaces/CommonPowerSyncDatabase)
and [dated JS release notes](https://releases.powersync.com/announcements/powersync-js-web-client-sdk).
Newer soft-clear release behavior was not assumed for the installed API or used
as a substitute for account-specific files. No dependencies changed.

The transition now calls disconnectPowerSync for preservation and rejects
preserve-plus-clear requests before touching runtime/outbox. Device switching
passes clearReplicatedData false. Explicit discard with clearing still invokes
the destructive path. Earlier tests expecting destructive clearing during
preservation now assert close without clear; their ownership and untouched
legacy-command assertions remain intact. No route, test or supported account
action was removed.

## Verification and limits

- G1/G2 / Vitest 5.0.5: 39/39 cases across five focused files succeed. Two new
  composed scenarios exercise actual transition, registry and single-active
  runtime with substituted account files, schema, secure proxy and persistence.
  They cover A-to-B-to-A retention, denial of the released handle, explicit
  discard, failed close and retry. Boundary cases cover contradictory policy,
  outgoing outbox ownership and incoming session failure/rollback. Log:
  reports/auth-account-switch-preservation-tests.log.
- G1/G2 / Vitest: the expanded 13-file account/runtime/connection/outbox/auth
  lifecycle selection completes 128/128 cases. External storage/network/native
  bridges are substituted; existing SDK factory scenarios use actual auth-js
  with simulated HTTP and memory storage. This proves the named configured
  contracts, not real server revocation or native durability. Log:
  reports/auth-account-switch-preservation-regression.log.
- G0 / TypeScript: forced core production declaration build exits 0; its
  tsconfig excludes test files. Scoped Biome checks five files with maximum
  cognitive complexity 15; source duplication check finds zero clones.
  Raw unified diff and removals reviewed; scoped diff whitespace check exits 0.
- Workspace typecheck retains seven community errors. ESLint/SonarJS still
  fails initialization reading Void. Broad anti-slop passes CNG then reports
  48 native findings and stops; later combined steps do not execute.
  Test-evidence and version-drift audits exit 0. Device audit uses its baseline fixture, providing
  no new G5 evidence. rn-terrain gate returns QUARANTINE_HOLD because its index
  does not recognize installed @powersync/common 2.3.1; CLI exit 0 is not policy
  acceptance. No gate was weakened.

Real SQLite/PowerSync CRUD reopen and replay, encryption/key persistence,
process-death recovery and physical-device switching remain required acceptance.
Device account capture/switch/removal still need concurrency ownership review:
provider-operation serialization alone does not serialize their whole local
transactions. Inactive remembered-account removal also does not yet open and
erase its closed database file; this change does not claim that cleanup is
complete. No external service state changed, and the full identity goal remains
active.
