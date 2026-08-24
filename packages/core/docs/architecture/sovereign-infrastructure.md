---
title: "Sovereign Infrastructure: The Decoupling Map ðŸ—ºï¸"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# Sovereign Infrastructure: The Decoupling Map 🗺️

To achieve 100% Platform Sovereignty, we must ensure that no external vendor (Supabase, Cloudinary, Inngest) is visible to our **Domain Logic**. This is achieved by enforcing the **Hexagonal Port/Adapter** pattern across all infrastructure boundaries.

## 1. Status of Current Ports

| Boundary | Port | Current Primary Adapter | Status |
| :--- | :--- | :--- | :--- |
| **API** | `SovereignRoute` | Hono Adapter | ✅ Sovereign |
| **Identity** | `IIdentityPort` | Supabase Identity Adapter | 🟡 Partial Leak (Types) |
| **Persistence**| `DomainRepositories` | Supabase / ZenStack | 🔴 High Leak (Mixed Providers) |
| **Storage** | `IFileStoragePort` | Cloudinary / Supabase | ✅ Sovereign |
| **Events** | `IEventBusPort` | Inngest | ✅ Sovereign |

## 2. Immediate Targets for 2026

### A. The Storage Port (`IFileStoragePort`)
We must stop calling `uploadToCloudinary` or `supabase.storage` directly.
**The Port**:
```typescript
interface IFileStoragePort {
  upload(file: Blob | File, path: string): Promise<string>;
  getPublicUrl(path: string): string;
  delete(path: string): Promise<void>;
}
```

### B. The Event Port (`IEventBusPort`)
All domain events (e.g., `ClassroomCreated`) should be sent via a Port, not via `inngest.send`.
**The Port**:
```typescript
interface IEventBusPort {
  publish(event: string, payload: any): Promise<void>;
  subscribe(event: string, handler: (payload: any) => void): void;
}
```

### C. Persistence Unification
We must move toward a **Single-Source-of-Truth for Data Access**.
*   **Target**: Move all `supabase.from('table')` calls inside Repository Adapters.
*   **Goal**: The Domain Services should *never* know if the data comes from a REST call, a SQL query, or a local cache.

## 3. Bus-Factor Risk Mitigation

| Dependency | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- |
| **Supabase** | Medium | Maintain the `IIdentityPort` and expand `IFileStoragePort`. |
| **Cloudinary** | Low | Wrap in `IFileStoragePort`. |
| **Inngest** | Low | Wrap in `IEventBusPort`. |
| **Hono** | Low | Port/Adapter (SovereignRoute) is already in place. |

---
*Last Updated: May 2026*
