import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineAdminAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  if (user.has_global_access) {
    can('manage', 'all');
    can('manage', 'PrincipalDashboard');
    can('manage', 'AdminDashboard');
    can('read', 'ClassroomList');
    return;
  }

  // 2. Specific Admin capabilities (if not global)
  if (user.active_bond?.capacity === 'admin') {
    can('manage', 'School', { id: user.school_id } as any);
    can('manage', 'Staff', { school_id: user.school_id } as any);
    can('read', 'Inventory', { school_id: user.school_id } as any);
    can('manage', 'Inventory', { school_id: user.school_id } as any);
    can('manage', 'Library');
    can('manage', 'LibraryReview');
    can('read', 'LibrarySearch');
  }
};
