---
title: "POA Client-Side Proxy Unentanglement"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [security, architecture, mobile, core]
---

# Architecture Decision Record: POA Client-Side Proxy Unentanglement

## 1. Context & Background

Previously, the Polymath platform utilized a client-side `poaProxy` to intercept raw API method calls and validate them against the user's active context and Cedar policy metadata before the request executed. This proxy had two main side effects:
1.  **Duplicate Enforcement**: It checked permissions client-side even though database writes were already protected locally, and network API calls were verified by the server.
2.  **Maintenance Overhead**: Developers had to manually define route property mapping objects and list internal methods to ignore, leading to frequent `MISSING_CONTRACT_COVERAGE` runtime crashes for minor changes.

With the migration from `ts-rest` to **Hono + Zod-OpenAPI (`SovereignContract`)**, the client-side proxy layer became fully redundant and was unentangled.

---

## 2. Decision & Architecture Shift

We have completely removed the client-side `poaProxy` and `temporalPOAProxy` wrappers. The security enforcement is now handled by a cleaner **Double-Gate Architecture**:

```
                       [ UI / Navigation Layer ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼ (Online API Calls)                      ▼ (Local Sync/Offline writes)
     [ Raw API Fetch client ]                  [ PowerSync Drizzle Client ]
              │                                         │
              ▼ (Network request)                       ▼ (SQLite write query)
     [ Hono Gateway PEP ]                      [ Secure Drizzle Proxy PEP ]
              │                                         │
              ▼ (Evaluate context)                      ▼ (Evaluate context)
     [ Authoritative Cedar PDP ]               [ Client Cedar WASM PDP ]
```

1.  **Write Enforcement (Local-First PEP)**: Intercepted directly at the database/Drizzle layer via `createSecureDrizzleProxy` (`database.ts`), validating all SQLite mutations against client-side Cedar policies.
2.  **API Enforcement (Server PEP)**: Intercepted by Hono gateway middleware (`index.ts`) checking `SovereignContract` metadata for incoming routes.
3.  **UI Gating**: Hiding/showing buttons or elements remains the responsibility of the frontend (via standard CASL or Cedar dynamic evaluation hooks).
4.  **Temporal Offline Queue**: The `createTemporalProxy` is retained to enforce time-travel constraints (Temporal Shield) and cache reads (Offline Bridge), but stripped of authorization validation.

---

## 3. Consequences

*   **Zero-Dependency APIs**: Orchestrated API exports now return raw fetch clients or simple temporal filters rather than complex Proxies, improving debugging speed.
*   **Reduced Runtime Crashes**: Eliminating `MISSING_CONTRACT_COVERAGE` exceptions during runtime API invocations.
*   **Decoupled Types**: The client API is no longer statically coupled to server authorization metadata structures at compile-time.
*   **Parity in Audits**: Contract coverage validation is moved from runtime client-side interception to compile-time check-types tasks and startup `assertContractCoverage` assertions.
