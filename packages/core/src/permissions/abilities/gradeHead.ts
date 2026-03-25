import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';
import { defineTeacherAbilities } from './teacher';

export const defineGradeHeadAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
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
