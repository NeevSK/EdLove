import { useMemo } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFeatureStore } from '../../../store/useFeatureStore';
import { useTenantStore } from '../../../store/useTenantStore';
import { type TenantKind, type UserContext, UserContextSchema } from '../../schemas/user.schema';
import type { Actions, SubjectType } from '../abilities/base';
import { composeUserAbilities } from '../composer';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Re-renders automatically on permission change via store updates.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const schoolType = useTenantStore((state) => state.schoolType);
  const flags = useFeatureStore((state) => state.flags);

  // 1. Build context from store (Perspective-aware)
  const context: UserContext = useMemo(() => {
    const activePerspective = useAuthStore.getState().activePerspective;
    const available_bonds = useAuthStore.getState().available_bonds;
    const active_bond = activePerspective?.active_bond || null;
    const is_personal = schoolType === 'personal_workspace';

    const rawContext: UserContext = {
      user_id: user?.id || null,
      userId: user?.id || null,
      email: user?.email || null,
      
      // Sovereign ReBAC Context
      // 1. The Reality: All bonds the user holds
      bonds: available_bonds as UserContext['bonds'],
      
      // 2. The Anchor: The primary identity from onboarding (first bond)
      primary_capacity: available_bonds[0]?.capacity || null,
      primaryCapacity: available_bonds[0]?.capacity || null,

      // 3. The Focus: The currently active bond
      active_bond: active_bond as UserContext['active_bond'],
      activeBond: active_bond as UserContext['activeBond'],
      active_bond_status: active_bond?.status || 'active',
      role: active_bond?.capacity || null,
      traits: active_bond?.capacity ? [`role:${active_bond.capacity}`] : [],
      tier: user?.tier || 'free',
      citizenship:
        user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
          ? user.citizenship
          : 'WANDERER',
      pricing_tier:
        user?.pricing_tier === 'PRO' || user?.pricing_tier === 'INSTITUTIONAL'
          ? user.pricing_tier
          : 'FREE',
      features: user?.features || [],
      flags: user?.flags || {},

      school_id: active_bond?.entity_type === 'SCHOOL' ? active_bond.entity_id : user?.school_id || null,
      schoolId: active_bond?.entity_type === 'SCHOOL' ? active_bond.entity_id : user?.school_id || null,
      tenancy_name: user?.organization_name || null,
      tenancy: {
        kind: (user?.tenant_kind || 'customer') as TenantKind,
        is_personal,
      },
      tenant_kind: (user?.tenant_kind || 'customer') as TenantKind,
      is_anonymous: !user || !!user?.is_anonymous,
      isAnonymous: !user || !!user?.is_anonymous,
      has_global_access: active_bond?.capacity === 'founder' || active_bond?.capacity === 'admin',
      is_personal,
      // Scoped context injected from store if available
      section_id: user?.section_id || null,
      grade_id: user?.grade_id || null,
      classroom_id: active_bond?.entity_type === 'CLASSROOM' ? active_bond.entity_id : user?.classroom_id || null,
    };

    // Strict validation via Zod
    return UserContextSchema.parse(rawContext);
  }, [user, schoolType]);

  // 2. Compose abilities (CASL)
  const ability = useMemo(() => composeUserAbilities(context), [context]);

  // 3. Return ability and context (10 Pillars: Referential Stability)
  return useMemo(
    () => ({
      ability,
      context,
      flags,
      /**
       * can: Check if action on subject is allowed.
       * usage: can('read', 'School')
       */
      can: (action: Actions, subject: SubjectType, field?: string) =>
        ability.can(action, subject as any, field),
      /**
       * cannot: Check if action on subject is forbidden.
       */
      cannot: (action: Actions, subject: SubjectType, field?: string) =>
        ability.cannot(action, subject as any, field),
    }),
    [ability, context, flags],
  );
};
