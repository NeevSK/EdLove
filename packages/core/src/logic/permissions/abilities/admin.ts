import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineAdminAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  const hasGlobalAccess = user.hasGlobalAccess;
  const activeBond = user.activeBond;
  const schoolId = user.schoolId;

  if (hasGlobalAccess) {
    can('manage', 'all');
    can('manage', 'PrincipalDashboard');
    can('manage', 'AdminDashboard');
    can('read', 'ClassroomList');
    return;
  }

  // 2. Specific Admin capabilities (if not global)
  if (activeBond?.capacity === 'admin') {
    can('manage', 'School', { id: schoolId } as any);
    can('manage', 'Staff', { school_id: schoolId } as any);
    can('read', 'Inventory', { school_id: schoolId } as any);
    can('manage', 'Inventory', { school_id: schoolId } as any);
    can('manage', 'Library');
    can('manage', 'LibraryReview');
    can('read', 'LibrarySearch');
  }
};
