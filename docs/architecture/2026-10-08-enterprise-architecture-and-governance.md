---
title: "Enterprise-Grade Architecture & Verification Governance (The Gurudevi Platform)"
status: "active"
created: 2026-10-08
updated: 2026-10-08
author: "Engineering Team & Platform Architecture"
scribe: "Antigravity"
tags: [enterprise-architecture, platform-readiness, governance, verification-engineering, invariants, adr-alignment]
---

# Enterprise-Grade Architecture & Verification Governance

## 1. Grounding in the Canonical Truth (The Platform Spine)

In an enterprise-grade platform (grounded in [`docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md`](file:///c:/x/docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md) and [`workflows/code-execution.md`](file:///c:/x/.agents/workflows/code-execution.md)), quality is **not a qualitative opinion or a loose line-of-code metric**.

Quality is defined by **12 Mandatory Shared Contracts & Boundary Invariants**:

```mermaid
graph TD
  subgraph The Shared Platform Spine
    P0["Level 0: The Agent Harness & Sandbox<br/>(Tool Schemas, Execution Gates, Invariant Interceptors)"]
    P1["Level 1: Core Architectural Spine<br/>(Identity, Authz Context, Offline-First Storage Ports, Error Normalizers)"]
    P2["Level 2: Cross-Domain Boundary Gates<br/>(.dependency-cruiser L0-L4, No Direct Supabase Leaks, Event Bus ADR-004)"]
    P3["Level 3: Mathematical Verification Surface<br/>(224/224 ORPC API Contracts, G0-G3 Evidence Tiers, Strict TS Soundness)"]
    P4["Level 4: System Stewardship & Vibe Maintenance<br/>(Retiring Documented Leaks, Zero Dead Exports, 2GB RAM Mobile Budget)"]

    P0 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P0
  end
```

---

## 2. The 5 Enterprise Architectural Invariants

### Invariant 1: The Portability & Offline-First Storage Seam
* **Canonical Directive:** No domain, UI screen, or hook may directly import or execute a Supabase client (`supabase.from(...)`) or Drizzle driver.
* **Architecture:** All data persistence must traverse **Core Storage Ports** and PowerSync adapters.
* **Audit Oracle:** `node scripts/check-monorepo-boundaries.mjs`
* **Current State:** 
  - 🟢 1,242 files comply.
  - 🔴 **2 Leaks Identified:**
    1. [`packages/library/src/hooks/useLibrary.ts`](file:///c:/x/packages/library/src/hooks/useLibrary.ts)
    2. [`packages/library/src/screens/CollectionDetailScreen.web.tsx`](file:///c:/x/packages/library/src/screens/CollectionDetailScreen.web.tsx)

### Invariant 2: The Multi-Layer Dependency Ceiling (L0 $\rightarrow$ L4)
* **Canonical Directive:** Enforced via [`.dependency-cruiser.cjs`](file:///c:/x/.dependency-cruiser.cjs).
  - **L0 (Base):** `core`, `types-shim` cannot import upward.
  - **L1 (UI):** `ui` cannot import domain logic.
  - **L2 (Infrastructure):** `scanner-kit`, `ai`, `analytics`, `graphics` cannot import domains.
  - **L3 (Domains):** `classroom`, `people`, `self`, `admin`, `community`, `library` cannot cross-import each other directly; they must communicate via the Event Bus.
  - **L4 (Financials):** `payments`, `accounting` must only be reached through `IEntitlementPort` in core.

### Invariant 3: The API Contract Synchronization Truth
* **Canonical Directive:** Zero drift between client requests and server router definitions.
* **Audit Oracle:** `npx tsx scripts/audit-api-contracts.ts`
* **Verified Signal:** **224 active API routes across 38 contract sources** audited with **0 errors and 0 warnings** (100% mathematical parity).

### Invariant 4: The Sacred Design Retina & "Thin & Sensing" UI
* **Canonical Directive:** [`apps/gurudevi-mobile/docs/agent/gurudevi-design-retina.md`](file:///c:/x/apps/gurudevi-mobile/docs/agent/gurudevi-design-retina.md).
  - Background: `#F5EDD6` (Vellum)
  - Text: `#2A2318` (Ink)
  - Primary: `#D4843A` (Saffron)
  - Secondary: `#8BBF7A` (Dalu Green)
  - Shadow: `rgba(107, 100, 128, x)` (Shadow Violet — NO GREY/BLACK)
* **UI Invariant:** Components are strictly "Thin & Sensing." Business logic stays in hooks/stores; UI only consumes and renders.

### Invariant 5: The Hardware Constraint (2GB Mobile RAM Budget)
* **Canonical Directive:** Budget mobile devices must not crash from memory leaks, unmanaged console logging, or unmemoized large lists.
* **Audit Oracle:** Pre-flight bundle audits and production logging stripping.

---

## 3. Enterprise Operational Test Suite: The Automated Governance Sentinel

We have operationalized these exact architectural rules into an automated, enterprise-grade sentinel:

```bash
# 1. Verify all 224 API & Data Contracts
npx tsx scripts/audit-api-contracts.ts

# 2. Verify all Architectural Boundary Invariants & Offline Seams
node scripts/check-monorepo-boundaries.mjs

# 3. Verify Compiler Soundness & Zero Type Suppression
pnpm --filter @repo/core typecheck
```

---

## 4. Current Enterprise Health Scorecard

| Governance Pillar | Enterprise Criterion | Status | Real Production Evidence |
| :--- | :--- | :---: | :--- |
| **API Contract Parity** | 100% Synchronization of client/server schemas | 🟢 **PASS** | 224/224 active routes verified across 38 contract sources. |
| **Compiler Soundness** | Zero `@ts-ignore` suppressions in production code | 🟢 **PASS** | 0 suppressions in active application logic. |
| **Offline-First Seam** | Zero direct Supabase client calls in UI/hooks | 🔴 **FAIL** | 2 direct queries in `packages/library` bypassing PowerSync ports. |
| **Layer Isolation (L0-L4)**| No upward or cross-domain imports | 🟡 **STABLE** | Regulated by `.dependency-cruiser.cjs` and domain bridge lists. |
| **Mobile Hardware Budget** | Production logging stripped & memory constrained | 🟠 **IN PROGRESS** | Production Babel/Metro stripper pending deployment. |

---

## 5. Immediate Remediation Action: Closing the 2 Boundary Leaks

To bring the monorepo to an **uncompromised enterprise-grade state**, the immediate path is clear:
1. Refactor [`packages/library/src/hooks/useLibrary.ts`](file:///c:/x/packages/library/src/hooks/useLibrary.ts) to query through the offline-first repository port instead of direct `supabase.from()`.
2. Refactor [`packages/library/src/screens/CollectionDetailScreen.web.tsx`](file:///c:/x/packages/library/src/screens/CollectionDetailScreen.web.tsx) to consume data via custom query hooks rather than inline queries.
3. Re-run `node scripts/check-monorepo-boundaries.mjs` to achieve a **100% Clean Green Architectural Pass**.
