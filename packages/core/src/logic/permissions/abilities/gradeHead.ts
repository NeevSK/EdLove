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
  can('read', 'Report', { grade_id: user.grade_id } as any);

  if (user.grade_id) {
    can('manage', 'Classroom', { grade_id: user.grade_id } as any);
    can('manage', 'Attendance', { grade_id: user.grade_id } as any);
  }
};
