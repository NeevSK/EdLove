---
title: "Sovereign Identity: Operationalization Guide"
status: "active"
created: 2026-05-06
updated: 2026-05-06
author: "Naween"
tags: [reorganized]
---

# Sovereign Identity: Operationalization Guide

**Timestamp**: 2026-05-04  
**Focus**: Transitioning from Ghost RBAC to Bonded ReBAC  

---

## 1. The Migration Strategy: "The Big Break"

We have chosen a **Non-Compatible Migration**. This means we are not shimming old roles; we are deleting them to force immediate refactoring.

### Phase 1: The Core Purge (COMPLETED)
- [x] Defined `Bond` and `Perspective` types.
- [x] Created `IIdentityPort` and `IdentityManager`.
- [x] Refactored `AuthSlice` to remove `userRole` and `authority`.
- [x] Refactored `usePermissions` and `composer` to use `activeBond`.
- [x] Validated monorepo integrity via `tsc --noEmit`.

### Phase 2: Fixing the "Loud Falls" (COMPLETED)
We have successfully resolved all remaining `TS2339` and `TS2345` errors related to legacy roles. The codebase is now strictly ReBAC-aware.

---

## 2. Developer Guidelines

For detailed implementation patterns and downstream consumer guidance, refer to the **[Sovereign ReBAC Developer Guide](./SOVEREIGN_REBAC_DEVELOPER_GUIDE.md)**.

---

## 3. Handling Onboarding (Role Persistence)

Since onboarding is the creation of the first Bond, we must ensure the "Initial Orientation" is saved as a relationship.

**Operational Flow:**
1.  User selects "Principal" in the UI.
2.  Onboarding Screen calls `identity.createInitialBond('principal', { school_id: '...' })`.
3.  The Adapter creates the record in the relevant table (e.g., `SchoolStaff` or `Principal` record).
4.  The system invalidates the Identity Cache.
5.  `useAuthLifecycle` fetches the new Bonds and sets the `activePerspective`.

---

## 3. Global Platform Roles (Admin/Founder)

For platform-wide roles (Admin, Founder), we use a special **Platform Bond**.
- **EntityId**: `GLOBAL`
- **EntityType**: `PLATFORM`
- **Capacity**: `admin` | `founder`

These bonds should be checked in the `IdentityAdapter` by querying a `platform_admins` table or checking a specific JWT claim if using a centralized provider.

---

## 4. Testing the Fabric

Every authorization bug is now a **Relationship Bug**.

- **Test Pattern**: "User X should be able to read Lesson Y *because* they have a Teacher Bond with Classroom Z."
- **Tools**: Use `IdentityMockAdapter` to inject specific Bonds for integration tests without needing a real Supabase instance.

---

## 5. Security Non-Negotiables

1.  **No Fallbacks**: Never return `true` from `can()` if the `activeBond` is missing, unless it's a public subject.
2.  **Explicit Context**: Always pass the `contextId` to `hasCapacity()` when checking specific entity permissions.
3.  **Purge Audit**: Search the codebase for strings like `.role`, `.authority`, and `platform_roles`. If you find them outside of the Adapter, **KILL THEM.**
