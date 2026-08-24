---
title: "Implementation Guide: Protocol-Oriented Authority (POA)"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Implementation Guide: Protocol-Oriented Authority (POA)

> [!NOTE]
> This document is the unified source of truth for Gurudevi's Protocol-Oriented Authority (POA) architecture. It consolidates the fine-grained CASL system with the high-level Intent/Vow ecology.

## 1. The POA Vision: From "Who" to "What"

Traditional architectures ask "Who are you?" (e.g., `if role === 'teacher'`). Gurudevi's POA asks **"What is the Intent (Purpose)?"**.

- **Ecology First**: Gurudevi is an education ecology support system. ERP behavior (features) is the enabling structure.
- **Sovereign Domains**: Packages (Classroom, People, Admin) represent sovereign domains that "Vow" to fulfill "Intents" defined in `@repo/core`.
- **Reactive Authority**: Permissions are dynamic and can change mid-session. The UI must reflect these changes instantly via Supabase Realtime + CASL reactivity.

---

## 2. The POA Stack

We implement exactly this stack for authority across all platforms:

1. **ZOD (@repo/core)**
   - Single source of truth for roles and user context.
   - Types are inferred via `z.infer`. No manual duplication.
2. **CASL (@casl/ability + @casl/react)**
   - Capability-driven engine.
   - `usePermissions.ts` is the **ONLY** interface components ever touch.
3. **SUPABASE RLS**
   - Server-side tenant isolation. Every school's data is protected at the database level.
4. **SUPABASE REALTIME**
   - Pushes role/permission changes mid-session. UI reflects updates instantly via CASL recomposition.

---

## 3. Users & Citizenship Levels

Authority is determined by the intersection of identity and school attachment:

- **Guest (Wanderer)**: Unauthenticated. Limited to public exploration (Library, Community).
- **2nd Class Citizen**: Authenticated but `schoolId` is absent in context. Limited to onboarding and public ecosystem exploration.
- **1st Class Citizen**: Authenticated and "Fully Attached" to a school/classroom.

### Supported Roles

Users can hold multiple roles simultaneously (e.g., a Teacher who is also a Grade Head).

- **Platform**: `founder`, `developer`, `admin`, `guest`.
- **School**: `principal`, `teacher`, `student`, `assistantPrincipal`, `sectionHead`, `gradeHead`, `parent`, `guardian`, `librarian`, `nurse`.

---

## 4. Structure: The core/permissions Layout

All authority logic lives in `packages/core/src/permissions/`:

```text
permissions/
  schemas/
    role.schema.ts      ← Zod enumeration of all roles
    user.schema.ts      ← User context schema
  abilities/
    student.ts          ← Role-specific CASL definitions
    teacher.ts
    gradeHead.ts        ← Reuses/Extends teacher
    principal.ts
    ...
  composer.ts           ← Merges multi-role users into a single Ability
  hooks/
    usePermissions.ts   ← The React interface for components
  guards/
    RouteGuard.tsx      ← Screen-level protection
    FeatureGuard.tsx    ← Component/Section-level protection
```

---

## 5. Strict Implementation Rules

- **Guard Levels**: Use Guards at **ROUTER** and **FEATURE** levels only.
- **Separate Screens**: Role-specific screens handle their own UI. Avoid complex `if/else` inside a single screen for major role differences.
- **No Individual Intents on Buttons**: Intent resolution happens at the feature/vow level, not the individual button.
- **Unified Logic**: One `core` logic serves both Mobile and Web. UI files differ (`.web.tsx` / `.native.tsx`) but permission logic is identical.
- **Legacy Migration**:
  - Remove `isRole` checks scattered in components.
  - Remove button-level intents and vows.
  - Consolidate all duplicate type declarations into Zod.

---

## 6. Defining New Capabilities

When adding a new feature that requires authorization, follow these steps:

### Step A: Update Subjects

In `packages/core/src/permissions/abilities/base.ts`, add your new subject to the `Subjects` union type.

```typescript
export type Subjects = 
  | 'Classroom'
  | 'Resource'
  | 'NewFeatureArea' // Add here
  | 'all';
```

### Step B: Grant Permissions in Role Modules

Depending on who should have access, update the relevant role files in `packages/core/src/permissions/abilities/`:

- `teacher.ts`
- `student.ts`
- `admin.ts` (Principal/Sect)

Example in `teacher.ts`:

```typescript
can('manage', 'NewFeatureArea');
```

---

## 7. Capability Mapping (The Bridge)

For API-level checks, we map legacy strings to CASL pairs in `packages/core/src/lib/capabilities.ts`.

| Legacy CapabilityKey | CASL Action | CASL Subject |
|----------------------|-------------|--------------|
| `classroom.manage`   | `manage`    | `Classroom`  |
| `resource.read`      | `read`      | `Resource`   |
| `admin.dashboard`    | `manage`    | `AdminDashboard`|

---

## 8. Advanced Usage: Conditions

CASL allows for attribute-based checks. For example, ensuring a teacher can only update a classroom if they are the designated teacher:

```typescript
// In core/permissions/abilities/teacher.ts
can('update', 'Classroom', { teacher_id: userId });
```

Check this in the UI:

```tsx
const { can } = usePermissions();
const classroom = { teacher_id: 'abc-123', ... };

if (can('update', 'Classroom', classroom)) {
  // Authorized
}
```

---

## 9. Best Practices

1. **Always use granular subjects**: Avoid using `all` unless absolutely necessary (e.g., for `principal`).
2. **Prefer `FeatureGuard` for layout**: Use `FeatureGuard` to wrap entire sections of the UI to avoid cluttered conditional logic.
3. **Use the types**: Always ensure your `can()` calls match the defined `Actions` and `Subjects` types to benefit from TypeScript validation.

---
*Last Updated: 2026-03-26 by Antigravity*
