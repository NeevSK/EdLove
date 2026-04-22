import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../schemas/user.schema';
import type { AppAbility } from './base';
import { defineTeacherAbilities } from './teacher';

export const defineSectionHeadAbilities = (
  user: UserContext,
  builder: AbilityBuilder<AppAbility>,
) => {
  const { can } = builder;
  // 1. Inherit Teacher roles
  defineTeacherAbilities(user, builder);

  // 2. Section Head Specifics
  can('manage', 'SectionHeadDashboard');
  can('read', 'Report', { section_id: user.sectionId } as any);

  if (user.sectionId) {
    can('manage', 'Classroom', { section_id: user.sectionId } as any);
    can('manage', 'Staff', { section_id: user.sectionId } as any);
  }
};
