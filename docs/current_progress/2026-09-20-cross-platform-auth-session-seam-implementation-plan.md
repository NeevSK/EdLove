---
title: "Cross-Platform Auth, Session, and Local-First Seam — Implementation Plan"
status: "active"
created: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [auth, sessions, nextjs, expo, local-first, powersync, effect]
---

# Cross-Platform Auth, Session, and Local-First Seam — Implementation Plan

## Outcome

An account may safely use Gurudevi on web and mobile, including intermittent
networks and explicit account switching, without a stale callback, cache, or
queued command acting as another account.

## Architecture decisions

| Owner | Responsibility |
| --- | --- |
| `@repo/core` | Pure callback/transition contracts, account/scope tagging, ports, typed failures, Effect retry/timeout/resource policies. |
| Mutation foundation | Principal-bound command store, idempotency, reconciliation, DLQ, and `AccountTransitionPort`. |
| Next | Server/cookie session adapter, DAL/authorized entry, client-only browser storage adapter, explicit switch UX. |
| Expo | Secure storage, native link/session adapter, remembered-account registry, native lifecycle adapter. |
| PowerSync | Optional replication adapter after the command-store port; never session authority, shell, or second queue. |

## PowerSync operating boundary

**Current deployment model:** PowerSync Cloud. No Cloud instance, source
database, service configuration, or sync configuration may be mutated until
the named development instance is confirmed for the specific command.

**Scale/self-hosting option:** preserve portability by keeping the application
behind `PowerSyncBackendConnector` and environment-provided endpoint/config;
do not introduce Cloud-dashboard assumptions into domain or lifecycle code.
Self-hosting is a later infrastructure decision requiring a dedicated service
readiness plan, source-database replication configuration, cost/operations
owner, staging migration, rollback rehearsal, and explicit approval. It is not
a fallback implemented speculatively now.

Next uses server/route-handler cookie mutation, server-side authorization close
to protected data/actions, and small browser-only client islands, consistent
with [Next authentication](https://nextjs.org/docs/app/guides/authentication),
[cookies](https://nextjs.org/docs/app/api-reference/functions/cookies), and
[server/client component](https://nextjs.org/docs/app/getting-started/server-and-client-components)
guidance.

## Delivery sequence

1. **Freeze shared transition seam.** Mutation work publishes
   `AccountTransitionPort`; commands are preserved/quarantined/discarded only
   by explicit typed outcome. No caller uses `resetScopedStores` as a global
   destructive shortcut.
2. **Harden callback attempts.** Add durable, single-use, expiry-bound
   callback attempt adapters; validate return intent; reject late/replayed
   callbacks. A switch is confirmed before a fresh attempt; a late callback is
   discarded.
3. **Integrate mobile.** Route device-account switch/sign-out through the
   transition port, then native scoped-store/runtime cleanup. Preserve local
   multi-account behavior; one active account per install.
4. **Integrate Next.** Move callback exchange/cookie mutation to a route
   handler, retain server DAL authorization, add a browser account-transition
   adapter, and support one active account per browser profile. No JS-stored
   refresh-token registry.
5. **Browser persistence tiers.** In-memory → namespaced small drafts/UI state
   → shared command-store consumer. Detect storage/quota/private-mode failure;
   offer truthful online-only fallback.
6. **Optional PowerSync.** Implement a Next-specific adapter only after step
   5. It consumes the command-store port, is feature/capability gated, has
   account-scoped OPFS storage, and stops on cross-tab/session transition.
7. **Operate and ratchet.** Add correlation, redaction, state telemetry,
   rollback flag, and real browser/device matrix before promotion.

## Efficiency policy

Server-render essential Next entry; defer sync/analytics/heavy features;
paginate and window data; bound retries with jitter/timeout/cancellation;
pause background work when hidden/constrained; set storage record/byte/expiry
budgets; lazy-load media; never block navigation on first sync. Effect is used
at I/O boundaries for typed retry, timeout, cancellation, and cleanup—not as a
replacement for React/Next state.

## Required proof

- G0: pure attempt and account-transition state machines; replay/scope/expiry.
- G1: isolated external-boundary contracts for storage failure, stale token, account mismatch, revocation, and delayed tab signal. Explicit substitutions are permitted and named.
- G2: composed scenario contracts using the real core lifecycle, principal-bound queue, and platform adapter boundary: switch A → B, late callback, sign-out, queue preservation, and explicit discard. Only unavailable external services are substituted; this is still not browser/native runtime proof.
- G3: Next and Expo React runtime handoff plus user-visible recovery states using their actual storage/session adapters. Mocks are not acceptance evidence from this level onward.
- G4: Chrome/Edge, Firefox, Safari desktop/iOS; two tabs/accounts; offline/reconnect. Real browser only.
- G5: Android/iOS cold start, background/resume, two remembered accounts, revocation. Real device/emulator only.

## Non-negotiable invariants

- Credentials never enter Zustand, localStorage, drafts, or queue records.
- Every queued/persisted command has principal, account, scope, lifecycle,
  idempotency, and expiry metadata.
- Client cache does not authorize a mutation; server revalidates on execution.
- A lower browser capability tier remains a supported product state.

## Shared-device modes

| Mode | School/shared PC | Family mobile device |
| --- | --- | --- |
| Session | Non-persistent browser session by default; one active account per browser profile. | Multiple remembered accounts allowed; one active account. |
| Switching | Complete `AccountTransitionPort`, server sign-out, then fresh sign-in. Never retain browser refresh tokens for another person. | Preserve/quarantine the outgoing account's commands, change active account, then hydrate only the incoming account's scoped state. |
| Local data | Do not persist sensitive account data/offline database by default. On logout clear app-managed cache/storage and render no cached private route. | Encrypt/account-scope local data; protect remembered accounts with PIN/biometric where available. |
| Recovery | Explicit online-only fallback and sign-in; no automatic account resumption. | Allow explicit account selection and recovery, never silent account replacement. |

Private authenticated responses require restrictive cache policy; authenticated
logout must invalidate the server session and clear app-managed browser state.
OWASP specifically warns that browser cache/storage may expose residual account
data on shared devices and recommends restrictive caching and complete logout
cleanup. [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

Browser local data is origin-scoped and can be evicted; use IndexedDB for
structured small state, OPFS only for file/database needs, and treat either as
recoverable rather than authoritative. [web.dev storage guidance](https://web.dev/articles/storage-for-the-web)
