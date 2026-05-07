import { AbilityBuilder } from '@casl/ability';
import { type UserContext, UserContextSchema } from '../schemas/user.schema';
import { defineAdminAbilities } from './abilities/admin';
import { defineAssistantPrincipalAbilities } from './abilities/assistantPrincipal';
import { AppAbility } from './abilities/base';
import { defineGradeHeadAbilities } from './abilities/gradeHead';
import { defineParentAbilities } from './abilities/parent';
import { definePrincipalAbilities } from './abilities/principal';
import { defineSectionHeadAbilities } from './abilities/sectionHead';
import { defineStudentAbilities } from './abilities/student';
import { defineTeacherAbilities } from './abilities/teacher';

/**
 * composeUserAbilities: The 2026 Unified Composition Engine.
 * 1. Validates the UserContext via Zod ABI (Attribute-Based Identity).
 * 2. Merges decentralized role-based abilities via CASL.
 * 3. Returns a consistent Ability instance for Client (Pure) or Server (Prisma).
 */
export const composeUserAbilities = (rawContext: Partial<UserContext>): AppAbility => {
  // 1. Strict Validation of Authority Context
  const user = UserContextSchema.parse({
    user_id: null,
    email: null,
    school_id: null,
    tenancy_name: null,
    tenancy: null,
    tenant_kind: 'customer',
    is_anonymous: false,
    has_global_access: false,
    is_personal: false,
    tier: 'free',
    features: [],
    flags: {},
    bonds: [],
    ...rawContext,
  });

  const builder = new AbilityBuilder<AppAbility>(AppAbility);
  const { can } = builder;

  // 1. Guest / Wanderer (Always available, even if offline/no school)
  can('read', 'Library');
  can('read', 'LibraryResource');
  can('read', 'LibrarySearch');
  can('read', 'CommunityFeed');
  can('read', 'Post');
  
  // HEAL: Anonymous guests must be able to resolve their own identity profile
  can('resolve', 'User');
  can('read', 'User');
  can('update', 'User');

  // 2. 1st Class Citizen (Authenticated + Attached to School)
  if (user.school_id && !user.is_anonymous) {
    can('manage', 'Library');
    can('read', 'CommunityGroups');
    can('read', 'DirectMessages');
    can('read', 'Group');
    can('read', 'Post');
    can('create', 'Post');
    can('create', 'Group');
    can('update', 'Group');
    can('read', 'User');
    can('update', 'User');
    can('create', 'User');
    can('resolve', 'User');
    can('read', 'School', { id: user.school_id });
    // Coexistence: Every user has a personal sanctuary
    can('manage', 'School', { type: 'personal_workspace' });
    can('create', 'School');
  } else if (!user.school_id && !user.is_anonymous) {
    // 3. 2nd Class Citizen (Authenticated but NO school yet)
    // Limited to onboarding and public exploration
    can('read', 'Ecosystem');
    can('manage', 'Wellbeing');
    can('read', 'User');
    can('update', 'User');
    can('resolve', 'User');
    can('create', 'School'); // HEAL: Allow creating Personal Workspaces
    can('manage', 'School', { type: 'personal_workspace' }); 
    can('read', 'School', { type: 'personal_workspace' });  } else if (!user.is_anonymous) {
    // Authenticated but no specific 1st/2nd class categorization yet (fallback)
    can('manage', 'Wellbeing');
    can('read', 'User');
    can('update', 'User');
    can('resolve', 'User');
  }

  // 2. Load Abilities based on the Union of Identity (All Bonds)
  (user.bonds || []).forEach((bond) => {
    const { capacity, entity_id, entity_type } = bond;

    // Create a contextual context for this specific bond to satisfy legacy definers
    // while moving towards relationship-scoped permissions.
    const contextualUser = {
      ...user,
      school_id: entity_type === 'SCHOOL' ? entity_id : user.school_id,
      active_bond_status: bond.status,
    };

    switch (capacity) {
      case 'student':
        defineStudentAbilities(contextualUser, builder);
        break;
      case 'teacher':
        defineTeacherAbilities(contextualUser, builder);
        can('manage', 'LibraryReview'); // Teachers can review
        can('grade', 'Grade');
        break;
      case 'principal':
        definePrincipalAbilities(contextualUser, builder);
        can('manage', 'LibraryReview'); // Principal can review
        can('grade', 'Grade');
        break;
      case 'assistantPrincipal':
        defineAssistantPrincipalAbilities(contextualUser, builder);
        break;
      case 'parent':
        defineParentAbilities(contextualUser, builder);
        break;
      case 'admin':
      case 'developer':
      case 'founder':
        defineAdminAbilities(contextualUser, builder);
        can('manage', 'LibraryReview'); // Founder/Admin can review
        can('grade', 'Grade');
        break;
      case 'librarian':
        can('manage', 'Library');
        can('manage', 'LibraryReview'); // Librarian can review
        break;
      case 'staff':
        can('read', 'School', { id: contextualUser.school_id });
        break;
    }
  });

  return builder.build();
};
