---
title: "Auth scope and permission async ownership"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, authorization, scope, verification]
---

# Feature spec

Blast zone AMBER; Maintain mode. Targets: existing shared
`packages/core/src/store/scopeSessionCoordinator.ts`, `useCedarDecisionStore.ts`
and their existing tests. Reuse scope snapshots, Zustand 5.0.16 synchronous store
writes, clear/transition operations, permission queries and signature verification.
No new store, persistence format, library, route or authentication provider.
Complexity below 15 for new functions; measure existing loader separately.

A pending permission query or signature check must not restore decisions after
clear/logout or supersede a newer load. Each load/clear invalidates older work;
check ownership after every await and before handling an asynchronous error.
New loads immediately withdraw previously loaded grants while reconciliation is
pending. This intentionally replaces stale-allow-during-reload behavior under the
user's authorized fail-loud auth cutover. Existing current-load error and signature,
scope, policy and expiry denials remain. Explicitly validate snapshot principal
and finite future expiry instead of relying solely on the query filter.

Scope transitions retain current-owner rollback. A superseded transition must
reject without emitting completion or restoring its old mirrors. Track both a
transition generation and snapshot identity: rollback of B to A's former snapshot
must not revive A's earlier pending operation. Clear invalidates transitions.
Keep synchronous failure rollback before commit and all existing mirror writes.

Required evidence: delayed permission query/policy/signature success and failure,
clear, competing loads, old grants during reload, wrong principal and invalid
expiry; competing scope transitions, logout during capability load, newer failure
restoring a previous snapshot, and retained current-transition rollback. These are
G1/G2 substituted boundaries, not native SQLite, real issuer or physical-device
acceptance. Auth lifecycle and AuthManager callbacks remain the subsequent seam.

Extend the same impact set to `packages/core/src/hooks/useAuthLifecycle.ts` and
its existing bootstrap boundary tests. A superseded scope rejection must not be
caught by the older lifecycle invocation and clear the newer identity. Invalidate
pending profile work on subject/mode changes and unmount; check resolution
ownership after scope commit, remembered-account verification and device capture.
Guard late initial-session errors and refresh lookups against newer auth events.
Keep same-subject token refresh and verified offline fallback behavior. AuthManager
logout callbacks and capture's internal durable writes remain separate seams.

## Implementation and verification

The decision store now versions every load and clear. It checks ownership after
snapshot, policy and signature awaits, ignores stale failures, and withdraws old
grants synchronously during reload. Wrong-principal snapshots and non-finite or
non-future expiry deny. Signature, scope, policy and current-load failure behavior
remain covered. The coordinator versions transitions and checks the committed
snapshot before completion/rollback. Only the current transition may restore its
previous mirrors; superseded operations reject without publishing completion.

Lifecycle resolution now checks its generation after scope commit, device capture
and remembered-account verification. Subject/mode changes and effect cleanup
invalidate outstanding resolutions. Bootstrap errors/finalization and refresh
session lookups check newer auth events. The two existing offline restoration
branches share one guarded restoration path; matching verified offline identity
and same-subject token-refresh behavior retain existing regression cases.

- G1/G2 boundary and stateful scenario / Vitest 5.0.5: 56/56 registered cases in
  six selected files succeeded, including 22 new cases. Storage/query, signature,
  auth/provider and React-hook boundaries are substituted where configured. The
  three delayed Cedar stages each exercise success and rejection internally.
  Proves the named generation, invalidation, denial, rollback and late-callback
  contracts under those substitutions. Does not prove a mounted React tree,
  real SQLite, cryptographic signing, provider logout or physical devices.
- G0 static: forced core declaration build and scoped Biome checks succeed.
  A report-only Biome config explicitly sets cognitive complexity to 15 for all
  three changed production files; it succeeds. Scoped jscpd finds zero clones.
  Workspace typechecking retains seven community errors outside changed files.
  ESLint cannot initialize SonarJS 4.2.2 S1154 (`reading 'Void'`), so it provides
  no lint acceptance. Logs are `reports/auth-scope-ownership-*.log`.
- Broad anti-slop exits 1 with 48 native findings; CNG succeeds. Test-evidence
  and version-drift command audits succeed. Device-evidence audit succeeds against its baseline
  fixture, providing no new G5 evidence for this change.

Source grounding: installed Zustand 5.0.16 `vanilla.js` writes/notifies
synchronously; its [versioned upstream release](https://github.com/pmndrs/zustand/releases/tag/v5.0.16)
was checked. No library or package version changed. The unified diff was reviewed,
including existing uncommitted scope integration, and no test was removed or
weakened. No hosted data or infrastructure changed.

Remaining work: AuthManager logout cleanup targeting, device capture's internal
durable-write ownership, authorization snapshot lifetime after initial loading,
real authenticated web/native journeys, SDK offline/cache replay, physical-device
evidence and the broader programme gates. This checkpoint does not establish
complete production readiness.
