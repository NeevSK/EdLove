import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';

export const defineAdminAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  if (user.hasGlobalAccess) {
    can('manage', 'all');
    can('manage', 'PrincipalDashboard');
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
