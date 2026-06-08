---
title: "Data Contracts & Authority Flow"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Data Contracts & Authority Flow

Gurudevi uses a contract-first approach where Zod is the single source of truth for all data shapes and authority requirements.

## 1. The Contract Hierarchy

1.  **ZModel (ZenStack)**: Defines the server-side data models and access policies.
2.  **Zod Schemas**: Generated from ZModel (or defined manually for BFF shapes). Zod defines the "membrane" between all systems.
3.  **ts-rest Contracts**: Consumes Zod schemas to define API endpoints, including mandatory POA metadata for authorization.
4.  **Client/BFF**: Both consume the same `ts-rest` contract and Zod schemas for end-to-end type safety.

## 2. Attribute-Based Identity (ABI)
The `UserContext` schema (Zod) defines the attributes used by both CASL and ZenStack to make authorization decisions.

```typescript
// Example UserContext structure
export const UserContextSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()),
  schoolId: z.string().uuid().nullable(),
  hasGlobalAccess: z.boolean(),
  // ... other attributes
});
```

## 3. Dual Schema Pattern
We maintain a distinction between:
- **UI Schemas**: Optimized for forms, validation, and user feedback.
- **ORM Schemas**: Strict schemas for database interaction, generated via `@zenstackhq/zod`.

Both are derived from the same ZModel source of truth.
