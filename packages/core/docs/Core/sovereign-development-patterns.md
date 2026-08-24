---
title: "Sovereign Development Patterns (2026 Edition) ðŸ›ï¸"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# Sovereign Development Patterns (2026 Edition) 🏛️

This document outlines the architectural standards and patterns for the Polymath Platform, ensuring high-resilience, hexagonal isolation, and agentic interoperability.

## 1. The Sentinel Pattern: Restricted Persistence 🛡️

To prevent framework leakage and environment-specific coupling, direct access to the `supabase` client is **FORBIDDEN** across all domain logic.

### 🏛️ The Architecture
1.  **Gatekeeper**: `packages/core/src/api/supabase.ts` exports the only authorized client.
2.  **Sentinel**: The client is renamed to `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__` to prevent accidental auto-imports.
3.  **Boundary**: Domain logic (API/Adapters) must use the Sentinel. Components (UI) must use the defined **Ports** (Repository/Service layer).

### 🚫 Anti-Pattern: Direct Leakage
```typescript
// ❌ CRITICAL REGRESSION
import { supabase } from '../api/supabase'; 

const getData = () => supabase.from('data').select('*');
```

### ✅ Sovereign Pattern: Restricted Sentinel
```typescript
// ✅ ARCHITECTURALLY COMPLIANT
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as db } from '../api/supabase';

const getData = () => db.from('data').select('*');
```

---

## 2. Hono: The Sovereign API Standard 🏛️

Hono serves as our universal routing engine, providing runtime-agnostic execution and native Agentic Sight (MCP).

### A. Capability-Based Routing
Authorization is enforced via **Capabilities**, not just Roles. This maps directly to the ReBAC (Relationship-Based Access Control) defined in `schema.zmodel`.

```typescript
// Define the Port (Contract)
export const vaultContract = createContract({
  openVault: {
    method: 'post',
    path: '/vault/open',
    metadata: { 
      authority: { 
        action: 'execute', 
        subject: 'Vault',
        capability: 'TREASURY_ACCESS' // Required Capability
      } 
    },
    responses: { 200: z.object({ unlocked: z.boolean() }) }
  }
});
```

### B. The Law Layer (ZenStack)
The Hono handler never queries the database directly. It uses the `enhanced` ZenStack client which automatically filters data based on the user's current **Citizenship** and **Bonds**.

```typescript
app.post('/vault/open', async (c) => {
  const db = c.get('db'); // ZenStack-enhanced client
  const result = await db.vault.findFirst({ where: { status: 'locked' } });
  // ...
});
```

---

## 3. The "Ghost" Resilience Pattern 👻

To ensure the platform survives if any single dependency "hits a bus":

1.  **Port Isolation**: Define all I/O via TypeScript Interfaces (`Ports`).
2.  **Adapter Injection**: Concrete implementations (`Adapters`) are injected at runtime.
3.  **Standardized Envelopes**: Use `RFC 9457` (Problem Details) for all errors to ensure AI agents and humans share a common diagnostic language.

---

## 4. Coding Anti-Patterns (The Forbidden Path 🚫)

| Anti-Pattern | Why it fails | Sovereign Solution |
| :--- | :--- | :--- |
| **`any` / `as unknown`** | Breaks the Shared Brain. | Strict Zod schemas. |
| **Hardcoded Envs** | Prevents multi-region "Sovereign" scaling. | Centralized `Config` module. |
| **Bypassing ZenStack** | Leaks private data; bypasses the "Law". | Always use `c.get('db')`. |
| **Generic Paths** | AI Agents lose "Sight" of the intent. | Semantic, action-oriented paths. |
| **Direct FS Access** | Breaks "Edge" portability. | Use `IFileStoragePort` (Cloudinary/S3). |

---

## 5. Development Workflow

1.  **Define the Law**: Update `schema.zmodel` (Permissions/Policies).
2.  **Declare the Treaty**: Create a `.contract.ts` (OpenAPI definitions).
3.  **Build the Bridge**: Implement the Hono handler using the Sentinel-guarded client.
4.  **Verify Sight**: Check the MCP tool registry to ensure AI agents can "see" the new capability.
