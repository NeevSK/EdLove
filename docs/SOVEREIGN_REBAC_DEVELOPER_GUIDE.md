# Sovereign ReBAC: Developer Guide & Monorepo Standards

**Status**: Canonical  
**Version**: 1.0 (2026-05-04)  
**Context**: Replaces all legacy RBAC (`roles`, `authority`) with Relationship-Based Access Control (ReBAC).

---

## 1. Core Concepts

### The Bond
A **Bond** is the atom of identity. It represents a relationship between a **User** and an **Entity**.
- **User**: The internal UUID.
- **Entity**: A School, Classroom, Community, or 'GLOBAL'.
- **Capacity**: The functional role (e.g., `teacher`, `student`, `admin`) within that specific context.

### The Perspective
A user can have multiple Bonds. The **Perspective** is the lens through which they are currently interacting.
- **Active Bond**: The Bond currently used for capability resolution.
- **Available Bonds**: The list of all relationships the user can "switch" into.

---

## 2. Implementation Patterns

### 2.1. Logic & Permissions (Core)
Always use the `usePermissions()` hook. **NEVER** check `user.role` or `user.authority`.

```typescript
// ✅ CORRECT: Capability-based check
const { can } = usePermissions();
if (can('manage', 'Classroom')) { ... }

// ✅ CORRECT: Contextual check
const { activeBond } = usePermissions();
if (activeBond?.capacity === 'principal') { ... }

// ❌ FORBIDDEN: Legacy role check
if (user.role === 'admin') { ... } // This field no longer exists!
```

### 2.2. Identity Switching
To switch workspaces (e.g., from one school to another), use `identityAPI.switchPerspective`.

```typescript
import { identityAPI } from '@repo/core';

const handleSwitch = async (schoolId: string) => {
  await identityAPI.switchPerspective(schoolId, 'teacher');
  // The store and usePermissions will update automatically via AuthorityLifecycleProvider
};
```

---

## 3. Downstream Consumers (Apps & UI)

### 3.1. Bootstrapping (@repo/ui & Apps)
Every application must be wrapped in the `AuthorityLifecycleProvider` (from `@repo/core`) to ensure the identity fabric is initialized and reactive.

```tsx
// apps/gurudevi-web/App.tsx
import { AuthorityLifecycleProvider } from '@repo/core';

export const App = () => (
  <AuthProvider>
    <AuthorityLifecycleProvider>
      <MainNavigator />
    </AuthorityLifecycleProvider>
  </AuthProvider>
);
```

### 3.2. Platform Shims
In `@repo/ui`, use `PerspectiveGuard` (available in `@repo/core/logic/permissions/guards`) to conditionally render navigation or screens based on the active perspective.

---

## 4. Database & RLS
The database schema now uses a `bonds` table. RLS policies should join on this table to verify access.

**Example RLS Policy:**
```sql
CREATE POLICY "Teachers can read their classroom lessons"
ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bonds
    WHERE bonds.user_id = auth.uid()
    AND bonds.entity_id = lessons.classroom_id
    AND bonds.capacity = 'teacher'
  )
);
```

---

## 5. Maintenance & Compliance
1.  **Strict Typing**: Always use the `Capacity` enum from `@repo/core/types/Identity`.
2.  **Linting**: A custom lint rule (future) will flag any usage of `.role` or `.authority` on user objects.
3.  **Auditing**: Use `pnpm --filter @repo/core exec tsc --noEmit` to verify that no legacy compatibility paths have leaked back into the core logic.
