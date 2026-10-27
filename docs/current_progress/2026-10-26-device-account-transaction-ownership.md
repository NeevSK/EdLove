---
title: "Device account transaction ownership"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, accounts, concurrency, verification]
---

# Feature spec

Maintain mode; AMBER. Target core accounts/deviceAccounts.ts and its tests.
Reuse authAPI session access, Sanctuary identity bootstrap, accountTransition,
existing encrypted remembered-session storage and scoped-store lifecycle. No
new auth endpoint, dependency, vendor import, database schema or native file.
Functions remain within cognitive complexity 15.

Serialize public device-account transactions, including initialization and reads,
so capture/switch/removal cannot interleave their local registry, session and
scope commits. Internal fallback switch/removal calls use the unqueued operations
inside the already-owned transaction. Rejection must not poison later operations.
Provider auth callbacks must not await this queue while retaining an SDK lock;
the current SupabaseAuthAdapter invokes application callbacks without returning
their promises. Verify nested fallback and callback-shaped capture empirically.

Capture must match the current session token/subject, resolve canonical identity
through Sanctuary even if a profile was supplied, reject a mismatched supplied
account, and recheck session continuity around awaited work before activation.
Remembered token writes remain scoped to their verified account. A stale capture
must not reactivate an outgoing account or clear a newer session. Display metadata
is descriptive; it does not establish canonical identity.

Persist an active-account selection before publishing it in memory. Switch
rollback must cover scoped-store rehydration as well as provider installation.
Preserve explicit removal, remembered-account fallback, no-account sign-out,
all-account sign-out and outgoing offline-work preservation.

Required evidence: capture/capture lost-update prevention, switch/removal ordering,
late capture denial, mismatched profile denial, storage and rehydration failure,
queue recovery, nested fallback without deadlock, and SDK callback-shaped capture.
Report all substituted SDK/network/storage boundaries. This is process-local
coordination; cross-process, cross-tab and autonomous SDK events need separate
acceptance and must not be claimed from boundary tests.

## Implementation

Public initialization, reads and mutations now share one process-local promise
queue. Private operations retain their nested this.switchTo/this.removeAccount
calls, so fallback removal and current-account sign-out remain inside their
existing transaction without taking the queue twice. A rejected transaction is
returned to its caller and does not poison later requests. This is local service
coordination, not an ACID transaction across SDK, secure storage and the server.

Capture reads the current session through the existing auth facade, resolves
Sanctuary identity even with a supplied profile, rejects a mismatched profile,
and checks token/subject continuity before credential storage and activation,
including after awaited storage. An outgoing credential may already have been
stored under its verified account when a later continuity check fails; it cannot
activate that account or overwrite the incoming account's credential. The next
queued removal can clean up that owner-specific remembered entry.

Active selection is persisted before its in-memory publication. Switching now
includes selection and rehydration in its existing rollback block. Existing
PowerSync preservation, explicit removal, fallback and sign-out behavior remain.
No public action, route or test was removed. API facade signatures remain stable.

## Grounding and evidence

The actual SupabaseAuthAdapter callback invokes the application's callback
without returning its promise to auth-js. Installed auth-js 2.117.2 declares the
sync overload and deprecates the async overload for nested TOKEN_REFRESHED
refresh hazards. The new SDK case exercises the existing adapter's sync SDK
callback with an asynchronous application callback; it does not introduce the
deprecated direct SDK overload. Current [callback guidance](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
and the [lockless coordination migration](https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/migrations/lockless-coordination.md)
were cross-checked with installed source, rather than assuming older global
callback deadlock guidance applies unchanged. No package version changed.

- G1/G2 / Vitest 5.0.5: 125/125 cases across 11 files complete in the expanded
  account/runtime/outbox/auth selection. Added boundaries cover serialized
  captures, mismatched canonical profile, changed token, capture after removal,
  callback-shaped capture, switch/removal overlap, failed rehydration rollback,
  failed persistent selection, changed session during credential storage and
  failed credential storage/retry. Existing fallback removal and all-account
  sign-out assertions remain. Log: reports/auth-device-account-transactions-tests.log.
- G2 / actual Supabase JS/auth-js 2.117.2, actual SupabaseAuthAdapter and device
  account service: the new SDK scenario completes 1/1 independently and is
  included in the expanded run. It installs an incoming session while its auth
  event queues capture behind the switch, retains both canonical accounts, and
  rejects a subsequent outgoing-token capture while preserving the incoming
  SDK and remembered credentials. Uses the real auth-storage and remembered-
  session helper paths with memory adapters. HTTP, canonical identity,
  telemetry, scoped-store reset and native cleanup are substituted. The auth
  facade delegates directly to the actual adapter in this case; existing
  production factory/AuthManager SDK scenarios are tested separately in the
  same selection. Synthetic JWT signatures are not server verification proof.
  Log: reports/auth-device-account-transactions-sdk.log.
- G0 / installed TypeScript: forced core production declaration build exits 0;
  its tsconfig excludes test files. Scoped Biome/complexity checks three files
  at maximum 15. Source duplication check finds zero clones. Raw diff/removals
  reviewed, including the earlier preservation change; whitespace check exits 0.
- Wider gates remain incomplete: workspace typecheck reports seven community
  errors; ESLint/SonarJS fails initialization reading Void; broad anti-slop
  passes CNG then reports 48 native findings. Test-evidence and version-drift
  audits exit 0.
  Device evidence audit uses the baseline layout fixture and supplies no new G5
  evidence. rn-terrain returns HUMAN_TRIAGE at 90% confidence for the installed
  Supabase version; this is a review recommendation, not automatic acceptance.
  No gate was weakened and nothing was committed or merged.

## Remaining acceptance

This queue does not serialize browser tabs, OS processes or independent SDK
auto-refresh events. It is not crash-atomic registry/credential persistence.
Real encrypted native storage, process death, SQLite reopen/replay, delayed
telemetry actor attribution and inactive database-file erasure remain open.
The same-subject TOKEN_REFRESHED fast path in useAuthLifecycle still skips
profile capture: keeping the remembered refresh token current needs its own
bound credential-refresh path and real rotated-token switch/restart evidence.
No hosted configuration changed, and the full identity goal remains active.

Subsequent resolution: the remembered-token refresh path and SDK rotation/switch/
fresh-client scenario are implemented in the
[rotation record](2026-10-26-remembered-session-token-rotation.md). That closes the
missing client retention path identified above; hosted rotation policy, native
durability and OS process-death recovery remain separate acceptance requirements.
