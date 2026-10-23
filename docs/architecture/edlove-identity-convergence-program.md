---
title: "EdLove Identity Convergence Program"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, edlove, identity, authentication, migration, program]
---

# EdLove Identity Convergence Program

## Purpose

Converge Gurudevi's current provider-coupled authentication paths into an
EdLove-owned identity fabric without interrupting users, deleting legacy
behavior, or confusing credentials with accounts and authorization.

The destination is one durable EdLove account identity, many explicitly linked
credentials, separate session/lifecycle/scope decisions, and controlled
identity-bearing actors for AI, channels, and devices.

## Program invariants

- `public.users.id` is the durable account/citizen; provider subjects remain
  opaque credential vectors in server-owned bindings.
- The EdLove UUIDv8 profile governs new durable cross-product identity entities;
  existing primary keys remain in place until an approved additive migration.
- Supabase remains the sole enabled human credential issuer during convergence.
- A valid session never grants lifecycle completion, a selected scope, or
  authorization.
- Provider linking is explicit, recently authenticated, auditable, and never
  based on email/phone similarity alone.
- Human sessions, AI workload credentials, channel contacts, and device
  identities are distinct principals.
- A phase may add a compatibility path; it may not delete a working path without
  characterization, rollout evidence, rollback, and explicit approval.

## Phase map

| Phase | Outcome | Primary boundary | Exit gate |
|---|---|---|---|
| 0. Governance and inventory | An accepted issuer matrix, account/lifecycle vocabulary, identifier registry owner, and migration ledger. | Architecture and operations | No active document claims a contradictory UUID/auth authority. |
| 1. EdLove UUIDv8 foundation | A conformant, tested identifier profile and authoritative minting design. | Core types, database boundary | Shared SQL/TypeScript vectors; no existing ID or production path changed. |
| 2. Identity Authority | A server authority maps verified provider subjects to EdLove accounts and lifecycle projections. | `sanctuary-api` and `auth_identities` | Forged/cross-account subjects, missing bindings, lifecycle denial, and provider mismatch all have negative tests. |
| 3. Credential and account stewardship | Explicit link/unlink, recovery, session/device management, and audit receipts. | Provider adapter + server lifecycle API | A user can safely add/remove factors without account takeover or loss of recovery. |
| 4. Web and mobile convergence | Both clients use the shared session/lifecycle coordinator. | `@repo/core`, Next.js, Expo | Browser refresh/cross-tab and native wake/deep-link/account-switch journeys are proven. |
| 5. Delegated and external principals | AI, channels, and devices use dedicated, scoped credentials and explicit claim/link flows. | API delegation and webhook boundaries | No non-human actor can impersonate a human session or auto-create/merge an account. |
| 6. Production hardening and retirement | Measured rollout, operational controls, and approved retirement of superseded paths. | Release, security, observability | G0–G5/R1 evidence, provider outage and key-rotation drill, rollback, and approval are recorded. |

## Dependency order

```text
Phase 0 ──> Phase 1 ──> Phase 2 ──> Phase 3
                              │            │
                              └──> Phase 4 ─┴──> Phase 5 ──> Phase 6
```

Phase 1 does not migrate accounts. Phase 2 must preserve existing Supabase
bindings. Phase 4 cannot remove client fallbacks until Phase 2 has an available,
observed replacement. Passkeys belong in Phase 3/4 only after their provider,
origin, recovery, and device evidence gates are met.

## Program-level evidence

| Evidence | Required proof |
|---|---|
| G0 | Registry conformance, type and SQL contract checks, no forbidden direct authority paths. |
| G1 | Issuer adapter, binding resolver, linking collision, callback, error, and audit boundary tests. |
| G2 | Interrupted onboarding, guest conversion, credential link/recovery, account switch, and session-loss scenarios. |
| G3/G4 | Mounted web/mobile flows, SSR cookie refresh, cross-tab changes, deep links, and bundling. |
| G5 | Physical-device OAuth/magic-link/passkey where enabled, app wake, secure-storage, and device revocation. |
| R1 | Production rate/abuse signals, audit receipts, key rotation, provider outage, rollback, and privacy review. |

## Authority and planning records

- [Authentication and Sovereign Identity Authority](authentication-and-sovereign-identity.md)
- [EdLove Sovereign UUIDv8 Specification](edlove-sovereign-uuidv8-specification.md)
- [Step 1 UUIDv8 foundation plan](../current_progress/2026-10-23-edlove-uuidv8-foundation-implementation-plan.md)
- [Next-phase account UUIDv8 persistence plan](../current_progress/2026-10-23-edlove-account-id-persistence-phase-plan.md)

The program sets order and gates. Each phase needs its own bounded implementation
plan before code begins.
