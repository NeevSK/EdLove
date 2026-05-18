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

type UserBond = UserContext['bonds'][number];

function hasBondStatus(bond: UserBond): bond is UserBond & { status: NonNullable<UserBond['status']> } {
  return typeof bond.status === 'string' && bond.status.length > 0;
}

/**
 * composeUserAbilities: The 2026 Unified Composition Engine.
 * 1. Validates the UserContext via Zod ABI (Attribute-Based Identity).
 * 2. Merges decentralized capacity-based abilities via CASL.
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

  // 1. UNIVERSAL SOVEREIGNTY: Every user has a Personal Workspace by default.
  // This enables private tutoring/teaching usage without institutional bonds.
  can('manage', 'School', { type: 'personal_workspace' });
  can('manage', 'Classroom', { type: 'personal' });
  can('manage', 'Wellbeing');
  can('manage', 'Library'); // Personal bookmarks/collections
  can('resolve', 'User');
  can('read', 'User');
  can('update', 'User');

  // 1. Wanderer (no signup, local SQLite only)
  if (user.citizenship === 'WANDERER') {
    can('read', 'LibraryResource');
    can('read', 'LibrarySearch');
    can('read', 'CommunityFeed');
    can('read', 'Post');
  }

  // 2. AUTHENTICATED CITIZENS (2nd & 1st Class)
  if (user.citizenship === 'SECOND_CLASS' || user.citizenship === 'FIRST_CLASS') {
    can('read', 'Ecosystem');
    can('purchase', 'ProFeatures');
    can('access', 'ProFeatures', { tier: 'pro' });
    can('join', 'Classroom');
    can('join', 'School');

    // Community Full Access
    can('read', 'CommunityGroups');
    can('read', 'DirectMessages');
    can('read', 'Group');
    can('read', 'Post');
    can('create', 'Post');
    can('create', 'Comment');
    can('manage', 'Post', { creator_id: user.user_id });

    if (user.citizenship === 'SECOND_CLASS') {
      can('create', 'School'); // Can create "Unofficial" schools/groups
      can('create', 'Group');
      can('manage', 'Group', { creator_id: user.user_id });
    } else {
      // 1st Class specific
      if (user.school_id || user.schoolId) {
        can('read', 'School', { id: user.school_id || user.schoolId });
      }
    }
  }

  // 2. Load Abilities based on the Union of Identity (All Bonds)
  (user.bonds || []).forEach((bond) => {
    const { capacity, entity_id, entity_type } = bond;

    // Create a contextual context for this specific bond to satisfy legacy definers
    // while moving towards relationship-scoped permissions.
    const contextualUser: UserContext = {
      ...user,
      school_id: (entity_type === 'SCHOOL' || entity_type === 'PERSONAL') ? entity_id : user.school_id,
      active_bond_status: hasBondStatus(bond) ? bond.status : 'active',
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
