import { AbilityBuilder, Ability } from '@casl/ability';
import { UserContext } from './schemas/user.schema';
import { AppAbility, defineStudentAbilities } from './abilities/student';
import { defineTeacherAbilities } from './abilities/teacher';
import { defineAdminAbilities } from './abilities/admin';
import { defineParentAbilities } from './abilities/parent';
import { definePrincipalAbilities } from './abilities/principal';
import { defineAssistantPrincipalAbilities } from './abilities/assistantPrincipal';
import { defineSectionHeadAbilities } from './abilities/sectionHead';
import { defineGradeHeadAbilities } from './abilities/gradeHead';

export const composeUserAbilities = (user: UserContext): AppAbility => {
  const builder = new AbilityBuilder<AppAbility>(Ability as any);
  const { can } = builder;

  // 1. Guest / Wanderer (Always available, even if offline/no school)
  can('read', 'PublicLibrary');
  can('read', 'LibrarySearch');
  can('read', 'CommunityFeed');

  // 2. 1st Class Citizen (Authenticated + Attached to School)
  if (user.schoolId && !user.isAnonymous) {
    can('manage', 'Library');
    can('read', 'CommunityGroups');
    can('read', 'DirectMessages');
    can('read', 'School', { id: user.schoolId } as any);
  } else if (!user.schoolId && !user.isAnonymous) {
    // 3. 2nd Class Citizen (Authenticated but NO school yet)
    // Limited to onboarding and public exploration
    can('read', 'Ecosystem');
  }

  // 2. Iterate through all roles and merge abilities
  user.roles.forEach(role => {
    switch (role) {
      case 'student':
        defineStudentAbilities(user, builder);
        break;
      case 'teacher':
        defineTeacherAbilities(user, builder);
        can('manage', 'LibraryReview'); // Teachers can review
        break;
      case 'gradeHead':
        defineGradeHeadAbilities(user, builder);
        break;
      case 'sectionHead':
        defineSectionHeadAbilities(user, builder);
        break;
      case 'principal':
        definePrincipalAbilities(user, builder);
        can('manage', 'LibraryReview'); // Principal can review
        break;
      case 'assistantPrincipal':
        defineAssistantPrincipalAbilities(user, builder);
        break;
      case 'parent':
      case 'guardian':
        defineParentAbilities(user, builder);
        break;
      case 'admin':
      case 'developer':
      case 'founder':
        defineAdminAbilities(user, builder);
        can('manage', 'LibraryReview'); // Founder/Admin can review
        break;
      case 'librarian':
        can('manage', 'Library');
        can('manage', 'LibraryReview'); // Librarian can review
        break;
      case 'nurse':
        can('manage', 'HealthRecords');
        break;
    }
  });

  return builder.build();
};
