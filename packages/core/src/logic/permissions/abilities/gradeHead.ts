import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';
import { defineTeacherAbilities } from './teacher';

export const defineGradeHeadAbilities = (
  user: UserContext,
  builder: AbilityBuilder<AppAbility>,
) => {
  const { can } = builder;
  // 1. Inherit Teacher roles
  defineTeacherAbilities(user, builder);

  // 2. Grade Head Specifics
  can('manage', 'GradeHeadDashboard');
  can('read', 'Report', { gradeId: user.gradeId } as any);

  if (user.gradeId) {
    can('manage', 'Classroom', { gradeId: user.gradeId } as any);
    can('manage', 'Attendance', { gradeId: user.gradeId } as any);
  }
};
