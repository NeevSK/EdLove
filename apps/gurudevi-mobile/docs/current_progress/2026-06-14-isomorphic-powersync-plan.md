---
title: "Isomorphic PowerSync Plan"
status: "draft"
created: 2026-06-14
updated: 2026-06-14
author: "Naween"
scribe: "Antigravity"
tags: [plan, powersync, identity, device-trust, cedar, rebac, web, mobile]
---

# Isomorphic PowerSync Plan

This plan documents the shared conceptual architecture for Gurudevi Mobile and the browser build.

The goal is not to force mobile and web into the same runtime.
The goal is to keep **one mental model** and expose it through **platform-specific implementations**.

The product intent should remain the same across platforms.
Only the runtime capabilities and constraints change.

## 1. Plan Summary

We want one isomorphic architecture with:

- one shared boot sequence
- one shared identity model
- one shared Cedar / ReBAC contract
- one shared feature-flag contract
- one shared data-highway map
- platform-specific runtime adapters for mobile and web

This means:

- same capability goals
- same security intent
- same user-facing behavior where possible
- contextualized implementations when the platform limits direct parity

This keeps the system coherent without pretending the browser is native.

## 0. Current Progress

As of this update:

- the web side is still not using a full browser PowerSync runtime
- browser-safe shims now exist for PowerSync provider, permission store, and device-trust flows
- the remaining browser work is to decide whether we add the official PowerSync web SDK or keep the web data path on direct API plus browser-local state
- identity, trust, and Cedar/ReBAC are being treated as shared capability contracts, not as mobile-only concepts

This means the plan is now executable in layers instead of being blocked on a single all-or-nothing runtime decision.

## 2. Why This Plan Exists

The docs show a progression:

- identity and trust were designed first
- then offline authorization and write safety
- then data highways and sync boundaries
- then bootstrap and entrypoint standardization
- then PowerSync web/native divergence

The right interpretation is not "web replaces mobile."
The right interpretation is "web gets the same architecture, with browser-safe capabilities."

## 3. Boot and Capability Map

| Boot Stage | Shared Intent | Mobile Runtime | Web Runtime | What Changes |
|---|---|---|---|---|
| Entry / App start | Load the app safely and deterministically | Native Expo entry, polyfills, native runtime registration | Expo web entry, browser-safe bootstrap | The bootstrap factory must branch by platform |
| Identity bootstrap | Resolve current principal / account context | Auth + internal identity + persisted mobile state | Auth + browser-safe session / account state | Keep the identity contract; change the storage source |
| Device security | Establish trust / session security | SecureStore, biometrics, device trust signals | Browser-safe session trust, origin-scoped state | Same interface, different platform trust primitives |
| Cedar / ReBAC | Evaluate permissions and capability snapshots | Native/offline capable policy evaluation | Browser-safe policy loading / evaluation path | Same API, platform-specific engine wiring |
| Feature flags | Gate features early and cheaply | Local KV cache, startup gating | Browser-safe KV cache | Keep lightweight and independent of PowerSync readiness |
| Replicated data | Read/write offline-first structured tables | PowerSync + OP-SQLite | PowerSync web path or browser adapter | This is the main database seam |
| Sync events | Track syncing / queued / failed states | Native listener and queue drain | Web-compatible status source | Same status model, different transport |

## 4. Data Highway Map

| Highway | Purpose | Mobile | Web | Notes |
|---|---|---|---|---|
| Direct API | Authoritative bootstrap, identity, onboarding, session resolution | Yes | Yes | Must stay loud and deterministic |
| PowerSync | Offline-first replicated structured data | Yes | Yes, if web PowerSync is enabled | Best fit for workspace tables and cached reads |
| Local-first queue | Optimistic/deferred writes | Yes | Possibly, where browser UX benefits from queueing | Use only for safe-to-retry actions |

## 5. Where PowerSync Belongs

| Area | Use PowerSync? | Why |
|---|---|---|
| App bootstrap | No | Bootstrap should not depend on local replicated tables |
| Identity resolution | Usually no | Identity should stay authoritative and fast |
| Device trust checks | Usually no | Trust should not be blocked on replication startup |
| Cedar permission snapshots | Yes, on mobile; maybe on web if browser path is ready | Good fit for local cached authorization state |
| Classroom / workspace data | Yes | This is the core offline-first use case |
| Feature flags | No | Keep flags lightweight and early |
| Outbox / queued writes | Yes, where applicable | PowerSync supports deferred mutation workflows well |

## 6. Web Change List

If we want the browser to share the same conceptual model, the web side needs these changes:

1. Add or verify the official `@powersync/web` path.
2. Make the database factory platform-aware in one place.
3. Copy or expose the required web worker assets during build.
4. Keep identity bootstrap browser-safe and non-native.
5. Keep device trust as a degraded browser-capability model instead of blocking the app.
6. Preserve the Cedar / ReBAC interface, even if the runtime differs.
7. Keep account isolation explicit so browser data does not leak across principals.

## 7. Future Security Options

If the product needs stronger browser or cross-device security later, we can extend the same security contract with modern auth factors:

- passkeys
- TOTP
- FIDO2 / WebAuthn
- platform biometrics where the browser or OS exposes them safely

These should be treated as security-capability upgrades, not as a separate identity model.
The goal is still the same trusted-session contract, just with stronger verification options.

## 8. Proposed Implementation Seams

| Seam | What it owns | Why it is the right boundary |
|---|---|---|
| `createDatabaseFactory()` | Native vs web database backend | Single seam for PowerSync runtime divergence |
| Root bootstrap | App startup ordering | Keeps entrypoint predictable and auditable |
| Identity adapter | Principal/account resolution | Lets mobile and web share the same contract |
| Device trust adapter | Trust/session input | Mobile can be stronger, web can be browser-safe |
| Cedar adapter | Permission evaluation and snapshots | Same app API, different runtime strategy |
| Feature-flag adapter | Early feature gating | Avoids binding flags to database readiness |

## 9. Guardrails

- Do not create two separate mental models for mobile and web.
- Do not force native trust/bootstrap assumptions onto the browser.
- Do not use Zustand as the replacement for structured local data.
- Do not let PowerSync become the bootstrap dependency.
- Do not silently leak account data across browser principals.

## 10. Flexible Next Step

This plan is intentionally adaptable.
Before implementation, we should verify:

- the exact PowerSync web package/version path
- the current worker asset setup
- which identity and trust flows are already code-backed
- which parts must stay mobile-only

After verification, we can implement the seam in code without changing the architecture again.
