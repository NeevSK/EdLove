import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';
import { defineTeacherAbilities } from './teacher';

export const defineSectionHeadAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  // 1. Inherit Teacher roles
  defineTeacherAbilities(user, builder);

  // 2. Section Head Specifics
  can('manage', 'SectionHeadDashboard');
  can('read', 'Report', { sectionId: user.sectionId } as any);
  
  if (user.sectionId) {
    can('manage', 'Classroom', { sectionId: user.sectionId } as any);
    can('manage', 'Staff', { sectionId: user.sectionId } as any);
  }
};
