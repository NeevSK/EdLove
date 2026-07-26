---
title: "Rollout of Hexagonal Ports & Adapters for Telemetry, Gating, and Permissions"
status: "superseded"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, hexagonal, core, security, telemetry, superseded]
superseded_by: "../../../../apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md"
---

# Hexagonal Ports & Adapters Rollout (June 2026)

> Superseded note: this historical record describes the earlier feature-flag port and Supabase adapter direction. The current rollout authority is GrowthBook, with AppCatalog lifecycle metadata and local last-known-good snapshots. See [Feature Lifecycle Management](../../../../apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md).

This document records the architectural changes introduced to decouple the **Gurudevi** core logic and mobile shell from vendor-specific telemetry (PostHog), remote configurations/flags (GrowthBook), monetization entitlements (RevenueCat), and authorization engines (Cedar/CASL).

---

## 1. Context & Motivation

To guarantee **infrastructure sovereignty**, the core business rules of Gurudevi must not import or depend directly on third-party SaaS vendors. By establishing strict **Ports** (interfaces representing system boundaries) and **Adapters** (concrete implementations mapping vendor APIs to ports), we ensure:
* **Vendor Swapability:** Swapping PostHog for a custom analytics backend, or GrowthBook for an in-house Supabase Remote Config requires zero modifications to the UI components.
* **Pure Logic Testing:** Unit tests can fully mock ports without dragging in native-bound SDKs (like RevenueCat's Apple/Google receipt-validation wrappers).
* **Deterministic Offline Fallbacks:** Client devices can resolve capabilities offline by caching port payloads in MMKV and querying them synchronously.

---

## 2. Ports Matrix (`packages/core/src/logic/ports/`)

We defined the following core interfaces:

### A. Authorization Port (`authz.port.ts`)
* **Existential Question:** *"Is this user/principal permitted to execute this action on this resource?"*
* **Contract:**
  ```typescript
  export interface AuthorizationRequest {
    principalId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    context?: Record<string, any>;
  }
  export interface IAuthorizationPort {
    isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision>;
  }
  ```

### B. Feature Flag Port (`featureFlag.port.ts`)
* **Existential Question:** *"Is this specific configuration or experiment variant active for this user segment?"*
* **Contract:** Includes methods for remote evaluation, change listeners (subscriptions), and exposure tracking (analytics integration).

### C. Entitlement Port (`entitlement.port.ts`)
* **Existential Question:** *"Does this user own commercial permissions for a specific paid package/tier?"*
* **Contract:** Queries and synchronizes pricing tiers (`FREE`, `PRO`, `INSTITUTIONAL`) and active entitlements.

### D. Analytics Port (`analytics.port.ts`)
* **Existential Question:** *"How do we capture behavioral telemetry, user identification, and screen view statistics?"*
* **Contract:** Unifies Node, browser, and React Native tracking calls.

---

## 3. Adapters & Wiring (`packages/core/src/adapters/` & `/managers/`)

### Concrete Adapters Implemented
1. **`CedarAuthorizationAdapter` (`cedar/`):** Implementation of `IAuthorizationPort` that wraps the local offline Cedar WebAssembly evaluator and SQLite snapshot policy checks.
2. **Historical only — `SupabaseFeatureFlagAdapter` (`supabase/`):** This earlier implementation was removed. GrowthBook is now the only rollout backend.
3. **`PostHogAnalytics` (Web & Native):** Explicitly modified the existing PostHog engine wrappers to satisfy `IAnalyticsPort` compile checks.

### Wiring Factory
The concrete adapters are instantiated and exposed globally in the manager factories:
```typescript
// logic/managers/factory.ts
export * from './authz.factory';      // Exports 'authz' manager
export * from './featureFlag.factory'; // Exports 'featureFlags' manager
```
Client code imports them directly from `@repo/core/logic` (e.g. `import { authz, featureFlags } from '@repo/core/logic';`).

---

## 4. Key Nuances & Architecture Decisions

### 🚫 CASL Elimination
* **Decision:** We bypassed CASL integration inside the core port.
* **Rationale:** CASL is redundant because our system resolves permissions authoritatively via **Cedar policy rules** (Server/WASM) and projects a flat JSON map (`permissionsMap`) down to Zustand. The UI queries flat boolean fields synchronously, which has zero runtime cost compared to CASL rule re-evaluations.

### 📱 RevenueCat Native Isolation
* **Decision:** The concrete RevenueCat SDK is **not** imported inside `@repo/core` to prevent build issues on web/server targets.
* **Rationale:** A mock adapter is used for web/dev environments. The actual native `RevenueCatAdapter` is defined in `apps/gurudevi-mobile` and injected into the core instance at runtime.

---

## 5. Verification Command Guide

Verify all contracts, typings, and adapter logic using Vitest:
```powershell
pnpm --filter @repo/core test src/adapters/__tests__/adapters.test.ts src/logic/ports/__tests__/ports.test.ts
```
