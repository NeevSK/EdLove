---
title: "oRPC v2 Beta Architectural Evaluation & Dual-Wire Migration Spike"
status: "active"
created: 2026-10-17
author: "Naveen"
scribe: "Antigravity"
tags: [orpc, architecture, migration, dual-wire, contracts]
---

# oRPC v2 Beta Architectural Evaluation & Dual-Wire Migration Spike

## 1. Executive Summary

We conducted an empirical investigation and pilot migration spike for upgrading `@orpc/*` from `1.15.7` to `2.0.0-beta.x` across the Polymath Platform monorepo (`packages/core`, `apps/sanctuary-api`, `apps/gurudevi-web`, `apps/gurudevi-mobile`).

While oRPC v2 introduces cleaner routing abstraction, native Zod v4 support, and modern async iterators, **a naive global upgrade breaks active mobile clients, eliminates `error.status` error boundary handling, and breaks runtime procedure metadata introspection.**

To protect active users and preserve the **Deletion Veto**, we established the **Dual-Wire Architecture**:
1. Keep the stable `1.15.7` runtime on `/api/v1/rpc` for active mobile and offline-sync clients.
2. Pilot modern v2 contract patterns side-by-side using isolated contracts ([`packages/core/src/api/pilot.orpc.v2.ts`](file:///c:/x/packages/core/src/api/pilot.orpc.v2.ts)).

---

## 2. The 5 Breaking Traps of oRPC v2 Beta

Our hostile audit identified five critical runtime collisions between v1 and v2:

| # | Pitfall / Breaking Change | Impact in Polymath Monorepo | Remediation / Safe Pattern |
| :--- | :--- | :--- | :--- |
| **1** | **Wire Deserialization Incompatibility** | v1 `RPCLink` in production mobile builds cannot decode v2 server serialization payloads. | Run Dual-Wire Gateway: `/api/v1/rpc` for legacy mobile, `/api/v2/rpc` for modern web. |
| **2** | **Removal of `procedure['~orpc'].route`** | Breaks authorization metadata introspection in [`orpcMiddleware.ts:134`](file:///c:/x/apps/sanctuary-api/src/core/orpcMiddleware.ts). | Migrate procedure metadata to `defineMeta('policy', ...)` or route wrappers. |
| **3** | **Removal of `error.status` from `ORPCError`** | Breaks retry heuristics in [`orpcClient.ts:54`](file:///c:/x/packages/core/src/api/orpcClient.ts) (`status === 503` becomes `undefined`). | Check `isDefinedError(error)` and `error.code === 'SERVICE_UNAVAILABLE'`. |
| **4** | **`BatchLinkPlugin` Logic Inversion** | `.exclude` replaced by `.filter` where boolean logic is inverted (`false` = do not batch). | Audit batch predicates to prevent unintended batching of real-time mutations. |
| **5** | **Default Rejection of `GET` Requests** | `RPCHandler` in v2 rejects `GET` with `405 Method Not Allowed` unless explicitly enabled. | Must configure `allowMethods: ['GET', 'POST']` and mount CSRF protection for `GET`. |

---

## 3. Pilot Implementation & Coexistence Proof

We proved that v1 and v2 contract patterns cleanly coexist without type pollution:
- **Contract Definition**: [`packages/core/src/api/pilot.orpc.v2.ts`](file:///c:/x/packages/core/src/api/pilot.orpc.v2.ts) exports `pilotV2Contract` defining `ping` and `secureEcho`.
- **Runtime Execution**: [`executePilotProcedure`](file:///c:/x/packages/core/src/api/pilot.orpc.v2.ts#L67) demonstrates typed input parsing, latency calculation, and SHA-256 digest computation.
- **Automated Verification**: [`apps/sanctuary-api/src/__tests__/orpc-v2-pilot.test.ts`](file:///c:/x/apps/sanctuary-api/src/__tests__/orpc-v2-pilot.test.ts) passed with 100% assertions, verifying side-by-side memory coexistence with v1 `adminORPCContract`.

---

## 4. Phase-Gated Migration Roadmap

```
[ Phase 1: Dual-Wire Gateway Spike ] ➔ [ Phase 2: Web Client v2 Adoption ] ➔ [ Phase 3: Mobile v2 Sync Replay ] ➔ [ Phase 4: v1 Retirement ]
   (Side-by-side contracts)                (Next.js 16 App Router)                (PowerSync offline test)           (After full fleet rollout)
```

1. **Phase 1 (Complete)**: Cohort 1.15.7 stabilized across all 32 manifests; v2 pilot contract and test spike implemented.
2. **Phase 2**: Mount `/api/v2/rpc` on `sanctuary-api` alongside `/api/v1/rpc` when upgrading web clients.
3. **Phase 3**: Verify `gurudevi-mobile` offline mutation queue with v2 serializer in a test build before releasing OTA update.
4. **Phase 4**: Sunset `/api/v1/rpc` once mobile fleet version adoption exceeds 99%.
