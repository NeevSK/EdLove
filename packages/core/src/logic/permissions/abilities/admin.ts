import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineAdminAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  if (user.hasGlobalAccess) {
    can('manage', 'all');
    can('manage', 'PrincipalDashboard');
    can('manage', 'AdminDashboard');
    can('read', 'ClassroomList');
    return;
  }

  // 2. Specific Admin capabilities (if not global)
  if (user.roles.includes('admin')) {
    can('manage', 'School', { id: user.schoolId } as any);
    can('manage', 'Staff', { schoolId: user.schoolId } as any);
    can('read', 'Inventory', { schoolId: user.schoolId } as any);
    can('manage', 'Inventory', { schoolId: user.schoolId } as any);
    can('manage', 'Library');
    can('manage', 'LibraryReview');
    can('read', 'LibrarySearch');
  }
};

