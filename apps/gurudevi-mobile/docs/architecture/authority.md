# Architectural Guide: Protocol-Oriented Authority (POA)

## Overview
Gurduevi has transitioned from a legacy, role-based access control system to a **Protocol-Oriented Authority (POA)** model. This system decouples feature access from specific role names (e.g., "teacher", "student") and instead bases authorization on granular **Capabilities**.

## Core Philosophy
- **Identity != Authority**: Knowing who a user is (Identity) is separate from knowing what they can do (Authority).
- **Capability-Driven**: UI components should ask "Can I perform action X on resource Y?" rather than "Is the user a teacher?".
- **Reactive**: Permissions can change mid-session (e.g., a teacher is promoted to Grade Head) and the UI must react instantly without a page reload.

## Technical Stack: CASL
We use [CASL](https://casl.js.org/) as our core authorization engine. All permissions are defined in `@repo/core`.

### Core Definitions (`packages/core/src/permissions/abilities/`)
- **Actions**: `manage`, `create`, `read`, `update`, `delete`, `execute`.
- **Subjects**: Domain objects like `Classroom`, `Resource`, `StaffInvite`, `AdminDashboard`.
- **AppAbility**: The unified TypeScript type representing the user's total set of permissions.

### Ability Composition
Abilities are composed hierarchically in `composer.ts`:
1. **Base Abilities**: Fundamental permissions everyone has (e.g., reading their own profile).
2. **Role-Specific Modules**: Modular sets of permissions (e.g., `studentAbilities`, `teacherAbilities`).
3. **Inheritance**: More powerful roles inherit from base roles (e.g., `principalAbilities` includes all `teacherAbilities`).

## Implementation Patterns

### UI-Level Checks (`usePermissions`)
The primary hook for checking permissions in React components:

```tsx
import { usePermissions } from '@repo/core/logic';

function ClassroomAction() {
  const { can } = usePermissions();

  if (can('update', 'Classroom')) {
    return <EditButton />;
  }
  
  return <ReadOnlyView />;
}
```

### Advanced UI Guarding (`FeatureGuard`)
For complex blocks of UI, use the `FeatureGuard` component:

```tsx
<FeatureGuard action="manage" subject="AdminDashboard">
  <AdminTools />
</FeatureGuard>
```

### API-Level Checks
For backend/API logic, use `requireCapability` from `@repo/core/lib/capabilities.ts`:

```ts
import { requireCapability } from '@repo/core/logic';

export async function deleteResource(id: string) {
  // This will throw an APIError if the user lacks the capability
  await requireCapability('resource.delete');
  
  // Logic here...
}
```

## Migration & Legacy Support
To maintain backward compatibility during the transition, we implemented a **CASL Bridge** in `lib/capabilities.ts`. This allows legacy string-based `CapabilityKey` calls to be translated into CASL `action`/`subject` pairs on the fly.

## Directory Structure
- `packages/core/src/permissions/`: Root of the POA system.
- `.../abilities/`: Definitions of actions and subjects.
- `.../hooks/`: UI hooks like `usePermissions`.
- `.../schemas/`: Zod schemas for user authority context.

---
*Last Updated: 2026-03-26 by Antigravity*
